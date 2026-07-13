# Roadmap standard v1

This directory preserves the single-file Koneko roadmap standard that existed immediately before the modularization merged in `CatOfJupit3r/koneko` pull request #181.

## Provenance

- Source repository: `CatOfJupit3r/koneko`
- Source ref: `d3b040d4e3d7dbcf7f5e1eae01fd1120e4b7e873`
- Source path: `docs/roadmaps/standard.md`
- Modernization PR: `#181` (`Add budget-aware agent workflow and modular roadmap standard`)

## Layout

The installable template lives under `template/` and preserves the original repository path:

```text
template/
  docs/
    roadmaps/
      standard.md
```

`manifest.json` records the Git blob checksum of every installable file. The bootstrap CLI validates the bundled template and the installed repository copy against that checksum.
