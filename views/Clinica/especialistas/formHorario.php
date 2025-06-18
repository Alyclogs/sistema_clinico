<?php
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;


require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';
$especialistaModel = new EspecialistaModel();

// Traemos los periodos disponibles para generar los círculos
$periodos = $especialistaModel->obtenerPeriodosDisponibilidad($id);



?>

<form id="formHorario"  method="post" action="">
  <div class="row">
    <!-- COLUMNA IZQUIERDA -->
<!-- COLUMNA IZQUIERDA -->
<div class="col-6">

  <div class="background-gris">
      <span>Horario</span>
          <?php if (!empty($periodos)): ?>
          <div class="div-periodos">
            <?php foreach ($periodos as $index => $periodo): ?>
              <div class="periodos-div">
                <div class="circle-periodo" 
                     data-periodo-id="<?= $index + 1 ?>" 
                     data-idespecialista="<?= $id ?>"> <!-- ID del especialista -->
                  <?= $index + 1 ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>


  </div>

  <input type="hidden" name="idespecialista" value="<?= htmlspecialchars($id) ?>">

  <!-- Período -->
<div class="d-flex flex-column gap-2" id="periodContainer">
    <label for="fecha_inicio" class="form-label mb-0">Periodo<span>*</span></label>
    <div class="d-flex align-items-center">
        <input type="date" name="fecha_inicio" id="fecha_inicio" class="form-control" required style="width:auto;">
        <span class="ms-2 me-2 distancia-span">a</span>
        <input type="date" name="fecha_fin" id="fecha_fin" class="form-control" required style="width:auto;">
    </div>
</div>

<!-- Días -->
<div class="container-dias gap-2">
    <label class="form-label mb-0">Días<span>*</span></label>
    <div class="dias-circulares d-flex gap-2">
        <div class="dia" data-dia="lunes" title="Lunes">L</div>
        <div class="dia" data-dia="martes" title="Martes">M</div>
        <div class="dia" data-dia="miércoles" title="Miércoles">Mi</div>
        <div class="dia" data-dia="jueves" title="Jueves">J</div>
        <div class="dia" data-dia="viernes" title="Viernes">V</div>
        <div class="dia" data-dia="sábado" title="Sábado">S</div>
    </div>
    <div class="form-check form-check d-flex align-items-center" style="gap:5px">
        <input class="form-check-input" type="checkbox" id="aplicar_todos_dias">
        <label class="form-check-label" for="aplicar_todos_dias">Todos los días</label>
    </div>
</div>

      
  <!-- Refrigerio -->
  <div class="dias-refrigerio-container   d-flex align-items-center">
    <label class="form-label mb-0 me-3">Almuerzo<span>*</span></label>
    <div class="dias-circulares-refrigerio d-flex gap-2">
      <div class="dia-refrigerio" data-dia-refrigerio="lunes" title="Lunes">L</div>
      <div class="dia-refrigerio" data-dia-refrigerio="martes" title="Martes">M</div>
      <div class="dia-refrigerio" data-dia-refrigerio="miércoles" title="Miércoles">Mi</div>
      <div class="dia-refrigerio" data-dia-refrigerio="jueves" title="Jueves">J</div>
      <div class="dia-refrigerio" data-dia-refrigerio="viernes" title="Viernes">V</div>
      <div class="dia-refrigerio" data-dia-refrigerio="sábado" title="Sábado">S</div>
    </div>
    <div class="form-check form-check d-flex align-items-center "  style="gap:5px">
      <input class="form-check-input" type="checkbox" id="aplicar_todos_refrigerio">
      <label class="form-check-label" for="aplicar_todos_refrigerio">Todos los días</label>
    </div>
  </div>


 
</div>


    <!-- COLUMNA DERECHA -->
