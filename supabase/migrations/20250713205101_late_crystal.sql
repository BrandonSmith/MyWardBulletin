/*
  # Add Sample Wards for Testing

  1. Sample Wards
    - Creates a few sample wards for users to select from
    - Includes different stakes to show variety
  
  2. Notes
    - These are sample wards for testing purposes
    - In production, you would populate this with real ward data
    - Ward names and stakes are fictional examples
*/

-- Insert sample wards for testing
INSERT INTO public.wards (name, slug, stake) VALUES
  ('Sunset Hills Ward', 'sunset-hills-ward', 'Sunset Hills Stake'),
  ('Mountain View Ward', 'mountain-view-ward', 'Mountain View Stake'),
  ('Cedar Creek Ward', 'cedar-creek-ward', 'Cedar Creek Stake'),
  ('Riverside Ward', 'riverside-ward', 'Riverside Stake'),
  ('Oak Valley Ward', 'oak-valley-ward', 'Oak Valley Stake'),
  ('Pine Ridge Ward', 'pine-ridge-ward', 'Pine Ridge Stake'),
  ('Maple Grove Ward', 'maple-grove-ward', 'Maple Grove Stake'),
  ('Willow Branch', 'willow-branch', 'Willow District'),
  ('Harmony Ward', 'harmony-ward', 'Harmony Stake'),
  ('Liberty Ward', 'liberty-ward', 'Liberty Stake')
ON CONFLICT (slug) DO NOTHING;