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
function mostrarMensajeFlotante(msg, exito = false) {
    let div = document.getElementById('mensajeFlotante');
    if (div) div.remove();
    div = document.createElement('div');
    div.id = 'mensajeFlotante';
    div.className = exito ? 'alert-success' : 'alert-danger';
    div.textContent = msg;
    Object.assign(div.style, {
        position: 'fixed',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 28px',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    });
    document.body.appendChild(div);
    setTimeout(() => {
        div.remove();
    }, 2200);
}
function fetchUsers() {
    $.get(baseurl + "controllers/Especialistas/EspecialistaController.php?action=read", function (data) {
        let html = '';
        data.forEach(function (especialista) {
            const color = stringToColor(especialista.nombres + especialista.apellidos);
            const initials = getInitials(especialista.nombres, especialista.apellidos);
            html += `<tr>
                        <td style="display:flex;align-items:center;gap:8px;border:none">
                            <div class="avatar-iniciales" style="background:${color};"><span>${initials}</span></div>
                            <b>${especialista.nombres} ${especialista.apellidos}</b>
                        </td>
                        <td>${especialista.dni}</td>
                        <td>${especialista.telefono}</td>
                        <td><div class="table-correo">${especialista.correo}</div></td>
                        <td>
                            ${especialista.especialidades.map(e => e.nombre_area).join(', ')}
                        </td>
                        <td>
                            ${especialista.especialidades.map(e => e.nombre_subarea ? e.nombre_subarea : '-').join(', ')}
                        </td>
                        <td class="td-botones" data-id="${especialista.idespecialista}" data-nombre="${especialista.nombres}"></td>
                    </tr>`;
        });
        $("#tablaEspecialistasBody").html(html);

        $(".td-botones").each(function () {
            var id = $(this).data('id');
            var nombre = $(this).data('nombre');
            $.get(baseurl + 'components/botonesEspecialista.html', function (btnHtml) {
                btnHtml = btnHtml.replace(/\$\{IDUSUARIO\}/g, id);
                btnHtml = btnHtml.replace(/\$\{NOMBREUSUARIO\}/g, nombre);
                $(this).html(btnHtml);
            }.bind(this));
        });
    }, 'json');
}

$(document).ready(function () {
    const horarioModal = new bootstrap.Modal(document.getElementById('horarioModal'));

    // Delegación de evento por si el botón se carga dinámicamente
    $(document).on('click', '.btn-horario', function () {

        $.get('formHorario.php')
            .done(function (formHtml) {
                console.log("Contenido recibido:", formHtml);
                $('#horarioModalBody').html(formHtml);
                horarioModal.show();
            })
            .fail(function () {
                alert("Error cargando el formulario.");
            });
    });
});

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
                    mostrarMensajeFlotante(response.message, response.success);

                    setTimeout(function () {
                        usuarioModal.hide();


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
