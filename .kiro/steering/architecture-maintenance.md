---
inclusion: always
---

# Architecture Diagram Maintenance Rule

## Core Principle
Always update architecture diagrams when backend components, services, or data flows are modified.

## Requirements

### Automatic Updates
- When adding new services to docker-compose.yaml, update the architecture diagram
- When modifying service connections or dependencies, reflect changes in Mermaid diagrams
- When changing ports, endpoints, or service configurations, update component details
- When adding or removing databases, update the data layer representation

### Zen Design Principles
- Keep diagrams as simple as possible while maintaining accuracy
- Minimize crossing lines and overlapping connections
- Use clear, hierarchical layouts (top-to-bottom or left-to-right)
- Group related components together
- Reduce visual complexity without losing essential information

### Diagram Standards
- Use consistent color coding across all diagrams
- Maintain clear component naming conventions
- Include port numbers and key technologies
- Show data flow direction clearly
- Separate concerns into distinct layers

### Documentation Synchronization
- Update component descriptions when functionality changes
- Maintain accurate port mappings
- Keep technology stack information current
- Update security flow diagrams when authorization changes
- Reflect new features in component capability lists

### Implementation Guidelines
- Use Mermaid.js for all architecture diagrams
- Follow a layered approach: User → Frontend → Services → Data
- Minimize line crossings by organizing components logically
- Use subgraphs to group related services
- Maintain consistent styling and theming

## Specific Triggers for Updates

### Service Changes
- New service added to docker-compose.yaml
- Service removed or deprecated
- Port changes or service renaming
- New environment variables or configurations

### Architecture Changes
- New data flows or API endpoints
- Changes to authentication or authorization flow
- Database schema modifications
- Integration of new external services (like Ollama)

### Security Updates
- New policy rules or OPA changes
- Authentication flow modifications
- Access control changes
- Audit logging updates

## Quality Standards
- Diagrams should be readable at different zoom levels
- All components should have clear labels and purposes
- Connection flows should be intuitive and follow logical paths
- Color coding should be consistent and meaningful
- Avoid unnecessary complexity or decorative elements