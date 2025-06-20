import { procesarYMostrarCitas } from '../utils/cita.js';
import { calendarUI, updateCalendarDateRange } from '../utils/calendar.js';
import { actualizarDisponibilidadEspecialista } from '../utils/especialista.js';
import api from '../utils/api.js';

const calendarEl = document.getElementById('calendar');
const miniCalendarEl = document.getElementById('mini-calendar');

let selectedespecialista = '';
const baseurl = "http://localhost/SistemaClinico/";

document.addEventListener('DOMContentLoaded', function () {
    const cal = new calendarUI();
    const header = document.querySelectorAll('.cabecera');
    const calendar = cal.buildCalendar(calendarEl);
    const miniCalendar = cal.buildMiniCalendar(miniCalendarEl, calendar);

    $.get('./menuPerfil.php', function (html) {
        header.forEach(h => h.innerHTML = html);
        selectedespecialista = document.getElementById('idespecialista').value;

        updateCalendarDateRange(calendar);
        actualizarDisponibilidadEspecialista(calendar, selectedespecialista).then(disponibilidad => {
            api.obtenerCitas({ idespecialista: selectedespecialista }).then((citas) => {
                procesarYMostrarCitas(cal, citas, selectedespecialista);
            });
        });
    });
    calendar.render();

    $('#btnAbrirCalendario').on('click', function () {
        const calendarmodal = document.getElementById('minicalendarModal');
        if (calendarmodal.style.display === 'none') {
            calendarmodal.style.display = 'flex';
            miniCalendar.render();
        } else {
            calendarmodal.style.display = 'none';
        }
    });

    $('.citas-container').on('click', '.cita-content', function () {
        const idpaciente = $(this).data('paciente');
        window.location.href = baseurl + `views/Doctor/pacientes/pacienteDetalles.php?idpaciente=${idpaciente}`;
    });
});