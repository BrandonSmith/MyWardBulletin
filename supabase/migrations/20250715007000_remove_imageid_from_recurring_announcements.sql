-- Remove imageId field from recurring_announcements table
ALTER TABLE recurring_announcements 
DROP COLUMN IF EXISTS imageId; 