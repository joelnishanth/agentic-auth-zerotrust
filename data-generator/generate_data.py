#!/usr/bin/env python3
"""
AI-Powered Healthcare Data Generator
Uses Ollama to generate realistic healthcare data for the zero-trust demo
"""

import json
import time
import random
import requests
import psycopg2
from faker import Faker
import os
from datetime import datetime, timedelta

# Configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434/api/generate")
DBS = {
    "us_db": os.getenv("US_DB_DSN", "postgres://postgres:postgres@postgres_us:5432/us_db"),
    "eu_db": os.getenv("EU_DB_DSN", "postgres://postgres:postgres@postgres_eu:5432/eu_db"),
    "sandbox_db": os.getenv("SBX_DB_DSN", "postgres://postgres:postgres@postgres_sbx:5432/sandbox_db"),
}

fake = Faker()

def wait_for_ollama():
    """Wait for Ollama to be available"""
    print("🤖 Waiting for Ollama to be available...")
    for i in range(30):  # Wait up to 5 minutes
        try:
            response = requests.get("http://host.docker.internal:11434/api/tags", timeout=5)
            if response.status_code == 200:
                print("✅ Ollama is ready!")
                return True
        except:
            pass
        print(f"   Attempt {i+1}/30 - Ollama not ready, waiting...")
        time.sleep(10)
    
    print("❌ Ollama not available, using fallback data generation")
    return False

def wait_for_database(dsn, db_name):
    """Wait for database to be available"""
    print(f"🗄️ Waiting for {db_name} to be available...")
    for i in range(30):
        try:
            conn = psycopg2.connect(dsn)
            conn.close()
            print(f"✅ {db_name} is ready!")
            return True
        except:
            pass
        print(f"   Attempt {i+1}/30 - {db_name} not ready, waiting...")
        time.sleep(5)
    
    print(f"❌ {db_name} not available")
    return False

def generate_with_ollama(prompt, model="llama3.2:3b"):
    """Generate data using Ollama"""
    try:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "max_tokens": 1000
            }
        }
        
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
        else:
            print(f"Ollama request failed: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Ollama error: {e}")
        return None

def generate_patient_data(region, count=50):
    """Generate realistic patient data using AI"""
    print(f"🧠 Generating {count} patients for {region} using AI...")
    
    prompt = f"""Generate {count} realistic healthcare patient records for a {region} medical facility. 
Return ONLY a JSON array with this exact structure:

[
  {{
    "name": "Full Name",
    "age": 25,
    "diagnosis": "Medical condition",
    "status": "active",
    "assigned_therapist": 1,
    "region": "{region.upper()}"
  }}
]

Make the data diverse and realistic. Use common medical conditions like anxiety, depression, PTSD, chronic pain, etc. 
Ages should range from 18-85. Status should be mostly "active" with some "inactive".
Assigned therapist should be random numbers 1-10.
Return valid JSON only, no explanations."""

    ai_response = generate_with_ollama(prompt)
    
    if ai_response:
        try:
            # Clean up the response
            if "```json" in ai_response:
                ai_response = ai_response.split("```json")[1].split("```")[0].strip()
            elif "```" in ai_response:
                ai_response = ai_response.split("```")[1].split("```")[0].strip()
            
            patients = json.loads(ai_response)
            print(f"✅ Generated {len(patients)} patients using AI")
            return patients
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse AI response: {e}")
            print(f"Raw response: {ai_response[:200]}...")
    
    # Fallback to faker if AI fails
    print("🔄 Using fallback data generation...")
    return generate_patient_data_fallback(region, count)

def generate_patient_data_fallback(region, count):
    """Fallback patient data generation using Faker"""
    conditions = [
        "Anxiety Disorder", "Major Depression", "PTSD", "Chronic Pain", 
        "Bipolar Disorder", "OCD", "Social Anxiety", "Panic Disorder",
        "Chronic Fatigue", "Fibromyalgia", "Insomnia", "ADHD"
    ]
    
    patients = []
    for _ in range(count):
        patients.append({
            "name": fake.name(),
            "age": random.randint(18, 85),
            "diagnosis": random.choice(conditions),
            "status": random.choice(["active"] * 8 + ["inactive"] * 2),  # 80% active
            "assigned_therapist": random.randint(1, 10),
            "region": region.upper()
        })
    
    return patients

