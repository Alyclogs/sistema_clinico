const calendarEl = document.getElementById('calendar');
const baseurl = "http://localhost/SistemaClinico/";
var selectedarea = "";
var selectedsubarea = "";
var selectedespecialista = "";

const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    slotDuration: '00:30:00',
    slotLabelInterval: '00:30:00',
    slotMinTime: '09:00:00',
    slotMaxTime: '17:30:00',
    selectable: true,
    //nowIndicator: true,
    editable: true,
    locale: 'es',
    headerToolbar: false,
    eventDidMount: function (info) {
        // Personaliza los eventos si es necesario
    },

    viewDidMount: function () {
        // Colorea los slots bloqueados
        /*
        const times = document.querySelectorAll('.fc-timegrid-slot');
        times.forEach(slot => {
            const time = slot.getAttribute('data-time');
            if (
                time < '09:30:00' || time >= '17:30:00' || ['10:00:00', '10:30:00', '11:00:00'].includes(time)
            ) {
                slot.classList.add('bg-blocked');
            }
        });
        */
    },
    /*
    select: function(info) {
        const title = prompt('Título del evento:');
        if (title) {
            calendar.addEvent({
                title: title,
                start: info.start,
                end: info.end,
                allDay: info.allDay
            });
        }
        calendar.unselect();
    }
        */

});

function updateCalendarDateRange(calendar) {
    const start = calendar.view.activeStart;
    const end = calendar.view.activeEnd;

    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    const startStr = start.toLocaleDateString('es-ES', options).toUpperCase();
    const endStr = new Date(end - 1).toLocaleDateString('es-ES', options).toUpperCase();

    document.getElementById('calendar-dates').textContent = `${startStr} - ${endStr}`;
}

const miniCalendarEl = document.getElementById('mini-calendar');
const miniCalendar = new FullCalendar.Calendar(miniCalendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
        left: 'prev',
        center: 'title',
        right: 'next'
    },
    selectable: true,
    dateClick: function (info) {
        calendar.gotoDate(info.dateStr);
        updateCalendarDateRange();
    }
});

