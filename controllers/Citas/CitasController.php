<?php
require_once __DIR__ . '/../../models/Citas/CitasModel.php';

header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : '';
$model = new CitasModel();

switch ($action) {
    case 'read':
        if (isset($_GET['idcita'])) {
            $result = $model->obtenerCitaPorId($_GET['idcita']);
            echo json_encode($result);
            return;
        }
        if (isset($_GET['idpaciente'])) {
            $result = $model->obtenerCitasPorPaciente($_GET['idpaciente']);
            echo json_encode($result);
            return;
        }
        if (isset($_GET['idespecialista'])) {
            if (isset($_GET['idarea'])) {
                if (isset($_GET['idsubarea'])) {
                    $result = $model->obtenerCitasPorEspecialistayAreaySubarea($_GET['idespecialista'], $_GET['idarea'], $_GET['idsubarea'], $_GET['idservicio']);
                    echo json_encode($result);
                    return;
                } else {
                    $result = $model->obtenerCitasPorEspecialistayArea($_GET['idespecialista'], $_GET['idarea'], $_GET['idservicio']);
                    echo json_encode($result);
                    return;
                }
            } else {
                if (isset($_GET['idservicio'])) {
                    $result = $model->obtenerCitasPorEspecialistayServicio($_GET['idespecialista'], $_GET['idservicio']);
                    echo json_encode($result);
                    return;
                } else {
                    if (isset($_GET['fecha'])) {
                        $result = $model->obtenerCitasPorEspecialistayFecha($_GET['idespecialista'], $_GET['fecha']);
                        echo json_encode($result);
                        return;
                    } else if (isset($_GET['fechainicio'])) {
                        $result = $model->obtenerCitasPorEspecialistayFechaInicio($_GET['idespecialista'], $_GET['fechainicio']);
                        echo json_encode($result);
                        return;
                    } else {
                        $result = $model->obtenerCitasPorEspecialista($_GET['idespecialista']);
                        echo json_encode($result);
                        return;
                    }
                }
            }
        } else {
            if (isset($_GET['idarea'])) {
                if (isset($_GET['idsubarea'])) {
                    $result = $model->obtenerCitasPorAreaySubarea($_GET['idarea'], $_GET['idsubarea'], $_GET['idservicio']);
                    echo json_encode($result);
                    return;
                } else {
                    $result = $model->obtenerCitasPorArea($_GET['idarea'], $_GET['idservicio']);
                    echo json_encode($result);
                    return;
                }
            } else {
                $result = $model->obtenerCitasPorServicio($_GET['idservicio']);
                echo json_encode($result);
                return;
            }
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

    case 'update':
        if (isset($_POST['data'])) {
            try {
                $data = json_decode($_POST['data'], true);
                $mensaje = $data;
                $result = $model->actualizarCita($data);
                echo json_encode(['success' => $result, 'message' => $mensaje]);
            } catch (Exception $e) {
                echo json_encode(['error' => 'Error al actualizar cita' . $e]);
            }
        } else {
            echo json_encode(['error' => 'Datos no proporcionados']);
        }
        break;


    default:
        echo json_encode(['error' => 'Accion no valida']);
        break;
}
