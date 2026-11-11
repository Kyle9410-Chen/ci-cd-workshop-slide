# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Slide deck for the CI/CD workshop, written with [Marp](https://marp.app/). This repo sits in the workshop workspace next to `ci-cd-workshop-backend/` and `ci-cd-workshop-frontend/`, which are the projects the slides teach against. The parent `CLAUDE.md` describes them.

## Commands

```bash
npm install
npm run dev
npm run build
npm run build:pdf
```

- `npm run dev` starts the Marp server on the repo root. Preview at http://localhost:8080/slides.md, which live-reloads.
- `npm run build` writes `dist/index.html` and copies `teaching-material/images` into `dist/` so relative image paths keep working.
- `npm run build:pdf` needs a local Chrome or Edge.

## Structure

- `slides.md` is the deck, and it is the only Marp source. Each page has a Chinese speaker script in an HTML comment (Marp presenter notes).
- `themes/workshop.css` is the custom `workshop` theme (1600×900), registered via `themeSet` in `.marprc.yml`. Its look follows the reference deck at https://ilsao.github.io/slides/backend-workshop (source: github.com/ilsao/slides, `decks/backend-workshop`): white canvas, blue chapter label from the `header` directive above a 48px title, dark code editor, footer plus `n / total` page number.
- Every step-by-step flow is a timeline: `<ol class="tl">` with one `<li><b>label</b><small>detail</small></li>` per step (modifiers `hl`, `good`, `bad`, `warn`, `ghost`; `tl sm` for small ones). A timeline holds at most 3 nodes on a fixed 3-column grid; split longer sequences across pages with the same title, adding `more` on the page that continues and `cont` on the page that picks up. Keep a blank line before every `---` separator, or it renders as text. Wrap labeled parallel timelines in `tl-row` with a `tl-cap`, and set `style="--base:1.8s"` to delay a later row. A longer flow can instead stack up to three timelines in one `<div class="tl-grid">` (first row `tl more`, middle `tl cont more`, last `tl cont`, with `style="--base:1.4s"` / `2.6s` so rows appear one after another). Mark steps with `ci` or `cd` plus an `<em class="by">CI</em>` badge, and end the grid with a `<div class="mark-step">` holding a one-item `*` list whose item is the `.legend`. The rows animate when the slide opens; the marks (blue or green, row by row) and the legend appear only when that fragment is revealed on the next key press. PDF shows the marked state. Timelines animate in when the slide opens (screen media only, so PDF shows the final state); inside a fragment list item they start when the item is revealed.
- Other diagrams are inline HTML using theme classes (`box`, `pipe`/`stack`/`node`, `cards`/`card`, `cols`, `goals`, `agenda`, `note`, `file`, `benefits`/`ill`/`legend`, and `issues`/`issue`/`scene` for full-height illustrated columns (no card background, separated by light grey vertical lines) that animate in one after another via `--k`; write each `<div class="issue">` as a `*` list item instead (continuation lines indented two spaces) to reveal the columns one key press at a time, and `pyramid` for a layered pyramid: a `*` list of `<div class="layer">` + `<div class="desc">` items, listed bottom layer first, each revealed with a key press and stacked on top of the previous one). Page classes: `cover`, `qa`, and `dense` for code longer than ~15 lines.
- The deployment architecture page is a fixed 1216×600 `.arch` stage with absolutely positioned nodes and SVG lines. Its request animation moves `.pkt` dots along CSS `offset-path` routes in a 10s loop (① `/` to the frontend, ② `/api/` through the backend to the DB); node coordinates in the HTML and the paths must stay in sync.
- Pages that walk through a complete file (Nginx and Workflow examples, Hands on CI/CD workflows, the 部署 chapter) use `<div class="walk">` with the code in the first `<div>` and a `<div class="walk-notes">` holding a `*` list, one item per step written as `* **title**<span class="d">detail</span>`. Give the fence a step spec after the language, for example ```` ```yaml {1-4|5-8|9-10,12} ````, with one `|`-separated group of line ranges per list item, in the same order. `engine.cjs` wraps each line in `span.ln` and stores each step's position. On screen, each revealed item scrolls the code (18 visible rows) to that block, highlights its lines and expands its detail. The theme supports up to 12 steps; add more `nth-child` rules in `workshop.css` if you need them. PDF shows the top of the code with all details.
- Main side-by-side content uses `.cards > .card`: no background, columns separated by light grey vertical lines (`grid-2` also adds a horizontal line between rows). A `.card` outside `.cards` keeps the filled rounded card look; use that only for supplementary asides such as a side note or a link.
- Markdown inside an HTML `<div>` needs blank lines around it, or it renders as raw text.
- `teaching-material/TEACHING_MATERIAL.md` is the source script in Traditional Chinese. Slides are condensed from it, so keep its section order: Preparation → CI → CD → Reverse Proxy → GitHub Actions → Hands on (CI, CD, 部署).
- `teaching-material/images/` holds the screenshots. They are numbered in the order they appear in the material. Reference them from `slides.md` as `teaching-material/images/<name>.png`, and do not copy them elsewhere.
- `.marprc.yml` enables `html: true` (inline HTML is allowed in slides), `allowLocalFiles: true` (needed for local images in PDF output), `themeSet: themes` and `engine: ./engine.cjs`.
- `engine.cjs` is a Marp plugin that injects a chapter drawer (`nav.chapter-drawer`, 216px on the left, no background or border) into every slide; slides that have it get `padding-left: 288px`, so content is about 1216px wide. Chapters come from the `header` directive: consecutive slides with the same header form one chapter, and slides with an empty header (cover, Q&A) get no drawer. The drawer shares the slide background and is separated from content only by spacing. It shows three chapters with the current one centered and highlighted, and scrolls up on the first page of a new chapter. A header like `CI · Continuous Integration` is shown as `CI` with the rest on the small line. Start a new chapter by setting `<!-- header: ... -->`; do not hand-write the drawer.
- The material's Mermaid diagrams are redrawn as timelines in the slides; Marp does not render Mermaid.
- To check layout, render PNGs (`npx marp slides.md --images png`, needs Chrome; set `CHROME_PATH` if it is not found) and look for overflow at the bottom and right edges. PNG export can catch timelines mid-animation, so check animated slides in a browser after they finish.
