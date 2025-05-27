const baseurl = "http://localhost/SistemaClinico/";

function fetchEstados() {
    $.get(baseurl + "controllers/Estados/EstadoController.php?action=read", function (data) {
        let html = '';
        data.forEach(function (estado) {
            html += `<tr>
                <td>${estado.idestado}</td>
                <td>${estado.estado}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-edit-estado" data-id="${estado.idestado}" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete-estado" data-id="${estado.idestado}" title="Eliminar">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            </tr>`;
        });
        $("#tablaEstadosBody").html(html);
    }, 'json');
}

$(document).ready(function () {
    fetchEstados();
    const estadoModal = new bootstrap.Modal(document.getElementById('estadoModal'));

    // Abrir modal para AGREGAR estado
    $('.btn-add-estado').on('click', function () {
        $('#estadoModalLabel').text('Agregar Nuevo Estado');
        $.get('formEstado.php', function (formHtml) {
            $('#estadoModalBody').html(formHtml);
            estadoModal.show();
        });
    });

    // Abrir modal para EDITAR estado
    $('#tablaEstadosBody').on('click', '.btn-edit-estado', function () {
        const idestado = $(this).data('id');
        $('#estadoModalLabel').text('Editar Estado (ID: ' + idestado + ')');
        $.get('formEstado.php', { idestado: idestado }, function (formHtml) {
            $('#estadoModalBody').html(formHtml);
            estadoModal.show();
        });
    });

    // Guardar estado (Agregar o Editar)
    $(document).on('click', '#btnGuardarEstado', function () {
        const formEstado = $('#formEstado');
        if (formEstado[0].checkValidity()) {
            const formData = formEstado.serialize();
            const idestado = $('#idestado').val();
            let url;
            if (idestado) {
                url = baseurl + 'controllers/Estados/EstadoController.php?action=update';
            } else {
                url = baseurl + 'controllers/Estados/EstadoController.php?action=create';
            }
            $.ajax({
                type: 'POST',
                url: url,
                data: formData,
                dataType: 'json',
                success: function (response) {
                    var mensaje = document.getElementById('mensajeEstado');
                    mensaje.textContent = '';
                    mensaje.textContent = response.message;
                    mensaje.className = response.success ? 'alert alert-success' : 'alert alert-danger';
                    fetchEstados();
                    estadoModal.hide();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            });
        } else {
            formEstado[0].reportValidity();
        }
    });

    // Eliminar estado
    $('#tablaEstadosBody').on('click', '.btn-delete-estado', function () {
        const idestado = $(this).data('id');
        if (confirm('¿Está seguro de que desea eliminar el estado ID: ' + idestado + '?')) {
            $.ajax({
                type: 'POST',
                url: baseurl + 'controllers/Estados/EstadoController.php?action=delete&idestado=' + idestado,
                dataType: 'json',
                success: function (response) {
                    alert(response.message);
                    fetchEstados();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            });
        }
    });
});
