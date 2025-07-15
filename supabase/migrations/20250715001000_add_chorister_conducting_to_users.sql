-- Add default_chorister and default_conducting to users
ALTER TABLE users
ADD COLUMN default_chorister text NULL,
ADD COLUMN default_conducting text NULL; 