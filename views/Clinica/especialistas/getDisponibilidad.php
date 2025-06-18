<?php
// ajax/getDisponibilidad.php

// Forzamos salida JSON
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';

$id       = isset($_GET['id'])       ? (int) $_GET['id']       : 0;
$periodo  = isset($_GET['periodo'])  ? (int) $_GET['periodo']  : 0;

if (!$id || !$periodo) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Parámetros faltantes o inválidos: id y periodo son requeridos.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $model    = new EspecialistaModel();
    $detalles = $model->obtenerDetallesDisponibilidad($id, $periodo);

    // Devolvemos incluso un array vacío si no hay registros
    echo json_encode($detalles, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al obtener disponibilidad: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
