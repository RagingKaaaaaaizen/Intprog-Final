const express = require('express');
const cors = require('cors');
const app = express();

// Enhanced CORS middleware for frontend integration
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4000', 'https://employee-management-frontend.yourusername.repl.co', 'https://*.repl.co'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// parse requests of content-type - application/json
app.use(express.json());

// Root route for health checks
app.get('/', (req, res) => {
  res.send('Employee Management API is running');
});

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

API Integration Info:
- API server is now integrated with Angular frontend
- Registration and authentication work with the frontend UI
- Ethereal emails will be generated for testing
- Email verification tokens will be shown in this console

For Frontend connection:
- API is accessible at this Replit URL
- API uses Ethereal to simulate email delivery
- Verification tokens are displayed here instead of sent by email
=======================================================
`);
});