document.addEventListener('DOMContentLoaded', function () {

    calendar.render();
    updateCalendarDateRange(calendar);
    miniCalendar.render();

    calendar.on('datesSet', function () {
        updateCalendarDateRange(calendar);
    });

    function buscarSubareaPorArea(idArea) {
        $("#filtro-subarea").empty().append('<option value="" disabled selected>Seleccionar</option>').prop("disabled", true);
        $("#filtro-especialista").empty().append('<option value="" disabled selected>Seleccionar</option>').prop("disabled", true);
        $.get(baseurl + `controllers/Subareas/SubareaController.php?action=read&idarea=${idArea}`, function (data) {
            let html = '';
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

            if (parsedData) {
                if (Array.isArray(parsedData)) {
                    parsedData.forEach(function (subarea) {
                        html += `<option value="${subarea.idsubarea}">${subarea.subarea}</option>`;
                    });
                } else {
                    html += `<option value="${parsedData.idsubarea}">${parsedData.subarea}</option>`;
                }
                $("#filtro-subarea").prop("disabled", false);
                $("#filtro-subarea").append(html);
            }
        });
    }

    function buscarEspecialistaPorAreaySubarea(idArea, idSubarea) {
        // Solo limpiar y deshabilitar filtro-especialista
        $("#filtro-especialista").empty().append('<option value="" disabled selected>Seleccionar</option>').prop("disabled", true);
        $.get(baseurl + `controllers/Especialistas/EspecialistaController.php?action=read&idarea=${idArea}&idsubarea=${idSubarea}`, function (data) {
            let html = '';
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

            if (parsedData) {
                if (Array.isArray(parsedData)) {
                    parsedData.forEach(function (especialista) {
                        html += `<option value="${especialista.idespecialista}">${especialista.nom_especialista} ${especialista.ape_especialista}</option>`;
                    });
                } else {
                    html += `<option value="${parsedData.idespecialista}">${parsedData.nom_especialista} ${parsedData.ape_especialista}</option>`;
                }
                $("#filtro-especialista").prop("disabled", false).append(html);
            }
        });
    }

    $("#filtro-area").change(function () {
        $("#filtro-subarea").val("");
        selectedarea = $(this).val();
        buscarSubareaPorArea(selectedarea);
    });

    $("#filtro-subarea").change(function () {
        $("#filtro-especialista").val("");
        selectedsubarea = $(this).val();
        buscarEspecialistaPorAreaySubarea(selectedarea, selectedsubarea);
    })

    document.getElementById('prev-week').addEventListener('click', function () {
        calendar.prev();
        updateCalendarDateRange(calendar);
    });

    document.getElementById('next-week').addEventListener('click', function () {
        calendar.next();
        updateCalendarDateRange(calendar);
    });

    calendar.setOption('selectAllow', function (selectInfo) {
        if (!selectedespecialista) {
            mostrarMensajeFlotante('Debe seleccionar un especialista primero');
            return false;
        }
        /*
        if (disponibilidadActual && disponibilidadActual.length > 0) {
            let allow = true;
            let current = new Date(selectInfo.start);
            const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            while (current < selectInfo.end) {
                const hora = current.toTimeString().slice(0, 5);
                const horaSel = (hora.length === 5 ? hora + ':00' : hora);
                const nombreDia = dias[current.getDay()];
                const disp = disponibilidadActual.find(d => d.fecha === nombreDia);
                if (disp) {
                    const horaIni = disp.horainicio;
                    const horaFin = disp.horafin;
                    // Permite seleccionar la hora de fin exacta (slot igual a horafin)
                    if (!(horaSel >= horaIni && horaSel <= horaFin)) {
                        allow = false;
                        break;
                    }
                } else {
                    allow = false;
                    break;
                }
                current.setMinutes(current.getMinutes() + 30);
            }
            if (!allow) mostrarMensajeFlotante('Horario fuera de disponibilidad');
            return allow;
        }
            */
        return true;
    });

    let horariosSeleccionados = [];
    let horarioSeleccionadoActual = '';
    let especialistaSeleccionado = '';
    let lastButtonRect = null;

    // Selección múltiple de celdas en el calendario
    calendar.setOption('selectable', true);
    calendar.setOption('select', function (info) {
        const fecha = info.startStr.split('T')[0];
        const hora = info.startStr.split('T')[1].substring(0, 5);
        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const nombreDia = dias[info.start.getDay()];
        const disp = disponibilidadActual.find(d => d.fecha === nombreDia);
        let disponible = false;
        if (disp) {
            const horaSel = (hora.length === 5 ? hora + ':00' : hora);
            const horaIni = disp.horainicio;
            const horaFin = disp.horafin;
            if (hora >= '13:00' && hora < '14:00') {
                mostrarMensajeFlotante('Horario fuera de disponibilidad');
                return;
            }
            disponible = (horaSel >= horaIni && horaSel <= horaFin);
        }
        if (!disponible) {
            mostrarMensajeFlotante('Horario fuera de disponibilidad');
            return;
        }
        horariosSeleccionados.push({ fecha, hora });
        renderHorariosSeleccionados();
    });

    // Mostrar modal al hacer click en + Nueva cita
    document.querySelector('.btn-add-cita').addEventListener('click', function (e) {
        if (!selectedespecialista) {
            mostrarMensajeFlotante('Debe seleccionar un especialista primero');
            return;
        }
        const modal = document.getElementById('modalCita');
        // Fijar el ancho del modal solo la primera vez
        if (!modal.style.width) {
            modal.style.width = '460px';
        }
        lastButtonRect = e.target.getBoundingClientRect();
        // Colocar el modal a la izquierda del botón, pero sin salirse de la pantalla
        const modalWidth = 380;
        let left = lastButtonRect.left + window.scrollX - modalWidth - 20;
        if (left < 10) left = 10;
        modal.style.top = (lastButtonRect.bottom + window.scrollY + 10) + 'px';
        modal.style.left = left + 'px';
        modal.classList.add('show');
    });

    // Cerrar modal al hacer click fuera (opcional)
    document.addEventListener('mousedown', function (e) {
        const modal = document.getElementById('modalCita');
        if (modal.classList.contains('show') && !modal.contains(e.target) && !e.target.classList.contains('btn-add-cita')) {
            modal.classList.remove('show');
        }
    });

    function renderHorariosSeleccionados() {
        const cont = document.getElementById('horariosSeleccionados');
        cont.innerHTML = '';
        horariosSeleccionados.forEach((h, idx) => {
            date = new Date(2000, 0, 1, parseInt(h.hora.split(':')[0]), parseInt(h.hora.split(':')[1]));
            const chip = document.createElement('div');
            chip.className = 'horario-chip';
            chip.innerHTML = `<div class="cita-chip">
  <div class="cita-chip-info">
    <div class="cita-chip-dia">LUN 12</div>
    <div class="cita-chip-detalle">
      <strong>${especialistaSeleccionado}</strong>
      <span>Horario: ${h.hora} - ${h.hora.split(':')[0]}:${date.getMinutes() + 30}</span>
    </div>
  </div>
  <div class="cita-chip-buttons">
    <button><i class="fas fa-pen"></i></button>
    <button><i class="fas fa-trash" title='Eliminar' onclick='eliminarHorario(${idx})'></i></button>
  </div>
</div>`
            cont.appendChild(chip);
        });
    }

    window.eliminarHorario = function (idx) {
        horariosSeleccionados.splice(idx, 1);
        renderHorariosSeleccionados();
    }

    document.getElementById('btnAgregarHorario').addEventListener('click', function () {
        const fecha = document.getElementById('nuevoHorarioFecha').value;
        const hora = document.getElementById('nuevoHorarioHora').value;
        if (fecha && hora) {
            horariosSeleccionados.push({
                fecha,
                hora
            });
            renderHorariosSeleccionados();
            document.getElementById('nuevoHorarioFecha').value = '';
            document.getElementById('nuevoHorarioHora').value = '';
        }
    });

    function obtenerDisponibilidadEspecialista(idespecialista) {
        return $.get(baseurl + `controllers/Disponibilidad/DisponibilidadController.php?action=read&idespecialista=${idespecialista}`);
    }

    //Cambio de horario segun la disponibilidad del especialista
    $("#filtro-especialista").change(function () {
        selectedespecialista = $(this).val();
        especialistaSeleccionado = $(this).find('option:selected').text();
        horariosSeleccionados = [];
        if (selectedespecialista) {
            obtenerDisponibilidadEspecialista(selectedespecialista).then(function (data) {
                disponibilidadActual = data;
                actualizarBusinessHours();
            });
        } else {
            mostrarMensajeFlotante('Debe seleccionar un especialista primero');
            calendar.setOption('businessHours', []);
        }
    });

    function actualizarBusinessHours() {
        if (!disponibilidadActual || disponibilidadActual.length === 0) {
            calendar.setOption('businessHours', [{
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                startTime: '00:00',
                endTime: '00:00'
            }]);
            resaltarBloqueoAlmuerzo();
            return;
        }
        const diasMap = {
            'domingo': 0,
            'lunes': 1,
            'martes': 2,
            'miércoles': 3,
            'jueves': 4,
            'viernes': 5,
            'sábado': 6
        };
        const bh = disponibilidadActual.map(d => {
            const start = d.horainicio.slice(0, 5);
            // Suma 30 minutos a la hora de fin para que el sombreado NO incluya la hora de fin
            let [h, m] = d.horafin.slice(0, 5).split(':');
            let date = new Date(2000, 0, 1, parseInt(h), parseInt(m));
            date.setMinutes(date.getMinutes() + 30);
            const end = date.toTimeString().slice(0, 5);
            return {
                daysOfWeek: [diasMap[d.fecha]],
                startTime: start,
                endTime: end
            };
        });
        calendar.setOption('businessHours', bh);
        resaltarBloqueoAlmuerzo();
    }

    function resaltarBloqueoAlmuerzo() {
        // Espera a que el DOM esté listo
        setTimeout(() => {
            document.querySelectorAll(`.fc-timegrid-slot.fc-timegrid-slot-lane[data-time="13:00:00"],
                .fc-timegrid-slot.fc-timegrid-slot-lane[data-time="13:30:00"],
                .fc-timegrid-slot.fc-timegrid-slot-lane[data-time="14:00:00"]`)
                .forEach(slot => {
                    if (!slot.classList.contains('fc-non-business')) {
                        slot.classList.add('fc-blocked-almuerzo');
                    }
                });
        }, 10);
    }

    // Llama a la función cada vez que se renderiza el calendario
    calendar.on('datesSet', resaltarBloqueoAlmuerzo);

    let disponibilidadActual = [];
    // Mensaje flotante si no hay especialista seleccionado
    function mostrarMensajeFlotante(msg) {
        let div = document.createElement('div');
        div.className = 'mensaje-flotante';
        div.textContent = msg;
        Object.assign(div.style, {
            position: 'fixed',
            top: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#e74c3c',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: '8px',
            zIndex: 9999,
            fontWeight: 'bold',
            fontSize: '1.1em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        });
        document.body.appendChild(div);
        setTimeout(() => {
            div.remove();
        }, 2200);
    }

    // CSS para mensaje flotante
    (function () {
        if (!document.getElementById('mensaje-flotante-css')) {
            const style = document.createElement('style');
            style.id = 'mensaje-flotante-css';
            style.innerHTML = `.mensaje-flotante { animation: fadeInOut 2.2s; } @keyframes fadeInOut { 0%{opacity:0;} 10%{opacity:1;} 90%{opacity:1;} 100%{opacity:0;} }`;
            document.head.appendChild(style);
        }
    })();

});