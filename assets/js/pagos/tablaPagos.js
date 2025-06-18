const baseurl = "http://localhost/SistemaClinico/";

const modalidades = window.modalidades || [];
const opcionesAgrupadas = window.opcionesAgrupadas || {}

$(document).ready(function () {

  const urlParams = new URLSearchParams(window.location.search);
  const filtroURL = urlParams.get('filtro');

  // Obtener el estado seleccionado (por defecto será 3)
  const idEstado = $('#filtroEstado').val();

  if (filtroURL) {
    $('#inputBuscarCita').val(filtroURL);
    buscarCitas(filtroURL, idEstado);
  } else {
    buscarCitas('', idEstado); // Sin filtro de texto, pero con estado por defecto
  }

  // Evento cuando cambia el input de texto
  $('#inputBuscarCita').on('input', function () {
    const filtro = $(this).val().trim();
    const estadoSeleccionado = $('#filtroEstado').val();

    if (filtro.length > 2) {
      buscarCitas(filtro, estadoSeleccionado);
    } else if (filtro.length === 0) {
      buscarCitas('', estadoSeleccionado); // recarga con estado actual
    }
  });

  // Evento cuando cambia el select de estado
  $('#filtroEstado').on('change', function () {
    const filtro = $('#inputBuscarCita').val().trim();
    const estadoSeleccionado = $(this).val();
    buscarCitas(filtro, estadoSeleccionado);
  });
});


