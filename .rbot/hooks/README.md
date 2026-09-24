# Git hooks — mailbox sync, not a leash

Git does not run `.git/hooks` from the repo. These live in `hooks/` and turn on with:

```
git config core.hooksPath hooks
chmod +x hooks/*
```

Or: `sh hooks/install.sh`

Airplane: hooks still copy locally. They never require the network. Function 0 does not wait on them.

## What they do

| Hook | Does | Does not |
|------|------|----------|
| `post-merge` / `post-commit` / `post-checkout` | Copy `handoff/ONLINE-MIND.md` + `LINKS.md` to the twin clone if it exists (`~/Desktop/PROJECTR` or `~/Desktop/RIZALBOT`) and into `~/Documents/Я/` | Merge the two git trees. Push. Ping. Evolve. |
| `pre-push` | Block `llama.xcframework`, `heart.gguf`, `*.gguf` | Rewrite history |

Twin stays two remotes. You commit the other body. Decider stays you.

`RIZAL_AUTOSYNC=0` in the environment disables the copy.
