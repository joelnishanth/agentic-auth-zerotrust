import { useState } from 'react'

export default function PoliciesPage() {
  const [selectedPolicy, setSelectedPolicy] = useState('main')

  const policies = {
    main: {
      title: 'Main Authorization Policy',
      description: 'Core policy that evaluates all access requests',
      file: 'main.rego',
      code: `package authz

default allow = false

# Role-based permissions mapping
allowed_roles = {
  "therapist": {"patients": ["read"], "notes": ["read", "write"]},
  "admin": {"patients": ["read", "write"], "notes": ["read", "write"]},
  "analyst": {"patients": ["read"], "notes": ["read"]},
  "support": {"patients": ["read"], "notes": ["read"]},
  "superuser": {"patients": ["read", "write"], "notes": ["read", "write"]}
}

# Database access control by role
allowed_dbs = {
  "therapist": ["us_db", "eu_db"],
  "admin": ["us_db", "eu_db", "sandbox_db"],
  "analyst": ["sandbox_db"],
  "support": ["us_db", "eu_db"],
  "superuser": ["us_db", "eu_db", "sandbox_db"]
}

# Main authorization rule
allow {
  role := input.user.role
  action := input.action
  resource := input.resource
  allowed_roles[role][resource][_] == action
  allowed_dbs[role][_] == input.db
  patient_permitted
}

# Patient assignment validation
patient_permitted {
  not input.patient_id
}

patient_permitted {
  some i
  input.user.assigned_patients[i] == input.patient_id
}`
    },
    roles: {
      title: 'Role Definitions',
      description: 'Detailed role permissions and capabilities',
      file: 'roles.rego',
      code: `package roles

# Therapist role permissions
therapist_permissions = {
  "can_read_assigned_patients": true,
  "can_write_patient_notes": true,
  "can_access_us_db": true,
  "can_access_eu_db": true,
  "can_access_sandbox_db": false,
  "requires_patient_assignment": true
}

# Admin role permissions  
admin_permissions = {
  "can_read_all_patients": true,
  "can_write_all_patients": true,
  "can_manage_users": true,
  "can_access_us_db": true,
  "can_access_eu_db": true,
  "can_access_sandbox_db": true,
  "requires_patient_assignment": false
}

# Analyst role permissions
analyst_permissions = {
  "can_read_deidentified_data": true,
  "can_run_analytics": true,
  "can_access_us_db": false,
  "can_access_eu_db": false,
  "can_access_sandbox_db": true,
  "requires_patient_assignment": false
}

# Support role permissions
support_permissions = {
  "can_read_patient_status": true,
  "can_access_support_tools": true,
  "can_access_us_db": true,
  "can_access_eu_db": true,
  "can_access_sandbox_db": false,
  "requires_patient_assignment": false
}`
    },
    database: {
      title: 'Database Access Control',
      description: 'Policies governing database-specific access rules',
      file: 'database.rego',
      code: `package database

# Database-specific access rules
us_db_access {
  input.user.role in ["therapist", "admin", "support", "superuser"]
  input.user.region == "us"
}

eu_db_access {
  input.user.role in ["therapist", "admin", "support", "superuser"]
  input.user.region == "eu"
}

sandbox_db_access {
  input.user.role in ["analyst", "admin", "superuser"]
}

# Cross-region access validation
cross_region_allowed {
  input.user.role in ["admin", "superuser"]
}

# Data sensitivity levels
sensitive_data_access {
  input.user.role in ["admin", "superuser"]
  input.resource == "sensitive_patients"
}

# Audit requirements
requires_audit {
  input.action == "write"
}

requires_audit {
  input.resource == "sensitive_patients"
}

requires_audit {
  input.user.role == "admin"
}`
    },
    patient: {
      title: 'Patient Data Access',
      description: 'Specific rules for patient data protection',
      file: 'patient.rego',
      code: `package patient

# Patient assignment validation
assigned_patient(patient_id) {
  some i
  input.user.assigned_patients[i] == patient_id
}

# Emergency access override
emergency_access {
  input.context.emergency == true
  input.user.role in ["admin", "therapist"]
}

# Patient consent validation
patient_consent_given(patient_id) {
  # In real implementation, this would check consent database
  true  # Simplified for demo
}

# Age-based access restrictions
minor_patient_access {
  input.patient.age < 18
  input.user.role in ["therapist", "admin"]
  input.user.pediatric_certified == true
}

# Data anonymization requirements
requires_anonymization {
  input.user.role == "analyst"
  input.resource == "patients"
}

# Retention policy compliance
data_retention_compliant {
  input.patient.last_visit_days < 2555  # 7 years
}`
    },
    audit: {
      title: 'Audit and Compliance',
      description: 'Logging and compliance requirements',
      file: 'audit.rego',
      code: `package audit

# Actions that require audit logging
audit_required {
  input.action in ["write", "delete", "export"]
}

audit_required {
  input.resource == "sensitive_patients"
}

audit_required {
  input.user.role == "admin"
}

# Compliance requirements
hipaa_compliant {
  input.user.hipaa_trained == true
  input.context.secure_connection == true
}

gdpr_compliant {
  input.db == "eu_db"
  input.user.gdpr_certified == true
}

# Risk scoring
risk_score = score {
  base_score := 0
  
  # Add risk for sensitive actions
  action_risk := 10 * count([action | 
    action := input.action
    action in ["write", "delete", "export"]
  ])
  
  # Add risk for cross-region access
  region_risk := 5 * count([db | 
    db := input.db
    db != input.user.home_region
  ])
  
  # Add risk for admin actions
  admin_risk := 15 * count([role |
    role := input.user.role
    role == "admin"
  ])
  
  score := base_score + action_risk + region_risk + admin_risk
}

# High risk threshold
high_risk_action {
  risk_score > 20
}`
    }
  }

  const testScenarios = [
    {
      title: 'Therapist Accessing Assigned Patient',
      input: {
        user: { role: 'therapist', assigned_patients: ['p001', 'p004'] },
        action: 'read',
        resource: 'patients',
        db: 'us_db',
        patient_id: 'p001'
      },
      expected: true,
      explanation: 'Allowed because therapist has read access to patients and p001 is assigned to them'
    },
    {
      title: 'Therapist Accessing Unassigned Patient',
      input: {
        user: { role: 'therapist', assigned_patients: ['p001', 'p004'] },
        action: 'read',
        resource: 'patients',
        db: 'us_db',
        patient_id: 'p002'
      },
      expected: false,
      explanation: 'Denied because p002 is not in the therapist\'s assigned patients list'
    },
    {
      title: 'Admin Cross-Database Access',
      input: {
        user: { role: 'admin' },
        action: 'read',
        resource: 'patients',
        db: 'sandbox_db'
      },
      expected: true,
      explanation: 'Allowed because admin role has access to all databases including sandbox'
    },
    {
      title: 'Analyst Accessing Production Data',
      input: {
        user: { role: 'analyst' },
        action: 'read',
        resource: 'patients',
        db: 'us_db'
      },
      expected: false,
      explanation: 'Denied because analyst role only has access to sandbox_db, not production databases'
    },
    {
      title: 'Support Writing Patient Data',
      input: {
        user: { role: 'support' },
        action: 'write',
        resource: 'patients',
        db: 'us_db'
      },
      expected: false,
      explanation: 'Denied because support role only has read permissions, not write access'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="text-center py-12">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Security Policies</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore the Open Policy Agent (OPA) Rego policies that enforce zero trust 
          access control across the entire system.
        </p>
      </section>

      {/* Policy Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(policies).map(([key, policy]) => (
          <button
            key={key}
            onClick={() => setSelectedPolicy(key)}
            className={`p-4 rounded-xl text-left transition-all duration-200 ${
              selectedPolicy === key
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'backdrop-blur bg-white/20 border border-white/30 text-gray-700 hover:bg-white/30'
            }`}
          >
            <div className="font-semibold mb-1">{policy.title}</div>
            <div className={`text-sm ${selectedPolicy === key ? 'text-blue-100' : 'text-gray-500'}`}>
              {policy.file}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Policy */}
      <div className="backdrop-blur bg-white/20 rounded-2xl border border-white/30 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {policies[selectedPolicy].title}
          </h2>
          <p className="text-gray-600">{policies[selectedPolicy].description}</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              File: <code className="bg-gray-500/20 px-2 py-1 rounded">{policies[selectedPolicy].file}</code>
            </span>
            <button className="px-3 py-1 bg-gray-500/20 text-gray-700 rounded hover:bg-gray-500/30 text-sm">
              Copy Policy
            </button>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto leading-relaxed">
{policies[selectedPolicy].code}
          </pre>
        </div>
      </div>

      {/* Policy Testing */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Policy Test Scenarios</h2>
        <div className="space-y-6">
          {testScenarios.map((scenario, index) => (
            <div key={index} className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{scenario.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  scenario.expected 
                    ? 'bg-green-500/20 text-green-700' 
                    : 'bg-red-500/20 text-red-700'
                }`}>
                  {scenario.expected ? '✅ Allow' : '❌ Deny'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Input</h4>
                  <pre className="p-3 bg-gray-800 text-cyan-400 rounded-lg text-sm overflow-x-auto">
{JSON.stringify(scenario.input, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Explanation</h4>
                  <div className={`p-3 rounded-lg text-sm ${
                    scenario.expected 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {scenario.explanation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Policy Principles */}
      <section className="py-16 backdrop-blur bg-white/10 rounded-3xl border border-white/20">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Policy Design Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              principle: 'Explicit Deny by Default',
              description: 'All access is denied unless explicitly allowed by policy',
              icon: '🚫',
              example: 'default allow = false'
            },
            {
              principle: 'Role-Based Access Control',
              description: 'Permissions are assigned based on user roles and responsibilities',
              icon: '👥',
              example: 'allowed_roles[role][resource]'
            },
            {
              principle: 'Context-Aware Decisions',
              description: 'Authorization considers user context, location, and request details',
              icon: '🎯',
              example: 'patient_assignment_check'
            },
            {
              principle: 'Audit Everything',
              description: 'All access decisions are logged for compliance and security',
              icon: '📝',
              example: 'audit_required rules'
            }
          ].map((item, index) => (
            <div key={index} className="p-6 bg-white/30 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="text-xl font-semibold text-gray-800">{item.principle}</h3>
              </div>
              <p className="text-gray-600 mb-3">{item.description}</p>
              <code className="text-sm bg-gray-800 text-green-400 px-3 py-1 rounded">
                {item.example}
              </code>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}