# Contributing to Tutorials and Demos

## Useful Commands

### Update Dependencies

The following commands work across all packages

- `pnpm -r outdated`
- `pnpm -r update` (or `pnpm -r --latest update`)

To perform any of these items on a _single_ package, use `--filter` instead of `-r`. For example: `pnpm --filter ./auth-connect/getting-started outdated`.

### Add Dependencies

Typically, a dependency is required within a single project at a time. As such, the most common way to add a dependency is to use `pnpm --filter <project> add <dependency>`. For example: `pnpm --filter auth-connect/getting-started add @capacitor/foo`.

### Running `ionic` or `npx cap` Commands

The best way to run these are to `cd` into the package and run them from that package's root. For example:

```bash
pnpm build
cd auth-connect/getting-started
npx cap open ios
```
