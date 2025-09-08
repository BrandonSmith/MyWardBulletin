import { supabase } from './supabase';

export interface RecurringAnnouncement {
  id: string;
  profile_slug: string;
  title: string;
  content: string;
  audience: 'ward' | 'relief_society' | 'elders_quorum' | 'youth' | 'primary' | 'stake' | 'other';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Image support
  images?: Array<{ imageId: string; hideImageOnPrint?: boolean }>; // Multiple images support
}

export const recurringAnnouncementsService = {
  // Get all active recurring announcements for a profile
  async getRecurringAnnouncements(profileSlug: string): Promise<RecurringAnnouncement[]> {
    try {
      const { data, error } = await supabase
        .from('recurring_announcements')
        .select('*')
        .eq('profile_slug', profileSlug)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recurring announcements:', error);
      return [];
    }
  },

  // Create a new recurring announcement
  async createRecurringAnnouncement(announcement: Omit<RecurringAnnouncement, 'id' | 'created_at' | 'updated_at'>): Promise<RecurringAnnouncement | null> {
    try {
      console.log('Service: Creating recurring announcement:', announcement);
      
      // Create a safe version with image support
      const safeAnnouncement = {
        profile_slug: announcement.profile_slug,
        title: announcement.title,
        content: announcement.content,
        audience: announcement.audience,
        is_active: announcement.is_active,
        // Include image fields
        ...(announcement.images && { images: announcement.images })
      };
      
      const { data, error } = await supabase
        .from('recurring_announcements')
        .insert(safeAnnouncement)
        .select()
        .single();

      if (error) {
        console.error('Service: Supabase error:', error);
        
        // If it's a column not found error, try without image fields
        if (error.code === 'PGRST204' && error.message.includes('images')) {
          console.log('Service: Retrying without image fields...');
          const basicAnnouncement = {
            profile_slug: announcement.profile_slug,
            title: announcement.title,
            content: announcement.content,
            audience: announcement.audience,
            is_active: announcement.is_active
          };
          
          const { data: retryData, error: retryError } = await supabase
            .from('recurring_announcements')
            .insert(basicAnnouncement)
            .select()
            .single();
            
          if (retryError) {
            console.error('Service: Retry also failed:', retryError);
            throw retryError;
          }
          
          console.log('Service: Created successfully (without images):', retryData);
          return retryData;
        }
        
        throw error;
      }
      
      console.log('Service: Created successfully:', data);
      return data;
    } catch (error) {
      console.error('Service: Error creating recurring announcement:', error);
      return null;
    }
  },

  // Update an existing recurring announcement
  async updateRecurringAnnouncement(id: string, updates: Partial<RecurringAnnouncement>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recurring_announcements')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating recurring announcement:', error);
      return false;
    }
  },

  // Delete a recurring announcement (soft delete by setting is_active to false)
  async deleteRecurringAnnouncement(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recurring_announcements')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting recurring announcement:', error);
      return false;
    }
  },

  // Convert a regular announcement to a recurring one
  async convertToRecurring(announcement: any, profileSlug: string): Promise<RecurringAnnouncement | null> {
    try {
      console.log('Converting announcement to recurring - input:', announcement);
      
      // Convert legacy imageId to images array format
      let images = announcement.images || [];
      if (announcement.imageId && announcement.imageId !== 'none') {
        images = [{
          imageId: announcement.imageId,
          hideImageOnPrint: announcement.hideImageOnPrint || false
        }];
      }

      console.log('Processed images for recurring announcement:', images);

      const recurringAnnouncement = {
        profile_slug: profileSlug,
        title: announcement.title,
        content: announcement.content,
        audience: announcement.audience || 'ward',
        is_active: true,
        // Convert to images array format
        images: images.length > 0 ? images : undefined
      };

      console.log('Creating recurring announcement with data:', recurringAnnouncement);

      return await this.createRecurringAnnouncement(recurringAnnouncement);
    } catch (error) {
      console.error('Error converting announcement to recurring:', error);
      return null;
    }
  },

  // Get recurring announcements that should be added to a new bulletin
  async getAnnouncementsForNewBulletin(profileSlug: string): Promise<Omit<RecurringAnnouncement, 'id' | 'profile_slug' | 'created_at' | 'updated_at'>[]> {
    try {
      const announcements = await this.getRecurringAnnouncements(profileSlug);
      console.log('Retrieved recurring announcements for new bulletin:', announcements);
      
      // Filter and transform for new bulletin, preserving images
      const result = announcements.map(announcement => ({
        title: announcement.title,
        content: announcement.content,
        audience: announcement.audience,
        is_active: announcement.is_active,
        // Preserve image data in images array format
        images: announcement.images
      }));
      
      console.log('Transformed recurring announcements for new bulletin:', result);
      return result;
    } catch (error) {
      console.error('Error getting announcements for new bulletin:', error);
      return [];
    }
  }
}; 