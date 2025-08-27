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
      user: "mateo.ro.web@gmail.com",
      pass: "ezvu thqg jdpm mfnn"
    }
  });

  try {
    await transporter.sendMail({
      from: email,
      to: "mateo.ro.web@gmail.com", // tu correo donde recibirás los mensajes
      subject: `Nuevo mensaje: ${subject}`,
      text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`
    });

    return res.status(200).json({ message: "Correo enviado correctamente!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error enviando el correo." });
  }
}
