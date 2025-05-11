-- Temporarily disable RLS to load initial data
ALTER TABLE productions DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE filming_locations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS after data is loaded
-- ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE locations ENABLE ROW LEVEL SECURITY; 
-- ALTER TABLE filming_locations ENABLE ROW LEVEL SECURITY;
