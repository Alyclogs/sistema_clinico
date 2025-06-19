import api from "../utils/api.js";
import { obtenerCitasEspecialista } from "../utils/cita.js";
import { formatearFecha, ajustarFecha } from "../utils/date.js";
import { calendarUI } from '../utils/calendar.js';

const baseurl = "http://localhost/SistemaClinico/";
let fechaSeleccionada = '';
let selectedespecialista = '';

async function listarCitas() {
    selectedespecialista = document.getElementById('idespecialista').value;
    await obtenerCitasEspecialista(selectedespecialista, fechaSeleccionada);
}

document.addEventListener('DOMContentLoaded', function () {
    const cal = new calendarUI();
    const miniCalendarCitaEl = document.getElementById('mini-calendar-cita');
    const miniCalendarCita = cal.buildMiniCalendar(miniCalendarCitaEl);
    const hoy = new Date();
    fechaSeleccionada = formatearFecha(hoy);

    listarCitas();

    $('#btnAbrirCalendarioCita').on('click', function () {
        const calendarmodal = document.getElementById('minicalendarCitaModal');
        if (calendarmodal.style.display === 'none') {
            calendarmodal.style.display = 'flex';
            miniCalendarCita.render();
        } else {
            calendarmodal.style.display = 'none';
        }
    });

    $('.citas-container').on('click', '.botones-asistio', function (e) {
        let asistio = false;
        const idcita = $(this).data('id');

        asistio = e.target.closest('.boton-asistio').id === "btnAsistio" ?? false;
        api.obtenerCitas({ idcita }).then(cita => {
            cita.asistio = asistio;
            $.ajax({
                type: 'POST',
                url: baseurl + 'controllers/Citas/CitasController.php?action=update',
                data: { data: JSON.stringify(cita) },
                dataType: 'json',
                success: async function (response) {
                    if (response.success) {
                        await obtenerCitasEspecialista(selectedespecialista, fechaSeleccionada);
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

    $('#prev-day').on('click', async function () {
        fechaSeleccionada = ajustarFecha(fechaSeleccionada, -1);
        await obtenerCitasEspecialista(selectedespecialista, fechaSeleccionada);
    });

    $('#next-day').on('click', async function () {
        fechaSeleccionada = ajustarFecha(fechaSeleccionada, 1);
        await obtenerCitasEspecialista(selectedespecialista, fechaSeleccionada);
    });

    miniCalendarCita.setOption('dateClick', async function (info) {
        fechaSeleccionada = info.dateStr;
        await obtenerCitasEspecialista(selectedespecialista, fechaSeleccionada);
        document.getElementById('minicalendarCitaModal').style.display = 'none';
    });
});