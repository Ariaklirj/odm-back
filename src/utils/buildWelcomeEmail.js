function buildWelcomeEmail(firstName, email, password, portalUrl) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido(a) a ODM</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#451242;padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                🎉 Bienvenido(a) a ODM
              </p>
              <p style="margin:6px 0 0;color:#f0d0ec;font-size:14px;">
                Acceso a tu portal académico
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;color:#333333;font-size:15px;line-height:1.6;">
              <p>Hola <strong>${firstName}</strong>,</p>
              <p>
                Tu inscripción en ODM ha sido confirmada exitosamente.<br />
                Nos alegra darte la bienvenida a nuestra comunidad académica.<br />
                A continuación encontrarás tus datos de acceso al Portal Académico ODM:
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f5eef5;border:1px solid #451242;border-radius:8px;margin:20px 0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:14px;">
                      <strong>Usuario:</strong> ${email}
                    </p>
                    <p style="margin:0;font-size:14px;">
                      <strong>Contraseña temporal:</strong> ${password}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Portal button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td>
                    <a href="${portalUrl}"
                       style="display:inline-block;background:#ff7300;color:#ffffff;
                              font-weight:700;font-size:15px;padding:12px 28px;
                              border-radius:999px;text-decoration:none;">
                      🔗 Accede aquí al portal
                    </a>
                  </td>
                </tr>
              </table>

              <p>
                Para completar tu expediente académico, será necesario presentar
                la siguiente documentación:
              </p>
              <ul style="padding-left:20px;margin:8px 0 16px;">
                <li>Acta de nacimiento</li>
                <li>CURP</li>
                <li>Certificado de estudios del nivel anterior</li>
                <li>Identificación oficial</li>
                <li>Comprobante de domicilio</li>
                <li>(O los documentos específicos según el programa elegido)</li>
              </ul>

              <p>
                En los próximos días, nuestro equipo de admisiones se pondrá en
                contacto contigo para indicarte:
              </p>
              <ul style="padding-left:20px;margin:8px 0 16px;">
                <li>La documentación exacta requerida</li>
                <li>El formato en que deberás enviarla (digital o físico)</li>
                <li>Las fechas límite para su entrega</li>
                <li>El procedimiento de validación</li>
              </ul>

              <p>
                Es importante completar este proceso para formalizar tu expediente
                académico ante la institución.
              </p>
              <p>
                Si tienes cualquier duda, nuestro equipo está listo para
                acompañarte en cada paso.<br />
                Bienvenido(a) a ODM.<br />
                Hoy comienza una nueva etapa en tu desarrollo profesional.
              </p>

              <hr style="border:none;border-top:1px solid #eeeeee;margin:24px 0;" />
              <p style="margin:0;font-size:14px;color:#555555;">
                Atentamente,<br />
                <strong>Equipo de Admisiones</strong><br />
                ODM
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = buildWelcomeEmail;
