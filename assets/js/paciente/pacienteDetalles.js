import api from '../utils/api.js';
import { calcularEdad, formatearFecha, formatearHora12h } from '../utils/date.js';
import { mostrarMensajeFlotante } from '../utils/utils.js';

const baseurl = "http://localhost/SistemaClinico/";
let selectedcita = '';
let citasList = [];
let ultimacitaId = '';
let selectedresumen = '';
let resumenesList = [];
let idxResumenEditando = null;
let idxCitaEditando = null;
let lastSelectedCita = '';
let lastSelectedEl = null;

const especialistaActual = document.getElementById('idUsuario').value;

async function listarResumenes() {
    const citasPacientePromise = api.obtenerCitas({ idpaciente: document.getElementById('pacienteId').value });
    const citasPacienteDiaPromise = api.obtenerCitas({ idpaciente: document.getElementById('pacienteId').value, filtro: { fecha: formatearFecha(new Date()) } });
    const resumenesPacientePromise = api.obtenerResumenes('', document.getElementById('pacienteId').value);

    return Promise.all([citasPacientePromise, citasPacienteDiaPromise, resumenesPacientePromise]).then(([citas, citasdia, resumenes]) => {
        resumenesList = resumenes;
        citasList = citas;
        if (citas.length && citas.length > 1) {
            const ultimoResumenEl = document.getElementById('resumenUltimaCita');
            const ultimacita = citasdia.length ? citasdia[0] : citas[citas.length - 1]; // Citas en orden descendente por fecha
            const ultimoresumen = resumenes.find(r => r.idcita === ultimacita.idcita);
            const citasSinResumen = citas.filter(c => !c.resumen_id);
            ultimoResumenEl.outerHTML = ultimacita.resumen_id && ultimoresumen ? crearUltimoResumen(ultimoresumen).outerHTML : crearResumenBlanco(ultimacita).outerHTML;

            const resumenList = document.getElementById('pacienteResumenes');
            resumenList.innerHTML = '';
            if (ultimacita.resumen_id) {
                selectedcita = `${citasSinResumen[citasSinResumen.length - 1].idcita}`;
                document.getElementById("editorResumenTitulo").textContent = `Resumen de la cita ${citas.find(c => c.idcita == parseInt(selectedcita)).fecha}`;
                citas = citas.filter(c => c.idcita !== parseInt(selectedcita));
            } else {
                selectedcita = `${ultimacita.idcita}`;
                document.getElementById("editorResumenTitulo").textContent = `Resumen de la cita ${citas.find(c => c.idcita == parseInt(selectedcita)).fecha}`;
            }
            ultimacitaId = ultimacita.idcita ? `${ultimacita.idcita}` : '';
            selectedresumen = selectedcita.resumen_id ? `${selectedcita.resumen_id}` : '';

            citas.forEach(cita => {
                if (cita.resumen_id) {
                    const resumen = resumenes.find(r => r.idcita === cita.idcita);
                    const resumenItem = crearResumen(resumen, cita.idespecialista === parseInt(especialistaActual));
                    resumenList.prepend(resumenItem);
                } else {
                    if (cita.idcita !== ultimacita.idcita) {
                        const resumenItem = crearResumenBlanco(cita);
                        resumenList.appendChild(resumenItem);
                    }
                }
            });
        } else if (citas.length && citas.length == 1) {
            const ultimoResumenEl = document.getElementById('resumenUltimaCita');
            const ultimacita = citasdia.length ? citasdia[0] : citas[0]; // Citas en orden descendente por fecha
            const ultimoresumen = resumenes.find(r => r.idcita === ultimacita.idcita);
            ultimoResumenEl.outerHTML = ultimacita.resumen_id && ultimoresumen ? crearUltimoResumen(ultimoresumen).outerHTML : crearResumenBlanco(ultimacita).outerHTML;

            const resumenList = document.getElementById('pacienteResumenes');
            resumenList.innerHTML = '';
            selectedcita = `${ultimacita.idcita}`;
            ultimacitaId = `${ultimacita.idcita}`;
            selectedresumen = ultimoresumen ? `${ultimoresumen.idresumen}` : '';
        }
    })
}

