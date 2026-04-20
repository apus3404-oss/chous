# Chous VS Code Extension

This directory contains the VS Code extension for Chous.

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch

# Package extension
npm run package

# Publish to marketplace
npm run publish
```

## Testing

1. Open this directory in VS Code
2. Press F5 to launch Extension Development Host
3. Test the extension in the new window

## Publishing

1. Create a Personal Access Token on Azure DevOps
2. Login to vsce: `vsce login <publisher>`
3. Publish: `npm run publish`

## Structure

- `src/extension.ts` - Main extension code
- `package.json` - Extension manifest
- `tsconfig.json` - TypeScript configuration
- `README.md` - Extension documentation
