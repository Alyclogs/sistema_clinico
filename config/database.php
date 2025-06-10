<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'neuroeduca_admindatabase'); // Cambia 'tu_usuario' al nombre de usuario de tu base de datos
define('DB_PASS', 'oAuyHiR~OKbt'); // Cambia 'tu_contraseña' a tu contraseña de
define('DB_NAME', 'neuroeduca_sistema_clinico');

function connectDatabase() {
    try {
        // Usar charset utf8mb4 para mejor soporte de caracteres
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";

        $pdo = new PDO($dsn, DB_USER, DB_PASS);

        // Configurar PDO para lanzar excepciones en caso de error
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $pdo;
    } catch (PDOException $e) {
        die("Error de conexión a la base de datos: " . $e->getMessage());
    }
}

function isDatabaseConnected($pdo) {
    // Aquí podrías hacer un simple query para verificar conexión si quieres, 
    // pero para simplificar dejamos así:
    return $pdo !== null;
}

function closeDatabase(&$pdo) {
    // Se pasa por referencia para modificar el valor original y cerrar la conexión
    $pdo = null;
}

// Ejemplo de uso
try {
    $pdo = connectDatabase();
    if (isDatabaseConnected($pdo)) {
        // Aquí va el código que use la conexión
    } else {
        echo "No se pudo conectar a la base de datos.";
    }
    closeDatabase($pdo);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
