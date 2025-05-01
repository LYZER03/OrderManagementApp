## Project architecture

### Backend (Django)
- Framework**: Django with Django REST Framework
- Database**: SQLite (default)
- Authentication**: JWT (JSON Web Tokens)
- **Main models** :
  - User (with AGENT/MANAGER roles)
  - Order (with CREATED/PREPARED/CONTROLLED/PACKED status)

### Frontend (React)
- Framework**: React with Vite
- UI Library**: Material UI (Mantis Dashboard style)
- Routing**: React Router
- State management** : Context API for authentication

## Implemented features

### Authentication
- Login/logout system
- Route protection by role (Agent/Manager)
- Automatic redirection of logged-in users

### User interface
- Modern design inspired by Mantis Dashboard
- Customized theme with professional color palette
- Adaptive side menu according to user role
- Navigation bar with search and notifications
- Login page with form validation

### Management modules
- Structure for preparation, control and packaging modules
- Protected routes for each module
- Access differentiated by role (Agent/Manager)

## Tests Completed

### Backend tests
- Testing authentication endpoints
- Test command listing endpoints
- Verification of role-based permissions
- Validation of data returned by API

### Frontend testing
- Test integration with backend
- Verification of authentication operation
- Test redirection of logged-in users

## Next steps

### Frontend development
- Implementation of order management pages
- Creation of interfaces for each module
- Development of dashboard with statistics

### Enhancements
- Addition of search and filter functions
- Implementation of real-time notifications
- Performance optimization

## Test data
- 1 managers (admin)
- 5 agents (agent1 to agent5)
- 76 commands at different stages of the process
- All users have password: 1234

Translated with DeepL.com (free version)