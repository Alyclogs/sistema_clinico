const calendarEl = document.getElementById('calendar');
const baseurl = "http://localhost/SistemaClinico/";
var selectedarea = "";
var selectedsubarea = "";
var selectedespecialista = "";
let lastEspecialista = null;
let horariosPorEspecialista = {};
let horariosSeleccionados = [];
let especialistaSeleccionado = '';
let disponibilidadEspecialista = [];
let citasGlobales = [];
let estadosCita = { '3': 'pendiente', '4': 'cancelado', '5': 'anulado' }

function calcularEdad(fechaNacStr) {
    const hoy = new Date();
    const partes = fechaNacStr.split('-');
    if (partes.length !== 3) return '';
    const anio = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    const fechaNac = new Date(anio, mes, dia);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    return edad;
}

function getInitials(nombre, apellido) {
    let n = nombre ? nombre.trim()[0] : '';
    let a = apellido ? apellido.trim()[0] : '';
    return (n + a).toUpperCase();
}

function stringToColor(str) {
    // Simple hash to color
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
}

function horaAHoraMinutos(hora) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

function ocultarTooltip() {
    document.querySelectorAll('.custom-tooltip-cita').forEach(el => el.remove());
}

function mostrarTooltipCita(cita, targetElement) {
    ocultarTooltip();

    const pacienteNombre = `${cita.paciente_nombres} ${cita.paciente_apellidos}`;
    const fechaNacimiento = cita.paciente_fecha_nacimiento;
    const edad = calcularEdad(fechaNacimiento);
    const especialista = `${cita.especialista_nombre} ${cita.especialista_apellidos ?? ''}`;
    const horario = `${formatearHora12h(cita.hora_inicio)} - ${formatearHora12h(cita.hora_fin)}`;
    //const color = stringToColor(pacienteNombre);
    //const iniciales = getInitials(cita.paciente_nombres, cita.paciente_apellidos);
    const svgEstado = getSVGCita(`cita-${estadosCita[cita.idestado]}`);

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip-cita';
    tooltip.innerHTML = `
    <div class="mytooltip">
    <div class="tooltip-content">
        <div class="tooltip-header">
            <img class="avatar-iniciales" src="${cita.paciente_foto}">
            <div class="datos-paciente">
                <strong>${pacienteNombre}</strong>
                <div class="paciente-detalles">${fechaNacimiento} - ${edad} años</div>
                <div>DNI: ${cita.paciente_dni}</div>
            </div>
        </div>
        <div class="tooltip-footer">
            <div class="especialista"><strong>${especialista}</strong></div>
            <div class="svg-horario">
            ${svgEstado}
${horario}</div>
        </div>
        </div>
        <button class="btn btn-light btn-ver-cita" onclick="verCita(${cita.idcita})">Ver cita</button>
        </div>`;

    document.body.appendChild(tooltip);

    const rect = targetElement.getBoundingClientRect();
    tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 10}px`;
    tooltip.style.left = `${rect.left + window.scrollX}px`;

    targetElement._tooltip = tooltip;

    tooltip.addEventListener('mouseleave', function () {
        setTimeout(() => {
            ocultarTooltip();
        }, 1000)
    })
}

function getSVGPendiente() {
    return `<!-- Generator: Adobe Illustrator 25.2.3, SVG Export Plug-In  -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="11.15px"
	 height="11.15px" viewBox="0 0 11.15 11.15" style="overflow:visible;enable-background:new 0 0 11.15 11.15;"
	 xml:space="preserve">
