/**
 * Genera el HTML del correo de confirmación de cuenta.
 * @param {string} firstName - Nombre del usuario.
 * @param {string} verificationUrl - URL completa con id y token.
 */
const buildVerificationEmail = (firstName, verificationUrl) => {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirma tu correo</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif; color: #111111; }
    .wrapper { max-width: 620px; margin: 40px auto; background: #efebeb; border-radius: 12px; padding: 40px 48px; }
    .subject { font-size: 22px; font-weight: 400; margin: 0 0 32px; line-height: 1.3; }
    p { font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn-wrap { margin: 24px 0; }
    .btn {
      display: inline-block;
      background: #ff7300;
      color: #ffffff;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      padding: 12px 32px;
      border-radius: 999px;
    }
    .warning { margin: 0 0 16px; }
    .fallback-url { word-break: break-all; color: #451242; font-size: 14px; }
    .signature { margin-top: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <p class="subject">Asunto: Confirma tu correo y continúa tu inscripción en ODM</p>

    <p>Hola ${firstName},</p>

    <p>
      Gracias por iniciar tu proceso de inscripción en el Instituto ODM.<br />
      Para continuar, necesitamos que confirmes tu dirección de correo electrónico.<br />
      Haz clic en el siguiente botón para continuar tu proceso de inscripción.
    </p>

    <div class="btn-wrap">
      <a href="${verificationUrl}" class="btn">Confirmar correo</a>
    </div>

    <p>Este paso es necesario para validar tu registro y avanzar al siguiente paso del proceso.</p>

    <p>Si no solicitaste esta inscripción, puedes ignorar este mensaje.</p>

    <p class="warning">
      ⚠️ Si no ves el botón, copia y pega el siguiente enlace en tu navegador:<br />
      <span class="fallback-url">${verificationUrl}</span>
    </p>

    <p>Estamos listos para acompañarte en este nuevo comienzo.</p>

    <div class="signature">
      <p style="margin:0">Atentamente,<br />Equipo de Admisiones<br />ODM</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return html;
};

module.exports = buildVerificationEmail;
