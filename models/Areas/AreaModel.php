<?php
require_once __DIR__ . '/../../config/database.php';

class AreaModel
{
    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

    public function obtenerareas()
    {
        $sql = "SELECT * FROM areas";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerAreaPorId($idarea)
    {
        $sql = "SELECT * FROM areas WHERE idarea = :idarea";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function guardarArea($area)
    {
        $sql = "INSERT INTO areas (area) VALUES (:area)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':area', $area, PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function actualizarArea($idarea, $area)
    {
        $sql = "UPDATE areas SET area = :area WHERE idarea = :idarea";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':area', $area, PDO::PARAM_STR);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function eliminarArea($idarea)
    {
        $sql = "DELETE FROM areas WHERE idarea = :idarea";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
