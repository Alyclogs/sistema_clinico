<?php
session_start();

// Verificamos si el usuario está autenticado
if (!isset($_SESSION['idusuario'])) {
    header("Location: http://localhost/SistemaClinico/views/Clinica/login.php");
    exit;
}

$nombreUsuario = $_SESSION['nombre'];  // Nombre completo
$rolUsuario = $_SESSION['rol'];        // Rol del usuario (ej. Gerente)
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Inicio</title>
</head>
<body>
    <h1>Hola <?php echo htmlspecialchars($rolUsuario); ?></h1>
    <p>Bienvenido, <?php echo htmlspecialchars($nombreUsuario); ?>.</p>

    <!-- Aquí puedes colocar más contenido según el rol -->
</body>
</html>
