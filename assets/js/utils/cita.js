import { formatearHora12h, formatearFecha, calcularEdad } from "./date.js";
import api from "./api.js";

export const estadosCita = { '3': 'pendiente', '4': 'cancelado', '5': 'anulado' }
const baseurl = "http://localhost/SistemaClinico/";

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
        classNames: ['fc-slot-custom-content', 'cita-agendada-evento', 'evento-single', cssEstado],
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

export async function obtenerCitasEspecialista(idespecialista, fechaSeleccionada) {
    const citas = api.obtenerCitas({ idespecialista: idespecialista });
    const citasHoyPromise = api.obtenerCitas({ idespecialista: idespecialista, filtro: { fecha: fechaSeleccionada } });
    const citasContainer = document.querySelector('.citas-container');
    citasContainer.innerHTML = '';
    document.getElementById('subtituloCitas').textContent = fechaSeleccionada === formatearFecha(new Date()) ? 'Citas de hoy' : `Citas del día ${fechaSeleccionada}`

    return Promise.all([citas, citasHoyPromise]).then(([citas, citasHoy]) => {
        if (citas.length == 0) return;

        if (citasHoy.length === 0) {
            citasContainer.innerHTML += '<p class="mb-4">No hay citas para este día.</p>';
        } else {
            const ahora = new Date();
            let citaActual = null;
            let citasPasadas = [];

            // Buscar la cita actual
            citasHoy.forEach(cita => {
                const fechaInicio = new Date(`${fechaSeleccionada}T${cita.hora_inicio}`);
                const fechaFin = new Date(`${fechaSeleccionada}T${cita.hora_fin}`);

                if (ahora >= fechaInicio && ahora < fechaFin && cita.asistio == null) {
                    citaActual = cita;
                }

                if (ahora >= fechaFin) {
                    citasPasadas.push(cita);
                }
            });

            if (citaActual) {
                const citaActualElement = crearCitaContainer(citaActual);
                citaActualElement.classList.add('cita-actual');
                citaActualElement.append(buildBotones(citaActual));
                citasContainer.prepend(citaActualElement);

                // Remover la cita actual del array para no duplicarla abajo
                citasHoy = citasHoy.filter(c => c !== citaActual);
            }

            if (citasPasadas) {
                citasHoy = citasHoy.filter(c => !citasPasadas.includes(c));
            }

            // Añadir el resto de citas
            citasHoy.forEach(cita => {
                const citaElement = crearCitaContainer(cita);
                if (cita.asistio == true) {
                    citaElement.classList.add('cita-asistio');
                } else if (cita.asistio == false) {
                    citaElement.classList.add('cita-no-asistio');
                }
                citasContainer.appendChild(citaElement);
            });

            if (citasPasadas) {
                const citasSinMarcar = citasPasadas.filter(cita => cita.asistio == null);
                if (citasSinMarcar) {
                    citasSinMarcar.forEach(cita => {
                        const citaSinMarcarElement = crearCitaContainer(cita);
                        citaSinMarcarElement.append(buildBotones(cita));
                        citasContainer.appendChild(citaSinMarcarElement);
                    })
                    citasPasadas = citasPasadas.filter(c => !citasSinMarcar.includes(c));
                }
                citasPasadas.forEach(cita => {
                    const citaPasadaElement = crearCitaContainer(cita);
                    if (cita.asistio == true) {
                        citaPasadaElement.classList.add('cita-asistio');
                    } else if (cita.asistio == false) {
                        citaPasadaElement.classList.add('cita-no-asistio');
                    }
                    citasContainer.appendChild(citaPasadaElement);
                })
            }
        }
        //procesarYMostrarCitas(cal, citas, idespecialista);
        return citas;
    }).catch(error => {
        citasContainer.innerHTML = '<div class="alert alert-danger">Error al obtener citas</div>';
        console.error('Error al obtener citas:', error);
    });
}

export async function obtenerCitasPaciente(idpaciente) {
    const citasContainer = document.querySelector('.citas-container');
    citasContainer.innerHTML = '';

    return api.obtenerCitas({ idpaciente }).then((citas) => {
        if (citas.length == 0) return;

        citas.forEach(cita => {
            const citaElement = crearCitaContainer2(cita);
            citasContainer.appendChild(citaElement);
        });
        //procesarYMostrarCitas(cal, citas, idespecialista);
        return citas;
    }).catch(error => {
        citasContainer.innerHTML = '<div class="alert alert-danger">Error al obtener citas</div>';
        console.error('Error al obtener citas:', error);
    });
}

