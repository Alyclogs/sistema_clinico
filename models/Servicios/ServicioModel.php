<?php
require_once __DIR__ . '/../../config/database.php';

class ServicioModel
{
    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

    public function obtenerservicios()
    {
        $sql = "SELECT * FROM servicios";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function guardarServicio($servicio, $idarea)
    {
        $sql = "INSERT INTO servicios (servicio, idarea) VALUES (:servicio, :idarea)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':servicio', $servicio, PDO::PARAM_STR);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function actualizarServicio($idservicio, $servicio, $idarea)
    {
        $sql = "UPDATE servicios SET servicio = :servicio, idarea = :idarea WHERE idservicio = :idservicio";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':servicio', $servicio, PDO::PARAM_STR);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function eliminarServicio($idservicio)
    {
        $sql = "DELETE FROM servicios WHERE idservicio = :idservicio";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
