# MyWardBulletin

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

The `.env` file is listed in `.gitignore` to keep your credentials private. If you intend to keep the entire project private, ensure your source-control platform (such as GitHub) is configured to make the repository private as well.

## Bulletin Templates

- Use **Save as Template** to store the current bulletin layout locally.
- Choose **New Bulletin** to open the template picker and start from a saved template or a blank bulletin.
- Templates are stored in browser local storage under `mywardbulletin_templates`.
