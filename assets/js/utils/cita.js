import { formatearHora12h } from "./date.js";

export const estadosCita = { '3': 'pendiente', '4': 'cancelado', '5': 'anulado' }

export function procesarYMostrarCitas(calendar, citas, idespecialista = '') {
    // 1) Remover eventos previos
    calendar.removeEvents('cita-existente');

    // 2) Agrupar citas con la nueva función que tiene en cuenta solapamientos
    const citasAgrupadas = agruparCitasPorHorario(citas);

    // 3) Añadir citas segun vista
    if (idespecialista === '') {
        // 1) Añadir citas agrupadas
        Object.values(citasAgrupadas).forEach((grupo) => {
            if (grupo.length === 1) {
                addCitaGeneralEvent(calendar, grupo[0]);
            } else {
                addMultiplesCitasEvent(calendar, grupo);
            }
        });
    } else {
        // 2) Añadir citas individuales
        citas.forEach(cita => {
            addCitaEvent(calendar, cita);
        });
    }
    return calendar.calendar.getEvents();
}

function agruparCitasPorHorario(citas) {
    const grupos = {};

    citas.forEach(cita => {
        // Agrupar citas por fecha y hora de inicio
        const clave = `${cita.fecha}_${cita.hora_inicio}`;
        if (!grupos[clave]) {
            grupos[clave] = [];
        }
        grupos[clave].push(cita);
    });

    return grupos;
}

