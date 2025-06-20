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
        $sql = "SELECT DISTINCT rp.*,
        c.fecha AS cita_fecha,
        c.hora_inicio AS cita_hora_inicio,
        u.nombres AS especialista_nombres,
        u.apellidos AS especialista_apellidos,
        u.foto AS especialista_foto,
        a.area AS cita_area,
        s.servicio AS cita_servicio
        FROM resumenes_pacientes rp
        INNER JOIN citas c ON rp.idcita = c.idcita
        INNER JOIN areas a ON c.idarea = a.idarea
        INNER JOIN servicios s ON c.idservicio = s.idservicio
        INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
        INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE c.idpaciente = :idpaciente";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idpaciente', $idpaciente, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerResumenPorCita($idcita)
    {
        $sql = "SELECT rp.*,
        p.nombres AS paciente_nombres,
        p.apellidos AS paciente_apellidos
        FROM resumenes_pacientes rp
        INNER JOIN citas c ON rp.idcita = c.idcita
        INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
        WHERE idcita = :idcita";

        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idcita', $idcita, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerResumenesPorCitayPaciente($idcita, $idpaciente)
    {
        $sql = "SELECT * FROM resumenes_pacientes WHERE idcita = :idcita AND idpaciente = :idpaciente";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idcita', $idcita, PDO::PARAM_INT);
        $stmt->bindParam(':idpaciente', $idpaciente, PDO::PARAM_INT);
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
