-- Enhanced US Database Schema
CREATE TABLE patients (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    assigned_therapist TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY, 
    patient_id TEXT REFERENCES patients(id),
    therapist_id TEXT NOT NULL,
    note TEXT NOT NULL,
    note_type TEXT DEFAULT 'session',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE therapists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialization TEXT,
    region TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

-- Insert therapists
INSERT INTO therapists (id, name, specialization, region) VALUES
('sarah_therapist', 'Dr. Sarah Johnson', 'Anxiety & Depression', 'us'),
('mike_therapist', 'Dr. Michael Chen', 'PTSD & Trauma', 'us'),
('lisa_therapist', 'Dr. Lisa Rodriguez', 'Family & Couples', 'us');

-- Insert patients with realistic data
INSERT INTO patients (id, name, region, assigned_therapist, status, created_at) VALUES
('p001', 'John Doe', 'us', 'sarah_therapist', 'active', NOW() - INTERVAL '30 days'),
('p002', 'Jane Roe', 'us', 'sarah_therapist', 'active', NOW() - INTERVAL '25 days'),
('p003', 'Michael Johnson', 'us', 'sarah_therapist', 'active', NOW() - INTERVAL '20 days'),
('p004', 'Sam Smith', 'us', 'mike_therapist', 'active', NOW() - INTERVAL '15 days'),
('p005', 'Emily Davis', 'us', 'mike_therapist', 'active', NOW() - INTERVAL '10 days'),
('p006', 'Robert Wilson', 'us', 'lisa_therapist', 'active', NOW() - INTERVAL '5 days'),
('p007', 'Maria Garcia', 'us', 'lisa_therapist', 'active', NOW() - INTERVAL '3 days'),
('p008', 'David Brown', 'us', 'sarah_therapist', 'active', NOW() - INTERVAL '1 day'),
('p009', 'Jennifer Lee', 'us', 'mike_therapist', 'active', NOW()),
('p010', 'Christopher Taylor', 'us', 'lisa_therapist', 'inactive', NOW());

-- Insert detailed session notes
INSERT INTO notes (patient_id, therapist_id, note, note_type, created_at) VALUES
('p001', 'sarah_therapist', 'Initial consultation completed. Patient reports anxiety symptoms related to work stress.', 'intake', NOW() - INTERVAL '30 days'),
('p001', 'sarah_therapist', 'Second session - discussing cognitive behavioral therapy techniques and coping strategies.', 'session', NOW() - INTERVAL '23 days'),
('p001', 'sarah_therapist', 'Patient showing improvement with breathing exercises and mindfulness practices.', 'session', NOW() - INTERVAL '16 days'),
('p001', 'sarah_therapist', 'Homework assignment: daily mood tracking. Patient reports better sleep quality.', 'session', NOW() - INTERVAL '9 days'),
('p002', 'sarah_therapist', 'Follow-up session scheduled. Patient missed last appointment due to work conflict.', 'admin', NOW() - INTERVAL '25 days'),
('p002', 'sarah_therapist', 'Rescheduled session completed. Discussed time management and work-life balance.', 'session', NOW() - INTERVAL '18 days'),
('p002', 'sarah_therapist', 'Patient implementing boundary-setting techniques. Positive progress noted.', 'session', NOW() - INTERVAL '11 days'),
('p003', 'sarah_therapist', 'New patient intake. History of depression, currently stable on medication.', 'intake', NOW() - INTERVAL '20 days'),
('p003', 'sarah_therapist', 'Medication consultation recommended with psychiatrist. Therapy goals established.', 'session', NOW() - INTERVAL '13 days'),
('p003', 'sarah_therapist', 'Working on activity scheduling and behavioral activation techniques.', 'session', NOW() - INTERVAL '6 days'),
('p004', 'mike_therapist', 'Patient showing significant improvement in PTSD symptoms using EMDR therapy.', 'session', NOW() - INTERVAL '15 days'),
('p004', 'mike_therapist', 'Discussed return-to-work strategies and workplace accommodations.', 'session', NOW() - INTERVAL '8 days'),
('p004', 'mike_therapist', 'Patient successfully returned to work part-time. Monitoring stress levels.', 'session', NOW() - INTERVAL '1 day'),
('p005', 'mike_therapist', 'Initial assessment for PTSD symptoms following car accident.', 'intake', NOW() - INTERVAL '10 days'),
('p005', 'mike_therapist', 'Started EMDR therapy protocol. Patient responding well to treatment.', 'session', NOW() - INTERVAL '3 days'),
('p006', 'lisa_therapist', 'Couples therapy session with spouse. Communication patterns identified.', 'session', NOW() - INTERVAL '5 days'),
('p007', 'lisa_therapist', 'Adolescent patient - family dynamics discussion with parents present.', 'family', NOW() - INTERVAL '3 days'),
('p008', 'sarah_therapist', 'Crisis intervention session completed. Safety plan established.', 'crisis', NOW() - INTERVAL '1 day'),
('p009', 'mike_therapist', 'Initial consultation for addiction recovery. Motivational interviewing approach.', 'intake', NOW()),
('p010', 'lisa_therapist', 'Geriatric patient - cognitive assessment completed. Mild cognitive decline noted.', 'assessment', NOW());
