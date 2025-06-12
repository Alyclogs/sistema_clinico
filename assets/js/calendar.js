const calendarEl = document.getElementById('calendar');
const baseurl = "http://localhost/SistemaClinico/";
var selectedservicio = "1";
var selectedarea = "";
var selectedsubarea = "";
var selectedespecialista = "";
let lastEspecialista = null;
let horariosPorEspecialista = {};
let horariosSeleccionados = [];
let servicioDuracion = 30;   // valor por defecto
let subareaDuracion = 30;
let servicioSeleccionado = 'CONSULTA';
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
    slotMaxTime: '18:00:00',
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
    obtenerServicios();
    refrescarCitas();
    //refrescarCitas(false);

    updateCalendarDateRange(calendar);
    resaltarBloqueoAlmuerzo();
    calendar.render();

    calendar.on('datesSet', function () {
        updateCalendarDateRange(calendar);
        actualizarBusinessHours();
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
                        html += `<option value="${subarea.idsubarea}" data-duracion="${subarea.duracion}">${subarea.subarea}</option>`;
                    });
                } else {
                    html += `<option value="${subarea.idsubarea}" data-duracion="${subarea.duracion}">${subarea.subarea}</option>`;
                }
                $("#filtro-subarea").prop("disabled", false);
                $("#filtro-subarea").append(html);
            }
        }).fail(function (xhr, status, error) {
            console.log(error);
            mostrarMensajeFlotante('Error al buscar subáreas');
        });
    }

    function buscarEspecialistas() {
        $("#filtro-especialista")
            .empty()
            .append('<option value="" disabled selected>Seleccionar</option>')
            .prop("disabled", true);

        $.get(baseurl + `controllers/Especialistas/EspecialistaController.php?action=read&idarea=${selectedarea}&idservicio=${selectedservicio}${selectedsubarea ? `&idsubarea=${selectedsubarea}` : ''}`, function (data) {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            const especialistas = Array.isArray(parsedData) ? parsedData : [parsedData];

            if (especialistas.length === 0) {
                mostrarMensajeFlotante('No hay especialistas');
            }
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
                    return obtenerCitas(especialista.idespecialista).then(citas => {
                        const resultados = calcularDisponibilidadPorEspecialista(disponibilidad, citas);
                        return resultados.map(r => ({
                            ...r,
                            nombre: `${especialista.nom_especialista} ${especialista.ape_especialista}`
                        }));
                    }).catch(e => console.log('Error al buscar citas: ', e));
                }).catch(e => console.log('Error al obtener disponibilidad especialista: ', e));
            })

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

                let html = '';
                todos.forEach(e => {
                    html += `<option value="${e.idespecialista}">${e.nombre}</option>`;
                });

                $("#filtro-especialista")
                    .html('<option value="" disabled selected>Seleccionar</option>' + html)
                    .prop("disabled", false);
            }).catch(e => {
                console.log(e);
                mostrarMensajeFlotante('Error al buscar especialistas');
            });
        }).fail(function (xhr, status, error) {
            console.log(error, xhr.responseText);
            mostrarMensajeFlotante('Error al buscar especialistas');
        });
    }

    $('#filtro-servicio').change(function () {
        $(this).removeClass('filtro-not-selected');
        $("#filtro-area").val("");
        $("#filtro-subarea").val("");
        $("#filtro-especialista").val("");
        selectedarea = '';
        selectedsubarea = '';
        selectedespecialista = '';
        subareaDuracion = 0;
        const val = $(this).val().trim();
        const servicio = $(this).find('option:selected').text().trim();
        servicioDuracion = parseInt(
            $(this).find('option:selected').data('duracion'),
            10
        ) || 30;

        if (val) selectedservicio = val;
        if (servicio) servicioSeleccionado = servicio;
        if (servicio === 'EVALUACION') {
            $("#filtro-subarea").hide();
            $("#filtro-subarea-title").hide();
        } else {
            $("#filtro-subarea").show();
            $("#filtro-subarea-title").show();
        }
        actualizarEventosVisuales(true);
        refrescarCitas();
    });

    $("#filtro-area").change(function () {
        $(this).removeClass('filtro-not-selected');
        $("#filtro-subarea").val("");
        $("#filtro-especialista").val("");
        selectedsubarea = '';
        selectedespecialista = '';
        especialistaSeleccionado = '';
        //subareaDuracion = 30;
        selectedarea = $(this).val();
        buscarSubareaPorArea(selectedarea);
        if (servicioSeleccionado === 'EVALUACION') buscarEspecialistas();
        actualizarEventosVisuales();
        refrescarCitas();
    });

    $("#filtro-subarea").change(function () {
        $(this).removeClass('filtro-not-selected');
        $("#filtro-especialista").val("");
        selectedespecialista = '';
        selectedsubarea = $(this).val();
        subareaDuracion = parseInt(
            $(this).find('option:selected').data('duracion'),
            10
        ) || 30;
        buscarEspecialistas();
        actualizarEventosVisuales();
        refrescarCitas();
    })

    //Cambio de horario segun la disponibilidad del especialista
    $("#filtro-especialista").change(function () {
        $(this).removeClass('filtro-not-selected');
        selectedespecialista = $(this).val();
        especialistaSeleccionado = $(this).find('option:selected').text();
        if (selectedespecialista) {
            //selectedservicio = '';
            selectedarea = '';
            selectedsubarea = '';
            servicioSeleccionado = '';
            actualizarDisponibilidadEspecialista();
            refrescarCitas();
            actualizarEventosVisuales(true);
            lastEspecialista = selectedespecialista;
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
        // 0) Calcular datos básicos
        const durMin = subareaDuracion || servicioDuracion || 30;
        const startDate = info.start;
        const pad = n => String(n).padStart(2, '0');
        const fecha = startDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
        const horaInicioRaw = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
        const horaFinRaw = (() => {
            const end = new Date(startDate.getTime() + durMin * 60000);
            return `${pad(end.getHours())}:${pad(end.getMinutes())}`;
        })();

        // 1) Si ya existe ese bloque, lo removemos:
        const idxExist = horariosSeleccionados.findIndex(h =>
            h.idespecialista === selectedespecialista &&
            h.fecha === fecha &&
            h.horaInicioRaw === horaInicioRaw
        );
        if (idxExist >= 0) {
            eliminarHorario(idxExist);
            return;
        }

        // 2) Validar que hay especialista
        if (!selectedespecialista) {
            mostrarMensajeFlotante('Debe seleccionar un especialista primero');
            return;
        }

        // 3) Día de la semana y disponibilidad
        const diaSemana = startDate
            .toLocaleDateString('es-ES', { weekday: 'long' })
            .toLowerCase();

        // 3.1) Bloqueos totales
        if (disponibilidadEspecialista.some(d =>
            d.es_excepcion &&
            d.estado === 'sin disponibilidad' &&
            d.dia === diaSemana &&
            fecha >= d.fechainicio &&
            fecha <= d.fechafin
        )) {
            mostrarMensajeFlotante('Este día no tiene disponibilidad');
            return;
        }

        // 3.2) Excepciones de cambio
        const excepciones = disponibilidadEspecialista.filter(d =>
            d.es_excepcion &&
            d.estado === 'cambio de horario' &&
            d.dia === diaSemana &&
            fecha >= d.fechainicio &&
            fecha <= d.fechafin
        );

        // 3.3) Candidatos (excepción o regular)
        const candidatos = excepciones.length
            ? excepciones
            : disponibilidadEspecialista.filter(d =>
                !d.es_excepcion &&
                d.dia === diaSemana &&
                fecha >= d.fechainicio &&
                fecha <= d.fechafin
            );

        // 4) Validar que [horaInicioRaw, horaFinRaw) quepa en alguno
        let disponible = false;
        candidatos.forEach(d => {
            const labIni = d.horainicio.slice(0, 5);
            const labFin = d.horafin.slice(0, 5);
            const refIni = d.refrigerio_horainicio.slice(0, 5);
            const refFin = d.refrigerio_horafin.slice(0, 5);

            if (
                horaInicioRaw >= labIni &&
                horaFinRaw <= labFin &&
                !(horaInicioRaw < refFin && horaFinRaw > refIni)
            ) {
                disponible = true;
            }
        });

        if (!disponible) {
            mostrarMensajeFlotante('Horario fuera de disponibilidad');
            return;
        }

        // 5) Agregar nuevo bloque al array
        horariosSeleccionados.push({
            fecha,
            horaInicioRaw,
            horaFinRaw,
            horaIni: formatearHora12h(horaInicioRaw),
            horaFin: formatearHora12h(horaFinRaw),
            idespecialista: selectedespecialista,
            idservicio: selectedservicio,
            especialistaSeleccionado,
        });

        // 6) Refrescar UI
        renderHorariosSeleccionados();
        actualizarEventosVisuales();
        //refrescarCitas();
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
            const btn = e.target.closest('.btn-editar-horario');
            if (!btn) return;
            const idx = parseInt(btn.dataset.idx, 10);
            const h = horariosSeleccionados[idx];
            const durMin = subareaDuracion || servicioDuracion || 30;

            // ——— GUARDAR CAMBIOS ———
            if (idxEditando === idx) {
                const fechaVal = document.getElementById('nuevoHorarioFecha').value;
                const horaVal = document.getElementById('nuevoHorarioHora').value;
                if (!fechaVal || !horaVal) {
                    mostrarMensajeFlotante('Ingrese fecha y hora válidas');
                    return;
                }

                // Construir rangos seleccionados
                const selStart = buildDate(fechaVal, horaVal);
                const selEnd = new Date(selStart.getTime() + durMin * 60000);

                // Día de la semana
                const diaSemana = selStart
                    .toLocaleDateString('es-ES', { weekday: 'long' })
                    .toLowerCase();

                // Filtrar disponibilidad aplicable
                const disponibles = disponibilidadEspecialista
                    .filter(d =>
                        d.dia === diaSemana &&
                        fechaVal >= d.fechainicio &&
                        fechaVal <= d.fechafin
                    )
                    .filter(d => {
                        if (d.es_excepcion) {
                            if (d.estado === 'sin disponibilidad') return false;
                            if (d.estado === 'cambio de horario') return true;
                        }
                        return true; // los regulares
                    });

                // Validar encaje dentro de jornada y no sobre almuerzo
                let ok = disponibles.some(d => {
                    const workStart = buildDate(fechaVal, d.horainicio.slice(0, 5));
                    const workEnd = buildDate(fechaVal, d.horafin.slice(0, 5));
                    const lunchStart = buildDate(fechaVal, d.refrigerio_horainicio.slice(0, 5));
                    const lunchEnd = buildDate(fechaVal, d.refrigerio_horafin.slice(0, 5));
                    return (
                        selStart >= workStart &&
                        selEnd <= workEnd &&
                        !(selStart < lunchEnd && selEnd > lunchStart)
                    );
                });

                if (!ok) {
                    mostrarMensajeFlotante('Horario fuera de disponibilidad');
                    return;
                }

                // Verificar choque con citas
                obtenerCitas(selectedservicio, h.idespecialista, selectedarea, selectedsubarea)
                    .then(citas => {
                        if (citas.some(c => c.fecha === fechaVal && c.hora_inicio === horaVal)) {
                            mostrarMensajeFlotante('Este horario ya está reservado');
                            throw 'ocupado';
                        }
                        // Actualizar el array
                        h.fecha = fechaVal;
                        h.horaInicioRaw = horaVal;
                        h.horaFinRaw = selEnd.toTimeString().slice(0, 5);
                        h.horaIni = formatearHora12h(horaVal);
                        h.horaFin = formatearHora12h(h.horaFinRaw);

                        // Salir de edición y refrescar
                        idxEditando = null;
                        renderHorariosSeleccionados();
                        actualizarEventosVisuales();
                        refrescarCitas();
                    })
                    .catch(err => {
                        if (err !== 'ocupado') console.error(err);
                    });

                return;
            }

            // ——— INICIAR EDICIÓN ———
            idxEditando = idx;
            renderHorariosSeleccionados();

            // Selecciona el formulario base oculto
            const editarOriginal = document.querySelector('.agregar-horario');
            const editarDiv = editarOriginal.cloneNode(true);
            editarDiv.style.display = 'flex';

            // Asegúrate de quitar otros formularios del chip
            const chip = document.querySelector(`.horario-chip[data-idx="${idx}"]`);
            chip.querySelector('.agregar-horario')?.remove();
            chip.appendChild(editarDiv);

            // Prefill con los valores existentes
            document.getElementById('nuevoHorarioFecha').value = h.fecha;
            document.getElementById('nuevoHorarioHora').value = h.horaInicioRaw;
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
                $('.paciente-nombre').text(`${pacienteActual.nombres} ${pacienteActual.apellidos} `);
                $('.pacientesel-dni').text(`DNI: ${pacienteActual.dni} `);
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
            window.location.href = baseurl + `views / Clinica / pagos / index.php ? filtro = ${dni} `
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
            const horaInicio = h.horaInicioRaw;
            const horaFin = h.horaFinRaw;
            const fecha = h.fecha;

            const data = {
                idregistrador: idUsuario,
                idpaciente: idPaciente,
                idespecialista: h.idespecialista,
                hora_inicio: horaInicio,
                hora_fin: horaFin,
                fecha: fecha,
                idestado: idestado,
                idservicio: h.idservicio
            };
            $.post(baseurl + 'controllers/Citas/CitasController.php?action=create', { data: JSON.stringify(data) }, function (response) {
                if (response.success) {
                    horariosSeleccionados = [];
                    renderHorariosSeleccionados();
                    refrescarCitas();
                    actualizarEventosVisuales();
                } else {
                    mostrarMensajeFlotante('Error al agendar la cita: ' + response.error + '\n' + response.message);
                }
            }, 'json')
                .fail(function (xhr, status, error) {
                    console.log(error);
                    mostrarMensajeFlotante('Error al agendar cita: ' + xhr.responseText);
                });
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
                            //$('.avatar-iniciales').css('background-color', stringToColor(`${ formDataObj['nombres'] } ${ formDataObj['apellidos'] } `));
                            buscarPacientes(formDataObj['dni']).then(pacientes => {
                                const pacienteActual = pacientes[0];
                                const edad = calcularEdad(pacienteActual.fecha_nacimiento);

                                //$('.avatar-iniciales').text(getInitials(nombreCompleto.split(' ')[0], nombreCompleto.split(' ')[1]));
                                //$('.avatar-iniciales').css('background-color', stringToColor(nombreCompleto));
                                $('.paciente-cita').attr('data-id', response.paciente_id);
                                $('#pacienteSelFoto').attr('src', pacienteActual.foto);
                                $('.paciente-nombre').text(`${pacienteActual.nombres} ${pacienteActual.apellidos} `);
                                $('.pacientesel-dni').text(`DNI: ${pacienteActual.dni} `);
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
        actualizarEventosVisuales();
    };

    function obtenerServicios() {
        $.get(baseurl + 'controllers/Servicios/ServicioController.php?action=read', function (data) {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            let html = '';
            parsed.forEach(s => {
                html += `<option value="${s.idservicio}" data-duracion="${s.duracion}">${s.servicio}</option>`;
            });
            $('#filtro-servicio')
                .empty()
                .append(html)
                .prop('disabled', false);
        }).fail(function (xhr, status, error) {
            console.log(error);
            mostrarMensajeFlotante('Error al obtener servicios');
        });
    }

    function obtenerDisponibilidadEspecialista(idespecialista) {
        return $.get(baseurl + `controllers/Disponibilidad/DisponibilidadController.php?action=read&idespecialista=${idespecialista}`);
    }

    function obtenerCitas(idservicio, idespecialista, idarea, idsubarea) {
        const params = new URLSearchParams({ action: 'read' });

        if (idservicio) params.append('idservicio', idservicio);
        if (idespecialista) params.append('idespecialista', idespecialista);
        if (idarea) params.append('idarea', idarea);
        if (idsubarea) params.append('idsubarea', idsubarea);

        const url = baseurl + 'controllers/Citas/CitasController.php?' + params.toString();
        console.log(url);
        return $.get(url);
    }

    // ——— 2) actualizarEventosVisuales: usa horaInicioRaw / horaFinRaw ———
    function actualizarEventosVisuales(render = true) {
        // 1) Limpia sólo los eventos del tipo 'seleccionado'
        calendar.getEvents().forEach(ev => {
            if (ev.extendedProps && ev.extendedProps.tipo === 'seleccionado') {
                ev.remove();
            }
        });
        if (!render) return;

        // 2) Añade cada bloque con su horaInicioRaw/horaFinRaw exacta
        horariosSeleccionados
            .filter(h => h.idespecialista === selectedespecialista)
            .forEach(h => {
                calendar.addEvent({
                    title: `<span class="fc-slot-horario">${h.horaIni} - ${h.horaFin}</span>`,
                    start: `${h.fecha}T${h.horaInicioRaw}`,
                    end: `${h.fecha}T${h.horaFinRaw}`,
                    display: 'background',
                    classNames: ['fc-slot-custom-content'],
                    extendedProps: { tipo: 'seleccionado' }
                });
            });
    }

    function refrescarCitas(idservicio, idespecialista, idarea, idsubarea) {
        // 2) Llamar con los cuatro parámetros en orden
        obtenerCitas((idespecialista || selectedespecialista ? null : idservicio ?? selectedservicio), idespecialista ?? selectedespecialista, idarea ?? selectedarea, idsubarea ?? selectedsubarea)
            .then(function (citas) {
                citasGlobales = citas;
                procesarYMostrarCitas(citas);
            })
            .catch((e) => {
                console.log(e);
                mostrarMensajeFlotante("Error al cargar citas");
            });
    }

    function procesarYMostrarCitas(citas) {
        // 1) Eliminar citas previas
        calendar.getEvents().forEach(ev => {
            if (ev.extendedProps?.tipo === 'cita-existente') {
                ev.remove();
            }
        });
        // 2) Agrupar
        const citasAgrupadas = agruparCitasPorHorario(citas);
        // 3) Añadir
        Object.values(citasAgrupadas).forEach(grupo => {
            if (grupo.length === 1) {
                addCitaEvent(grupo[0]);
            } else {
                addMultiplesCitasEvent(grupo);
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
        const pad = n => String(n).padStart(2, '0');
        // recortamos a HH:mm
        const horaIniRaw = cita.hora_inicio.slice(0, 5);
        const horaFinRaw = cita.hora_fin.slice(0, 5);

        const horaIni = formatearHora12h(horaIniRaw);
        const horaFin = formatearHora12h(horaFinRaw);
        const nombre = `${cita.especialista_nombre} ${cita.especialista_apellidos}`;
        const cssEstado = `cita-${estadosCita[cita.idestado]}`;

        calendar.addEvent({
            title: `<div class="evento-contenedor">
        <div class="nombre-arriba"><strong>${nombre}</strong></div>
        <div class="svg-horario">
          <span class='mi-check-clase'>${getSVGCita(cssEstado)}</span>
          <span class="horario-agendado">${horaIni} - ${horaFin}</span>
        </div>
      </div>`,
            start: `${cita.fecha}T${horaIniRaw}`,
            end: `${cita.fecha}T${horaFinRaw}`,
            // NO background para que se muestre como evento normal
            classNames: ['fc-slot-custom-content', 'cita-agendada-evento', cssEstado],
            extendedProps: {
                cita: cita,
                tipo: 'cita-existente',
                citaId: cita.id
            }
        });
    }

    function addMultiplesCitasEvent(citas) {
        const primera = citas[0];
        const pad = n => String(n).padStart(2, '0');
        const ini = primera.hora_inicio.slice(0, 5);
        const fin = primera.hora_fin.slice(0, 5);

        const cuadrados = citas.map(cita => {
            const estado = estadosCita[cita.idestado];
            return `<div class="cita-cuadrado ${getColorClassByEstado(estado)}"></div>`;
        }).join('');

        const contenido = `<div class="cuadrados-container">${cuadrados}</div>`;

        calendar.addEvent({
            title: contenido,
            start: `${primera.fecha}T${ini}`,
            end: `${primera.fecha}T${fin}`,
            classNames: ['fc-slot-custom-content', 'multiples-citas-evento'],
            extendedProps: { tipo: 'cita-existente', multiple: true }
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

    // Helpers de fechas
    function dateStrToDate(str) {
        return new Date(str + 'T00:00:00');
    }
    function dateToDateStr(date) {
        return date.toISOString().slice(0, 10);
    }
    function dayBefore(str) {
        const d = dateStrToDate(str);
        d.setDate(d.getDate() - 1);
        return dateToDateStr(d);
    }
    function dayAfter(str) {
        const d = dateStrToDate(str);
        d.setDate(d.getDate() + 1);
        return dateToDateStr(d);
    }
    function buildDate(fechaStr, horaStr) {
        return new Date(`${fechaStr}T${horaStr}:00`);
    }

    // 1. Carga y normalización de la disponibilidad
    function actualizarDisponibilidadEspecialista() {
        obtenerDisponibilidadEspecialista(selectedespecialista)
            .then(data => {
                disponibilidadEspecialista = data.map(d => ({
                    ...d,
                    es_excepcion: d.es_excepcion === '1',
                    estado: d.estado ? d.estado.trim().toLowerCase() : null,
                    dia: d.dia.toLowerCase()
                }));
                actualizarBusinessHours();
                if (!disponibilidadEspecialista.length) {
                    mostrarMensajeFlotante("Especialista sin disponibilidad");
                }
            });
    }

    function actualizarBusinessHours() {
        const diasMap = {
            domingo: 0, lunes: 1, martes: 2, miércoles: 3,
            jueves: 4, viernes: 5, sábado: 6
        };
        const bh = [];

        // 1. Separar registros
        const regulares = disponibilidadEspecialista.filter(d => !d.es_excepcion);
        const cambios = disponibilidadEspecialista.filter(d => d.es_excepcion && d.estado === 'cambio de horario');
        const bloqueosTotales = disponibilidadEspecialista.filter(d => d.es_excepcion && d.estado === 'sin disponibilidad');

        // 2. Agrupar excepciones por día
        const bloqueosPorDia = {};
        bloqueosTotales.forEach(d => {
            (bloqueosPorDia[d.dia] = bloqueosPorDia[d.dia] || []).push(d);
        });
        const cambiosPorDia = {};
        cambios.forEach(d => {
            (cambiosPorDia[d.dia] = cambiosPorDia[d.dia] || []).push(d);
        });

        // 3. Construir franjas “regulares” descontando ambos tipos de excepción
        regulares.forEach(d => {
            let segmentos = [{ start: d.fechainicio, end: d.fechafin }];

            // restar bloqueos totales
            (bloqueosPorDia[d.dia] || []).forEach(exc => {
                segmentos = segmentos.flatMap(seg => recortarSegmento(seg, exc.fechainicio, exc.fechafin));
            });

            // restar cambios de horario
            (cambiosPorDia[d.dia] || []).forEach(exc => {
                segmentos = segmentos.flatMap(seg => recortarSegmento(seg, exc.fechainicio, exc.fechafin));
            });

            // añadir cada segmento resultante
            segmentos.forEach(seg => {
                bh.push({
                    daysOfWeek: [diasMap[d.dia]],
                    startTime: d.horainicio.slice(0, 5),
                    endTime: d.horafin.slice(0, 5),
                    startRecur: seg.start,
                    endRecur: seg.end
                });
            });
        });

        // 4. Añadir las franjas de cambio de horario tal cual
        cambios.forEach(d => {
            bh.push({
                daysOfWeek: [diasMap[d.dia]],
                startTime: d.horainicio.slice(0, 5),
                endTime: d.horafin.slice(0, 5),
                startRecur: d.fechainicio,
                endRecur: d.fechafin
            });
        });

        // 5. Aplicar y refrescar almuerzo
        calendar.setOption("businessHours", bh.length ? bh : {
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            startTime: '00:00',
            endTime: '00:00'
        });
        resaltarBloqueoAlmuerzo();
    }

    // Función helper para recortar un segmento {start,end} con un intervalo [a,b]
    function recortarSegmento(seg, a, b) {
        if (seg.end < a || seg.start > b) {
            // no solapan
            return [seg];
        }
        const out = [];
        if (seg.start < a) {
            out.push({ start: seg.start, end: dayBefore(a) });
        }
        if (seg.end > b) {
            out.push({ start: dayAfter(b), end: seg.end });
        }
        return out;
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

    // 3. Generación de “bloqueos” de refrigerio
    function generarEventosRefrigerio() {
        const eventos = [];
        const viewStart = calendar.view.activeStart;
        const viewEnd = calendar.view.activeEnd;

        // 1) Recolectar fechas con bloqueo total para ese día de la semana
        const fechasBloqueadas = new Set();
        disponibilidadEspecialista
            .filter(d => d.es_excepcion && d.estado === 'sin disponibilidad')
            .forEach(d => {
                const inicio = dateStrToDate(d.fechainicio);
                const fin = dateStrToDate(d.fechafin);
                let fecha = new Date(inicio);
                while (fecha <= fin) {
                    const diaName = fecha
                        .toLocaleDateString('es-ES', { weekday: 'long' })
                        .toLowerCase();
                    if (diaName === d.dia) {
                        fechasBloqueadas.add(dateToDateStr(fecha));
                    }
                    fecha.setDate(fecha.getDate() + 1);
                }
            });

        // 2) Generar el sombreado de refrigerio
        disponibilidadEspecialista.forEach(d => {
            if (!d.refrigerio_horainicio || !d.refrigerio_horafin) return;

            // convertir rangos de fecha
            const inicio = dateStrToDate(d.fechainicio);
            const fin = dateStrToDate(d.fechafin);
            let fecha = new Date(viewStart);

            // recortar tiempo a HH:mm
            const reIni = d.refrigerio_horainicio.slice(0, 5);
            const reFin = d.refrigerio_horafin.slice(0, 5);

            while (fecha <= viewEnd) {
                const diaName = fecha
                    .toLocaleDateString('es-ES', { weekday: 'long' })
                    .toLowerCase();
                const fechaStr = dateToDateStr(fecha);

                if (
                    diaName === d.dia &&
                    fecha >= inicio && fecha <= fin &&
                    !fechasBloqueadas.has(fechaStr) &&
                    // asegurarnos que el refrigerio está dentro de la jornada
                    reIni >= d.horainicio.slice(0, 5) &&
                    reFin <= d.horafin.slice(0, 5)
                ) {
                    eventos.push({
                        start: `${fechaStr}T${reIni}`,
                        end: `${fechaStr}T${reFin}`,
                        display: 'background',
                        classNames: ['fc-blocked-almuerzo']
                    });
                }
                fecha.setDate(fecha.getDate() + 1);
            }
        });

        return eventos;
    }

    function resaltarBloqueoAlmuerzo() {
        // eliminar previos
        calendar.getEvents().forEach(e => {
            if (e.extendedProps?.tipo === 'almuerzo') {
                e.remove();
            }
        });
        // añadir nuevos
        generarEventosRefrigerio().forEach(ev => {
            calendar.addEvent({
                ...ev,
                extendedProps: { tipo: 'almuerzo' }
            });
        });
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
                        </div> `;
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
        mensaje.className = 'my-3 alert ' + (exito ? 'alert-success' : 'alert-danger');
        mensaje.textContent = msg;
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
            style.innerHTML = `#mensajeFlotante { animation: fadeInOut 2.2s; } @keyframes fadeInOut { 0 % { opacity: 0; } 10 % { opacity: 1; } 90 % { opacity: 1; } 100 % { opacity: 0; } } `;
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
    return `${h.toString().padStart(2, '0')}:${m} ${suf} `;
}

// Sumar 30 minutos a una hora en formato hh:mm
function sumarMinutos(hora, minutos) {
    let [h, m] = hora.split(':').map(Number);
    let date = new Date(2000, 0, 1, h, m);
    date.setMinutes(date.getMinutes() + minutos);
    let nh = date.getHours().toString().padStart(2, '0');
    let nm = date.getMinutes().toString().padStart(2, '0');
    return `${nh}:${nm} `;
}

// Personaliza el renderizado de los eventos para permitir HTML en el título
calendar.setOption('eventContent', function (arg) {
    if (arg.event.classNames.includes('fc-slot-custom-content')) {
        return { html: arg.event.title };
    }
    // ...otros casos si es necesario...
});     