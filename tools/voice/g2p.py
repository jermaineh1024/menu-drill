# Words to sounds, for the recorded voice.
#
# The voice (Kokoro) does not read letters. It reads a string of sound symbols, and it was taught with the symbols that
# its makers' own English front end, "misaki" (Apache 2.0, github.com/hexgrad/misaki), writes out. This file follows
# that front end's rules, written out again here so the recording tool has nothing to install:
#   1. look each word up in misaki's pronunciation dictionary (two JSON files, passed in, not kept in this repo);
#   2. a few rules for "the", "to", "a", for endings (-s, -ed, -ing), for capitals and for hyphenated words;
#   3. only a word the dictionary does not have is handed to espeak-ng, and its answer is rewritten in the same symbols.
# What misaki gets from a grammar tagger (is "close" a verb here?) comes from the word list in say.py instead.
import json, re, unicodedata

VOWELS = frozenset('AIOQWYaiuæɑɒɔəɛɜɪʊʌᵻ')
CONSONANTS = frozenset('bdfhjklmnpstvwzðŋɡɹɾʃʒʤʧθ')
US_TAUS = frozenset('AIOWYiuæɑəɛɪɹʊʌ')
DIPHTHONGS = frozenset('AIOQWYʤʧ')
PAUSES = frozenset(';:,.!?\u2014…')          # after one of these the next word starts fresh
PRIMARY, SECONDARY = 'ˈ', 'ˌ'
LEXICON_ORDS = frozenset([39, 45, *range(65, 91), *range(97, 123)])
OWN_OPEN, OWN_CLOSE = '⟦', '⟧'         # ⟦sounds⟧ in the text passes straight through


def apply_stress(ps, stress):
    def restress(ps):
        ips = list(enumerate(ps))
        stresses = {i: next(j for j, v in ips[i:] if v in VOWELS) for i, p in ips if p in (PRIMARY, SECONDARY)}
        for i, j in stresses.items():
            _, s = ips[i]
            ips[i] = (j - 0.5, s)
        return ''.join(p for _, p in sorted(ips))
    if stress is None or ps is None:
        return ps
    if stress < -1:
        return ps.replace(PRIMARY, '').replace(SECONDARY, '')
    if stress == -1 or (stress in (0, -0.5) and PRIMARY in ps):
        return ps.replace(SECONDARY, '').replace(PRIMARY, SECONDARY)
    if stress in (0, 0.5, 1) and PRIMARY not in ps and SECONDARY not in ps:
        if all(v not in ps for v in VOWELS):
            return ps
        return restress(SECONDARY + ps)
    if stress >= 1 and PRIMARY not in ps and SECONDARY in ps:
        return ps.replace(SECONDARY, PRIMARY)
    if stress > 1 and PRIMARY not in ps and SECONDARY not in ps:
        if all(v not in ps for v in VOWELS):
            return ps
        return restress(PRIMARY + ps)
    return ps


class Context:
    def __init__(self, future_vowel=None, future_to=False):
        self.future_vowel = future_vowel     # True: the next sound is a vowel; False: a consonant; None: a pause or the end
        self.future_to = future_to


def parent_tag(tag):
    if not tag:
        return tag
    if tag.startswith('VB'):
        return 'VERB'
    if tag.startswith('NN'):
        return 'NOUN'
    if tag.startswith('ADV') or tag.startswith('RB'):
        return 'ADV'
    if tag.startswith('ADJ') or tag.startswith('JJ'):
        return 'ADJ'
    return tag


