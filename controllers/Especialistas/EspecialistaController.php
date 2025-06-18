
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
    $especialistas = $modelo->obtenerEspecialistas();
    echo json_encode($especialistas);
    exit;
  } catch (Exception $e) {
    echo json_encode(['error' => 'Error al obtener especialistas: ' . $e]);
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
            $usuario = strtolower(trim($_POST['especialista']));
                          $sexo =  $_POST['sexo'];
            $password = $_POST['password'];
   $archivoFoto = $_FILES['foto'];
            $success = $modelo->actualizarEspecialista($id, $nombres, $apellidos, $dni, $telefono, $correo, $idestado, $idrol, $usuario, $password,$sexo,$archivoFoto);
            $mensaje = $success ? 'Especialista actualizado correctamente.' : 'Error al actualizar el usuario.';
      
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

      $archivoFoto = $_FILES['foto'];

      // 🧠 Guardar en base de datos
      $resultado = $modelo->guardarEspecialista(
        $nombres, $apellidos, $dni, $telefono, $correo,
        $idestado, $idrol, $usuario, $passwordHash, $sexo,$archivoFoto
      );

      echo json_encode(['success' => true, 'message' => 'Especialista creado exitosamente.']);
      exit;
    }
  } catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
  }
} elseif ($action === "guardarHorario") {
    try {
        // 1) Leer y validar el especialista
        $idespecialista = isset($_POST['idespecialista']) ? (int) $_POST['idespecialista'] : 0;
        if ($idespecialista <= 0) {
            throw new Exception('ID de especialista inválido.');
        }

        // 2) Validar fechas de inicio y fin
        $fechaInicio = $_POST['fecha_inicio'] ?? '';
        $fechaFin    = $_POST['fecha_fin']    ?? '';
        if (empty($fechaInicio) || empty($fechaFin)) {
            throw new Exception('Las fechas de inicio y fin son obligatorias.');
        }

        // 3) Definir los días de la semana
        $dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

        // 4) Recorrer cada día y sus rangos
        foreach ($dias as $dia) {
            $keyIni = "inicio_{$dia}";
            $keyFin = "fin_{$dia}";

            // Si no se envió ningún input para este día, saltar
            if (!isset($_POST[$keyIni])) {
                continue;
            }

            // Normalizar siempre a arrays
            $inicios = (array) $_POST[$keyIni];
            $fines   = (array) $_POST[$keyFin];

            // Filtrar solo los rangos donde haya al menos inicio o fin
            $pares = [];
            foreach ($inicios as $idx => $hIni) {
                $hFin = $fines[$idx] ?? '';
                if (trim($hIni) === '' && trim($hFin) === '') {
                    continue;
                }
                $pares[] = ['inicio' => $hIni, 'fin' => $hFin];
            }

            // Si no quedan rangos válidos, saltar este día
            if (empty($pares)) {
                continue;
            }

            // Leer refrigerio una sola vez por día
            $rKeyIni  = "inicio_refrigerio_{$dia}";
            $rKeyFin  = "fin_refrigerio_{$dia}";
            $refInArr = $_POST[$rKeyIni] ?? [];
            $refFnArr = $_POST[$rKeyFin] ?? [];
            $refInicio = is_array($refInArr) ? ($refInArr[0] ?? null) : $refInArr;
            $refFin    = is_array($refFnArr) ? ($refFnArr[0] ?? null) : $refFnArr;

            // Validar formato de refrigerio si viene
            if ($refInicio && !preg_match('/^\d{2}:\d{2}$/', $refInicio)) {
                throw new Exception("Formato de refrigerio inválido en $dia.");
            }
            if ($refFin && !preg_match('/^\d{2}:\d{2}$/', $refFin)) {
                throw new Exception("Formato de refrigerio inválido en $dia.");
            }

            // 5) Guardar cada rango válido usando el mismo refrigerio
            foreach ($pares as $i => $par) {
                if (!preg_match('/^\d{2}:\d{2}$/', $par['inicio']) ||
                    !preg_match('/^\d{2}:\d{2}$/', $par['fin'])) {
                    throw new Exception("Formato de hora inválido en $dia, rango #" . ($i + 1));
                }

                $modelo->guardarDisponibilidadEspecialista(
                    $idespecialista,
                    $dia,
                    $fechaInicio,
                    $par['inicio'],
                    $par['fin'],
                    $fechaFin,
                    $refInicio,
                    $refFin
                );
            }
        }

        // 6) Respuesta JSON de éxito
        echo json_encode([
            'success' => true,
            'message' => 'Horarios y refrigerio guardados correctamente.'
        ]);
        exit;

    } catch (Exception $e) {
        // 7) Respuesta JSON de error
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
        exit;
    }
}

elseif ($action === "guardarServicios") {
    try {
        $idespecialista = isset($_POST['idespecialista']) ? (int) $_POST['idespecialista'] : 0;
        if ($idespecialista <= 0) {
            throw new Exception('ID de especialista inválido.');
        }

        // BORRAR REGISTROS ANTERIORES
        $modelo->eliminarServiciosPorEspecialista($idespecialista);

        if (empty($_POST['servicios']) || !is_array($_POST['servicios'])) {
            throw new Exception('Debes seleccionar al menos un servicio.');
        }

        $serviciosSeleccionados    = $_POST['servicios'];
        $areasSeleccionadas        = $_POST['areas'] ?? [];
        $subareasSeleccionadas     = $_POST['subareas'] ?? [];

        $guardados = [];

        foreach ($serviciosSeleccionados as $idservicio) {
            if (empty($areasSeleccionadas[$idservicio])) {
                throw new Exception("Debes seleccionar al menos un área para el servicio #{$idservicio}.");
            }

            foreach ($areasSeleccionadas[$idservicio] as $idarea) {
                // Si el servicio es 2, solo se registran las áreas (sin subáreas)
                if ($idservicio == 2) {
                    $key = "{$idarea}-null-{$idservicio}";
                    if (!isset($guardados[$key])) {
                        $modelo->guardarEspecialistaServicio(
                            $idespecialista,
                            $idarea,
                            null,
                            $idservicio
                        );
                        $guardados[$key] = true;
                    }
                    continue; // omitir subáreas
                }

                $subareas = $subareasSeleccionadas[$idarea] ?? [];

                if (!empty($subareas)) {
                    foreach ($subareas as $idsubarea) {
                        $key = "{$idarea}-{$idsubarea}-{$idservicio}";
                        if (!isset($guardados[$key])) {
                            $modelo->guardarEspecialistaServicio(
                                $idespecialista,
                                $idarea,
                                $idsubarea,
                                $idservicio
                            );
                            $guardados[$key] = true;
                        }
                    }
                } else {
                    $key = "{$idarea}-null-{$idservicio}";
                    if (!isset($guardados[$key])) {
                        $modelo->guardarEspecialistaServicio(
                            $idespecialista,
                            $idarea,
                            null,
                            $idservicio
                        );
                        $guardados[$key] = true;
                    }
                }
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Servicios guardados correctamente.'
        ]);
        exit;

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
        exit;
    }
}


// ...



else {
    $mensaje = 'Error: Acción no válida.';
}

header('Content-Type: application/json');
echo json_encode([
    'success' => strpos($mensaje, 'Error') === false,
    'message' => $mensaje
]);