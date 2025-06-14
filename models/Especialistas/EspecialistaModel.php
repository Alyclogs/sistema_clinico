<?php
require_once __DIR__ . '/../../config/database.php';

class EspecialistaModel
{
  private $baseurl = "http://localhost/SistemaClinico/";

  private $db;
  public function __construct()
  {
    $this->db = connectDatabase();
  }

  public function existeEspecialista($idusuario)
  {
    try {
      $pdo = connectDatabase();

      $stmt = $pdo->prepare("SELECT COUNT(*) FROM especialistas WHERE idespecialista = :idusuario");
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
  public function obtenersubareas()
  {
    $sql = "SELECT * FROM subareas";
    $stmt = $this->db->query($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function obtenerServicios()
  {
    $sql = "SELECT * FROM servicios";
    $stmt = $this->db->query($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function obtenerEspecialistas()
  {
    $sql = "SELECT 
            e.idespecialista, 
            u.nombres AS nom_especialista, 
            u.apellidos AS ape_especialista,
            u.dni AS dni_especialista,
            u.telefono AS telefono_especialista,
            u.correo AS correo_especialista,
            a.idarea,
            a.area AS nombre_area,
            sa.idsubarea,
            sa.subarea AS nombre_subarea,
            e.idservicio
        FROM especialistas e
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        INNER JOIN areas a ON e.idarea = a.idarea
        LEFT JOIN subareas sa ON e.idsubarea = sa.idsubarea";

    $stmt = $this->db->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $especialistas = [];

    foreach ($rows as $row) {
      $id = $row['idespecialista'];

      // Si no existe el especialista, lo creamos
      if (!isset($especialistas[$id])) {
        $especialistas[$id] = [
          'idespecialista' => $id,
          'nombres' => $row['nom_especialista'],
          'apellidos' => $row['ape_especialista'],
          'dni' => $row['dni_especialista'],
          'telefono' => $row['telefono_especialista'],
          'correo' => $row['correo_especialista'],
          'especialidades' => []
        ];
      }

      // Agregamos especialidad
      $especialidades = &$especialistas[$id]['especialidades'];

      $especialidades[] = [
        'idarea' => $row['idarea'],
        'nombre_area' => $row['nombre_area'],
        'idsubarea' => $row['idsubarea'],
        'nombre_subarea' => $row['nombre_subarea'],
        'idservicio' => $row['idservicio']
      ];
    }

    // Opcional: resetear índices si quieres que sea array numérico
    return array_values($especialistas);
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
                u.foto AS foto_especialista,
                a.area AS nombre_area,
                sa.subarea AS nombre_subarea
            FROM especialistas e
            INNER JOIN usuarios u ON e.idespecialista = u.idusuario
            INNER JOIN areas a ON e.idarea = a.idarea
            LEFT JOIN subareas sa ON e.idsubarea = sa.idsubarea
            WHERE e.idespecialista = :idespecialista";

    $stmt = $this->db->prepare($sql);
    $stmt->bindParam(':idespecialista', $idespecialista, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function obtenerEspecialistaPorAreaySubareayServicio($idarea, $idsubarea, $idservicio)
  {
    $sql = "SELECT e.*, u.nombres AS nom_especialista, u.apellidos AS ape_especialista FROM especialistas e
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE e.idarea = :idarea AND e.idsubarea = :idsubarea AND e.idservicio = :idservicio";
    $stmt = $this->db->prepare($sql);
    $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
    $stmt->bindParam(':idsubarea', $idsubarea, PDO::PARAM_INT);
    $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function obtenerEspecialistaPorArea($idarea)
  {
    try {
      $sql = "SELECT e.*,
      u.nombres AS nom_especialista,
      u.apellidos AS ape_especialista,
      u.dni AS dni_especialista,
      u.telefono AS telefono_especialista,
      u.correo AS correo_especialista,
      u.usuario AS nombre_usuario,
      u.foto AS foto_especialista,
      FROM especialistas e
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE e.idarea = :idarea";
      $stmt = $this->db->prepare($sql);
      $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Error($e);
    }
  }

  public function obtenerEspecialistaPorAreayServicio($idarea, $idservicio)
  {
    try {
      $sql = "SELECT e.*,
      u.nombres AS nom_especialista,
      u.apellidos AS ape_especialista,
      u.dni AS dni_especialista,
      u.telefono AS telefono_especialista,
      u.correo AS correo_especialista,
      u.usuario AS nombre_usuario,
      u.foto AS foto_especialista,
      FROM especialistas e
        INNER JOIN usuarios u ON e.idespecialista = u.idusuario
        WHERE e.idarea = :idarea AND e.idservicio = :idservicio";
      $stmt = $this->db->prepare($sql);
      $stmt->bindParam(':idarea', $idarea, PDO::PARAM_INT);
      $stmt->bindParam(':idservicio', $idservicio, PDO::PARAM_INT);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Error($e);
    }
  }

  public function guardarEspecialista(
    $nombres,
    $apellidos,
    $dni,
    $telefono,
    $correo,
    $idestado,
    $idrol,
    $usuario,
    $passwordHash,
    $sexo,
    $especialidades
  ) {
    $baseurl = $this->baseurl;
    $pdo = connectDatabase();

    $imagenesMujeres = [
      $baseurl . "assets/img/doctora1.png",
      $baseurl . "assets/img/doctora2.png",
      $baseurl . "assets/img/doctora3.png",
    ];

    $imagenesHombres = [
      $baseurl . "assets/img/doctor1.png",
      $baseurl . "assets/img/doctor2.png",
      $baseurl . "assets/img/doctor3.png",
    ];

    $foto = (strtolower($sexo) === 'f')
      ? $imagenesMujeres[array_rand($imagenesMujeres)]
      : $imagenesHombres[array_rand($imagenesHombres)];

    try {
      $pdo->beginTransaction();

      $stmtUsuario = $pdo->prepare("
      INSERT INTO usuarios 
        (nombres, apellidos, dni, telefono, correo, idestado, idrol, usuario, password, foto, sexo)
      VALUES 
        (:nombres, :apellidos, :dni, :telefono, :correo, :idestado, :idrol, :usuario, :password, :foto, :sexo)
    ");

      $stmtUsuario->execute([
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

      $idespecialista = $pdo->lastInsertId();

      $stmtEspecialista = $pdo->prepare("
      INSERT INTO especialistas (idespecialista, idarea, idsubarea, idservicio)
      VALUES (:idespecialista, :idarea, :idsubarea, :idservicio)
    ");

      foreach ($especialidades as $esp) {
        $stmtEspecialista->execute([
          'idespecialista' => $idespecialista,
          'idarea' => $esp['idarea'],
          'idsubarea' => $esp['idsubarea'],
          'idservicio' => $esp['idservicio']
        ]);
      }

      $pdo->commit();
      return $idespecialista;
    } catch (PDOException $e) {
      $pdo->rollBack();
      throw $e;
    } finally {
      closeDatabase($pdo);
    }
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
