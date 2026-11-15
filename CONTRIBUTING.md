# Contributing to Capital Quiz

Thanks for your interest in contributing! This guide covers everything you need to get a dev environment running.

## Development setup

Prerequisites: **Node.js 20+** and **pnpm 12+** (enable it once with `corepack enable`).

```bash
pnpm install
pnpm start
```

Press `a` for Android, `i` for iOS, or `w` for web. See the [README](README.md) for details and the project structure.

## Commands

| Command | Description |
| --- | --- |
| `pnpm start` | Start the Metro dev server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run the TypeScript compiler |
| `pnpm test` | Run the Jest unit tests |

CI runs all three checks on every pull request.

## Submitting changes

1. Fork the repo and create a branch from `main`.
2. Keep PRs focused — one feature or fix per PR.
3. Make sure lint, typecheck, and tests pass locally.
4. For UI changes, include before/after screenshots.
5. Open a pull request with a clear description of what changed and why.

Good first contributions: adding countries to `src/data/countries.ts`, improving quiz logic, and UI polish.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
