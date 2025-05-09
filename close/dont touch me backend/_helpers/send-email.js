const nodemailer = require('nodemailer');
const config = require('../config.json');
const util = require('util');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = 'Employee Management System <noreply@employee-system.com>' }) {
    // Create a test account on Ethereal if config email isn't set up
    let testAccount;
    let transporter;
    
    if (config.email.host === 'smtp.ethereal.email' && 
        (config.email.user === 'ethereal.user@ethereal.email' || !config.email.user)) {
        console.log('Creating Ethereal test account...');
        testAccount = await nodemailer.createTestAccount();
        
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    } else {
        // Use configured email settings
        transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            auth: {
                user: config.email.user,
                pass: config.email.password
            }
        });
    }

    // Send mail
    const info = await transporter.sendMail({ from, to, subject, html });
    
    // If using Ethereal, log the preview URL
    if (testAccount) {
        console.log('\n');
        console.log('------ EMAIL SENT ------');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        console.log('------------------------\n');
    }
    
    return info;
} 