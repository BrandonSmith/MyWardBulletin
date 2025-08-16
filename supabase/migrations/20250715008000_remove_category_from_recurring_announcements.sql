-- Remove category field from recurring_announcements table
ALTER TABLE recurring_announcements
DROP COLUMN IF EXISTS category; 