<div class="col-6">

  <?php
  $dias = ['lunes','martes','miércoles','jueves','viernes','sábado'];

  function generarTimeInput(string $name): void {
      echo '<input '
         . 'type="time" '
         . 'name="'. $name .'[]" '
         . 'class="form-control" '
         . 'style="width:110px;" '
         . 'step="1800">'
         . PHP_EOL;
  }
  ?>

  <!-- Horarios normales -->
  <div id="horas-dias" style="display:none;">
    <div class="flex-cabecera-dias">
      <span>Complete los horarios:</span>
      <div class="form-check form-check form-check d-flex align-items-center " style="gap:5px">
        <input class="form-check-input" type="checkbox" id="aplicar_todos_horario">
        <label class="form-check-label" for="aplicar_todos_horario">Aplicar para todos</label>
      </div>
    </div>
    <?php foreach($dias as $dia): ?>
      <div class="bloque-dia" id="bloque_<?= $dia ?>" style="display:none; margin-bottom:10px;">
        <div class="fila-horario" style="display:flex; align-items:center; gap:8px;">
          <label class="text-capitalize label-dias-horario" style="min-width:80px"><?= $dia ?>:</label>
          <?php generarTimeInput("inicio_{$dia}") ?>
          <span class="distancia-span">a</span>
          <?php generarTimeInput("fin_{$dia}") ?>
                <button class="rounded-circle table-button btn-eliminar-rango"  title="Eliminar">
<svg id="" data-name="Modo de aislamiento" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.87 7.85">
  <defs>
    <style>
      .cls-delete-rango {
        fill: #fff;
        stroke-width: 0px;
      }
    </style>
  </defs>
  <path class="cls-delete-rango" d="M6.38,1.96H.5c-.07,0-.13.03-.18.08-.05.05-.07.11-.07.18l.22,4.93c.02.39.34.7.74.7h4.46c.39,0,.72-.31.74-.7l.22-4.93c0-.07-.02-.13-.07-.18s-.11-.08-.18-.08h0ZM5.92,7.13c0,.13-.11.23-.24.23H1.21c-.13,0-.24-.1-.24-.23l-.21-4.67h5.37l-.21,4.67Z"/>
  <path class="cls-delete-rango" d="M2.15,6.39s0,0,.01,0c.14,0,.24-.12.23-.26l-.12-2.7c0-.14-.12-.24-.26-.23-.14,0-.24.12-.23.26l.12,2.7c0,.13.11.23.24.23h0Z"/>
  <path class="cls-delete-rango" d="M4.72,6.38s0,0,.01,0c.13,0,.24-.1.24-.23l.12-2.7c0-.14-.1-.25-.23-.26-.13,0-.25.1-.26.23l-.12,2.7c0,.14.1.25.23.26h0Z"/>
  <path class="cls-delete-rango" d="M6.62.98h-1.47v-.25c0-.41-.33-.74-.74-.74h-1.96c-.41,0-.74.33-.74.74v.25H.24c-.11,0-.2.07-.23.17-.05.17.07.32.23.32h6.38c.11,0,.2-.07.23-.17.05-.17-.07-.32-.23-.32ZM2.21.98v-.25c0-.14.11-.25.25-.25h1.96c.14,0,.25.11.25.25v.25h-2.45Z"/>
  <path class="cls-delete-rango" d="M3.68,6.13v-2.69c0-.13-.09-.24-.22-.25-.15-.02-.27.1-.27.24v2.7c0,.14.13.26.27.24.13-.01.22-.12.22-.25Z"/>
