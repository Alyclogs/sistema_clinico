<?php
require_once __DIR__ . '/../../config/database.php';

class DisponibilidadModel
{
    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

    public function obtenerPorEspecialista($idespecialista)
    {
        $sql = "SELECT 
        d.idespecialista,
        d.fechainicio,
        d.fechafin,
        d.dia,
        d.mes,
        d.year,
        d.horainicio,
        d.horafin,
        d.refrigerio_horainicio,
        d.refrigerio_horafin,
        NULL AS estado,
        0 AS es_excepcion
    FROM disponibilidad d
    WHERE d.idespecialista = :idespecialista

    UNION ALL

    SELECT 
        dx.idespecialista,
        dx.fechainicio,
        dx.fechafin,
        dx.dia,
        dx.mes,
        dx.year,
        dx.horainicio,
        dx.horafin,
        dx.refrigerio_horainicio,
        dx.refrigerio_horafin,
        dx.estado,
        1 AS es_excepcion
    FROM disponibilidad_excepciones dx
    WHERE dx.idespecialista = :idespecialista
    ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':idespecialista' => $idespecialista]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
