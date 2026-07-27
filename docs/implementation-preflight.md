# BitGora Implementation Preflight

## Inputs

```text
Uploaded archive: bitGora.zip
SHA-256: 501db2ba1b9d616cb172378e107bdda1cbc9b30fd50b714f7cb38f8e2a90f4d3
```

The archive was extracted to an audit staging directory rather than over a repository.

## Historical repository state

```text
Embedded Git branch: main
Embedded Git HEAD: 86d90687d16db03d1362fa75c72a925a72ee28d1
Embedded Git worktree: clean
Remote: https://github.com/princeinoba/bitGora.git
```

The embedded `.git` directory is evidence only and is excluded from the Vercel-ready package.

The connected GitHub repository `princeinoba/bitGora` exists and the authenticated owner has administrative/push permission. No GitHub write or Vercel deployment was performed during this audit.

## Baseline decision

The old full-stack application was not used as a code baseline because its product boundary depends on:

- public accounts;
- database sessions;
- Cloudinary uploads;
- unauthenticated/under-authorized messaging;
- public listing mutation;
- persistent MongoDB;
- persistent Socket.IO server;
- Heroku-era deployment assumptions.

A clean-room implementation was selected.

The original product proposition was preserved:

```text
goods described and priced in Bitcoin
+
market discovery
+
buyer/seller exchange planning
```

Unsafe operating assumptions were removed.

## Historical assets

The supplied PNG files were not valid PNG byte streams after extraction. The repository-wide text/eol attribute appears to have altered binary signatures.

The historical PNG screenshots and CRA icons were not reused.

The historical SVG BitGora marks were reviewed as evidence only. The rebuilt release uses a new text/Bitcoin mark and new local product artwork.

## Attribution boundary

Historical `package.json` credited Angelica Mapeso and Ziyong He. The README claimed MIT and linked a missing `LICENSE`.

No historical application code or corrupted raster asset was copied into the clean-room implementation.

See `NOTICE.md`.

## Release target

```text
Product: BitGora Market Lab
Mode: non-custodial portfolio demonstration
Framework: Other/static
Node: 24.x
Output: dist
Vercel Functions: two GET-only entrypoints
External npm dependencies: zero
Environment secrets: none
```

## Current execution evidence — 2026-07-26

All seven supplied artifacts matched the owner-provided SHA-256 values:

```text
Original archive: 501db2ba1b9d616cb172378e107bdda1cbc9b30fd50b714f7cb38f8e2a90f4d3
Clean-room source: fc6be2523b94d84d874ca0ce7076dcfddadc58b6ec0ac829fbb97d3645a40b06
Audit: 211ca74165dd9c74f84762b9da92de4b76492ae4600b2764004e4b31fad2ac48
Architecture: 584dcdc4b809ac4ff6bbaf008a6eaf7255e20bac6a9860f94f50539cbe60fe51
Verification: 58a9511d0b05f813453ef3ea6062c99cfd2ad4e6b340e4955835b7349ba58d6e
Owner decisions: 80b427a8584689b48adc0ea46a35169e42cfd6f5aa338244c3d787f6ae61427f
Delivery checksums: 9bf0e6cc1954de3832df4460a5d1516aba4b5f13eb78823306a6a97cbe10a9c4
```

The actual repository root is `C:\Users\royce\OneDrive\Documents\bitGora`.
It began clean on `main` at `86d90687d16db03d1362fa75c72a925a72ee28d1`.
A path-and-hash comparison with the extracted historical archive, excluding
`.git`, found zero differences, so no newer owner-authored work required
porting. The release branch is `codex/bitgora-vercel-ready-rebuild`.

Toolchain and authentication:

```text
Node: v24.18.0
npm: 10.2.4
GitHub CLI: 2.96.0, authenticated as princeinoba
Vercel CLI: 57.0.0, authenticated as princeinoba
Vercel team: princeinobas-projects
Vercel team ID: team_6XysuVUoUycidhB9t3F3wBcy
```

The Vercel team inventory was rechecked before mutation. No project named
`bitgora` existed. Exactly one may be created after source and clean-room gates
pass. The checksum-verified source contained no embedded `.git`; the historical
`.git` was never copied. The legacy React/CRA, Express, MongoDB/Mongoose,
Passport/session, Socket.IO, Cloudinary/upload, Coindesk, Travis and Heroku-era
runtime files were removed while the real repository history was preserved.