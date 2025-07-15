-- Add default_ward_leadership and default_missionaries to users
ALTER TABLE users
ADD COLUMN default_ward_leadership jsonb NULL,
ADD COLUMN default_missionaries jsonb NULL; 