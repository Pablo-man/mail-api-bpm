import {config} from 'dotenv';
import nodemailer from 'nodemailer';

config();

if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SENDER_EMAIL) {
    console.error('Faltan las variables de entorno SMTP_USER, SMTP_PASS o SENDER_EMAIL');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, 
    },
});

const verifySMTPConnection = async () => {
    try {
        await transporter.verify();
        console.log('Conexión exitosa con SMTP');
    } catch (error) {
        console.error('Error al conectar con SMTP:', error);
        process.exit(1); 
    }
};

verifySMTPConnection();

export const sendEmail = async (req, res) => {
    const { email, estadoReclamo } = req.body;
    
    if (!email || !estadoReclamo) {
        return res.status(400).json({ success: false, message: 'El correo electrónico y el estado del reclamo son requeridos' });
    }

    if (estadoReclamo !== 'aceptado' && estadoReclamo !== 'rechazado') {
        return res.status(400).json({ success: false, message: 'Estado de reclamo inválido. Debe ser "aceptado" o "rechazado".' });
    }

    const asunto = estadoReclamo === 'aceptado' ? 'Su reclamo ha sido aceptado' : 'Su reclamo ha sido rechazado';
    const texto = estadoReclamo === 'aceptado'
        ? `Estimado cliente, su reclamo ha sido aceptado. Procederemos con los pasos necesarios para resolverlo.`
        : `Estimado cliente, su reclamo ha sido rechazado. Lamentamos informarle que no cumplió con los requisitos necesarios.`;

    try {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: asunto,
            text: texto,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: 'Correo enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
    }
}