-- Sandbox Database - Anonymized Research Data
CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    age_group TEXT,
    gender TEXT,
    region TEXT,
    diagnosis_category TEXT,
    treatment_duration_days INTEGER,
    outcome_score INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    patient_id TEXT REFERENCES patients(id),
    session_number INTEGER,
    note_category TEXT,
    sentiment_score DECIMAL(3,2),
    word_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE research_metrics (
    id SERIAL PRIMARY KEY,
    metric_name TEXT,
    metric_value DECIMAL(10,2),
    patient_count INTEGER,
    date_calculated TIMESTAMP DEFAULT NOW()
);

-- Insert anonymized patient data for research
INSERT INTO patients (id, age_group, gender, region, diagnosis_category, treatment_duration_days, outcome_score, created_at) VALUES
('anon_001', '25-35', 'F', 'us', 'anxiety', 90, 85, NOW() - INTERVAL '90 days'),
('anon_002', '35-45', 'M', 'us', 'depression', 120, 78, NOW() - INTERVAL '120 days'),
('anon_003', '45-55', 'F', 'eu', 'ptsd', 180, 92, NOW() - INTERVAL '180 days'),
('anon_004', '25-35', 'M', 'us', 'anxiety', 60, 88, NOW() - INTERVAL '60 days'),
('anon_005', '55-65', 'F', 'eu', 'depression', 150, 75, NOW() - INTERVAL '150 days'),
('anon_006', '18-25', 'M', 'us', 'adhd', 45, 82, NOW() - INTERVAL '45 days'),
('anon_007', '35-45', 'F', 'eu', 'anxiety', 75, 90, NOW() - INTERVAL '75 days'),
('anon_008', '45-55', 'M', 'us', 'ptsd', 200, 87, NOW() - INTERVAL '200 days'),
('anon_009', '25-35', 'F', 'eu', 'depression', 95, 79, NOW() - INTERVAL '95 days'),
('anon_010', '35-45', 'M', 'us', 'anxiety', 110, 91, NOW() - INTERVAL '110 days'),
('anon_011', '18-25', 'F', 'eu', 'eating_disorder', 160, 83, NOW() - INTERVAL '160 days'),
('anon_012', '55-65', 'M', 'us', 'depression', 140, 76, NOW() - INTERVAL '140 days'),
('anon_013', '25-35', 'F', 'us', 'bipolar', 220, 84, NOW() - INTERVAL '220 days'),
('anon_014', '35-45', 'M', 'eu', 'anxiety', 85, 89, NOW() - INTERVAL '85 days'),
('anon_015', '45-55', 'F', 'us', 'ptsd', 175, 93, NOW() - INTERVAL '175 days');

-- Insert anonymized session notes
INSERT INTO notes (patient_id, session_number, note_category, sentiment_score, word_count, created_at) VALUES
('anon_001', 1, 'intake', -0.3, 450, NOW() - INTERVAL '90 days'),
('anon_001', 8, 'progress', 0.2, 380, NOW() - INTERVAL '60 days'),
('anon_001', 12, 'completion', 0.7, 320, NOW() - INTERVAL '30 days'),
('anon_002', 1, 'intake', -0.5, 520, NOW() - INTERVAL '120 days'),
('anon_002', 6, 'progress', -0.1, 410, NOW() - INTERVAL '90 days'),
('anon_002', 15, 'progress', 0.4, 350, NOW() - INTERVAL '30 days'),
('anon_003', 1, 'intake', -0.7, 680, NOW() - INTERVAL '180 days'),
('anon_003', 10, 'progress', 0.1, 420, NOW() - INTERVAL '120 days'),
('anon_003', 20, 'completion', 0.8, 290, NOW() - INTERVAL '60 days'),
('anon_004', 1, 'intake', -0.2, 390, NOW() - INTERVAL '60 days'),
('anon_004', 8, 'completion', 0.6, 310, NOW() - INTERVAL '15 days'),
('anon_005', 1, 'intake', -0.4, 480, NOW() - INTERVAL '150 days'),
('anon_005', 12, 'progress', 0.3, 360, NOW() - INTERVAL '90 days'),
('anon_006', 1, 'intake', 0.1, 340, NOW() - INTERVAL '45 days'),
('anon_006', 6, 'completion', 0.5, 280, NOW() - INTERVAL '10 days');

-- Insert research metrics
INSERT INTO research_metrics (metric_name, metric_value, patient_count, date_calculated) VALUES
('average_treatment_duration', 125.5, 15, NOW()),
('success_rate_anxiety', 0.89, 5, NOW()),
('success_rate_depression', 0.77, 4, NOW()),
('success_rate_ptsd', 0.91, 3, NOW()),
('average_outcome_score', 84.2, 15, NOW()),
('completion_rate', 0.93, 15, NOW()),
('patient_satisfaction', 4.2, 15, NOW());
