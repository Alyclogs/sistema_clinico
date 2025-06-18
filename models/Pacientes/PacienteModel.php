<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Pacientes/PacienteModel.php';
require_once __DIR__ . '/../Users/UserModel.php';
class PacientesModel
{
    private $baseurl = "http://localhost/SistemaClinico/";
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
                foto,
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
    public function crearPaciente($data)
    {
        $baseurl = $this->baseurl;
        $usuarioModel = new UsuarioModel();
        $usuario_id = $usuarioModel->guardarUsuario($data['nombrePadre'], $data['apellidosPadre'], $data['dniPadre'], $data['telefonoPadre'], $data['correoPadre'], '1', '4', $data['usuario'], password_hash($data['password'], PASSWORD_DEFAULT), $data['sexo']);;

        if (!$usuario_id) {
            throw new Exception("Error al crear el usuario");
        }


        $imagenesMujeres = [
            $baseurl . "assets/img/niña2.png",
            $baseurl . "assets/img/niña1.png",

        ];

        $imagenesHombres = [
            $baseurl . "assets/img/niño1.png",
            $baseurl . "assets/img/niño2.png",
        ];

        // Seleccionar imagen aleatoria seg��n sexo
        if (strtolower($data['sexopaciente']) === 'F') {
            $fotoPaciente = $imagenesMujeres[array_rand($imagenesMujeres)];
        } else {
            $fotoPaciente = $imagenesHombres[array_rand($imagenesHombres)];
        }

        $sql = "INSERT INTO pacientes (idusuario, nombres, apellidos, dni, fecha_nacimiento,sexo,foto,parentezco) 
                VALUES (:idusuario, :nombres, :apellidos, :dni, :fecha_nacimiento, :sexo, :fotopaciente, :parentezco)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':idusuario', $usuario_id, PDO::PARAM_INT);
        $stmt->bindParam(':nombres', $data['nombres']);
        $stmt->bindParam(':apellidos', $data['apellidos']);
        $stmt->bindParam(':dni', $data['dni']);
        $stmt->bindParam(':fecha_nacimiento', $data['fechanac']);
        $stmt->bindParam(':sexo', $data['sexopaciente']);
        $stmt->bindParam(':fotopaciente', $fotoPaciente);
        $stmt->bindParam(':parentezco', $data['parentezco']);

        $result = $stmt->execute();
        if ($result) {
            return $this->db->lastInsertId();
        } else {
            throw new Exception("Error al insertar el usuario en la base de datos: " . $result);
        }
    }
}
