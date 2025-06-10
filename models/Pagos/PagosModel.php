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

    public function buscarCitasPaciente($filtro = '')
    {
        try {
            $pdo = connectDatabase();

            $sql = "
SELECT 
    ROW_NUMBER() OVER (ORDER BY c.fecha ASC, c.hora_inicio ASC) AS orden,
    c.idcita,
    c.fecha,
    c.hora_inicio,
    c.hora_fin,

    -- Datos del paciente
    p.idpaciente,
    p.nombres AS paciente_nombres,
    p.apellidos AS paciente_apellidos,
    p.dni AS paciente_dni,

    -- Datos del apoderado (usuario asociado al paciente)
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

    -- Área y subárea
    a.idarea,
    a.area,
    sa.idsubarea,
    sa.subarea,

    -- Costo correspondiente (puede ser NULL si no hay coincidencia)
    cs.precio AS costo,

    -- Estado del pago según el idestado
    CASE 
        WHEN c.idestado = 4 THEN 'Cancelado'
        WHEN c.idestado = 3 THEN 'Pendiente'
        ELSE 'Otro'
    END AS estado_pago

FROM citas c
INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
INNER JOIN usuarios ua ON p.idusuario = ua.idusuario  -- Apoderado del paciente

INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
INNER JOIN usuarios ue ON c.idregistrador = ue.idusuario  -- Datos del especialista
INNER JOIN areas a ON e.idarea = a.idarea
LEFT JOIN subareas sa ON e.idsubarea = sa.idsubarea

-- Join con costo según subárea y hora dentro del rango
LEFT JOIN costos_subareas cs 
    ON cs.idsubarea = e.idsubarea
    AND c.hora_inicio >= cs.hora_inicio 
    AND c.hora_inicio <= cs.hora_fin

WHERE 1
";



            // Filtro opcional
            if (!empty($filtro)) {
                $sql .= " AND (
                p.nombres LIKE :filtro
                OR p.apellidos LIKE :filtro
                OR p.dni LIKE :filtro
            )";
            }

            $sql .= " ORDER BY c.fecha asc, c.hora_inicio ASC";

            $stmt = $pdo->prepare($sql);

            if (!empty($filtro)) {
                $filtro = '%' . $filtro . '%';
                $stmt->bindParam(':filtro', $filtro, PDO::PARAM_STR);
            }

            $stmt->execute();
            $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            closeDatabase($pdo);
            return $citas;
        } catch (PDOException $e) {
            die("Error al buscar citas: " . $e->getMessage());
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
