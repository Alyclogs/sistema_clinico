<?php
require_once __DIR__ . '/../../../models/Roles/RoleModel.php';
$userModel = new RoleModel();

$idrol = isset($_GET['idrol']) ? $_GET['idrol'] : null;
$rol = null;
if ($idrol) {
    $rol = $userModel->obtenerRolPorId($idrol); // Debes implementar este método en tu modelo
    if (!$rol) {
        echo '<div class="alert alert-danger">No se encontró el rol.</div>';
        return;
    }
}
?>
<form id="formRol">
    <input type="hidden" id="idrol" name="idrol" value="<?php echo $rol ? htmlspecialchars($rol['idrol']) : ''; ?>">
    <div class="mb-3">
        <label for="rol" class="form-label">Nombre del Rol</label>
        <input type="text" class="form-control" id="rol" name="rol" required value="<?php echo $rol ? htmlspecialchars($rol['rol']) : ''; ?>">
    </div>
</form>