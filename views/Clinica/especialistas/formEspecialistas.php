<?php
require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';
$especialistaModel = new EspecialistaModel();
$areas = $especialistaModel->obtenerAreas();
$estados = $especialistaModel->obtenerEstados();


$subareas = $especialistaModel->obtenersubareas(); // obtiene todas
$subareasAgrupadas = [];
$servicios = $especialistaModel->obtenerServicios();

foreach ($subareas as $sub) {
    $subareasAgrupadas[$sub['idarea']][] = $sub;
}

$id = isset($_GET['id']) ? $_GET['id'] : null;
$usuario = null;

if ($id) {
    $usuario = $especialistaModel->obtenerEspecialistaPorId($id);
    if (!$usuario) {
        echo '<div class="alert alert-danger">No se encontró el usuario.</div>';
        return;
    }
}



?>


<form id="formUsuario" enctype="multipart/form-data" class="mt-3">
    
   <div class="row">
        <div class="col-3 flex-column  d-flex align-items-center justify-content-center g-3">
            <div class="foto-user">
            <img
  id="prev-image"
  src="<?php echo $usuario ? htmlspecialchars($usuario['foto_usuario']) : ''; ?>"
  alt="Vista previa"
  style="max-width: 100%; <?php echo $usuario && !empty($usuario['foto_usuario']) ? '' : 'display:none;'; ?> border-radius: 10px;"
/>

            </div>
            
            
            <div class="btn-adjuntar" onclick="document.getElementById('fileInput').click();">
                <span>Adjuntar Foto</span>
            </div>
            
            
            
        <input type="file" id="fileInput"  name="foto" class="input-file" accept="image/*" style="display:none" onchange="previewImage(event)">
            
        </div>
           
           
        
        <div class="col-9">
     
                <div class="row mt-3">
        
         <input type="hidden" id="idUsuario" name="idUsuario" value="<?php echo $usuario ? htmlspecialchars($usuario['idespecialista']) : ''; ?>">
        <div class="col-md-6 mb-3">
            <label for="nombres" class="form-label">Nombres <span>*</span></label>
            <input type="text" class="form-control" id="nombres" name="nombres" required  pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+" title="Solo se permiten letras y espacios" value="<?php echo $usuario ? htmlspecialchars($usuario['nom_especialista']) : ''; ?>">
        </div>
        <div class="col-md-6 mb-3">
            <label for="apellidos" class="form-label">Apellidos<span>*</span></label>
            <input type="text" class="form-control" id="apellidos" name="apellidos" required  pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+" title="Solo se permiten letras y espacios" value="<?php echo $usuario ? htmlspecialchars($usuario['ape_especialista']) : ''; ?>">
        </div>
    </div>
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="dni" class="form-label">DNI<span>*</span></label>
            <input type="text" class="form-control" id="dni" name="dni" required maxlength="8" pattern="\d{8}" title="El DNI debe tener exactamente 8 dígitos" value="<?php echo $usuario ? htmlspecialchars($usuario['dni_especialista']) : ''; ?>">
        </div>
        
          <div class="col-md-6 mb-3">
           <label for="sexo" class="form-label">Sexo<span>*</span></label>
          <select class="form-select" id="sexoUsuario" name="sexo" required>
    <option value="" disabled <?php echo empty($usuario['sexo_especialista']) ? 'selected' : ''; ?>>Seleccione</option>
    <option value="F" <?php echo (isset($usuario['sexo_especialista']) && $usuario['sexo_especialista'] === 'F') ? 'selected' : ''; ?>>Femenino</option>
    <option value="M" <?php echo (isset($usuario['sexo_especialista']) && $usuario['sexo_especialista'] === 'M') ? 'selected' : ''; ?>>Masculino</option>
</select>

        </div>
        
        
        
      
    </div>
    
       <div class="row">
             <div class="col-md-6 mb-3">
            <label for="telefono" class="form-label">Teléfono<span>*</span></label>
            <input type="tel" class="form-control" id="telefono" name="telefono"  maxlength="9" required pattern="[0-9]{9}" title="El teléfono debe tener exactamente 9 dígitos" value="<?php echo $usuario ? htmlspecialchars($usuario['telefono_especialista']) : ''; ?>">
        </div>
        
     <div class="col-md-6 mb-3">
        <label for="correo" class="form-label">Correo Electrónico<span>*</span></label>
        <input type="email" required class="form-control" id="correo" name="correo"  value="<?php echo $usuario ? htmlspecialchars($usuario['correo_especialista']) : ''; ?>">
    </div> </div>
    
    
   


    
    
    
    
    <div class="row">
        <div class="col-md-6 mb-3">
          <label for="usuario" class="form-label">Nombre de usuario<span>*</span></label>
            <input type="text" class="form-control" id="usuario" name="especialista"  required value="<?php echo $usuario ? htmlspecialchars($usuario['nombre_usuario']) : ''; ?>">
        </div>
        <div class="col-md-6 mb-3">
          <label for="password" class="form-label">Contraseña<span>*</span></label>
            <div class="input-group">
                <input type="password" class="form-control" name="password" id="password" <?php echo $usuario ? '' : 'required'; ?> maxlength="8" value="">
                 <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                    <i class="bi bi-eye" id="togglePasswordIcon"></i>
                </button>
            </div>
           
        </div>
         <?php if ($usuario) { ?>
          <div class="row">
       
        <div class="col-md-6 mb-3">
            <label for="idEstado" class="form-label">Estado</label>
            <select class="form-select" id="idEstado" name="idEstado" required>
                <?php foreach ($estados as $estado) { ?>
                    <option value="<?php echo htmlspecialchars($estado['idestado']) ?>" <?php if ($usuario && $usuario['idestado'] == $estado['idestado']) echo 'selected'; ?>><?php echo htmlspecialchars($estado['estado']) ?></option>
                <?php } ?>
            </select>
        </div>
    </div>
           <?php } ?>
    </div>
        </div>
    
   
</div>
   
</form>
<script>
  function previewImage(event) {
    const input = event.target;
    const file = input.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.getElementById('prev-image');
        img.src = e.target.result;
        img.style.display = 'block'; // Mostrar la imagen
      };
      reader.readAsDataURL(file);
    }
  }
</script>
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
<script>
    function generarNombreUsuarioYPassword() {
        const nombres = document.getElementById('nombres').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        const dni = document.getElementById('dni').value.trim();
        const usuarioField = document.getElementById('usuario');
        const passwordField = document.getElementById('password');

        // Validamos que los campos necesarios estén llenos
        if (nombres && apellidos && dni.length === 8) {
            const primeraLetraNombre = nombres.charAt(0).toLowerCase();
            const apellidoPaterno = apellidos.split(' ')[0].toLowerCase();

            // Crear nombre de usuario (ejemplo: jrodriguez)
            const nombreUsuario = primeraLetraNombre + apellidoPaterno;
            usuarioField.value = nombreUsuario;

            // Establecer la contraseña como el DNI
            passwordField.value = dni;
        }
    }

    document.getElementById('nombres').addEventListener('input', generarNombreUsuarioYPassword);
    document.getElementById('apellidos').addEventListener('input', generarNombreUsuarioYPassword);
    document.getElementById('dni').addEventListener('input', generarNombreUsuarioYPassword);
</script>