<style type="text/css">
	.st010{fill-rule:evenodd;clip-rule:evenodd;fill:#F07E0B;}
	.st011{fill:#FFFFFF;}
</style>
<defs>
</defs>
<g>
	<g>
		<path class="st010" d="M5.57,0c3.08,0,5.57,2.5,5.57,5.57s-2.5,5.57-5.57,5.57C2.5,11.15,0,8.65,0,5.57S2.5,0,5.57,0"/>
	</g>
	<path class="st011" d="M7.82,8.34c-0.11,0-0.22-0.04-0.3-0.12L5.17,5.88C5.09,5.8,5.05,5.69,5.05,5.57V2.16
		c0-0.24,0.19-0.43,0.43-0.43c0.24,0,0.43,0.19,0.43,0.43V5.4l2.22,2.22c0.17,0.17,0.17,0.44,0,0.6c0,0,0,0,0,0
		C8.04,8.3,7.93,8.35,7.82,8.34z"/>
</g>
</svg>
`;
}

function getSVGAnulado() {
    return `<!-- Generator: Adobe Illustrator 25.2.3, SVG Export Plug-In  -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="11px"
	 height="11px" viewBox="0 0 11 11" style="overflow:visible;enable-background:new 0 0 11 11;" xml:space="preserve">
<style type="text/css">
	.st012{fill:none;stroke:#E5252A;stroke-linecap:round;stroke-miterlimit:10;}
</style>
<defs>
</defs>
<g>
	<g id="g327_1_" transform="translate(492,135)">
		<path id="path329_1_" class="st012" d="M-481.5-129.5c0,2.76-2.24,5-5,5s-5-2.24-5-5c0-2.76,2.24-5,5-5S-481.5-132.26-481.5-129.5z"
			/>
	</g>
	<g id="g331_1_" transform="translate(347,105)">
		<path id="path333_1_" class="st012" d="M-342.8-98.2l2.61-2.61"/>
	</g>
	<g id="g335_1_" transform="translate(407,105)">
		<path id="path337_1_" class="st012" d="M-400.2-98.2l-2.61-2.61"/>
	</g>
</g>
</svg>
`;
}

function getSVGcancelado() {
    return `<!-- Generator: Adobe Illustrator 25.2.3, SVG Export Plug-In  -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="11.15px"
	 height="11.15px" viewBox="0 0 11.15 11.15" style="overflow:visible;enable-background:new 0 0 11.15 11.15;"
	 xml:space="preserve">
<style type="text/css">
	.st013{fill-rule:evenodd;clip-rule:evenodd;fill:#48B02C;}
	.st014{fill-rule:evenodd;clip-rule:evenodd;fill:#FFFFFF;}
</style>
<defs>
</defs>
<g>
	<path class="st013" d="M5.57,0c3.08,0,5.57,2.5,5.57,5.57s-2.5,5.57-5.57,5.57C2.5,11.15,0,8.65,0,5.57S2.5,0,5.57,0"/>
	<path class="st014" d="M3.81,8.29L1.78,6.13C1.56,5.89,1.5,5.54,1.65,5.26c0.26-0.47,0.87-0.52,1.2-0.16l1.57,1.68l2.49-2.33
		C6.94,4.43,6.96,4.41,6.99,4.4l1.16-1.08C8.38,3.1,8.73,3.03,9.01,3.19c0.47,0.26,0.52,0.87,0.16,1.2L5.6,7.73l0,0L4.36,8.88
		L3.81,8.29z"/>
</g>
</svg>
`;
}

function getSVGCita(estado) {
    switch (estado) {
        case 'cita-pendiente':
            return getSVGPendiente();
        case 'cita-cancelado':
            return getSVGcancelado();
        case 'cita-anulado':
            return getSVGAnulado();
        default:
            return '';
    }
}

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
    hiddenDays: [0],
    slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // usa true si quieres formato AM/PM
    },

    hiddenDays: [0],
    slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // usa true si quieres formato AM/PM
    },
    dayHeaderFormat: {
        weekday: 'long',
        day: '2-digit',
        eventDidMount: function (info) {
            // Personaliza los eventos si es necesario
        }
    },
    eventClick: function (info) {
        if (info.event.extendedProps.multiple) {
            return false; // Prevenir comportamiento por defecto
        }
        console.log('Evento individual clickeado:', info.event);
    },
    eventMouseEnter: function (info) {
        const event = info.event;

        if (event.extendedProps.multiple && event.extendedProps.citas) {
            const cuadrados = info.el.querySelectorAll('.cita-cuadrado');

            cuadrados.forEach(cuadrado => {
                cuadrado.addEventListener('mouseenter', function () {
                    const citaId = this.dataset.citaId;
                    const cita = event.extendedProps.citas.find(c => c.idcita == citaId);
                    if (cita) {
                        mostrarTooltipCita(cita, this);
                    }
                });

                cuadrado.addEventListener('mouseleave', function () {
                    setTimeout(() => {
                        ocultarTooltip();
                    }, 1000)
                });
            });
        } else if (event.extendedProps.cita && event.classNames.includes('cita-agendada-evento')) {
            mostrarTooltipCita(event.extendedProps.cita, info.el);
        }
    },
    eventMouseLeave: function (info) {
        setTimeout(() => {
            ocultarTooltip();
        }, 1500)
    }
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
    refrescarCitas();
    //refrescarCitas(false);

    updateCalendarDateRange(calendar);
    resaltarBloqueoAlmuerzo();
    calendar.render();

    calendar.on('datesSet', function () {
        updateCalendarDateRange(calendar);
    });

    function buscarSubareaPorArea(idArea) {
        $("#filtro-subarea").empty().append('<option value="" disabled selected>Seleccionar</option>').prop("disabled", true);
        $("#filtro-especialista").empty().append('<option value="" disabled selected>Seleccionar</option>').prop("disabled", true);
        $.get(baseurl + `controllers/Subareas/SubareaController.php?action=read&idarea=${idArea}`, function (data) {
            let html = '';
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            console.log('Subareas: ', parsedData);
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
        $("#filtro-especialista")
            .empty()
            .append('<option value="" disabled selected>Seleccionar</option>')
            .prop("disabled", true);

        $.get(baseurl + `controllers/Especialistas/EspecialistaController.php?action=read&idarea=${idArea}&idsubarea=${idSubarea}`, function (data) {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            const especialistas = Array.isArray(parsedData) ? parsedData : [parsedData];

            const promesas = especialistas.map(especialista => {
                return obtenerDisponibilidadEspecialista(especialista.idespecialista).then(disponibilidad => {
                    if (disponibilidad.length === 0) {
                        // No tiene disponibilidad, lo incluimos con disponibilidad 0
                        return {
                            idespecialista: especialista.idespecialista,
                            nombre: `${especialista.nom_especialista} ${especialista.ape_especialista}`,
                            minutos_disponibles: -1 // Marcamos -1 para ordenar después
                        };
                    }

                    // Tiene disponibilidad, calculamos
                    return obtenerCitasEspecialista(especialista.idespecialista).then(citas => {
                        const resultados = calcularDisponibilidadPorEspecialista(disponibilidad, citas);
                        return resultados.map(r => ({
                            ...r,
                            nombre: `${especialista.nom_especialista} ${especialista.ape_especialista}`
                        }));
                    });
                });
            });

            Promise.all(promesas).then(respuestas => {
                let todos = [];

                respuestas.forEach(r => {
                    if (Array.isArray(r)) {
                        todos.push(...r);
                    } else {
                        todos.push(r);
                    }
                });

                // Ordenar: los con disponibilidad primero, los sin disponibilidad al final
                todos.sort((a, b) => b.minutos_disponibles - a.minutos_disponibles);
                console.log(todos);

                let html = '';
                todos.forEach(e => {
                    html += `<option value="${e.idespecialista}">
                    ${e.nombre}
                </option>`;
                });

                $("#filtro-especialista")
                    .html('<option value="" disabled selected>Seleccionar</option>' + html)
                    .prop("disabled", false);
            });
        });
    }

    $("#filtro-area").change(function () {
        $(this).removeClass('filtro-not-selected');
        $("#filtro-subarea").val("");
        selectedarea = $(this).val();
        buscarSubareaPorArea(selectedarea);
    });

    $("#filtro-subarea").change(function () {
        $(this).removeClass('filtro-not-selected');
        $("#filtro-especialista").val("");
        selectedsubarea = $(this).val();
        buscarEspecialistaPorAreaySubarea(selectedarea, selectedsubarea);
    })

    //Cambio de horario segun la disponibilidad del especialista
    $("#filtro-especialista").change(function () {
        $(this).removeClass('filtro-not-selected');
        selectedespecialista = $(this).val();
        especialistaSeleccionado = $(this).find('option:selected').text();
        if (selectedespecialista) {
            obtenerDisponibilidadEspecialista(selectedespecialista).then(function (data) {
                disponibilidadEspecialista = data;
                actualizarBusinessHours();
                if (disponibilidadEspecialista.length == 0) {
                    mostrarMensajeFlotante("Especialista sin disponibilidad");
                }
            });
            refrescarCitas(selectedespecialista);
            actualizarEventosVisuales(true);
            lastEspecialista = selectedespecialista;
        } else {
            mostrarMensajeFlotante('Debe seleccionar un especialista primero');
            calendar.setOption('businessHours', []);
            actualizarEventosVisuales(false);
            refrescarCitas();
            lastEspecialista = null;
        }
        // NO modificar la lista del modal ni horariosSeleccionados
    });

    document.getElementById('prev-week').addEventListener('click', function () {
        calendar.prev();
        updateCalendarDateRange(calendar);
    });

    document.getElementById('next-week').addEventListener('click', function () {
        calendar.next();
        updateCalendarDateRange(calendar);
    });

    // Selección de una sola celda a la vez (NO permite rangos)
    calendar.setOption('selectable', true);
    calendar.setOption('selectMirror', false);
    //calendar.setOption('selectOverlap', false);
    calendar.setOption('selectMinDistance', 1);
    calendar.setOption('selectLongPressDelay', 99999); // Desactiva selección por arrastre
    calendar.setOption('select', function (info) {
        // --- BLOQUEA RANGOS ---
        const diffMs = info.end - info.start;
        if (diffMs !== 30 * 60 * 1000) {
            mostrarMensajeFlotante('Solo puedes seleccionar un horario de 30 minutos a la vez');
            calendar.unselect();
            return;
        }
        const fecha = info.startStr.split('T')[0];
        const hora = info.startStr.split('T')[1].substring(0, 5);
        //Si no es una cita, seleccionar horario
        if (!citasGlobales.find(d => d.fecha === fecha && d.hora_inicio === info.startStr.split('T')[1].substring(0, 8))) {
            if (!selectedespecialista) {
                mostrarMensajeFlotante('Debe seleccionar un especialista primero');
                return;
            }
            // Si ya existe ese horario, lo removemos
            if (horariosSeleccionados.some(h => h.fecha === fecha && h.hora === hora)) {
                let horarioActual = horariosSeleccionados.find(h => h.hora === hora && h.fecha === fecha);
                horariosSeleccionados.splice(horariosSeleccionados.indexOf(horarioActual), 1);
                renderHorariosSeleccionados();
                actualizarEventosVisuales();
                return;
            }
            seleccionActual = info.startStr;
            let horaIni = formatearHora12h(hora);
            let horaFin = formatearHora12h(sumar30Minutos(hora));
            const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const nombreDia = dias[info.start.getDay()];
            const disp = disponibilidadEspecialista.filter(d => d.fecha === nombreDia);
            let disponible = false;
            if (disp) {
                const horaSel = (hora.length === 5 ? hora + ':00' : hora);
                if ((hora >= '13:00' && hora < '14:00') || (hora < '9:00' && hora > '17:00')) {
                    mostrarMensajeFlotante('Horario fuera de disponibilidad');
                    return;
                }
                disponible = disp.some(d => horaSel >= d.horainicio && horaSel <= d.horafin);
            }
            if (!disponible) {
                mostrarMensajeFlotante('Horario fuera de disponibilidad');
                return;
            }
            horariosSeleccionados.push({ fecha, horaIni, horaFin, hora, idespecialista: selectedespecialista, especialistaSeleccionado: especialistaSeleccionado });
            renderHorariosSeleccionados();
            actualizarEventosVisuales();
            refrescarCitas(selectedespecialista);
        }
    });

    // --- GESTIÓN DE HORARIOS SELECCIONADOS  ---
    var idxEditando = null; // Índice del horario que se está editando

    function renderHorariosSeleccionados() {
        const cont = document.getElementById('horariosSeleccionados');
        cont.innerHTML = '';
        const diasAbrev = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        horariosSeleccionados.forEach((h, idx) => {
            const chip = document.createElement('div');
            chip.className = 'horario-chip';
            chip.dataset.idx = idx;
            // Día abreviado y número
            const fechaObj = new Date(h.fecha + 'T00:00:00');
            const diaAbrev = diasAbrev[fechaObj.getDay()];
            const diaNum = fechaObj.getDate();
            chip.innerHTML = `<div class="cita-chip">
  <div class="cita-chip-info">
    <div class="cita-chip-dia">${diaAbrev} ${diaNum}</div>
    <div class="cita-chip-detalle">
      <strong>${h.especialistaSeleccionado}</strong>
      <span>${h.horaIni} - ${h.horaFin}</span>
    </div>
  </div>
   <div class="cita-chip-buttons">
    <button class="btn-editar-horario${idxEditando === idx ? ' btn-editando' : ''}" id="btnEditarHorario" data-idx="${idx}">
    
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="9px"
	     height="8.99px" viewBox="0 0 9 8.99" style="overflow:visible;enable-background:new 0 0 9 8.99;" xml:space="preserve">
    <style type="text/css">
	    .st05{fill:#76869E;}
    </style>
    <defs>
    </defs>
    <g>
	<path class="st05" d="M8.72,1.86L7.13,0.27c-0.37-0.37-0.97-0.37-1.34,0l-5.22,5.2C0.51,5.55,0.51,5.62,0.5,5.63L0,8.67
		c-0.01,0.08,0.01,0.18,0.08,0.24C0.14,8.98,0.24,9,0.33,8.99L3.36,8.5c0.01,0,0.08-0.01,0.15-0.08l5.2-5.22
		C9.1,2.83,9.1,2.23,8.72,1.86z M3.32,7.81L2.45,6.94l3.68-3.68L7,4.13L3.32,7.81z M2.04,6.54C2.01,6.52,1.11,5.62,1.17,5.67
		l3.68-3.68l0.87,0.87L2.04,6.54z M0.62,8.37l0.34-2.11l1.76,1.76L0.62,8.37z M8.33,2.8L7.4,3.73L5.26,1.6l0.93-0.93
		c0.14-0.14,0.39-0.14,0.55,0l1.59,1.59C8.48,2.41,8.48,2.65,8.33,2.8z"/>
</g>
</svg>
    
    </button>
    <button class="btn-eliminar" onclick='eliminarHorario(${idx})'><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="7.87px" height="9px" viewBox="0 0 7.87 9" style="overflow: visible; enable-background: new 0 0 7.87 9" xml:space="preserve">
    <style type="text/css">
      .st007 {
        fill: #76869e;
      }
    </style>
    <defs></defs>
    <g>
      <g>
        <path class="st007" d="M7.32,2.25H0.57c-0.08,0-0.15,0.03-0.2,0.09C0.31,2.39,0.28,2.47,0.29,2.54L0.54,8.2C0.56,8.65,0.93,9,1.38,9
			H6.5c0.45,0,0.82-0.35,0.84-0.8L7.6,2.54c0-0.08-0.02-0.15-0.08-0.21C7.47,2.28,7.4,2.25,7.32,2.25L7.32,2.25z M6.78,8.17
			C6.78,8.32,6.65,8.44,6.5,8.44H1.38c-0.15,0-0.27-0.12-0.28-0.27L0.86,2.81h6.16L6.78,8.17z"></path>
        <path class="st007" d="M2.46,7.32c0,0,0.01,0,0.01,0c0.16-0.01,0.28-0.14,0.27-0.29L2.61,3.93C2.6,3.78,2.47,3.66,2.32,3.66
			C2.16,3.67,2.04,3.8,2.05,3.96l0.13,3.09C2.19,7.2,2.31,7.32,2.46,7.32L2.46,7.32z"></path>
        <path class="st007" d="M5.41,7.32c0,0,0.01,0,0.01,0c0.15,0,0.27-0.12,0.28-0.27l0.13-3.09C5.84,3.8,5.72,3.67,5.57,3.66
			C5.42,3.66,5.28,3.78,5.28,3.93L5.14,7.03C5.14,7.18,5.26,7.31,5.41,7.32L5.41,7.32z"></path>
        <path class="st007" d="M7.59,1.12H5.91V0.84C5.91,0.38,5.53,0,5.06,0H2.81C2.35,0,1.97,0.38,1.97,0.84v0.28l-1.69,0
			c-0.12,0-0.23,0.08-0.27,0.19C-0.05,1.51,0.1,1.69,0.28,1.69h1.97h3.38l1.97,0c0.12,0,0.23-0.08,0.27-0.19
			C7.92,1.3,7.78,1.12,7.59,1.12z M2.53,1.12V0.84c0-0.16,0.13-0.28,0.28-0.28h2.25c0.16,0,0.28,0.13,0.28,0.28v0.28H2.53z"></path>
        <path class="st007" d="M4.22,7.03V3.95c0-0.14-0.11-0.27-0.25-0.29C3.8,3.65,3.66,3.78,3.66,3.94v3.09c0,0.17,0.14,0.3,0.31,0.28
			C4.11,7.3,4.22,7.18,4.22,7.03z"></path>
      </g>
    </g>
  </svg></button>
  </div>
</div>`;
            cont.appendChild(chip);
        });
        // Mostrar/ocultar mensaje y body según cantidad de horarios
        const noHorarios = document.querySelector('.no-horarios-selected');
        const subtituloCitas = document.getElementById('.subCitasSeleccionadas');
        const modalCitaBody = document.querySelector('.modal-cita-body');
        const agregarMas = document.querySelector('.agregar-mas');
        const horariosSeleccionadosDiv = document.getElementById('horariosSeleccionados');
        const agregarHorarioDiv = document.querySelector('.agregar-horario');
        const footerModal = document.querySelector('.footer-modal');
        if (horariosSeleccionados.length === 0) {
            if (subtituloCitas) subtituloCitas.style.display = 'none';
            if (noHorarios) noHorarios.style.display = 'flex';
            if (modalCitaBody) modalCitaBody.style.display = 'none';
            if (agregarMas) agregarMas.style.display = 'block';
            if (horariosSeleccionadosDiv) horariosSeleccionadosDiv.style.display = 'none';
            if (agregarHorarioDiv) agregarHorarioDiv.style.display = 'none';
            if (footerModal) footerModal.style.display = 'none'; // <-- fuerza ocultar footer
        } else {
            if (subtituloCitas) subtituloCitas.style.display = 'block';
            if (noHorarios) noHorarios.style.display = 'none';
            if (modalCitaBody) modalCitaBody.style.display = 'block';
            if (agregarMas) agregarMas.style.display = 'block';
            if (horariosSeleccionadosDiv) horariosSeleccionadosDiv.style.display = 'block';
            //if (agregarHorarioDiv) agregarHorarioDiv.style.display = 'flex';
            if (footerModal) footerModal.style.display = 'flex'; // <-- fuerza mostrar footer
        }
        //document.querySelector('.agregar-horario').style.display = 'flex';
    }

    document.addEventListener('click', function (e) {
        if (e.target.closest('.btn-editar-horario')) {
            if (e.target.closest('.btn-editar-horario')) {
                const idx = parseInt(e.target.closest('.btn-editar-horario').dataset.idx);

                // Si ya está editando este mismo, al hacer clic de nuevo, actualiza
                if (idxEditando === idx) {
                    let fecha = document.getElementById('nuevoHorarioFecha').value;
                    let hora = document.getElementById('nuevoHorarioHora').value;
                    const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

                    if (fecha && hora) {
                        if (hora >= '13:00' && hora < '14:00') {
                            mostrarMensajeFlotante('Horario fuera de disponibilidad');
                            return;
                        }

                        let horaIni = formatearHora12h(hora);
                        let horaFin = formatearHora12h(sumar30Minutos(hora));

                        // Verificar disponibilidad primero, luego citas
                        obtenerDisponibilidadEspecialista(horariosSeleccionados[idxEditando].idespecialista)
                            .then(function (disponibilidadEspecialista) {
                                let fechaSel = new Date(horariosSeleccionados[idxEditando].fecha);
                                const nombreDia = dias[fechaSel.getDay()];
                                let disponible = false;

                                const disp = disponibilidadEspecialista.find(d => d.fecha === nombreDia);
                                if (disp) {
                                    const horaSel = (hora.length === 5 ? hora + ':00' : hora);
                                    disponible = (horaSel >= disp.horainicio && horaSel <= disp.horafin);
                                }

                                if (!disponible) {
                                    mostrarMensajeFlotante('Horario fuera de disponibilidad');
                                    return Promise.reject('No disponible');
                                }

                                // Si está disponible, verificar citas
                                return obtenerCitasEspecialista(horariosSeleccionados[idxEditando].idespecialista);
                            })
                            .then(function (citasEspecialista) {
                                const cit = citasEspecialista.find(d => d.fecha === fecha && d.hora_inicio === hora);

                                if (cit) {
                                    mostrarMensajeFlotante('Horario fuera de disponibilidad');
                                    return;
                                }

                                // Actualizar horario si todo está bien
                                const idxActual = idxEditando; // Guardar antes de establecer a null
                                horariosSeleccionados[idxActual].fecha = fecha;
                                horariosSeleccionados[idxActual].horaIni = horaIni;
                                horariosSeleccionados[idxActual].horaFin = horaFin;
                                horariosSeleccionados[idxActual].hora = hora;

                                idxEditando = null;
                                renderHorariosSeleccionados();
                                refrescarCitas();

                                // Remover elemento de edición correctamente
                                const elementoEdicion = document.querySelector(`.horario-chip[data-idx="${idxActual}"] .agregar-horario`);
                                if (elementoEdicion) {
                                    elementoEdicion.remove();
                                }
                            })
                            .catch(function (error) {
                                console.log('Error en verificación:', error);
                            });
                    } else {
                        mostrarMensajeFlotante('Ingrese una fecha y una hora válidos');
                        return;
                    }
                } else {
                    // Si es otro, inicia edición
                    idxEditando = idx;
                    renderHorariosSeleccionados();
                    const h = horariosSeleccionados[idx];
                    let agregarHorario = document.querySelector('.agregar-horario');

                    if (!agregarHorario) {
                        agregarHorario = document.createElement('div');
                        agregarHorario.className = 'agregar-horario';
                        agregarHorario.innerHTML = `<div class="calendario">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="12.34px"
     height="12.34px" viewBox="0 0 12.34 12.34" style="overflow:visible;enable-background:new 0 0 12.34 12.34;"
     xml:space="preserve">
<style type="text/css">
    .st008{fill:#76869E;}
</style>
<defs>
</defs>
<g>
    <g>
        <g>
            <g>
                <rect x="5.69" y="5.54" class="st008" width="0.96" height="0.96"/>
                <path class="st008" d="M10.9,0.96h-0.58V0H9.35v0.96H2.99V0H2.03v0.96H1.45C0.65,0.96,0,1.61,0,2.41v8.49
                    c0,0.8,0.65,1.45,1.45,1.45h3.21h0.07h1.68c-0.33-0.28-0.62-0.6-0.86-0.96H4.73H4.65H1.45c-0.27,0-0.48-0.22-0.48-0.48V4.53
                    h10.41V5.5v0.05v0c0.36,0.24,0.69,0.53,0.96,0.86V5.54V5.5V2.41C12.34,1.61,11.7,0.96,10.9,0.96z M11.38,3.57H0.96V2.41
                    c0-0.27,0.22-0.48,0.48-0.48h0.58v0.96h0.96V1.93h6.36v0.96h0.96V1.93h0.58c0.27,0,0.48,0.22,0.48,0.48V3.57z"/>
                <path class="st008" d="M9.08,5.84c-1.79,0-3.25,1.46-3.25,3.25s1.46,3.25,3.25,3.25s3.25-1.46,3.25-3.25S10.88,5.84,9.08,5.84z
                     M9.08,11.38c-1.26,0-2.29-1.03-2.29-2.29S7.82,6.8,9.08,6.8s2.29,1.03,2.29,2.29S10.34,11.38,9.08,11.38z"/>
                <polygon class="st008" points="9.55,7.47 8.58,7.47 8.58,9.57 10.37,9.57 10.37,8.61 9.55,8.61 				"/>
                <rect x="3.76" y="7.47" class="st008" width="0.96" height="0.96"/>
                <rect x="1.83" y="7.47" class="st008" width="0.96" height="0.96"/>
                <rect x="1.83" y="5.54" class="st008" width="0.96" height="0.96"/>
                <rect x="1.83" y="9.4" class="st008" width="0.96" height="0.96"/>
                <rect x="3.76" y="5.54" class="st008" width="0.96" height="0.96"/>
                <rect x="3.76" y="9.4" class="st008" width="0.96" height="0.96"/>
            </g>
        </g>
    </g>
</g>
</svg>
                    <input type="date" id="nuevoHorarioFecha" />
                </div>
                <div class="reloj">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="12.07px"
     height="12.07px" viewBox="0 0 12.07 12.07" style="overflow:visible;enable-background:new 0 0 12.07 12.07;"
     xml:space="preserve">
<style type="text/css">
    .st009{fill:#76869E;}
</style>
<defs>
</defs>
<g id="Layer_2_1_">
    <path class="st009" d="M6.04,12.07C2.7,12.07,0,9.37,0,6.04S2.7,0,6.04,0s6.04,2.7,6.04,6.04S9.37,12.07,6.04,12.07z M6.04,0.93
        c-2.82,0-5.11,2.29-5.11,5.11s2.29,5.11,5.11,5.11s5.11-2.29,5.11-5.11S8.86,0.93,6.04,0.93z"/>
    <path class="st009" d="M8.48,9.06c-0.12,0-0.24-0.05-0.33-0.13L5.6,6.37C5.51,6.28,5.46,6.16,5.46,6.04V2.32
        c0-0.26,0.21-0.46,0.46-0.46c0.26,0,0.46,0.21,0.46,0.46v3.52l2.42,2.41c0.18,0.18,0.18,0.47,0,0.66c0,0,0,0,0,0
        C8.72,9.01,8.61,9.06,8.48,9.06z"/>
</g>
</svg>
                    <input type="time" id="nuevoHorarioHora" />
                </div>
                <button id="btnAgregarHorario" class="btn-icon">
                    <i class="fas fa-plus"></i>
                </button>`;

                        const citaChip = document.querySelector(`.horario-chip[data-idx="${idx}"]`);
                        citaChip.appendChild(agregarHorario);
                        agregarHorario.style.display = 'flex';
                        document.getElementById('nuevoHorarioFecha').value = h.fecha;
                        document.getElementById('nuevoHorarioHora').value = h.hora;
                        document.getElementById('btnAgregarHorario').style.display = 'none';
                    } else {
                        agregarHorario.style.display = 'none';
                    }
                }
            }
        }
        if (e.target.closest(".paciente-item")) {
            const pacienteItem = e.target.closest(".paciente-item");
            const idPaciente = pacienteItem.dataset.id;
            //const nombreCompleto = paciente.querySelector('.paciente-nombre strong').textContent;
            const dni = pacienteItem.querySelector('.dni').textContent.replace('DNI: ', '').replace('|', '').trim();
            //const fechaNac = paciente.querySelector('.fecha-nac').textContent.trim();
            buscarPacientes(dni).then(pacientes => {
                const pacienteActual = pacientes[0];
                const edad = calcularEdad(pacienteActual.fecha_nacimiento);

                //$('.avatar-iniciales').text(getInitials(nombreCompleto.split(' ')[0], nombreCompleto.split(' ')[1]));
                //$('.avatar-iniciales').css('background-color', stringToColor(nombreCompleto));
                $('.paciente-cita').attr('data-id', idPaciente);
                $('#pacienteSelFoto').attr('src', pacienteActual.foto);
                $('.paciente-nombre').text(`${pacienteActual.nombres} ${pacienteActual.apellidos}`);
                $('.pacientesel-dni').text(`DNI: ${pacienteActual.dni}`);
                $('.pacientesel-edad').text(`Edad: ${edad} años`);
                $('.paciente-detalles span').css('color', '#76869E');

                $('#subPacienteSeleccionado').show();
                $('#pacienteSeleccionado').show();
                $('#resultadoPacientes').css('display', 'none').empty();
            });
        }
        if (e.target.closest('#btnPagar')) {
            if (!selectedespecialista) {
                mostrarMensajeFlotante('Debe seleccionar un especialista primero');
                return;
            }
            if (horariosSeleccionados.length === 0) {
                mostrarMensajeFlotante('Debe seleccionar al menos un horario');
                return;
            }
            const idPaciente = document.getElementById('pacienteCita')?.dataset.id;

            if (!idPaciente) {
                mostrarMensajeFlotante('Debe seleccionar un paciente primero');
                return;
            }
            agendarCita('3');
            const dni = $('.pacientesel-dni').text().replace('DNI:', '').trim();
            window.location.href = baseurl + `views/Clinica/pagos/index.php?filtro=${dni}`
        }
        if (e.target.closest('#btnReservar')) {
            if (!selectedespecialista) {
                mostrarMensajeFlotante('Debe seleccionar un especialista primero');
                return;
            }
            if (horariosSeleccionados.length === 0) {
                mostrarMensajeFlotante('Debe seleccionar al menos un horario');
                return;
            }
            const idPaciente = document.getElementById('pacienteCita')?.dataset.id;

            if (!idPaciente) {
                mostrarMensajeFlotante('Debe seleccionar un paciente primero');
                return;
            }
            agendarCita('3');
        }
        if (e.target.closest('#btnAddPaciente')) {
            $.get('../pacientes/formPaciente.php', function (formHtml) {
                $('#usuarioModalBody').html(formHtml);
                $('#usuarioModal').modal('show');
            });
        }
    });

    function agendarCita(idestado) {
        const idUsuario = document.getElementById('idUsuario').value;
        const idPaciente = document.getElementById('pacienteCita')?.dataset.id;

        horariosSeleccionados.forEach(h => {
            const horaInicio = h.hora;
            const horaFin = sumar30Minutos(horaInicio);
            const fecha = h.fecha;

            const data = {
                idusuario: idUsuario,
                idpaciente: idPaciente,
                idespecialista: h.idespecialista,
                hora_inicio: horaInicio,
                hora_fin: horaFin,
                fecha: fecha,
                idestado: idestado
            };
            $.post(baseurl + 'controllers/Citas/CitasController.php?action=create', { data: JSON.stringify(data) }, function (response) {
                if (response.success) {
                    $('#modalCita').modal('hide');
                    horariosSeleccionados = [];
                    renderHorariosSeleccionados();
                    refrescarCitas(selectedespecialista);
                    actualizarEventosVisuales(false);
                } else {
                    mostrarMensajeFlotante('Error al agendar la cita: ' + response.error + '\n' + response.message);
                }
            }, 'json');
        });
    }

    $(document).on('click', '.btn-cancelar', function () {
        const usuarioModal = bootstrap.Modal.getInstance(document.getElementById('usuarioModal'));
        usuarioModal.hide();
    })

    // Guardar paciente 
    $(document).on('click', '#btnGuardarPaciente', function () {
        const formUsuario = $('#formUsuario');
        if (formUsuario[0].checkValidity()) {
            const usuarioModal = bootstrap.Modal.getInstance(document.getElementById('usuarioModal'));
            let url = baseurl + 'controllers/Pacientes/PacienteController.php?action=create';
            const formDataObj = {};
            const formDataArray = formUsuario.serializeArray();

            formDataArray.forEach(function (item) {
                formDataObj[item.name] = item.value;
            });

            $.ajax({
                type: 'POST',
                url: url,
                data: { data: JSON.stringify(formDataObj) },
                dataType: 'json',
                success: function (response) {
                    let textContent = response.message ?? response.error;
                    mostrarMensajeFlotante(textContent, response.success);

                    setTimeout(function () {
                        if (response.success && response.paciente_id) {
                            usuarioModal.hide();
                            // ✅ Redirección si fue exitoso
                            //$('.avatar-iniciales').text(getInitials(formDataObj['nombres'], formDataObj['apellidos']));
                            //$('.avatar-iniciales').css('background-color', stringToColor(`${formDataObj['nombres']} ${formDataObj['apellidos']}`));
                            buscarPacientes(formDataObj['dni']).then(pacientes => {
                                const pacienteActual = pacientes[0];
                                const edad = calcularEdad(pacienteActual.fecha_nacimiento);

                                //$('.avatar-iniciales').text(getInitials(nombreCompleto.split(' ')[0], nombreCompleto.split(' ')[1]));
                                //$('.avatar-iniciales').css('background-color', stringToColor(nombreCompleto));
                                $('.paciente-cita').attr('data-id', response.paciente_id);
                                $('#pacienteSelFoto').attr('src', pacienteActual.foto);
                                $('.paciente-nombre').text(`${pacienteActual.nombres} ${pacienteActual.apellidos}`);
                                $('.pacientesel-dni').text(`DNI: ${pacienteActual.dni}`);
                                $('.pacientesel-edad').text(`Edad: ${edad} años`);
                                $('.paciente-detalles span').css('color', '#76869E');

                                $('#subPacienteSeleccionado').show();
                                $('#pacienteSeleccionado').show();
                                $('#resultadoPacientes').css('display', 'none').empty();
                            });
                        }
                    }, 1000);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            });
        } else {
            formUsuario[0].reportValidity();
        }
    });

    window.eliminarHorario = function (idx) {
        horariosSeleccionados.splice(idx, 1);
        idxEditando = null;
        renderHorariosSeleccionados();
    };

    function obtenerDisponibilidadEspecialista(idespecialista) {
        return $.get(baseurl + `controllers/Disponibilidad/DisponibilidadController.php?action=read&idespecialista=${idespecialista}`);
    }

    function obtenerCitasEspecialista(idespecialista) {
        return $.get(baseurl + `controllers/Citas/CitasController.php?action=read&idespecialista=${idespecialista}`);
    }

    function obtenerCitas() {
        return $.get(baseurl + `controllers/Citas/CitasController.php?action=read`);
    }

    function actualizarEventosVisuales(render = true) {
        // Limpia todos los eventos visuales previos
        calendar.getEvents().forEach(ev => {
            if (ev.extendedProps && ev.extendedProps.tipo === 'seleccionado') ev.remove();
        });
        if (!render) return;
        // Solo muestra los horarios seleccionados del especialista activo
        horariosSeleccionados.filter(h => h.idespecialista === selectedespecialista).forEach(h => {
            calendar.addEvent({
                title: `<span class='fc-slot-check'></span>
                        <span class='fc-slot-horario'>${h.horaIni} - ${h.horaFin}</span>`,
                start: h.fecha + 'T' + h.hora + ':00',
                end: h.fecha + 'T' + sumar30Minutos(h.hora) + ':00',
                display: 'background',
                classNames: ['fc-slot-custom-content'],
                extendedProps: { tipo: 'seleccionado' }
            });
        });
    }

    function refrescarCitas(idespecialista) {
        if (idespecialista != null && idespecialista !== '') {
            obtenerCitasEspecialista(idespecialista).then(function (citas) {
                citasGlobales = citas;
                procesarYMostrarCitas(citas);
            }).catch(e => console.log(e));
        } else {
            obtenerCitas().then(function (citas) {
                citasGlobales = citas;
                procesarYMostrarCitas(citas);
            }).catch(e => console.log(e));;
        }
    }

    function procesarYMostrarCitas(citas) {
        // Elimina eventos de citas anteriores
        calendar.getEvents().forEach(ev => {
            if (ev.extendedProps && ev.extendedProps.tipo === 'cita-existente') ev.remove();
        });

        // Agrupa las citas por fecha y hora
        const citasAgrupadas = agruparCitasPorHorario(citas);

        // Procesa cada grupo de citas
        Object.keys(citasAgrupadas).forEach(clave => {
            const gruposCitas = citasAgrupadas[clave];

            if (gruposCitas.length === 1) {
                // Una sola cita: mostrar normal
                addCitaEvent(gruposCitas[0]);
            } else {
                // Múltiples citas: mostrar como cuadrados
                addMultiplesCitasEvent(gruposCitas, clave);
            }
        });
    }

    function agruparCitasPorHorario(citas) {
        const grupos = {};

        citas.forEach(cita => {
            const clave = `${cita.fecha}_${cita.hora_inicio}_${cita.hora_fin}`;
            if (!grupos[clave]) {
                grupos[clave] = [];
            }
            grupos[clave].push(cita);
        });

        return grupos;
    }

    function addCitaEvent(cita) {
        const horaIni = formatearHora12h(cita.hora_inicio.slice(0, 5));
        const horaFin = formatearHora12h(cita.hora_fin.slice(0, 5));
        const nombreCompleto = `${cita.paciente_nombres} ${cita.paciente_apellidos}`;
        const estado = `cita-${estadosCita[cita.idestado]}`;

        calendar.addEvent({
            title: `
<div class="evento-contenedor">
  <div class="nombre-arriba"><strong>${nombreCompleto}</strong></div>
  <div class="svg-horario">
    <span class='mi-check-clase'>
      ${getSVGCita(estado)}
    </span>
    <span class="horario-agendado">Horario: ${horaIni} - ${horaFin}</span>
  </div>
</div>`,
            start: `${cita.fecha}T${cita.hora_inicio}`,
            end: `${cita.fecha}T${cita.hora_fin}`,
            classNames: ['fc-slot-custom-content', 'cita-agendada-evento', estado],
            extendedProps: {
                cita: cita,
                tipo: 'cita-existente',
                citaId: cita.id
            }
        });
    }

    function addMultiplesCitasEvent(citas, clave) {
        const primeraCita = citas[0];

        // Genera los cuadrados de colores
        const cuadrados = citas.map((cita, index) => {
            const estado = estadosCita[cita.idestado];
            const colorClass = getColorClassByEstado(estado);

            return `<div class="cita-cuadrado ${colorClass}" 
                     data-cita-id="${cita.idcita}">
                </div>`;
        }).join('');

        const contenidoHTML = `
    <div class="cuadrados-container">
        ${cuadrados}
    </div>`;

        calendar.addEvent({
            title: contenidoHTML,
            start: `${primeraCita.fecha}T${primeraCita.hora_inicio}`,
            end: `${primeraCita.fecha}T${primeraCita.hora_fin}`,
            classNames: ['fc-slot-custom-content', 'multiples-citas-evento'],
            extendedProps: {
                tipo: 'cita-existente',
                multiple: true,
                citas: citas
            }
        });
    }

    function getColorClassByEstado(estado) {
        const coloresEstado = {
            'pendiente': 'cuadrado-pendiente',
            'confirmada': 'cuadrado-confirmada',
            'completada': 'cuadrado-completada',
            'cancelada': 'cuadrado-cancelada',
            'no-asistio': 'cuadrado-no-asistio',
            'reprogramada': 'cuadrado-reprogramada'
        };

        return coloresEstado[estado] || 'cuadrado-default';
    }

    function actualizarBusinessHours() {
        if (!disponibilidadEspecialista || disponibilidadEspecialista.length === 0) {
            calendar.setOption('businessHours', [{
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                startTime: '00:00',
                endTime: '00:00'
            }]);
            resaltarBloqueoAlmuerzo();
            return;
        }
        const diasMap = {
            'lunes': 1,
            'martes': 2,
            'miércoles': 3,
            'jueves': 4,
            'viernes': 5,
            'sábado': 6
        };
        const bh = disponibilidadEspecialista.map(d => {
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

    function calcularDisponibilidadPorEspecialista(disponibilidades, citas) {
        const disponibilidadPorEspecialista = {};

        disponibilidades.forEach(d => {
            const id = d.idespecialista;
            const inicio = horaAHoraMinutos(d.horainicio);
            const fin = horaAHoraMinutos(d.horafin);
            const minutos = fin - inicio;

            if (!disponibilidadPorEspecialista[id]) {
                disponibilidadPorEspecialista[id] = { total: 0, ocupado: 0 };
            }

            disponibilidadPorEspecialista[id].total += minutos;
        });

        citas.forEach(c => {
            const id = c.idespecialista;
            if (!disponibilidadPorEspecialista[id]) return;

            const inicio = horaAHoraMinutos(c.hora_inicio);
            const fin = horaAHoraMinutos(c.hora_fin);
            const minutos = fin - inicio;

            disponibilidadPorEspecialista[id].ocupado += minutos;
        });

        const resultado = Object.entries(disponibilidadPorEspecialista).map(([id, tiempos]) => ({
            idespecialista: parseInt(id),
            minutos_disponibles: tiempos.total - tiempos.ocupado,
            minutos_ocupados: tiempos.ocupado,
            minutos_totales: tiempos.total
        }));

        resultado.sort((a, b) => b.minutos_disponibles - a.minutos_disponibles);

        return resultado;
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

    //Busqueda de pacientes
    $('#searchPaciente').on('keyup', function () {
        const query = $(this).val().trim();
        if (query.length < 2) {
            $('#resultadoPacientes').css('display', 'none').empty();
            return;
        }
        buscarPacientes(query);
    });

    function buscarPacientes(query = '') {
        return new Promise((resolve, reject) => {
            $.get(
                baseurl + `controllers/Pacientes/PacienteController.php?action=buscar&filtro=${encodeURIComponent(query)}`,
                function (data) {
                    let pacientes = Array.isArray(data) ? data : JSON.parse(data);
                    let html = '';

                    if (pacientes.length > 0) {
                        pacientes.forEach(p => {
                            html += `<div class="paciente-item" data-id="${p.idpaciente}">
                            <div class="paciente-nombre">
                                <strong>${p.nombres} ${p.apellidos}</strong>
                            </div>
                            <div class="paciente-detalles">
                                <span class="fecha-nac">${p.fecha_nacimiento}</span>
                                <span class="dni">DNI: ${p.dni}</span> 
                            </div>
                        </div>`;
                        });
                    } else {
                        html = '<div class="paciente-item">No se encontraron pacientes</div>';
                    }

                    $('#resultadoPacientes').html(html).css('display', 'flex');
                    resolve(pacientes);
                }
            ).fail(reject);
        });
    }

    $('#btnAbrirCalendario').on('click', function () {
        const calendarmodal = document.querySelector('.minicalendar-modal');
        if (calendarmodal.style.display === 'none') {
            calendarmodal.style.display = 'block';
            miniCalendar.render();
        } else {
            calendarmodal.style.display = 'none';
        }
    });

    // Mensaje flotante si no hay especialista seleccionado
    function mostrarMensajeFlotante(msg, exito = false) {
        let div = document.getElementById('mensajeFlotante');
        if (div) div.remove();
        div = document.createElement('div');
        div.id = 'mensajeFlotante';
        div.className = 'mensaje-alert';
        mensaje = document.createElement('div');
        mensaje.className = 'my-3 ' + (exito ? 'alert-success' : 'alert-danger');
        mensaje.textContent = msg;
        mensaje.style.padding = '12px 28px'
        div.appendChild(mensaje);
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
            style.innerHTML = `#mensajeFlotante { animation: fadeInOut 2.2s; } @keyframes fadeInOut { 0%{opacity:0;} 10%{opacity:1;} 90%{opacity:1;} 100%{opacity:0;} }`;
            document.head.appendChild(style);
        }
    })();

});

// Función para formatear hora a hh:mm a
function formatearHora12h(hora24) {
    if (!hora24) return '';
    let [h, m] = hora24.split(':');
    h = parseInt(h);
    let suf = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${m} ${suf}`;
}

// Sumar 30 minutos a una hora en formato hh:mm
function sumar30Minutos(hora) {
    let [h, m] = hora.split(':').map(Number);
    let date = new Date(2000, 0, 1, h, m);
    date.setMinutes(date.getMinutes() + 30);
    let nh = date.getHours().toString().padStart(2, '0');
    let nm = date.getMinutes().toString().padStart(2, '0');
    return `${nh}:${nm}`;
}

// Personaliza el renderizado de los eventos para permitir HTML en el título
calendar.setOption('eventContent', function (arg) {
    if (arg.event.classNames.includes('fc-slot-custom-content')) {
        return { html: arg.event.title };
    }
    // ...otros casos si es necesario...
});