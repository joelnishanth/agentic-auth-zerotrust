-- Enhanced EU Database Schema
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

-- Insert EU therapists
INSERT INTO therapists (id, name, specialization, region) VALUES
('anna_therapist_eu', 'Dr. Anna Schmidt', 'Cognitive Behavioral Therapy', 'eu'),
('pierre_therapist_eu', 'Dr. Pierre Dubois', 'Psychoanalysis', 'eu'),
('elena_therapist_eu', 'Dr. Elena Rossi', 'Child Psychology', 'eu');

-- Insert EU patients with GDPR-compliant data
INSERT INTO patients (id, name, region, assigned_therapist, status, created_at) VALUES
('p101', 'Hans Müller', 'eu', 'anna_therapist_eu', 'active', NOW() - INTERVAL '45 days'),
('p102', 'Marie Dubois', 'eu', 'pierre_therapist_eu', 'active', NOW() - INTERVAL '35 days'),
('p103', 'Giuseppe Rossi', 'eu', 'elena_therapist_eu', 'active', NOW() - INTERVAL '28 days'),
('p104', 'Ingrid Larsson', 'eu', 'anna_therapist_eu', 'active', NOW() - INTERVAL '21 days'),
('p105', 'Carlos Mendez', 'eu', 'pierre_therapist_eu', 'active', NOW() - INTERVAL '14 days'),
('p106', 'Fatima Al-Zahra', 'eu', 'elena_therapist_eu', 'active', NOW() - INTERVAL '7 days'),
('p107', 'Dimitri Petrov', 'eu', 'anna_therapist_eu', 'active', NOW() - INTERVAL '2 days');

-- Insert EU session notes
INSERT INTO notes (patient_id, therapist_id, note, note_type, created_at) VALUES
('p101', 'anna_therapist_eu', 'Erstberatung abgeschlossen. Patient berichtet über Arbeitsplatzstress.', 'intake', NOW() - INTERVAL '45 days'),
('p101', 'anna_therapist_eu', 'CBT techniques introduced. Patient shows good engagement.', 'session', NOW() - INTERVAL '38 days'),
('p101', 'anna_therapist_eu', 'Significant improvement in anxiety levels. Continuing treatment plan.', 'session', NOW() - INTERVAL '31 days'),
('p102', 'pierre_therapist_eu', 'Séance initiale - exploration des dynamiques inconscientes.', 'intake', NOW() - INTERVAL '35 days'),
('p102', 'pierre_therapist_eu', 'Transfert analysis progressing well. Patient gaining insights.', 'session', NOW() - INTERVAL '28 days'),
('p102', 'pierre_therapist_eu', 'Working through childhood trauma. Therapeutic alliance strong.', 'session', NOW() - INTERVAL '21 days'),
('p103', 'elena_therapist_eu', 'Valutazione iniziale bambino - problemi comportamentali a scuola.', 'intake', NOW() - INTERVAL '28 days'),
('p103', 'elena_therapist_eu', 'Family therapy session with parents. Behavioral plan established.', 'family', NOW() - INTERVAL '21 days'),
('p103', 'elena_therapist_eu', 'Child showing improvement in school behavior. Positive reinforcement working.', 'session', NOW() - INTERVAL '14 days'),
('p104', 'anna_therapist_eu', 'Depression treatment using CBT approach. Medication review needed.', 'session', NOW() - INTERVAL '21 days'),
('p104', 'anna_therapist_eu', 'Patient responding well to combined therapy and medication.', 'session', NOW() - INTERVAL '14 days'),
('p105', 'pierre_therapist_eu', 'Anxiety disorder treatment. Exploring root causes through analysis.', 'session', NOW() - INTERVAL '14 days'),
('p105', 'pierre_therapist_eu', 'Patient making connections between past and present symptoms.', 'session', NOW() - INTERVAL '7 days'),
('p106', 'elena_therapist_eu', 'Adolescent therapy - identity and cultural integration issues.', 'session', NOW() - INTERVAL '7 days'),
('p107', 'anna_therapist_eu', 'PTSD treatment following workplace incident. EMDR recommended.', 'intake', NOW() - INTERVAL '2 days');
