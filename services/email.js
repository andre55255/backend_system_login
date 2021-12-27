const nodemailer = require("nodemailer");

async function send(emailDest, subject, bodyText, bodyHtml) {
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_OUTLOOK || "",
        port: process.env.PORT_OUTLOOK || "",
        secure: true,
        auth: {
            user: process.env.USER_OUTLOOK || "",
            pass: process.env.PASS_OUTLOOK || ""
        }
    });
    
    let info;
    try {
        info = await transporter.sendMail({
            from: `"Dede" ${process.env.USER_OUTLOOK}`,
            to: `${emailDest}`,
            subject: subject,
            text: bodyText,
            html: bodyHtml
        });  

        return info;
    } catch (err) {
        return { error: err };
    }
} 

module.exports = { send };