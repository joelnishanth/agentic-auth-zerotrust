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
  input.user.role == role
  input.action == action
  input.resource == resource
  action in allowed_roles[role][resource]
  input.db in allowed_dbs[role]
  patient_permitted
}

patient_permitted {
  not input.patient_id
}

patient_permitted {
  some i
  input.user.assigned_patients[i] == input.patient_id
}
