const baseurl = "http://localhost/SistemaClinico/";

$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const filtroURL = urlParams.get('filtro');

    if (filtroURL) {
        $('#inputBuscarCita').val(filtroURL);
        buscarCitas(filtroURL);
    }

    $('#inputBuscarCita').on('input', function () {
        const filtro = $(this).val().trim();
        if (filtro.length > 2) {
            buscarCitas(filtro);
        } else if (filtro.length === 0) {
            fetchUsers(); // si borr�� todo, recarga la tabla completa
        }
    });
});

function buscarCitas(filtro) {

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


    $.get(baseurl + "controllers/Pagos/PagoController.php?action=buscar&filtro=" + encodeURIComponent(filtro), function (data) {


        let html = '';
        let total = 0;

        if (data.length > 0) {
            // Tomamos los datos del primer resultado para mostrar al paciente
            const paciente = data[0];
            html += `
            <div class="info-paciente">
            
         
<svg id="PAGOS" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11.78 12.9">
  <defs>
    <style>
      .cls-1 {
        fill: #fff;
        fill-rule: evenodd;
      }
    </style>
  </defs>
  <path class="cls-1" d="M5.88,1.68c-1.09,0-1.97,.88-1.97,1.96s.88,1.96,1.97,1.96,1.97-.88,1.97-1.96-.88-1.96-1.97-1.96Zm-3.65,1.96C2.23,1.63,3.86,0,5.88,0s3.65,1.63,3.65,3.64-1.63,3.64-3.65,3.64-3.65-1.63-3.65-3.64ZM10.32,12.63c-2.29-2.49-6.57-2.4-8.87,.01-.32,.34-.85,.35-1.19,.03-.34-.32-.35-.85-.03-1.19,2.93-3.07,8.33-3.24,11.32,.01,.31,.34,.29,.87-.05,1.19s-.87,.29-1.19-.05Z"/>
</svg>
            
            
            
            
               <span> Paciente : ${paciente.paciente_dni} / ${paciente.paciente_nombres} ${paciente.paciente_apellidos}</span>
            </div>
        `;
        }

        html += `
    <div class="container-tabla-pagos">
        <table class="table table-pagos">
            <thead>
                <tr>
                    <th><span>Cita</span></th>
                     <th><span>Especialista</span></th>
                      <th><span>Terapia</span></th>
                   <th><span>Fecha</span></th>
                    <th><span>Hora</span></th>
                     <th><span>Estado</span></th>
                    <th><span>Total</span></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `;

        if (data.length === 0) {
            html += `
            <tr>
                <td colspan="7" style="text-align:center;">No se encontraron resultados.</td>
            </tr>
        `;
        } else {
            data.forEach(function (cita) {


                let estadoClase = '';
                let svgEstado = '';

                if (cita.estado_pago === 'Cancelado') {
                    estadoClase = 'estado-cancelado';
                    svgEstado = `
    
<svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.99 13.99">
  <defs>
    <style>
      .cls-checkpago {
        fill: #fff;
      }

      .cls-checkpago, .cls-2checkpago {
        fill-rule: evenodd;
      }

      .cls-2checkpago {
        fill: #48b02c;
      }
    </style>
  </defs>
  <path class="cls-2checkpago" d="M7,0c3.86,0,7,3.13,7,7s-3.13,7-7,7S0,10.86,0,7,3.13,0,7,0"/>
  <path class="cls-checkpago" d="M4.78,10.41l-2.54-2.72c-.28-.3-.36-.74-.16-1.09,.33-.59,1.09-.65,1.51-.2l1.97,2.11,3.12-2.92s.06-.05,.09-.07l1.45-1.36c.3-.28,.74-.36,1.09-.16,.59,.33,.65,1.09,.2,1.51l-4.49,4.19h0s-1.55,1.45-1.55,1.45l-.69-.74Z"/>
</svg>
    `;
                } else if (cita.estado_pago === 'Pendiente') {
                    estadoClase = 'estado-pendiente';
                    svgEstado = `
     
<svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.02 14.02">
  <defs>
    <style>
      .cls-pendiente {
        fill: #c42d35;
      }
    </style>
  </defs>
  <path class="cls-pendiente" d="M10.89,1.17c-.9-.63-1.92-1-3.02-1.11-.06-.02-.12-.03-.18-.02-.03,0-.06,0-.09-.01-.4-.04-.79-.04-1.19,0-.08,0-.17,0-.25,.02C3.39,.48,1.48,1.99,.44,4.59c-.22,.54-.36,1.1-.37,1.69-.09,.49-.09,.98,0,1.48,0,0,0,.02,0,.02,0,.08,.01,.15,.02,.23,0,.03,.01,.07,.02,.1,0,.09-.01,.18,.05,.25-.03,.07,0,.14,.02,.2,.85,3.78,4.62,6.15,8.39,5.3,2.76-.63,4.9-2.81,5.34-5.62,.47-2.95-.57-5.33-3.02-7.06Zm-1.18,8.8c-.22,.1-.43,.05-.64-.16-.63-.63-1.27-1.26-1.9-1.9-.12-.12-.18-.13-.3,0-.64,.65-1.28,1.29-1.93,1.93-.2,.2-.43,.23-.65,.12-.21-.11-.32-.33-.28-.58,.02-.14,.11-.23,.2-.33,.63-.63,1.26-1.27,1.9-1.89,.13-.12,.12-.18,0-.3-.65-.64-1.3-1.29-1.95-1.95-.19-.19-.21-.46-.08-.67,.14-.21,.41-.3,.65-.21,.11,.04,.18,.12,.25,.19,.62,.62,1.24,1.23,1.85,1.85,.13,.13,.2,.16,.35,0,.62-.64,1.26-1.27,1.89-1.9,.16-.16,.35-.23,.56-.17,.2,.06,.32,.2,.37,.4,.01,.04,0,.08,0,.09,0,.22-.11,.35-.23,.48-.62,.62-1.24,1.25-1.87,1.86-.13,.13-.13,.19,0,.32,.64,.63,1.28,1.27,1.92,1.91,.3,.3,.23,.72-.13,.89Z"/>
</svg>
    `;
                }




                html += `
                <tr>
                    <td>0${cita.orden}</td>
                  
                    <td>${cita.especialista_nombres} ${cita.especialista_apellidos}</td>
                    <td>${cita.subarea}</td>
                   <td>${formatearFechaSimple(cita.fecha)}</td>
                 <td>${formatoHora12h(cita.hora_inicio)} - ${formatoHora12h(cita.hora_fin)}</td>
               <td class="${estadoClase}">${svgEstado}${cita.estado_pago}</td>

                   <td>S/.${cita.costo}</td>
                  <td>
 <div class="circulo-check" 
     data-costo="${cita.costo}" 
     data-idcita="${cita.idcita}" 
       data-subarea="${cita.subarea}" 
     data-nombresapoderado="${cita.apoderado_nombres} ${cita.apoderado_apellidos}"
     data-dniapoderado="${cita.apoderado_dni}" 
     data-idpaciente="${cita.idpaciente}"
       style="${cita.estado_pago === 'Cancelado' ? 'display:none;' : ''}">
    
</div>
</td>

                 
                  
                </tr>
              
              
            `;
            });

            html += `
        <tr class="fila-total">
            <td colspan="6" style="text-align: right;"><strong>TOTAL:</strong></td>
          <td><strong id="total-seleccionado">S/. 0.00</strong></td>
             
        </tr>
    `;
        }

        html += `
            </tbody>
        </table>
        </div>
    `;



        // Insertamos el resumen + tabla en el div
        $('#pagosTabla').html(html);



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



        $('#pagosTabla').on('click', '.circulo-check', function () {

            const subareas = {}; // { subarea: { cantidad: n, precioUnitario: x, total: y } }
            const citasSeleccionadas = [];
            const costosSeleccionados = [];
            let idPaciente = null;
            let nombresApoderado = null;
            let dniApoderado = null;

            $('.circulo-check.activo').each(function () {
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

            if ($('.circulo-check.activo').length > 0) {
                $('.container-medios-pago').css('display', 'block');




                // Guardar datos en campos ocultos para enviar por POST si quieres
                $('#ids-citas').val(citasSeleccionadas.join(','));
                $('#costos-citas').val(costosSeleccionados.join(','));
                $('#id-paciente').val(idPaciente);
                $('#nombres-apoderado').val(nombresApoderado);
                $('#dni-apoderado').val(dniApoderado);

                // Si quieres guardar el detalle por sub��rea en campos ocultos (por ej para backend):
                const detalleSubareas = Object.entries(subareas).map(([subarea, d]) => {
                    return `${subarea}:${d.cantidad}:${d.precioUnitario.toFixed(2)}: ${d.total.toFixed(2)}`;
                }).join('|');
                $('#detalle-subareas').val(detalleSubareas);

                // Mostrar formulario de pago
                $('.container-medios-pago').css('display', 'block');

                // Actualizar monto total
                const total = Object.values(subareas).reduce((acc, d) => acc + d.total, 0);
                $('#monto').val(total.toFixed(2));

            } else {
                $('.container-medios-pago').css('display', 'none');
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
                                const totalFormateado = totalCita.toFixed(2);
                                $('#total-sub-total').text(':' + totalFormateado);
                                $('#total-venta').text(':' + totalFormateado);

                                const totalEnLetras = numeroALetrasSoles(totalCita);
                                $('#oracion-precio').text(':' + totalEnLetras);

                                const fechaHoraPeru = obtenerFechaHoraPeruFormateada();
                                $('#cajero-fecha').text('FECHA: ' + fechaHoraPeru);

                                const modalidadPago = $('#opcion-pago option:selected').text();

                                $('#modalidad-pago-cancelado').text('PAGO CON ' + modalidadPago);

                                const codigoTicket = $('#codigo-voucher').val();
                                $('#codigo-voucher-ticket').text(codigoTicket);

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
                                                        <span>TERAPIA ${subarea.toUpperCase()}</span>
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
            $('#pagosTabla').html(`<div class="alert alert-danger">Error al cargar citas.</div>`);
        });

}

