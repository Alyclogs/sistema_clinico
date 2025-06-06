<?php
// Importa la clase PDO
require_once __DIR__ . '/../../config/database.php';

class UsuarioModel
{
    private $baseurl = "https://neuroeduca.edu.pe/SistemaClinico/";
    public function verificarUsuario($usuario, $password)
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("
            SELECT u.*, r.rol AS nombre_rol 
            FROM usuarios u
            INNER JOIN roles r ON u.idrol = r.idRol
            WHERE u.usuario = :usuario
            LIMIT 1
        ");
            $stmt->execute([
                'usuario' => $usuario
            ]);

            $usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);
            closeDatabase($pdo);

            // Verificación de contraseña
            if ($usuarioData && password_verify($password, $usuarioData['password'])) {
                return $usuarioData; // Login correcto, incluye nombre_rol
            } else {
                return false; // Usuario o password incorrecto
            }
        } catch (PDOException $e) {
            die("Error al verificar usuario: " . $e->getMessage());
        }
    }
    public function existeUsuario($nombreusuario)
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE usuario = :usuario");
            $stmt->execute(['usuario' => $nombreusuario]);

            $usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);

            closeDatabase($pdo);
            return $usuarioData['COUNT(*)'] > 0;
        } catch (PDOException $e) {
        }
    }

    public function obtenerUsuarioPorId($id)
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("
                SELECT u.*, r.idrol, r.rol AS nombre_rol, e.idestado, e.estado AS nombre_estado
                FROM usuarios u
                INNER JOIN roles r ON u.idrol = r.idRol
                INNER JOIN estados e ON u.idEstado = e.idEstado
                WHERE u.idusuario = :id
            ");
            $stmt->execute(['id' => $id]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            closeDatabase($pdo);

            return $usuario;
        } catch (PDOException $e) {
            die("Error al obtener usuario por ID: " . $e->getMessage());
        }
    }

    public function obtenerUsuarios()
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("
              SELECT 
    u.*, 
    r.idrol, 
    r.rol AS nombre_rol, 
    e.idestado, 
    e.estado AS nombre_estado
FROM usuarios u
INNER JOIN roles r ON u.idrol = r.idrol
INNER JOIN estados e ON u.idestado = e.idestado
WHERE r.rol != 'Especialista'
ORDER BY u.idUsuario DESC;

            ");
            $stmt->execute();
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            closeDatabase($pdo);

            return $usuarios;
        } catch (PDOException $e) {
            die("Error al obtener usuarios: " . $e->getMessage());
        }
    }

    public function buscarUsuarios($filtro = '')
    {
        try {
            $pdo = connectDatabase();

            $sql = "
            SELECT 
                u.*, 
                r.idrol, 
                r.rol AS nombre_rol, 
                e.idestado, 
                e.estado AS nombre_estado
            FROM usuarios u
            INNER JOIN roles r ON u.idrol = r.idrol
            INNER JOIN estados e ON u.idestado = e.idestado
            WHERE r.rol != 'Especialista'
        ";

            // Si hay filtro, se agrega la condición
            if (!empty($filtro)) {
                $sql .= " AND (
                u.nombres LIKE :filtro 
                OR u.apellidos LIKE :filtro 
                OR u.dni LIKE :filtro
            )";
            }

            $sql .= " ORDER BY u.idusuario DESC";

            $stmt = $pdo->prepare($sql);

            if (!empty($filtro)) {
                $filtro = '%' . $filtro . '%';
                $stmt->bindParam(':filtro', $filtro, PDO::PARAM_STR);
            }

            $stmt->execute();
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            closeDatabase($pdo);

            return $usuarios;
        } catch (PDOException $e) {
            die("Error al buscar usuarios: " . $e->getMessage());
        }
    }


    public function obtenerRoles()
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("SELECT * FROM roles WHERE rol !='Especialista' and rol !='Paciente' ");
            $stmt->execute();
            $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            closeDatabase($pdo);

            return $roles;
        } catch (PDOException $e) {
            die("Error al obtener roles: " . $e->getMessage());
        }
    }

    public function obtenerEstados()
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("SELECT * FROM estados");
            $stmt->execute();
            $estados = $stmt->fetchAll(PDO::FETCH_ASSOC);
            closeDatabase($pdo);

            return $estados;
        } catch (PDOException $e) {
            die("Error al obtener estados: " . $e->getMessage());
        }
    }

    public function guardarUsuario($nombres, $apellidos, $dni, $telefono, $correo, $idestado, $idrol, $usuario, $passwordHash, $sexo)
    {
        $baseurl = $this->baseurl;

        $pdo = connectDatabase();

        // Avatares seg��n sexo
        $imagenesMujeres = [
            $baseurl . "assets/img/area2mujer.png",
            $baseurl . "assets/img/area1mujer.png",
        ];

        $imagenesHombres = [
            $baseurl . "assets/img/area2hombre.png",
            $baseurl . "assets/img/area1hombre.png",
        ];

        // Seleccionar imagen aleatoria seg��n sexo
        if (strtolower($sexo) === 'F') {
            $foto = $imagenesMujeres[array_rand($imagenesMujeres)];
        } else {
            $foto = $imagenesHombres[array_rand($imagenesHombres)];
        }

        try {
            $stmt = $pdo->prepare("
            INSERT INTO usuarios 
                (nombres, apellidos, dni, telefono, correo, idestado, idrol, usuario, password, foto , sexo)
            VALUES 
                (:nombres, :apellidos, :dni, :telefono, :correo, :idestado, :idrol, :usuario, :password, :foto , :sexo)
        ");

            $executed = $stmt->execute([
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'dni' => $dni,
                'telefono' => $telefono,
                'correo' => $correo,
                'idestado' => $idestado,
                'idrol' => $idrol,
                'usuario' => $usuario,
                'password' => $passwordHash,
                'foto' => $foto,
                'sexo' => $sexo,
            ]);

            if ($executed) {
                return $pdo->lastInsertId(); // Retornar el ID del usuario insertado
            } else {
                throw new Exception("Error al insertar el usuario en la base de datos.");
            }
        } catch (PDOException $e) {
            throw $e;
        } finally {
            closeDatabase($pdo);
        }
    }



    public function actualizarUsuario($id, $nombres, $apellidos, $dni, $telefono, $correo, $idestado, $idrol, $usuario, $password)
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("
                UPDATE usuarios
                SET nombres = :nombres,
                    apellidos = :apellidos,
                    dni = :dni,
                    telefono = :telefono,
                    correo = :correo,
                    idestado = :idestado,
                    idrol = :idrol,
                    usuario = :usuario,
                    password = :password
                WHERE idusuario = :id
            ");
            $stmt->execute([
                'id' => $id,
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'dni' => $dni,
                'telefono' => $telefono,
                'correo' => $correo,
                'idestado' => $idestado,
                'idrol' => $idrol,
                'usuario' => $usuario,
                'password' => password_hash($password, PASSWORD_DEFAULT)

            ]);
            closeDatabase($pdo);

            return true;
        } catch (PDOException $e) {
            die("Error al actualizar usuario: " . $e->getMessage());
        }
    }

    public function eliminarUsuario($id)
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("DELETE FROM usuarios WHERE idusuario = :id");
            $stmt->execute(['id' => $id]);
            closeDatabase($pdo);

            return true;
        } catch (PDOException $e) {
            die("Error al eliminar usuario: " . $e->getMessage());
        }
    }
}
