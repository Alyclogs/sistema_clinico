import api from '../utils/api.js';
import { mostrarMensajeFlotante } from '../utils/utils.js';
import { formatearHora12h, calcularEdad, buildDate } from '../utils/date.js';
import { crearCitaChip, crearCitaChipInfo, obtenerCitasPaciente, procesarYMostrarCitas } from '../utils/cita.js';
import { calendarUI, updateCalendarDateRange } from '../utils/calendar.js';
import { calcularDisponibilidadPorEspecialista, actualizarDisponibilidadEspecialista, actualizarBusinessHours } from '../utils/especialista.js';

const baseurl = "http://localhost/SistemaClinico/";
var selectedservicio = "1";
var selectedarea = "";
var selectedsubarea = "";
var selectedespecialista = "";
var selectedpaciente = "";
let servicioDuracion = 30;   // valor por defecto
let subareaDuracion = 30;
let servicioSeleccionado = 'CONSULTA';
let especialistaSeleccionado = '';
let horariosSeleccionados = [];
let disponibilidadEspecialista = [];
let events = [];
let citasActuales = [];
let selectedoption = '1';
let reprogramandoState = false;
let horarioReprogramando = {};
const cal = new calendarUI();

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const miniCalendarEl = document.getElementById('mini-calendar');
    const calendar = cal.buildCalendar(calendarEl);
    const miniCalendar = cal.buildMiniCalendar(miniCalendarEl, calendar);

    obtenerServicios();
    refrescarCitas();

    calendar.render();
    updateCalendarDateRange(calendar);

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

    function buscarEspecialistas(selected = '') {
        $("#filtro-especialista")
            .empty()
            .append('<option value="" disabled selected>Seleccionar</option>')
            .prop("disabled", true);

        api.obtenerEspecialistas({ idservicio: selectedservicio, idarea: selectedarea, idsubarea: selectedsubarea }).then(function (data) {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            const especialistas = Array.isArray(parsedData) ? parsedData : [parsedData];

            if (especialistas.length === 0) {
                mostrarMensajeFlotante('No hay especialistas');
                return;
            }
            const promesas = especialistas.map(especialista => {
                return api.obtenerDisponibilidadEspecialista(especialista.idespecialista).then(disponibilidad => {
                    if (disponibilidad.length === 0) {
                        // No tiene disponibilidad, lo incluimos con disponibilidad 0
                        return {
                            idespecialista: especialista.idespecialista,
                            nombre: `${especialista.nom_especialista} ${especialista.ape_especialista}`,
                            minutos_disponibles: -1 // Marcamos -1 para ordenar después
                        };
                    }

                    // Tiene disponibilidad, calculamos
                    return api.obtenerCitas({ idespecialista: especialista.idespecialista }).then(citas => {
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
                    if (selected !== '' && e.idespecialista == parseInt(selected)) html += `<option value="${e.idespecialista}" selected>${e.nombre}</option>`;
                    html += `<option value="${e.idespecialista}">${e.nombre}</option>`;
                });

                $("#filtro-especialista")
                    .html(`<option value="" disabled ${selected !== '' ? '' : 'selected'}>Seleccionar</option>` + html)
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
        const val = $(this).val().trim();
        const servicio = $(this).find('option:selected').text().trim();
        if (reprogramandoState) {
            if (val) horarioReprogramando.idservicio = val;
        }
        selectedarea = '';
        selectedsubarea = '';
        selectedespecialista = '';
        subareaDuracion = 0;
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
        //actualizarEventosVisuales();
        refrescarCitas();
    });

    $("#filtro-area").change(function () {
        $(this).removeClass('filtro-not-selected');
        $("#filtro-subarea").val("");
        $("#filtro-especialista").val("");
        const val = $(this).val();
        if (reprogramandoState) {
            if (val) horarioReprogramando.idarea = val;
        }
        selectedsubarea = '';
        selectedespecialista = '';
        especialistaSeleccionado = '';
        if (val) selectedarea = val;
        buscarSubareaPorArea(selectedarea);
        if (servicioSeleccionado === 'EVALUACION') buscarEspecialistas();
        //actualizarEventosVisuales();
        refrescarCitas();
    });

    $("#filtro-subarea").change(function () {
        $(this).removeClass('filtro-not-selected');
        $("#filtro-especialista").val("");
        selectedespecialista = '';
        const val = $(this).val();
        if (reprogramandoState) {
            if (val) horarioReprogramando.idsubarea = val;
        }
        if (val) selectedsubarea = $(this).val();
        subareaDuracion = parseInt(
            $(this).find('option:selected').data('duracion'),
            10
        ) || 30;
        buscarEspecialistas();
        //actualizarEventosVisuales();
        refrescarCitas();
    })

    //Cambio de horario segun la disponibilidad del especialista
    $("#filtro-especialista").change(function () {
        $(this).removeClass('filtro-not-selected');
        const val = $(this).val();
        especialistaSeleccionado = $(this).find('option:selected').text();
        if (reprogramandoState) {
            if (val) horarioReprogramando.idespecialista = val;
        }
        if (val) selectedespecialista = val;
        actualizarDisponibilidadEspecialista(calendar, selectedespecialista).then(disponibilidad => {
            disponibilidadEspecialista = disponibilidad;
            refrescarCitas();
            //actualizarEventosVisuales();
        });
        // NO modificar la lista del modal ni horariosSeleccionados
    });

    calendar.setOption('select', function (info) {
        const durMin = subareaDuracion || servicioDuracion || 30;

        const startDate = info.start;
        const pad = n => String(n).padStart(2, '0');
        const fecha = startDate.toISOString().slice(0, 10);
        const horaInicioRaw = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
        const horaFinRaw = (() => {
            const end = new Date(startDate.getTime() + durMin * 60000);
            return `${pad(end.getHours())}:${pad(end.getMinutes())}`;
        })();

        const diaSemana = startDate
            .toLocaleDateString('es-ES', { weekday: 'long' })
            .toLowerCase();

        const excepciones = disponibilidadEspecialista.filter(d =>
            d.es_excepcion &&
            d.estado === 'cambio de horario' &&
            d.dia === diaSemana &&
            fecha >= d.fechainicio &&
            fecha <= d.fechafin
        );

        const candidatos = excepciones.length
            ? excepciones
            : disponibilidadEspecialista.filter(d =>
                !d.es_excepcion &&
                d.dia === diaSemana &&
                fecha >= d.fechainicio &&
                fecha <= d.fechafin
            );

        let disponible = false;
        candidatos.forEach(d => {
            const labIni = d.horainicio.slice(0, 5);
            const labFin = d.horafin.slice(0, 5);
            const refIni = d.refrigerio_horainicio.slice(0, 5);
            const refFin = d.refrigerio_horafin.slice(0, 5);

            const hayConflictoConCita = citasActuales.some(c =>
                c.fecha === fecha &&
                horaInicioRaw < c.hora_fin.slice(0, 5) &&
                horaFinRaw > c.hora_inicio.slice(0, 5)
            );

            if (
                horaInicioRaw >= labIni &&
                horaFinRaw <= labFin &&
                !(horaInicioRaw < refFin && horaFinRaw > refIni) &&
                !hayConflictoConCita
            ) {
                disponible = true;
            }
        });

        if (!disponible) {
            mostrarMensajeFlotante('Horario fuera de disponibilidad');
            return;
        }

        // Validación de especialista
        if (!selectedespecialista) {
            mostrarMensajeFlotante('Debe seleccionar un especialista primero');
            return;
        }

        if (reprogramandoState) {
            horarioReprogramando.fecha = fecha;
            horarioReprogramando.horaInicioRaw = horaInicioRaw;
            horarioReprogramando.horaFinRaw = horaFinRaw;

            //reprogramandoState = false;
            actualizarHorarioReprogramando();
            //reprogramarCita();
            return;
        }

        // Validación de bloque ya existente
        const idxExist = horariosSeleccionados.findIndex(h =>
            h.idespecialista === selectedespecialista &&
            h.fecha === fecha &&
            h.horaInicioRaw === horaInicioRaw &&
            h.horaFinRaw === horaFinRaw
        );
        if (idxExist >= 0) {
            eliminarHorario(idxExist);
            return;
        }

        // Agregar horario
        horariosSeleccionados.push({
            fecha,
            horaInicioRaw,
            horaFinRaw,
            idespecialista: selectedespecialista,
            idservicio: selectedservicio,
            especialistaSeleccionado,
        });

        // Refrescar
        renderHorariosSeleccionados();
        actualizarEventosVisuales();
    });

    // --- GESTIÓN DE HORARIOS SELECCIONADOS  ---
    var idxEditando = null; // Índice del horario que se está editando

    function renderHorariosSeleccionados() {
        const cont = document.getElementById('horariosSeleccionados');
        cont.innerHTML = '';

        horariosSeleccionados.forEach((h, idx) => {
            const btnEditar = { id: "btnEditar", editando: idxEditando === idx };
            const btnEliminar = { id: "btnEliminar", onClick: `eliminarHorario(${idx})` };
            const chip = crearCitaChip(h, idx, btnEditar, btnEliminar);
            cont.appendChild(chip);
        });
        // Mostrar/ocultar mensaje y body según cantidad de horarios
        const noHorarios = document.querySelector('.no-horarios-selected');
        const subtituloCitas = document.getElementById('subCitasSeleccionadas');
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
        if (e.target.closest('#btnEditarHorario')) {
            const btn = e.target.closest('#btnEditarHorario');
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
                api.obtenerCitas({ idservicio: selectedservicio, idespecialista: h.idespecialista, idarea: selectedarea, idsubarea: selectedsubarea })
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
                selectedpaciente = pacienteActual.idpaciente;
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

                if (selectedoption === '2') obtenerCitasPaciente(selectedpaciente);
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

            if (!selectedpaciente) {
                mostrarMensajeFlotante('Debe seleccionar un paciente primero');
                return;
            }
            agendarCita('3');
            const dni = $('.pacientesel-dni').text().replace('DNI:', '').trim();
            window.location.href = baseurl + `views/Clinica/pagos/index.php?filtro=${dni}`;

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
            if (!selectedpaciente) {
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
        if (e.target.closest('#mostrarHorarios')) {
            const intervalos = obtenerIntervalos(calendar);
            const select = document.getElementById('mostrarHorarios');
            select.innerHTML = "";
            let html = '';

            intervalos.forEach(opcion => {
                html += `<div class="horario-item">
                            <span data-time="${opcion.value}">${opcion.text}</span>
                        </div>`
            });
            $('#resultadoHorarios').html(html).css('display', 'flex');
        }
        if (e.target.closest('.horario-item')) {
            const horario = e.target.closest(".horario-item").querySelector('span').dataset.time;
            document.getElementById('nuevoHorarioHora').value = horario;
            $('#resultadoHorarios').css('display', 'none');
        }
        if (e.target.closest('.modal-cita-header h2')) {
            const option = e.target.closest('.modal-cita-header h2');
            const activo = document.querySelector('.modal-cita-header h2.active');
            if (activo) activo.classList.remove('active');
            option.classList.add('active');

            selectedoption = option.id;
            if (option.id === '1') {
                document.getElementById('modalNuevaCita').style.display = '';
                document.getElementById('modalReprogramaciones').style.display = 'none';
                reprogramandoState = false;
                horarioReprogramando = {};
                selectedespecialista = '';
                selectedarea = '';
                selectedsubarea = '';
                $('#filtro-area').val('');
                $('#filtro-subarea').val('');
                $('#filtro-especialista').val('');
                if (selectedpaciente) obtenerCitasPaciente(selectedpaciente);
                actualizarDisponibilidadEspecialista(calendar, null, true);
                actualizarEventosVisuales();
                refrescarCitas();
            }
            if (option.id === '2') {
                document.getElementById('modalNuevaCita').style.display = 'none';
                document.getElementById('modalReprogramaciones').style.display = '';
                selectedespecialista = '';
                selectedarea = '';
                selectedsubarea = '';
                $('#filtro-area').val('');
                $('#filtro-subarea').val('');
                $('#filtro-especialista').val('');
                actualizarDisponibilidadEspecialista(calendar, null, true);
                actualizarEventosVisuales();
                refrescarCitas();
            }
        }
        if (e.target.closest('#btnReprogramarCita')) {
            reprogramandoState = true;
            const cita = e.target.closest('.cita-content');
            const citaId = cita.dataset.id;
            const citaEspecialista = cita.dataset.especialista;
            const citaFecha = cita.dataset.fecha;
            const citaHoraInicio = cita.dataset.horainicio;
            const citaHoraFin = cita.dataset.horafin;
            const citaServicio = cita.dataset.servicio;
            const citaArea = cita.dataset.area;
            const citaSubarea = cita.dataset.subarea;
            const citaEstado = cita.dataset.estado;
            const citaEspecialistaNombres = cita.querySelector('.cita-chip-detalle strong').textContent;

            calendar.gotoDate(new Date(citaFecha));
            horarioReprogramando = {
                idcita: citaId,
                fecha: citaFecha,
                horaInicioRaw: citaHoraInicio,
                horaFinRaw: citaHoraFin,
                idespecialista: citaEspecialista,
                idservicio: citaServicio,
                idarea: citaArea,
                idsubarea: citaSubarea,
                idestado: citaEstado,
                especialistaSeleccionado: citaEspecialistaNombres,
            };

            selectedservicio = citaServicio;
            selectedarea = citaArea;
            selectedespecialista = citaEspecialista;

            $('#filtro-servicio').val(citaServicio);
            $('#filtro-area').val(citaArea);
            buscarSubareaPorArea(citaArea);
            buscarEspecialistas(citaEspecialista);
            if (citaSubarea) {
                selectedsubarea = citaSubarea;
                $('#filtro-subarea').val(citaSubarea);
            }

            actualizarDisponibilidadEspecialista(calendar, citaEspecialista).then(disponibilidad => {
                disponibilidadEspecialista = disponibilidad;
                refrescarCitas(null, citaEspecialista, null, null, (c) => c.hora_inicio !== citaHoraInicio);
                actualizarHorarioReprogramando(true);
            });
        }
        if (e.target.closest('#btnReservarReprogramado')) {
            if (!selectedpaciente) {
                mostrarMensajeFlotante('Debe seleccionar un paciente primero');
                return;
            }
            reprogramarCita();
        }
        if (e.target.closest('#btnPagarReprogramado')) {
            if (!selectedpaciente) {
                mostrarMensajeFlotante('Debe seleccionar un paciente primero');
                return;
            }
            reprogramarCita();
            const dni = $('.pacientesel-dni').text().replace('DNI:', '').trim();
            window.location.href = baseurl + `views/Clinica/pagos/index.php?filtro=${dni}`;
        }
    });

    function agendarCita(idestado) {
        const idUsuario = document.getElementById('idUsuario').value;

        // Obtener los valores seleccionados de los selectores
        const idArea = document.getElementById('filtro-area').value || null;  // Si no hay valor seleccionado, asignar null
        const idSubarea = document.getElementById('filtro-subarea').value || null;  // Si no hay valor seleccionado, asignar null

        horariosSeleccionados.forEach(h => {
            const horaInicio = h.horaInicioRaw;
            const horaFin = h.horaFinRaw;
            const fecha = h.fecha;

            const data = {
                idregistrador: idUsuario,
                idpaciente: selectedpaciente,
                idespecialista: h.idespecialista,
                hora_inicio: horaInicio,
                hora_fin: horaFin,
                fecha: fecha,
                idestado: idestado,
                idservicio: h.idservicio,
                idarea: idArea,
                idsubarea: idSubarea
            };

            // Enviar los datos con $.post
            $.post(baseurl + 'controllers/Citas/CitasController.php?action=create', { data: JSON.stringify(data) }, function (response) {
                if (response.success) {
                    horariosSeleccionados = [];
                    renderHorariosSeleccionados();
                    refrescarCitas();
                    actualizarEventosVisuales();
                    mostrarMensajeFlotante("Cita agendada exitosamente", true);
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

    function reprogramarCita() {
        const idUsuario = document.getElementById('idUsuario').value;
        const data = {
            idcita: horarioReprogramando.idcita,
            idregistrador: idUsuario,
            idpaciente: selectedpaciente,
            idespecialista: horarioReprogramando.idespecialista,
            hora_inicio: horarioReprogramando.horaInicioRaw,
            hora_fin: horarioReprogramando.horaFinRaw,
            fecha: horarioReprogramando.fecha,
            idestado: horarioReprogramando.idestado,
            idservicio: horarioReprogramando.idservicio,
            idarea: horarioReprogramando.idarea,
            idsubarea: horarioReprogramando.idsubarea
        };

        // Enviar los datos con $.post
        $.post(baseurl + 'controllers/Citas/CitasController.php?action=update', { data: JSON.stringify(data) }, function (response) {
            if (response.success) {
                obtenerCitasPaciente(idPaciente);
                refrescarCitas();
                actualizarDisponibilidadEspecialista(calendar, null, true);
                actualizarEventosVisuales();
                reprogramandoState = false;
                horarioReprogramando = {};
                obtenerCitasPaciente(selectedpaciente);
                mostrarMensajeFlotante('Cita reprogramada correctamente', true);
            } else {
                mostrarMensajeFlotante('Error al reprogramar la cita: ' + response.error + '\n' + response.message);
            }
        }, 'json')
            .fail(function (xhr, status, error) {
                console.log(error, xhr.responseText);
                mostrarMensajeFlotante('Error al agendar cita');
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
            const formDataObj = {};
            const formDataArray = formUsuario.serializeArray();

            formDataArray.forEach(function (item) {
                formDataObj[item.name] = item.value;
            });

            api.agendarPaciente({
                data: formDataObj,
                onSuccess: (response) => {
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
                }, onError: (jqXHR, textStatus, errorThrown) => {
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
        api.obtenerServicios().then(function (data) {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            let html = '';
            parsed.forEach(s => {
                html += `<option value="${s.idservicio}" data-duracion="${s.duracion}" style="color: #fff !important">${s.servicio}</option>`;
            });
            $('#filtro-servicio')
                .empty()
                .append(html)
                .prop('disabled', false);
        }).fail(function (xhr, status, error) {
            console.log(error, xhr.responseText);
            mostrarMensajeFlotante('Error al obtener servicios');
        });
    }

    function actualizarHorarioReprogramando(preview = false) {
        cal.removeEvents("reprogramacion");
        cal.removeEvents('seleccionado');

        calendar.addEvent({
            title: `<span class="fc-slot-horario">${formatearHora12h(horarioReprogramando.horaInicioRaw)} - ${formatearHora12h(horarioReprogramando.horaFinRaw)}</span>`,
            start: `${horarioReprogramando.fecha}T${horarioReprogramando.horaInicioRaw}`,
            end: `${horarioReprogramando.fecha}T${horarioReprogramando.horaFinRaw}`,
            display: 'background',
            classNames: ['fc-slot-custom-content', 'horario-seleccionado', 'preview'],
            extendedProps: { tipo: 'reprogramacion', preview }
        });

        const citaContainer = document.querySelector(`.cita-content[data-id="${horarioReprogramando.idcita}"]`).closest('.cita-container');
        citaContainer.querySelector('.cita-chip-info').outerHTML = `
        ${crearCitaChipInfo(horarioReprogramando.fecha, horarioReprogramando.especialistaSeleccionado, horarioReprogramando.horaInicioRaw, horarioReprogramando.horaFinRaw)}
        `;

        let botonesReprogramar = citaContainer.querySelector('.footer-modal');
        if (botonesReprogramar) botonesReprogramar.remove();
        botonesReprogramar = document.createElement('div');
        botonesReprogramar.className = 'footer-modal';
        botonesReprogramar.style.marginTop = '0';
        botonesReprogramar.style.marginBottom = '18px';
        botonesReprogramar.innerHTML = `<button id="btnReservarReprogramado" class="btn-reservar">Reservar</button>
                                        <button id="btnPagarReprogramado" class="btn-pagar">Pagar</button>`;

        citaContainer.appendChild(botonesReprogramar);
    }

    // ——— 2) actualizarEventosVisuales: usa horaInicioRaw / horaFinRaw ———
    function actualizarEventosVisuales(render = true) {
        // 1) Limpia sólo los eventos del tipo 'seleccionado'
        cal.removeEvents("reprogramacion");
        cal.removeEvents('seleccionado');
        if (!render) return;

        // 2) Añade cada bloque con su horaInicioRaw/horaFinRaw exacta
        horariosSeleccionados
            .filter(h => h.idespecialista === selectedespecialista)
            .forEach(h => {
                calendar.addEvent({
                    title: `<span class="fc-slot-horario">${formatearHora12h(h.horaInicioRaw)} - ${formatearHora12h(h.horaFinRaw)}</span>`,
                    start: `${h.fecha}T${h.horaInicioRaw}`,
                    end: `${h.fecha}T${h.horaFinRaw}`,
                    display: 'background',
                    classNames: ['fc-slot-custom-content', 'horario-seleccionado'],
                    extendedProps: { tipo: 'seleccionado' }
                });
            });
    }

    function refrescarCitas(idservicio, idespecialista, idarea, idsubarea, filtro = null) {
        api.obtenerCitas({
            idservicio: (idespecialista || selectedespecialista ? null : idservicio ?? selectedservicio),
            idespecialista: idespecialista ?? selectedespecialista,
            idarea: (idespecialista || selectedespecialista ? null : idarea ?? selectedarea),
            idsubarea: (idespecialista || selectedespecialista ? null : idsubarea ?? selectedsubarea)
        })
            .then(function (citas) {
                const citasFiltradas = filtro ? citas.filter(filtro) : citas;

                events = procesarYMostrarCitas(cal, citasFiltradas, idespecialista ?? selectedespecialista);
                events.forEach(event => calendar.addEvent(event));
                citasActuales = citasFiltradas; // opcionalmente guarda filtradas
            })
            .catch((e) => {
                console.log(e);
                mostrarMensajeFlotante("Error al cargar citas");
            });
    }

    function obtenerIntervalos(calendar) {
        const slotMinTime = calendar?.view?.calendar?.options?.slotMinTime || "08:00:00";
        const slotMaxTime = calendar?.view?.calendar?.options?.slotMaxTime || "18:00:00";
        const slotLabelInterval = calendar?.view?.calendar?.options?.slotLabelInterval?.minutes || 30;

        const [hInicio, mInicio] = slotMinTime.split(":").map(Number);
        const [hFin, mFin] = slotMaxTime.split(":").map(Number);

        const start = new Date();
        start.setHours(hInicio, mInicio, 0, 0);

        const end = new Date();
        end.setHours(hFin, mFin, 0, 0);

        const intervalos = [];

        while (start < end) {
            const horas = start.getHours().toString().padStart(2, "0");
            const minutos = start.getMinutes().toString().padStart(2, "0");

            const value = `${horas}:${minutos}`;
            const text = new Intl.DateTimeFormat("es-PE", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }).format(start);

            intervalos.push({ text, value });
            start.setMinutes(start.getMinutes() + slotLabelInterval);
        }
        return intervalos;
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
});   