function crearResumenBlanco(cita) {
    const resumenItem = document.createElement('div');
    resumenItem.className = 'paciente-container';
    resumenItem.dataset.idcita = cita.idcita;
    resumenItem.innerHTML = `<div class="container-body">
                <div class="detalles-row">
                <img class="avatar" width="32px" height="32px" src="${cita.especialista_foto}">
                <div class="datos-especialista">
                <div class="paciente-detalles">
                <span class="subtitle-bold" style="margin-bottom: 0">${cita.especialista_nombres} ${cita.especialista_apellidos} (${cita.cita_servicio} ${cita.cita_area})</span>
                <span>${formatearHora12h(cita.hora_inicio)} - ${cita.fecha}</span>
                </div></div></div>
                <div class="contenido-resumen">
                <span class="texto-bloque">Esta cita no tiene asignada un resumen.</span>
                <div class="botones-resumen">
                <button id="btnAsignarResumen" class="btn btn-default btn-resumen" data-idcita="${cita.idcita}">Asignar resumen</button>
                </div></div></div>`;

    return resumenItem;
}

function crearResumen(resumen) {
    const resumenItem = document.createElement('div');
    resumenItem.className = 'paciente-container';
    resumenItem.dataset.id = resumen.idresumen;
    resumenItem.innerHTML = `<div class="container-body">
        <div class="resumen-element">
        <div class="resumen-bloque">
        <div class="detalles-row">
        <img class="avatar" width="32px" height="32px" src="${resumen.especialista_foto}">
        <div class="datos-especialista">
        <div class="paciente-detalles">
        <span class="subtitle-bold" style="margin-bottom: 0">${resumen.especialista_nombres} ${resumen.especialista_apellidos} (${resumen.cita_servicio} ${resumen.cita_area})</span>
        <span>${formatearHora12h(resumen.cita_hora_inicio)} - ${resumen.fechahora}</span>
        </div></div></div>
        <span class="texto-bloque">${resumen.resumen}</span>
        </div>
        <div class="botones-resumen" style="padding: 0px;">
        <button id="btnEditarResumen" class="boton-circular btn btn-sm rounded-circle" data-id="${resumen.idresumen}">
<svg id="INFO_PACIENTE" data-name="INFO PACIENTE" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 8.99" style="width: 24px; height: 24px;">
  <defs>
    <style>
      .cls-016 {
        fill: #76869e;
      }
    </style>
  </defs>
  <path class="cls-016" d="M8.72,1.86l-1.59-1.59c-.37-.37-.97-.37-1.34,0L.58,5.48c-.07.07-.07.14-.08.15L0,8.67c-.01.08.01.18.08.24.06.07.15.1.24.08l3.04-.49s.08-.01.15-.08l5.2-5.22c.38-.37.38-.97,0-1.34ZM3.32,7.81l-.87-.87,3.68-3.68.87.87-3.68,3.68ZM2.04,6.54s-.93-.93-.87-.87l3.68-3.68.87.87-3.68,3.68ZM.62,8.37l.34-2.11,1.76,1.76-2.09.35ZM8.33,2.8l-.93.93-2.14-2.14.93-.93c.14-.14.39-.14.55,0l1.59,1.59c.15.15.15.39,0,.55Z"/>
</svg></button>
        <button id="btnEliminarResumen" class="boton-circular btn btn-sm rounded-circle" data-id="${resumen.idresumen}">
<svg id="INFO_PACIENTE" data-name="INFO PACIENTE" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7.87 9" style="width: 24px; height: 24px;">
  <defs>
    <style>
      .cls-017 {
        fill: #76869e;
      }
    </style>
  </defs>
  <path class="cls-017" d="M7.32,2.25H.57c-.08,0-.15.03-.2.09-.05.06-.08.13-.08.21l.25,5.65c.02.45.39.8.84.8h5.12c.45,0,.82-.35.84-.8l.25-5.65c0-.08-.02-.15-.08-.21s-.13-.09-.2-.09h0ZM6.78,8.17c0,.15-.13.27-.28.27H1.38c-.15,0-.27-.12-.28-.27l-.24-5.36h6.16l-.24,5.36Z"/>
  <path class="cls-017" d="M2.46,7.32s0,0,.01,0c.16,0,.28-.14.27-.29l-.13-3.09c0-.16-.14-.28-.29-.27-.16,0-.28.14-.27.29l.13,3.09c0,.15.13.27.28.27h0Z"/>
  <path class="cls-017" d="M5.41,7.32s0,0,.01,0c.15,0,.27-.12.28-.27l.13-3.09c0-.16-.11-.29-.27-.29-.15,0-.29.11-.29.27l-.13,3.09c0,.16.11.29.27.29h0Z"/>
  <path class="cls-017" d="M7.59,1.12h-1.69v-.28c0-.47-.38-.84-.84-.84h-2.25c-.47,0-.84.38-.84.84v.28H.28c-.12,0-.23.08-.27.19-.06.19.08.37.27.37h7.31c.12,0,.23-.08.27-.19.06-.19-.08-.37-.27-.37ZM2.53,1.12v-.28c0-.16.13-.28.28-.28h2.25c.16,0,.28.13.28.28v.28h-2.81Z"/>
  <path class="cls-017" d="M4.22,7.03v-3.08c0-.14-.11-.27-.25-.29-.17-.02-.31.11-.31.28v3.09c0,.17.14.3.31.28.14-.02.25-.14.25-.29Z"/>
</svg></button>
        </div></div></div>`;

    return resumenItem;
}

