<?php
require_once __DIR__ . '/../../config/database.php';

class EstadoModel
{
    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

    public function obtenerEstados()
    {
        $sql = "SELECT * FROM estados";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerEstadoPorId($idestado)
    {
        $sql = "SELECT * FROM estados WHERE idestado = :idestado";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idestado', $idestado, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function guardarEstado($estado)
    {
        $sql = "INSERT INTO estados (estado) VALUES (:estado)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':estado', $estado, PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function actualizarEstado($idestado, $estado)
    {
        $sql = "UPDATE estados SET estado = :estado WHERE idestado = :idestado";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':estado', $estado, PDO::PARAM_STR);
        $stmt->bindParam(':idestado', $idestado, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function eliminarEstado($idestado)
    {
        $sql = "DELETE FROM estados WHERE idestado = :idestado";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idestado', $idestado, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