def generate_therapist_data(region, count=10):
    """Generate therapist data using AI"""
    print(f"👩‍⚕️ Generating {count} therapists for {region} using AI...")
    
    prompt = f"""Generate {count} realistic therapist profiles for a {region} medical facility.
Return ONLY a JSON array with this exact structure:

[
  {{
    "name": "Dr. Full Name",
    "specialization": "Specialty area",
    "active": true,
    "years_experience": 8
  }}
]

Use realistic specializations like Clinical Psychology, Cognitive Behavioral Therapy, 
Trauma Therapy, Family Therapy, etc. Years of experience should range from 2-25.
Most should be active (true). Return valid JSON only."""

    ai_response = generate_with_ollama(prompt)
    
    if ai_response:
        try:
            if "```json" in ai_response:
                ai_response = ai_response.split("```json")[1].split("```")[0].strip()
            elif "```" in ai_response:
                ai_response = ai_response.split("```")[1].split("```")[0].strip()
            
            therapists = json.loads(ai_response)
            print(f"✅ Generated {len(therapists)} therapists using AI")
            return therapists
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse AI response: {e}")
    
    # Fallback
    print("🔄 Using fallback therapist generation...")
    specializations = [
        "Clinical Psychology", "Cognitive Behavioral Therapy", "Trauma Therapy",
        "Family Therapy", "Addiction Counseling", "Child Psychology",
        "Geriatric Psychology", "Marriage Counseling"
    ]
    
    therapists = []
    for _ in range(count):
        therapists.append({
            "name": f"Dr. {fake.name()}",
            "specialization": random.choice(specializations),
            "active": random.choice([True] * 9 + [False]),  # 90% active
            "years_experience": random.randint(2, 25)
        })
    
    return therapists

def generate_notes_data(patient_count, count=200):
    """Generate therapy notes using AI"""
    print(f"📝 Generating {count} therapy notes using AI...")
    
    prompt = f"""Generate {count} realistic therapy session notes for a mental health practice.
Return ONLY a JSON array with this exact structure:

[
  {{
    "patient_id": 1,
    "therapist_id": 1,
    "note_text": "Brief professional therapy note",
    "session_type": "Individual Therapy"
  }}
]

Patient IDs should range from 1 to {patient_count}.
Therapist IDs should range from 1 to 10.
Notes should be professional, brief therapy session summaries.
Session types: Individual Therapy, Group Therapy, Family Session, Assessment.
Return valid JSON only."""

    ai_response = generate_with_ollama(prompt)
    
    if ai_response:
        try:
            if "```json" in ai_response:
                ai_response = ai_response.split("```json")[1].split("```")[0].strip()
            elif "```" in ai_response:
                ai_response = ai_response.split("```")[1].split("```")[0].strip()
            
            notes = json.loads(ai_response)
            print(f"✅ Generated {len(notes)} notes using AI")
            return notes
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse AI response: {e}")
    
    # Fallback
    print("🔄 Using fallback notes generation...")
    session_types = ["Individual Therapy", "Group Therapy", "Family Session", "Assessment"]
    note_templates = [
        "Patient showed improvement in coping strategies during session.",
        "Discussed anxiety management techniques and homework assignments.",
        "Patient reported decreased symptoms since last session.",
        "Worked on cognitive restructuring exercises.",
        "Family dynamics discussion, progress noted in communication.",
        "Assessment completed, treatment plan updated accordingly."
    ]
    
    notes = []
    for _ in range(count):
        notes.append({
            "patient_id": random.randint(1, patient_count),
            "therapist_id": random.randint(1, 10),
            "note_text": random.choice(note_templates),
            "session_type": random.choice(session_types)
        })
    
    return notes

def generate_research_data():
    """Generate research metrics for sandbox database"""
    print("🔬 Generating research metrics using AI...")
    
    prompt = """Generate 20 realistic healthcare research metrics for a mental health study.
Return ONLY a JSON array with this exact structure:

[
  {
    "metric_name": "Treatment Success Rate",
    "metric_value": 78.5,
    "category": "Outcomes"
  }
]

Include metrics like success rates, average treatment duration, patient satisfaction scores,
readmission rates, etc. Values should be realistic percentages or numbers.
Categories: Outcomes, Satisfaction, Duration, Demographics.
Return valid JSON only."""

    ai_response = generate_with_ollama(prompt)
    
    if ai_response:
        try:
            if "```json" in ai_response:
                ai_response = ai_response.split("```json")[1].split("```")[0].strip()
            elif "```" in ai_response:
                ai_response = ai_response.split("```")[1].split("```")[0].strip()
            
            metrics = json.loads(ai_response)
            print(f"✅ Generated {len(metrics)} research metrics using AI")
            return metrics
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse AI response: {e}")
    
    # Fallback
    print("🔄 Using fallback research metrics generation...")
    return [
        {"metric_name": "Treatment Success Rate", "metric_value": 78.5, "category": "Outcomes"},
        {"metric_name": "Average Treatment Duration", "metric_value": 12.3, "category": "Duration"},
        {"metric_name": "Patient Satisfaction Score", "metric_value": 4.2, "category": "Satisfaction"},
        {"metric_name": "Readmission Rate", "metric_value": 15.7, "category": "Outcomes"},
        {"metric_name": "Therapy Completion Rate", "metric_value": 82.1, "category": "Outcomes"}
    ]

