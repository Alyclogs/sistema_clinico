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
            fetchUsers(); // si borró todo, recarga la tabla completa
        }
    });
});

function buscarCitas(filtro) {

    function formatearFechaSimple(fechaISO) {
        const dias = ['DOM', 'LUN', 'MAR', 'MI�0�7', 'JUE', 'VIE', 'S�0�9B'];
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
        if (hora === 0) hora = 12; // La medianoche o mediod��a es 12 en formato 12h
        return `${hora}:${min} ${ampm}`;
    }


    $.get(baseurl + "controllers/Pagos/PagoController.php?action=buscar&filtro=" + encodeURIComponent(filtro), function (data) {
        console.log("Respuesta del servidor:", data);

        let html = '';
        let total = 0;

        if (data.length > 0) {
            // Tomamos los datos del primer resultado para mostrar al paciente
            const paciente = data[0];
            html += `
            <div class="info-paciente">
               <span> Paciente : ${paciente.paciente_dni} / ${paciente.paciente_nombres} ${paciente.paciente_apellidos}</span>
            </div>
        `;
        }

        html += `
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

                total += parseFloat(cita.costo);
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
                   <div class="circulo-check">
                   </div>
                   </td>
                  
                </tr>
              
              
            `;
            });

            html += `
        <tr class="fila-total">
            <td colspan="6" style="text-align: right;"><strong>TOTAL:</strong></td>
            <td><strong>S/. ${total.toFixed(2)}</strong></td>
        </tr>
    `;
        }

        html += `
            </tbody>
        </table>
    `;

        // Insertamos el resumen + tabla en el div
        $('#pagosTabla').html(html);

    }, 'json')
        .fail(function (xhr, status, error) {
            console.error("Error al buscar citas:", error);
            console.error("Detalles:", xhr.responseText);
            $('#pagosTabla').html(`<div class="alert alert-danger">Error al cargar citas.</div>`);
        });

}

