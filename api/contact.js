import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Configurar tu cuenta Gmail o SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rojas.mateo.web@gmail.com",
      pass: "qhrg ltho xche rwld"
    }
  });

  try {
    await transporter.sendMail({
      from: email,
      to: "mateo.ro.web@gmail.com", // tu correo donde recibirás los mensajes
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

