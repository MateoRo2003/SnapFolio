<?php
// Permitir respuestas JSON
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Obtenemos el JSON enviado por fetch en JS
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $name = strip_tags(trim($data["name"] ?? ''));
    $email = filter_var(trim($data["email"] ?? ''), FILTER_SANITIZE_EMAIL);
    $subject = strip_tags(trim($data["subject"] ?? ''));
    $message = trim($data["message"] ?? '');

    // Validación
    if (empty($name) || empty($message) || empty($subject) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "Por favor, completa todos los campos correctamente."]);
        exit;
    }

    // Correo de destino
    $recipient = "rojas.mateo.web@gmail.com";
    
    // Asunto del correo
    $email_subject = "Nuevo mensaje de tu Portfolio: $subject";
    
    // Cuerpo del correo
    $email_content = "Has recibido un nuevo mensaje desde el formulario de tu web.\n\n";
    $email_content .= "Nombre: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Mensaje:\n$message\n";

    // Cabeceras (Hostinger requiere que el From sea del mismo dominio o al menos uno estándar para evitar bloqueos por Spam)
    $email_headers = "From: contacto@mateorojas.com.ar\r\n";
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Enviar correo (usando PHP Mail de Hostinger)
    if (mail($recipient, $email_subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "¡Mensaje enviado correctamente!"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error del servidor. No se pudo enviar el correo."]);
    }
} else {
    // Si acceden por GET u otro método
    http_response_code(403);
    echo json_encode(["error" => "Método no permitido. Usa POST."]);
}
?>