function addCitaEvent(calendar, cita) {
    const pad = n => String(n).padStart(2, '0');
    // recortamos a HH:mm
    const horaIniRaw = cita.hora_inicio.slice(0, 5);
    const horaFinRaw = cita.hora_fin.slice(0, 5);

    const horaIni = formatearHora12h(horaIniRaw);
    const horaFin = formatearHora12h(horaFinRaw);
    const nombre = `${cita.paciente_nombres} ${cita.paciente_apellidos}`;
    const cssEstado = `cita-${estadosCita[cita.idestado]}`;

    calendar.addEvent({
        title: `<div class="evento-contenedor">
        <span>${getSVGCita(cssEstado, 'big')}</span>
        <div class="cita-evento-datos">
        <div class="nombre-arriba"><strong>${nombre}</strong></div>
        <span class="horario-agendado">${horaIni} - ${horaFin}</span>
      </div></div>`,
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

function addCitaGeneralEvent(calendar, cita) {
    const horaIniRaw = cita.hora_inicio.slice(0, 5);
    const horaFinRaw = cita.hora_fin.slice(0, 5);
    //const cssEstado = `cita-${estadosCita[cita.idestado]}`;

    // Crear el avatar para una cita individual
    const avatar = crearImagenEspecialista(cita);

    // Colocar el avatar dentro del título
    const titleWithAvatar = avatar.outerHTML;

    calendar.addEvent({
        title: titleWithAvatar,
        start: `${cita.fecha}T${horaIniRaw}`,
        end: `${cita.fecha}T${horaFinRaw}`,
        classNames: ['fc-slot-custom-content', 'cita-agendada-evento'],
        extendedProps: {
            cita: cita,
            tipo: 'cita-existente',
            citaId: cita.idcita
        }
    });
}

function addMultiplesCitasEvent(calendar, citas) {
    // Obtener la primera cita para usar su hora de inicio y fin
    const primera = citas[0];
    const ini = primera.hora_inicio.slice(0, 5);
    const fin = primera.hora_fin.slice(0, 5);

    // Crear un stack con todos los avatares de las citas (tanto 30 min como 60 min)
    const stack = crearStackAvatares(citas);

    // Crear un solo evento para todas las citas agrupadas
    calendar.addEvent({
        title: stack.outerHTML,
        start: `${primera.fecha}T${ini}`,
        end: `${primera.fecha}T${fin}`,
        classNames: ["fc-slot-custom-content", "multiples-citas-evento"],
        extendedProps: {
            tipo: "cita-existente",
            multiple: true,
            citas: citas,
        },
    });
}

function getSVGPendiente(size = "small") {
    if (size === "small") return `
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

    else return `<svg id="agenda_especialista" data-name="agenda especialista" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.88 21.88" style="width: 20px; height: 20px;">
  <defs>
    <style>
      .cls-01 {
        fill: #fff;
      }

      .cls-02 {
        fill: #f07e0b;
        fill-rule: evenodd;
      }
    </style>
  </defs>
  <path class="cls-02" d="M10.94,0c6.04,0,10.94,4.9,10.94,10.94s-4.9,10.94-10.94,10.94S0,16.98,0,10.94,4.9,0,10.94,0"/>
  <path class="cls-01" d="M15.34,16.37c-.22,0-.44-.09-.59-.24l-4.6-4.6c-.16-.16-.24-.37-.24-.59v-6.69c0-.46.37-.84.84-.84s.84.37.84.84v6.35l4.36,4.35c.33.33.33.85,0,1.18,0,0,0,0,0,0-.16.16-.37.24-.59.24Z"/>
</svg>`
}

function getSVGAnulado(size = 'small') {
    if (size === "small") return `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="11.15px"
     height="11.15px" viewBox="0 0 11.15 11.15" style="overflow:visible;enable-background:new 0 0 11.15 11.15;" xml:space="preserve">
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

    return `
<svg id="AGENDA" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11" style="width: 20px; height: 20px;">
  <defs>
    <style>
      .cls-1 {
        fill: none;
        stroke: #e5252a;
        stroke-linecap: round;
        stroke-miterlimit: 10;
      }
    </style>
  </defs>
  <g id="g327">
    <path id="path329" class="cls-1" d="M10.5,5.5c0,2.76-2.24,5-5,5S.5,8.26.5,5.5,2.74.5,5.5.5s5,2.24,5,5Z"/>
  </g>
  <g id="g331">
    <path id="path333" class="cls-1" d="M4.2,6.8l2.61-2.61"/>
  </g>
  <g id="g335">
    <path id="path337" class="cls-1" d="M6.8,6.8l-2.61-2.61"/>
  </g>
</svg>`;
}

const getSVGcancelado = (size = "small") => {
    if (size === "small") return `
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
    else return `
<svg id="agenda_especialista" data-name="agenda especialista" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.15 21.15" style="width: 20px; height: 20px;">
  <defs>
    <style>
      .cls-11 {
        fill: #48b02c;
      }

      .cls-11, .cls-12 {
        fill-rule: evenodd;
      }

      .cls-12 {
        fill: #fff;
      }
    </style>
  </defs>
  <path class="cls-11" d="M10.57,0c5.84,0,10.57,4.73,10.57,10.57s-4.73,10.57-10.57,10.57S0,16.41,0,10.57,4.73,0,10.57,0"/>
  <path class="cls-12" d="M7.23,15.73l-3.84-4.11c-.42-.45-.54-1.12-.24-1.65.49-.89,1.65-.98,2.28-.3l2.98,3.19,4.72-4.41s.09-.08.13-.11l2.19-2.05c.45-.42,1.12-.54,1.65-.24.89.49.98,1.65.3,2.28l-6.78,6.34h0s-2.35,2.18-2.35,2.18l-1.04-1.11Z"/>
</svg>
`;
}

export const getSVGCita = (estado, size = 'small') => {
    switch (estado) {
        case 'cita-pendiente':
            return getSVGPendiente(size);
        case 'cita-cancelado':
            return getSVGcancelado(size);
        case 'cita-anulado':
            return getSVGAnulado(size);
        case 'cita-asistio':
            return getSVGcancelado(size);
        case 'cita-no-asistio':
            return getSVGAnulado(size);
        default:
            return '';
    }
}

export function ocultarTooltip() {
    document.querySelectorAll('.custom-tooltip-cita').forEach(el => el.remove());
}

export function mostrarTooltipCita(cita, targetElement) {
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

function crearStackAvatares(citas, maxVisible = 4) {
    const stack = document.createElement('div');
    stack.className = 'avatar-stack';

    citas.slice(0, maxVisible).forEach(cita => {
        const img = crearImagenEspecialista(cita);
        stack.appendChild(img);
    });

    const extraCount = citas.length - maxVisible;
    if (extraCount > 0) {
        const extra = document.createElement('div');
        extra.className = 'avatar extra';
        extra.textContent = `+${extraCount}`;
        stack.appendChild(extra);
    }
    return stack;
}

function crearImagenEspecialista(cita) {
    const img = document.createElement('img');
    img.src = cita.especialista_foto;
    img.className = 'avatar';
    img.dataset.id = cita.idcita;
    return img;
}

