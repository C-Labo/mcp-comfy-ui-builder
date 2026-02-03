# Contributing to mcp-comfy-ui-builder

Thanks for your interest in contributing.

## Setup

```bash
git clone https://github.com/MIt9/mcp-comfy-ui-builder.git
cd mcp-comfy-ui-builder
npm install
```

## Before submitting

- Run tests: `npm test`
- Build: `npm run build`
- No env vars required for seed or MCP

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Make your changes; keep commits focused.
3. Ensure `npm test` and `npm run build` pass.
4. Open a PR with a short description of the change.
5. CI will run tests and build on push.

## Documentation

- [doc/README.md](doc/README.md) — documentation entry point
- [doc/QUICK-REFERENCE.md](doc/QUICK-REFERENCE.md) — commands and examples
- [ROADMAP.md](ROADMAP.md) — planned features

## Distribution (maintainers)

- **npm:** `npm publish` (after `npm run build`). Package has `mcpName` and `server.json` for MCP Registry.
- **MCP Registry:** To list the server in the [MCP Registry](https://modelcontextprotocol.io/registry/about), install [mcp-publisher](https://modelcontextprotocol.io/registry/quickstart), run `mcp-publisher login github`, then `mcp-publisher publish` after releasing a version. Keep `server.json` version in sync with `package.json`.
- **GitHub:** Consider adding repo topics: `mcp`, `comfyui`, `cursor`, `claude`, `workflow`, `image-generation`, `model-context-protocol` (Settings → General → Topics).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
