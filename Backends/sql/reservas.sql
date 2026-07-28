-- Tabla usada por el módulo "Mis Turnos"
-- No se crea una tabla separada: cada reserva del usuario vive en `reservas`.

USE mi_proyecto_bd;

CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deporte VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    horario VARCHAR(10) NOT NULL,
    duracion INT NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    UsuarioId INT NOT NULL,
    CanchaId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reservas_usuario
        FOREIGN KEY (UsuarioId) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_reservas_cancha
        FOREIGN KEY (CanchaId) REFERENCES canchas(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_reservas_usuario (UsuarioId),
    INDEX idx_reservas_cancha_fecha (CanchaId, fecha, horario)
);
