export function mostrarMensajeFlotante(msg, exito = false) {
    let div = document.getElementById('mensajeFlotante');
    if (div) div.remove();
    div = document.createElement('div');
    div.id = 'mensajeFlotante';
    div.className = 'mensaje-alert';
    const mensaje = document.createElement('div');
    mensaje.className = 'my-3 alert ' + (exito ? 'alert-success' : 'alert-danger');
    mensaje.textContent = msg;
    div.appendChild(mensaje);
    document.body.appendChild(div);
    setTimeout(() => {
        div.remove();
    }, 2200);
}

function getInitials(nombre, apellido) {
    let n = nombre ? nombre.trim()[0] : '';
    let a = apellido ? apellido.trim()[0] : '';
    return (n + a).toUpperCase();
}

function stringToColor(str) {
    // Simple hash to color
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
}

// CSS para mensaje flotante
(function () {
    if (!document.getElementById('mensaje-flotante-css')) {
        const style = document.createElement('style');
        style.id = 'mensaje-flotante-css';
        style.innerHTML = `#mensajeFlotante { animation: fadeInOut 2.2s; } @keyframes fadeInOut { 0 % { opacity: 0; } 10 % { opacity: 1; } 90 % { opacity: 1; } 100 % { opacity: 0; } } `;
        document.head.appendChild(style);
    }
})();