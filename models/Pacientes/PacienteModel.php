<?php
require_once __DIR__ . '/../../config/database.php';

class PacientesModel
{
    private $db;
    public function __construct()
    {
        $this->db = connectDatabase();
    }

  public function obtenerPacientesFiltrados($filtro = null)
{
    $sql = "SELECT 
                idpaciente,
                nombres,
                apellidos,
                dni,
                fecha_nacimiento
            FROM pacientes";

    // Si se envía un filtro, lo agregamos
    if ($filtro) {
        $sql .= " WHERE 
            nombres LIKE :filtro OR 
            apellidos LIKE :filtro OR 
            dni LIKE :filtro";
    }

    $stmt = $this->db->prepare($sql);

    if ($filtro) {
        $filtroParam = '%' . $filtro . '%';
        $stmt->bindParam(':filtro', $filtroParam, PDO::PARAM_STR);
    }

    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

}