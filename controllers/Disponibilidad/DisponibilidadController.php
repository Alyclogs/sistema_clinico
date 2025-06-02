<?php
require_once __DIR__ . '/../../models/Disponibilidad/DisponibilidadModel.php';

header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : '';
$model = new DisponibilidadModel();

switch ($action) {
    case 'read':
        if (isset($_GET['idespecialista'])) {
            $idespecialista = intval($_GET['idespecialista']);
            $result = $model->obtenerPorEspecialista($idespecialista);
            echo json_encode($result);
        } else {
            echo json_encode([]);
        }
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}