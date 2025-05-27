<?php
require_once __DIR__ . '/../../../models/Estados/EstadoModel.php';
$userModel = new EstadoModel();

$idestado = isset($_GET['idestado']) ? $_GET['idestado'] : null;
$estado = null;
if ($idestado) {
    $estado = $userModel->obtenerEstadoPorId($idestado);
    if (!$estado) {
        echo '<div class="alert alert-danger">No se encontró el estado.</div>';
        return;
    }
}
?>
<form id="formEstado">
    <input type="hidden" id="idestado" name="idestado" value="<?php echo $estado ? htmlspecialchars($estado['idestado']) : ''; ?>">
    <div class="mb-3">
        <label for="estado" class="form-label">Nombre del Estado</label>
        <input type="text" class="form-control" id="estado" name="estado" required value="<?php echo $estado ? htmlspecialchars($estado['estado']) : ''; ?>">
    </div>
</form>