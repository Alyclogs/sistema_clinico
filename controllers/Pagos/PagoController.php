<?php
require_once __DIR__ . '/../../models/Pagos/PagosModel.php';

$modelo = new PagosModel();

try {
    if (!isset($_GET['action'])) {
        throw new Exception('Error: Acción no especificada.');
  }
  
    $action = $_GET['action'];

    switch ($action) {
        case 'buscar':
         $filtro = $_GET['filtro'] ?? '';
    $usuarios = $modelo->buscarCitasPaciente($filtro);
    echo json_encode($usuarios);
    exit;
        break;
        
    }
  
  
  
  
 }catch (Exception $e) {
    $mensaje = $e->getMessage();
    $success = false;
}

// Salida JSON estándar
header('Content-Type: application/json');
echo json_encode([
    'success' => $success,
    'message' => $mensaje
]);


?>