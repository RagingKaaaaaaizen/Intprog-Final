# Employee Management System

A complete employee management system with an Angular frontend and Node.js backend.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database

### Setup

1. Install dependencies for both frontend and backend:

```
npm run install:all
```

2. Configure your database:
   - Edit `backend/config.json` with your MySQL credentials

3. Start both servers simultaneously:

```
npm start
```

This will start:
- Backend API server on port 4000
- Frontend Angular server on port 4200

### Starting Servers Individually

To start only the backend:
```
npm run start:backend
```

To start only the frontend:
```
npm run start:frontend
```

## Features

- User registration and email verification
- Authentication with JWT
- Employee management
- Department management
- Workflow management

## Testing

The system uses Ethereal email for testing. When registering a new user, check the backend console output for the verification token.

## Architecture

- Frontend: Angular 17
- Backend: Node.js with Express
- Database: MySQL with Sequelize ORM 