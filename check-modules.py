#!/usr/bin/env python3
"""Refactor safety checks: cross-references to game.js-private names,
duplicate top-level declarations, and const-assignment hazards.
Run after moving any code between files: python3 check-modules.py"""
import re, itertools, sys

MODULES = ("grid fx seq game-state style banner sound particles transitions conv inter "
           "city input hud crew act1 act2 act3 act4 act5 act6 act8 act9").split()
DATA = "game-data omc-kit frames game-data-words-engine lang-en lang-fr lang-init game-data-food".split()
KNOWN_SAFE = {"STORE", "update"}

def strip(t, strings=False):
    pat = r'//.*|/\*[\s\S]*?\*/'
    if strings:
        pat += r'|"(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`(?:[^`\\]|\\.)*`'
    return re.sub(pat, ' ', t)

def decl_names(stmt):
    parts, depth, cur = [], 0, ""
    for ch in stmt:
        if ch in "([{": depth += 1
        elif ch in ")]}": depth -= 1
        if ch == "," and depth == 0:
            parts.append(cur); cur = ""
        else:
            cur += ch
    parts.append(cur)
    out = set()
    for p in parts:
        n = p.strip().split("=")[0].strip()
        if re.fullmatch(r'[A-Za-z_$][\w$]*', n or ""): out.add(n)
    return out

def scoped_decls(text, indent):
    t = strip(text, strings=True)
    ns = set()
    for m in re.finditer(r'^' + indent + r'(?:let|const|var|class)\s+([^;]*?);', t, re.M | re.S):
        ns |= decl_names(m.group(1))
    ns |= set(re.findall(r'^' + indent + r'function\s+([\w$]+)', t, re.M))
    return ns

def top_decls(f):
    text = open(f + ".js").read()
    return scoped_decls(text, r'(?:  )?')

fail = False
src = open("game.js").read()
private = scoped_decls(src, r'  ')
for m in re.finditer(r'window\.([\w$]+)\s*=', src):
    private.discard(m.group(1))
private -= {"Util", "Device", "GameLoop", "Input", "State", "Timer"}
private -= KNOWN_SAFE
decls = {f: top_decls(f) for f in MODULES + DATA}
for ns in decls.values():
    private -= ns

for f in MODULES:
    t = strip(open(f + ".js").read(), strings=True)
    declared = set(re.findall(r'\b(?:let|const|var|function|class)\s+([\w$]+)', t))
    hits = [n for n in sorted(private - declared) if re.search(r'\b(?<!\.)' + re.escape(n) + r'\b(?!\s*:)', t)]
    if hits:
        print(f"CROSS-REF {f}.js -> game.js-private: {hits}")
        fail = True

for a, b in itertools.combinations(decls, 2):
    both = decls[a] & decls[b]
    if both:
        print(f"DUPLICATE {a}.js & {b}.js -> {sorted(both)}")
        fail = True

consts = set()
for f in MODULES + DATA:
    t = strip(open(f + ".js").read(), strings=True)
    for m in re.finditer(r'^(?:  )?const\s+([^;]*?);', t, re.M | re.S):
        consts |= decl_names(m.group(1))
for f in MODULES:
    t = strip(open(f + ".js").read(), strings=True)
    bad = [n for n in sorted(consts - decls[f] - KNOWN_SAFE)
           if re.search(r'^\s+' + re.escape(n) + r'\s*=[^=]', t, re.M)]
    if bad:
        print(f"CONST-ASSIGN {f}.js writes to global const: {bad}")
        fail = True

print("FAIL" if fail else "OK")
sys.exit(1 if fail else 0)
