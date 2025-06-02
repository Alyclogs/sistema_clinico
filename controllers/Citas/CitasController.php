<?php
require_once __DIR__ . '/../../models/Citas/CitasModel.php';

header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : '';
$model = new CitasModel();

switch ($action) {
    case 'read':
        if (isset($_GET['idespecialista'])) {
            $idespecialista = intval($_GET['idespecialista']);
            $result = $model->obtenerCitasPorEspecialista($idespecialista);
            echo json_encode($result);
        } else {
            echo json_encode([]);
        }
        break;
        
          case 'create':
        if (isset($_POST['data'])) {
            $data = json_decode($_POST['data'], true);
            $mensaje = $data;
            $result = $model->crearCita($data);
            echo json_encode(['success' => $result, 'message' => $mensaje]);
        } else {
            echo json_encode(['error' => 'Datos no proporcionados']);
        }
        break;
        
        
    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}