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
        $sql = "SELECT d.*
        FROM disponibilidad d
        WHERE d.idespecialista = :idespecialista
          AND d.activo = 1
          AND CURRENT_DATE BETWEEN d.fechainicio AND d.fechafin";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':idespecialista' => $idespecialista]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
