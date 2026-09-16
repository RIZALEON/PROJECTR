#!/usr/bin/env python3
import re, sys
path = sys.argv[1]
text = open(path, encoding="utf-8").read()
if "CURRENT_PROJECT_VERSION" not in text:
    text = text.replace(
        "MACOSX_DEPLOYMENT_TARGET",
        "CURRENT_PROJECT_VERSION = 1;\n\t\t\t\tMARKETING_VERSION = 0.1;\n\t\t\t\tMACOSX_DEPLOYMENT_TARGET",
        1,
    )
else:
    text = re.sub(r"CURRENT_PROJECT_VERSION = [^;]+;", "CURRENT_PROJECT_VERSION = 1;", text)
    text = re.sub(r"MARKETING_VERSION = [^;]+;", "MARKETING_VERSION = 0.1;", text)
    if "MARKETING_VERSION" not in text:
        text = text.replace(
            "CURRENT_PROJECT_VERSION = 1;",
            "CURRENT_PROJECT_VERSION = 1;\n\t\t\t\tMARKETING_VERSION = 0.1;",
        )
open(path, "w", encoding="utf-8").write(text)
print("OK pbxproj: ensured CURRENT_PROJECT_VERSION=1 MARKETING_VERSION=0.1")
