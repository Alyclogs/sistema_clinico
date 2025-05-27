<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso - Sistema Clínico</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/login.css">

</head>

<body>
    <div class="login-card">
        <div class="login-card-header">
            <div class="icon"><i class="bi bi-heart-pulse-fill"></i></div> <!-- Icono médico -->
            <h2>Sistema Clínico</h2>
        </div>
        <div class="login-card-body">
            <h3 class="text-center mb-4" style="color: #333; font-weight: 500;">Iniciar Sesión</h3>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger alert-custom" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i><?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>
            <form method="POST" action="http://localhost/SistemaClinico/controllers/Users/procesarIngresarLogin.php">
                <div class="mb-3">
                    <label for="usuario" class="form-label visually-hidden">Usuario:</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                        <input type="text" class="form-control" id="usuario" name="usuario" placeholder="Nombre de usuario" required>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="password" class="form-label visually-hidden">Contraseña:</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                        <input type="password" class="form-control" id="password" name="password" placeholder="Contraseña" required>
                    </div>
                </div>

                <button type="submit" class="btn btn-login w-100">Entrar</button>
            </form>
        </div>
        <div class="card-footer text-center py-3" style="background-color: #f8f9fa; border-top: 1px solid #dee2e6;">
            <small class="text-muted">&copy; <?php echo date("Y"); ?> Sistema Clínico. Todos los derechos reservados.</small>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>