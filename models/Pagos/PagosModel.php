<?php
// Importa la clase PDO
require_once __DIR__ . '/../../config/database.php'; 
class PagosModel {
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

    -- Estado del pago
    CASE 
        WHEN pa.idpago IS NOT NULL THEN 'Cancelado'
        ELSE 'Pendiente'
    END AS estado_pago

FROM citas c
INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
INNER JOIN usuarios ue ON e.idusuario = ue.idusuario
INNER JOIN areas a ON e.idarea = a.idarea
LEFT JOIN subareas sa ON e.idsubarea = sa.idsubarea

-- Join con costo según subárea y hora dentro del rango
LEFT JOIN costos_subareas cs 
    ON cs.idsubarea = e.idsubarea
    AND c.hora_inicio >= cs.hora_inicio 
    AND c.hora_inicio <= cs.hora_fin

-- Verificar si hay un pago asociado a la cita
LEFT JOIN pagos pa ON pa.idcita = c.idcita

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
}

?>