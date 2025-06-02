<?php
require_once __DIR__ . '/../../models/Users/UserModel.php';

$modelo = new UsuarioModel();
$mensaje = '';
$success = false;

try {
    if (!isset($_GET['action'])) {
        throw new Exception('Error: Acción no especificada.');
    }

    $action = $_GET['action'];

    switch ($action) {
        case 'read':
            $usuarios = $modelo->obtenerUsuarios();
            echo json_encode($usuarios);
            exit;

        case 'delete':
    $id = $_POST['idUsuario']; // <-- cambio aquí
    if (!is_numeric($id)) {
        throw new Exception('Error: ID inválido.');
    }
    $success = $modelo->eliminarUsuario($id);
    $mensaje = $success ? 'Usuario eliminado correctamente.' : 'Error al eliminar el usuario.';
    break;
    
    case 'buscar':
         $filtro = $_GET['filtro'] ?? '';
    $usuarios = $modelo->buscarUsuarios($filtro);
    echo json_encode($usuarios);
    exit;
        break;
        
        
        
        


        case 'update':
            $id = $_POST['idUsuario'];
            if (!is_numeric($id)) {
                throw new Exception('Error: ID inválido.');
            }

            $nombres = ucwords($_POST['nombres']);
            $apellidos = ucwords($_POST['apellidos']);
            $dni = $_POST['dni'];
            $telefono = !empty($_POST['telefono']) ? $_POST['telefono'] : null;
            $correo = !empty($_POST['correo']) ? $_POST['correo'] : null;
            $idrol = $_POST['idRol'];
            $idestado = $_POST['idEstado'];
            $usuario = strtolower(trim($_POST['usuario']));
            $password = $_POST['password'];

            $success = $modelo->actualizarUsuario($id, $nombres, $apellidos, $dni, $telefono, $correo, $idestado, $idrol, $usuario, $password);
            $mensaje = $success ? 'Usuario actualizado correctamente.' : 'Error al actualizar el usuario.';
            break;

        case 'create':
            $usuario = strtolower(trim($_POST['usuario']));
            $password = $_POST['password'];

            if ($modelo->existeUsuario($usuario)) {
                throw new Exception('Error: El nombre de usuario ya existe.');
            }

            if (!preg_match('/^\d{8}$/', $password)) {
                throw new Exception('Error: La contraseña debe tener exactamente 8 dígitos numéricos.');
            }

            $nombres = ucwords($_POST['nombres']);
            $apellidos = ucwords($_POST['apellidos']);
            $dni = $_POST['dni'];
            $telefono = !empty($_POST['telefono']) ? $_POST['telefono'] : null;
            $correo = !empty($_POST['correo']) ? $_POST['correo'] : null;
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $idrol = $_POST['idRol'];
            $idestado = 1;

            $success = $modelo->guardarUsuario($nombres, $apellidos, $dni, $telefono, $correo, $idestado, $idrol, $usuario, $passwordHash);
            $mensaje = $success ? 'Registro exitoso.' : 'Error al registrar el usuario.';
            break;

        default:
            throw new Exception('Error: Acción no válida.');
    }

} catch (Exception $e) {
    $mensaje = $e->getMessage();
    $success = false;
}

// Salida JSON estándar
header('Content-Type: application/json');
echo json_encode([
    'success' => $success,
    'message' => $mensaje
]);
