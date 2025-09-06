package authz

default allow = false

allowed_roles = {
  "therapist": {"patients": ["read"], "notes": ["read"]},
  "admin": {"patients": ["read", "write"], "notes": ["read", "write"]},
  "analyst": {"patients": ["read"], "notes": ["read"]},
  "support": {"patients": ["read"], "notes": ["read"]},
  "superuser": {"patients": ["read", "write"], "notes": ["read", "write"]}
}

allowed_dbs = {
  "therapist": ["us_db", "eu_db"],
  "admin": ["us_db", "eu_db", "sandbox_db"],
  "analyst": ["sandbox_db"],
  "support": ["us_db", "eu_db"],
  "superuser": ["us_db", "eu_db", "sandbox_db"]
}

allow {
  # Handle both direct role and Keycloak realm_access.roles structure
  role := get_user_role
  action := input.action
  resource := input.resource
  allowed_roles[role][resource][_] == action
  allowed_dbs[role][_] == input.db
  patient_permitted
}

# Helper function to extract role from different JWT structures
get_user_role := role {
  # Try direct role field first
  role := input.user.role
} else := role {
  # Try Keycloak realm_access.roles array
  role := input.user.realm_access.roles[0]
} else := role {
  # Try roles array directly
  role := input.user.roles[0]
}

patient_permitted {
  not input.patient_id
}

patient_permitted {
  # Check assigned_patients from user attributes or direct field
  some i
  get_assigned_patients[i] == input.patient_id
}

# Helper function to get assigned patients from different JWT structures
get_assigned_patients := patients {
  # Try direct assigned_patients field
  patients := input.user.assigned_patients
} else := patients {
  # Try Keycloak attributes structure
  patients := input.user.attributes.assigned_patients
} else := [] {
  # Default to empty array if no assigned patients
  true
}
