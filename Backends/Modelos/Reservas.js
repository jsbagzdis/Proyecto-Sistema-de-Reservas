
const mongoose = require('node:mongoose');

const ReservaSchema = new mongoose.Schema({
// Vincula la reserva dirtectamente con el ID del usuario que inicio sesión
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    deporte: {
        type: String,
        enum: ['futbol', 'tenis', 'padel', 'basquetbol'],
        required: true
    },
    canchaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cancha',
        required: true
    },
    fecha: {
        type: String, // Formato "YYYY-MM-DD"
        required: true
    },
    horario: {
        type: String, // Formato "HH:MM"
        required: true
    },
    duracion: {
        type: Number, // Duración en minutos, horas o segundos
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'cancelada'],
        default: 'pendiente'
    }
}, { timestamps: true });

module.exports = mongoose.model('Reserva', ReservaSchema);