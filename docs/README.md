# Chous Documentation

Official documentation for Chous - The World's First Dedicated File Structure Linter.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## Structure

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress configuration
├── guide/                 # User guides
├── config/                # Configuration reference
├── presets/               # Preset documentation
├── plugins/               # Plugin documentation
├── examples/              # Example configurations
└── index.md               # Home page
```

## Contributing

To contribute to the documentation:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## Deployment

The documentation is automatically deployed to GitHub Pages on every push to the main branch.

## License

MIT
