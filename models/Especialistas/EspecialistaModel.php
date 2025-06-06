<?php
require_once __DIR__ . '/../../config/database.php';

class EspecialistaModel
{
    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

    public function existeEspecialista($idusuario)
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM especialistas WHERE idusuario = :idusuario");
            $stmt->execute(['idusuario' => $idusuario]);

            $especialistaData = $stmt->fetch(PDO::FETCH_ASSOC);

            closeDatabase($pdo);
            return $especialistaData['COUNT(*)'] > 0;
        } catch (PDOException $e) {
        }
    }

    public function obtenerAreas()
    {
        $sql = "SELECT * FROM areas";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerEspecialistas()
    {
        $sql = "SELECT 
                e.*, 
                u.nombres AS nom_especialista, 
                u.apellidos AS ape_especialista,
                u.dni AS dni_especialista,
                u.telefono AS telefono_especialista,
                u.correo AS correo_especialista,
                a.area AS nombre_area,
                sa.subarea AS nombre_subarea
            FROM especialistas e
            INNER JOIN usuarios u ON e.idusuario = u.idusuario
            INNER JOIN areas a ON e.idarea = a.idarea
            LEFT JOIN subareas sa ON e.idsubarea = sa.idsubarea";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerEspecialistaPorId($idespecialista)
    {
        $sql = "SELECT 
                e.*, 
                u.nombres AS nom_especialista, 
                u.apellidos AS ape_especialista,
                u.dni AS dni_especialista,
                u.telefono AS telefono_especialista,
                u.correo AS correo_especialista,
                u.usuario AS nombre_usuario,
                a.area AS nombre_area,
                sa.subarea AS nombre_subarea
            FROM especialistas e
            INNER JOIN usuarios u ON e.idusuario = u.idusuario
            INNER JOIN areas a ON e.idarea = a.idarea
            LEFT JOIN subareas sa ON e.idsubarea = sa.idsubarea
            WHERE e.idespecialista = :idespecialista";

        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function obtenerEspecialistaPorAreaySubarea($idarea, $idsubarea)
    {
        $sql = "SELECT e.*, u.nombres AS nom_especialista, u.apellidos AS ape_especialista FROM especialistas e
        INNER JOIN usuarios u ON e.idusuario = u.idusuario
        WHERE e.idarea = :idarea AND e.idsubarea = :idsubarea";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->bindParam(':idsubarea', $idsubarea, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function guardarEspecialista($idusuario, $idarea, $idsubarea)
    {
        $sql = "INSERT INTO especialistas (idusuario, idarea, idsubarea) VALUES (:idusuario, :idarea, :idsubarea)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idusuario', $idusuario, PDO::PARAM_INT);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->bindParam(':idsubarea', $idsubarea, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function actualizarEspecialista($idespecialista, $idusuario, $idarea, $idsubarea)
    {
        $sql = "UPDATE especialistas SET idespecialista = :idespecialista, idarea = :idarea, idsubarea = :idsubarea WHERE idespecialista = :idespecialista";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idusuario', $idusuario, PDO::PARAM_INT);
        $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
        $stmt->bindParam(':idsubarea', $idsubarea, PDO::PARAM_INT);
        $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function eliminarEspecialista($idespecialista)
    {
        $sql = "DELETE FROM especialistas WHERE idespecialista = :idespecialista";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
