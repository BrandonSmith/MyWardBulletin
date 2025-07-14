import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a conditional Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null
}
// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: string
          profile_slug: string | null
          active_bulletin_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          profile_slug?: string | null
          active_bulletin_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          profile_slug?: string | null
          active_bulletin_id?: string | null
          created_at?: string
        }
      }
      bulletins: {
        Row: {
          id: string
          slug: string
          meeting_date: string
          meeting_type: string
          view_permission: string
          created_by: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          meeting_date: string
          meeting_type: string
          view_permission?: string
          created_by?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          meeting_date?: string
          meeting_type?: string
          view_permission?: string
          created_by?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
      tokens: {
        Row: {
          id: string
          key: string
          value: string
          visibility: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          visibility?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          visibility?: string
          created_by?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Helper function to generate slug from user and date
function generateUniqueBulletinSlug(userId: string, date: string): string {
  const userSlug = userId.substring(0, 8); // Use first 8 chars of user ID
  const dateSlug = date.replace(/\//g, '-');
  const timestamp = Date.now();
  return `${userSlug}-${dateSlug}-${timestamp}`;
}

// Helper function to get user's profile_slug
async function getUserProfileSlug(userId: string): Promise<string | null> {
  if (!supabase) throw new Error('Supabase not configured');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('profile_slug')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile_slug:', error);
      return null;
    }
    return data?.profile_slug || null;
  } catch (error) {
    console.error('Error in getUserProfileSlug:', error);
    return null;
  }
}

// Token service functions
export const tokenService = {
  async saveToken(userId: string, key: string, value: string) {
    if (!supabase) throw new Error('Supabase not configured');

    console.log('Saving token:', { userId, key, valueLength: value.length });

    const { data, error } = await supabase
      .from('tokens')
      .upsert({
        key,
        value,
        created_by: userId
      }, {
        onConflict: 'key,created_by'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Token save error:', error);
      throw error;
    }
    console.log('Successfully saved token:', key);
    return data;
  },

  async getToken(userId: string, key: string): Promise<string | null> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('tokens')
      .select('value')
      .eq('key', key)
      .eq('created_by', userId)
      .single();
    
    if (error) return null;
    return data?.value || null;
  }
};

// User service functions
export const userService = {
  async checkProfileSlugAvailability(profileSlug: string, currentUserId?: string): Promise<boolean> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('profile_slug', profileSlug)
      .maybeSingle();
    
    if (error) throw error;
    
    // If no user found with this slug, it's available
    if (!data) return true;
    
    // If a user is found but it's the current user, it's available for them
    if (currentUserId && data.id === currentUserId) return true;
    
    // Otherwise, it's taken by another user
    return false;
  },

  async updateProfileSlug(userId: string, profileSlug: string) {
    if (!supabase) throw new Error('Supabase not configured');


    // Validate profile slug format (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(profileSlug)) {
      throw new Error('Profile slug can only contain letters, numbers, hyphens, and underscores');
    }

    // Check if the profile slug is available
    const isAvailable = await this.checkProfileSlugAvailability(profileSlug, userId);
    if (!isAvailable) {
      throw new Error('This profile slug is already taken. Please choose another.');
    }

    const { error } = await supabase
      .from('users')
      .update({ profile_slug: profileSlug })
      .eq('id', userId);
    
    if (error) throw error;
  },

  async getUserProfile(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('users')
      .select('email, profile_slug, role, active_bulletin_id, default_ward_name, default_presiding, default_music_director, default_organist')
      .eq('id', userId);
    if (error) throw error;
    return data;
  },

  async updateUserDefault(userId: string, field: 'default_ward_name' | 'default_presiding' | 'default_music_director' | 'default_organist', value: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('users')
      .update({ [field]: value })
      .eq('id', userId);
    if (error) throw error;
  },

  async updateActiveBulletinId(userId: string, bulletinId: string | null) {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('users')
      .update({ active_bulletin_id: bulletinId })
      .eq('id', userId);
    
    if (error) throw error;
  }
};

// Bulletin service functions
export const bulletinService = {
  async saveBulletin(bulletinData: any, userId: string, bulletinId?: string) {
    if (!supabase) throw new Error('Supabase not configured');

    console.log('Starting saveBulletin with:', { userId, bulletinId, bulletinData });

    let slug: string;
    
    if (bulletinId) {
      // For existing bulletins, fetch the current slug to preserve it
      try {
        console.log('Fetching existing bulletin slug for ID:', bulletinId);
        const { data: existingBulletin, error } = await supabase
          .from('bulletins')
          .select('slug')
          .eq('id', bulletinId)
          .eq('created_by', userId)
          .single();
        
        if (error) {
          console.error('Error fetching existing bulletin:', error);
          throw error;
        }
        slug = existingBulletin.slug;
        console.log('Found existing slug:', slug);
      } catch (error) {
        // If we can't fetch the existing bulletin, generate a new slug
        console.warn('Could not fetch existing bulletin slug, generating new one:', error);
        slug = generateUniqueBulletinSlug(userId, bulletinData.date);
      }
    } else {
      // For new bulletins, generate a unique slug
      slug = generateUniqueBulletinSlug(userId, bulletinData.date);
      console.log('Generated new slug:', slug);
    }

    // Prepare bulletin data for local storage fallback
    const bulletinRecord = {
      id: bulletinId || `bulletin-${Date.now()}`,
      slug,
      meeting_date: bulletinData.date,
      meeting_type: bulletinData.meetingType,
      created_by: userId,
      created_at: new Date().toISOString(),
      // Include all bulletin data
      ward_name: bulletinData.wardName,
      theme: bulletinData.theme || '',
      bishopric_message: bulletinData.bishopricMessage || '',
      announcements: bulletinData.announcements || [],
      meetings: bulletinData.meetings || [],
      special_events: bulletinData.specialEvents || [],
      speakers: bulletinData.speakers || [],
      prayers: bulletinData.prayers || {},
      music_program: bulletinData.musicProgram || {},
      leadership: bulletinData.leadership || {}
    };

    console.log('Prepared bulletin record:', bulletinRecord);

    // Try to store bulletin data as tokens, but catch any RLS errors
    try {
      console.log('Saving tokens for bulletin...');
      await Promise.all([
        tokenService.saveToken(userId, `bulletin-${slug}-ward_name`, bulletinData.wardName || ''),
        tokenService.saveToken(userId, `bulletin-${slug}-theme`, bulletinData.theme || ''),
        tokenService.saveToken(userId, `bulletin-${slug}-bishopric`, bulletinData.bishopricMessage || ''),
        tokenService.saveToken(userId, `bulletin-${slug}-announcements`, JSON.stringify(bulletinData.announcements || [])),
        tokenService.saveToken(userId, `bulletin-${slug}-meetings`, JSON.stringify(bulletinData.meetings || [])),
        tokenService.saveToken(userId, `bulletin-${slug}-events`, JSON.stringify(bulletinData.specialEvents || [])),
        tokenService.saveToken(userId, `bulletin-${slug}-speakers`, JSON.stringify(bulletinData.speakers || [])),
        tokenService.saveToken(userId, `bulletin-${slug}-prayers`, JSON.stringify(bulletinData.prayers || {})),
        tokenService.saveToken(userId, `bulletin-${slug}-music`, JSON.stringify(bulletinData.musicProgram || {})),
        tokenService.saveToken(userId, `bulletin-${slug}-leadership`, JSON.stringify(bulletinData.leadership || {}))
      ]);
      console.log('Successfully saved all tokens');
    } catch (tokenError: any) {
      console.error('Error saving tokens:', tokenError);
      if (tokenError.message.includes('infinite recursion')) {
        // Skip token storage if RLS recursion occurs
        console.warn('Skipping token storage due to RLS recursion');
      } else {
        console.warn('Token storage failed, continuing with bulletin save:', tokenError.message);
        // Don't throw here - continue with bulletin save even if tokens fail
      }
    }


    const dbBulletinRecord = {
      slug,
      meeting_date: bulletinData.date,
      meeting_type: bulletinData.meetingType,
      created_by: userId
    };

    console.log('Saving bulletin to database:', dbBulletinRecord);

    try {
      if (bulletinId) {
        // Update existing bulletin
        console.log('Updating existing bulletin with ID:', bulletinId);
        const { data, error } = await supabase
          .from('bulletins')
          .update(dbBulletinRecord)
          .eq('id', bulletinId)
          .eq('created_by', userId)
          .select()
          .single();
        
        if (error) {
          console.error('Database update error:', error);
          if (error.message.includes('infinite recursion')) {
            // Store in local storage if database fails
            console.log('Falling back to local storage due to recursion');
            this.saveToLocalStorage(bulletinRecord);
            return bulletinRecord;
          }
          throw error;
        }
        console.log('Successfully updated bulletin in database:', data);
        // Also save to local storage as backup
        this.saveToLocalStorage({ ...bulletinRecord, id: data.id });
        return data;
      } else {
        // Create new bulletin
        console.log('Creating new bulletin');
        const { data, error } = await supabase
          .from('bulletins')
          .insert(dbBulletinRecord)
          .select()
          .single();
        
        if (error) {
          console.error('Database insert error:', error);
          if (error.message.includes('infinite recursion')) {
            // Store in local storage if database fails
            console.log('Falling back to local storage due to recursion');
            this.saveToLocalStorage(bulletinRecord);
            return bulletinRecord;
          }
          throw error;
        }
        console.log('Successfully created bulletin in database:', data);
        // Also save to local storage as backup
        this.saveToLocalStorage({ ...bulletinRecord, id: data.id });
        return data;
      }
    } catch (bulletinError: any) {
      console.error('Bulletin save error:', bulletinError);
      if (bulletinError.message.includes('infinite recursion')) {
        // Store in local storage if database fails
        console.log('Falling back to local storage due to recursion');
        this.saveToLocalStorage(bulletinRecord);
        return bulletinRecord;
      }
      throw bulletinError;
    }
  },

  saveToLocalStorage(bulletin: any) {
    try {
      const existingBulletins = this.getFromLocalStorage();
      console.log('Saving bulletin to local storage:', bulletin);
      console.log('Existing bulletins:', existingBulletins);
      const updatedBulletins = existingBulletins.filter(b => b.id !== bulletin.id);
      updatedBulletins.push(bulletin);
      console.log('Updated bulletins array:', updatedBulletins);
      localStorage.setItem('zionboard_bulletins', JSON.stringify(updatedBulletins));
      console.log('Successfully saved to localStorage');
    } catch (error) {
      console.warn('Failed to save to local storage:', error);
    }
  },

  getFromLocalStorage(): any[] {
    try {
      const stored = localStorage.getItem('zionboard_bulletins');
      console.log('Raw local storage data:', stored);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to read from local storage:', error);
      return [];
    }
  },
  async getUserBulletins(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');

    // Always try to get bulletins from local storage first
    const localBulletins = this.getFromLocalStorage().filter(b => b.created_by === userId);
    console.log('Local bulletins for user:', userId, localBulletins);
    try {
      const { data, error } = await supabase
        .from('bulletins')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.message.includes('infinite recursion')) {
          // Return empty array if RLS recursion occurs
          console.warn('Skipping bulletin retrieval due to RLS recursion');
          return [];
        }
        throw error;
      }
      
      // Fetch bulletin data from tokens for each bulletin
      const bulletinsWithData = await Promise.all(
        data.map(async (bulletin) => {
          try {
            const [wardName, theme, bishopric, announcements, meetings, events, speakers, prayers, music, leadership] = await Promise.all([
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-ward_name`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-theme`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-bishopric`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-announcements`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-meetings`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-events`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-speakers`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-prayers`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-music`),
              tokenService.getToken(userId, `bulletin-${bulletin.slug}-leadership`)
            ]);

            return {
              id: bulletin.id,
              user_id: bulletin.created_by,
              ward_name: wardName || '',
              date: bulletin.meeting_date,
              meeting_type: bulletin.meeting_type,
              theme: theme || '',
              bishopric_message: bishopric || '',
              announcements: announcements ? JSON.parse(announcements) : [],
              meetings: meetings ? JSON.parse(meetings) : [],
              special_events: events ? JSON.parse(events) : [],
              speakers: speakers ? JSON.parse(speakers) : [],
              prayers: prayers ? JSON.parse(prayers) : {},
              music_program: music ? JSON.parse(music) : {},
              leadership: leadership ? JSON.parse(leadership) : {},
              created_at: bulletin.created_at,
              updated_at: bulletin.created_at
            };
          } catch (tokenError: any) {
            // If token retrieval fails, return bulletin with minimal data
            return {
              id: bulletin.id,
              user_id: bulletin.created_by,
              ward_name: '',
              date: bulletin.meeting_date,
              meeting_type: bulletin.meeting_type,
              theme: '',
              bishopric_message: '',
              announcements: [],
              meetings: [],
              special_events: [],
              speakers: [],
              prayers: {},
              music_program: {},
              leadership: {},
              created_at: bulletin.created_at,
              updated_at: bulletin.created_at
            };
          }
        })
      );
      
      // Merge database bulletins with local storage bulletins (prefer database)
      const dbBulletinIds = new Set(bulletinsWithData.map(b => b.id));
      const uniqueLocalBulletins = localBulletins.filter(b => !dbBulletinIds.has(b.id));
      
      return [...bulletinsWithData, ...uniqueLocalBulletins];
    } catch (error: any) {
      console.error('Error fetching bulletins from database:', error);
      console.log('Returning local bulletins only due to database error');
      return localBulletins;
    }
  },

  async getBulletinById(bulletinId: string) {
    if (!supabase) throw new Error('Supabase not configured');

    // Try local storage first
    const localBulletins = this.getFromLocalStorage();
    const localBulletin = localBulletins.find(b => b.id === bulletinId);
    if (localBulletin) {
      return localBulletin;
    }
    const { data, error } = await supabase
      .from('bulletins')
      .select('*')
      .eq('id', bulletinId)
      .single();
    
    if (error) throw error;
    
    // Get user ID to fetch tokens
    const userId = data.created_by;
    
    // Fetch bulletin data from tokens
    const [wardName, theme, image, bishopric, announcements, meetings, events, speakers, prayers, music, leadership] = await Promise.all([
      tokenService.getToken(userId, `bulletin-${data.slug}-ward_name`),
      tokenService.getToken(userId, `bulletin-${data.slug}-theme`),
      tokenService.getToken(userId, `bulletin-${data.slug}-image`),
      tokenService.getToken(userId, `bulletin-${data.slug}-bishopric`),
      tokenService.getToken(userId, `bulletin-${data.slug}-announcements`),
      tokenService.getToken(userId, `bulletin-${data.slug}-meetings`),
      tokenService.getToken(userId, `bulletin-${data.slug}-events`),
      tokenService.getToken(userId, `bulletin-${data.slug}-speakers`),
      tokenService.getToken(userId, `bulletin-${data.slug}-prayers`),
      tokenService.getToken(userId, `bulletin-${data.slug}-music`),
      tokenService.getToken(userId, `bulletin-${data.slug}-leadership`)
    ]);

    return {
      id: data.id,
      user_id: data.created_by,
      ward_name: wardName || '',
      date: data.meeting_date,
      meeting_type: data.meeting_type,
      theme: theme || '',
      bishopric_message: bishopric || '',
      announcements: announcements ? JSON.parse(announcements) : [],
      meetings: meetings ? JSON.parse(meetings) : [],
      special_events: events ? JSON.parse(events) : [],
      speakers: speakers ? JSON.parse(speakers) : [],
      prayers: prayers ? JSON.parse(prayers) : {},
      music_program: music ? JSON.parse(music) : {},
      leadership: leadership ? JSON.parse(leadership) : {},
      created_at: data.created_at,
      updated_at: data.created_at
    };
  },

  async getLatestBulletinByProfileSlug(profileSlug: string) {
    if (!supabase) throw new Error('Supabase not configured');

    // First get the user by profile_slug and their active bulletin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, active_bulletin_id')
      .eq('profile_slug', profileSlug)
      .single();
    
    if (userError) throw userError;
    
    let bulletinId = userData.active_bulletin_id;
    
    // If no active bulletin is set, get their latest bulletin
    if (!bulletinId) {
      const { data: latestBulletin, error: latestError } = await supabase
        .from('bulletins')
        .select('id')
        .eq('created_by', userData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (latestError) throw latestError;
      if (!latestBulletin) return null; // No bulletins found
      
      bulletinId = latestBulletin.id;
    }
    
    // Get the specific bulletin
    const { data, error } = await supabase
      .from('bulletins')
      .select('*')
      .eq('id', bulletinId)
      .single();
    
    if (error) {
      // If bulletin not found, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    // Get user ID to fetch tokens
    const userId = userData.id;
    
    // Fetch bulletin data from tokens
    const [wardName, theme, image, bishopric, announcements, meetings, events, speakers, prayers, music, leadership] = await Promise.all([
      tokenService.getToken(userId, `bulletin-${data.slug}-ward_name`),
      tokenService.getToken(userId, `bulletin-${data.slug}-theme`),
      tokenService.getToken(userId, `bulletin-${data.slug}-image`),
      tokenService.getToken(userId, `bulletin-${data.slug}-bishopric`),
      tokenService.getToken(userId, `bulletin-${data.slug}-announcements`),
      tokenService.getToken(userId, `bulletin-${data.slug}-meetings`),
      tokenService.getToken(userId, `bulletin-${data.slug}-events`),
      tokenService.getToken(userId, `bulletin-${data.slug}-speakers`),
      tokenService.getToken(userId, `bulletin-${data.slug}-prayers`),
      tokenService.getToken(userId, `bulletin-${data.slug}-music`),
      tokenService.getToken(userId, `bulletin-${data.slug}-leadership`)
    ]);

    return {
      id: data.id,
      user_id: data.created_by,
      profile_slug: data.profile_slug,
      ward_name: wardName || '',
      date: data.meeting_date,
      meeting_type: data.meeting_type,
      theme: theme || '',
      bishopric_message: bishopric || '',
      announcements: announcements ? JSON.parse(announcements) : [],
      meetings: meetings ? JSON.parse(meetings) : [],
      special_events: events ? JSON.parse(events) : [],
      speakers: speakers ? JSON.parse(speakers) : [],
      prayers: prayers ? JSON.parse(prayers) : {},
      music_program: music ? JSON.parse(music) : {},
      leadership: leadership ? JSON.parse(leadership) : {},
      created_at: data.created_at,
      updated_at: data.created_at
    };
  },

  async deleteBulletin(bulletinId: string, userId: string) {
    // Remove from local storage
    try {
      const existingBulletins = this.getFromLocalStorage();
      const updatedBulletins = existingBulletins.filter(b => b.id !== bulletinId);
      localStorage.setItem('zionboard_bulletins', JSON.stringify(updatedBulletins));
    } catch (error) {
      console.warn('Failed to remove from local storage:', error);
    }

    // If bulletinId starts with "bulletin-", it's a local storage only bulletin
    if (bulletinId.startsWith('bulletin-')) {
      // Already removed from local storage above, nothing more to do
      return;
    }

    // For database bulletins, proceed with database deletion
    if (!supabase) throw new Error('Supabase not configured');

    try {
      // Get bulletin info first to clean up tokens
      const bulletin = await supabase
        .from('bulletins')
        .select('slug, created_by')
        .eq('id', bulletinId)
        .eq('created_by', userId)
        .single();
      
      if (bulletin.data) {
        // Delete associated tokens
        await supabase
          .from('tokens')
          .delete()
          .eq('created_by', bulletin.data.created_by)
          .like('key', `bulletin-${bulletin.data.slug}-%`);
      }

      const { error } = await supabase
        .from('bulletins')
        .delete()
        .eq('id', bulletinId)
        .eq('created_by', userId);
      
      if (error) throw error;
    } catch (error: any) {
      // If it's a UUID error, the bulletin might only exist in local storage
      if (error.message && error.message.includes('invalid input syntax for type uuid')) {
        // Already removed from local storage, so this is fine
        return;
      }
      throw error;
    }
  }
};