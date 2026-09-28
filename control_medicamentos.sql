-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 03, 2026 at 09:31 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `control_medicamentos`
--

-- --------------------------------------------------------

--
-- Table structure for table `alertas`
--

CREATE TABLE `alertas` (
  `id_alerta` int NOT NULL,
  `id_usuario` int NOT NULL,
  `tipo_alerta` varchar(100) DEFAULT NULL,
  `fecha_alerta` datetime DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `alertas`
--

INSERT INTO `alertas` (`id_alerta`, `id_usuario`, `tipo_alerta`, `fecha_alerta`) VALUES
(1, 1, 'Tomar medicamento', '2026-08-01 08:00:00'),
(2, 2, 'Control médico', '2026-08-02 09:00:00'),
(3, 3, 'Reposición', '2026-08-03 10:00:00'),
(4, 4, 'Vencimiento', '2026-08-04 11:00:00'),
(5, 5, 'Recordatorio', '2026-08-05 12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `inventario`
--

CREATE TABLE `inventario` (
  `id_inventario` int NOT NULL,
  `id_usuario` int NOT NULL,
  `cantidad` int DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `inventario`
--

INSERT INTO `inventario` (`id_inventario`, `id_usuario`, `cantidad`, `ubicacion`) VALUES
(1, 1, 50, 'Estante A'),
(2, 2, 30, 'Estante B'),
(3, 3, 15, 'Estante C'),
(4, 4, 40, 'Estante D'),
(5, 5, 20, 'Estante E');

-- --------------------------------------------------------

--
-- Table structure for table `medicamentos`
--

CREATE TABLE `medicamentos` (
  `id_medicamento` int NOT NULL,
  `id_usuario` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `medicamentos`
--

INSERT INTO `medicamentos` (`id_medicamento`, `id_usuario`, `nombre`, `descripcion`) VALUES
(1, 1, 'Acetaminofén', 'Analgésico'),
(2, 2, 'Ibuprofeno', 'Antiinflamatorio'),
(3, 3, 'Amoxicilina', 'Antibiótico'),
(4, 4, 'Loratadina', 'Antialérgico'),
(5, 5, 'Omeprazol', 'Protector gástrico');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id_rol` int NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre`) VALUES
(1, 'Administrador'),
(2, 'Cliente'),
(3, 'Donante'),
(4, 'Farmacéutico'),
(5, 'Invitado');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `id_rol` int NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `email`, `id_rol`, `password_hash`, `estado`) VALUES
(1, 'Juan Pérez', 'juan@gmail.com', 1, '$2b$12$HDvdkSEggyGOdR42Lr3pEOBO77i/v.kSs8KrFUdLHVGfJHZVxCa8y', 'activo'),
(2, 'Ana López', 'ana@gmail.com', 2, '$2b$12$HDvdkSEggyGOdR42Lr3pEOBO77i/v.kSs8KrFUdLHVGfJHZVxCa8y', 'activo'),
(3, 'Carlos Ruiz', 'carlos@gmail.com', 3, '$2b$12$HDvdkSEggyGOdR42Lr3pEOBO77i/v.kSs8KrFUdLHVGfJHZVxCa8y', 'activo'),
(4, 'Laura Gómez', 'laura@gmail.com', 2, '$2b$12$HDvdkSEggyGOdR42Lr3pEOBO77i/v.kSs8KrFUdLHVGfJHZVxCa8y', 'activo'),
(5, 'Pedro Díaz', 'pedro@gmail.com', 4, '$2b$12$HDvdkSEggyGOdR42Lr3pEOBO77i/v.kSs8KrFUdLHVGfJHZVxCa8y', 'activo');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alertas`
--
ALTER TABLE `alertas`
  ADD PRIMARY KEY (`id_alerta`),
  ADD KEY `fk_alerta_usuario` (`id_usuario`);

--
-- Indexes for table `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id_inventario`),
  ADD KEY `fk_inventario_usuario` (`id_usuario`);

--
-- Indexes for table `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD PRIMARY KEY (`id_medicamento`),
  ADD KEY `fk_medicamento_usuario` (`id_usuario`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usuario_rol` (`id_rol`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alertas`
--
ALTER TABLE `alertas`
  MODIFY `id_alerta` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id_inventario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `medicamentos`
--
ALTER TABLE `medicamentos`
  MODIFY `id_medicamento` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alertas`
--
ALTER TABLE `alertas`
  ADD CONSTRAINT `fk_alerta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `fk_inventario_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD CONSTRAINT `fk_medicamento_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


-- Módulo transaccional: lotes e inventario FEFO
CREATE TABLE IF NOT EXISTS `lotes` (
  `id_lote` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_medicamento` int NOT NULL,
  `numero_lote` varchar(80) NOT NULL,
  `cantidad_inicial` int NOT NULL,
  `cantidad_disponible` int NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_caducidad` date NOT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id_lote`),
  KEY `fk_lote_usuario` (`id_usuario`),
  KEY `fk_lote_medicamento` (`id_medicamento`),
  KEY `idx_lotes_fefo` (`estado`, `cantidad_disponible`, `fecha_caducidad`),
  CONSTRAINT `fk_lote_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_lote_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamentos` (`id_medicamento`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