function crearUltimoResumen(resumen) {
    const resumenItem = document.createElement('div');
    resumenItem.className = 'paciente-container';
    resumenItem.dataset.idresumen = resumen.idresumen;
    resumenItem.innerHTML = `<div class="container-body">
        <div class="detalles-row">
        <img class="avatar" width="32px" height="32px" src="${resumen.especialista_foto}">
        <div class="datos-especialista">
        <div class="paciente-detalles">
        <span class="subtitle-bold" style="margin-bottom: 0">${resumen.especialista_nombres} ${resumen.especialista_apellidos} (${resumen.cita_servicio} ${resumen.cita_area})</span>
        <span>${formatearHora12h(resumen.cita_hora_inicio)} - ${resumen.fechahora}</span>
        </div></div></div>
        <div class="contenido-resumen">
        <span class="texto-bloque">${resumen.resumen}</span></div>
        <div class="botones-resumen">
        <button id="btnVerResumenes" class="btn btn-default btn-resumen" data-idresumen="${resumen.idresumen}">Ver resúmenes</button>
        </div></div>`;

    return resumenItem;
}

document.addEventListener('DOMContentLoaded', function () {
    let fnacPaciente = document.getElementById('pacienteEdad').textContent;
    document.getElementById('pacienteEdad').textContent += ` - ${calcularEdad(fnacPaciente)} años`;
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Empieza a escribir...',
    });
    let quill2 = null;
    listarResumenes();

    document.addEventListener('click', function (e) {
        if (e.target.closest('#btnGuardarResumen')) {
            if (!selectedcita) {
                mostrarMensajeFlotante('Debe seleccionar una cita primero');
                return;
            }
            if (quill.root.innerHTML === '') {
                mostrarMensajeFlotante('El resumen no puede estar vacío');
                return;
            }
            const resumenData = {
                idcita: selectedcita,
                fechahora: new Date().toISOString(),
                resumen: quill.root.innerHTML
            }

            $.ajax({
                type: 'POST',
                url: baseurl + 'controllers/Resumen/ResumenController.php?action=create',
                data: { data: JSON.stringify(resumenData) },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        selectedcita = '';
                        quill.root.innerHTML = '';
                        listarResumenes();
                    } else {
                        console.log(response.error);
                        mostrarMensajeFlotante('No se pudo guardar el resumen');
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    mostrarMensajeFlotante('No se pudo guardar el resumen');
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                mostrarMensajeFlotante('No se pudo guardar el resumen');
                console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                console.error('Respuesta del servidor:', jqXHR.responseText);
            });
        }
        if (e.target.closest('#btnActualizarResumen')) {
            console.log(quill2?.root.innerHTML);
            if (!selectedcita) {
                mostrarMensajeFlotante('Debe seleccionar una cita primero');
                return;
            }
            if (quill2?.root.innerHTML === '') {
                mostrarMensajeFlotante('El resumen no puede estar vacío');
                return;
            }

            const resumenData = {
                idresumen: selectedresumen,
                idcita: selectedcita,
                fechahora: new Date().toISOString(),
                resumen: quill2?.root.innerHTML
            }

            $.ajax({
                type: 'POST',
                url: baseurl + 'controllers/Resumen/ResumenController.php?action=update',
                data: { data: JSON.stringify(resumenData) },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        selectedcita = '';
                        selectedresumen = '';
                        idxResumenEditando = null;
                        listarResumenes();
                    } else {
                        console.log(response.error);
                        mostrarMensajeFlotante('No se pudo actualizar el resumen');
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    mostrarMensajeFlotante('No se pudo actualizar el resumen');
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                mostrarMensajeFlotante('No se pudo actualizar el resumen');
                console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                console.error('Respuesta del servidor:', jqXHR.responseText);
            });
        }
        if (e.target.closest('#btnEditarResumen')) {
            if (idxResumenEditando !== selectedresumen) {
                selectedresumen = e.target.closest('#btnEditarResumen').dataset.idresumen;
                selectedcita = e.target.closest('#btnEditarResumen').dataset.idcita;
                const resumenEl = document.querySelector(`.paciente-container[data-idresumen="${selectedresumen}"]`);
                const textoResumen = resumenEl.querySelector('.texto-bloque').textContent;
                const container = resumenEl.querySelector('.texto-bloque');

                container.outerHTML = `<div id="editorResumenSeleccionado"></div>
            <div class="botones-resumen">
                <button class="btn" id="btnCancelarEditarResumen">Cancelar</button>
                <button class="btn btn-default" id="btnActualizarResumen">Actualizar</button>
            </div>`;

                quill2 = new Quill('#editorResumenSeleccionado', {
                    theme: 'snow',
                    placeholder: 'Empieza a escribir...',
                });
                quill2.root.innerHTML = textoResumen;
                idxResumenEditando = selectedresumen;
            }
        }
        if (e.target.closest('#btnVerResumenes')) {
            document.getElementById('editorResumen').style.display = '';
            document.getElementById('pacienteResumenes').style.display = '';

            if (selectedresumen) {
                const resumenEl = document.querySelector(`.paciente-container[data-idresumen="${selectedresumen}"]`);
                const textoResumen = resumenEl.querySelector('.texto-bloque').textContent;
                quill.root.innerHTML = textoResumen;
            }
        }
        if (e.target.closest('#btnAsignarResumen')) {
            selectedcita = e.target.closest('#btnAsignarResumen').dataset.idcita;
            const resumenEl = document.querySelector(`.paciente-container[data-idcita="${selectedcita}"]`);
            console.log(selectedcita);

            if (selectedcita !== ultimacitaId) {
                const container = resumenEl.querySelector('.texto-bloque');
                const botones = resumenEl.querySelector('.botones-resumen');

                if (idxCitaEditando !== lastSelectedCita) {
                    lastSelectedEl = `${container.outerHTML}${botones.outerHTML}`;
                    botones.remove();

                    container.outerHTML = `<div id="editorResumenSeleccionado"></div>
            <div class="botones-resumen">
                <button class="btn" id="btnCancelarEditarResumen">Cancelar</button>
                <button class="btn btn-default" id="btnActualizarResumen">Actualizar</button>
            </div>`;

                    quill2 = new Quill('#editorResumenSeleccionado', {
                        theme: 'snow',
                        placeholder: 'Empieza a escribir...',
                    });
                    lastSelectedCita = selectedcita;
                    idxCitaEditando = lastSelectedCita;
                } else {
                    const lastResumenEl = document.querySelector(`.paciente-container[data-idcita="${lastSelectedCita}"]`);
                    resumenEl.querySelector('.texto-bloque');
                }
            } else {
                document.getElementById('editorResumen').style.display = '';
                document.getElementById('pacienteResumenes').style.display = '';
            }
        }
        if (e.target.closest('#btnCancelarResumen')) {
            document.getElementById('editorResumen').style.display = 'none';
            document.getElementById('pacienteResumenes').style.display = 'none';
            quill.root.innerHTML = '';
        }
        if (e.target.closest('#btnCancelarEditarResumen')) {
            listarResumenes();
        }
    })
})