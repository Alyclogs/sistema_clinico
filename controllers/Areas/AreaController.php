<?php
require_once __DIR__ . '/../../models/Areas/AreaModel.php';

$modelo = new AreaModel();
$mensaje = '';
$action = $_GET['action'];

if ($action === "read") {
    $areas = $modelo->obtenerAreas();
    echo json_encode($areas);
    exit;
} elseif ($action === "delete") {
    $id = $_GET['idarea'];
    if (is_numeric($id)) {
        $resultado = $modelo->eliminarArea($id);
        $mensaje = $resultado ? 'Area eliminado correctamente.' : 'Error al eliminar el area.';
    } else {
        $mensaje = 'Error: ID inválido.';
    }
} elseif ($action === "update") {
    $id = $_POST['idarea'];
    $area = trim($_POST['area']);
    if (is_numeric($id) && $area !== '') {
        $resultado = $modelo->actualizarArea($id, $area);
        $mensaje = $resultado ? 'Area actualizado correctamente.' : 'Error al actualizar el area.';
    } else {
        $mensaje = 'Error: Datos inválidos.';
    }
} elseif ($action === "create") {
    $area = trim($_POST['area']);
    if ($area === '') {
        $mensaje = 'Error: El nombre del area es obligatorio.';
    } else {
        $resultado = $modelo->guardarArea($area);
        $mensaje = $resultado ? 'Area registrado exitosamente.' : 'Error al registrar el area.';
    }
} else {
    $mensaje = 'Error: Acción no válida.';
}

header('Content-Type: application/json');
echo json_encode([
    'success' => strpos($mensaje, 'Error') === false,
    'message' => $mensaje
]);
