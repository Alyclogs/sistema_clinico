<span class="title-span">Registra su horario disponible</span>

<form id="formHorario" class="mt-3">

  <div class="mt-3">
  <?php
    $dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    foreach ($dias as $dia) {
        echo '<div class="form-check form-check-inline">';
       
        echo '<label class="form-check-label" for="dia_' . $dia . '">' . ucfirst($dia) . '</label>';
        
         echo '<input class="form-check-input radiodias" type="radio" id="dia_' . $dia . '" name="diaSeleccionado" value="' . $dia . '">';
         
        echo '</div>';
    }
  ?>
</div>


  <!-- Contenedores para rangos de horas, inicialmente ocultos -->
  <?php
    foreach ($dias as $dia) {
      echo '
        <div class="horas-dia mt-3" id="horas_' . $dia . '" style="display:none; border:1px solid #ddd; padding:10px; border-radius:5px;">
          <h6>Horario para ' . ucfirst($dia) . '</h6>
          <div class="rangos-container">
            <!-- Aquí se añadirán rangos dinámicamente -->
          </div>
          <button type="button" class="btn btn-sm btn-primary mt-2 btn-agregar-rango" data-dia="' . $dia . '">Agregar rango</button>
        </div>
      ';
    }
  ?>

</form>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
  $(function(){
    // Mostrar sólo el div del día seleccionado
    $('.radiodias').change(function() {
      const diaSeleccionado = $(this).val();
      $('.horas-dia').hide();
      $('#horas_' + diaSeleccionado).show();
    });

    // Función para crear un nuevo rango de horarios
    function crearRango(dia) {
      return `
        <div class="row g-2 align-items-center mb-2 rango-horario">
          <div class="col-auto">
            <label class="form-label mb-0">Inicio</label>
            <input type="time" name="inicio_${dia}[]" class="form-control" required>
          </div>
          <div class="col-auto">
            <label class="form-label mb-0">Fin</label>
            <input type="time" name="fin_${dia}[]" class="form-control" required>
          </div>
          <div class="col-auto">
            <button type="button" class="btn btn-danger btn-eliminar-rango" title="Eliminar rango">&times;</button>
          </div>
        </div>
      `;
    }

    // Manejar click en "Agregar rango"
    $('.btn-agregar-rango').click(function(){
      const dia = $(this).data('dia');
      const container = $('#horas_' + dia + ' .rangos-container');
      container.append(crearRango(dia));
    });

    // Manejar eliminación de rango (delegado)
    $(document).on('click', '.btn-eliminar-rango', function(){
      $(this).closest('.rango-horario').remove();
    });
  });
</script>
