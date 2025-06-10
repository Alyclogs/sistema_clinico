<?php
require_once __DIR__ . '/../../../models/Users/UserModel.php';
require_once __DIR__ . '/../../../models/Pacientes/PacienteModel.php';

$userModel = new UsuarioModel();
$pacienteModel = new PacientesModel();
?>

<form id="formUsuario">
    <span class="title-span">Ingresar nuevo paciente</span>
    <div class="row mt-4">
        <div class="col-md-6 mb-3">
            <label for="nombres" class="form-label">Nombres<span>*</span></label>
            <input type="text" class="form-control" id="nombres" name="nombres" required pattern="[A-Za-z\s]+" title="Solo se permiten letras y espacios">
        </div>
        <div class="col-md-6 mb-3">
            <label for="apellidos" class="form-label">Apellidos<span>*</span></label>
            <input type="text" class="form-control" id="apellidos" name="apellidos" required pattern="[A-Za-z\s]+" title="Solo se permiten letras y espacios">
        </div>
    </div>
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="dni" class="form-label">DNI<span>*</span></label>
            <input type="text" class="form-control" id="dni" name="dni" required maxlength="8" pattern="\d{8}" title="El DNI debe tener exactamente 8 dígitos">
        </div>
        
         <div class="col-md-6 mb-3">
 
        <label for="sexo" class="form-label">Sexo<span>*</span></label>
               <select class="form-select" id="sexoUsuario" name="sexopaciente" required>
                  <option value="" disabled>Seleccione</option>
                <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                </select>
    </div>
    
    
    
      
    </div>
  <div class="row mb-4">
        <div class="col-md-6 mb-3">
            <label for="fechanac" class="form-label">Fecha de nacimiento<span>*</span></label>
            <input type="date" class="form-control" id="fechanac" name="fechanac" required>
        </div>
      </div>
    <span class="title-span mt-4">Datos de los padres</span>
    <div class="row mt-4">
        <div class="col-md-6 mb-3">
            <label for="nombrePadre" class="form-label">Nombres<span>*</span></label>
            <input type="text" class="form-control" id="nombrePadre" name="nombrePadre">
        </div>
        <div class="col-md-6 mb-3">
            <label for="apellidosPadre" class="form-label">Apellidos<span>*</span></label>
            <input type="text" class="form-control" id="apellidosPadre" name="apellidosPadre">
        </div>
    </div>
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="dniPadre" class="form-label">DNI<span>*</span></label>
            <input type="text" class="form-control" id="dniPadre" name="dniPadre" maxlength="8" pattern="\d{8}" title="El DNI debe tener exactamente 8 dígitos">
        </div>
        <div class="col-md-6 mb-3">
            <label for="telefonoPadre" class="form-label">Teléfono</label>
            <input type="tel" class="form-control" id="telefonoPadre" name="telefonoPadre"  maxlength="9" pattern="[0-9]{9}" title="El teléfono debe tener exactamente 9 dígitos">
        </div>
    </div>
    
     <div class="row">
        <div class="col-md-6 mb-3">
        <label for="correoPadre" class="form-label">Correo</label>
        <input type="email" class="form-control" id="correoPadre" name="correoPadre">
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
        <label for="parentezco" class="form-label">Parentezco</label>
        <input type="text" class="form-control" id="parentezco" name="parentezco">
    </div>
       </div>
    
    
    <input type="hidden" class="form-control" id="usuario" name="usuario">
    <input type="hidden" class="form-control" name="password" id="password" maxlength="8">
</form>

<script>
    function generarNombreUsuarioYPassword() {
        const nombres = document.getElementById('nombrePadre').value.trim();
        const apellidos = document.getElementById('apellidosPadre').value.trim();
        const dni = document.getElementById('dniPadre').value.trim();
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

    document.getElementById('nombrePadre').addEventListener('input', generarNombreUsuarioYPassword);
    document.getElementById('apellidosPadre').addEventListener('input', generarNombreUsuarioYPassword);
    document.getElementById('dniPadre').addEventListener('input', generarNombreUsuarioYPassword);
</script>