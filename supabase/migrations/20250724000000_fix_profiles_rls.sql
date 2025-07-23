-- Grant public read access to profiles for anonymous users
CREATE POLICY "profiles_anon_select" ON profiles FOR SELECT TO anon USING (true);
