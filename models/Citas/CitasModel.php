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
        $sql = "SELECT DISTINCT
                c.*, 
                p.nombres AS paciente_nombres, 
                p.apellidos AS paciente_apellidos, 
                p.dni AS paciente_dni, 
                p.fecha_nacimiento AS paciente_fecha_nacimiento,
                p.foto AS paciente_foto,
                u.nombres AS especialista_nombre,
                u.apellidos AS especialista_apellidos
            FROM citas c
            INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
            INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
            INNER JOIN usuarios u ON e.idespecialista = u.idusuario";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerCitasPorServicio($idservicio)
    {
        $sql = "SELECT DISTINCT c.*, p.nombres AS paciente_nombres,
        p.apellidos AS paciente_apellidos,
        p.dni AS paciente_dni,
        p.fecha_nacimiento AS paciente_fecha_nacimiento,
        p.foto AS paciente_foto,
        u.nombres AS especialista_nombre,
        u.apellidos AS especialista_apellidos
        FROM citas c INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
        INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE c.idservicio = :idservicio";

        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerCitasPorEspecialista($idespecialista, $idservicio)
    {
        $sql = "SELECT DISTINCT c.*, p.nombres AS paciente_nombres,
        p.apellidos AS paciente_apellidos,
        p.dni AS paciente_dni,
        p.fecha_nacimiento AS paciente_fecha_nacimiento,
        p.foto AS paciente_foto,
        u.nombres AS especialista_nombre,
        u.apellidos AS especialista_apellidos
        FROM citas c INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
        INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE c.idespecialista = :idespecialista
        AND c.idservicio = :idservicio";

        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
        $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerCitasPorArea($idarea, $idservicio)
    {
        $sql = "SELECT DISTINCT c.*, p.nombres AS paciente_nombres,
        p.apellidos AS paciente_apellidos,
        p.dni AS paciente_dni,
        p.fecha_nacimiento AS paciente_fecha_nacimiento,
        p.foto AS paciente_foto,
        u.nombres AS especialista_nombre,
        u.apellidos AS especialista_apellidos
        FROM citas c INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
        INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE e.idarea = :idarea
        AND c.idservicio = :idservicio";

        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerCitasPorEspecialistayArea($idespecialista, $idarea, $idservicio)
    {
        $sql = "SELECT DISTINCT c.*, p.nombres AS paciente_nombres,
        p.apellidos AS paciente_apellidos,
        p.dni AS paciente_dni,
        p.fecha_nacimiento AS paciente_fecha_nacimiento,
        p.foto AS paciente_foto,
        u.nombres AS especialista_nombre,
        u.apellidos AS especialista_apellidos
        FROM citas c INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
        INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE c.idespecialista = :idespecialista
        AND e.idarea = :idarea
        AND c.idservicio = :idservicio";

        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerCitasPorAreaySubarea($idarea, $idsubarea, $idservicio)
    {
        $sql = "SELECT DISTINCT c.*, p.nombres AS paciente_nombres,
        p.apellidos AS paciente_apellidos,
        p.dni AS paciente_dni,
        p.fecha_nacimiento AS paciente_fecha_nacimiento,
        p.foto AS paciente_foto,
        u.nombres AS especialista_nombre,
        u.apellidos AS especialista_apellidos
        FROM citas c INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
        INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE e.idarea = :idarea
        AND e.idsubarea = :idsubarea
        AND c.idservicio = :idservicio";

        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->bindParam(':idsubarea', $idsubarea, PDO::PARAM_INT);
        $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerCitasPorEspecialistayAreaySubarea($idespecialista, $idarea, $idsubarea, $idservicio)
    {
        $sql = "SELECT DISTINCT c.*, p.nombres AS paciente_nombres,
        p.apellidos AS paciente_apellidos,
        p.dni AS paciente_dni,
        p.fecha_nacimiento AS paciente_fecha_nacimiento,
        p.foto AS paciente_foto,
        u.nombres AS especialista_nombre,
        u.apellidos AS especialista_apellidos
        FROM citas c INNER JOIN pacientes p ON c.idpaciente = p.idpaciente
        INNER JOIN especialistas e ON c.idespecialista = e.idespecialista
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE c.idespecialista = :idespecialista
        AND e.idarea = :idarea
        AND e.idsubarea = :idsubarea
        AND c.idservicio = :idservicio";

        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->bindParam(':idsubarea', $idsubarea, PDO::PARAM_INT);
        $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
        $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crearCita($data)
    {
        $sql = "INSERT INTO citas (idpaciente, idespecialista, idregistrador, fecha, hora_inicio, hora_fin, idestado, idservicio) 
                VALUES (:idpaciente, :idespecialista, :idregistrador, :fecha, :hora_inicio, :hora_fin, :idestado, :idservicio)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idpaciente', $data['idpaciente'], PDO::PARAM_INT);
        $stmt->bindParam(':idespecialista', $data['idespecialista'], PDO::PARAM_INT);
        $stmt->bindParam(':idregistrador', $data['idregistrador'], PDO::PARAM_INT);
        $stmt->bindParam(':fecha', $data['fecha']);
        $stmt->bindParam(':hora_inicio', $data['hora_inicio']);
        $stmt->bindParam(':hora_fin', $data['hora_fin']);
        $stmt->bindParam(':idestado', $data['idestado']);
        $stmt->bindParam(':idservicio', $data['idservicio']);

        return $stmt->execute();
    }
}
