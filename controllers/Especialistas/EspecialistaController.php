<?php
require_once __DIR__ . '/../../models/Especialistas/EspecialistaModel.php';

$modelo = new EspecialistaModel();
$mensaje = '';
$action = $_GET['action'];
$idarea = $_GET['idarea'];
$idsubarea = $_GET['idsubarea'];

if ($action === "read") {
    if ($idarea != null && $idsubarea != null) {
        $especialistas = $modelo->obtenerEspecialistaPorAreaySubarea($idarea, $idsubarea);
        echo json_encode($especialistas);
        exit;
    }
    $especialistas = $modelo->obtenerEspecialistas();
    echo json_encode($especialistas);
    exit;
} elseif ($action === "delete") {
    $id = $_GET['idEspecialista'];
    if (is_numeric($id)) {
        $resultado = $modelo->eliminarEspecialista($id);
        $mensaje = $resultado ? 'Especialista eliminado correctamente.' : 'Error al eliminar el especialista.';
    } else {
        $mensaje = 'Error: ID inválido.';
    }
} elseif ($action === "update") {
    /*
    $id = $_POST['idEspecialista'];
    $nombres = ucwords($_POST['nombres']);
    $apellidos = ucwords($_POST['apellidos']);
    $dni = $_POST['dni'];
    $telefono = $_POST['telefono'];
    $correo = $_POST['correo'];
    $idrol = $_POST['idRol'];
    $idestado = $_POST['idEstado'];
    $especialista = strtolower(trim($_POST['especialista']));
    $password = $_POST['password'];

    if (is_numeric($id)) {
        $resultado = $modelo->actualizarEspecialista($id, $nombres, $apellidos, $dni, $telefono, $correo, $idestado, $idrol, $especialista, $password);
        $mensaje = $resultado ? 'Especialista actualizado correctamente.' : 'Error al actualizar el especialista.';
    } else {
        $mensaje = 'Error: ID inválido.';
    }
        */
} elseif ($action === "create") {

    
    $especialista = $_POST['especialista'];
    $password = $_POST['password'];
    $especialista = strtolower(trim($especialista));

    if ($modelo->existeEspecialista($especialista)) {
        $mensaje = 'Error: El nombre de especialista ya existe.';
    } elseif (!preg_match('/^\d{8}$/', $password)) {
        $mensaje = 'Error: La contraseña debe tener exactamente 8 dígitos numéricos.';
    } else {
       $nombres     = ucwords($_POST['nombres']);
$apellidos   = ucwords($_POST['apellidos']);
$dni         = $_POST['dni'];
$telefono    = $_POST['telefono'];
$correo      = $_POST['correo'];
$usuario     = strtolower($_POST['especialista']); // o cualquier valor válido
$password    = $_POST['password'];
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$idarea      = $_POST['idArea'];
$idsubarea   = $_POST['idSubArea'];
$idrol       = 3; // ejemplo
$idestado    = 1; // activo

$resultado = $modelo->guardarEspecialista(
    $nombres, $apellidos, $dni, $telefono, $correo,
    $idestado, $idrol, $usuario, $passwordHash,
    $idarea, $idsubarea
);

        $mensaje = $resultado ? 'Registro exitoso.' : 'Error al registrar el especialista.';
    }
        
} else {
    $mensaje = 'Error: Acción no válida.';
}

header('Content-Type: application/json');
echo json_encode([
    'success' => strpos($mensaje, 'Error') === false,
    'message' => $mensaje
]);