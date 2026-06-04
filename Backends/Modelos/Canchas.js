const mongoose = require('node:mongoose');

const CanchaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    deporte: {
        type: String,
        enum: ['futbol', 'tenis', 'padel', 'basquetbol'],
        required: true
    },
    tarifa: { type: Number, required: true },
    duracionTurno: { type: Number, default: 60, required: true }, // Duración en minutos, horas o segundos
}, { timestamps: true });

module.exports = mongoose.model('Cancha', CanchaSchema);