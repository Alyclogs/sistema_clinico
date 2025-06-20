<?php
require_once __DIR__ . '/../../config/database.php';

class ResumenModel
{
    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

    public function obtenerResumenes()
    {
        $sql = "SELECT * FROM resumenes_pacientes";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerResumenPorId($idresumen)
    {
        $sql = "SELECT * FROM resumenes_pacientes WHERE idresumen = :idresumen";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idresumen', $idresumen, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function obtenerResumenesPorPaciente($idpaciente)
    {
        $sql = "SELECT * FROM resumenes_pacientes WHERE idpaciente = :idpaciente";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idpaciente', $idpaciente, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerResumenesPorCita($idcita)
    {
        $sql = "SELECT * FROM resumenes_pacientes WHERE idcita = :idcita";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idcita', $idcita, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function guardarResumen($data)
    {
        $sql = "INSERT INTO resumenes_pacientes (resumen, idcita, idpaciente) VALUES (:resumen, :idcita, :idpaciente)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':resumen', $data['resumen'], PDO::PARAM_STR);
        $stmt->bindParam(':idcita', $data['idcita'], PDO::PARAM_INT);
        $stmt->bindParam(':idpaciente', $data['idpaciente'], PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function actualizarResumen($data)
    {
        $sql = "UPDATE resumenes SET resumen = :resumen, idcita = :idcita, idpaciente = :idpaciente WHERE idresumen = :idresumen";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':resumen', $data['resumen'], PDO::PARAM_STR);
        $stmt->bindParam(':idcita', $data['idcita'], PDO::PARAM_INT);
        $stmt->bindParam(':idpaciente', $data['idpaciente'], PDO::PARAM_INT);
        $stmt->bindParam(':idresumen', $data['resumen'], PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function eliminarResumen($idresumen)
    {
        $sql = "DELETE FROM resumenes WHERE idresumen = :idresumen";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idresumen', $idresumen, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
