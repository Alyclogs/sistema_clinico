<?php
require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';
$especialistaModel = new EspecialistaModel();
$areas = $especialistaModel->obtenerAreas();


$subareas = $especialistaModel->obtenerSubareas(); // obtiene todas
$subareasAgrupadas = [];

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
  <span class="title-span">Información General</span>

<form id="formUsuario" class="mt-3">
    
  
    
   
    <div class="row">
        
         <input type="hidden" id="idUsuario" name="idUsuario" value="<?php echo $usuario ? htmlspecialchars($usuario['idusuario']) : ''; ?>">
        <div class="col-md-6 mb-3">
            <label for="nombres" class="form-label">Nombres <span>*</span></label>
            <input type="text" class="form-control" id="nombres" name="nombres" required pattern="[A-Za-z\s]+" title="Solo se permiten letras y espacios" value="<?php echo $usuario ? htmlspecialchars($usuario['nom_especialista']) : ''; ?>">
        </div>
        <div class="col-md-6 mb-3">
            <label for="apellidos" class="form-label">Apellidos<span>*</span></label>
            <input type="text" class="form-control" id="apellidos" name="apellidos" required pattern="[A-Za-z\s]+" title="Solo se permiten letras y espacios" value="<?php echo $usuario ? htmlspecialchars($usuario['ape_especialista']) : ''; ?>">
        </div>
    </div>
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="dni" class="form-label">DNI<span>*</span></label>
            <input type="text" class="form-control" id="dni" name="dni" required maxlength="8" pattern="\d{8}" title="El DNI debe tener exactamente 8 dígitos" value="<?php echo $usuario ? htmlspecialchars($usuario['dni_especialista']) : ''; ?>">
        </div>
        <div class="col-md-6 mb-3">
            <label for="telefono" class="form-label">Teléfono</label>
            <input type="tel" class="form-control" id="telefono" name="telefono"  maxlength="9" pattern="[0-9]{9}" title="El teléfono debe tener exactamente 9 dígitos" value="<?php echo $usuario ? htmlspecialchars($usuario['telefono_especialista']) : ''; ?>">
        </div>
    </div>
    
       <div class="row">
     <div class="col-md-6 mb-3">
        <label for="correo" class="form-label">Correo Electrónico</label>
        <input type="email" class="form-control" id="correo" name="correo"  value="<?php echo $usuario ? htmlspecialchars($usuario['correo_especialista']) : ''; ?>">
    </div>
     <div class="col-md-6 mb-3">
            <label for="areaUsuario" class="form-label">Área<span>*</span></label>
            <select class="form-select" id="areaUsuario" name="idArea" required onchange="cargarSubareas()">
                <option value="" disabled <?php echo !$usuario ? 'selected' : ''; ?>>Seleccione una área</option>
                <?php foreach ($areas as $area) { ?>
                    <option value="<?php echo htmlspecialchars($area['idarea']) ?>" <?php if ($usuario && $usuario['idarea'] == $area['idarea']) echo 'selected'; ?>><?php echo htmlspecialchars($area['area']) ?></option>
                <?php } ?>
            </select>
        </div>
    </div>
    
<div class="row" id="subareaContainer" style="<?php echo $usuario ? 'display:block;' : 'display:none;'; ?>">
         <div class="col-md-6 mb-3">
              <label for="especialidadUsuario">Especialidad<span>*</span></label>
    <select class="form-select" id="especialidadUsuario" name="idSubArea" required>
        <option value="">Seleccione una subárea</option>
    </select>
        </div>
    </div>
    

    
    
    
    
    <div class="row">
        <div class="col-md-6 mb-3">
        
            <input type="hidden" class="form-control" id="usuario" name="especialista" required value="<?php echo $usuario ? htmlspecialchars($usuario['usuario']) : ''; ?>">
        </div>
        <div class="col-md-6 mb-3">
      
            <div class="input-group">
                <input type="hidden" class="form-control" name="password" id="password" <?php echo $usuario ? '' : 'required'; ?> maxlength="8" value="">
             
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
   
</form>
<script>
    const subareasPorArea = <?php echo json_encode($subareasAgrupadas); ?>;
    const subareaActual = <?php echo $usuario ? (int)$usuario['idsubarea'] : 'null'; ?>;
    const areaActual = <?php echo $usuario ? (int)$usuario['idarea'] : 'null'; ?>;

    function cargarSubareas() {
        const areaId = document.getElementById('areaUsuario').value;
        const subareaSelect = document.getElementById('especialidadUsuario');
        const subareaContainer = document.getElementById('subareaContainer');

        subareaSelect.innerHTML = '<option value="">Seleccione una subárea</option>';

        if (subareasPorArea[areaId]) {
            subareasPorArea[areaId].forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub.idsubarea;
                opt.textContent = sub.subarea;
                if (sub.idsubarea == subareaActual && areaId == areaActual) {
                    opt.selected = true;
                }
                subareaSelect.appendChild(opt);
            });
            subareaContainer.style.display = 'block';
        } else {
            subareaContainer.style.display = 'none';
        }
    }

    // Ejecutar al cargar la página si ya hay usuario
    window.addEventListener('DOMContentLoaded', () => {
        if (areaActual) {
            cargarSubareas();
        }
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
