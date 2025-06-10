<?php
require_once __DIR__ . '/../../models/Especialistas/EspecialistaModel.php';

$modelo = new EspecialistaModel();
$mensaje = '';
$action = $_GET['action'];
$idservicio = $_GET['idservicio'] ?? '';
$idarea = $_GET['idarea'] ?? '';
$idsubarea = $_GET['idsubarea'] ?? '';

if ($action === "read") {
  try {
    if ($idservicio !== '' && $idarea !== '' && $idsubarea !== '') {
      $especialistas = $modelo->obtenerEspecialistaPorAreaySubareayServicio($idarea, $idsubarea, $idservicio);
      echo json_encode($especialistas);
      exit;
    }
    if ($idservicio !== '' && $idarea !== '') {
      $especialistas = $modelo->obtenerEspecialistaPorAreayServicio($idarea, $idservicio);
      echo json_encode($especialistas);
      exit;
    }
    if ($idarea !== '') {
      $especialistas = $modelo->obtenerEspecialistaPorArea($idarea);
      echo json_encode($especialistas);
      exit;
    }
    $especialistas = $modelo->obtenerEspecialistas();
    echo json_encode($especialistas);
    exit;
  } catch (Exception $e) {
    $mensaje = $e;
  }
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
  try {
    $especialista = strtolower(trim($_POST['especialista']));
    $password = $_POST['password'];

    if ($modelo->existeEspecialista($especialista)) {
      throw new Exception('Error: El nombre de usuario ya existe.');
    } elseif (!preg_match('/^\d{8}$/', $password)) {
      throw new Exception('Error: La contraseña debe tener exactamente 8 dígitos numéricos.');
    } else {
      $nombres      = ucwords($_POST['nombres']);
      $apellidos    = ucwords($_POST['apellidos']);
      $dni          = $_POST['dni'];
      $telefono     = $_POST['telefono'];
      $correo       = $_POST['correo'];
      $usuario      = $especialista;
      $passwordHash = password_hash($password, PASSWORD_DEFAULT);
      $idrol        = 3;
      $idestado     = 1;
      $sexo         = $_POST['sexo'];

      // ✅ Eliminar servicios duplicados
      $_POST['idServicio'] = array_unique($_POST['idServicio']);

      // 🔄 Reconstruir array de especialidades correctamente
      $especialidades = [];

      foreach ($_POST['idServicio'] as $idservicio) {
        $idarea   = $_POST['idArea'][$idservicio] ?? null;
        $subareas = $_POST['idSubArea'][$idservicio] ?? [];

        // Si no hay subáreas (ej. Evaluación), igual se guarda el área sola
        if (empty($subareas)) {
          $especialidades[] = [
            'idservicio' => $idservicio,
            'idarea'     => $idarea,
            'idsubarea'  => null
          ];
        } else {
          foreach ($subareas as $idsubarea) {
            $especialidades[] = [
              'idservicio' => $idservicio,
              'idarea'     => $idarea,
              'idsubarea'  => $idsubarea
            ];
          }
        }
      }

      // 🧠 Guardar en base de datos
      $resultado = $modelo->guardarEspecialista(
        $nombres,
        $apellidos,
        $dni,
        $telefono,
        $correo,
        $idestado,
        $idrol,
        $usuario,
        $passwordHash,
        $sexo,
        $especialidades
      );

      echo json_encode(['success' => true, 'message' => 'Especialista creado exitosamente.']);
      exit;
    }
  } catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
  }
} else {
  $mensaje = 'Error: Acción no válida.';
}

header('Content-Type: application/json');
echo json_encode([
  'success' => strpos($mensaje, 'Error') === false,
  'message' => $mensaje
]);
