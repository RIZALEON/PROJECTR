#!/usr/bin/env bash
# growth-stamp.sh — stamp how RIZALEON/RIZALBOT, RIZALEON/PROJECTR, rizalward/Rbot grow.
# Works on Linux and macOS. Needs: bash, git, python3. Optional: gh (for remote heads).
# Writes growth/GROWTH-LEDGER.json and growth/GROWTH.md next to this script.
#
# Fixes:
# - core.quotepath=off so Unicode paths (e.g. clay/ЯBOT/*.swift) classify by extension
# - numstat rename forms: "old => new" and "path/{old => new}/rest"
# - fetch all origin heads; branch count = remote heads (not local clutter)
# - commits/lines across all remote branches, deduped, --no-merges
# - seed-growth-* excluded from commit/line tallies (contains squashed peer copies;
#   including it double-counts). Still counted in remote branch total.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_JSON="$SCRIPT_DIR/GROWTH-LEDGER.json"
OUT_MD="$SCRIPT_DIR/GROWTH.md"
TZ_NAME="America/Denver"
NOW="$(TZ=$TZ_NAME date '+%Y-%m-%d %H:%M:%S %Z')"
NOW_ISO="$(TZ=$TZ_NAME date -Iseconds 2>/dev/null || TZ=$TZ_NAME date '+%Y-%m-%dT%H:%M:%S%z')"

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

# Ensure origin heads are present (best-effort; never fail the stamp).
fetch_origin_heads() {
  local path="$1"
  [[ -d "$path/.git" ]] || return 0
  git -C "$path" fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune 2>/dev/null || true
}

# List remote-tracking refs for stats (exclude HEAD symlink and seed-growth monitoring branches).
remote_stat_refs() {
  git branch -r --format='%(refname)' 2>/dev/null \
    | grep -v '/HEAD$' \
    | grep -v '/seed-growth-' \
    || true
}

# Count all origin heads (including seed-growth).
count_remote_heads() {
  # Exclude symbolic HEAD (shows as "origin" or "origin/HEAD") — count real heads only
  git branch -r --format='%(refname)' 2>/dev/null \
    | grep '^refs/remotes/origin/' \
    | grep -v '/HEAD$' \
    | wc -l | tr -d ' '
}

# Resolve a numstat path that may use rename syntax → final path.
# Handled in python below for robustness.

