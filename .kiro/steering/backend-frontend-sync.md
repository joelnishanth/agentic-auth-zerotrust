# Backend-Frontend Synchronization Rule

## Core Principle
Always maintain consistency between backend and frontend components when making changes to the authentication and authorization system.

## Requirements

### API Contract Consistency
- When updating backend endpoints, ensure frontend API calls match the expected request/response format
- Maintain consistent error handling patterns between backend HTTP status codes and frontend error states
- Update TypeScript interfaces or API client code when backend data models change

### Authentication Flow Alignment
- Backend authentication middleware changes must be reflected in frontend auth handling
- JWT token validation logic should be consistent between services
- Authorization state management in frontend must align with backend policy decisions

### Error Handling Synchronization
- Backend HTTP status codes (401, 403, 500) must have corresponding frontend error handling
- Error messages and user feedback should be consistent across the stack
- Frontend should gracefully handle all possible backend error scenarios

### Development Workflow
- When modifying agent, middleware, or OPA policies, review impact on frontend components
- Test end-to-end flows after backend changes to ensure frontend compatibility
- Update frontend API documentation when backend endpoints change

### Specific to This Project
- Agent service changes must consider frontend query expectations
- Middleware authorization responses must be properly handled in frontend UI
- OPA policy updates should trigger review of frontend permission-based UI elements

## Implementation Notes
- Use consistent data structures across the full stack
- Maintain backward compatibility when possible during iterative development
- Document API changes that affect frontend integration