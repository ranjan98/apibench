# Contributing to APIBench

Thanks for considering contributing to APIBench! This guide will help you get started.

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd apibench
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Test locally:
   ```bash
   npm start -- run -u https://jsonplaceholder.typicode.com/posts/1
   ```

## Development Workflow

### Watch Mode

For active development, use watch mode to automatically rebuild on changes:

```bash
npm run dev
```

In another terminal, test your changes:

```bash
npm start -- run -u <test-url>
```

### Testing Changes

Before submitting a PR, test all commands:

```bash
# Test run command
npm start -- run -u https://jsonplaceholder.typicode.com/posts/1 -d 5

# Test with POST
npm start -- run -u https://jsonplaceholder.typicode.com/posts -m POST -b '{"title":"test"}' -d 5

# Test report command (after running a test with -o)
npm start -- run -u https://jsonplaceholder.typicode.com/posts/1 -o test-results.json
npm start -- report -f test-results.json

# Test compare command
npm start -- run -u https://jsonplaceholder.typicode.com/posts/1 -o before.json
npm start -- run -u https://jsonplaceholder.typicode.com/posts/1 -o after.json
npm start -- compare -b before.json -a after.json
```

## Project Structure

```
apibench/
├── src/
│   ├── cli.ts          # CLI entry point, command parsing
│   ├── benchmark.ts    # Core benchmarking logic
│   ├── reporter.ts     # Results formatting and display
│   └── compare.ts      # Comparison functionality
├── examples/           # Example usage scripts
├── dist/              # Compiled JavaScript (generated)
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # Main documentation
```

## Code Style

- Use TypeScript strict mode
- Follow existing code formatting
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

## Adding Features

### New Command

1. Add command definition in `src/cli.ts`
2. Create implementation function
3. Add tests/examples
4. Update README.md with usage

Example:
```typescript
program
  .command('new-command')
  .description('Description of new command')
  .requiredOption('-f, --foo <value>', 'Required parameter')
  .action(async (options) => {
    // Implementation
  });
```

### New Metrics

1. Add metric calculation in `src/benchmark.ts`
2. Update `BenchmarkResults` interface
3. Add display logic in `src/reporter.ts`
4. Update comparison logic in `src/compare.ts`

### New Output Format

1. Add format option to relevant command
2. Implement formatter function
3. Update documentation

## Documentation

When adding features, update:

- README.md - Full documentation
- QUICKSTART.md - If it's a common operation
- examples/ - Add example script if applicable
- Code comments - Explain complex logic

## Commit Messages

Use clear, descriptive commit messages:

```
Add feature to export results as CSV

- Add --csv flag to run command
- Implement CSV formatter
- Update documentation
- Add example script
```

Format:
- First line: Brief summary (50 chars or less)
- Blank line
- Bullet points with details

## Pull Request Process

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

### PR Checklist

- [ ] Code builds without errors (`npm run build`)
- [ ] Tested all affected commands
- [ ] Updated documentation
- [ ] Added examples if applicable
- [ ] Commit messages are clear
- [ ] No unnecessary files committed

## Bug Reports

When reporting bugs, include:

1. **APIBench version**: `apibench --version`
2. **Node version**: `node --version`
3. **Operating System**: macOS/Linux/Windows
4. **Command that failed**: Exact command you ran
5. **Expected behavior**: What should happen
6. **Actual behavior**: What actually happened
7. **Error message**: Full error output

Example:
```
APIBench Version: 1.0.0
Node Version: v18.0.0
OS: macOS 13.0

Command:
apibench run -u https://example.com/api -m POST -b '{"test": true}'

Expected: Benchmark completes successfully
Actual: Error: Invalid JSON in body

Error message:
[paste full error output]
```

## Feature Requests

When requesting features, include:

1. **Use case**: Why do you need this?
2. **Proposed solution**: How should it work?
3. **Alternatives**: Other ways you've tried
4. **Example**: Show how you'd use it

Example:
```
Use Case:
I need to test WebSocket connections, not just HTTP

Proposed Solution:
Add websocket support to benchmark.ts

Example Usage:
apibench run -u ws://example.com -m WS -d 30
```

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on the code, not the person
- Assume good intentions
- Help others learn

## Questions?

- Open an issue for bugs or features
- Start a discussion for questions
- Check existing issues first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
