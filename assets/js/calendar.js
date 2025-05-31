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
    /*
 events: [
     {
         start: '2025-05-30T10:00:00',
         end: '2025-05-30T11:00:00',
         display: 'background'
     }
 ]
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
    resaltarBloqueoAlmuerzo();
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
    let especialistaSeleccionado = '';

    // Selección de una sola celda a la vez (NO permite rangos)
    calendar.setOption('selectable', true);
    calendar.setOption('selectMirror', false);
    calendar.setOption('selectOverlap', false);
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
        // Si ya existe ese horario, no lo agregues de nuevo
        if (horariosSeleccionados.some(h => h.fecha === fecha && h.hora === hora)) return;
        let horaIni = formatearHora12h(hora);
        let horaFin = formatearHora12h(sumar30Minutos(hora));
        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const nombreDia = dias[info.start.getDay()];
        const disp = disponibilidadActual.find(d => d.fecha === nombreDia);
        let disponible = false;
        if (disp) {
            const horaSel = (hora.length === 5 ? hora + ':00' : hora);
            if (hora >= '13:00' && hora < '14:00') {
                mostrarMensajeFlotante('Horario fuera de disponibilidad');
                return;
            }
            disponible = (horaSel >= disp.horainicio && horaSel <= disp.horafin);
        }
        if (!disponible) {
            mostrarMensajeFlotante('Horario fuera de disponibilidad');
            return;
        }
        horariosSeleccionados.push({ fecha, horaIni, horaFin, hora });
        renderHorariosSeleccionados();
        actualizarEventosVisuales();
    });

    function actualizarEventosVisuales() {
        // Limpia todos los eventos visuales previos
        calendar.getEvents().forEach(ev => {
            if (ev.extendedProps && ev.extendedProps.tipo === 'seleccionado') ev.remove();
        });
        // Agrega un evento visual para cada horario seleccionado
        horariosSeleccionados.forEach(h => {
            calendar.addEvent({
                title: `<span class='fc-slot-check'>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="17.56px"
     height="17.56px" viewBox="0 0 17.56 17.56" style="overflow:visible;enable-background:new 0 0 17.56 17.56;"
     xml:space="preserve">
<style type="text/css">
    .st10{fill-rule:evenodd;clip-rule:evenodd;fill:#48B02C;}
    .st11{fill-rule:evenodd;clip-rule:evenodd;fill:#FFFFFF;}
</style>
<defs></defs>
<g>
    <path class='st10' d='M8.78,0c4.85,0,8.78,3.93,8.78,8.78s-3.93,8.78-8.78,8.78C3.93,17.56,0,13.63,0,8.78S3.93,0,8.78,0'/>
    <path class='st11' d='M6,13.06L2.81,9.65c-0.35-0.37-0.45-0.93-0.2-1.37C3.02,7.54,3.97,7.47,4.5,8.03l2.48,2.65l3.92-3.66
        c0.04-0.03,0.07-0.06,0.11-0.09l1.82-1.7c0.37-0.35,0.93-0.45,1.37-0.2c0.74,0.41,0.81,1.37,0.25,1.89l-5.63,5.26l-0.01-0.01
        l-1.95,1.82L6,13.06z'/>
</g>
</svg>
</span>
<span class='fc-slot-horario'>${h.horaIni} - ${h.horaFin}</span>`,
                start: h.fecha + 'T' + h.hora + ':00',
                end: h.fecha + 'T' + sumar30Minutos(h.hora) + ':00',
                display: 'background',
                classNames: ['fc-slot-custom-content'],
                extendedProps: { tipo: 'seleccionado' }
            });
        });
    }

    // --- GESTIÓN DE HORARIOS SELECCIONADOS (multi-slot, editar, eliminar, actualizar visual) ---
    var idxEditando = null; // Índice del horario que se está editando

    function renderHorariosSeleccionados() {
        const cont = document.getElementById('horariosSeleccionados');
        cont.innerHTML = '';
        const diasAbrev = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        horariosSeleccionados.forEach((h, idx) => {
            const chip = document.createElement('div');
            chip.className = 'horario-chip';
            // Día abreviado y número
            const fechaObj = new Date(h.fecha + 'T00:00:00');
            const diaAbrev = diasAbrev[fechaObj.getDay()];
            const diaNum = fechaObj.getDate();
            chip.innerHTML = `<div class="cita-chip">
  <div class="cita-chip-info">
    <div class="cita-chip-dia">${diaAbrev} ${diaNum}</div>
    <div class="cita-chip-detalle">
      <strong>${especialistaSeleccionado}</strong>
      <span>${h.horaIni} - ${h.horaFin}</span>
    </div>
  </div>
  <div class="cita-chip-buttons">
    <button class="btn-editar-horario${idxEditando === idx ? ' btn-editando' : ''}" data-idx="${idx}"><i class="fas fa-pen"></i></button>
    <button><i class="fas fa-trash" title='Eliminar' onclick='eliminarHorario(${idx})'></i></button>
  </div>
</div>`;
            cont.appendChild(chip);
        });
        // Mostrar/ocultar mensaje y body según cantidad de horarios
        const noHorarios = document.querySelector('.no-horarios-selected');
        const subtitulo = document.querySelector('.subtitulo');
        const modalCitaBody = document.querySelector('.modal-cita-body');
        const agregarMas = document.querySelector('.agregar-mas');
        const horariosSeleccionadosDiv = document.getElementById('horariosSeleccionados');
        const agregarHorarioDiv = document.querySelector('.agregar-horario');
        const footerModal = document.querySelector('.footer-modal');
        if (horariosSeleccionados.length === 0) {
            if (subtitulo) subtitulo.style.display = 'none';
            if (noHorarios) noHorarios.style.display = 'flex';
            if (modalCitaBody) modalCitaBody.style.display = 'none';
            if (agregarMas) agregarMas.style.display = 'block';
            if (horariosSeleccionadosDiv) horariosSeleccionadosDiv.style.display = 'none';
            if (agregarHorarioDiv) agregarHorarioDiv.style.display = 'none';
            if (footerModal) footerModal.style.display = 'none'; // <-- fuerza ocultar footer
        } else {
            if (subtitulo) subtitulo.style.display = 'block';
            if (noHorarios) noHorarios.style.display = 'none';
            if (modalCitaBody) modalCitaBody.style.display = 'block';
            if (agregarMas) agregarMas.style.display = 'block';
            if (horariosSeleccionadosDiv) horariosSeleccionadosDiv.style.display = 'block';
            //if (agregarHorarioDiv) agregarHorarioDiv.style.display = 'flex';
            if (footerModal) footerModal.style.display = 'flex'; // <-- fuerza mostrar footer
        }
        actualizarEventosVisuales();
        //document.querySelector('.agregar-horario').style.display = 'flex';
    }

    document.addEventListener('click', function (e) {
        if (e.target.closest('.btn-editar-horario')) {
            const idx = parseInt(e.target.closest('.btn-editar-horario').dataset.idx);
            // Si ya está editando este mismo, al hacer clic de nuevo, actualiza
            if (idxEditando === idx) {
                const fecha = document.getElementById('nuevoHorarioFecha').value;
                const hora = document.getElementById('nuevoHorarioHora').value;
                if (fecha && hora) {
                    let horaIni = formatearHora12h(hora);
                    let horaFin = formatearHora12h(sumar30Minutos(hora));
                    horariosSeleccionados[idxEditando] = { fecha, horaIni, horaFin, hora };
                    idxEditando = null;
                    renderHorariosSeleccionados();
                    actualizarEventosVisuales();
                    document.getElementById('nuevoHorarioFecha').value = '';
                    document.getElementById('nuevoHorarioHora').value = '';
                }
                // Vuelve a mostrar el botón agregar
                document.getElementById('btnAgregarHorario').style.display = '';
                let btnActualizar = document.getElementById('btnActualizarHorario');
                if (btnActualizar) btnActualizar.style.display = 'none';
                return;
            }
            // Si es otro, inicia edición
            idxEditando = idx;
            const h = horariosSeleccionados[idx];
            document.getElementById('nuevoHorarioFecha').value = h.fecha;
            document.getElementById('nuevoHorarioHora').value = h.hora;
            document.querySelector('.agregar-horario').style.display = 'flex';
            document.getElementById('btnAgregarHorario').style.display = 'none';
            let btnActualizar = document.getElementById('btnActualizarHorario');
            if (!btnActualizar) {
                btnActualizar = document.createElement('button');
                btnActualizar.id = 'btnActualizarHorario';
                btnActualizar.className = 'btn-pagar';
                btnActualizar.style.backgroundColor = '#ff7e00';
                btnActualizar.textContent = 'Actualizar';
                const agregarHorarioDiv = document.querySelector('.agregar-horario');
                agregarHorarioDiv.appendChild(btnActualizar);
                //agregarHorarioDiv.style.display = 'flex';
            } else {
                btnActualizar.style.display = '';
            }
            renderHorariosSeleccionados();
        }
        if (e.target.closest('.agregar-mas a')) {
            e.preventDefault();
            if (especialistaSeleccionado === '') {
                mostrarMensajeFlotante('Debe seleccionar un especialista primero');
                return;
            }
            idxEditando = null;
            document.querySelector('.agregar-horario').style.display = 'flex';
            document.getElementById('btnAgregarHorario').style.display = '';
            let btnActualizar = document.getElementById('btnActualizarHorario');
            if (btnActualizar) btnActualizar.style.display = 'none';
        }
        if (e.target.closest(".paciente-item")) {
            const paciente = e.target.closest(".paciente-item");
            const idPaciente = paciente.dataset.id;
            const nombreCompleto = paciente.querySelector('.paciente-nombre strong').textContent;
            const dni = paciente.querySelector('.dni').textContent.replace('DNI: ', '').replace('|', '').trim();
            const fechaNac = paciente.querySelector('.fecha-nac').textContent.replace('F. Nac: ', '');
            const edad = calcularEdad(fechaNac);

            $('.avatar-iniciales').text(getInitials(nombreCompleto.split(' ')[0], nombreCompleto.split(' ')[1]));
            $('.avatar-iniciales').css('background-color', stringToColor(nombreCompleto));
            $('.paciente-cita').attr('data-id', idPaciente);
            $('.paciente-nombre').text(nombreCompleto);
            $('.pacientesel-dni').text(`DNI: ${dni}`);
            $('.pacientesel-edad').text(`Edad: ${edad} años`);
            $('.paciente-detalles').css('justify-content', 'between');
            $('.paciente-detalles span').css('color', '#76869E');

            $('#pacienteSeleccionado').show();
            $('#resultadoPacientes').css('display', 'none').empty();
        }
        if (e.target.closest('.btn-pagar')) {
            if (!selectedespecialista) {
                mostrarMensajeFlotante('Debe seleccionar un especialista primero');
                return;
            }
            if (horariosSeleccionados.length === 0) {
                mostrarMensajeFlotante('Debe seleccionar al menos un horario');
                return;
            }
            const idUsuario = document.getElementById('idUsuario').value;
            const idPaciente = document.getElementById('pacienteCita')?.dataset.id;

            if (!idPaciente) {
                mostrarMensajeFlotante('Debe seleccionar un paciente primero');
                return;
            }

            horariosSeleccionados.forEach(h => {
                const horaInicio = h.hora;
                const horaFin = sumar30Minutos(horaInicio);
                const fecha = h.fecha;

                const data = {
                    idusuario: idUsuario,
                    idpaciente: idPaciente,
                    idespecialista: selectedespecialista,
                    hora_inicio: horaInicio,
                    hora_fin: horaFin,
                    fecha: fecha
                };
                console.log('Datos de la cita:', data); //Correcto
                $.post(baseurl + 'controllers/Citas/CitasController.php?action=create', { data: JSON.stringify(data) }, function (response) {
                    if (response.success) {
                        console.log('Cita agendada correctamente');
                        $('#modalCita').modal('hide');
                        horariosSeleccionados = [];
                        renderHorariosSeleccionados();
                        refrescarCitasEspecialista(selectedespecialista);
                    } else {
                        mostrarMensajeFlotante('Error al agendar la cita: ' + response.error + '\n' + response.message);
                    }
                }, 'json');
            });
        }
    });

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

    // Oculta el botón agregar cuando se está editando
    const observer = new MutationObserver(() => {
        if (idxEditando !== null) {
            document.getElementById('btnAgregarHorario').style.display = 'none';
        } else {
            document.getElementById('btnAgregarHorario').style.display = '';
        }
    });
    observer.observe(document.querySelector('.agregar-horario'), { childList: true, subtree: true });

    // Botón actualizar horario
    if (!document.getElementById('btnActualizarHorario')) {
        const btnActualizar = document.createElement('button');
        btnActualizar.id = 'btnActualizarHorario';
        btnActualizar.className = 'btn-pagar';
        btnActualizar.style.backgroundColor = '#ff7e00';
        btnActualizar.textContent = 'Actualizar';
        btnActualizar.style.display = 'none';
        document.querySelector('.agregar-horario').appendChild(btnActualizar);
    }
    document.getElementById('btnActualizarHorario').onclick = function () {
        if (idxEditando === null) return;
        const fecha = document.getElementById('nuevoHorarioFecha').value;
        const hora = document.getElementById('nuevoHorarioHora').value;
        if (fecha && hora) {
            let horaIni = formatearHora12h(hora);
            let horaFin = formatearHora12h(sumar30Minutos(hora));
            horariosSeleccionados[idxEditando] = { fecha, horaIni, horaFin, hora };
            idxEditando = null;
            renderHorariosSeleccionados();
            actualizarEventosVisuales();
            document.getElementById('nuevoHorarioFecha').value = '';
            document.getElementById('nuevoHorarioHora').value = '';
            document.getElementById('btnAgregarHorario').style.display = '';
            document.getElementById('btnActualizarHorario').style.display = 'none';
            document.querySelector('.agregar-horario').style.display = '';
        }
    };

    // Botón agregar horario
    if (document.getElementById('btnAgregarHorario')) {
        document.getElementById('btnAgregarHorario').onclick = function () {
            const fecha = document.getElementById('nuevoHorarioFecha').value;
            const hora = document.getElementById('nuevoHorarioHora').value;
            if (!fecha || !hora) return;
            // Evita duplicados
            if (horariosSeleccionados.some(h => h.fecha === fecha && h.hora === hora)) return;
            let horaIni = formatearHora12h(hora);
            let horaFin = formatearHora12h(sumar30Minutos(hora));
            horariosSeleccionados.push({ fecha, horaIni, horaFin, hora });
            renderHorariosSeleccionados();
            actualizarEventosVisuales();
            document.getElementById('nuevoHorarioFecha').value = '';
            document.getElementById('nuevoHorarioHora').value = '';
        };
    }

    window.eliminarHorario = function (idx) {
        horariosSeleccionados.splice(idx, 1);
        idxEditando = null;
        renderHorariosSeleccionados();
    };

    // CSS para resaltar el botón editar activo
    (function () {
        if (!document.getElementById('btn-editando-css')) {
            const style = document.createElement('style');
            style.id = 'btn-editando-css';
            style.innerHTML = `.btn-editar-horario.btn-editando { background: #ff7e00 !important; color: #fff !important; }`;
            document.head.appendChild(style);
        }
    })();

    function obtenerDisponibilidadEspecialista(idespecialista) {
        return $.get(baseurl + `controllers/Disponibilidad/DisponibilidadController.php?action=read&idespecialista=${idespecialista}`);
    }

    function obtenerCitasEspecialista(idespecialista) {
        return $.get(baseurl + `controllers/Citas/CitasController.php?action=read&idespecialista=${idespecialista}`);
    }

    // Refresca visualmente las citas agendadas del especialista
    function refrescarCitasEspecialista(idespecialista) {
        obtenerCitasEspecialista(idespecialista).then(function (citas) {
            console.log("📅 Citas del especialista:", citas);

            // Elimina eventos de citas anteriores
            calendar.getEvents().forEach(ev => {
                if (ev.extendedProps && ev.extendedProps.tipo === 'cita-existente') ev.remove();
            });

            // Agrega visualmente cada cita
            citas.forEach(cita => {
                const horaIni = formatearHora12h(cita.hora_inicio.slice(0, 5));
                const horaFin = formatearHora12h(cita.hora_fin.slice(0, 5));
                const nombreCompleto = `${cita.paciente_nombres} ${cita.paciente_apellidos}`;

                calendar.addEvent({
                    title: `
    <div class="evento-contenedor">
      <div class="nombre-arriba"><strong>${nombreCompleto}</strong></div>
      <div class="check-horario">
        <span class='mi-check-clase'>
          <svg xmlns="http://www.w3.org/2000/svg" width="17.56px" height="17.56px" viewBox="0 0 17.56 17.56">
            <style>.mi-st10{fill:#48B02C;} .mi-st11{fill:#FFFFFF;}</style>
            <g>
              <path class='mi-st10' d='M8.78,0c4.85,0,8.78,3.93,8.78,8.78s-3.93,8.78-8.78,8.78C3.93,17.56,0,13.63,0,8.78S3.93,0,8.78,0'/>
              <path class='mi-st11' d='M6,13.06L2.81,9.65c-0.35-0.37-0.45-0.93-0.2-1.37C3.02,7.54,3.97,7.47,4.5,8.03l2.48,2.65l3.92-3.66
                c0.04-0.03,0.07-0.06,0.11-0.09l1.82-1.7c0.37-0.35,0.93-0.45,1.37-0.2c0.74,0.41,0.81,1.37,0.25,1.89l-5.63,5.26l-0.01-0.01
                l-1.95,1.82L6,13.06z'/>
            </g>
          </svg>
        </span>
        <span class="horario-agendado">Horario: ${horaIni} - ${horaFin}</span>
      </div>
    </div>
  `,
                    start: `${cita.fecha}T${cita.hora_inicio}`,
                    end: `${cita.fecha}T${cita.hora_fin}`,
                    display: 'background',
                    classNames: ['fc-slot-custom-content', 'cita-agendada-evento'],
                    extendedProps: {
                        tipo: 'cita-existente'
                    }
                });
            });
        });
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
            refrescarCitasEspecialista(selectedespecialista);
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
    let disponibilidadActual = [];

    //Busqueda de pacientes
    $('#searchPaciente').on('keyup', function () {
        const query = $(this).val().trim();
        if (query.length < 2) {
            $('#resultadoPacientes').css('display', 'none').empty();
            return;
        }
        buscarPacientes(query);
    });

    function buscarPacientes(query) {
        $.get(baseurl + `controllers/Pacientes/PacienteController.php?action=buscar&filtro=${encodeURIComponent(query)}`, function (data) {
            const pacientes = Array.isArray(data) ? data : JSON.parse(data);
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
        });
    }

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

/*
Agrega estilos CSS sugeridos para el contenido custom:
.fc-slot-custom-content { pointer-events: none; }
.fc-slot-check { margin-right: 4px; }
*/

// Personaliza el renderizado de los eventos para permitir HTML en el título
calendar.setOption('eventContent', function (arg) {
    if (arg.event.display === 'background' && arg.event.classNames.includes('fc-slot-custom-content')) {
        return { html: arg.event.title };
    }
    // ...otros casos si es necesario...
});