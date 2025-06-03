<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Pacientes/PacienteModel.php';
require_once __DIR__ . '/../Users/UserModel.php';

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

    public function crearPaciente($data)
    {
        $usuarioModel = new UsuarioModel();
        $usuario_id = $usuarioModel->guardarUsuario($data['nombrePadre'], $data['apellidosPadre'], $data['dniPadre'], $data['telefonoPadre'], $data['correoPadre'], '1', '4', $data['usuario'], password_hash($data['password'], PASSWORD_DEFAULT));;

        if (!$usuario_id) {
            throw new Exception("Error al crear el usuario");
        }

        $sql = "INSERT INTO pacientes (idusuario, nombres, apellidos, dni, fecha_nacimiento) 
                VALUES (:idusuario, :nombres, :apellidos, :dni, :fecha_nacimiento)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idusuario', $usuario_id, PDO::PARAM_INT);
        $stmt->bindParam(':nombres', $data['nombres']);
        $stmt->bindParam(':apellidos', $data['apellidos']);
        $stmt->bindParam(':dni', $data['dni']);
        $stmt->bindParam(':fecha_nacimiento', $data['fechanac']);

        $result = $stmt->execute();
        if ($result) {
            return $this->db->lastInsertId();
        } else {
            throw new Exception("Error al insertar el usuario en la base de datos: " . $result);
        }
    }
}
