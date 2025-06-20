import { mostrarMensajeFlotante } from './utils.js';

const baseurl = "http://localhost/SistemaClinico/";

export default {
    obtenerSubareas: (idarea) => {
        return $.get(baseurl + `controllers/Subareas/SubareaController.php?action=read&idarea=${idarea}`, function (data) {
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
    },
    obtenerEspecialistas: ({ idservicio, idarea, idsubarea, idespecialista }) => {
        console.log(baseurl + `controllers/Especialistas/EspecialistaController.php?action=read${idarea ? `&idarea=${idarea}` : ''}${idservicio ? `&idservicio=${idservicio}` : ''}${idsubarea ? `&idsubarea=${idsubarea}` : ''}${idespecialista ? `&idespecialista=${idespecialista}` : ''}`);
        return $.get(baseurl + `controllers/Especialistas/EspecialistaController.php?action=read${idarea ? `&idarea=${idarea}` : ''}${idservicio ? `&idservicio=${idservicio}` : ''}${idsubarea ? `&idsubarea=${idsubarea}` : ''}${idespecialista ? `&idespecialista=${idespecialista}` : ''}`);
    },
    obtenerCitas: ({ idservicio, idespecialista, idarea, idsubarea, idcita, idpaciente, filtro = { fecha: '', fechainicio: '' } }) => {
        const params = new URLSearchParams({ action: 'read' });

        if (idservicio) params.append('idservicio', idservicio);
        if (idespecialista) params.append('idespecialista', idespecialista);
        if (idarea) params.append('idarea', idarea);
        if (idsubarea) params.append('idsubarea', idsubarea);
        if (idcita) params.append('idcita', idcita);
        if (idpaciente) params.append('idpaciente', idpaciente);
        if (filtro.fecha) params.append("fecha", filtro.fecha);
        if (filtro.fechainicio) params.append("fechainicio", filtro.fechainicio);

        const url = baseurl + 'controllers/Citas/CitasController.php?' + params.toString();
        console.log(url);
        return $.get(url);
    },
    obtenerServicios: () => {
        return $.get(baseurl + 'controllers/Servicios/ServicioController.php?action=read');
    },
    obtenerDisponibilidadEspecialista: (idespecialista) => {
        return $.get(baseurl + `controllers/Disponibilidad/DisponibilidadController.php?action=read&idespecialista=${idespecialista}`);
    },
    obtenerResumenes: (idcita, idpaciente) => {
        console.log(baseurl + `controllers/Resumen/ResumenController.php?action=read${idcita ? `&idcita=${idcita}` : ''}&idpaciente=${idpaciente}`);
        return $.get(baseurl + `controllers/Resumen/ResumenController.php?action=read${idcita ? `&idcita=${idcita}` : ''}&idpaciente=${idpaciente}`);
    },
    agendarPaciente: ({ data, onSuccess, onError }) => {
        $.ajax({
            type: 'POST',
            url: baseurl + 'controllers/Pacientes/PacienteController.php?action=create',
            data: { data: JSON.stringify(data) },
            dataType: 'json',
            success: (response) => onSuccess(response),
            error: (jqXHR, textStatus, errorThrown) => onError(jqXHR, textStatus, errorThrown)
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
            console.error('Respuesta del servidor:', jqXHR.responseText);
        });
    },
}