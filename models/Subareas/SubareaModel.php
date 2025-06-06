<?php
require_once __DIR__ . '/../../config/database.php';

class SubareaModel
{
    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

    public function obtenersubareas()
    {
        $sql = "SELECT * FROM subareas";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerSubareaPorIdArea($idarea)
    {
        $sql = "SELECT * FROM subareas WHERE idarea = :idarea";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function guardarSubarea($subarea, $idarea)
    {
        $sql = "INSERT INTO subareas (subarea, idarea) VALUES (:subarea, :idarea)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':subarea', $subarea, PDO::PARAM_STR);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function actualizarSubarea($idsubarea, $subarea, $idarea)
    {
        $sql = "UPDATE subareas SET subarea = :subarea, idarea = :idarea WHERE idsubarea = :idsubarea";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':subarea', $subarea, PDO::PARAM_STR);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->bindParam(':idsubarea', $idsubarea, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function eliminarSubarea($idsubarea)
    {
        $sql = "DELETE FROM subareas WHERE idsubarea = :idsubarea";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idsubarea', $idsubarea, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