class Lexicon:
    def __init__(self, gold_path, silver_path):
        def grow(d):
            e = {}
            for k, v in d.items():
                if len(k) < 2:
                    continue
                if k == k.lower():
                    if k != k.capitalize():
                        e[k.capitalize()] = v
                elif k == k.lower().capitalize():
                    e[k.lower()] = v
            return {**e, **d}
        with open(gold_path, encoding='utf-8') as f:
            self.golds = grow(json.load(f))
        with open(silver_path, encoding='utf-8') as f:
            self.silvers = grow(json.load(f))
        self.cap_stresses = (0.5, 2)

    def get_NNP(self, word):                      # said letter by letter
        ps = [self.golds.get(c.upper()) for c in word if c.isalpha()]
        if not ps or None in ps:
            return None, None
        ps = apply_stress(''.join(ps), 0)
        ps = ps.rsplit(SECONDARY, 1)
        return PRIMARY.join(ps), 3

    def special(self, word, tag, stress, ctx):
        tag = tag or ''
        if word == 'a' or (word == 'A' and tag == 'DT'):
            return 'ɐ', 4
        if word in ('am', 'Am', 'AM'):
            if tag.startswith('NN'):
                return self.get_NNP(word)
            if ctx.future_vowel is None or word != 'am' or (stress and stress > 0):
                return self.golds['am'], 4
            return 'ɐm', 4
        if word in ('an', 'An', 'AN'):
            if word == 'AN' and tag.startswith('NN'):
                return self.get_NNP(word)
            return 'ɐn', 4
        if word == 'I' and tag == 'PRP':
            return SECONDARY + 'I', 4
        if word in ('by', 'By', 'BY') and parent_tag(tag) == 'ADV':
            return 'bˈI', 4
        if word in ('to', 'To') or (word == 'TO' and tag in ('TO', 'IN')):
            return {None: self.golds['to'], False: 'tə', True: 'tʊ'}[ctx.future_vowel], 4
        if word in ('the', 'The') or (word == 'THE' and tag == 'DT'):
            return ('ði' if ctx.future_vowel is True else 'ðə'), 4
        if word in ('used', 'Used', 'USED'):
            if tag in ('VBD', 'JJ') and ctx.future_to:
                return self.golds['used']['VBD'], 4
            return self.golds['used']['DEFAULT'], 4
        return None, None

    def is_known(self, word):
        if word in self.golds or word in self.silvers:
            return True
        if not word.isalpha() or not all(ord(c) in LEXICON_ORDS for c in word):
            return False
        if len(word) == 1:
            return True
        if word == word.upper() and word.lower() in self.golds:
            return True
        return word[1:] == word[1:].upper()

    def lookup(self, word, tag, stress, ctx):
        is_NNP = None
        if word == word.upper() and word not in self.golds:
            word = word.lower()
            is_NNP = tag == 'NNP'
        ps, rating = self.golds.get(word), 4
        if ps is None and not is_NNP:
            ps, rating = self.silvers.get(word), 3
        if isinstance(ps, dict):
            if ctx and ctx.future_vowel is None and 'None' in ps:
                tag = 'None'
            elif tag not in ps:
                tag = parent_tag(tag)
            ps = ps.get(tag, ps['DEFAULT'])
        if ps is None or (is_NNP and PRIMARY not in ps):
            ps, rating = self.get_NNP(word)
            if ps is not None:
                return ps, rating
        return apply_stress(ps, stress), rating

    @staticmethod
    def _s(stem):
        if not stem:
            return None
        if stem[-1] in 'ptkfθ':
            return stem + 's'
        if stem[-1] in 'szʃʒʧʤ':
            return stem + 'ᵻz'
        return stem + 'z'

    def stem_s(self, word, tag, stress, ctx):
        if len(word) > 2 and word.endswith('s') and not word.endswith('ss') and self.is_known(word[:-1]):
            stem = word[:-1]
        elif (word.endswith("'s") or (len(word) > 4 and word.endswith('es'))) and self.is_known(word[:-2]):
            stem = word[:-2]
        elif len(word) > 4 and word.endswith('ies') and self.is_known(word[:-3] + 'y'):
            stem = word[:-3] + 'y'
        else:
            return None, None
        stem, rating = self.lookup(stem, tag, stress, ctx)
        return self._s(stem), rating

    @staticmethod
    def _ed(stem):
        if not stem:
            return None
        if stem[-1] in 'pkfθʃsʧ':
            return stem + 't'
        if stem[-1] == 'd':
            return stem + 'ᵻd'
        if stem[-1] != 't':
            return stem + 'd'
        if len(stem) < 2:
            return stem + 'ɪd'
        if stem[-2] in US_TAUS:
            return stem[:-1] + 'ɾᵻd'
        return stem + 'ᵻd'

    def stem_ed(self, word, tag, stress, ctx):
        if word.endswith('d') and not word.endswith('dd') and self.is_known(word[:-1]):
            stem = word[:-1]
        elif word.endswith('ed') and not word.endswith('eed') and self.is_known(word[:-2]):
            stem = word[:-2]
        else:
            return None, None
        stem, rating = self.lookup(stem, tag, stress, ctx)
        return self._ed(stem), rating

    @staticmethod
    def _ing(stem):
        if not stem:
            return None
        if len(stem) > 1 and stem[-1] == 't' and stem[-2] in US_TAUS:
            return stem[:-1] + 'ɾɪŋ'
        return stem + 'ɪŋ'

    def stem_ing(self, word, tag, stress, ctx):
        if word.endswith('ing') and self.is_known(word[:-3]):
            stem = word[:-3]
        elif word.endswith('ing') and self.is_known(word[:-3] + 'e'):
            stem = word[:-3] + 'e'
        elif re.search(r'([bcdgklmnprstvxz])\1ing$|cking$', word) and self.is_known(word[:-4]):
            stem = word[:-4]
        else:
            return None, None
        stem, rating = self.lookup(stem, tag, stress, ctx)
        return self._ing(stem), rating

    def get_word(self, word, tag, stress, ctx):
        ps, rating = self.special(word, tag, stress, ctx)
        if ps is not None:
            return ps, rating
        if self.is_known(word):
            return self.lookup(word, tag, stress, ctx)
        if word.endswith("s'") and self.is_known(word[:-2] + "'s"):
            return self.lookup(word[:-2] + "'s", tag, stress, ctx)
        if word.endswith("'") and self.is_known(word[:-1]):
            return self.lookup(word[:-1], tag, stress, ctx)
        ps, rating = self.stem_s(word, tag, stress, ctx)
        if ps is not None:
            return ps, rating
        ps, rating = self.stem_ed(word, tag, stress, ctx)
        if ps is not None:
            return ps, rating
        ps, rating = self.stem_ing(word, tag, 0.5 if stress is None else stress, ctx)
        if ps is not None:
            return ps, rating
        return None, None

    def __call__(self, text, tag, ctx):
        word = unicodedata.normalize('NFKC', text.replace('‘', "'").replace('’', "'"))
        stress = None if word == word.lower() else self.cap_stresses[int(word == word.upper())]
        ps, rating = self.get_word(word, tag, stress, ctx)
        if ps is not None:
            return ps, rating
        if not all(ord(c) in LEXICON_ORDS for c in word):
            return None, None
        if word != word.lower() and (word == word.upper() or word[1:] == word[1:].lower()):
            ps, rating = self.get_word(word.lower(), tag, stress, ctx)
            if ps is not None:
                return ps, rating
        return None, None


