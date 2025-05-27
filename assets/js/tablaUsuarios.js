const baseurl = "http://localhost/SistemaClinico/";

function fetchUsers() {
    $.get(baseurl + "controllers/Users/UserController.php?action=read", function (data) {
        let html = '';
        data.forEach(function (usuario) {
            let clase_badge_rol = 'bg-info';
            if (usuario.nombre_rol === 'SuperUsuario') {
                clase_badge_rol = 'bg-success';
            } else if (usuario.nombre_rol === 'C.General') {
                clase_badge_rol = 'bg-warning';
            } else if (usuario.nombre_rol === 'Especialista') {
                clase_badge_rol = 'bg-info';
            }

            let clase_badge_estado = 'bg-success';
            if (usuario.nombre_estado === 'Activo') {
                clase_badge_estado = 'bg-success';
            } else if (usuario.nombre_estado === 'Inactivo') {
                clase_badge_estado = 'bg-danger';
            }
            html += `<tr>
                        <td>${usuario.idusuario}</td>
                        <td>${usuario.nombres}</td>
                        <td>${usuario.apellidos}</td>
                        <td>${usuario.dni}</td>
                        <td>${usuario.telefono}</td>
                        <td>${usuario.correo}</td>
                        <td>${usuario.usuario}</td>
                        <td><span data-id="${usuario.idrol}" class="badge ${clase_badge_rol}">${usuario.nombre_rol}</span></td>
                        <td><span data-id="${usuario.idestado}" class="badge ${clase_badge_estado}">${usuario.nombre_estado}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${usuario.idusuario}" title="Editar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${usuario.idusuario}" title="Eliminar">
                                <i class="bi bi-trash3-fill"></i>
                            </button>
                        </td>
                    </tr>`;
        });
        $("#tablaUsuariosBody").html(html);
    }, 'json');
}

$(document).ready(function () {
    fetchUsers();
    const usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));

    // Abrir modal para AGREGAR usuario
    $('.btn-add-user').on('click', function () {
        $('#usuarioModalLabel').text('Agregar Nuevo Usuario');
        $.get('formUsuario.php', function (formHtml) {
            $('#usuarioModalBody').html(formHtml);
            $('#usuarioModal').modal('show');
        });
    });

    // Abrir modal para EDITAR usuario
    $('#tablaUsuariosBody').on('click', '.btn-edit', function () {
        const userId = $(this).data('id');
        $('#usuarioModalLabel').text('Editar Usuario (ID: ' + userId + ')');
        $.get('formUsuario.php', { id: userId }, function (formHtml) {
            $('#usuarioModalBody').html(formHtml);
            $('#usuarioModal').modal('show');
        });
    });

    // Guardar usuario (Agregar o Editar)
    $(document).on('click', '#btnGuardarUsuario', function () {
        const formUsuario = $('#formUsuario');
        if (formUsuario[0].checkValidity()) {
            const formData = formUsuario.serialize();
            const userId = $('#idUsuario').val();
            let url, action;
            if (userId) {
                url = baseurl + 'controllers/Users/UserController.php?action=update&id=' + userId;
                action = 'update';
            } else {
                url = baseurl + 'controllers/Users/UserController.php?action=create';
                action = 'create';
            }
            $.ajax({
                type: 'POST',
                url: url,
                data: formData,
                dataType: 'json',
                success: function (response) {
                    var mensaje = document.getElementById('mensaje');
                    mensaje.textContent = '';
                    mensaje.textContent = response.message;
                    mensaje.className = 'my-3 ' + response.success ? 'alert alert-success' : 'alert alert-danger';
                    mensaje.hidden = false;
                    $("#botonesModal").hide();
                    fetchUsers();
                    setTimeout(function () {
                        usuarioModal.hide();
                        mensaje.hidden = true;
                    }, 1000);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            });
        } else {
            formUsuario[0].reportValidity();
        }
    });

    // Eliminar usuario 
    $('#tablaUsuariosBody').on('click', '.btn-delete', function () {
        const userId = $(this).data('id');
        if (confirm('¿Está seguro de que desea eliminar al usuario ID: ' + userId + '?')) {
            $.ajax({
                type: 'POST',
                url: baseurl + 'controllers/Users/UserController.php?action=delete&id=' + userId,
                dataType: 'json',
                success: function (response) {
                    alert(response.message);
                    fetchUsers();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    console.error('Respuesta del servidor:', jqXHR.responseText);
                }
            });
        }
    });
});