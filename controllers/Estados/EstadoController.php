<?php
require_once __DIR__ . '/../../models/Estados/EstadoModel.php';

$modelo = new EstadoModel();
$mensaje = '';
$action = $_GET['action'];

if ($action === "read") {
    $estados = $modelo->obtenerEstados();
    echo json_encode($estados);
    exit;
} elseif ($action === "delete") {
    $id = $_GET['idestado'];
    if (is_numeric($id)) {
        $resultado = $modelo->eliminarEstado($id);
        $mensaje = $resultado ? 'Estado eliminado correctamente.' : 'Error al eliminar el estado.';
    } else {
        $mensaje = 'Error: ID inválido.';
    }
} elseif ($action === "update") {
    $id = $_POST['idestado'];
    $estado = trim($_POST['estado']);
    if (is_numeric($id) && $estado !== '') {
        $resultado = $modelo->actualizarEstado($id, $estado);
        $mensaje = $resultado ? 'Estado actualizado correctamente.' : 'Error al actualizar el estado.';
    } else {
        $mensaje = 'Error: Datos inválidos.';
    }
} elseif ($action === "create") {
    $estado = trim($_POST['estado']);
    if ($estado === '') {
        $mensaje = 'Error: El nombre del estado es obligatorio.';
    } else {
        $resultado = $modelo->guardarEstado($estado);
        $mensaje = $resultado ? 'Estado registrado exitosamente.' : 'Error al registrar el estado.';
    }
} else {
    $mensaje = 'Error: Acción no válida.';
}

header('Content-Type: application/json');
echo json_encode([
    'success' => strpos($mensaje, 'Error') === false,
    'message' => $mensaje
]);