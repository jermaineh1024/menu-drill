# What the page says, made ready for the recorded voice.
#
# The page hands over the same words it would give a phone's own voice ("Spread out 1.25 ounces of onions."). A phone
# knows how to read "1.25", "$16.50" and "9:15 a.m."; the recorded voice only knows words. normalize() writes every
# number and sign out as words, and marks the few words this course says its own way.
import re

ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = '- - twenty thirty forty fifty sixty seventy eighty ninety'.split()
ORD = {'one': 'first', 'two': 'second', 'three': 'third', 'five': 'fifth', 'eight': 'eighth', 'nine': 'ninth', 'twelve': 'twelfth'}


def cardinal(n):
    n = int(n)
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])
    if n < 1000:
        return ONES[n // 100] + ' hundred' + ('' if n % 100 == 0 else ' ' + cardinal(n % 100))
    for size, name in ((10 ** 9, 'billion'), (10 ** 6, 'million'), (1000, 'thousand')):
        if n >= size:
            return cardinal(n // size) + ' ' + name + ('' if n % size == 0 else ' ' + cardinal(n % size))


def ordinal(n):
    words = cardinal(n).split()
    last = words[-1]
    words[-1] = ORD.get(last) or (last[:-1] + 'ieth' if last.endswith('y') else last + 'th')
    return ' '.join(words)


POINT = '⟦pYnt⟧'      # "point" inside a number is said lightly, with no stress


def number(s):
    """'1,095' -> one thousand ninety five; '1.25' -> one point two five; '0.75' -> zero point seven five"""
    s = s.replace(',', '')
    if '.' in s:
        whole, frac = s.split('.', 1)
        return cardinal(whole or '0') + ' ' + POINT + ' ' + ' '.join(ONES[int(d)] for d in frac)
    return cardinal(s)


def money(m):
    whole, cents = m.group(1).replace(',', ''), m.group(2)
    d = int(whole)
    out = cardinal(d) + (' dollar' if d == 1 else ' dollars')
    if cents and int(cents):
        c = int(cents)
        out += ' and ' + cardinal(c) + (' cent' if c == 1 else ' cents')
    return out


def clock(m):
    h, mm = int(m.group(1)), int(m.group(2))
    if mm == 0:
        return cardinal(h) + " o'clock"
    return cardinal(h) + (' oh ' if mm < 10 else ' ') + cardinal(mm)


FRACTION = {'1/2': 'one half', '1/3': 'one third', '2/3': 'two thirds', '1/4': 'one quarter', '3/4': 'three quarters',
            '1/8': 'one eighth', '3/8': 'three eighths', '1/16': 'one sixteenth', '3/16': 'three sixteenths'}

AM, PM = '⟦ˌAˈɛm⟧', '⟦pˌiˈɛm⟧'

# Words this course says its own way, or that the dictionary does not have. Sounds are in the voice's own symbols.
OWN = {
    'provolone': 'pɹˈOvəlˌOn',            # the deli way, "PRO-vuh-lone"
    'capicola': 'kˌæpəkˈOlə',
    'portabella': 'pˌɔɹɾəbˈɛlə',
    'cancro': 'kˈæŋkɹO',
    'crunchtime': 'kɹˈʌnʧtˌIm', "crunchtime's": 'kɹˈʌnʧtˌImz',
    'netchef': 'nˈɛtʃˌɛf',
    'sysco': 'sˈɪskO',
    'cambro': 'kˈæmbɹO',
    'redhot': 'ɹˈɛdhˈɑt',
    'ebitda': 'ˈibɪtdˌɑ',
    'cogu': 'kˈɑɡu',
    'cogs': 'kˈɑɡz',
    'fifo': 'fˈIfO',
    'quat': 'kwˈɑt', 'quats': 'kwˈɑts',
    'foodborne': 'fˈudbˌɔɹn',
    'crocs': 'kɹˈɑks',
    'seq': 'ˌɛsˌikjˈu',                    # the count sheet's SEQ column, said as letters
    "who've": 'hˈuv',
    'bizerba': 'bɪzˈɜɹbə',                 # the slicer's maker, "bih-ZER-buh"
    'use-by': 'jˈusbˌI',                   # the noun "use", not the verb
    'typed': 'tˈIpt',
    'bagged': 'bˈæɡd',
    'overthawed': 'ˌOvəɹθˈɔd',
    # "again" words: the dictionary swallows the first vowel of some of them
    'restocking': 'ɹistˈɑkɪŋ', 'rewrapped': 'ɹiɹˈæpt', 'preheated': 'pɹihˈiɾᵻd', 'refrozen': 'ɹifɹˈOzən', 'recleaning': 'ɹiklˈinɪŋ',
    # hyphenated
    'non-slip': 'nˌɑnslˈɪp', 'de-leaf': 'dˌilˈif', 're-implement': 'ɹˌiˈɪmpləmˌɛnt', 'mid-day': 'mˈɪddˌA', 'pre-tear': 'pɹˌitˈɛɹ', 'call-ins': 'kˈɔlˌɪnz',
}

# Words written with a letter the dictionary does not carry
ACCENTED = {'jalapeños': 'hˌɑləpˈAnjOz', 'jalapeño': 'hˌɑləpˈAnjO', 'soufflé': 'suflˈA'}


def normalize(text):
    t = text.replace('’', "'").replace('‘', "'").replace(' ', ' ')
    # names and letters said a set way
    t = re.sub(r'\bpro shoo tee nee\b', '⟦pɹəʃutˈini⟧', t, flags=re.I)
    t = re.sub(r'\bE\. coli\b', '⟦ˈi kˈOlI⟧', t)
    t = re.sub(r'\bhepatitis A\b', 'hepatitis ⟦ˈA⟧', t)
    t = re.sub(r"\bMyMike's\b", "My Mike's", t)
    t = re.sub(r'\bP&L\b', 'P and L', t)
    t = re.sub(r'\bCO2\b', 'C O two', t)
    t = re.sub(r'\b(?:Qty|QTY)\b', 'Quantity', t)
    for word, ps in ACCENTED.items():
        t = re.sub(r'(?<![A-Za-z])' + word + r'(?![A-Za-z])', '⟦' + ps + '⟧', t, flags=re.I)
    # a.m., p.m. and U.S.: the last dot also ends the sentence when a new one starts after it
    def dotted(sounds):
        return lambda m: sounds + ('.' if m.group(1) is not None else '')
    t = re.sub(r'\ba\.m\.(?:(?=\s+[A-Z"“(]|\s*$)()|)', dotted(AM), t)
    t = re.sub(r'\bp\.m\.(?:(?=\s+[A-Z"“(]|\s*$)()|)', dotted(PM), t)
    t = re.sub(r'\bU\.S\.(?:(?=\s+[A-Z"“(]|\s*$)()|)', dotted('⟦jˌuˈɛs⟧'), t)
    t = re.sub(r'\bAM\b', AM, t)
    t = re.sub(r'\bPM\b', PM, t)
    # money, percent, clock times
    t = re.sub(r'\$(\d[\d,]*)(?:\.(\d\d))?(?!\d)', money, t)
    t = re.sub(r'(\d[\d,]*(?:\.\d+)?)%', lambda m: number(m.group(1)) + ' percent', t)
    t = re.sub(r'\b(\d{1,2}):(\d\d)\b', clock, t)
    # fractions; "3/16 inch" is three sixteenths of an inch
    t = re.sub(r'\b(\d+/\d+) inch\b', lambda m: FRACTION[m.group(1)] + ' of an inch', t)
    t = re.sub(r'\b(\d+/\d+)\b', lambda m: FRACTION[m.group(1)], t)
    # 13th, 50s
    t = re.sub(r'\b(\d+)(?:st|nd|rd|th)\b', lambda m: ordinal(m.group(1)), t)
    t = re.sub(r'\b(\d+)s\b', lambda m: {'50': 'fifties', '100': 'hundreds', '20': 'twenties', '10': 'tens'}[m.group(1)], t)
    # every number left: 6-inch, 1,095-day, 1.25, 135
    t = re.sub(r'(?<![\w.])(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)(-(?=[A-Za-z]))?', lambda m: number(m.group(1)) + (' ' if m.group(2) else ''), t)
    # signs
    t = re.sub(r'\s=\s', ' equals ', t)
    t = re.sub(r'\s\+\s', ' plus ', t)
    t = re.sub(r'\s&\s', ' and ', t)
    t = re.sub(r'\s/\s', ' slash ', t)
    t = heteronyms(t)
    return re.sub(r'\s+', ' ', t).strip()


# Words spelled one way and said two. Each rule names the reading wanted where the dictionary's first choice is wrong here.
def heteronyms(t):
    for pattern, tag in RULES:
        t = re.sub(pattern, lambda m, tag=tag: m.group(0) + '{' + tag + '}', t)
    return t


RULES = [
    # close: "near" in a handful of phrases; everywhere else in this course it is to shut, or the end of the day
    (r'(?i)(?<!\btoo )(?<!\bas )(?<!\bhow )(?<!\bdangerously )\bclose\b(?! (?:to|together|attention|enough|by)\b)', 'VERB'),
    (r'(?i)\bproduce\b', 'NOUN'),                 # the vegetables, every time
    (r'(?i)\btear\b', 'VERB'),                    # tear the paper
    (r'(?i)\brefunds?\b', 'NOUN'),
    (r'(?i)\bseparates\b', 'VERB'),               # "it separates as it sits"
    (r'(?i)\baffects?\b', 'VERB'),
    (r'(?i)\bimplement\b', 'VERB'),
    (r'(?i)\babuse\b', 'NOUN'),                   # time and temperature abuse
    (r'(?i)\bno overlap\b', 'NOUN'),
    (r'(?i)\ban estimate\b', 'NOUN'),
    (r'(?i)\bsuspect\b', 'VERB'),
    (r'(?i)\blog lives\b', 'VERB'),
    (r'(?i)\boffset\b', 'VERB'),
    (r'(?i)\bpercentage increase\b', 'NOUN'),
    (r'(?i)\b(?:before|after|continuous|next|in) use\b(?! (?:it|the|a|an|its|your|that|this|both|only|sound)\b)', 'NOUN'),
    (r'(?i)\bbetween uses\b', 'NOUN'),
    (r'(?i)\bis read\b', 'VBN'),
]


def leftovers(t):
    """characters normalize() should have dealt with"""
    return sorted(set(re.findall(r"[^A-Za-z'\-\s;:,.!?\u2014…\"“”(){}]", re.sub(r'⟦[^⟧]*⟧', '', t))))