stat_tree() {
  local key="$1" path="$2" remote_repo="$3" default_branch="$4" seed_folder_a="$5" seed_src_a="$6" seed_folder_b="$7" seed_src_b="$8"
  local branches=0 commits_7=0 commits_14=0 commits_30=0
  local head_sha="" last_commit=""
  local lines_swift_a=0 lines_swift_d=0 lines_kt_a=0 lines_kt_d=0
  local lines_js_a=0 lines_js_d=0 lines_md_a=0 lines_md_d=0
  local lines_other_a=0 lines_other_d=0
  local available="false"
  local insertions_30=0 deletions_30=0

  if [[ -n "$path" && -d "$path/.git" ]]; then
    available="true"
    fetch_origin_heads "$path"
    pushd "$path" >/dev/null

    branches=$(count_remote_heads)

    # Default-branch tip (prefer remote); fall back to HEAD
    if git rev-parse --verify "origin/$default_branch" >/dev/null 2>&1; then
      head_sha=$(git rev-parse "origin/$default_branch")
      last_commit=$(TZ=$TZ_NAME git log -1 --format='%ci' "origin/$default_branch" 2>/dev/null | head -1)
    else
      head_sha=$(git rev-parse HEAD 2>/dev/null || echo "")
      last_commit=$(TZ=$TZ_NAME git log -1 --format='%ci' 2>/dev/null | head -1)
    fi
    if [[ -n "$last_commit" ]]; then
      last_commit=$(TZ=$TZ_NAME date -d "$last_commit" '+%Y-%m-%d %H:%M:%S %Z' 2>/dev/null \
        || TZ=$TZ_NAME date -j -f '%Y-%m-%d %H:%M:%S %z' "$(echo "$last_commit" | sed 's/^\([0-9-]* [0-9:]*\) \(.*\)$/\1/') " '+%Y-%m-%d %H:%M:%S %Z' 2>/dev/null \
        || echo "$last_commit")
    fi

    # Build ref list for stats (dedupe via git's commit walk)
    local refs
    refs=$(remote_stat_refs)
    if [[ -z "${refs// }" ]]; then
      # Fallback: all remotes, then --all
      refs=$(git branch -r --format='%(refname)' 2>/dev/null | grep -v '/HEAD$' || true)
    fi

    if [[ -n "${refs// }" ]]; then
      # shellcheck disable=SC2086
      commits_7=$(git log --no-merges --since='7 days ago' --oneline $refs 2>/dev/null | wc -l | tr -d ' ')
      # shellcheck disable=SC2086
      commits_14=$(git log --no-merges --since='14 days ago' --oneline $refs 2>/dev/null | wc -l | tr -d ' ')
      # shellcheck disable=SC2086
      commits_30=$(git log --no-merges --since='30 days ago' --oneline $refs 2>/dev/null | wc -l | tr -d ' ')

      # Line stats: quotepath=off + rename-aware classification via python
      local numstat_out
      # shellcheck disable=SC2086
      numstat_out=$(git -c core.quotepath=off log --no-merges --since='30 days ago' --numstat --format='' $refs 2>/dev/null || true)
      parsed=$(printf '%s\n' "$numstat_out" | python3 -c '
import sys, re

def final_path(f):
    m = re.search(r"\{([^}]*) => ([^}]*)\}", f)
    if m:
        return f[:m.start()] + m.group(2) + f[m.end():]
    if " => " in f:
        return f.split(" => ")[-1]
    return f

sa=sd=ka=kd=ja=jd=ma=md=oa=od=0
for line in sys.stdin:
    line = line.rstrip("\n")
    if not line.strip():
        continue
    parts = line.split("\t")
    if len(parts) < 3:
        continue
    add, dele, path = parts[0], parts[1], parts[2]
    if add == "-" or dele == "-":
        continue
    try:
        add_i, del_i = int(add), int(dele)
    except ValueError:
        continue
    path = final_path(path)
    lower = path.lower()
    if lower.endswith(".swift"):
        sa += add_i; sd += del_i
    elif lower.endswith(".kt") or lower.endswith(".kts"):
        ka += add_i; kd += del_i
    elif lower.endswith((".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx")):
        ja += add_i; jd += del_i
    elif lower.endswith((".md", ".mdx")):
        ma += add_i; md += del_i
    else:
        oa += add_i; od += del_i
print(f"{sa} {sd} {ka} {kd} {ja} {jd} {ma} {md} {oa} {od}")
')
      read -r lines_swift_a lines_swift_d lines_kt_a lines_kt_d lines_js_a lines_js_d lines_md_a lines_md_d lines_other_a lines_other_d <<< "$parsed"
      insertions_30=$((lines_swift_a + lines_kt_a + lines_js_a + lines_md_a + lines_other_a))
      deletions_30=$((lines_swift_d + lines_kt_d + lines_js_d + lines_md_d + lines_other_d))
    fi
    popd >/dev/null
  fi

  seed_freshness() {
    local folder="$1" expected_src="$2"
    local status="missing" seed_sha="" upstream_sha="" stale_n=""
    local seed_path=""
    if [[ -n "$path" && -f "$path/$folder/SEED.md" ]]; then
      seed_path="$path/$folder/SEED.md"
    fi
    if [[ -n "$seed_path" ]]; then
      seed_sha=$(grep -E '^- source_sha:' "$seed_path" | awk '{print $3}' | head -1)
      local seed_branch
      seed_branch=$(grep -E '^- source_branch:' "$seed_path" | awk '{print $3}' | head -1)
      local up_path=""
      case "$expected_src" in
        *RIZALBOT*) up_path="$REPO_RIZALBOT" ;;
        *PROJECTR*) up_path="$REPO_PROJECTR" ;;
        *Rbot*) up_path="$REPO_RBOT" ;;
      esac
      # Prefer SEED.md source_branch (usually seed-growth-*); fall back to tree default
      local defb="${seed_branch:-}"
      if [[ -z "$defb" ]]; then
        defb="main"
        case "$expected_src" in
          *RIZALBOT*) defb="seat-wallet-landing" ;;
        esac
      fi
      if [[ -n "$up_path" && -d "$up_path/.git" ]]; then
        # Local HEAD matches just-refreshed seeds before they are committed
        local head_now
        head_now=$(git -C "$up_path" rev-parse HEAD 2>/dev/null || true)
        # Prefer local HEAD when it matches the seed (pre-commit refresh) or equals recorded sha
        if [[ -n "$seed_sha" && -n "$head_now" && ( "$head_now" == "$seed_sha" || "$head_now" == "$seed_sha"* || "$seed_sha" == "$head_now"* ) ]]; then
          upstream_sha="$head_now"
        elif git -C "$up_path" rev-parse --verify "origin/$defb" >/dev/null 2>&1; then
          upstream_sha=$(git -C "$up_path" rev-parse "origin/$defb" 2>/dev/null || true)
        elif git -C "$up_path" rev-parse --verify "$defb" >/dev/null 2>&1; then
          upstream_sha=$(git -C "$up_path" rev-parse "$defb" 2>/dev/null || true)
        else
          upstream_sha=$(git -C "$up_path" rev-parse HEAD 2>/dev/null || true)
        fi
      elif command -v gh >/dev/null 2>&1; then
        upstream_sha=$(gh api "repos/$expected_src/commits/$defb" --jq .sha 2>/dev/null || true)
      fi
      if [[ -n "$seed_sha" && -n "$upstream_sha" ]]; then
        if [[ "$seed_sha" == "$upstream_sha" || "$seed_sha" == "${upstream_sha:0:${#seed_sha}}" || "$upstream_sha" == "${seed_sha:0:${#upstream_sha}}" ]]; then
          status="fresh"
          stale_n=0
        else
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
    "$insertions_30" "$deletions_30" \
    "$seed_folder_a" "$seed_src_a" "$s1" \
    "$seed_folder_b" "$seed_src_b" "$s2" <<'PY'