class Espeak:
    """The last resort for a word the dictionary does not have: espeak-ng's guess, rewritten in the voice's own symbols."""
    E2M = sorted({
        'ʔˌn̩': 'tn', 'ʔn̩': 'tn', 'ʔn': 'tn', 'ʔ': 't',
        'a^ɪ': 'I', 'a^ʊ': 'W',
        'd^ʒ': 'ʤ',
        'e^ɪ': 'A', 'e': 'A',
        't^ʃ': 'ʧ',
        'ɔ^ɪ': 'Y',
        'ə^l': 'ᵊl',
        'ʲo': 'jo', 'ʲə': 'jə', 'ʲ': '',
        'ɚ': 'əɹ',
        'r': 'ɹ',
        'x': 'k', 'ç': 'k',
        'ɐ': 'ə',
        'ɬ': 'l',
        '̃': '',
    }.items(), key=lambda kv: -len(kv[0]))

    def __init__(self):
        import espeakng_loader
        import phonemizer
        from phonemizer.backend.espeak.wrapper import EspeakWrapper
        EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
        EspeakWrapper.set_library(espeakng_loader.get_library_path())
        self.backend = phonemizer.backend.EspeakBackend(language='en-us', preserve_punctuation=True, with_stress=True, tie='^')
        self.cache = {}

    def raw(self, text):
        return self.backend.phonemize([text])[0].strip()

    def __call__(self, text):
        if text in self.cache:
            return self.cache[text]
        ps = self.raw(text)
        for old, new in self.E2M:
            ps = ps.replace(old, new)
        ps = re.sub(r'(\S)̩', r'ᵊ\1', ps).replace(chr(809), '')
        ps = ps.replace('o^ʊ', 'O').replace('ɜːɹ', 'ɜɹ').replace('ɜː', 'ɜɹ').replace('ɪə', 'iə').replace('ː', '')
        ps = ps.replace('o', 'ɔ').replace('^', '')
        self.cache[text] = ps
        return ps


TOKEN = re.compile(
    OWN_OPEN + r'([^' + OWN_CLOSE + r']*)' + OWN_CLOSE          # 1: sounds given outright
    + r"|([A-Za-z]+(?:'[A-Za-z]+)*'?(?:-[A-Za-z]+(?:'[A-Za-z]+)*'?)*)(?:\{([A-Za-z]+)\})?"   # 2: a word, 3: its tag
    + r'|([;:,.!?\u2014…"“”()])'                                      # 4: a mark the voice pauses on
    + r'|(\s+)'                                                  # 5: space
    + r'|(.)', re.S)                                             # 6: anything else is a mistake upstream


