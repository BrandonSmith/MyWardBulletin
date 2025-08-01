# MyWardBulletin

A modern, customizable bulletin creation tool for LDS wards and branches.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works great!)

### Local Development Setup

1. **Clone the repository**
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

## 📋 Environment Configuration

This project uses environment variables to configure Supabase credentials. To connect the application to your own Supabase project:

1. Copy `.env.example` to `.env` in the project root.
2. Edit the new `.env` file and replace the placeholder values with your Supabase URL and anon key.
   Both `VITE_SUPABASE_*` variables are required for the Vite build, and the `SUPABASE_*` aliases are used by serverless functions.

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

3. Restart your development server or redeploy the site so the new variables take effect.

In addition to the Supabase credentials, you can configure the domain names used when generating share links and QR codes. Add the following variables to your `.env` file if you want to override the defaults:

```
VITE_FULL_DOMAIN=mywardbulletin.com
VITE_SHORT_DOMAIN=mwbltn.com
```

The `.env` file is listed in `.gitignore` to keep your credentials private. If you intend to keep the entire project private, ensure your source-control platform (such as GitHub) is configured to make the repository private as well.

## 📝 Bulletin Templates

- Use **Save as Template** to store the current bulletin layout locally.
- Choose **New Bulletin** to open the template picker and start from a saved template or a blank bulletin.
- Templates are saved securely for your account and can be accessed from any device where you sign in.
