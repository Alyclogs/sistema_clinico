const baseurl = "http://localhost/SistemaClinico/";

function stringToColor(str) {
    // Simple hash to color
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
}

function getInitials(nombre, apellido) {
    let n = nombre ? nombre.trim()[0] : '';
    let a = apellido ? apellido.trim()[0] : '';
    return (n + a).toUpperCase();
}

function fetchUsers() {
    $.get(baseurl + "controllers/Especialistas/EspecialistaController.php?action=read", function (data) {
        console.log("Especialistas recibidos:", data);
        let html = '';
        data.forEach(function (especialista) {
            const color = stringToColor(especialista.nom_especialista + especialista.ape_especialista);
            const initials = getInitials(especialista.nom_especialista, especialista.ape_especialista);
            html += `<tr>
                        <td style="display:flex;align-items:center;gap:8px;border:none">
                            <div class="avatar-iniciales" style="background:${color};"><span>${initials}</span></div>
                            <b>${especialista.nom_especialista} ${especialista.ape_especialista}</b>
                        </td>
                        <td>${especialista.dni_especialista}</td>
                        <td>${especialista.telefono_especialista}</td>
                        <td><div class="table-correo">${especialista.correo_especialista}</td>
                        <td>${especialista.nombre_area}</td>
                            <td>${especialista.nombre_subarea}</td>
                         <td class="td-botones" data-id="${especialista.idespecialista}" data-nombre="${especialista.nom_especialista}"></td>
                         
                    </tr>`;
        });
        $("#tablaEspecialistasBody").html(html);

        $(".td-botones").each(function () {
            var id = $(this).data('id');
            var nombre = $(this).data('nombre');
            $.get(baseurl + 'assets/js/especialistas/botonesEspecialista.html', function (btnHtml) {
                btnHtml = btnHtml.replace(/\$\{IDUSUARIO\}/g, id);
                btnHtml = btnHtml.replace(/\$\{NOMBREUSUARIO\}/g, nombre);
                $(this).html(btnHtml);
            }.bind(this));
        });
    }, 'json');
}

$(document).ready(function () {
    fetchUsers();

    $('#inputBuscarUsuario').on('input', function () {
        const filtro = $(this).val().trim();
        if (filtro.length > 2) {
            buscarUsuarios(filtro);
        } else if (filtro.length === 0) {
            fetchUsers(); // si borró todo, recarga la tabla completa
        }
    });

    const usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));

    // Abrir modal para AGREGAR usuario
    $('.btn-add-user').on('click', function () {
        $('#usuarioModalLabel').text('Agregar Nuevo Usuario');
        $.get('formEspecialistas.php', function (formHtml) {
            $('#usuarioModalBody').html(formHtml);
            $('#usuarioModal').modal('show');
        });
    });

    // Abrir modal para EDITAR usuario
    $('#tablaEspecialistasBody').on('click', '.btn-edit', function () {
        const userId = $(this).data('id');
        $('#usuarioModalLabel').text('Editar Usuario (ID: ' + userId + ')');
        $.get('formEspecialistas.php', { id: userId }, function (formHtml) {
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
                url = baseurl + 'controllers/Especialistas/EspecialistaController.php?action=update&id=' + userId;
                action = 'update';
            } else {
                url = baseurl + 'controllers/Especialistas/EspecialistaController.php?action=create';
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

                    setTimeout(function () {
                        usuarioModal.hide();
                        mensaje.hidden = true;

                        // ✅ Redirección si fue exitoso
                        if (response.success) {
                            window.location.href = baseurl + 'views/Clinica/especialistas/index.php';
                        }
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
        const nombreUsuario = $(this).data('nombre');
        if (confirm(`¿Está seguro de que desea eliminar del sistema a ${nombreUsuario}?`)) {
            $.ajax({
                type: 'POST',
                url: baseurl + 'controllers/Users/UserController.php?action=delete&id=' + userId,
                data: { idUsuario: userId },
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

function buscarUsuarios(filtro) {
    $.get(baseurl + "controllers/Users/UserController.php?action=buscar&filtro=" + encodeURIComponent(filtro), function (data) {
        let html = '';
        data.forEach(function (usuario) {
            const color = stringToColor(usuario.nombres + usuario.apellidos);
            const initials = getInitials(usuario.nombres, usuario.apellidos);
            html += `<tr>
                        <td style="display:flex;align-items:center;gap:8px;border:none">
                            <div class="avatar-iniciales" style="background:${color};"><span>${initials}</span></div>
                            <b>${usuario.nombres} ${usuario.apellidos}</b>
                        </td>
                        <td>${usuario.dni}</td>
                        <td>${usuario.telefono}</td>
                        <td><div class="table-correo">${usuario.correo}</div></td>
                        <td>${usuario.nombre_rol}</td>
                        <td class="td-botones" data-id="${usuario.idusuario}"></td>
                    </tr>`;
        });

        $("#tablaUsuariosBody").html(html);

        $(".td-botones").each(function () {
            var id = $(this).data('id');
            $.get(baseurl + 'assets/js/usuarios/botonesUsuario.html', function (btnHtml) {
                btnHtml = btnHtml.replace(/\$\{IDUSUARIO\}/g, id);
                $(this).html(btnHtml);
            }.bind(this));
        });
    }, 'json');
}
