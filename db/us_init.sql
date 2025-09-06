CREATE TABLE patients (id TEXT PRIMARY KEY, name TEXT, region TEXT);
CREATE TABLE notes (id SERIAL PRIMARY KEY, patient_id TEXT, note TEXT);
INSERT INTO patients (id, name, region) VALUES
  ('p001', 'John Doe', 'us'),
  ('p002', 'Jane Roe', 'us'),
  ('p004', 'Sam Smith', 'us');
INSERT INTO notes (patient_id, note) VALUES
  ('p001', 'US note 1'),
  ('p002', 'US note 2'),
  ('p004', 'US note 3');