class Tok:
    __slots__ = ('text', 'tag', 'ws', 'ph', 'src')

    def __init__(self, text, tag='', ph=None, src=''):
        self.text, self.tag, self.ws, self.ph, self.src = text, tag, '', ph, src


class G2P:
    def __init__(self, gold_path, silver_path, own=None):
        self.lexicon = Lexicon(gold_path, silver_path)
        self.espeak = Espeak()
        self.own = own or {}             # word (lower case) -> sounds, checked before the dictionary

    def tokens(self, text):
        out, strays, quote_open = [], [], False
        for m in TOKEN.finditer(text):
            own, word, tag, mark, space, stray = m.groups()
            if own is not None:
                out.append(Tok(m.group(0), ph=own, src='own'))
            elif word is not None:
                out.append(Tok(word, tag=tag or ''))
            elif mark is not None:
                if mark == '"':
                    mark = '”' if quote_open else '“'
                    quote_open = not quote_open
                elif mark == '“':
                    quote_open = True
                elif mark == '”':
                    quote_open = False
                out.append(Tok(mark, ph=mark, src='mark'))
            elif space is not None:
                if out:
                    out[-1].ws = ' '
            else:
                strays.append(stray)
        return out, strays

    def word(self, t, ctx):
        low = t.text.lower()
        if low in self.own:
            return self.own[low], 'own'
        for end in ("'s", 's'):                    # one of our own words with an ending: Sysco's, quats
            if low.endswith(end) and low[:-len(end)] in self.own:
                return Lexicon._s(self.own[low[:-len(end)]]), 'own'
        if not t.tag and t.text == 'A':
            t.tag = 'DT'                           # a capital A standing alone starts a sentence: "A sub above."
        if not t.tag and t.text == 'I':
            t.tag = 'PRP'
        if '-' in t.text:
            hit = self.lexicon.golds.get(t.text) or self.lexicon.golds.get(low) or self.lexicon.silvers.get(low)
            if isinstance(hit, str):
                return hit, 'gold'
            return self.compound(t, ctx)
        ps, rating = self.lexicon(t.text, t.tag, ctx)
        if ps is not None:
            return ps, {4: 'gold', 3: 'silver'}.get(rating, 'gold')
        return self.espeak(t.text), 'espeak'

    def compound(self, t, ctx):
        """A hyphenated word: each part by itself, run together, the lighter half giving up its main stress."""
        parts = [p for p in t.text.split('-') if p]
        got, src = [], 'gold'
        for p in reversed(parts):
            if p.lower() in self.own:
                ps = self.own[p.lower()]
            else:
                ps, rating = self.lexicon(p, t.tag if p is parts[-1] else '', ctx)
                if ps is None:
                    return self.espeak(t.text), 'espeak'       # one unknown part: the whole word goes to espeak
                if rating == 3:
                    src = 'silver'
            got.append(ps)
            ctx = step(ctx, ps, p)
        got.reverse()
        weight = lambda ps: sum(2 if c in DIPHTHONGS else 1 for c in ps)
        idx = [(PRIMARY in ps, weight(ps), i) for i, ps in enumerate(got) if ps]
        if len(idx) == 2 and len(parts[idx[0][2]]) == 1:
            got[idx[1][2]] = apply_stress(got[idx[1][2]], -0.5)
        elif len(idx) >= 2 and sum(b for b, _, _ in idx) > (len(idx) + 1) // 2:
            for _, _, i in sorted(idx)[:len(idx) // 2]:
                got[i] = apply_stress(got[i], -0.5)
        return ''.join(got), src

    def __call__(self, text):
        """-> (the sounds, the tokens, any characters that should not have been there)"""
        toks, strays = self.tokens(text)
        ctx = Context()
        for t in reversed(toks):
            if t.ph is None:
                t.ph, t.src = self.word(t, ctx)
            ctx = step(ctx, t.ph, t.text)
        ps = ''.join(t.ph + t.ws for t in toks).strip()
        ps = ps.replace('ɾ', 'T').replace('ʔ', 't')      # this voice writes the soft American t as T
        return ps, toks, strays


def step(ctx, ps, text):
    vowel = ctx.future_vowel
    for c in ps or '':
        if c in PAUSES:
            vowel = None
            break
        if c in VOWELS:
            vowel = True
            break
        if c in CONSONANTS:
            vowel = False
            break
    return Context(future_vowel=vowel, future_to=text in ('to', 'To'))
