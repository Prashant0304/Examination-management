INSERT INTO departments (name, code) VALUES ('Administration', 'ADMIN')
ON CONFLICT (code) DO NOTHING;
