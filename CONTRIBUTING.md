# Contributing to MyWardBulletin

Thank you for your interest in contributing to MyWardBulletin! This document provides guidelines for contributors.

## 🎯 How to Contribute

### Types of Contributions
- **Bug Reports**: Report bugs or issues
- **Feature Requests**: Suggest new features
- **Code Contributions**: Submit pull requests
- **Documentation**: Improve docs and examples
- **Testing**: Help with testing and quality assurance

### Before You Start
1. Check existing issues and pull requests
2. Read our [Code of Conduct](CODE_OF_CONDUCT.md)
3. Familiarize yourself with our [Security Guidelines](SECURITY.md)

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Git
- Supabase account

### Local Setup
1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/MyWardBulletin.git
   cd MyWardBulletin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your Supabase project**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings → API to get your URL and anon key
   - Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. **Set up your database**
   ```bash
   npx supabase start
   npx supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── lib/                # Utilities and services
├── types/              # TypeScript type definitions
└── data/               # Static data (hymns, songs)
```

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Key Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🔒 Security

This project implements comprehensive security measures:
- Row Level Security (RLS) policies
- Input validation and sanitization
- Rate limiting
- Security headers
- Environment variable protection

See [SECURITY.md](SECURITY.md) for detailed security documentation.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/MyWardBulletin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/MyWardBulletin/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/MyWardBulletin/wiki)

## 📝 Code Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Testing
- Write tests for new features
- Ensure all tests pass: `npm run test`
- Test in multiple browsers
- Test with different Supabase configurations

### Security
- Never commit sensitive data or credentials
- Follow security best practices
- Validate all user inputs
- Use environment variables for configuration
- Review [SECURITY.md](SECURITY.md) before submitting

## 🔄 Pull Request Process

### Before Submitting
1. **Test thoroughly** - Ensure your changes work correctly
2. **Update documentation** - Update README, comments, etc.
3. **Run linting** - `npm run lint` should pass
4. **Run tests** - `npm run test` should pass
5. **Check security** - Review for security implications

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Security improvement
- [ ] Other (please describe)

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] Security review completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No sensitive data included
```

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Describe the bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Environment**
- OS: [e.g. Windows, macOS, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions.

**Additional context**
Any other context or screenshots.
```

## 📚 Documentation

### Documentation Guidelines
- Keep documentation clear and concise
- Include code examples where helpful
- Update documentation with code changes
- Use proper markdown formatting
- Include screenshots for UI changes

## 🔒 Security

### Security Guidelines
- Never commit API keys or secrets
- Use environment variables for configuration
- Validate and sanitize all inputs
- Follow OWASP security guidelines
- Report security issues privately

### Reporting Security Issues
If you discover a security vulnerability:
1. **DO NOT** create a public issue
2. Email security details to [your-email]
3. Include detailed reproduction steps
4. Allow time for investigation and fix

## 🎉 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- GitHub contributors list
- Community acknowledgments

## 🆘 Getting Help

- **Questions**: Use GitHub Discussions
- **Issues**: Create GitHub Issues
- **Security**: Email directly
- **Community**: Join our community channels

Thank you for contributing to MyWardBulletin! 🎉 