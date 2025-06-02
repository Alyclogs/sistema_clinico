<?php
require_once __DIR__ . '/../../models/Subareas/SubareaModel.php';

$modelo = new SubareaModel();
$mensaje = '';
$action = $_GET['action'];
$idarea = $_GET['idarea'];

if ($action === "read") {
    if ($idarea !== null) {
        $subareas = $modelo->obtenerSubareaPorIdArea($idarea);
        echo json_encode($subareas);
        exit;
    }
    $subareas = $modelo->obtenerSubareas();
    echo json_encode($subareas);
    exit;
} elseif ($action === "delete") {
    $id = $_GET['idarea'];
    if (is_numeric($id)) {
        $resultado = $modelo->eliminarSubarea($id);
        $mensaje = $resultado ? 'Subarea eliminado correctamente.' : 'Error al eliminar el area.';
    } else {
        $mensaje = 'Error: ID inválido.';
    }
} elseif ($action === "update") {
    $id = $_POST['idarea'];
    $subarea = trim($_POST['subarea']);
    $idarea = trim($_POST['idarea']);
    if (is_numeric($id) && $subarea !== '') {
        $resultado = $modelo->actualizarSubarea($id, $subarea, $idarea);
        $mensaje = $resultado ? 'Subarea actualizado correctamente.' : 'Error al actualizar el area.';
    } else {
        $mensaje = 'Error: Datos inválidos.';
    }
} elseif ($action === "create") {
    $subarea = trim($_POST['subarea']);
    $idarea = trim($_POST['idarea']);
    if ($subarea === '') {
        $mensaje = 'Error: El nombre del area es obligatorio.';
    } else {
        $resultado = $modelo->guardarSubarea($subarea, $idarea);
        $mensaje = $resultado ? 'Subarea registrado exitosamente.' : 'Error al registrar el area.';
    }
} else {
    $mensaje = 'Error: Acción no válida.';
}

header('Content-Type: application/json');
echo json_encode([
    'success' => strpos($mensaje, 'Error') === false,
    'message' => $mensaje
]);