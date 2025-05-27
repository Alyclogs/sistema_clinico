<?php
require_once __DIR__ . '/../../config/database.php';

class RoleModel
{
    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

    public function obtenerRoles()
    {
        $sql = "SELECT * FROM roles";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerRolPorId($idrol)
    {
        $sql = "SELECT * FROM roles WHERE idrol = :idrol";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idrol', $idrol, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function guardarRol($rol)
    {
        $sql = "INSERT INTO roles (rol) VALUES (:rol)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':rol', $rol, PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function actualizarRol($idrol, $rol)
    {
        $sql = "UPDATE roles SET rol = :rol WHERE idrol = :idrol";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':rol', $rol, PDO::PARAM_STR);
        $stmt->bindParam(':idrol', $idrol, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function eliminarRol($idrol)
    {
        $sql = "DELETE FROM roles WHERE idrol = :idrol";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idrol', $idrol, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
