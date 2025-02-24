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
    const { email, estadoReclamo, motivo } = req.body;
    
    if (!email || !estadoReclamo || !motivo ) {
        return res.status(400).json({ success: false, message: 'El correo electrónico y el estado del reclamo son requeridos' });
    }

    let asunto
    let texto
    if(motivo === 'recepcion'){
        asunto= "Recepcion de su reclamo"
        texto= "Su reclamo ha sido recibido, a continucaion procederemos a darle cumplimiento, para mas informacion su numero de reclamo es 001 "
    }
    if(motivo === 'area'){
        asunto= "Asignacion de su reclamo"
        texto= `Su reclamo ha sido atendido por el area de ${estadoReclamo}`
    }
    if(motivo === 'respuesta'){
        asunto= "Resolucion del reclamo"
        texto = estadoReclamo === "positivo" ? "Reclamo solventado, porfavor revisa la documentacion adjunta para conocer el resultado" : "Reclamo no resuelto, por favor comunicate nuevamente con el banco"
    }
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