function buscarCitas(filtro = '', idestado = 3) {
  const estadoParam = idestado !== 'historial' ? `&idestado=${encodeURIComponent(idestado)}` : '';
  function formatearFechaSimple(fechaISO) {
    const dias = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    const fecha = new Date(fechaISO);
    const diaSemana = dias[fecha.getDay()];
    const diaMes = fecha.getDate();

    return `${diaSemana} ${diaMes}`;
  }

  function formatoHora12h(hora24) {
    const [horaStr, min, seg] = hora24.split(':');
    let hora = parseInt(horaStr, 10);
    const ampm = hora >= 12 ? 'pm' : 'am';
    hora = hora % 12;
    if (hora === 0) hora = 12;
    return `${hora}:${min} ${ampm}`;
  }

  function obtenerFechaHoraPeruFormateada() {
    const fecha = new Date().toLocaleString('en-US', {
      timeZone: 'America/Lima'
    });

    const date = new Date(fecha);

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // Enero = 0
    const anio = date.getFullYear();

    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const segundos = String(date.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  }

  function numeroALetrasSoles(num) {
    const UNIDADES = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const DECENAS = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    function convertirGrupo(n) {
      let output = '';
      if (n === '100') return 'CIEN';
      if (n[0] !== '0') output += CENTENAS[parseInt(n[0])] + ' ';
      const d = parseInt(n.substr(1, 1));
      const u = parseInt(n.substr(2, 1));
      if (d === 1) {
        const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
        output += especiales[u];
      } else {
        output += DECENAS[d];
        if (d > 1 && u > 0) output += ' Y ';
        if (d !== 1) output += UNIDADES[u];
      }
      return output.trim();
    }

    function secciones(num) {
      let partes = num.toFixed(2).split('.');
      let entero = partes[0].padStart(6, '0');
      let miles = convertirGrupo(entero.substr(0, 3));
      let cientos = convertirGrupo(entero.substr(3, 3));
      let literal = '';

      if (parseInt(entero) === 0) {
        literal = 'CERO';
      } else {
        if (parseInt(entero.substr(0, 3)) > 0) {
          literal += miles + ' MIL ';
        }
        if (parseInt(entero.substr(3, 3)) > 0) {
          literal += cientos;
        }
      }

      const centimos = partes[1];
      return `SON: ${literal.trim()} Y ${centimos}/100 SOLES`;
    }
    return secciones(num);
  }

  $.get(baseurl + "controllers/Pagos/PagoController.php?action=buscar&filtro=" + encodeURIComponent(filtro) + estadoParam,
    function (data) {


      let html = '';
      let total = 0;

      if (data.length > 0) {
        // Tomamos los datos del primer resultado para mostrar al paciente
        const paciente = data[0];
        const fechaStrEdad = paciente.paciente_fecha; // e.g. "2009-03-02"

        const fechaEdad = new Date(fechaStrEdad);

        // Formatear a dd/mm/yyyy
        const diaEdad = String(fechaEdad.getDate()).padStart(2, '0');
        const mesEdad = String(fechaEdad.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
        const anioEdad = fechaEdad.getFullYear();

        const fechaFormateadaEdad = `${diaEdad}/${mesEdad}/${anioEdad}`;

        // Calcular edad
        const hoyEdad = new Date();
        let edadEdad = hoyEdad.getFullYear() - fechaEdad.getFullYear();
        const m = hoyEdad.getMonth() - fechaEdad.getMonth();
        if (m < 0 || (m === 0 && hoyEdad.getDate() < fechaEdad.getDate())) {
          edadEdad--;
        }

        // Finalmente
        const resultadoEdad = `${fechaFormateadaEdad} - ${edadEdad} años`;

        html += `
            
            <div class="flex-info-paciente">
            <div class="info-paciente">
                
                
                <div class="foto-div">
                
                <div class="foto-paciente">
                <img src="${paciente.paciente_foto}">
                </div>
                
                </div>
                
                <div class="nombre-paciente"> 
                <span>
                ${paciente.paciente_nombres} ${paciente.paciente_apellidos}
                </span>
                </div>
                
                  
                <div class="edad-paciente">
                  <span>
                 ${resultadoEdad}   </span>
                </div>
                
                <div class="dni-paciente">
                  <span>
                DNI: ${paciente.paciente_dni}   </span>
                </div>
                
                
             
            </div>
            
              <div class="container-medios-pago">
                  <div class="encabezado-medios-pagos">
                    <span>Medios de Pago</span>
                  </div>

                  <div class="formulario-pago">

                    <form class="form-pago" id="formPago">
                     <input type="hidden" name="idUsuario" id="idUsuario"  value="${window.idUsuario}">

                      <input type="hidden" id="ids-citas" name="ids_citas">
                      <input type="hidden" id="costos-citas" name="costos_citas">
                      <input type="hidden" id="codigo-voucher" name="codigo-voucher" value="${window.codigovoucherpago}">

                      <input type="hidden" id="total-cita" name="costo_total">

                      <input type="hidden" id="id-paciente" name="id_paciente">
                      <input type="hidden" id="nombres-apoderado">
                      <input type="hidden" id="dni-apoderado">
                      <input type="hidden" id="detalle-subareas" name="detalle-subareas">

                      <!-- Fila 1 -->

                      <div class="form-container-two">
                        <div class="form-row">
                        
                        <div class="fondo-blanco-form">
                        
                        <div class="form-group">
  <label for="modalidad-pago">Modalidad de Pago</label>
  <div class="campo-flex-end">
    <select id="modalidad-pago" name="modalidad-pago" class="form-select" required>
     
    </select>
  </div>
</div>

                        <div class="form-group">
  <label for="opcion-pago">Opción de Pago</label>
  <div class="campo-flex-end">
    <select id="opcion-pago" name="opcion-pago" class="form-select" required>

    </select>
  </div>
</div>

                          <div class="form-group">
                            <label for="codigo">Código de Operación</label>
                            <div class="campo-flex-end">
                              <input class="form-control" type="text" id="codigo" name="codigo" required>
                            </div>
                          </div>
                          
                          
                          </div>
                        </div>

                        <!-- Fila 2 -->
                        <div class="form-row">
                      
                          
                          
   <div class="fondo-blanco-form">
                          <div class="form-group">
                            <label for="monto">Monto a Pagar</label>
                            <div class="campo-flex-end">
                              <input class=" input-montoTotal form-control"
                                type="number"
                                id="importexpagar"
                                name="importexpagar"
                                min="0"
                                step="0.01"
                                required>
                            </div>
                          </div>      </div>
                              <div class="fondo-blanco-form">
                          <div class="form-group">
                            <label for="monto">Vuelto</label>
                            <div class="campo-flex-end">
                              <input class="input-montoTotal form-control"
                                type="text"
                                id="vuelto"
                                name="vuelto"
                                min="0"
                                step="0.01"
                                readonly>
                            </div>
                          </div>
                        </div>
                          </div>


   <div class="form-row">
  
                        
                          <div class="fondo-blanco-form">
                        
                          <div class="form-group form-montoTotal">
                            <label for="monto">Monto Total</label>
                            <div class="campo-flex-end">
                              <input class="form-control input-montoTotal" type="text" id="monto" name="monto" readonly>
                            </div>
                          </div>
                          
                            </div>
                            
                        
                        <div class="btnGuardarDiv">
                          <button type="button" class="btn btn-primary btn-guardar" id="btnGuardar">PAGAR</button>   </div>
                          </div>
                            
                      </div>
                    
                    </form>
                  </div>
                </div>
            
            
            </div>
            
            
            `




          ;
      }


      html += `
  <div class="container-tabla-pagos">
    <div class="tabla-pagos">
      <!-- Cabecera -->
      <div class="tabla-cabecera">
        <div class="celda"><span>Cita</span></div>
        <div class="celda"><span>Especialista</span></div>
        <div class="celda"><span>Terapia</span></div>
        <div class="celda"><span>Fecha</span></div>
        <div class="celda"><span>Hora</span></div>
        <div class="celda"><span>Estado</span></div>
        <div class="celda"><span>Total</span></div>
        <div class="celda"></div>
      </div>

      <!-- Cuerpo -->
      <div class="tabla-cuerpo">
`;

      if (data.length === 0) {
        html += `
        <div class="fila">
          <div class="celda empty" style="grid-column: span 8; text-align: center;">
            No se encontraron resultados.
          </div>
        </div>
  `;
      } else {
        data.forEach(function (cita) {
          // Formatear número de orden con dos dígitos
          let numero = String(cita.orden).padStart(2, '0');

          // Determinar clase e ícono SVG según estado de pago
          let estadoClase = cita.estado_pago === 'Cancelado'
            ? 'estado-cancelado'
            : 'estado-pendiente';

          let svgEstado = cita.estado_pago === 'Cancelado'
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.99 13.99">
           <defs>
             <style>
               .cls-checkpago { fill: #fff; }
               .cls-checkpago, .cls-2checkpago { fill-rule: evenodd; }
               .cls-2checkpago { fill: #48b02c; }
             </style>
           </defs>
           <path class="cls-2checkpago" d="M7,0c3.86,0,7,3.13,7,7s-3.13,7-7,7S0,10.86,0,7,3.13,0,7,0"/>
           <path class="cls-checkpago" d="M4.78,10.41l-2.54-2.72c-.28-.3-.36-.74-.16-1.09,.33-.59,1.09-.65,1.51-.2l1.97,2.11,3.12-2.92s.06-.05,.09-.07l1.45-1.36c.3-.28,.74-.36,1.09-.16,.59,.33,.65,1.09,.2,1.51l-4.49,4.19h0s-1.55,1.45-1.55,1.45l-.69-.74Z"/>
         </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.02 14.02">
           <defs>
             <style>
               .cls-pendiente { fill: #c42d35; }
             </style>
           </defs>
           <path class="cls-pendiente" d="M10.89,1.17c-.9-.63-1.92-1-3.02-1.11-.06-.02-.12-.03-.18-.02-.03,0-.06,0-.09-.01-.4-.04-.79-.04-1.19,0-.08,0-.17,0-.25,.02C3.39,.48,1.48,1.99,.44,4.59c-.22,.54-.36,1.1-.37,1.69-.09,.49-.09,.98,0,1.48,0,0,0,.02,0,.02,0,.08,.01,.15,.02,.23,0,.03,.01,.07,.02,.1,0,.09-.01,.18,.05,.25-.03,.07,0,.14,.02,.2,.85,3.78,4.62,6.15,8.39,5.3,2.76-.63,4.9-2.81,5.34-5.62,.47-2.95-.57-5.33-3.02-7.06Zm-1.18,8.8c-.22,.1-.43,.05-.64-.16-.63-.63-1.27-1.26-1.9-1.9-.12-.12-.18-.13-.3,0-.64,.65-1.28,1.29-1.93,1.93-.2,.2-.43,.23-.65,.12-.21-.11-.32-.33-.28-.58,.02-.14,.11-.23,.20-.33,.63-.63,1.26-1.27,1.9-1.89,.13-.12,.12-.18,0-.30-.65-.64-1.30-1.29-1.95-1.95-.19-.19-.21-.46-.08-.67,.14-.21,.41-.30,.65-.21,.11,.04,.18,.12,.25,.19,.62,.62,1.24,1.23,1.85,1.85,.13,.13,.20,.16,.35,0,.62-.64,1.26-1.27,1.89-1.90,.16-.16,.35-.23,.56-.17,.20,.06,.32,.20,.37,.40,.01,.04,0,.08,0,.09,0,.22-.11,.35-.23,.48-.62,.62-1.24,1.25-1.87,1.86-.13,.13-.13,.19,0,.32,.64,.63,1.28,1.27,1.92,1.91,.30,.30,.23,.72-.13,.89Z"/>
         </svg>`;

          html += `
        <div class="fila" data-idcita="${cita.idcita}">
          <div class="celda">${numero}</div>
          <div class="celda">${cita.especialista_nombres} ${cita.especialista_apellidos}</div>
          <div class="celda">
            ${cita.servicio_nombre === "EVALUACION"
              ? "EVALUACION " + cita.area_nombre
              : cita.servicio_nombre === "CONSULTA"
                ? "TERAPIA " + (cita.subarea_nombre ?? cita.area_nombre)
                : ""}
          </div>
          <div class="celda">${formatearFechaSimple(cita.fecha)}</div>
          <div class="celda">
            ${formatoHora12h(cita.hora_inicio)} - ${formatoHora12h(cita.hora_fin)}
          </div>
          <div class="celda ${estadoClase}">
            ${svgEstado}${cita.estado_pago}
          </div>
          <div class="celda">S/.${cita.costo}</div>
          <div class="celda">
           <div class="celda">
  <div class="form-check">
    <input
      class="form-check-input circulo-check"
      type="checkbox"
      id="checkCita${cita.idcita}"
      data-costo="${cita.costo}"
      data-idcita="${cita.idcita}"
      data-subarea="${cita.servicio_nombre === 'EVALUACION'
              ? 'EVALUACION ' + cita.area_nombre
              : cita.servicio_nombre === 'CONSULTA'
                ? 'TERAPIA ' + (cita.subarea_nombre ?? cita.area_nombre)
                : ''}"
      data-nombresapoderado="${cita.apoderado_nombres} ${cita.apoderado_apellidos}"
      data-dniapoderado="${cita.apoderado_dni}"
      data-idpaciente="${cita.idpaciente}"
      ${cita.estado_pago === 'Cancelado' ? 'disabled' : ''}
    />
    <label class="form-check-label" for="checkCita${cita.idcita}"></label>
  </div>
</div>

          </div>
        </div>
    `;
        });
      }

      // Cierre de tabla-cuerpo
      html += `
      </div>  <!-- end .tabla-cuerpo -->
`;

      // Sección de footer con total
      html += `
      <div class="tabla-footer">
        <div class="fila fila-total">
          <div class="celda total-label" style="grid-column: span 2;">
            <strong>TOTAL:</strong>
          </div>
          <div class="celda total-valor" style="grid-column: span 6; text-align: right;">
            <strong id="total-seleccionado">S/. 0.00</strong>
          </div>
        </div>
      </div>
`;

      // Cierre de contenedores principales
      html += `
    </div> <!-- end .tabla-pagos -->
  </div> <!-- end .container-tabla-pagos -->
`;

      // Insertar en el DOM
      $('#pagosTabla').html(html);












      const $selMod = $('#modalidad-pago');
      const $selOpc = $('#opcion-pago');
      const $inpCod = $('#codigo');

      function cargarModalidades() {
        $selMod.empty().append('<option value="">Seleccione</option>');
        modalidades.forEach(mod => {
          $selMod.append(`<option value="${mod.idmodalidad}">${mod.modalidad}</option>`);
        });
      }

      function actualizarOpciones() {
        const idMod = $selMod.val();
        $selOpc.empty();

        const lista = opcionesAgrupadas[idMod] || [];

        if (idMod !== '4' || lista.length > 1) {
          $selOpc.append('<option value="">Seleccione</option>');
        }

        lista.forEach(op => {
          $selOpc.append(`<option value="${op.idopcion}">${op.opcion}</option>`);
        });

        if (idMod === '4') {
          $inpCod.val('No se necesita código').prop('readonly', true);
        } else {
          $inpCod.val('').prop('readonly', false);
        }
      }

      cargarModalidades();
      $selMod.on('change', actualizarOpciones);

      if ($selMod.val()) actualizarOpciones();
      const montoInput = document.getElementById('monto');
      const importexPagarInput = document.getElementById('importexpagar');
      const vueltoInput = document.getElementById('vuelto');

      importexPagarInput.addEventListener('input', function () {
        const montoTexto = montoInput.value.replace(/[^\d.]/g, ''); // <-- limpieza
        const monto = parseFloat(montoTexto) || 0;
        const pagado = parseFloat(importexPagarInput.value) || 0;

        const vuelto = pagado - monto;

        vueltoInput.value = vuelto >= 0 ? 'S/. ' + vuelto.toFixed(2) : 'S/. 0.00';
      });

      let totalSeleccionado = 0;

      $('#pagosTabla').on('click', '.circulo-check', function () {
        const $this = $(this);
        const costo = parseFloat($this.data('costo'));

        // Alterna clase 'activo'
        $this.toggleClass('activo');

        // Suma o resta del total dependiendo del estado
        if ($this.hasClass('activo')) {
          totalSeleccionado += costo;
        } else {
          totalSeleccionado -= costo;
        }

        // Actualiza el total mostrado
        $('#total-seleccionado').text(`S/. ${totalSeleccionado.toFixed(2)}`);
      });

      $('#pagosTabla').on('change', '.circulo-check', function () {
        // Recolecta todos los checboxes marcados:
        const $checks = $('.circulo-check:checked');
        const subareas = {};
        const citasSeleccionadas = [];
        const costosSeleccionados = [];
        let idPaciente = null;
        let nombresApoderado = null;
        let dniApoderado = null;

        $checks.each(function () {
          const $this = $(this);
          const citaID = $this.data('idcita');
          const costo = parseFloat($this.data('costo'));
          const pacienteID = $this.data('idpaciente');
          const nombreApod = $this.data('nombresapoderado');
          const dniApod = $this.data('dniapoderado');
          const subarea = $this.data('subarea');

          if (!idPaciente) idPaciente = pacienteID;
          if (!nombresApoderado) nombresApoderado = nombreApod;
          if (!dniApoderado) dniApoderado = dniApod;

          citasSeleccionadas.push(citaID);
          costosSeleccionados.push(costo);

          if (!subareas[subarea]) {
            subareas[subarea] = { cantidad: 0, precioUnitario: costo, total: 0 };
          }
          subareas[subarea].cantidad++;
          subareas[subarea].total += costo;
        });

        if ($checks.length > 0) {
          $('#ids-citas').val(citasSeleccionadas.join(','));
          $('#costos-citas').val(costosSeleccionados.join(','));
          $('#id-paciente').val(idPaciente);
          $('#nombres-apoderado').val(nombresApoderado);
          $('#dni-apoderado').val(dniApoderado);

          const detalleSubareas = Object.entries(subareas)
            .map(([sub, d]) => `${sub}:${d.cantidad}:${d.precioUnitario.toFixed(2)}:${d.total.toFixed(2)}`)
            .join('|');
          $('#detalle-subareas').val(detalleSubareas);

          const total = Object.values(subareas).reduce((acc, d) => acc + d.total, 0);
          $('#monto').val('S/ ' + total.toFixed(2));
        } else {
          // Si quieres limpiar campos cuando no hay selección:
          $('#ids-citas, #costos-citas, #id-paciente, #nombres-apoderado, #dni-apoderado, #detalle-subareas').val('');
          $('#monto').val('S/ 0.00');
        }
      });


      $(document).on('click', '#btnGuardar', function () {
        const formPago = $('#formPago');
        if (formPago[0].checkValidity()) {
          const formData = formPago.serialize();
          let url = baseurl + 'controllers/Pagos/PagoController.php?action=create';

          $.ajax({
            type: 'POST',
            url: url,
            data: formData,
            dataType: 'json',
            success: function (response) {
              var mensaje = document.getElementById('mensaje');
              mensaje.textContent = response.message;
              mensaje.className = 'my-3 ' + (response.success ? 'alert alert-success' : 'alert alert-danger');
              mensaje.hidden = false;

              setTimeout(function () {
                mensaje.hidden = true;

                if (response.success) {
                  const nombresApoderado = $('#nombres-apoderado').val().toUpperCase();
                  $('#nombre-papa').text('NOMBRE: ' + nombresApoderado);

                  const dniApoderado = $('#dni-apoderado').val();
                  $('#dni-papa').text('DNI: ' + dniApoderado);

                  const totalCita = parseFloat($('#importexpagar').val());
                  const montoTexto = $('#monto').val().replace(/[^\d.]/g, '');
                  const montoCita = parseFloat(montoTexto) || 0;
                  const totalFormateado = totalCita.toFixed(2);
                  const totalFormateado2 = montoCita.toFixed(2);

                  $('#total-sub-total').text(totalFormateado2);
                  $('#total-venta').text(totalFormateado);

                  const totalEnLetras = numeroALetrasSoles(montoCita);
                  $('#oracion-precio').text(totalEnLetras);

                  const fechaHoraPeru = obtenerFechaHoraPeruFormateada();
                  $('#cajero-fecha').text('FECHA: ' + fechaHoraPeru);

                  const modalidadPago = $('#opcion-pago option:selected').text();

                  $('#modalidad-pago-cancelado').text('PAGO CON ' + modalidadPago);

                  const codigoTicket = window.codigovoucherpago;
                  $('#codigo-voucher-ticket').text(codigoTicket);

                  const vueltoTexto = $('#vuelto').val().trim().replace(/^S\/[.\s]?/, '');
                  const vueltoFormateado = parseFloat(vueltoTexto).toFixed(2);
                  $('#total-vuelto').text(vueltoFormateado);


                  const detalleSubareas = $('#detalle-subareas').val();
                  const resumenContainer = $('#resumen-impresion');
                  resumenContainer.empty();

                  if (detalleSubareas) {
                    const items = detalleSubareas.split('|');
                    items.forEach(item => {
                      const [subarea, cantidad, precioUnitario, totalSub] = item.split(':');
                      resumenContainer.append(`
                                        <div class="descripcion-producto">
                                            <div class="cantidad-producto">
                                                <div class="ancho-encabezado">
                                                    <div class="span-caja caja-cantidad">
                                                        <span>${parseFloat(cantidad).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div class="ancho-encabezado ancho-producto">
                                                    <div class="span-caja caja-producto">
                                                        <span>${subarea.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="precios-producto">
                                             <div class="ancho-encabezado">
                                                    <div class="span-caja span-caja-precio caja-precio">
                                                         <span></span>
                                                    </div>
                                                </div>
                                                 <div class="ancho-encabezado">
                                                    <div class="span-caja span-caja-precio caja-precio">
                                                         <span></span>
                                                    </div>
                                                </div>
                                                
                                                <div class="ancho-encabezado">
                                                    <div class="span-caja span-caja-precio caja-precio">
                                                         <span>${parseFloat(precioUnitario).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div class="ancho-encabezado">
                                                    <div class="span-caja span-caja-precio caja-total">
                                                        <span>${parseFloat(totalSub).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `);
                    });
                  }
                }
              }, 1000);
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
              console.error('Respuesta del servidor:', jqXHR.responseText);
            }
          });
        } else {
          formPago[0].reportValidity();
        }
      });
    }, 'json')
    .fail(function (xhr, status, error) {
      console.error("Error al buscar citas:", error);
      console.error("Detalles:", xhr.responseText);

    });










}