export function crearCitaContainer(cita) {
    const estado = `cita-${estadosCita[cita.idestado]}`;
    const asistio = cita.asistio == true ? 'cita-asistio' : cita.asistio == false ? 'cita-no-asistio' : null;
    const citaElement = document.createElement('div');
    citaElement.className = `cita-container`;
    citaElement.innerHTML = `<div class="cita-content ${estado} ${asistio}" data-id="${cita.idcita}" data-paciente="${cita.paciente_id}">
    <div class="cita-grupos" style="justify-content: space-between";>
    <div class="cita-grupo">
                <div class="cita-time">
        <span>${formatearHora12h(cita.hora_inicio)}</span>
        <span>${formatearHora12h(cita.hora_fin)}</span>
    </div>
    <div class="cita-paciente">
        <span>${cita.paciente_nombres} ${cita.paciente_apellidos}</span>
        <span>${cita.servicio}</span>
    </div></div>
    <div class="cita-grupo">
    <div class="cita-estado">
        ${getSVGCita(asistio, 'big')}
    </div></div></div></div>`;
    return citaElement;
}

export function crearCitaContainer2(cita) {
    const estado = `cita-${estadosCita[cita.idestado]}`;
    const citaElement = document.createElement('div');
    citaElement.className = 'cita-container';

    const contenido = `
        <div class="cita-content ${estado}"
        data-id="${cita.idcita}"
        data-paciente="${cita.paciente_id}"
        data-especialista="${cita.idespecialista}"
        data-fecha="${cita.fecha}"
        data-horainicio="${cita.hora_inicio}"
        data-horafin="${cita.hora_fin}"
        data-servicio="${cita.idservicio}"
        data-estado="${cita.idestado}"
        data-area="${cita.idarea}"
        data-subarea="${cita.idsubarea}"
        data-estado = "${cita.idestado}">
        <div class="cita-chip">
            ${crearCitaChipInfo(cita.fecha, `${cita.especialista_nombres} ${cita.especialista_apellidos}`, formatearHora12h(cita.hora_inicio), formatearHora12h(cita.hora_fin))}
            <button id="btnReprogramarCita" class="btn btn-sm btn-danger rounded-circle"><i class="bi bi-box-arrow-in-down-left" style="color: white;"></i></button>
        </div></div>
    `;

    citaElement.innerHTML = contenido.trim();
    return citaElement;
}

function buildBotones(cita) {
    const botonesAsistio = document.createElement('div');
    botonesAsistio.className = 'botones-asistio';
    botonesAsistio.dataset.id = cita.idcita;
    botonesAsistio.innerHTML = `
                <button id="btnAsistio" class="btn btn-success boton-asistio">
<svg id="agenda_especialista" data-name="agenda especialista" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.14 6.74" style="width: 9px; height: 9px">
  <defs>
    <style>
      .cls-100 {
        fill: #fff;
        fill-rule: evenodd;
      }
    </style>
  </defs>
  <path class="cls-100" d="M2.61,6.05L.25,3.53C0,3.25-.08,2.84.1,2.51c.3-.55,1.01-.6,1.4-.19l1.83,1.96,2.9-2.71s.05-.05.08-.07l1.35-1.26c.27-.26.69-.33,1.01-.15.55.3.6,1.01.19,1.4l-4.17,3.89h0s-1.44,1.34-1.44,1.34l-.64-.68Z"/>
</svg>
                <span>Asistió</span></button>
                <button id="btnNoAsistio" class="btn btn-danger boton-asistio">
<svg id="agenda_especialista" data-name="agenda especialista" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.74 6.74" style="width: 9px; height: 9px">
  <defs>
    <style>
      .cls-102 {
        fill: #fff;
      }
    </style>
  </defs>
  <path class="cls-102" d="M6.38,6.68c-.24.11-.48.06-.72-.18-.71-.71-1.42-1.41-2.12-2.13-.13-.13-.2-.15-.34,0-.71.73-1.43,1.44-2.16,2.16-.22.22-.48.26-.72.13-.24-.13-.35-.37-.31-.65.03-.15.12-.26.22-.36.71-.71,1.41-1.42,2.13-2.12.14-.14.13-.21,0-.34C1.63,2.48.91,1.75.18,1.02-.03.81-.06.5.1.27.26.03.55-.06.82.04c.12.04.2.13.28.21.69.69,1.38,1.37,2.06,2.07.15.15.22.18.39,0,.69-.72,1.41-1.42,2.12-2.13.18-.18.39-.25.63-.19.22.06.35.23.42.45.01.04,0,.08.01.1,0,.25-.12.4-.26.54-.7.69-1.39,1.39-2.09,2.08-.15.14-.14.22,0,.36.72.71,1.43,1.42,2.14,2.14.33.34.26.81-.15,1Z"/>
</svg>
                <span>No asistió</span></button>`;
    return botonesAsistio;
}

