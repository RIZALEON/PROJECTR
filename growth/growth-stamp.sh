#!/usr/bin/env bash
# growth-stamp.sh — stamp how RIZALEON/RIZALBOT, RIZALEON/PROJECTR, rizalward/Rbot grow.
# Works on Linux and macOS. Needs: bash, git, python3. Optional: gh (for remote heads).
# Writes growth/GROWTH-LEDGER.json and growth/GROWTH.md next to this script.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_JSON="$SCRIPT_DIR/GROWTH-LEDGER.json"
OUT_MD="$SCRIPT_DIR/GROWTH.md"
TZ_NAME="America/Denver"
NOW="$(TZ=$TZ_NAME date '+%Y-%m-%d %H:%M:%S %Z')"
NOW_ISO="$(TZ=$TZ_NAME date -Iseconds 2>/dev/null || TZ=$TZ_NAME date '+%Y-%m-%dT%H:%M:%S%z')"

# Discover repo roots: prefer env overrides, else walk up for .git, else sibling clones.
REPO_RIZALBOT="${GROWTH_RIZALBOT_PATH:-}"
REPO_PROJECTR="${GROWTH_PROJECTR_PATH:-}"
REPO_RBOT="${GROWTH_RBOT_PATH:-}"

discover_siblings() {
  local base
  base="$(cd "$SCRIPT_DIR/../.." && pwd)"
  for cand in "$base/RIZALBOT" "$base/seed-growth/RIZALBOT" "$HOME/RIZALBOT"; do
    [[ -z "$REPO_RIZALBOT" && -d "$cand/.git" ]] && REPO_RIZALBOT="$cand"
  done
  for cand in "$base/PROJECTR" "$base/seed-growth/PROJECTR" "$HOME/PROJECTR"; do
    [[ -z "$REPO_PROJECTR" && -d "$cand/.git" ]] && REPO_PROJECTR="$cand"
  done
  for cand in "$base/Rbot" "$base/seed-growth/Rbot" "$HOME/Rbot"; do
    [[ -z "$REPO_RBOT" && -d "$cand/.git" ]] && REPO_RBOT="$cand"
  done
  # If script lives inside one of the trees, that tree is known
  local here
  here="$(cd "$SCRIPT_DIR/.." && pwd)"
  if [[ -d "$here/.git" ]]; then
    local name
    name="$(basename "$here")"
    case "$name" in
      RIZALBOT|RIZALEON-RIZALBOT) REPO_RIZALBOT="${REPO_RIZALBOT:-$here}" ;;
      PROJECTR|RIZALEON-PROJECTR) REPO_PROJECTR="${REPO_PROJECTR:-$here}" ;;
      Rbot|rizalward-Rbot) REPO_RBOT="${REPO_RBOT:-$here}" ;;
    esac
  fi
}
discover_siblings

# Also allow: if only one local tree is present, still stamp it; others use remote via gh if available.
TREES_JSON='[]'

