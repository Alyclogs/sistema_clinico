import api from '../utils/api.js';
import { formatearHora12h } from '../utils/date.js';
import { estadosCita, getSVGCita, procesarYMostrarCitas } from '../utils/cita.js';
import { calendarUI, updateCalendarDateRange } from '../utils/calendar.js';

const calendarEl = document.getElementById('calendar');
const miniCalendarEl = document.getElementById('mini-calendar');

const baseurl = "http://localhost/SistemaClinico/";
let selectedespecialista = '';
let citasEspecialista = [];

document.addEventListener('DOMContentLoaded', function () {
    const cal = new calendarUI();
    const header = document.querySelector('.cabecera');
    const calendar = cal.buildCalendar(calendarEl);
    const miniCalendar = cal.buildMiniCalendar(miniCalendarEl);

    $.get('./menuPerfil.php', function (html) {
        header.innerHTML = html;
        selectedespecialista = document.getElementById('idespecialista').value;
        console.log(selectedespecialista);
        obtenerCitasEspecialista();
    });
    calendar.render();
    updateCalendarDateRange(calendar);

    function obtenerCitasEspecialista() {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaHoy = `${yyyy}-${mm}-${dd}`;

        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        const yyyyM = manana.getFullYear();
        const mmM = String(manana.getMonth() + 1).padStart(2, '0');
        const ddM = String(manana.getDate()).padStart(2, '0');
        const fechaManana = `${yyyyM}-${mmM}-${ddM}`;

        const citas = api.obtenerCitas({ idespecialista: selectedespecialista });
        const citasHoyPromise = api.obtenerCitas({ idespecialista: selectedespecialista, filtro: { fecha: fechaHoy } });
        const citasMananaPromise = api.obtenerCitas({ idespecialista: selectedespecialista, filtro: { fechainicio: fechaManana } });

        Promise.all([citas, citasHoyPromise, citasMananaPromise]).then(([citas, citasHoy, citasManana]) => {
            if (citas.length == 0) return;

            const citasDiaContainer = document.querySelector('.citas-dia-container');
            citasDiaContainer.innerHTML = '';

            if (citasHoy.length === 0) {
                citasDiaContainer.innerHTML += '<p class="mb-4">No hay citas para el día de hoy.</p>';
            } else {
                const ahora = new Date();
                let citaActual = null;

                // Buscar la cita actual
                citasHoy.forEach(cita => {
                    const fechaInicio = new Date(`${fechaHoy}T${cita.hora_inicio}`);
                    const fechaFin = new Date(`${fechaHoy}T${cita.hora_fin}`);
                    console.log(fechaInicio, fechaFin, ahora >= fechaInicio, ahora < fechaFin);

                    if (ahora >= fechaInicio && ahora < fechaFin) {
                        citaActual = cita;
                    }
                });

                if (citaActual) {
                    const citaActualElement = crearCita(citaActual);
                    const botonesAsistio = document.createElement('div');
                    botonesAsistio.className = 'botones-asistio';
                    botonesAsistio.innerHTML = `
                    <div class="boton-asistio"><div class="circulo-check"></div>Asistió</div>
                    <div class="boton-asistio"><div class="circulo-check"></div>No asistió</div>`
                    citaActualElement.classList.add('cita-actual');
                    citasDiaContainer.prepend(botonesAsistio, citaActualElement);

                    // Remover la cita actual del array para no duplicarla abajo
                    citasHoy = citasHoy.filter(c => c !== citaActual);
                }

                // Añadir el resto de citas
                citasHoy.forEach(cita => {
                    const citaElement = crearCita(cita);
                    citasDiaContainer.appendChild(citaElement);
                });
            }

            const citasContainer = document.querySelector('.citas-container');
            citasContainer.innerHTML = '';
            if (citasManana.length === 0) {
                citasContainer.innerHTML += '<p class="mb-4">No hay citas para mostrar.</p>';
            } else {
                citasManana.forEach(cita => {
                    const citaElement = crearCita(cita);
                    citasContainer.appendChild(citaElement);
                });
            }

            procesarYMostrarCitas(cal, citas, selectedespecialista);
        }).catch(error => {
            console.error('Error al obtener citas:', error);
        });
    }

    function crearCita(cita) {
        const estado = `cita-${estadosCita[cita.idestado]}`;
        const citaElement = document.createElement('div');
        citaElement.className = `cita-container ${estado}`;
        citaElement.innerHTML = `<div class="cita-grupos" style="justify-content: space-between";>
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
            ${getSVGCita(estado, 'big')}
        </div></div></div>`;
        return citaElement;
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