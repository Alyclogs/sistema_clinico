-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-05-2025 a las 19:03:21
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_clinico`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `idarea` int(11) NOT NULL,
  `area` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas`
--

INSERT INTO `areas` (`idarea`, `area`) VALUES
(1, 'fisica'),
(2, 'psicologica');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disponibilidad`
--

CREATE TABLE `disponibilidad` (
  `id` int(11) NOT NULL,
  `idespecialista` int(11) NOT NULL,
  `fecha` varchar(10) NOT NULL,
  `horainicio` time NOT NULL,
  `horafin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `disponibilidad`
--

INSERT INTO `disponibilidad` (`id`, `idespecialista`, `fecha`, `horainicio`, `horafin`) VALUES
(1, 2, 'lunes', '09:00:00', '13:00:00'),
(3, 2, 'martes', '09:30:00', '13:30:00'),
(4, 2, 'miércoles', '09:00:00', '13:00:00'),
(5, 2, 'jueves', '10:00:00', '14:00:00'),
(6, 2, 'viernes', '09:00:00', '13:00:00'),
(7, 2, 'sábado', '10:00:00', '14:00:00'),
(8, 2, 'domingo', '09:00:00', '13:00:00'),
(9, 4, 'lunes', '13:00:00', '17:00:00'),
(10, 4, 'martes', '11:00:00', '15:00:00'),
(11, 4, 'miércoles', '11:00:00', '15:00:00'),
(12, 4, 'jueves', '12:00:00', '16:00:00'),
(13, 4, 'viernes', '13:00:00', '17:00:00'),
(14, 4, 'sábado', '09:00:00', '13:00:00'),
(15, 4, 'domingo', '10:00:00', '14:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialistas`
--

CREATE TABLE `especialistas` (
  `idespecialista` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  `idarea` int(11) NOT NULL,
  `idsubarea` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `especialistas`
--

INSERT INTO `especialistas` (`idespecialista`, `idusuario`, `idarea`, `idsubarea`) VALUES
(1, 1, 2, 1),
(2, 3, 1, 2),
(3, 4, 1, 2),
(4, 6, 2, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `idestado` int(11) NOT NULL,
  `estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados`
--

INSERT INTO `estados` (`idestado`, `estado`) VALUES
(1, 'Activo'),
(2, 'Inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `idrol` int(11) NOT NULL,
  `rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`idrol`, `rol`) VALUES
(1, 'SuperUsuario'),
(2, 'C.General'),
(3, 'Especialista');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subareas`
--

CREATE TABLE `subareas` (
  `idsubarea` int(11) NOT NULL,
  `subarea` varchar(50) NOT NULL,
  `idarea` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `subareas`
--

INSERT INTO `subareas` (`idsubarea`, `subarea`, `idarea`) VALUES
(1, 'conductual', 2),
(2, 'fisica-1', 1),
(3, 'psicologica-1', 2),
(4, 'psicologica-1', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `idusuario` int(11) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `dni` varchar(15) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) NOT NULL,
  `idestado` int(11) DEFAULT NULL,
  `idrol` int(11) DEFAULT NULL,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`idusuario`, `nombres`, `apellidos`, `dni`, `telefono`, `correo`, `idestado`, `idrol`, `usuario`, `password`) VALUES
(1, 'Miguel Angel', 'Cáceres Cubas ', '73256481', '922157739', 'contacto@corazonguerrero.org.pe', 1, 1, 'gftunquet14', '$2y$10$N8cWJdoccVWLJNfyuc98AuMXpG/yMi/eVFwgIeWebSuf3kd0Cqhk.'),
(3, 'Vanessa', '22', '12345678', '922157739', 'contacto@corazonguerrero.org.pe2', 1, 2, 'vanessa', '$2y$10$z5Wg/.HcCgoKdQEsBqkwOeNDdWPHXHU1Ya9Mrg4Q5yuvZbYSie9py'),
(4, 'Andy', 'orellana', '12121212', '123456789', 'andy@gmail.com', 1, 3, 'andy', '$2y$10$z5Wg/.HcCgoKdQEsBqkwOeNDdWPHXHU1Ya9Mrg4Q5yuvZbYSie9py'),
(6, 'Alyson', 'Quiroz Aguilar', '77777777', '989538532', 'alysonical2003@gmail.com', 1, 3, 'alyta12345', '$2y$10$vWzZSAt64qxvnC9WSsckxe912nQD0idN/GzM7wNIsmbXA0Nq8XYTW');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`idarea`);

--
-- Indices de la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idespecialista` (`idespecialista`);

--
-- Indices de la tabla `especialistas`
--
ALTER TABLE `especialistas`
  ADD PRIMARY KEY (`idespecialista`),
  ADD KEY `idusuario` (`idusuario`),
  ADD KEY `idarea` (`idarea`),
  ADD KEY `idsubarea` (`idsubarea`);

--
-- Indices de la tabla `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`idestado`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`idrol`);

--
-- Indices de la tabla `subareas`
--
ALTER TABLE `subareas`
  ADD PRIMARY KEY (`idsubarea`),
  ADD KEY `fk_area` (`idarea`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idusuario`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `idestado` (`idestado`),
  ADD KEY `idrol` (`idrol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `areas`
--
ALTER TABLE `areas`
  MODIFY `idarea` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `especialistas`
--
ALTER TABLE `especialistas`
  MODIFY `idespecialista` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `estados`
--
ALTER TABLE `estados`
  MODIFY `idestado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `idrol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `subareas`
--
ALTER TABLE `subareas`
  MODIFY `idsubarea` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `idusuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  ADD CONSTRAINT `disponibilidad_ibfk_1` FOREIGN KEY (`idespecialista`) REFERENCES `especialistas` (`idespecialista`);

--
-- Filtros para la tabla `especialistas`
--
ALTER TABLE `especialistas`
  ADD CONSTRAINT `especialistas_ibfk_1` FOREIGN KEY (`idusuario`) REFERENCES `usuarios` (`idusuario`),
  ADD CONSTRAINT `especialistas_ibfk_2` FOREIGN KEY (`idarea`) REFERENCES `areas` (`idarea`),
  ADD CONSTRAINT `especialistas_ibfk_3` FOREIGN KEY (`idsubarea`) REFERENCES `subareas` (`idsubarea`);

--
-- Filtros para la tabla `subareas`
--
ALTER TABLE `subareas`
  ADD CONSTRAINT `fk_area` FOREIGN KEY (`idarea`) REFERENCES `areas` (`idarea`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`idestado`) REFERENCES `estados` (`idestado`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`idrol`) REFERENCES `roles` (`idrol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
