import api from '../utils/api.js';
import { formatearHora12h, formatearFecha } from '../utils/date.js';
import { estadosCita, getSVGCita, procesarYMostrarCitas } from '../utils/cita.js';
import { calendarUI, updateCalendarDateRange } from '../utils/calendar.js';
import { actualizarDisponibilidadEspecialista } from '../utils/especialista.js';

const calendarEl = document.getElementById('calendar');
const miniCalendarEl = document.getElementById('mini-calendar');
const miniCalendarCitaEl = document.getElementById('mini-calendar-cita');

const baseurl = "http://localhost/SistemaClinico/";
let selectedespecialista = '';
let fechaSeleccionada = '';

document.addEventListener('DOMContentLoaded', function () {
    const cal = new calendarUI();
    const header = document.querySelector('.cabecera');
    const calendar = cal.buildCalendar(calendarEl);
    const miniCalendar = cal.buildMiniCalendar(miniCalendarEl);
    const miniCalendarCita = cal.buildMiniCalendar(miniCalendarCitaEl);

    $.get('./menuPerfil.php', function (html) {
        header.innerHTML = html;
        selectedespecialista = document.getElementById('idespecialista').value;

        updateCalendarDateRange(calendar);
        actualizarDisponibilidadEspecialista(calendar, selectedespecialista).then(disponibilidad => {
            const hoy = new Date();
            fechaSeleccionada = formatearFecha(hoy);
            obtenerCitasEspecialista();
        });
    });
    calendar.render();

    function obtenerCitasEspecialista() {
        const citas = api.obtenerCitas({ idespecialista: selectedespecialista });
        const citasHoyPromise = api.obtenerCitas({ idespecialista: selectedespecialista, filtro: { fecha: fechaSeleccionada } });
        const citasContainer = document.querySelector('.citas-container');
        console.log(citasContainer);
        citasContainer.innerHTML = '';

        Promise.all([citas, citasHoyPromise]).then(([citas, citasHoy]) => {
            if (citas.length == 0) return;

            if (citasHoy.length === 0) {
                citasContainer.innerHTML += '<p class="mb-4">No hay citas para el día de hoy.</p>';
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
                    const citaActualElement = crearCita(citaActual);
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
                    const citaElement = crearCita(cita);
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
                            const citaSinMarcarElement = crearCita(cita);
                            citaSinMarcarElement.append(buildBotones(cita));
                            citasContainer.appendChild(citaSinMarcarElement);
                        })
                        citasPasadas = citasPasadas.filter(c => !citasSinMarcar.includes(c));
                    }
                    citasPasadas.forEach(cita => {
                        const citaPasadaElement = crearCita(cita);
                        if (cita.asistio == true) {
                            citaPasadaElement.classList.add('cita-asistio');
                        } else if (cita.asistio == false) {
                            citaPasadaElement.classList.add('cita-no-asistio');
                        }
                        citasContainer.appendChild(citaPasadaElement);
                    })
                }
            }

            procesarYMostrarCitas(cal, citas, selectedespecialista);
        }).catch(error => {
            citasContainer.innerHTML = '<div class="alert alert-danger">Error al obtener citas</div>';
            console.error('Error al obtener citas:', error);
        });
    }

    function crearCita(cita) {
        const estado = `cita-${estadosCita[cita.idestado]}`;
        const asistio = cita.asistio == true ? 'cita-asistio' : cita.asistio == false ? 'cita-no-asistio' : null;
        const extraClass = asistio ?? estado;
        const citaElement = document.createElement('div');
        citaElement.className = `cita-container`;
        citaElement.innerHTML = `<div class="cita-content ${estado} ${asistio}" data-id="${cita.idcita}">
        <div class="cita-grupos" style="justify-content: space-between";>
        <div class="cita-grupo">
                    <div class="cita-time">
            <span>${formatearHora12h(cita.hora_inicio)}</span>
            <span>${formatearHora12h(cita.hora_fin)}</span>
        </div>
        <div class="cita-paciente">
            <span>${cita.paciente_nombres} ${cita.paciente_apellidos}</span>
        </div></div>
        <div class="cita-grupo">
        <div class="cita-estado">
            ${getSVGCita(extraClass, 'big')}
        </div></div></div></div>`;
        return citaElement;
    }

    function buildBotones(cita) {
        const botonesAsistio = document.createElement('div');
        botonesAsistio.className = 'botones-asistio';
        botonesAsistio.dataset.id = cita.idcita;
        botonesAsistio.innerHTML = `
                    <button id="btnAsistio" class="btn btn-success boton-asistio">Asistió</button>
                    <button id="btnNoAsistio" class="btn btn-danger boton-asistio">No asistió</button>`;
        return botonesAsistio;
    }

    $('#btnAbrirCalendario').on('click', function () {
        const calendarmodal = document.querySelector('.minicalendar-modal');
        if (calendarmodal.style.display === 'none') {
            calendarmodal.style.display = 'flex';
            miniCalendar.render();
        } else {
            calendarmodal.style.display = 'none';
        }
    });

    $('#btnAbrirCalendarioCita').on('click', function () {
        const calendarmodal = document.querySelector('.minicalendar-modal');
        if (calendarmodal.style.display === 'none') {
            calendarmodal.style.display = 'flex';
            miniCalendar.render();
        } else {
            calendarmodal.style.display = 'none';
        }
    });

    $('.citas-container').on('click', '.botones-asistio', function (e) {
        let asistio = false;
        const idcita = $(this).data('id');
        const botones = this;

        asistio = e.target.id === "btnAsistio" ?? false;
        api.obtenerCitas({ idcita }).then(cita => {
            cita.asistio = asistio;
            $.ajax({
                type: 'POST',
                url: baseurl + 'controllers/Citas/CitasController.php?action=update',
                data: { data: JSON.stringify(cita) },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        $(botones).hide();
                        obtenerCitasEspecialista();
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                console.error('Respuesta del servidor:', jqXHR.responseText);
            }).catch(e => console.log(e));
        })
    })
});