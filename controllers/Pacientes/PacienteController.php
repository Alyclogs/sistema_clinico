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
    case 'create':
        if (isset($_POST['data'])) {
            $data = json_decode($_POST['data'], true);
            $mensaje = 'Paciente agregado correctamente';
            $paciente_id = $model->crearPaciente($data);
            if ($paciente_id != null) {
                $result = true;
            } else {
                echo json_encode(['error' => 'No existe id de paciente']);
            }
            echo json_encode(['success' => $result, 'message' => $mensaje, 'paciente_id' => $paciente_id]);
        } else {
            echo json_encode(['error' => 'Datos no proporcionados']);
        }
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}
