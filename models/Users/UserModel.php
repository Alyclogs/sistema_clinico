<?php
// Importa la clase PDO
require_once __DIR__ . '/../../config/database.php';
class UsuarioModel
{
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
                return $usuarioData;
            } else {
                return false;
            }
        } catch (PDOException $e) {
            die("Error al verificar usuario: " . $e->getMessage());
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
                SELECT u.*, r.idrol, r.rol AS nombre_rol, e.idestado, e.estado AS nombre_estado
                FROM usuarios u
                INNER JOIN roles r ON u.idrol = r.idRol
                INNER JOIN estados e ON u.idEstado = e.idEstado
                ORDER BY u.idUsuario DESC
            ");
            $stmt->execute();
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            closeDatabase($pdo);

            return $usuarios;
        } catch (PDOException $e) {
            die("Error al obtener usuarios: " . $e->getMessage());
        }
    }

    public function obtenerRoles()
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("SELECT * FROM roles");
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

    public function guardarUsuario($nombres, $apellidos, $dni, $telefono, $correo, $idestado, $idrol, $usuario, $password)
    {
        try {
            $pdo = connectDatabase();

            $stmt = $pdo->prepare("
                INSERT INTO usuarios (idusuario, nombres, apellidos, dni, telefono, correo, idestado, idrol, usuario, password)
                VALUES (NULL, :nombres, :apellidos, :dni, :telefono, :correo, :idestado, :idrol, :usuario, :password)
            ");
            $stmt->execute([
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
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            closeDatabase($pdo);

            return $usuarios;
        } catch (PDOException $e) {
            die("Error al obtener usuarios: " . $e->getMessage());
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
