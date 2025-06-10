<?php
require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';
$especialistaModel = new EspecialistaModel();
$areas = $especialistaModel->obtenerAreas();


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
           <label for="sexo" class="form-label">Sexo<span>*</span></label>
            <select class="form-select" id="sexoUsuario" name="sexo" required>
                  <option value="" disabled>Seleccione</option>
                <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                </select>
        </div>
        
        
        
      
    </div>
    
       <div class="row">
             <div class="col-md-6 mb-3">
            <label for="telefono" class="form-label">Teléfono</label>
            <input type="tel" class="form-control" id="telefono" name="telefono"  maxlength="9" pattern="[0-9]{9}" title="El teléfono debe tener exactamente 9 dígitos" value="<?php echo $usuario ? htmlspecialchars($usuario['telefono_especialista']) : ''; ?>">
        </div>
        
     <div class="col-md-6 mb-3">
        <label for="correo" class="form-label">Correo Electrónico</label>
        <input type="email" class="form-control" id="correo" name="correo"  value="<?php echo $usuario ? htmlspecialchars($usuario['correo_especialista']) : ''; ?>">
    </div> </div>
    
    
   
<div class="row">
  <div class="col-md-6 mb-3">
    <label>Servicios<span>*</span></label><br>
    <?php foreach ($servicios as $servicio) { ?>
      <div class="form-check">
        <input class="form-check-input" type="checkbox"
               name="idServicio[]" 
               id="servicio_<?php echo $servicio['idservicio']; ?>" 
               value="<?php echo htmlspecialchars($servicio['idservicio']); ?>"
               onchange="toggleAreaRow(this)">
        <label class="form-check-label" for="servicio_<?php echo $servicio['idservicio']; ?>">
          <?php echo htmlspecialchars($servicio['servicio']); ?>
        </label>
      </div>
    <?php } ?>
  </div>

  <div class="col-md-6 mb-3" id="areasContainer">
    <!-- Aquí se cargarán dinámicamente los selects de áreas + subáreas por servicio -->
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
const areas = <?php echo json_encode($areas); ?>;

function toggleAreaRow(checkbox) {
  const container = document.getElementById('areasContainer');
  const servicioId = checkbox.value;
  const existingDiv = document.getElementById('areaRow_' + servicioId);

  if (checkbox.checked) {
    if (!existingDiv) {
      const divRow = document.createElement('div');
      divRow.className = 'mb-4 border p-3 rounded';
      divRow.id = 'areaRow_' + servicioId;

      // Etiqueta servicio
      const labelServicio = document.createElement('label');
      labelServicio.className = 'form-label fw-bold';
      labelServicio.textContent = `Área y Especialidades para servicio: ${checkbox.nextElementSibling.textContent}`;
      divRow.appendChild(labelServicio);

      // input hidden para idServicio[]
      const inputServicio = document.createElement('input');
      inputServicio.type = 'hidden';
      inputServicio.name = 'idServicio[]';
      inputServicio.value = servicioId;
      divRow.appendChild(inputServicio);

      // Select área con name idArea[servicioId]
      const selectArea = document.createElement('select');
      selectArea.className = 'form-select mt-2';
      selectArea.name = `idArea[${servicioId}]`; // 💡 CLAVE
      selectArea.required = true;
      selectArea.onchange = function () { cargarSubareas(this, servicioId); };

      const optionDefault = document.createElement('option');
      optionDefault.value = '';
      optionDefault.textContent = 'Seleccione una área';
      optionDefault.disabled = true;
      optionDefault.selected = true;
      selectArea.appendChild(optionDefault);

      areas.forEach(area => {
        const opt = document.createElement('option');
        opt.value = area.idarea;
        opt.textContent = area.area;
        selectArea.appendChild(opt);
      });

      divRow.appendChild(selectArea);

      // Contenedor subáreas
      const subareaContainer = document.createElement('div');
      subareaContainer.id = 'subareasContainer_' + servicioId;
      subareaContainer.className = 'mt-3';
      divRow.appendChild(subareaContainer);

      container.appendChild(divRow);
    }
  } else {
    if (existingDiv) {
      container.removeChild(existingDiv);
    }
  }
}

function cargarSubareas(select, servicioId) {
  const areaId = select.value;
  const subareaCont = document.getElementById('subareasContainer_' + servicioId);
  subareaCont.innerHTML = '';

  // Para servicio 2 no mostrar subáreas
  if (parseInt(servicioId) === 2) {
    return;
  }

  if (subareasPorArea[areaId]) {
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = 'Especialidades (puede seleccionar más de una):';
    subareaCont.appendChild(label);

    subareasPorArea[areaId].forEach(sub => {
      const divCheck = document.createElement('div');
      divCheck.className = 'form-check';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'form-check-input';
      checkbox.name = `idSubArea[${servicioId}][]`; // 💡 CLAVE
      checkbox.id = `subarea_${servicioId}_${sub.idsubarea}`;
      checkbox.value = sub.idsubarea;

      const labelCheck = document.createElement('label');
      labelCheck.className = 'form-check-label';
      labelCheck.htmlFor = checkbox.id;
      labelCheck.textContent = sub.subarea;

      divCheck.appendChild(checkbox);
      divCheck.appendChild(labelCheck);

      subareaCont.appendChild(divCheck);
    });
  }
}
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
