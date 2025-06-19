<?php
$idusuario = $_SESSION['idusuario'];
?>
<div class="calendar-sidebar p-3">
    <input type="hidden" id="idespecialista" value="<?= $idusuario ?>">
    <div id="modalCita" class="modal-cita-custom">
        <div class="modal-cita-header">
            <div id="subtituloCitas" class="subtitulo">Citas de hoy</div>
            <div class="citas-navigation" style="display:flex; justify-content: end; gap: 8px; align-items: center;">
                <div class="minicalendar-button">
                    <button id="btnAbrirCalendarioCita" class="btn btn-sm btn-calendario">
                        <svg id="agenda_especialista" data-name="agenda especialista" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.34 12.34" style="width: 16px; height: 16px;">
                            <defs>
                                <style>
                                    .cls-003 {
                                        fill: #fff;
                                    }
                                </style>
                            </defs>
                            <rect class="cls-003" x="5.69" y="5.54" width=".96" height=".96" />
                            <path class="cls-003" d="M10.9.96h-.58v-.96h-.96v.96H2.99v-.96h-.96v.96h-.58c-.8,0-1.45.65-1.45,1.45v8.49c0,.8.65,1.45,1.45,1.45h4.96c-.33-.28-.62-.6-.86-.96H1.45c-.27,0-.48-.22-.48-.48v-6.36h10.41v1.01h0c.36.24.69.53.96.86v-4c0-.8-.65-1.45-1.45-1.45ZM11.38,3.57H.96v-1.16c0-.27.22-.48.48-.48h.58v.96h.96v-.96h6.36v.96h.96v-.96h.58c.27,0,.48.22.48.48v1.16Z" />
                            <path class="cls-003" d="M9.08,5.84c-1.79,0-3.25,1.46-3.25,3.25s1.46,3.25,3.25,3.25,3.25-1.46,3.25-3.25-1.46-3.25-3.25-3.25ZM9.08,11.38c-1.26,0-2.29-1.03-2.29-2.29s1.03-2.29,2.29-2.29,2.29,1.03,2.29,2.29-1.03,2.29-2.29,2.29Z" />
                            <polygon class="cls-003" points="9.55 7.47 8.58 7.47 8.58 9.57 10.37 9.57 10.37 8.61 9.55 8.61 9.55 7.47" />
                            <rect class="cls-003" x="3.76" y="7.47" width=".96" height=".96" />
                            <rect class="cls-003" x="1.83" y="7.47" width=".96" height=".96" />
                            <rect class="cls-003" x="1.83" y="5.54" width=".96" height=".96" />
                            <rect class="cls-003" x="1.83" y="9.4" width=".96" height=".96" />
                            <rect class="cls-003" x="3.76" y="5.54" width=".96" height=".96" />
                            <rect class="cls-003" x="3.76" y="9.4" width=".96" height=".96" />
                        </svg>
                    </button>
                    <div id="minicalendarCitaModal" class="minicalendar-modal" style="display: none;">
                        <div id="mini-calendar-cita"></div>
                    </div>
                </div>
                <button id="prev-day" class="btn btn-light btn-sm">
                    <svg id="agenda_especialista" data-name="agenda especialista" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.66 7.59" style="height: 10.1px; width: 8.9px;">
                        <defs>
                            <style>
                                .cls-001 {
                                    fill: #76869e;
                                }
                            </style>
                        </defs>
                        <path class="cls-001" d="M.17,4.09l5.99,3.46c.23.13.51-.03.51-.29V.34c0-.26-.28-.42-.51-.29L.17,3.5c-.23.13-.23.46,0,.59Z" />
                    </svg>
                </button>
                <button id="next-day" class="btn btn-light btn-sm">
                    <svg id="agenda_especialista" data-name="agenda especialista" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.66 7.59" style="height: 10.1px; width: 8.9px;">
                        <defs>
                            <style>
                                .cls-002 {
                                    fill: #76869e;
                                }
                            </style>
                        </defs>
                        <path class="cls-002" d="M6.49,3.5L.51.05c-.23-.13-.51.03-.51.29v6.91c0,.26.28.42.51.29l5.99-3.46c.23-.13.23-.46,0-.59Z" />
                    </svg>
                </button>
            </div>
        </div>
        <div class="citas-container"></div>
    </div>
</div>
<script type="modeule" src="../../../assets/js/especialistas/barraCitas.js"></script>