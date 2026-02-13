import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    }
});

async function sendMail(to: string, subject: string, text: string) {

    try {

        const info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject,
            text,
        });

        return true;

    } catch (error) {

        console.error("Error sending email:", error);

        return false;
    }
}

export { sendMail };