export function crearCitaChip(h, idx, editando) {
    const chip = document.createElement('div');
    chip.className = 'horario-chip';
    chip.dataset.idx = idx;

    const chipHTML = `
        <div class="cita-chip">
            ${crearCitaChipInfo(h.fecha, h.especialistaSeleccionado, h.horaIni, h.horaFin)}
            <div class="cita-chip-buttons">
                <button class="btn-editar-horario${editando ? ' btn-editando' : ''}" id="btnEditarHorario" data-idx="${idx}">
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
                <button class="btn-eliminar" onclick='eliminarHorario(${idx})'>
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="7.87px" height="9px" viewBox="0 0 7.87 9" style="overflow: visible; enable-background: new 0 0 7.87 9" xml:space="preserve">
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
  </svg>
                </button>
            </div>
        </div>
    `;

    chip.innerHTML = chipHTML;
    return chip;
}

function crearCitaChipInfo(fecha, especialista, horaIni, horaFin) {
    const diasAbrev = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
    // Día abreviado y número
    const fechaObj = new Date(fecha + "T00:00:00");
    const diaAbrev = diasAbrev[fechaObj.getDay()];
    const diaNum = fechaObj.getDate();
    return `
  <div class="cita-chip-info">
    <div class="cita-chip-dia">${diaAbrev} ${diaNum}</div>
    <div class="cita-chip-detalle">
      <strong>${especialista}</strong>
      <span>${horaIni} - ${horaFin}</span>
    </div>
  </div>`;
}

function getSVGPendiente(size = "small") {
    if (size === "small") return `
        <svg version = "1.1" xmlns = "http://www.w3.org/2000/svg" xmlns: xlink = "http://www.w3.org/1999/xlink" x = "0px" y = "0px" width = "11.15px"
    height = "11.15px" viewBox = "0 0 11.15 11.15" style = "overflow:visible;enable-background:new 0 0 11.15 11.15;"
    xml: space = "preserve" >
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

    else return `<svg id = "agenda_especialista" data - name="agenda especialista" xmlns = "http://www.w3.org/2000/svg" viewBox = "0 0 21.88 21.88" style = "width: 20px; height: 20px;" >
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
</svg> `
}

function getSVGAnulado(size = 'small') {
    if (size === "small") return `
        <svg version = "1.1" xmlns = "http://www.w3.org/2000/svg" xmlns: xlink = "http://www.w3.org/1999/xlink" x = "0px" y = "0px" width = "11.15px"
    height = "11.15px" viewBox = "0 0 11.15 11.15" style = "overflow:visible;enable-background:new 0 0 11.15 11.15;" xml: space = "preserve" >
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
        <svg id = "AGENDA" xmlns = "http://www.w3.org/2000/svg" viewBox = "0 0 11 11" style = "width: 20px; height: 20px;" >
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
</svg> `;
}

const getSVGcancelado = (size = "small") => {
    if (size === "small") return `
        <svg version = "1.1" xmlns = "http://www.w3.org/2000/svg" xmlns: xlink = "http://www.w3.org/1999/xlink" x = "0px" y = "0px" width = "11.15px"
    height = "11.15px" viewBox = "0 0 11.15 11.15" style = "overflow:visible;enable-background:new 0 0 11.15 11.15;"
    xml: space = "preserve" >
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
        <svg id = "agenda_especialista" data - name="agenda especialista" xmlns = "http://www.w3.org/2000/svg" viewBox = "0 0 21.15 21.15" style = "width: 20px; height: 20px;" >
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

    const pacienteNombre = `${cita.paciente_nombres} ${cita.paciente_apellidos} `;
    const fechaNacimiento = cita.paciente_fecha_nacimiento;
    const edad = calcularEdad(fechaNacimiento);
    const especialista = `${cita.especialista_nombre} ${cita.especialista_apellidos ?? ''} `;
    const horario = `${formatearHora12h(cita.hora_inicio)} - ${formatearHora12h(cita.hora_fin)} `;
    //const color = stringToColor(pacienteNombre);
    //const iniciales = getInitials(cita.paciente_nombres, cita.paciente_apellidos);
    const svgEstado = getSVGCita(`cita - ${estadosCita[cita.idestado]} `);

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip-cita';
    tooltip.innerHTML = `
        <div div class="mytooltip" >
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
        <button class="btn btn-light btn-ver-cita" onclick="window.location.href='${baseurl}views/Doctor/pacientes/pacienteDetalles.php?idpaciente=${cita.paciente_id}'">Ver cita</button>
        </div > `;

    document.body.appendChild(tooltip);

    const rect = targetElement.getBoundingClientRect();
    tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 10} px`;
    tooltip.style.left = `${rect.left + window.scrollX} px`;

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
        extra.textContent = `+ ${extraCount} `;
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

