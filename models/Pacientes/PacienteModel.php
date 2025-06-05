<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Pacientes/PacienteModel.php';
require_once __DIR__ . '/../Users/UserModel.php';
class PacientesModel
{
    private $baseurl = "https://neuroeduca.edu.pe/SistemaClinico/";
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
                fecha_nacimiento,
                foto
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
        $usuario_id = $usuarioModel->guardarUsuario($data['nombrePadre'], $data['apellidosPadre'], $data['dniPadre'], $data['telefonoPadre'], $data['correoPadre'], '1', '4', $data['usuario'], password_hash($data['password'], PASSWORD_DEFAULT), $data['sexo']);;

        if (!$usuario_id) {
            throw new Exception("Error al crear el usuario");
        }

        $baseurl = $this->baseurl;
        $imagenesMujeres = [
            $baseurl . "assets/img/area2mujer.png",
            $baseurl . "assets/img/area1mujer.png",

        ];

        $imagenesHombres = [
            $baseurl . "assets/img/area2hombre.png",
            $baseurl . "assets/img/area1hombre.png",
        ];

        // Seleccionar imagen aleatoria seg��n sexo
        if (strtolower($data['sexo']) === 'F') {
            $foto = $imagenesMujeres[array_rand($imagenesMujeres)];
        } else {
            $foto = $imagenesHombres[array_rand($imagenesHombres)];
        }

        $sql = "INSERT INTO pacientes (idusuario, nombres, apellidos, dni, fecha_nacimiento) 
                VALUES (:idusuario, :nombres, :apellidos, :dni, :fecha_nacimiento, :sexo, :foto, :parentezco)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idusuario', $usuario_id, PDO::PARAM_INT);
        $stmt->bindParam(':nombres', $data['nombres']);
        $stmt->bindParam(':apellidos', $data['apellidos']);
        $stmt->bindParam(':dni', $data['dni']);
        $stmt->bindParam(':fecha_nacimiento', $data['fechanac']);
        $stmt->bindParam(':sexo', $data['sexo']);
        $stmt->bindParam(':foto', $foto);
        $stmt->bindParam(':parentezco', $data['parentezco']);

        $result = $stmt->execute();
        if ($result) {
            return $this->db->lastInsertId();
        } else {
            throw new Exception("Error al insertar el usuario en la base de datos: " . $result);
        }
    }
}