stat_tree() {
  local key="$1" path="$2" remote_repo="$3" default_branch="$4" seed_folder_a="$5" seed_src_a="$6" seed_folder_b="$7" seed_src_b="$8"
  local branches=0 commits_7=0 commits_14=0 commits_30=0
  local head_sha="" last_commit="" 
  local lines_swift_a=0 lines_swift_d=0 lines_kt_a=0 lines_kt_d=0
  local lines_js_a=0 lines_js_d=0 lines_md_a=0 lines_md_d=0
  local lines_other_a=0 lines_other_d=0
  local available="false"

  if [[ -n "$path" && -d "$path/.git" ]]; then
    available="true"
    pushd "$path" >/dev/null
    branches=$(git branch -a --format='%(refname:short)' 2>/dev/null | wc -l | tr -d ' ')
    head_sha=$(git rev-parse HEAD 2>/dev/null || echo "")
    last_commit=$(TZ=$TZ_NAME git log -1 --format='%ci' 2>/dev/null | head -1)
    # Convert last_commit to Denver display if possible
    if [[ -n "$last_commit" ]]; then
      last_commit=$(TZ=$TZ_NAME date -d "$last_commit" '+%Y-%m-%d %H:%M:%S %Z' 2>/dev/null \
        || TZ=$TZ_NAME date -j -f '%Y-%m-%d %H:%M:%S %z' "$(echo "$last_commit" | sed 's/^\([0-9-]* [0-9:]*\) \(.*\)$/\1/') " '+%Y-%m-%d %H:%M:%S %Z' 2>/dev/null \
        || echo "$last_commit")
    fi
    commits_7=$(git log --all --no-merges --since='7 days ago' --oneline 2>/dev/null | wc -l | tr -d ' ')
    commits_14=$(git log --all --no-merges --since='14 days ago' --oneline 2>/dev/null | wc -l | tr -d ' ')
    commits_30=$(git log --all --no-merges --since='30 days ago' --oneline 2>/dev/null | wc -l | tr -d ' ')

    # Line stats last 30 days by extension (added/deleted)
    local numstat
    numstat=$(git log --all --no-merges --since='30 days ago' --numstat --format='' 2>/dev/null || true)
    while IFS=$'\t' read -r add del file; do
      [[ -z "${file:-}" ]] && continue
      [[ "$add" == "-" || "$del" == "-" ]] && continue
      add=${add:-0}; del=${del:-0}
      case "$file" in
        *.swift) lines_swift_a=$((lines_swift_a+add)); lines_swift_d=$((lines_swift_d+del)) ;;
        *.kt|*.kts) lines_kt_a=$((lines_kt_a+add)); lines_kt_d=$((lines_kt_d+del)) ;;
        *.js|*.mjs|*.cjs|*.ts|*.tsx|*.jsx) lines_js_a=$((lines_js_a+add)); lines_js_d=$((lines_js_d+del)) ;;
        *.md|*.mdx) lines_md_a=$((lines_md_a+add)); lines_md_d=$((lines_md_d+del)) ;;
        *) lines_other_a=$((lines_other_a+add)); lines_other_d=$((lines_other_d+del)) ;;
      esac
    done <<< "$numstat"
    popd >/dev/null
  fi

  # Seed freshness
  seed_freshness() {
    local folder="$1" expected_src="$2"  # expected_src like RIZALEON/RIZALBOT
    local status="missing" seed_sha="" upstream_sha="" stale_n=""
    local seed_path=""
    # Prefer seed inside the tree being stamped
    if [[ -n "$path" && -f "$path/$folder/SEED.md" ]]; then
      seed_path="$path/$folder/SEED.md"
    fi
    if [[ -n "$seed_path" ]]; then
      seed_sha=$(grep -E '^- source_sha:' "$seed_path" | awk '{print $3}' | head -1)
      # Resolve upstream head: local sibling first, then gh
      local up_path=""
      case "$expected_src" in
        *RIZALBOT*) up_path="$REPO_RIZALBOT" ;;
        *PROJECTR*) up_path="$REPO_PROJECTR" ;;
        *Rbot*) up_path="$REPO_RBOT" ;;
      esac
      if [[ -n "$up_path" && -d "$up_path/.git" ]]; then
        upstream_sha=$(git -C "$up_path" rev-parse HEAD 2>/dev/null || true)
      elif command -v gh >/dev/null 2>&1; then
        local defb
        case "$expected_src" in
          *RIZALBOT*) defb="seat-wallet-landing" ;;
          *) defb="main" ;;
        esac
        upstream_sha=$(gh api "repos/$expected_src/commits/$defb" --jq .sha 2>/dev/null || true)
      fi
      if [[ -n "$seed_sha" && -n "$upstream_sha" ]]; then
        if [[ "$seed_sha" == "$upstream_sha" || "$seed_sha" == "${upstream_sha:0:${#seed_sha}}" || "$upstream_sha" == "${seed_sha:0:${#upstream_sha}}" ]]; then
          status="fresh"
          stale_n=0
        else
          # Count commits between if local upstream available
          if [[ -n "$up_path" && -d "$up_path/.git" ]]; then
            stale_n=$(git -C "$up_path" rev-list --count "${seed_sha}..${upstream_sha}" 2>/dev/null || echo "?")
          else
            stale_n="?"
          fi
          status="stale by ${stale_n} commits"
        fi
      elif [[ -n "$seed_sha" ]]; then
        status="seeded (upstream unknown)"
      fi
    fi
    printf '%s\t%s\t%s\t%s' "$status" "$seed_sha" "$upstream_sha" "$stale_n"
  }

  local s1 s2
  s1=$(seed_freshness "$seed_folder_a" "$seed_src_a")
  s2=$(seed_freshness "$seed_folder_b" "$seed_src_b")

  python3 - "$key" "$remote_repo" "$default_branch" "$available" "$path" "$branches" \
    "$commits_7" "$commits_14" "$commits_30" "$head_sha" "$last_commit" \
    "$lines_swift_a" "$lines_swift_d" "$lines_kt_a" "$lines_kt_d" \
    "$lines_js_a" "$lines_js_d" "$lines_md_a" "$lines_md_d" \
    "$lines_other_a" "$lines_other_d" \
    "$seed_folder_a" "$seed_src_a" "$s1" \
    "$seed_folder_b" "$seed_src_b" "$s2" <<'PY'
import json,sys
(key, remote, defb, available, path, branches,
 c7,c14,c30, head, last,
 sa,sd, ka,kd, ja,jd, ma,md, oa,od,
 fold_a, src_a, s1,
 fold_b, src_b, s2) = sys.argv[1:]

def parse_seed(s, folder, src):
    parts = s.split('\t')
    while len(parts) < 4: parts.append("")
    status, seed_sha, up_sha, stale = parts[:4]
    return {
        "folder": folder,
        "source_repo": src,
        "seed_sha": seed_sha or None,
        "upstream_sha": up_sha or None,
        "status": status,
        "stale_commits": None if stale in ("", "?") else (int(stale) if str(stale).isdigit() else stale),
    }

