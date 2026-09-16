#!/usr/bin/env python3
import re, sys
path = sys.argv[1]
text = open(path, encoding="utf-8").read()
orig = text
out = []
i = 0
while True:
    m = re.search(r"buildSettings = \{", text[i:])
    if not m:
        out.append(text[i:])
        break
    start = i + m.start()
    out.append(text[i:start])
    j = i + m.end()
    depth = 1
    while j < len(text) and depth:
        if text[j] == '{':
            depth += 1
        elif text[j] == '}':
            depth -= 1
        j += 1
    block = text[start:j]
    inject = ""
    if "CURRENT_PROJECT_VERSION" not in block:
        inject += "\n\t\t\t\tCURRENT_PROJECT_VERSION = 1;"
    if "MARKETING_VERSION" not in block:
        inject += "\n\t\t\t\tMARKETING_VERSION = 0.1;"
    if inject:
        block = block.replace("buildSettings = {", "buildSettings = {" + inject, 1)
    out.append(block)
    i = j
text = "".join(out)
if text != orig:
    open(path, "w", encoding="utf-8").write(text)
    print("OK pbxproj: ensured CURRENT_PROJECT_VERSION=1 MARKETING_VERSION=0.1")
else:
    print("OK pbxproj: version keys already present")
