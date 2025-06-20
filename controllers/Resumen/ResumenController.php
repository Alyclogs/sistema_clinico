<?php
require_once __DIR__ . '/../../models/Resumen/ResumenModel.php';
header('Content-Type: application/json');

$modelo = new ResumenModel();
$mensaje = '';
$action = $_GET['action'];

if ($action === "read") {
    if (isset($_GET['idpaciente'])) {
        $resumenes = $modelo->obtenerResumenesPorPaciente($_GET['idpaciente']);
        echo json_encode($resumenes);
        exit;
    }
    $resumenes = $modelo->obtenerResumenes();
    echo json_encode($resumenes);
    exit;
} elseif ($action === "delete") {
    $id = $_GET['idresumen'];
    if (is_numeric($id)) {
        $resultado = $modelo->eliminarResumen($id);
        $mensaje = $resultado ? 'Resumen eliminado correctamente.' : 'Error al eliminar el resumen.';
    } else {
        $mensaje = 'Error: ID inválido.';
    }
} elseif ($action === "update") {
    if (isset($_POST['data'])) {
        $data = json_decode($_POST['data'], true);
        $resultado = $modelo->actualizarResumen($data);
        $mensaje = $resultado ? 'Resumen actualizado correctamente.' : 'Error al actualizar el resumen.';
    } else {
        $mensaje = 'Error: Datos no proporcionados.';
    }
} elseif ($action === "create") {
    if (isset($_POST['data'])) {
        $data = json_decode($_POST['data'], true);
        $resultado = $modelo->guardarResumen($data);
        $mensaje = $resultado ? 'Resumen registrado exitosamente.' : 'Error al registrar el resumen.';
    } else {
        $mensaje = 'Error: Datos no proporcionados.';
    }
} else {
    $mensaje = 'Error: Acción no válida.';
}

echo json_encode([
    'success' => strpos($mensaje, 'Error') === false,
    'message' => $mensaje
]);
