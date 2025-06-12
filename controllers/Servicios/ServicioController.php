<?php
require_once __DIR__ . '/../../models/Servicios/ServicioModel.php';

$modelo = new ServicioModel();
$mensaje = '';
$action = $_GET['action'];

if ($action === "read") {
    $servicios = $modelo->obtenerServicios();
    echo json_encode($servicios);
    exit;
} elseif ($action === "delete") {
    $id = $_GET['idservicio'];
    if (is_numeric($id)) {
        $resultado = $modelo->eliminarServicio($id);
        $mensaje = $resultado ? 'Servicio eliminado correctamente.' : 'Error al eliminar el servicio.';
    } else {
        $mensaje = 'Error: ID inválido.';
    }
} elseif ($action === "update") {
    $id = $_POST['idservicio'];
    $servicio = trim($_POST['servicio']);
    $idservicio = trim($_POST['idservicio']);
    if (is_numeric($id) && $servicio !== '') {
        $resultado = $modelo->actualizarServicio($id, $servicio, $idservicio);
        $mensaje = $resultado ? 'Servicio actualizado correctamente.' : 'Error al actualizar el servicio.';
    } else {
        $mensaje = 'Error: Datos inválidos.';
    }
} elseif ($action === "create") {
    $servicio = trim($_POST['servicio']);
    $idservicio = trim($_POST['idservicio']);
    if ($servicio === '') {
        $mensaje = 'Error: El nombre del servicio es obligatorio.';
    } else {
        $resultado = $modelo->guardarServicio($servicio, $idservicio);
        $mensaje = $resultado ? 'Servicio registrado exitosamente.' : 'Error al registrar el servicio.';
    }
} else {
    $mensaje = 'Error: Acción no válida.';
}

header('Content-Type: application/json');
echo json_encode([
    'success' => strpos($mensaje, 'Error') === false,
    'message' => $mensaje
]);