</svg>
</button>

        </div>
        <div class="contenedor-boton-agregar mb-4" style="margin-left:90px;">
          <button type="button" class="btn btn-sm btn-agregar-rango" data-dia="<?= $dia ?>">+ Agregar</button>
        </div>
      </div>
    <?php endforeach; ?>
  </div>

  <!-- Refrigerio normal -->
  <div id="refrigerio-dias" style="display:none;">
    <div class="flex-cabecera-dias">
      <span>Complete los horarios para el almuerzo:</span>
      <div class="form-check form-check form-check d-flex align-items-center " style="gap:5px">
        <input class="form-check-input" type="checkbox" id="aplicar_todos_horario_refrigerio">
        <label class="form-check-label" for="aplicar_todos_horario_refrigerio">Aplicar para todos</label>
      </div>
    </div>
    <?php foreach($dias as $dia): ?>
      <div class="fila-horario" id="horas_refrigerio_<?= $dia ?>" style="display:none; align-items:center; gap:8px; margin-bottom:10px">
        <label class="text-capitalize label-dias-horario" style="min-width:80px"><?= $dia ?></label>
        <?php generarTimeInput("inicio_refrigerio_{$dia}") ?>
        <span class="distancia-span">a</span>
        <?php generarTimeInput("fin_refrigerio_{$dia}") ?>
      </div>
    <?php endforeach; ?>
  </div>


</div>

  </div>
