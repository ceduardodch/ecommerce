# Graphify

Graphify builds a local knowledge graph for the ecommerce codebase. Use it to inspect architecture, trace file relationships, and ask questions about the repo without rereading every handoff document.

## Commands

```bash
npm run graphify:build
npm run graphify:build:full
npm run graphify:update
npm run graphify:query -- "How does the WhatsApp CRM flow work?"
npm run graphify:diagnose
```

`graphify:build` is the deterministic code-only build. `graphify:build:full`
also extracts docs/images through a configured LLM backend, so use it only when
the required provider environment is intentionally available.

## Outputs

Generated files live in `graphify-out/`:

- `graph.html`: interactive graph.
- `GRAPH_REPORT.md`: readable audit report with god nodes, surprising connections, and suggested questions.
- `graph.json`: raw graph data for tools/GraphRAG.
- `cost.json`: cumulative extraction token accounting.
- `manifest.json`: incremental update manifest.

Temporary extraction files under `graphify-out/` are ignored by Git.
The build and update commands regenerate `graph.html`; no separate export step
is required.

## Current Scope

The initial project graph focuses on code and documentation. Product images and videos are intentionally left out of the first pass because they require separate vision/transcription extraction and are less useful for architecture tracing.