def check_table_exists(cursor, table_name):
    """Check if a table exists in the database"""
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = %s
        );
    """, (table_name,))
    return cursor.fetchone()[0]

def get_table_columns(cursor, table_name):
    """Get column names for a table"""
    cursor.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = %s
        ORDER BY ordinal_position;
    """, (table_name,))
    return [row[0] for row in cursor.fetchall()]

def populate_database(db_name, dsn):
    """Populate a specific database with AI-generated data"""
    print(f"\n🗄️ Populating {db_name}...")
    
    if not wait_for_database(dsn, db_name):
        return False
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Check what tables exist
        has_therapists = check_table_exists(cur, 'therapists')
        has_patients = check_table_exists(cur, 'patients')
        has_notes = check_table_exists(cur, 'notes')
        has_research_metrics = check_table_exists(cur, 'research_metrics')
        
        print(f"📋 Schema check: therapists={has_therapists}, patients={has_patients}, notes={has_notes}, research_metrics={has_research_metrics}")
        
        # Determine region and data characteristics
        if db_name == "us_db":
            region = "US"
            patient_count = 50  # Reduced to avoid conflicts
        elif db_name == "eu_db":
            region = "EU"
            patient_count = 40
        else:  # sandbox_db
            region = "Sandbox"
            patient_count = 30
        
        success_operations = 0
        
        # Handle therapists table (only for production databases)
        if has_therapists and db_name != "sandbox_db":
            print(f"👩‍⚕️ Adding therapists to {db_name}...")
            therapists = generate_therapist_data(region, 5)  # Reduced count
            
            for i, therapist in enumerate(therapists):
                therapist_id = f"{region.lower()}_therapist_{i+10}"  # Start from 10 to avoid conflicts
                try:
                    cur.execute("""
                        INSERT INTO therapists (id, name, specialization, region, active)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO NOTHING
                    """, (
                        therapist_id,
                        therapist["name"],
                        therapist["specialization"],
                        region.lower(),
                        therapist["active"]
                    ))
                except Exception as e:
                    print(f"⚠️ Skipping therapist {therapist_id}: {e}")
                    continue
            success_operations += 1
        
        # Handle patients table
        if has_patients:
            print(f"👥 Adding patients to {db_name}...")
            patients = generate_patient_data(region, patient_count)
            patient_columns = get_table_columns(cur, 'patients')
            
            for i, patient in enumerate(patients):
                try:
                    if db_name == "sandbox_db":
                        # Sandbox has anonymized schema
                        patient_id = f"ai_anon_{i+200:03d}"
                        if 'age_group' in patient_columns:
                            cur.execute("""
                                INSERT INTO patients (id, age_group, gender, region, diagnosis_category, 
                                                    treatment_duration_days, outcome_score, created_at)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                                ON CONFLICT (id) DO NOTHING
                            """, (
                                patient_id,
                                f"{patient['age']//10*10}-{patient['age']//10*10+9}",
                                patient.get("gender", "F"),
                                region.lower(),
                                patient["diagnosis"],
                                random.randint(30, 180),
                                random.randint(60, 95),
                                datetime.now() - timedelta(days=random.randint(1, 365))
                            ))
                    else:
                        # Production databases
                        patient_id = f"ai_gen_{i+200:03d}"
                        assigned_therapist = f"{region.lower()}_therapist_{random.randint(1, 3)}"
                        
                        if 'name' in patient_columns:
                            cur.execute("""
                                INSERT INTO patients (id, name, email, phone, therapist_id, diagnosis, status, created_at)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                                ON CONFLICT (id) DO NOTHING
                            """, (
                                patient_id,
                                patient["name"],
                                patient.get("email", f"{patient_id}@example.com"),
                                patient.get("phone", f"555-{random.randint(1000, 9999)}"),
                                assigned_therapist,
                                patient["diagnosis"],
                                patient["status"],
                                datetime.now() - timedelta(days=random.randint(1, 365))
                            ))
                except Exception as e:
                    print(f"⚠️ Skipping patient {i}: {e}")
                    continue
            success_operations += 1
        
        # Handle notes table
        if has_notes:
            print(f"📝 Adding notes to {db_name}...")
            notes = generate_notes_data(patient_count, 30)  # Reduced count
            note_columns = get_table_columns(cur, 'notes')
            
            for note in notes[:20]:  # Limit to 20 notes
                try:
                    if db_name == "sandbox_db":
                        # Sandbox schema
                        patient_id = f"anon_{random.randint(1, 15):03d}"  # Use existing patients
                        if 'note_category' in note_columns:
                            cur.execute("""
                                INSERT INTO notes (patient_id, session_number, note_category, 
                                                 sentiment_score, word_count, created_at)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (
                                patient_id,
                                random.randint(1, 20),
                                random.choice(['intake', 'progress', 'completion']),
                                random.uniform(-0.5, 0.8),
                                len(note["note_text"].split()),
                                datetime.now() - timedelta(days=random.randint(1, 90))
                            ))
                    else:
                        # Production schema
                        patient_id = f"p{random.randint(1, 15):03d}"  # Use existing patients
                        therapist_id = f"{region.lower()}_therapist_{random.randint(1, 3)}"
                        
                        if 'content' in note_columns:
                            cur.execute("""
                                INSERT INTO notes (patient_id, therapist_id, session_date, content, created_at)
                                VALUES (%s, %s, %s, %s, %s)
                            """, (
                                patient_id,
                                therapist_id,
                                datetime.now() - timedelta(days=random.randint(1, 90)),
                                note["note_text"],
                                datetime.now() - timedelta(days=random.randint(1, 90))
                            ))
                except Exception as e:
                    print(f"⚠️ Skipping note: {e}")
                    continue
            success_operations += 1
        
        # Handle research metrics (sandbox only)
        if has_research_metrics and db_name == "sandbox_db":
            print(f"🔬 Adding research metrics to {db_name}...")
            try:
                metrics = generate_research_data()
                for metric in metrics[:10]:  # Limit to 10 metrics
                    cur.execute("""
                        INSERT INTO research_metrics (metric_name, metric_value, patient_count, date_calculated)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT DO NOTHING
                    """, (
                        metric["metric_name"],
                        metric["metric_value"],
                        random.randint(10, 50),
                        datetime.now() - timedelta(days=random.randint(1, 30))
                    ))
                success_operations += 1
            except Exception as e:
                print(f"⚠️ Error adding research metrics: {e}")
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"✅ Successfully completed {success_operations} operations for {db_name}")
        return success_operations > 0
        
    except Exception as e:
        print(f"❌ Error populating {db_name}: {e}")
        return False

def check_database_populated(dsn, db_name):
    """Check if database already has sufficient data"""
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Check if patients table has data
        if check_table_exists(cur, 'patients'):
            cur.execute("SELECT COUNT(*) FROM patients")
            patient_count = cur.fetchone()[0]
            
            if patient_count > 10:  # If more than 10 patients, consider it populated
                cur.close()
                conn.close()
                return True
        
        cur.close()
        conn.close()
        return False
        
    except Exception as e:
        print(f"⚠️ Could not check {db_name} population status: {e}")
        return False

def main():
    """Main data generation process"""
    print("🚀 Starting AI-powered data generation...")
    
    # Wait for Ollama (optional, will fallback if not available)
    ollama_available = wait_for_ollama()
    if not ollama_available:
        print("⚠️ Ollama not available - will use fallback data generation")
    
    # Populate all databases
    success_count = 0
    for db_name, dsn in DBS.items():
        # Check if database is already populated
        if check_database_populated(dsn, db_name):
            print(f"ℹ️ {db_name} already has data - skipping population")
            success_count += 1
            continue
            
        if populate_database(db_name, dsn):
            success_count += 1
    
    print(f"\n🎉 Data generation complete!")
    print(f"✅ Successfully handled {success_count}/{len(DBS)} databases")
    
    if ollama_available:
        print("🤖 Used AI-generated realistic data where needed")
    else:
        print("🔄 Used fallback data generation")

if __name__ == "__main__":
    main()