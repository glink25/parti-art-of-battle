# Project guidance

- Build only this independent game project. Use Parti's public docs, not its runtime internals.
- Preserve module boundaries checked by `pnpm check`; game rules and combat must remain framework-independent and deterministic.
- Update rules/content in `src/content`, not separate copies in the UI or bots.
- All game-resource changes from players and bots go through `applyCommand`.
- Keep automated tests focused on meaningful pure logic. Run `pnpm check`, `pnpm test`, and `pnpm build` for relevant changes. Run simulations/benchmarks when combat, rules or bots change.
- Do not claim actual gameplay, mobile performance or Parti recovery is verified without human device validation. Do not operate a browser unless the user requests it.
- Do not add cross-version room migrations, host migration or distributed execution without a specific request.
- No git commits unless requested.
