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

        if (disponibilidadActual && disponibilidadActual.length > 0) {
            console.log("Evaluando disponibilidad para el rango:", selectInfo.start, "a", selectInfo.end);
            let allow = true;
            let current = new Date(selectInfo.start);
            while (current < selectInfo.end) {
                const dateStr = current.toISOString().slice(0, 10);
                const timeStr = current.toTimeString().slice(0, 5);
                const col = $(`.fc-timegrid-col[data-date='${dateStr}']`);
                const slot = col.find(`.fc-timegrid-slot.fc-timegrid-slot-lane[data-time='${timeStr}']`);
                if (slot.hasClass('bg-blocked') || slot.hasClass('fc-slot-blocked')) {
                    allow = false;
                    break;
                }
                current.setMinutes(current.getMinutes() + 30);
            }
            return allow;
        }
        return true;
    });

    let horariosSeleccionados = [];
    let lastButtonRect = null;

    // Selección múltiple de celdas en el calendario
    calendar.setOption('selectable', true);
    calendar.setOption('select', function (info) {
        // Guardar el rango seleccionado
        horariosSeleccionados.push({
            fecha: info.startStr.split('T')[0],
            hora: info.startStr.split('T')[1].substring(0, 5)
        });
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
            const chip = document.createElement('div');
            chip.className = 'horario-chip';
            chip.innerHTML = `${h.fecha} ${h.hora}
                <button class='btn btn-danger btn-sm ms-2' title='Eliminar' onclick='eliminarHorario(${idx})'><i class="fas fa-trash"></i></button>`;
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

    $("#filtro-especialista").change(function () {
        selectedespecialista = $(this).val();
        if (selectedespecialista) {
            obtenerDisponibilidadEspecialista(selectedespecialista).then(function (data) {
                aplicarDisponibilidadAlCalendario(data);
            });
        } else {
            mostrarMensajeFlotante('Debe seleccionar un especialista primero');
        }
    });

    let disponibilidadActual = [];

    function aplicarDisponibilidadAlCalendario(disponibilidad) {
        disponibilidadActual = disponibilidad;

        // Limpia lo anterior
        $(".fc-timegrid-slot-lane").removeClass("bg-blocked fc-slot-blocked").css("pointer-events", "");

        const columnas = $(".fc-col-header-cell.fc-day"); // cada columna tiene fecha en data-date
        const filas = $(".fc-timegrid-slot"); // cada fila tiene hora en data-time

        filas.each(function () {
            const $fila = $(this);
            const time = $fila.data("time").substring(0, 5); // "09:00"

            columnas.each(function (colIndex) {
                const $columna = $(this);
                const fechaColumna = $columna.data("date");
                const nombreDia = new Date(fechaColumna).toLocaleDateString("es-ES", { weekday: "long" }).toLowerCase();

                const disponibilidadDia = disponibilidad.find(d => d.fecha === nombreDia);
                const celda = $fila.closest("tr").find(".fc-timegrid-slot-lane").eq(colIndex);

                if (
                    !disponibilidadDia ||
                    time < disponibilidadDia.horainicio ||
                    time >= disponibilidadDia.horafin
                ) {
                    $(celda).addClass("bg-blocked fc-slot-blocked").css("pointer-events", "none").attr("title", "Horario no disponible");
                }
            });
        });
    }

    // Permite forzar el refresco visual de los slots bloqueados
    function refrescarBloqueoSlots() {
        if (disponibilidadActual && disponibilidadActual.length > 0) {
            aplicarDisponibilidadAlCalendario(disponibilidadActual);
        }
    }
    window.refrescarBloqueoSlots = refrescarBloqueoSlots;

    calendar.on('datesSet', function () {
        updateCalendarDateRange(calendar);
        if (disponibilidadActual && disponibilidadActual.length > 0) {
            aplicarDisponibilidadAlCalendario(disponibilidadActual);
        }
    });

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

    // Si el usuario intenta seleccionar en el calendario sin especialista, mostrar mensaje
    calendar.setOption('selectAllow', function (selectInfo) {
        if (!selectedespecialista) {
            mostrarMensajeFlotante('Debe seleccionar un especialista primero');
            return false;
        }
        // Si hay disponibilidad, se evalúa el bloqueo normal
        if (disponibilidadActual && disponibilidadActual.length > 0) {
            let allow = true;
            let current = new Date(selectInfo.start);
            while (current < selectInfo.end) {
                const dateStr = current.toISOString().slice(0, 10);
                const timeStr = current.toTimeString().slice(0, 5);
                const col = $(`.fc-timegrid-col[data-date='${dateStr}']`);
                const slot = col.find(`.fc-timegrid-slot.fc-timegrid-slot-lane[data-time='${timeStr}']`);
                if (slot.hasClass('bg-blocked') || slot.hasClass('fc-slot-blocked')) {
                    allow = false;
                    break;
                }
                current.setMinutes(current.getMinutes() + 30);
            }
            return allow;
        }
        return true;
    });

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