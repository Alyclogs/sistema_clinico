<?php
require_once __DIR__ . '/../../config/database.php';

class CitasModel
{
    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

    public function obtenerCitas()
    {
        $sql = "SELECT 
                c.*, 
                p.nombres AS paciente_nombres, 
                p.apellidos AS paciente_apellidos, 
                p.dni AS paciente_dni, 
                p.fecha_nacimiento AS paciente_fecha_nacimiento,
                u.nombres AS especialista_nombre,
                u.apellidos AS especialista_apellidos
            FROM citas c
            INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
            INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
            INNER JOIN usuarios u ON e.idusuario = u.idusuario";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerCitasPorEspecialista($idespecialista)
    {
        $sql = "SELECT 
                c.*, 
                p.nombres AS paciente_nombres, 
                p.apellidos AS paciente_apellidos, 
                p.dni AS paciente_dni, 
                p.fecha_nacimiento AS paciente_fecha_nacimiento
                u.nombres AS especialista_nombre,
                u.apellidos AS especialista_apellidos
            FROM citas c
            INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
            INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
            INNER JOIN usuarios u ON e.idusuario = u.idusuario
            WHERE c.idespecialista = :idespecialista";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crearCita($data)
    {
        $sql = "INSERT INTO citas (idpaciente, idespecialista, idusuario, fecha, hora_inicio, hora_fin, idestado) 
                VALUES (:idpaciente, :idespecialista, :idusuario, :fecha, :hora_inicio, :hora_fin, :idestado)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idpaciente', $data['idpaciente'], PDO::PARAM_INT);
        $stmt->bindParam(':idespecialista', $data['idespecialista'], PDO::PARAM_INT);
        $stmt->bindParam(':idusuario', $data['idusuario'], PDO::PARAM_INT);
        $stmt->bindParam(':fecha', $data['fecha']);
        $stmt->bindParam(':hora_inicio', $data['hora_inicio']);
        $stmt->bindParam(':hora_fin', $data['hora_fin']);
        $stmt->bindParam(':idestado', $data['idestado']);

        return $stmt->execute();
    }
}