import json,sys
(key, remote, defb, available, path, branches,
 c7,c14,c30, head, last,
 sa,sd, ka,kd, ja,jd, ma,md, oa,od,
 ins30, del30,
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
    "branch_count_note": "remote heads on origin (incl. seed-growth); commit/line tallies exclude seed-growth-* to avoid double-counting squashed peer copies",
    "commits_last_7_days": int(c7 or 0),
    "commits_last_14_days": int(c14 or 0),
    "commits_last_30_days": int(c30 or 0),
    "head_sha": head or None,
    "last_commit_denver": last or None,
    "insertions_30d": int(ins30 or 0),
    "deletions_30d": int(del30 or 0),
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
    "method_notes": [
        "git -c core.quotepath=off for numstat (Unicode paths e.g. clay/ЯBOT/*.swift)",
        "numstat rename forms resolved to final path before extension classify",
        "git fetch origin '+refs/heads/*:refs/remotes/origin/*' before count",
        "branches = remote heads on origin",
        "commits/lines = all origin branches except seed-growth-* (deduped, --no-merges); seed-growth excluded to avoid double-counting squashed peer tree copies",
    ],
    "trees": trees,
}
with open(out_json, "w") as f:
    json.dump(ledger, f, indent=2, ensure_ascii=False)
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
lines.append("Method: `core.quotepath=off`; rename-aware numstat; fetch all origin heads; commit/line tallies exclude `seed-growth-*` (avoids double-counting squashed seeds).")
lines.append("")
lines.append("| Tree | Remote branches | Commits 7/14/30d | Insertions 30d | Lines 30d (add/del) | Last commit (Denver) | Head |")
lines.append("|---|---|---|---|---|---|---|")
for t in trees:
    head = (t.get("head_sha") or "—")[:7]
    lines.append(
        f"| {t['key']} (`{t['repo']}`) | {t['branches']} | "
        f"{t['commits_last_7_days']}/{t['commits_last_14_days']}/{t['commits_last_30_days']} | "
        f"+{t.get('insertions_30d', 0)}/-{t.get('deletions_30d', 0)} | "
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
    print(f"  {t['key']}: branches={t['branches']} c7/14/30={t['commits_last_7_days']}/{t['commits_last_14_days']}/{t['commits_last_30_days']} "
          f"ins=+{t.get('insertions_30d',0)} swift=+{t['lines_30d']['swift']['added']} head={(t.get('head_sha') or '')[:7]}")
PY
