<?php
require_once __DIR__ . '/../../models/Users/UserModel.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $usuario = $_POST['usuario'] ?? '';
  $password = $_POST['password'] ?? '';

  $modelo = new UsuarioModel();
  $datosUsuario = $modelo->verificarUsuario($usuario, $password);

  if ($datosUsuario) {
    // Login correcto, guardamos en sesión
    $_SESSION['idusuario']   = $datosUsuario['idusuario'];
    $_SESSION['usuario']     = $datosUsuario['usuario'];
    $_SESSION['nombre']      = $datosUsuario['nombres'] . ' ' . $datosUsuario['apellidos'];
    $_SESSION['rol']         = $datosUsuario['nombre_rol'];
    echo json_encode(['success' => true]);
    exit;
  } else {
    echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos.']);
    exit;
  }
} elseif (isset($_GET['logout']) && $_GET['logout'] === 'true') {
  // Cerrar sesión
  session_unset();
  session_destroy();
  echo json_encode(['success' => true, 'message' => 'Sesión cerrada correctamente.']);
  header("Location: http://localhost/SistemaClinico/views/login.php");
  exit;
} else {
  echo json_encode(['success' => false, 'message' => 'Acceso no permitido.']);
  exit;
}
