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
                           <img class="avatar-iniciales" src="${especialista.foto}">
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
            $.get(baseurl + 'assets/js/especialistas/botonesEspecialista.html', function (btnHtml) {
                btnHtml = btnHtml.replace(/\$\{IDUSUARIO\}/g, id);
                btnHtml = btnHtml.replace(/\$\{NOMBREUSUARIO\}/g, nombre);
                $(this).html(btnHtml);
            }.bind(this));
        });
    }, 'json');
}

$(document).ready(function () {
    // Inicializar los modales correctamente
    const usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));
    const horarioModal = new bootstrap.Modal(document.getElementById('horarioModal')); // Inicializar horarioModal
    const servicioModal = new bootstrap.Modal(document.getElementById('servicioModal')); // Inicializar servicioModal

    fetchUsers();

    $('#inputBuscarUsuario').on('input', function () {
        const filtro = $(this).val().trim();
        if (filtro.length > 2) {
            buscarUsuarios(filtro);
        } else if (filtro.length === 0) {
            fetchUsers(); // si borró todo, recarga la tabla completa
        }
    });

    // Abrir modal para AGREGAR usuario
    $('.btn-add-user').on('click', function () {
        $('#usuarioModalLabel').text('Agregar Nuevo Usuario');
        $.get('formEspecialistas.php', function (formHtml) {
            $('#usuarioModalBody').html(formHtml);
            usuarioModal.show(); // Mostrar el modal de usuario
        });
    });

    // Abrir modal para EDITAR usuario
    $('#tablaEspecialistasBody').on('click', '.btn-edit', function () {
        const userId = $(this).data('id');
        $('#usuarioModalLabel').text('Editar Usuario (ID: ' + userId + ')');
        $.get('formEspecialistas.php', { id: userId }, function (formHtml) {
            $('#usuarioModalBody').html(formHtml);
            usuarioModal.show(); // Mostrar el modal de usuario
        });
    });

    // Guardar usuario (Agregar o Editar)
    $(document).on('click', '#btnGuardarUsuario', function () {
        const formUsuario = $('#formUsuario');
        if (formUsuario[0].checkValidity()) {
            const formData = new FormData(formUsuario[0]);
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
                processData: false, // ✅ importante
                contentType: false, // ✅ importante
                success: function (response) {
                    mostrarMensajeFlotante(response.message, response.success);
                    setTimeout(function () {
                        usuarioModal.hide(); // Ocultar modal
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

    $(document).on('click', '#btnGuardarHorario', function () {
        const form = $('#formHorario');
        const formData = form.serialize();
        const url = baseurl + 'controllers/Especialistas/EspecialistaController.php?action=guardarHorario';

        $.ajax({
            type: 'POST',
            url: url,
            data: formData,
            dataType: 'json',
            success(response) {
                mostrarMensajeFlotante(response.message, response.success);
                setTimeout(() => {
                    horarioModal.hide(); // Ocultar el modal de horario
                    if (response.success) {
                        window.location.href = baseurl + 'views/Clinica/especialistas/index.php';
                    }
                }, 1000);
            },
            error(jqXHR, textStatus, errorThrown) {
                console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                console.error('Respuesta del servidor:', jqXHR.responseText);
            }
        });
    });

    $(document).on('click', '#btnGuardarServicios', function (e) {
        e.preventDefault(); // Detiene el envío real del formulario

        const formServicios = $('#servicioForm');

        if (formServicios[0].checkValidity()) {
            const formData = formServicios.serialize();
            const url = baseurl + 'controllers/Especialistas/EspecialistaController.php?action=guardarServicios';

            $.ajax({
                type: 'POST',
                url: url,
                data: formData,
                dataType: 'json',
                success: function (response) {
                    mostrarMensajeFlotante(response.message, response.success);
                    setTimeout(function () {
                        servicioModal.hide(); // Ocultar el modal de servicio
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
            formServicios[0].reportValidity();
        }
    });

    $(document).on('click', '.btn-horario', function () {
        var idUsuario = $(this).data('id'); // Captura el ID del botón
        $.get('formHorario.php', { id: idUsuario }) // Envíalo como parámetro GET
            .done(function (formHtml) {
                $('#horarioModalBody').html(formHtml); // Carga el contenido en horarioModalBody
                horarioModal.show(); // Muestra el modal de horario
            })
            .fail(function () {
                alert("Error cargando el formulario.");
            });
    });

    $(document).on('click', '.btn-servicio', function () {
        var idUsuario = $(this).data('id'); // Captura el ID del botón
        $.get('formServicios.php', { id: idUsuario }) // Envíalo como parámetro GET
            .done(function (formHtml) {
                $('#servicioModalBody').html(formHtml); // Carga el contenido en servicioModalBody
                servicioModal.show(); // Muestra el modal de servicio
            })
            .fail(function () {
                alert("Error cargando el formulario.");
            });
    });


    document.getElementById('closeHorarioModal').addEventListener('click', function () {
        horarioModal.hide();
        location.reload();  // Recargar la págin
    });

    document.getElementById('btnCancelarHorario').addEventListener('click', function () {
        horarioModal.hide();
        location.reload();
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
