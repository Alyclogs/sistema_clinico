<?php
require_once __DIR__ . '/../../models/Users/UserModel.php';

$modelo = new UsuarioModel();
$mensaje = '';
$action = $_GET['action'];

/*
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    $action = $_GET['action'];
} else {
    $mensaje = 'Error: No se recibió una solicitud POST.';
}
    */

if ($action === "read") {
    $usuarios = $modelo->obtenerUsuarios();
    echo json_encode($usuarios);
    exit;
} elseif ($action === "delete") {
    $id = $_GET['idUsuario'];
    if (is_numeric($id)) {
        $resultado = $modelo->eliminarUsuario($id);
        $mensaje = $resultado ? 'Usuario eliminado correctamente.' : 'Error al eliminar el usuario.';
    } else {
        $mensaje = 'Error: ID inválido.';
    }
} elseif ($action === "update") {
    $id = $_POST['idUsuario'];
    $nombres = ucwords($_POST['nombres']);
    $apellidos = ucwords($_POST['apellidos']);
    $dni = $_POST['dni'];
    $telefono = $_POST['telefono'];
    $correo = $_POST['correo'];
    $idrol = $_POST['idRol'];
    $idestado = $_POST['idEstado'];
    $usuario = strtolower(trim($_POST['usuario']));
    $password = $_POST['password'];

    if (is_numeric($id)) {
        $resultado = $modelo->actualizarUsuario($id, $nombres, $apellidos, $dni, $telefono, $correo, $idestado, $idrol, $usuario, $password);
        $mensaje = $resultado ? 'Usuario actualizado correctamente.' : 'Error al actualizar el usuario.';
    } else {
        $mensaje = 'Error: ID inválido.';
    }
} elseif ($action === "create") {

    $usuario = $_POST['usuario'];
    $password = $_POST['password'];
    $usuario = strtolower(trim($usuario));

    if ($modelo->existeUsuario($usuario)) {
        $mensaje = 'Error: El nombre de usuario ya existe.';
    } elseif (!preg_match('/^\d{8}$/', $password)) {
        $mensaje = 'Error: La contraseña debe tener exactamente 8 dígitos numéricos.';
    } else {
        $nombres = ucwords($_POST['nombres']);
        $apellidos = ucwords($_POST['apellidos']);
        $dni = $_POST['dni'];
        $telefono = $_POST['telefono'];
        $correo = $_POST['correo'];
        $password = password_hash($password, PASSWORD_DEFAULT);
        $idrol = $_POST['idRol'];
        $idestado = $_POST['idEstado'];

        $resultado = $modelo->guardarUsuario($nombres, $apellidos, $dni, $telefono, $correo, $idestado, $idrol, $usuario, $password);

        $mensaje = $resultado ? 'Registro exitoso.' : 'Error al registrar el usuario.';
    }
} else {
    $mensaje = 'Error: Acción no válida.';
}

header('Content-Type: application/json');
echo json_encode([
    'success' => strpos($mensaje, 'Error') === false,
    'message' => $mensaje
]);
