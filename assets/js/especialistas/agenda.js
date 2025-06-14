import api from '../utils/api.js';
import { formatearHora12h } from '../utils/date.js';
import { estadosCita } from '../utils/cita.js';
import { buildCalendar, buildMiniCalendar } from '../utils/calendar.js';

const calendarEl = document.getElementById('calendar');
const miniCalendarEl = document.getElementById('mini-calendar');
const calendar = buildCalendar(calendarEl);
const miniCalendar = buildMiniCalendar(miniCalendarEl);

const baseurl = "http://localhost/SistemaClinico/";
let selectedespecialista = '';

function obtenerCitasEspecialista() {
    api.obtenerCitas({ idespecialista: selectedespecialista }).then(function (citas) {
        const citasContainer = document.getElementById('citas-dia-container');
        citasContainer.innerHTML = '';
        if (citas.length === 0) {
            citasContainer.innerHTML = '<p>No hay citas para este especialista.</p>';
            return;
        }
        citas.forEach(cita => {
            const citaElement = crearCita(cita);
            citasContainer.appendChild(citaElement);
        });
    });
}

function crearCita(cita) {
    const citaElement = document.createElement('div');
    citaElement.className = 'cita-container';
    citaElement.innerHTML = `
                <div class="cita-time">
        <span>${formatearHora12h(cita.hora_inicio)}</span>
        <span>${formatearHora12h(cita.hora_fin)}</span>
    </div>
    <div class="cita-paciente">
        <span>${cita.paciente_nombres}</span>
    </div>
    <div class="cita-estado">
        <span class="check-icon">&#10004;</span>
    </div>`;
    return citaElement;
}

document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.cabecera');
    $.get('./menuPerfil.php', function (html) {
        header.innerHTML = html;
        selectedespecialista = document.getElementById('idespecialista').value;
        console.log(selectedespecialista);
        obtenerCitasEspecialista();
    });
    calendar.render();
});