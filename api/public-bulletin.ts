import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  const { profileSlug } = req.query;
  if (!profileSlug) {
    res.status(400).json({ error: 'Missing profileSlug' });
    return;
  }
  // Get the user by profile_slug
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, active_bulletin_id')
    .eq('profile_slug', profileSlug)
    .single();
  if (userError || !userData) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  let bulletinId = userData.active_bulletin_id;
  if (!bulletinId) {
    const { data: latestBulletin, error: latestError } = await supabase
      .from('bulletins')
      .select('id')
      .eq('created_by', userData.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestError || !latestBulletin) {
      res.status(404).json({ error: 'No bulletins found' });
      return;
    }
    bulletinId = latestBulletin.id;
  }
  const { data, error } = await supabase
    .from('bulletins')
    .select('*')
    .eq('id', bulletinId)
    .single();
  if (error || !data) {
    res.status(404).json({ error: 'Bulletin not found' });
    return;
  }
  res.status(200).json(data);
} 