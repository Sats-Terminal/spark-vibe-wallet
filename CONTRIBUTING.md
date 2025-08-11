# Contributing to Spark Wallet Interface

First off, thank you for considering contributing to Spark Wallet Interface! It's people like you that make this project such a great tool for the Bitcoin community.

## Code of Conduct

By participating in this project, you are expected to uphold our values of respect, inclusivity, and collaboration. Please be respectful and considerate in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, browser, Node.js version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Provide specific examples to demonstrate the enhancement**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code follows the existing style
6. Issue that pull request!

## Development Process

1. **Setup your development environment**
   ```bash
   git clone https://github.com/yourusername/spark-wallet.git
   cd spark-wallet
   npm install
   npm run dev
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Add comments where necessary
   - Follow the existing code style
   - Update tests and documentation

4. **Test your changes**
   ```bash
   npm run lint
   npm run build
   npm test # when tests are implemented
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   Follow conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

6. **Push to your fork and submit a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Use meaningful variable and function names
- Add type annotations where necessary
- Prefer `const` over `let` when possible
- Use async/await over promises where appropriate
- Keep functions small and focused

### React Components

- Use functional components with hooks
- Keep components small and reusable
- Use proper prop types
- Extract complex logic into custom hooks
- Follow the existing component structure

### CSS/Styling

- Use Tailwind CSS utility classes
- Keep custom CSS to a minimum
- Maintain responsive design
- Follow the existing color scheme and design patterns

## Project Structure

```
spark-wallet/
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── utils/         # Utility functions and helpers
│   └── styles/        # Global styles
├── public/            # Static assets
├── tests/             # Test files
└── docs/              # Documentation
```

## Testing

- Write unit tests for utility functions
- Write integration tests for critical flows
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments to functions
- Update API documentation for new endpoints
- Include inline comments for complex logic

## Security

- Never commit sensitive data (private keys, mnemonics, etc.)
- Always validate user input
- Be careful with external dependencies
- Report security vulnerabilities privately

## Questions?

Feel free to open an issue with your question or reach out on our Discord server.

Thank you for contributing! 🚀
