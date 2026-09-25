# Project skills

Third-party agent skills vendored for the rebuild's UI work. Each folder is an unmodified copy of its upstream skill, taken on 2026-09-25.

| Skill | Upstream | Commit | Licence |
|---|---|---|---|
| `design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) `skills/taste-skill` | `c184364` | MIT (`LICENSE`) |
| `web-design-reviewer` | [github/awesome-copilot](https://github.com/github/awesome-copilot) `skills/web-design-reviewer` | `6c4d33b` | MIT (`LICENSE`) |
| `anti-ui-slop` | [github/awesome-copilot](https://github.com/github/awesome-copilot) `skills/anti-ui-slop` | `6c4d33b` | MIT (own `LICENSE`, `NOTICE`) |
| `premium-frontend-ui` | [github/awesome-copilot](https://github.com/github/awesome-copilot) `skills/premium-frontend-ui` | `6c4d33b` | MIT (`LICENSE`) |
| `ui-screenshots` | [github/awesome-copilot](https://github.com/github/awesome-copilot) `skills/ui-screenshots` | `6c4d33b` | MIT (`LICENSE`) |
| `vercel-react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) `skills/react-best-practices` | `063bee9` | MIT (declared in `SKILL.md`) |

## Precedence

`REBUILD_BRIEF.md` and the phase plans win over every skill. Known conflicts, settled in favour of the brief:

- **Em dashes:** `design-taste-frontend` bans them; canonical brief copy keeps them.
- **Dark mode:** `design-taste-frontend` requires it; direction B is light-only.
- **Stock or generated images:** `design-taste-frontend` wants them; the brief allows only real screenshots and data-drawn figures (§3.8, D3).
- **`premium-frontend-ui`:** preloaders, custom cursors and scroll hijacking conflict with the brief's performance and accessibility bars. Use it for reference only.
- **`anti-ui-slop`:** its reference search needs the paid UIZZE MCP; the free playbooks work without it.

To update a skill, re-copy it from upstream and bump the commit in this table.
