<?php
require_once __DIR__ . '/../../../models/Users/UserModel.php';
$userModel = new UsuarioModel();
$roles = $userModel->obtenerRoles();
$estados = $userModel->obtenerEstados();

$id = isset($_GET['id']) ? $_GET['id'] : null;
$usuario = null;
if ($id) {
    $usuario = $userModel->obtenerUsuarioPorId($id);
    if (!$usuario) {
        echo '<div class="alert alert-danger">No se encontró el usuario.</div>';
        return;
    }
}
?>
<form id="formUsuario">
    <input type="hidden" id="idUsuario" name="idUsuario" value="<?php echo $usuario ? htmlspecialchars($usuario['idusuario']) : ''; ?>">
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="nombres" class="form-label">Nombres</label>
            <input type="text" class="form-control" id="nombres" name="nombres" required pattern="[A-Za-z\s]+" title="Solo se permiten letras y espacios" value="<?php echo $usuario ? htmlspecialchars($usuario['nombres']) : ''; ?>">
        </div>
        <div class="col-md-6 mb-3">
            <label for="apellidos" class="form-label">Apellidos</label>
            <input type="text" class="form-control" id="apellidos" name="apellidos" required pattern="[A-Za-z\s]+" title="Solo se permiten letras y espacios" value="<?php echo $usuario ? htmlspecialchars($usuario['apellidos']) : ''; ?>">
        </div>
    </div>
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="dni" class="form-label">DNI</label>
            <input type="text" class="form-control" id="dni" name="dni" required maxlength="8" pattern="\d{8}" title="El DNI debe tener exactamente 8 dígitos" value="<?php echo $usuario ? htmlspecialchars($usuario['dni']) : ''; ?>">
        </div>
        <div class="col-md-6 mb-3">
            <label for="telefono" class="form-label">Teléfono</label>
            <input type="tel" class="form-control" id="telefono" name="telefono" required maxlength="9" pattern="[0-9]{9}" title="El teléfono debe tener exactamente 9 dígitos" value="<?php echo $usuario ? htmlspecialchars($usuario['telefono']) : ''; ?>">
        </div>
    </div>
    <div class="mb-3">
        <label for="correo" class="form-label">Correo Electrónico</label>
        <input type="email" class="form-control" id="correo" name="correo" required value="<?php echo $usuario ? htmlspecialchars($usuario['correo']) : ''; ?>">
    </div>
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="usuario" class="form-label">Nombre de usuario</label>
            <input type="text" class="form-control" id="usuario" name="usuario" required value="<?php echo $usuario ? htmlspecialchars($usuario['usuario']) : ''; ?>">
        </div>
        <div class="col-md-6 mb-3">
            <label for="password" class="form-label">Contraseña</label>
            <div class="input-group">
                <input type="password" class="form-control" name="password" id="password" <?php echo $usuario ? '' : 'required'; ?> maxlength="8" value="">
                <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                    <i class="bi bi-eye" id="togglePasswordIcon"></i>
                </button>
            </div>
            <?php if ($usuario) { ?>
                <small class="text-muted">Dejar en blanco para no cambiar la contraseña.</small>
            <?php } ?>
        </div>
    </div>
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="rolUsuario" class="form-label">Rol de Usuario</label>
            <select class="form-select" id="rolUsuario" name="idRol" required>
                <option value="" disabled <?php echo !$usuario ? 'selected' : ''; ?>>Seleccione un rol</option>
                <?php foreach ($roles as $rol) { ?>
                    <option value="<?php echo htmlspecialchars($rol['idrol']) ?>" <?php if ($usuario && $usuario['idrol'] == $rol['idrol']) echo 'selected'; ?>><?php echo htmlspecialchars($rol['rol']) ?></option>
                <?php } ?>
            </select>
        </div>
        <div class="col-md-6 mb-3">
            <label for="idEstado" class="form-label">Estado</label>
            <select class="form-select" id="idEstado" name="idEstado" required>
                <?php foreach ($estados as $estado) { ?>
                    <option value="<?php echo htmlspecialchars($estado['idestado']) ?>" <?php if ($usuario && $usuario['idestado'] == $estado['idestado']) echo 'selected'; ?>><?php echo htmlspecialchars($estado['estado']) ?></option>
                <?php } ?>
            </select>
        </div>
    </div>
</form>
<script>
    // Mostrar/ocultar contraseña
    $(document).ready(function() {
        $('#togglePassword').on('click', function() {
            const passwordField = $('#password');
            const icon = $('#togglePasswordIcon');
            if (passwordField.attr('type') === 'password') {
                passwordField.attr('type', 'text');
                icon.removeClass('bi-eye').addClass('bi-eye-slash');
            } else {
                passwordField.attr('type', 'password');
                icon.removeClass('bi-eye-slash').addClass('bi-eye');
            }
        });
    });
</script>