obj = {
    "key": key,
    "repo": remote,
    "default_branch": defb,
    "available_local": available == "true",
    "local_path": path or None,
    "branches": int(branches or 0),
    "commits_last_7_days": int(c7 or 0),
    "commits_last_14_days": int(c14 or 0),
    "commits_last_30_days": int(c30 or 0),
    "head_sha": head or None,
    "last_commit_denver": last or None,
    "lines_30d": {
        "swift": {"added": int(sa), "deleted": int(sd)},
        "kt": {"added": int(ka), "deleted": int(kd)},
        "js": {"added": int(ja), "deleted": int(jd)},
        "md": {"added": int(ma), "deleted": int(md)},
        "other": {"added": int(oa), "deleted": int(od)},
    },
    "seeds": [parse_seed(s1, fold_a, src_a), parse_seed(s2, fold_b, src_b)],
}
print(json.dumps(obj))
PY
}

# Collect
T1=$(stat_tree "RIZALBOT" "$REPO_RIZALBOT" "RIZALEON/RIZALBOT" "seat-wallet-landing" \
  ".projectr" "RIZALEON/PROJECTR" ".rbot" "rizalward/Rbot")
T2=$(stat_tree "PROJECTR" "$REPO_PROJECTR" "RIZALEON/PROJECTR" "main" \
  ".rizalbot" "RIZALEON/RIZALBOT" ".rbot" "rizalward/Rbot")
T3=$(stat_tree "Rbot" "$REPO_RBOT" "rizalward/Rbot" "main" \
  ".projectr" "RIZALEON/PROJECTR" ".rizalbot" "RIZALEON/RIZALBOT")

python3 - "$OUT_JSON" "$OUT_MD" "$NOW" "$NOW_ISO" "$T1" "$T2" "$T3" <<'PY'
import json,sys
out_json, out_md, now, now_iso, t1, t2, t3 = sys.argv[1:]
trees = [json.loads(t1), json.loads(t2), json.loads(t3)]
ledger = {
    "stamp": now,
    "stamp_iso": now_iso,
    "timezone": "America/Denver",
    "crown": "Я",
    "mint": "BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv",
    "law": "Clay (device) owns source; GitHub is a mirror. NonNuclear.",
    "trees": trees,
}
with open(out_json, "w") as f:
    json.dump(ledger, f, indent=2)
    f.write("\n")

def lines_cell(t):
    L = t["lines_30d"]
    parts = []
    for k in ("swift","kt","js","md","other"):
        a,d = L[k]["added"], L[k]["deleted"]
        if a or d:
            parts.append(f"{k} +{a}/-{d}")
    return ", ".join(parts) if parts else "—"

lines = []
lines.append("# GROWTH LEDGER")
lines.append("")
lines.append(f"Stamped: **{now}** (America/Denver)")
lines.append("")
lines.append("Crown/token: **Я** · Mint: `BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv`")
lines.append("")
lines.append("Clay (device) owns source; GitHub is a mirror.")
lines.append("")
lines.append("| Tree | Branches | Commits 7/14/30d | Lines 30d (add/del) | Last commit (Denver) | Head |")
lines.append("|---|---|---|---|---|---|")
for t in trees:
    head = (t.get("head_sha") or "—")[:7]
    lines.append(
        f"| {t['key']} (`{t['repo']}`) | {t['branches']} | "
        f"{t['commits_last_7_days']}/{t['commits_last_14_days']}/{t['commits_last_30_days']} | "
        f"{lines_cell(t)} | {t.get('last_commit_denver') or '—'} | `{head}` |"
    )
lines.append("")
lines.append("## Seed freshness")
lines.append("")
lines.append("| Tree | Seed folder | Source | Status | Seed sha | Upstream sha |")
lines.append("|---|---|---|---|---|---|")
for t in trees:
    for s in t["seeds"]:
        ss = (s.get("seed_sha") or "—")[:7]
        us = (s.get("upstream_sha") or "—")[:7]
        lines.append(
            f"| {t['key']} | `{s['folder']}` | {s['source_repo']} | {s['status']} | `{ss}` | `{us}` |"
        )
lines.append("")
lines.append("## How to re-stamp")
lines.append("")
lines.append("```bash")
lines.append("GROWTH_RIZALBOT_PATH=/path/to/RIZALBOT \\")
lines.append("GROWTH_PROJECTR_PATH=/path/to/PROJECTR \\")
lines.append("GROWTH_RBOT_PATH=/path/to/Rbot \\")
lines.append("  bash growth/growth-stamp.sh")
lines.append("```")
lines.append("")
with open(out_md, "w") as f:
    f.write("\n".join(lines) + "\n")
print(f"Wrote {out_json}")
print(f"Wrote {out_md}")
for t in trees:
    print(f"  {t['key']}: branches={t['branches']} c7/14/30={t['commits_last_7_days']}/{t['commits_last_14_days']}/{t['commits_last_30_days']} head={(t.get('head_sha') or '')[:7]}")
PY
