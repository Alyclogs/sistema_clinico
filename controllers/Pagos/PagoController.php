<?php
require_once __DIR__ . '/../../models/Pagos/PagosModel.php';

$modelo = new PagosModel();

try {
    if (!isset($_GET['action'])) {
        throw new Exception('Error: Acciиоn no especificada.');
  }
  
    $action = $_GET['action'];

    switch ($action) {
      case 'buscar':
   $filtro = $_GET['filtro'] ?? '';
        $idestado = isset($_GET['idestado']) ? (int)$_GET['idestado'] : 3;
    $usuarios = $modelo->buscarCitasPaciente($filtro, $idestado);
    echo json_encode($usuarios);
    exit;
    break;

        
        case 'create':
    $idsCitas = !empty($_POST['ids_citas']) ? explode(',', $_POST['ids_citas']) : [];
    $costoTotal = !empty($_POST['monto']) ? floatval($_POST['monto']) : null;
  


    $idPaciente = !empty($_POST['id_paciente']) ? $_POST['id_paciente'] : null;
    $idModalidad = !empty($_POST['modalidad-pago']) ? $_POST['modalidad-pago'] : null;
    $idUsuario = !empty($_POST['idUsuario']) ? $_POST['idUsuario'] : null;
    $idOpcion = !empty($_POST['opcion-pago']) ? $_POST['opcion-pago'] : null;
    $codigo = !empty($_POST['codigo']) ? $_POST['codigo'] : null;
     $codigovoucher = !empty($_POST['codigo-voucher']) ? $_POST['codigo-voucher'] : null;
   
    if (!$idPaciente || !$idModalidad || !$idOpcion || empty($idsCitas) || $costoTotal === null) {
        $mensaje = 'Faltan datos obligatorios para registrar el pago.';
        break;
    }

 
    $success = $modelo->guardarPagos($idsCitas, $costoTotal, $idPaciente, $idModalidad, $idOpcion, $idUsuario , $codigo, $codigovoucher);

    $mensaje = $success ? 'Pago registrado correctamente.' : 'Error al registrar el pago.';
    break;


            
            
        
    }
  
  
  
  
 }catch (Exception $e) {
    $mensaje = $e->getMessage();
    $success = false;
}

// Salida JSON estивndar
header('Content-Type: application/json');
echo json_encode([
    'success' => $success,
    'message' => $mensaje
]);


?>