import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // La contraseña de aplicación de Gmail vive en las variables de entorno de Vercel (GMAIL_APP_PASSWORD),
  // nunca en el repo: es público
  if (!process.env.GMAIL_APP_PASSWORD) {
    return res.status(503).json({ success: false, error: "Correo no configurado" });
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rojas.mateo.web@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  try {
    await transporter.sendMail({
      // Gmail solo deja enviar desde la propia cuenta: quien escribió va en Reply-To para responderle directo
      from: '"Portfolio" <rojas.mateo.web@gmail.com>',
      replyTo: email,
      to: "rojas.mateo.web@gmail.com", // tu correo donde recibirás los mensajes
      subject: `Nuevo mensaje: ${subject}`,
      text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`
    });

    // IMPORTANTE: devolver JSON
    return res.status(200).json({ success: true, message: "Correo enviado" });

  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({ success: false, error: "Error al enviar el correo" });
  }
  }

