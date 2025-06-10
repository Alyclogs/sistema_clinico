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
        $sql = "SELECT * FROM disponibilidad WHERE idespecialista = :idespecialista";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
