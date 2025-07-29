import { createClient } from '@supabase/supabase-js';
import { defaultRateLimiter } from './rate-limit';
import { securityMonitor, validateProfileSlug } from '../src/lib/security';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not configured');
}

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

export default async function handler(req, res) {
  if (!supabase) {
    return res.status(500).json({ error: 'Service unavailable' });
  }
  
  // Security: Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  if (!defaultRateLimiter(clientIP as string)) {
    securityMonitor.logRateLimitExceeded(clientIP as string);
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  // Security: Add input validation
  const { profileSlug } = req.query;
  if (!profileSlug || typeof profileSlug !== 'string') {
    securityMonitor.logInputValidationFailure(profileSlug as string, { reason: 'missing_or_invalid_type' });
    return res.status(400).json({ error: 'Invalid profile slug' });
  }
  
  // Security: Validate profile slug format
  if (!validateProfileSlug(profileSlug)) {
    securityMonitor.logInputValidationFailure(profileSlug, { reason: 'invalid_format' });
    return res.status(400).json({ error: 'Invalid profile slug format' });
  }
  
  // Security: Add rate limiting headers
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  // Get the user by profile_slug
  const { data: userData, error: userError } = await withTimeout(
    supabase
      .from('users')
      .select('id, active_bulletin_id')
      .eq('profile_slug', profileSlug)
      .single()
  );
  try {
    if (userError || !userData) {
      return res.status(404).json({ error: 'Bulletin not found' });
    }
    
    let bulletinId = userData.active_bulletin_id;
    if (!bulletinId) {
      const { data: latestBulletin, error: latestError } = await withTimeout(
        supabase
          .from('bulletins')
          .select('id')
          .eq('created_by', userData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      );
      if (latestError || !latestBulletin) {
        return res.status(404).json({ error: 'Bulletin not found' });
      }
      bulletinId = latestBulletin.id;
    }
    
    const { data, error } = await withTimeout(
      supabase
        .from('bulletins')
        .select('*')
        .eq('id', bulletinId)
        .single()
    );
    
    if (error || !data) {
      return res.status(404).json({ error: 'Bulletin not found' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 