</form>
<script>
  // Referencias principales
  const containerDias                    = document.querySelector('.container-dias');
  const containerRefrigerio              = document.querySelector('.dias-refrigerio-container');
  const horasDias                        = document.getElementById('horas-dias');
  const refrigerioDias                   = document.getElementById('refrigerio-dias');
  const checkboxTodosLosDias             = document.getElementById('aplicar_todos_dias');
  const checkboxTodosRefrigerio          = document.getElementById('aplicar_todos_refrigerio');
  const checkboxAplicarTodosHorario      = document.getElementById('aplicar_todos_horario');
  const checkboxAplicarTodosHorarioRefr  = document.getElementById('aplicar_todos_horario_refrigerio');

  // 1. Manejo de días normales
  document.querySelectorAll('.dia').forEach(d => {
    d.addEventListener('click', event => {
      event.stopPropagation();
      d.classList.toggle('selected');
      const day = d.dataset.dia;
      const block = document.getElementById('bloque_' + day);
      block.style.display = d.classList.contains('selected') ? 'block' : 'none';

      const selCount = document.querySelectorAll('.dia.selected').length;
      if (selCount > 0) {
        horasDias.style.display = 'block';
        containerDias.classList.add('active');
        refrigerioDias.style.display = 'none';
        containerRefrigerio.classList.remove('active');
      } else {
        horasDias.style.display = 'none';
        containerDias.classList.remove('active');
      }

      // Sincronizar “Todos los días”
      checkboxTodosLosDias.checked = selCount === document.querySelectorAll('.dia').length;
    });
  });

  // 2. Manejo de días de refrigerio
  document.querySelectorAll('.dia-refrigerio').forEach(d => {
    d.addEventListener('click', event => {
      event.stopPropagation();
      d.classList.toggle('selected');
      const day = d.dataset.diaRefrigerio;
      const block = document.getElementById('horas_refrigerio_' + day);
      block.style.display = d.classList.contains('selected') ? 'flex' : 'none';

      const selRefrCount = document.querySelectorAll('.dia-refrigerio.selected').length;
      if (selRefrCount > 0) {
        refrigerioDias.style.display = 'block';
        containerRefrigerio.classList.add('active');
        horasDias.style.display = 'none';
        containerDias.classList.remove('active');
      } else {
        refrigerioDias.style.display = 'none';
        containerRefrigerio.classList.remove('active');
      }

      // Sincronizar “Todos los días de refrigerio”
      if (checkboxTodosRefrigerio) {
        checkboxTodosRefrigerio.checked = selRefrCount === document.querySelectorAll('.dia-refrigerio').length;
      }
    });
  });

  // 3. Toggle click en contenedores
  containerDias.addEventListener('click', () => {
    if (containerDias.classList.contains('active')) {
      document.querySelectorAll('.dia.selected').forEach(d => d.classList.remove('selected'));
      document.querySelectorAll('.bloque-dia').forEach(b => b.style.display = 'none');
      horasDias.style.display = 'none';
      containerDias.classList.remove('active');
    } else if (document.querySelectorAll('.dia.selected').length > 0) {
      horasDias.style.display = 'block';
      containerDias.classList.add('active');
      refrigerioDias.style.display = 'none';
      containerRefrigerio.classList.remove('active');
    }
  });

  containerRefrigerio.addEventListener('click', () => {
    if (containerRefrigerio.classList.contains('active')) {
      document.querySelectorAll('.dia-refrigerio.selected').forEach(d => d.classList.remove('selected'));
      document.querySelectorAll('[id^="horas_refrigerio_"]').forEach(b => b.style.display = 'none');
      refrigerioDias.style.display = 'none';
      containerRefrigerio.classList.remove('active');
    } else if (document.querySelectorAll('.dia-refrigerio.selected').length > 0) {
      refrigerioDias.style.display = 'block';
      containerRefrigerio.classList.add('active');
      horasDias.style.display = 'none';
      containerDias.classList.remove('active');
    }
  });

  // 4. Checkbox “Todos los días”
  checkboxTodosLosDias.addEventListener('change', () => {
    const allDias = document.querySelectorAll('.dia');
    allDias.forEach(d => {
      const sel = checkboxTodosLosDias.checked;
      d.classList.toggle('selected', sel);
      const block = document.getElementById('bloque_' + d.dataset.dia);
      if (block) block.style.display = sel ? 'block' : 'none';
    });
    horasDias.style.display       = checkboxTodosLosDias.checked ? 'block' : 'none';
    containerDias.classList.toggle('active', checkboxTodosLosDias.checked);
    refrigerioDias.style.display = 'none';
    containerRefrigerio.classList.remove('active');
  });

  // 5. Checkbox “Todos los días de refrigerio”
  if (checkboxTodosRefrigerio) {
    checkboxTodosRefrigerio.addEventListener('change', () => {
      const allRefrDias = document.querySelectorAll('.dia-refrigerio');
      allRefrDias.forEach(d => {
        const sel = checkboxTodosRefrigerio.checked;
        d.classList.toggle('selected', sel);
        const block = document.getElementById('horas_refrigerio_' + d.dataset.diaRefrigerio);
        if (block) block.style.display = sel ? 'flex' : 'none';
      });
      refrigerioDias.style.display    = checkboxTodosRefrigerio.checked ? 'block' : 'none';
      containerRefrigerio.classList.toggle('active', checkboxTodosRefrigerio.checked);
      horasDias.style.display         = 'none';
      containerDias.classList.remove('active');
    });
  }

  // 6. Checkbox “Aplicar todos los horarios”
  document.getElementById('aplicar_todos_horario').addEventListener('change', () => {
    if (!checkboxAplicarTodosHorario.checked) return;
    const bloques = document.querySelectorAll('.bloque-dia');
    let inicio, fin;
    for (const b of bloques) {
      if (b.style.display !== 'none') {
        inicio = b.querySelector('input[name^="inicio_"]').value;
        fin    = b.querySelector('input[name^="fin_"]').value;
        if (inicio && fin) break;
      }
    }
    if (!inicio || !fin) return;
    bloques.forEach(b => {
      if (b.style.display !== 'none') {
        const i = b.querySelector('input[name^="inicio_"]');
        const f = b.querySelector('input[name^="fin_"]');
        if (i && f) { i.value = inicio; f.value = fin; }
      }
    });
  });

  // 7. Checkbox “Aplicar para todos los horarios de refrigerio”
  if (checkboxAplicarTodosHorarioRefr) {
    checkboxAplicarTodosHorarioRefr.addEventListener('change', () => {
      if (!checkboxAplicarTodosHorarioRefr.checked) return;
      const bloquesRefr = document.querySelectorAll('[id^="horas_refrigerio_"]');
      let inicioRe, finRe;
      for (const b of bloquesRefr) {
        if (b.style.display !== 'none') {
          inicioRe = b.querySelector('input[name^="inicio_refrigerio_"]').value;
          finRe    = b.querySelector('input[name^="fin_refrigerio_"]').value;
          if (inicioRe && finRe) break;
        }
      }
      if (!inicioRe || !finRe) return;
      bloquesRefr.forEach(b => {
        if (b.style.display !== 'none') {
          const i = b.querySelector('input[name^="inicio_refrigerio_"]');
          const f = b.querySelector('input[name^="fin_refrigerio_"]');
          if (i && f) { i.value = inicioRe; f.value = finRe; }
        }
      });
    });
  }

  // 8. Botones “Agregar rango” (inalterado)
  document.querySelectorAll('.btn-agregar-rango').forEach(boton => {
    boton.addEventListener('click', () => {
      const dia = boton.dataset.dia;
      const bloque = document.getElementById('bloque_' + dia);
      const nuevaFila = document.createElement('div');
      nuevaFila.className = 'fila-horario';
      nuevaFila.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:5px;margin-left:90px;';
      nuevaFila.innerHTML = `
        <input type="time" name="inicio_${dia}[]" class="form-control" style="width:110px;" step="1800">
        <span class="distancia-span">a</span>
        <input type="time" name="fin_${dia}[]" class="form-control" style="width:110px;" step="1800">
         <button class="rounded-circle table-button btn-eliminar-rango" title="Eliminar">
          <!-- SVG ícono -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.87 7.85">
            <path class="cls-delete-rango" d="M6.38,1.96H.5c-.07,0-.13.03-.18.08-.05.05-.07.11-.07.18l.22,4.93c.02.39.34.7.74.7h4.46c.39,0,.72-.31.74-.7l.22-4.93c0-.07-.02-.13-.07-.18s-.11-.08-.18-.08h0ZM5.92,7.13c0,.13-.11.23-.24.23H1.21c-.13,0-.24-.1-.24-.23l-.21-4.67h5.37l-.21,4.67Z"/>
            <path class="cls-delete-rango" d="M2.15,6.39s0,0,.01,0c.14,0,.24-.12.23-.26l-.12-2.7c0-.14-.12-.24-.26-.23-.14,0-.24.12-.23.26l.12,2.7c0,.13.11.23.24.23h0Z"/>
            <path class="cls-delete-rango" d="M4.72,6.38s0,0,.01,0c.13,0,.24-.1.24-.23l.12-2.7c0-.14-.1-.25-.23-.26-.13,0-.25.1-.26.23l-.12,2.7c0,.14.1.25.23.26h0Z"/>
            <path class="cls-delete-rango" d="M6.62.98h-1.47v-.25c0-.41-.33-.74-.74-.74h-1.96c-.41,0-.74.33-.74.74v.25H.24c-.11,0-.2.07-.23.17-.05.17.07.32.23.32h6.38c.11,0,.2-.07.23-.17.05-.17-.07-.32-.23-.32ZM2.21.98v-.25c0-.14.11-.25.25-.25h1.96c.14,0,.25.11.25.25v.25h-2.45Z"/>
            <path class="cls-delete-rango" d="M3.68,6.13v-2.69c0-.13-.09-.24-.22-.25-.15-.02-.27.10-.27.24v2.70c0,.14.13.26.27.24.13-.01.22-.12.22-.25Z"/>
          </svg>
        </button>
      `;
      bloque.insertBefore(nuevaFila, boton.parentElement);
    });
  });

  // 9. Eliminar rango + deseleccionar día si queda vacío (inalterado)
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-eliminar-rango');
    if (!btn) return;
    const fila = btn.closest('.fila-horario');
    const bloque = fila.parentElement;
    fila.remove();
    if (!bloque.querySelector('.fila-horario')) {
      const day = bloque.id.replace('bloque_', '');
      document.querySelector(`.dia[data-dia="${day}"]`)?.classList.remove('selected');
      bloque.style.display = 'none';
      if (!document.querySelector('.dia.selected')) {
        horasDias.style.display = 'none';
        containerDias.classList.remove('active');
      }
      checkboxTodosLosDias.checked =
        document.querySelectorAll('.dia.selected').length === document.querySelectorAll('.dia').length;
    }
  });
</script>



