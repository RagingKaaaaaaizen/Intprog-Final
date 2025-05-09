const express = require('express');
const cors = require('cors');
const app = express();

// CORS middleware
app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// api routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/employees', require('./employees/employees.controller'));
app.use('/departments', require('./departments/departments.controller'));
app.use('/workflows', require('./workflows/workflows.controller'));
app.use('/requests', require('./requests/requests.controller'));

// global error handler
app.use(require('./_middleware/error-handler'));

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => {
    console.log(`
=======================================================
   Employee Management API Server Running on Port ${port}
=======================================================

API Testing Guide:
1. Register: POST http://localhost:${port}/accounts/register
   Body: {
     "firstName": "Test",
     "lastName": "User",
     "email": "test@example.com",
     "password": "Password123!"
   }

2. Verify Email: POST http://localhost:${port}/accounts/verify-email
   (Verification token will be shown in console)

3. Login: POST http://localhost:${port}/accounts/authenticate
   
Ethereal emails will be automatically generated for testing
and preview links will be shown in the console.
=======================================================
`);
});
