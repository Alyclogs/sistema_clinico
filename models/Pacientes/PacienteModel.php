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

  public function crearCita($data)
    {
        $sql = "INSERT INTO citas (idpaciente, idespecialista, idusuario, fecha, hora_inicio, hora_fin) 
                VALUES (:idpaciente, :idespecialista, :idusuario, :fecha, :hora_inicio, :hora_fin)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idpaciente', $data['idpaciente'], PDO::PARAM_INT);
        $stmt->bindParam(':idespecialista', $data['idespecialista'], PDO::PARAM_INT);
        $stmt->bindParam(':idusuario', $data['idusuario'], PDO::PARAM_INT);
        $stmt->bindParam(':fecha', $data['fecha']);
        $stmt->bindParam(':hora_inicio', $data['hora_inicio']);
        $stmt->bindParam(':hora_fin', $data['hora_fin']);

        return $stmt->execute();
    }

}