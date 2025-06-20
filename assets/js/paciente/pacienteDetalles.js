import api from '../utils/api.js';
import { calcularEdad } from '../utils/date.js';

const baseurl = "http://localhost/SistemaClinico/";

document.addEventListener('DOMContentLoaded', function () {
    let fnacPaciente = document.getElementById('pacienteEdad').textContent;
    document.getElementById('pacienteEdad').textContent += ` - ${calcularEdad(fnacPaciente)} años`;
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Empieza a escribir...',
    });
    listarResumenes();

    function listarResumenes() {
        api.obtenerResumenes(document.getElementById('citaId').value).then(function (resumenes) {
            const resumenList = document.getElementById('pacienteResumenes');
            resumenList.innerHTML = '';
            resumenes.forEach(resumen => {
                const resumenItem = document.createElement('div');
                resumenItem.className = 'paciente-container';
                resumenItem.innerHTML = `
                    <p>${resumen.resumen}</p>
                    <button class="btn btn-danger btn-sm float-end" onclick="eliminarResumen(${resumen.id})">Eliminar</button>
                `;
                resumenList.appendChild(resumenItem);
            });
        });
    }

    document.addEventListener('click', function (e) {
        if (e.target.id === 'btnGuardarResumen') {
            const resumenData = {
                idpaciente: document.getElementById('pacienteId').value,
                idcita: document.getElementById('citaId').value,
                resumen: quill.root.innerHTML
            }

            $.ajax({
                type: 'POST',
                url: baseurl + 'controllers/Resumen/ResumenController.php?action=create',
                data: { data: JSON.stringify(resumenData) },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        listarResumenes();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo guardar el resumen',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                console.error('Respuesta del servidor:', jqXHR.responseText);
            });
        }
    })
})