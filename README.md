# FinReg

**Benchmarking AI on regulatory accuracy.**

FinReg tests whether AI systems can answer questions on EU and French
financial regulation — SFDR, MiFID II, market abuse and issuer obligations,
DORA and AML/CFT — and checks every answer against the primary legal text.

## Why

An assistant that cites an article which does not exist is unusable in
compliance: its answer cannot be checked, relied on, or filed. FinReg therefore
treats a citation to a non-existent or inapplicable source as a failure
distinct from an error of substance, and measures it separately.

Every item in the corpus carries the whole chain:

```
Question  →  What the law says  →  Source  →  Verification  →  Model answer
 (closed)    (drafted from the    (act,       (citation       (scored on
              text itself)         article,    checked, or     four axes)
                                   date, link) flagged)
```

## Status of the published dataset

The corpus, expected answers, cited sources and verification statuses are real.
**The scores are not a measurement.** The five systems, "Model A" to "Model E",
are archetypes, and their answers were written by hand to illustrate what each
axis of the rubric measures. No commercial model is named, scored or ranked.

Two mechanisms hold that distinction, rather than a good intention:

- `public/data/results.json` carries a `statut` field. While it reads
  `echantillon_demonstration`, a banner appears at the top of **every** page.
  It will disappear the day a measured run replaces the sample, and not before.
- No aggregate is typed by hand. Regulatory accuracy, invented-source rate,
  declined rate, and scores by regulation and by axis are all recomputed from
  the item-level answers, and a test verifies it on every run.

Likewise, an item whose citation could not be tied to a specific article stays
published with the status "under review" and the exact reason. It is never
promoted to verified.

## Architecture

[TanStack Start](https://tanstack.com/start) (React 19, Vite, Tailwind v4), no
backend. Pages read two static files served from `public/data/`.

```
scripts/corpus-source.json         questions, legal sources, verification status
scripts/reponses-echantillon.json  sample model answers and error analyses
        │
        └── scripts/construire-donnees.mjs   (bun run donnees)
                    │
                    ├── public/data/questions.json
                    └── public/data/results.json
```

The two files in `scripts/` are the authoring sources — that is where the
corpus is edited. The files in `public/data/` are generated: editing them by
hand has no effect on the next build and breaks the integrity tests.

### Pages

| Route                 | Role                                                              |
| --------------------- | ----------------------------------------------------------------- |
| `/`                   | The hook, the headline risk figure, one error in full, the results |
| `/questions`          | The corpus, filterable by regulation, type, difficulty and status  |
| `/question/$id`       | One item end to end — the most important page in the product       |
| `/model/$id`          | One system: scores by regulation and axis, failures quoted in full |
| `/methodology`        | What is tested, the rubric, verification, limits, system prompt    |
| `/private-benchmark`  | Private corpus — described as coming next, not as operational      |

## Development

```bash
bun install
bun run dev          # development server
bun run donnees      # regenerate public/data from scripts/
bun run verifier     # typecheck + lint + tests + build
```

Individual commands: `typecheck`, `lint`, `test`, `test:watch`, `build`,
`format`.

### Editing the corpus

1. Edit `scripts/corpus-source.json` (question, source, verification status)
   and `scripts/reponses-echantillon.json` (answers, scored 0-2 on four axes,
   plus an analysis for any serious defect).
2. `bun run donnees`
3. `bun run test` — the integrity checks reject, among other things: a source
   outside EUR-Lex or Légifrance, an EUR-Lex link that is not the English
   version, an appraisal copied from one item to another, an aggregate that
   does not recompute, a run date in the future, a serious defect with no
   explanation attached, and a sample that would name a real vendor.

## Deployment

The build produces a Nitro application targeting Cloudflare Workers
(`.output/`, generated `wrangler.json`). The project is connected to
[Lovable](https://lovable.dev): commits pushed to the connected branch sync
back to the editor.

No secrets, no API keys, no environment variables, no endpoints — the site is
entirely static.

## Disclaimer

FinReg publishes measurements, not advice. Neither the benchmark nor the
expected answers constitute legal advice. The verification check covers the
existence and relevance of the citation, not how the rule applies to a
particular set of facts.
