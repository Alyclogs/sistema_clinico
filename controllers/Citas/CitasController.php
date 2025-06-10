<?php
require_once __DIR__ . '/../../models/Citas/CitasModel.php';

header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : '';
$model = new CitasModel();

switch ($action) {
    case 'read':
        try {
            if (isset($_GET['idservicio'])) {
                $idservicio = intval($_GET['idservicio']);
                if (isset($_GET['idespecialista'])) {
                    $idespecialista = intval($_GET['idespecialista']);
                    $result = $model->obtenerCitasPorEspecialistayServicio($idespecialista, $idservicio);
                    echo json_encode($result);
                    return;
                } else if (isset($_GET['idarea'])) {
                    $idarea = intval($_GET['idarea']);
                    $result = $model->obtenerCitasPorAreayServicio($idarea, $idservicio);
                    echo json_encode($result);
                    return;
                } else if (isset($_GET['idsubarea'])) {
                    $idsubarea = intval($_GET['isdubarea']);
                    $result = $model->obtenerCitasPorSubareayServicio($idsubarea, $idservicio);
                    echo json_encode($result);
                    return;
                } else {
                    $result = $model->obtenerCitasPorServicio($idservicio);
                    echo json_encode($result);
                    return;
                }
            } else {
                if (isset($_GET['idespecialista'])) {
                    $idespecialista = intval($_GET['idespecialista']);
                    $result = $model->obtenerCitasPorEspecialista($idespecialista);
                    echo json_encode($result);
                    return;
                } else if (isset($_GET['idarea'])) {
                    $idarea = intval($_GET['idarea']);
                    $result = $model->obtenerCitasPorArea($idarea);
                    echo json_encode($result);
                    return;
                } else if (isset($_GET['idsubarea'])) {
                    $idsubarea = intval($_GET['isdubarea']);
                    $result = $model->obtenerCitasPorSubarea($idsubarea);
                    echo json_encode($result);
                    return;
                } else {
                    $result = $model->obtenerCitas();
                    echo json_encode($result);
                    return;
                }
            }
        } catch (Exception $e) {
            echo json_encode(['error' => 'Error: ' . $e]);
            return;
        }
        break;

    case 'create':
        if (isset($_POST['data'])) {
            try {
                $data = json_decode($_POST['data'], true);
                $mensaje = $data;
                $result = $model->crearCita($data);
                echo json_encode(['success' => $result, 'message' => $mensaje]);
            } catch (Exception $e) {
                echo json_encode(['error' => 'Error al agendar cita' . $e]);
            }
        } else {
            echo json_encode(['error' => 'Datos no proporcionados']);
        }
        break;


    default:
        echo json_encode(['error' => 'Accion no valida']);
        break;
}
