<?php
require_once __DIR__ . '/../../models/Roles/RoleModel.php';

$modelo = new RoleModel();
$mensaje = '';
$action = $_GET['action'];

if ($action === "read") {
    $roles = $modelo->obtenerRoles();
    echo json_encode($roles);
    exit;
} elseif ($action === "delete") {
    $id = $_GET['idrol'];
    if (is_numeric($id)) {
        $resultado = $modelo->eliminarRol($id);
        $mensaje = $resultado ? 'Rol eliminado correctamente.' : 'Error al eliminar el rol.';
    } else {
        $mensaje = 'Error: ID inválido.';
    }
} elseif ($action === "update") {
    $id = $_POST['idrol'];
    $rol = trim($_POST['rol']);
    if (is_numeric($id) && $rol !== '') {
        $resultado = $modelo->actualizarRol($id, $rol);
        $mensaje = $resultado ? 'Rol actualizado correctamente.' : 'Error al actualizar el rol.';
    } else {
        $mensaje = 'Error: Datos inválidos.';
    }
} elseif ($action === "create") {
    $rol = trim($_POST['rol']);
    if ($rol === '') {
        $mensaje = 'Error: El nombre del rol es obligatorio.';
    } else {
        $resultado = $modelo->guardarRol($rol);
        $mensaje = $resultado ? 'Rol registrado exitosamente.' : 'Error al registrar el rol.';
    }
} else {
    $mensaje = 'Error: Acción no válida.';
}

header('Content-Type: application/json');
echo json_encode([
    'success' => strpos($mensaje, 'Error') === false,
    'message' => $mensaje
]);