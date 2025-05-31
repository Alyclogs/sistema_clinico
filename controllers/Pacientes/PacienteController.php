<?php
require_once __DIR__ . '/../../models/Pacientes/PacienteModel.php';

header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : '';
$model = new PacientesModel();
switch ($action) {
    case 'buscar':
        // Verificamos si hay un filtro (nombre, apellido o dni)
        $filtro = isset($_GET['filtro']) ? trim($_GET['filtro']) : null;

        // Ejecutamos la búsqueda con o sin filtro
        $result = $model->obtenerPacientesFiltrados($filtro);
        echo json_encode($result);
        break;

    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}
