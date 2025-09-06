CREATE TABLE patients (id TEXT PRIMARY KEY, name TEXT, region TEXT);
CREATE TABLE notes (id SERIAL PRIMARY KEY, patient_id TEXT, note TEXT);
INSERT INTO patients (id, name, region) VALUES
  ('p003', 'Hans Müller', 'eu');
INSERT INTO notes (patient_id, note) VALUES
  ('p003', 'EU note 1');
