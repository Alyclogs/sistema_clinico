<?php

$base_url = 'http://localhost/SistemaClinico/';


?>


<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>ONG Corazón Guerrero</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-VvmVRVZyJc4DqOJdYfN1UjtsWqW4cpCPSYmAZxE6BL9GnQJ19XQdGeCkN8dQjvX3" crossorigin="anonymous">
    <link rel="stylesheet" href="<?php echo $base_url ?>assets/css/login.css">
    <!-- Bootstrap 5 JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76A08EQmXpFZz5Jr/gkG6fsbCkJbEpHvvP4Ilc9e+OGP1zFjE0tQt4ZsPi6jizo" crossorigin="anonymous"></script>

</head>

<body>







    <div class="div-login">

        <div class="izquierdo-login">
            <div class="container-imagen">
                <img src="<?php echo $base_url ?>assets/img/logo.png">
            </div>
        </div>


        <div class="derecho-login">
            <h2>¡Bienvenido(a)</h2>
            <?php if (!empty($error)) echo "<p style='color:red;'>$error</p>"; ?>
            <form method="POST" action="http://localhost/SistemaClinico/controllers/Users/procesarIngresarLogin.php">
                <div class="mb-3">
                    <label for="usuario" class="form-label">Usuario:</label>
                    <input type="text" placeholder="Ingrese su usuario" name="usuario" id="usuario" class="form-control" required>
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">Contraseña:</label>
                    <input type="password" placeholder="Ingrese su contraseña" name="password" id="password" class="form-control" required>
                </div>

                <button type="submit" class="btn btn-primary btn-ingresar">Iniciar Sesión</button>
            </form>

            <p> ¿Olvidaste tu contraseña? <a href="">Recupérala aquí </a></p>

        </div>
    </div>




</body>

</html>