# python3 tools/voice/record.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin --gold us_gold.json --silver us_silver.json
#
# Records every fixed thing the page says, one small MP3 each, into audio/<fingerprint>.mp3.
#
# Run tools/voice/census.js first: it asks the built page for its own list (dist/spoken.json), so the words recorded are
# exactly the words a tap would speak, and each file is named by the same fingerprint the page works out for those words.
# A piece that is already recorded from the same sounds is skipped, so the run can be stopped and started again, and after
# a change to the page only the changed pieces are recorded.
#
# Needs: the Kokoro voice model and its voice file (github.com/thewh1teagle/kokoro-onnx, release "model-files-v1.0"),
# pip packages kokoro-onnx and soundfile, ffmpeg, and the two dictionary files from the misaki package (see g2p.py).
import argparse, json, os, re, subprocess, sys, tempfile, time
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import say, g2p   # noqa: E402

SR = 24000
ORDER = ['sample', 'sub', 'ask', 'tell', 'step', 'game', 'shift', 'shiftwhy', 'card', 'lesson']
CAP, HARD = 300, 480          # sounds given to the voice at once: aim for CAP, never more than HARD (the model's limit is 510)
GAP, LEAD, TAIL = 0.45, 0.12, 0.25   # seconds of quiet between passages (the voice's own pause between sentences), and at each end


def sentences(ps):
    return [s.strip() for s in re.findall(r'.*?[.!?…]+[”)]*(?=\s|$)|.+$', ps, flags=re.S) if s.strip()]


def split_long(s, hard):
    """a single sentence too long for the voice: cut at a semicolon, a colon or a comma near the middle, else at a space"""
    if len(s) <= hard:
        return [s]
    mid = len(s) // 2
    for marks in ('; ', ': ', ', ', ' '):
        cuts = [m.end() for m in re.finditer(re.escape(marks), s)]
        if cuts:
            cut = min(cuts, key=lambda c: abs(c - mid))
            return split_long(s[:cut].strip(), hard) + split_long(s[cut:].strip(), hard)
    return [s[:hard], s[hard:]]


def passages(ps, cap=CAP, hard=HARD):
    pieces = [p for s in sentences(ps) for p in split_long(s, hard)]
    out, cur = [], ''
    for p in pieces:
        if cur and len(cur) + 1 + len(p) > cap:
            out.append(cur)
            cur = p
        else:
            cur = (cur + ' ' + p) if cur else p
    if cur:
        out.append(cur)
    # a short last sentence on its own comes out rushed (found Nov 10: "Tell them the grill is closed for the night." at 21.7
    # sounds a second), so it rides with the passage before it whenever the two together still fit
    if len(out) > 1 and len(out[-1]) < 80 and len(out[-2]) + 1 + len(out[-1]) <= hard:
        out[-2:] = [out[-2] + ' ' + out[-1]]
    return out


def envelope(a, frame=240):
    n = len(a) // frame
    return np.sqrt((a[:n * frame].reshape(n, frame) ** 2).mean(axis=1)) if n else np.zeros(0)


