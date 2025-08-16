# MyWardBulletin

A modern, customizable bulletin creation tool for LDS wards and branches.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works great!)

### Local Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings → API to get your URL and anon key
   - Replace the hardcoded values in `src/lib/supabase.ts` and `api/public-bulletin.ts` with your actual credentials:
   ```typescript
   // In src/lib/supabase.ts
   const supabaseUrl = 'https://your-project.supabase.co'
   const supabaseAnonKey = 'your-anon-key'
   
   // In api/public-bulletin.ts
   const supabaseUrl = 'https://your-project.supabase.co';
   const supabaseAnonKey = 'your-anon-key';
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
