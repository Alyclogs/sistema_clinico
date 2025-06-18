<?php
// Importa la clase PDO
require_once __DIR__ . '/../../config/database.php';
class PagosModel
{

    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

public function buscarCitasPaciente($filtro, $idestado = 3) // filtro obligatorio, idestado por defecto = 3
{
    try {
        if (empty($filtro)) {
            throw new InvalidArgumentException("El filtro es obligatorio.");
        }

        $pdo = connectDatabase();

        $sql = "SELECT  
          LPAD( ROW_NUMBER() OVER (ORDER BY c.fecha ASC, c.hora_inicio ASC), 2, '0' ) AS orden,
            c.idcita,
            c.fecha,
            c.hora_inicio,
            c.hora_fin,

            -- Datos del paciente
            p.idpaciente,
            p.nombres AS paciente_nombres,
            p.apellidos AS paciente_apellidos,
            p.dni AS paciente_dni,
            p.foto AS paciente_foto,
            p.fecha_nacimiento AS paciente_fecha,

            -- Datos del apoderado
            ua.idusuario AS apoderado_id,
            ua.nombres AS apoderado_nombres,
            ua.apellidos AS apoderado_apellidos,
            ua.dni AS apoderado_dni,
            ua.telefono AS apoderado_telefono,
            ua.correo AS apoderado_correo,

            -- Datos del especialista
            e.idespecialista,
            ue.nombres AS especialista_nombres,
            ue.apellidos AS especialista_apellidos,

            -- Datos del servicio, área y subárea
            c.idservicio,
            s.servicio AS servicio_nombre,
            c.idarea,
            a.area AS area_nombre,
            c.idsubarea,
            sub.subarea AS subarea_nombre,

            -- Precio calculado
            CASE 
                WHEN c.idservicio = 1 THEN 
                    (SELECT cs.precio 
                     FROM costos_subareas cs
                     WHERE cs.idsubarea = c.idsubarea
                       AND c.hora_inicio BETWEEN cs.hora_inicio AND cs.hora_fin
                     LIMIT 1)
                WHEN c.idservicio = 2 THEN s.precio
                ELSE 0
            END AS costo,

            -- Estado del pago
            CASE 
                WHEN c.idestado = 4 THEN 'Cancelado'
                WHEN c.idestado = 3 THEN 'Pendiente'
                ELSE 'Otro'
            END AS estado_pago

        FROM citas c

        INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
        INNER JOIN usuarios ua ON p.idusuario = ua.idusuario
        INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
        INNER JOIN usuarios ue ON e.idespecialista = ue.idusuario
        LEFT JOIN servicios s ON c.idservicio = s.idservicio
        LEFT JOIN areas a ON c.idarea = a.idarea
        LEFT JOIN subareas sub ON c.idsubarea = sub.idsubarea

        WHERE 
            (p.nombres LIKE :filtro
            OR p.apellidos LIKE :filtro
            OR p.dni LIKE :filtro)
            AND c.idestado = :idestado

        GROUP BY c.idcita, c.fecha, c.hora_inicio, c.hora_fin, 
                 p.idpaciente, ua.idusuario, e.idespecialista, s.idservicio,
                 a.idarea, sub.idsubarea

        ORDER BY c.fecha ASC, c.hora_inicio ASC";

        $stmt = $pdo->prepare($sql);

        $filtroParam = '%' . $filtro . '%';
        $stmt->bindParam(':filtro', $filtroParam, PDO::PARAM_STR);
        $stmt->bindParam(':idestado', $idestado, PDO::PARAM_INT);

        $stmt->execute();
        $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        closeDatabase($pdo);
        return $citas;
    } catch (PDOException $e) {
        die("Error al buscar citas: " . $e->getMessage());
    } catch (InvalidArgumentException $e) {
        die("Error: " . $e->getMessage());
    }
}





    public function obtenerModalidades()
    {
        $sql = "SELECT * FROM modalidad_pagos";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerSiguienteCodigo()
    {
        // Obtener el último código insertado
        $sql = "SELECT codigo_voucher FROM pagos ORDER BY idpago DESC LIMIT 1";
        $stmt = $this->db->query($sql);
        $ultimo = $stmt->fetch(PDO::FETCH_ASSOC);

        // Si no hay registros aún, iniciamos con el primer código
        if (!$ultimo) {
            return 'A001-0001';
        }

        $codigo = $ultimo['codigo_voucher'];
        list($serie, $correlativo) = explode('-', $codigo);

        $letra = $serie[0];
        $numerosSerie = (int)substr($serie, 1);
        $correlativo = (int)$correlativo;

        // Aumentar correlativo
        $correlativo++;

        if ($correlativo > 9999) {
            $correlativo = 1;
            $numerosSerie++;

            if ($numerosSerie > 999) {
                $numerosSerie = 1;
                $letra = chr(ord($letra) + 1); // A -> B -> C ...
                if ($letra > 'Z') {
                    throw new Exception("Se ha alcanzado el límite de códigos.");
                }
            }
        }

        $nuevaSerie = $letra . str_pad($numerosSerie, 3, '0', STR_PAD_LEFT);
        $nuevoCorrelativo = str_pad($correlativo, 4, '0', STR_PAD_LEFT);

        return $nuevaSerie . '-' . $nuevoCorrelativo;
    }


    public function obtenerOpcionesPago()
    {
        $sql = "SELECT * FROM opciones_pagos";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function guardarPagos($idsCitas, $costoTotal, $idPaciente, $idModalidad, $idOpcion, $idusuario, $codigo, $codigo_voucher, $fecha = null)
    {
        $pdo = connectDatabase();
        date_default_timezone_set('America/Lima');
        $fechaPago = $fecha ?? date('Y-m-d H:i:s');

        try {
            $pdo->beginTransaction();

            // 1. Insertar un solo pago
            $stmtPago = $pdo->prepare("
            INSERT INTO pagos (fecha_pago, idmodalidad, idopcion, importe, idusuario, codigo, codigo_voucher)
            VALUES (:fecha_pago, :idmodalidad, :idopcion, :importe, :idusuario, :codigo , :codigo_voucher)
        ");

            $stmtPago->execute([
                'fecha_pago'  => $fechaPago,
                'idmodalidad' => $idModalidad,
                'idopcion'    => $idOpcion,
                'importe'     => $costoTotal,
                'idusuario'   => $idusuario,

                'codigo' => $codigo,
                'codigo_voucher' => $codigo_voucher,
            ]);

            // 2. Obtener el ID del pago recién insertado
            $idPago = $pdo->lastInsertId();

            // 3. Insertar relaciones en citas_pago
            $stmtCitaPago = $pdo->prepare("
            INSERT INTO citas_pago (idcita, idpago)
            VALUES (:idcita, :idpago)
        ");

            // 4. Actualizar el estado de cada cita a 4 si estaba en 3
            $stmtUpdateEstado = $pdo->prepare("
            UPDATE citas SET idestado = 4 WHERE idcita = :idcita
        ");

            foreach ($idsCitas as $idCita) {
                $stmtCitaPago->execute([
                    'idcita' => $idCita,
                    'idpago' => $idPago
                ]);

                $stmtUpdateEstado->execute([
                    'idcita' => $idCita
                ]);
            }

            $pdo->commit();
            return true;
        } catch (PDOException $e) {
            $pdo->rollBack();
            throw $e;
        } finally {
            closeDatabase($pdo);
        }
    }
}