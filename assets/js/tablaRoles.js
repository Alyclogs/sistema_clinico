const baseurl = "http://localhost/SistemaClinico/";

function fetchRoles() {
    $.get(baseurl + "controllers/Roles/RoleController.php?action=read", function (data) {
        let html = '';
        data.forEach(function (rol) {
            html += `<tr>
                <td>${rol.idrol}</td>
                <td>${rol.rol}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-edit-rol" data-id="${rol.idrol}" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete-rol" data-id="${rol.idrol}" title="Eliminar">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            </tr>`;
        });
        $("#tablaRolesBody").html(html);
    }, 'json');
}

$(document).ready(function () {
    fetchRoles();
    const rolModal = new bootstrap.Modal(document.getElementById('rolModal'));

    // Abrir modal para AGREGAR rol
    $('.btn-add-rol').on('click', function () {
        $('#rolModalLabel').text('Agregar Nuevo Rol');
        $.get('formRol.php', function (formHtml) {
            $('#rolModalBody').html(formHtml);
            rolModal.show();
        });
    });

    // Abrir modal para EDITAR rol
    $('#tablaRolesBody').on('click', '.btn-edit-rol', function () {
        const idrol = $(this).data('id');
        $('#rolModalLabel').text('Editar Rol (ID: ' + idrol + ')');
        $.get('formRol.php', { idrol: idrol }, function (formHtml) {
            $('#rolModalBody').html(formHtml);
            rolModal.show();
        });
    });

    // Guardar rol (Agregar o Editar)
    $(document).on('click', '#btnGuardarRol', function () {
        const formRol = $('#formRol');
        if (formRol[0].checkValidity()) {
            const formData = formRol.serialize();
            const idrol = $('#idrol').val();
            let url;
            if (idrol) {
                url = baseurl + 'controllers/Roles/RoleController.php?action=update';
            } else {
                url = baseurl + 'controllers/Roles/RoleController.php?action=create';
            }
            $.ajax({
                type: 'POST',
                url: url,
                data: formData,
                dataType: 'json',
                success: function (response) {
                    var mensaje = document.getElementById('mensajeRol');
                    mensaje.textContent = '';
                    mensaje.textContent = response.message;
                    mensaje.className = response.success ? 'alert alert-success' : 'alert alert-danger';
                    fetchRoles();
                    rolModal.hide();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            });
        } else {
            formRol[0].reportValidity();
        }
    });

    // Eliminar rol
    $('#tablaRolesBody').on('click', '.btn-delete-rol', function () {
        const idrol = $(this).data('id');
        if (confirm('¿Está seguro de que desea eliminar el rol ID: ' + idrol + '?')) {
            $.ajax({
                type: 'POST',
                url: baseurl + 'controllers/Roles/RoleController.php?action=delete&idrol=' + idrol,
                dataType: 'json',
                success: function (response) {
                    alert(response.message);
                    fetchRoles();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            });
        }
    });
});
