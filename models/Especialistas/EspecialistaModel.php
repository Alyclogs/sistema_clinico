<?php
require_once __DIR__ . '/../../config/database.php';

class EspecialistaModel
{
    private $baseurl = "http://localhost/SistemaClinico/";

    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }
    public function obtenerEstados()
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("SELECT * FROM estados");
            $stmt->execute();
            $estados = $stmt->fetchAll(PDO::FETCH_ASSOC);
            closeDatabase($pdo);

            return $estados;
        } catch (PDOException $e) {
            die("Error al obtener estados: " . $e->getMessage());
        }
    }

    public function existeEspecialista($idusuario)
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM especialistas WHERE idespecialista = :idusuario");
            $stmt->execute(['idusuario' => $idusuario]);

            $especialistaData = $stmt->fetch(PDO::FETCH_ASSOC);

            closeDatabase($pdo);
            return $especialistaData['COUNT(*)'] > 0;
        } catch (PDOException $e) {
        }
    }

    public function obtenerAreas()
    {
        $sql = "SELECT * FROM areas";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function obtenersubareas()
    {
        $sql = "SELECT * FROM subareas";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function obtenerServicios()
    {
        $sql = "SELECT * FROM servicios";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function obtenerServiciosConAreasYSubareas()
    {
        // 1. Obtener todos los servicios
        $sqlServicios = "SELECT * FROM servicios";
        $stmtServicios = $this->db->query($sqlServicios);
        $servicios = $stmtServicios->fetchAll(PDO::FETCH_ASSOC);

        // 2. Obtener todas las áreas
        $sqlAreas = "SELECT * FROM areas";
        $stmtAreas = $this->db->query($sqlAreas);
        $areas = $stmtAreas->fetchAll(PDO::FETCH_ASSOC);

        // 3. Obtener todas las subáreas
        $sqlSubareas = "SELECT * FROM subareas";
        $stmtSubareas = $this->db->query($sqlSubareas);
        $subareas = $stmtSubareas->fetchAll(PDO::FETCH_ASSOC);

        // Organizar subáreas por idarea
        $subareasPorArea = [];
        foreach ($subareas as $sub) {
            $subareasPorArea[$sub['idarea']][] = $sub;
        }

        // Armar la estructura final
        foreach ($servicios as &$servicio) {
            $servicio['areas'] = [];

            foreach ($areas as $area) {
                $areaConSub = $area;

                // Solo incluir subáreas si el servicio NO es 'EVALUACION'
                if (strtoupper($servicio['servicio']) !== 'EVALUACION') {
                    $areaConSub['subareas'] = $subareasPorArea[$area['idarea']] ?? [];
                } else {
                    $areaConSub['subareas'] = []; // Evaluación solo tiene áreas
                }

                $servicio['areas'][] = $areaConSub;
            }
        }

        return $servicios;
    }


    public function obtenerEspecialistas()
    {
        $sql = "SELECT 
                u.idusuario AS idespecialista, 
                u.nombres AS nom_especialista, 
                u.foto AS foto_especialista, 
                u.apellidos AS ape_especialista,
                u.dni AS dni_especialista,
                u.telefono AS telefono_especialista,
                u.correo AS correo_especialista,
                a.idarea,
                a.area AS nombre_area,
                sa.idsubarea,
                sa.subarea AS nombre_subarea,
                e.idservicio
            FROM usuarios u
            LEFT JOIN especialistas e ON u.idusuario = e.idespecialista
            LEFT JOIN areas a ON e.idarea = a.idarea
            LEFT JOIN subareas sa ON e.idsubarea = sa.idsubarea
            WHERE u.idrol = 3";

        $stmt = $this->db->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $especialistas = [];

        foreach ($rows as $row) {
            $id = $row['idespecialista'];

            if (!isset($especialistas[$id])) {
                $especialistas[$id] = [
                    'idespecialista' => $id,
                    'nombres' => $row['nom_especialista'],
                    'apellidos' => $row['ape_especialista'],
                    'foto' => $row['foto_especialista'],
                    'dni' => $row['dni_especialista'],
                    'telefono' => $row['telefono_especialista'],
                    'correo' => $row['correo_especialista'],
                    'especialidades' => []
                ];
            }

            $especialidades = &$especialistas[$id]['especialidades'];

            $especialidades[] = [
                'idarea' => $row['idarea'],
                'nombre_area' => $row['nombre_area'],
                'idsubarea' => $row['idsubarea'],
                'nombre_subarea' => $row['nombre_subarea'],
                'idservicio' => $row['idservicio']
            ];
        }

        return array_values($especialistas);
    }


    public function obtenerEspecialistaPorId($idespecialista)
    {
        $sql = "SELECT 
                e.*, 
                u.nombres AS nom_especialista, 
                u.apellidos AS ape_especialista,
                u.dni AS dni_especialista,
                u.telefono AS telefono_especialista,
                u.correo AS correo_especialista,
                u.usuario AS nombre_usuario,
                 u.idestado,
                  u.sexo AS sexo_especialista,
                u.foto AS foto_usuario,
                a.area AS nombre_area,
                sa.subarea AS nombre_subarea
            FROM especialistas e
            INNER JOIN usuarios u ON e.idespecialista = u.idusuario
            INNER JOIN areas a ON e.idarea = a.idarea
            LEFT JOIN subareas sa ON e.idsubarea = sa.idsubarea
            WHERE e.idespecialista = :idespecialista";

        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function guardarEspecialista(
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
        $archivoFoto = null
    ) {
        $baseurl = $this->baseurl;
        $pdo = connectDatabase();
        $uploadDir = __DIR__ . '/../../assets/img/';
        $imagenesMujeres = [
            $baseurl . "assets/img/doctora1.png",
            $baseurl . "assets/img/doctora2.png",
            $baseurl . "assets/img/doctora3.png",
        ];

        $imagenesHombres = [
            $baseurl . "assets/img/doctor1.png",
            $baseurl . "assets/img/doctor2.png",
            $baseurl . "assets/img/doctor3.png",
        ];

        if ($archivoFoto && $archivoFoto['error'] === UPLOAD_ERR_OK) {
            // Validar tipo archivo (solo imagen)
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($archivoFoto['type'], $allowedTypes)) {
                throw new Exception("Tipo de archivo no permitido.");
            }

            // Generar nombre único para evitar sobreescritura
            $ext = pathinfo($archivoFoto['name'], PATHINFO_EXTENSION);
            $nombreArchivo = uniqid('usr_') . '.' . $ext;

            // Mover archivo a la carpeta uploads
            if (!move_uploaded_file($archivoFoto['tmp_name'], $uploadDir . $nombreArchivo)) {
                throw new Exception("Error al subir el archivo.");
            }

            // Ruta que se guarda en BD (ruta pública)
            $foto = $baseurl . "assets/img/" . $nombreArchivo;
        } else {
            // No se subió archivo, usar avatar por defecto
            if (strtolower($sexo) === 'f') {
                $foto = $imagenesMujeres[array_rand($imagenesMujeres)];
            } else {
                $foto = $imagenesHombres[array_rand($imagenesHombres)];
            }
        }

        try {
            $pdo->beginTransaction();

            $stmtUsuario = $pdo->prepare("
      INSERT INTO usuarios 
        (nombres, apellidos, dni, telefono, correo, idestado, idrol, usuario, password, foto, sexo)
      VALUES 
        (:nombres, :apellidos, :dni, :telefono, :correo, :idestado, :idrol, :usuario, :password, :foto, :sexo)
    ");

            $stmtUsuario->execute([
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'dni' => $dni,
                'telefono' => $telefono,
                'correo' => $correo,
                'idestado' => $idestado,
                'idrol' => $idrol,
                'usuario' => $usuario,
                'password' => $passwordHash,
                'foto' => $foto,
                'sexo' => $sexo,
            ]);




            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            throw $e;
        } finally {
            closeDatabase($pdo);
        }
    }



    public function actualizarEspecialista($id, $nombres, $apellidos, $dni, $telefono, $correo, $idestado, $idrol, $usuario, $password = null, $sexo, $archivoFoto = null)
    {
        $baseurl = $this->baseurl;
        $pdo = connectDatabase();
        $uploadDir = __DIR__ . '/../../assets/img/';

        // Avatares por defecto según sexo
        $imagenesMujeres = [
            $baseurl . "assets/img/doctora1.png",
            $baseurl . "assets/img/doctora2.png",
            $baseurl . "assets/img/doctora3.png",
        ];
        $imagenesHombres = [
            $baseurl . "assets/img/doctor1.png",
            $baseurl . "assets/img/doctor2.png",
            $baseurl . "assets/img/doctor3.png",
        ];


        try {
            // Primero obtener la foto actual para mantenerla si no hay nueva foto
            $stmtFoto = $pdo->prepare("SELECT foto FROM usuarios WHERE idusuario = :id");
            $stmtFoto->execute(['id' => $id]);
            $fotoActual = $stmtFoto->fetchColumn();

            // Si se subió archivo foto nuevo y es válido
            if ($archivoFoto && $archivoFoto['error'] === UPLOAD_ERR_OK) {
                $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
                if (!in_array($archivoFoto['type'], $allowedTypes)) {
                    throw new Exception("Tipo de archivo no permitido.");
                }
                $ext = pathinfo($archivoFoto['name'], PATHINFO_EXTENSION);
                $nombreArchivo = uniqid('usr_') . '.' . $ext;

                if (!move_uploaded_file($archivoFoto['tmp_name'], $uploadDir . $nombreArchivo)) {
                    throw new Exception("Error al subir el archivo.");
                }
                $foto = $baseurl . "assets/img/" . $nombreArchivo;
            } else {
                // No se subió foto nueva, mantener la actual
                $foto = $fotoActual;

                // Si la foto actual es nula o vacía, poner avatar por defecto según sexo
                if (empty($foto)) {
                    if (strtolower($sexo) === 'f') {
                        $foto = $imagenesMujeres[array_rand($imagenesMujeres)];
                    } else {
                        $foto = $imagenesHombres[array_rand($imagenesHombres)];
                    }
                }
            }

            // Construir el query dinámico si password está presente o no
            if ($password) {
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                $sql = "
                UPDATE usuarios
                SET nombres = :nombres,
                    apellidos = :apellidos,
                    dni = :dni,
                    telefono = :telefono,
                    correo = :correo,
                    idestado = :idestado,
                    idrol = :idrol,
                    usuario = :usuario,
                    password = :password,
                    foto = :foto,
                    sexo = :sexo
                WHERE idusuario = :id
            ";
            } else {
                // No cambia contraseña
                $sql = "
                UPDATE usuarios
                SET nombres = :nombres,
                    apellidos = :apellidos,
                    dni = :dni,
                    telefono = :telefono,
                    correo = :correo,
                    idestado = :idestado,
                    idrol = :idrol,
                    usuario = :usuario,
                    foto = :foto,
                    sexo = :sexo
                WHERE idusuario = :id
            ";
            }

            $stmt = $pdo->prepare($sql);

            // Ejecutar con parámetros según password o no
            $params = [
                'id' => $id,
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'dni' => $dni,
                'telefono' => $telefono,
                'correo' => $correo,
                'idestado' => $idestado,
                'idrol' => $idrol,
                'usuario' => $usuario,
                'foto' => $foto,
                'sexo' => $sexo,
            ];

            if ($password) {
                $params['password'] = $passwordHash;
            }

            $stmt->execute($params);

            closeDatabase($pdo);
            return true;
        } catch (Exception $e) {
            throw $e; // O manejar como prefieras
        }
    }

    public function eliminarEspecialista($idespecialista)
    {
        $sql = "DELETE FROM especialistas WHERE idespecialista = :idespecialista";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
        return $stmt->execute();
    }



    function guardarDisponibilidadEspecialista(
        $idespecialista,
        $dia,
        $fechaInicio,
        $horaInicio,
        $horaFin,
        $fechaFin,
        $refrigerioHoraInicio,
        $refrigerioHoraFin,
        $registrarExcepcion = false,
        $estadoExcepcion = 'activo'
    ) {
        $pdo = connectDatabase();

        try {
            // Insertar en la tabla de disponibilidad
            $stmt = $pdo->prepare("
            INSERT INTO disponibilidad (
                idespecialista,
                fechainicio,
                horainicio,
                horafin,
                fechafin,
                dia,
                refrigerio_horainicio,
                refrigerio_horafin
            ) VALUES (
                :idespecialista,
                :fechainicio,
                :horainicio,
                :horafin,
                :fechafin,
                :dia,
                :refrigerio_horainicio,
                :refrigerio_horafin
            )
        ");

            $stmt->execute([
                ':idespecialista' => $idespecialista,
                ':fechainicio' => $fechaInicio,
                ':horainicio' => $horaInicio,
                ':horafin' => $horaFin,
                ':fechafin' => $fechaFin,
                ':dia' => $dia,
                ':refrigerio_horainicio' => $refrigerioHoraInicio,
                ':refrigerio_horafin' => $refrigerioHoraFin,
            ]);

            // Opcional: Insertar en disponibilidad_excepciones
            if ($registrarExcepcion) {
                $stmtExcepcion = $pdo->prepare("
                INSERT INTO disponibilidad_excepciones (
                    idespecialista,
                    fechainicio,
                    fechafin,
                    dia,
                    horainicio,
                    horafin,
                    refrigerio_horainicio,
                    refrigerio_horafin,
                    estado
                ) VALUES (
                    :idespecialista,
                    :fechainicio,
                    :fechafin,
                    :dia,
                    :horainicio,
                    :horafin,
                    :refrigerio_horainicio,
                    :refrigerio_horafin,
                    :estado
                )
            ");

                $stmtExcepcion->execute([
                    ':idespecialista' => $idespecialista,
                    ':fechainicio' => $fechaInicio,
                    ':fechafin' => $fechaFin,
                    ':dia' => $dia,
                    ':horainicio' => $horaInicio,
                    ':horafin' => $horaFin,
                    ':refrigerio_horainicio' => $refrigerioHoraInicio,
                    ':refrigerio_horafin' => $refrigerioHoraFin,
                    ':estado' => $estadoExcepcion
                ]);
            }
        } catch (PDOException $e) {
            throw $e;
        } finally {
            closeDatabase($pdo);
        }
    }




    public function obtenerEspecialistaPorAreaySubareayServicio($idarea, $idsubarea, $idservicio)
    {
        $sql = "SELECT e.*, u.nombres AS nom_especialista, u.apellidos AS ape_especialista FROM especialistas e
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE e.idarea = :idarea AND e.idsubarea = :idsubarea AND e.idservicio = :idservicio";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->bindParam(':idsubarea', $idsubarea, PDO::PARAM_INT);
        $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function guardarEspecialistaServicio(
        int $idespecialista,
        int $idarea,
        ?int $idsubarea,
        int $idservicio
    ) {
        // Establecer la conexión a la base de datos
        $pdo = connectDatabase();

        // La consulta SQL para insertar los datos
        $sql = "
            INSERT INTO especialistas
                (idespecialista, idarea, idsubarea, idservicio)
            VALUES
                (:idespecialista, :idarea, :idsubarea, :idservicio)
        ";

        try {
            // Preparar la consulta
            $stmt = $pdo->prepare($sql);

            // Ejecutar la consulta con los parámetros
            $stmt->execute([
                ':idespecialista' => $idespecialista,
                ':idarea'         => $idarea,
                ':idsubarea'      => $idsubarea,
                ':idservicio'     => $idservicio,
            ]);

            // Obtener el ID del último registro insertado
            $lastInsertId = $pdo->lastInsertId();

            return $lastInsertId;  // Retornar el ID insertado

        } catch (PDOException $e) {
            // En caso de error, manejar la excepción
            throw new Exception("Error al guardar el especialista en el servicio: " . $e->getMessage());
        } finally {
            // Cerrar la conexión
            closeDatabase($pdo);
        }
    }

    public function eliminarServiciosPorEspecialista(int $idespecialista)
    {
        $pdo = connectDatabase();

        $sql = "DELETE FROM especialistas WHERE idespecialista = :idespecialista";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':idespecialista' => $idespecialista]);
        } catch (PDOException $e) {
            throw new Exception("Error al eliminar servicios anteriores: " . $e->getMessage());
        } finally {
            closeDatabase($pdo);
        }
    }


    public function obtenerEspecialistaPorArea($idarea)
    {
        try {
            $sql = "SELECT e.*, u.nombres AS nom_especialista, u.apellidos AS ape_especialista FROM especialistas e
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE e.idarea = :idarea";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Error($e);
        }
    }


    public function obtenerEspecialistaPorAreayServicio($idarea, $idservicio)
    {
        try {
            $sql = "SELECT e.*, u.nombres AS nom_especialista, u.apellidos AS ape_especialista FROM especialistas e
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE e.idarea = :idarea AND e.idservicio = :idservicio";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
            $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Error($e);
        }
    }




    public function obtenerServiciosPorEspecialista(int $idespecialista): array
    {
        // Establecer la conexión a la base de datos
        $pdo = connectDatabase();

        // Consulta SQL para obtener los servicios asignados a un especialista
        $sql = "
        SELECT 
            e.idservicio, 
            e.idarea, 
            e.idsubarea
        FROM especialistas e
        WHERE e.idespecialista = :idespecialista
    ";

        try {
            // Preparar y ejecutar la consulta
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':idespecialista' => $idespecialista]);

            // Obtener los resultados de la consulta
            $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Devolver los servicios encontrados
            return $servicios;
        } catch (PDOException $e) {
            // Capturar y lanzar cualquier error de base de datos
            throw new Exception("Error al obtener los servicios del especialista: " . $e->getMessage());
        } finally {
            // Cerrar la conexión a la base de datos
            closeDatabase($pdo);
        }
    }



    public function obtenerPeriodosDisponibilidad(int $idespecialista): array
    {
        $pdo = connectDatabase();

        // Modificación de la consulta para agrupar por fecha inicio y fecha fin sin particionar por día
        $sql = "
        SELECT DISTINCT 
            fechainicio, 
            fechafin
        FROM disponibilidad
        WHERE idespecialista = :idespecialista
        ORDER BY fechainicio ASC
    ";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':idespecialista' => $idespecialista]);
            $periodos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $periodos;
        } catch (PDOException $e) {
            throw new Exception("Error al obtener los periodos de disponibilidad: " . $e->getMessage());
        } finally {
            closeDatabase($pdo);
        }
    }




    public function obtenerDetallesDisponibilidad(int $idespecialista, int $periodoId): array
    {
        $pdo = connectDatabase();

        // Consulta para obtener los detalles de disponibilidad por periodo (día, hora de inicio, hora de fin, refrigerio)
        $sql = "
        SELECT 
    d.dia, 
    d.horainicio, 
    d.horafin, 
    d.refrigerio_horainicio, 
    d.refrigerio_horafin,
    d.fechainicio,
    d.fechafin
FROM disponibilidad d
JOIN (
    SELECT 
        fechainicio, 
        fechafin
    FROM disponibilidad
    WHERE idespecialista = :idespecialista
    GROUP BY fechainicio, fechafin
    ORDER BY fechainicio ASC
    LIMIT 1
) AS periodo ON d.fechainicio = periodo.fechainicio AND d.fechafin = periodo.fechafin
WHERE d.idespecialista = :idespecialista
ORDER BY FIELD(d.dia, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado');

    ";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':idespecialista' => $idespecialista,
                ':periodoId' => $periodoId
            ]);
            $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $detalles;
        } catch (PDOException $e) {
            throw new Exception("Error al obtener los detalles de disponibilidad: " . $e->getMessage());
        } finally {
            closeDatabase($pdo);
        }
    }
}
