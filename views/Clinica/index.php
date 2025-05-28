<?php
session_start();

// Verificamos si el usuario está autenticado
if (!isset($_SESSION['idusuario'])) {
    header("Location: http://localhost/SistemaClinico/views/login.php");
    exit;
}

$nombreUsuario = $_SESSION['nombre'];
$rolUsuario = $_SESSION['rol'];
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inicio - Sistema Clínico</title>
    <link rel="stylesheet" href="http://localhost/SistemaClinico/assets/css/index.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>Hola, <?php echo htmlspecialchars($rolUsuario); ?></h1>
        <p class="welcome-message">Bienvenido de nuevo, <?php echo htmlspecialchars($nombreUsuario); ?>.</p>
        <p>Desde aquí podrás gestionar las diferentes secciones del sistema.</p>

        <div class="nav-links">
            <a href="usuarios/tablaUsuarios.php">Gestionar Usuarios</a>
            <a href="roles/tablaRoles.php">Gestionar Roles</a>
            <a href="estados/tablaEstados.php">Gestionar Estados</a>
        </div>
        <a href="http://localhost/SistemaClinico/controllers/Users/procesarIngresarLogin.php?logout=true" class="btn-logout">Cerrar Sesión</a>
    </div>
    <img src="assets/img/Recurso 38.png" alt="Decoración" class="body-bg-img" />
</body>

</html>