def trim(a, floor=0.004, before=0.03, after=0.06, frame=240):
    """cut the quiet off both ends, keeping a hair of it so a soft first or last sound is not clipped"""
    e = envelope(a, frame)
    loud = np.nonzero(e > floor)[0]
    if not len(loud):
        return a[:0]
    start = max(0, loud[0] * frame - int(before * SR))
    end = min(len(a), (loud[-1] + 1) * frame + int(after * SR))
    out = a[start:end].copy()
    fade = min(len(out) // 2, int(0.004 * SR))
    if fade:
        ramp = np.linspace(0.0, 1.0, fade, dtype=out.dtype)
        out[:fade] *= ramp
        out[-fade:] *= ramp[::-1]
    return out


def limit(a, knee=0.90, top=0.98):
    """The voice now and then throws one peak past full scale. Rounding that peak off keeps the piece as loud as its
    neighbours; turning the whole piece down to fit the peak would not."""
    over = np.abs(a) > knee
    if not over.any():
        return a
    a = a.copy()
    x = np.abs(a[over])
    a[over] = np.sign(a[over]) * (knee + (top - knee) * np.tanh((x - knee) / (top - knee)))
    return a


def checks(chunk, raw, cut):
    """what a listener would notice, as far as numbers can tell"""
    notes = []
    e = envelope(raw)
    if not len(cut):
        return ['silent']
    rate = len(chunk) / (len(cut) / SR)
    if rate < 9.5 or rate > 21:
        notes.append(f'pace {rate:.1f} sounds a second')
    if float((np.abs(raw) > 0.9).mean()) > 0.002:
        notes.append('too loud for long stretches')
    if len(e) and e[-3:].max() > 0.02:
        notes.append('ends without a breath: may be cut off')
    quiet = envelope(cut) < 0.004
    run = best = 0
    for q in quiet:
        run = run + 1 if q else 0
        best = max(best, run)
    if best * 240 / SR > 1.3:
        notes.append(f'{best * 240 / SR:.1f}s of quiet in the middle')
    return notes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True)
    ap.add_argument('--voices', required=True)
    ap.add_argument('--gold', required=True)
    ap.add_argument('--silver', required=True)
    ap.add_argument('--spoken', default=os.path.join(ROOT, 'dist', 'spoken.json'))
    ap.add_argument('--out', default=os.path.join(ROOT, 'audio'))
    ap.add_argument('--log', default=os.path.join(HERE, 'recorded.json'))
    ap.add_argument('--voice', default='af_heart')
    ap.add_argument('--kinds', default=','.join(ORDER))
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--pause-file', default='')
    ap.add_argument('--dry', action='store_true', help='work out the sounds and the plan, record nothing')
    args = ap.parse_args()

    spoken = json.load(open(args.spoken, encoding='utf-8'))
    kinds = args.kinds.split(',')
    spoken = sorted((x for x in spoken if x['kind'] in kinds), key=lambda x: kinds.index(x['kind']))
    G = g2p.G2P(args.gold, args.silver, own=say.OWN)
    log = json.load(open(args.log, encoding='utf-8')) if os.path.exists(args.log) else {}
    os.makedirs(args.out, exist_ok=True)

    plan, seen = [], set()
    for x in spoken:
        if x['key'] in seen:
            continue
        seen.add(x['key'])
        ps, toks, strays = G(say.normalize(x['text']))
        if strays or say.leftovers(say.normalize(x['text'])):
            sys.exit(f"STOP: {x['kind']}:{x['id']} has characters the voice cannot say: {strays}")
        was = log.get(x['key'])
        done = was and was.get('sounds') == ps and was.get('voice') == args.voice and os.path.exists(os.path.join(args.out, x['key'] + '.mp3'))
        plan.append((x, ps, bool(done)))
    todo = [(x, ps) for x, ps, done in plan if not done]
    sounds = sum(len(ps) for _, ps in todo)
    print(f'{len(plan)} pieces, {len(plan) - len(todo)} already recorded, {len(todo)} to record: about {sounds / 15.6 / 60:.0f} minutes of speech', flush=True)
    if args.dry:
        return
    if args.limit:
        todo = todo[:args.limit]

    from kokoro_onnx import Kokoro
    import soundfile as sf
    k = Kokoro(args.model, args.voices)
    style = k.get_voice_style(args.voice)
    t0 = time.time()
    made = 0.0
    flagged = 0
    for n, (x, ps) in enumerate(todo, 1):
        while args.pause_file and os.path.exists(args.pause_file):
            time.sleep(5)
        parts, notes = [], []
        for chunk in passages(ps):
            tokens = k.tokenizer.tokenize(chunk)
            if len(tokens) != len(chunk):
                sys.exit(f"STOP: {x['kind']}:{x['id']} has a sound the voice does not know in: {chunk}")
            raw, _ = k._infer(tokens, k._style_for(style, len(tokens)), 1.0)
            raw = np.asarray(raw, dtype=np.float32)
            cut = trim(raw)
            notes += checks(chunk, raw, cut)
            parts.append(cut)
        quiet = lambda s: np.zeros(int(s * SR), dtype=np.float32)
        audio = [quiet(LEAD)]
        for i, p in enumerate(parts):
            if i:
                audio.append(quiet(GAP))
            audio.append(p)
        audio.append(quiet(TAIL))
        audio = np.concatenate(audio)
        peak = float(np.abs(audio).max())
        audio = limit(audio)
        seconds = len(audio) / SR
        final = os.path.join(args.out, x['key'] + '.mp3')
        with tempfile.TemporaryDirectory() as tmp:
            wav, mp3 = os.path.join(tmp, 'a.wav'), os.path.join(tmp, 'a.mp3')
            sf.write(wav, audio, SR, subtype='PCM_16')
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-ar', str(SR), '-codec:a', 'libmp3lame', '-b:a', '48k',
                            '-map_metadata', '-1', '-id3v2_version', '0', mp3], check=True)
            os.replace(mp3, final)
        log[x['key']] = {'kind': x['kind'], 'id': x['id'], 'voice': args.voice, 'seconds': round(seconds, 2), 'peak': round(peak, 2), 'sounds': ps}
        if notes:
            log[x['key']]['check'] = notes
            flagged += 1
        with open(args.log + '.tmp', 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=0, sort_keys=True)
        os.replace(args.log + '.tmp', args.log)
        made += seconds
        took = time.time() - t0
        left = sum(len(p) for _, p in todo[n:]) / 15.6
        print(f"{n}/{len(todo)} {x['kind']}:{x['id']} {seconds:.1f}s {os.path.getsize(final) // 1024}KB"
              + (f"  CHECK: {'; '.join(notes)}" if notes else '')
              + f"   [{made / 60:.1f} min made at {made / took:.2f}x, about {left / (made / took) / 60:.0f} min to go]", flush=True)
    print(f'RECORDING_DONE {len(todo)} pieces, {made / 60:.1f} minutes, {flagged} to check', flush=True)


if __name__ == '__main__':
    main()
