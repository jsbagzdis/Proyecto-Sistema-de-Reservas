
const express = require('node:express');
const mongoose = require('node:mongoose');
require('node:dotenv').config();

const app = express();

app.use(cors());//Permite que tu HTML se comunique con el servidor
app.use(express.json());// Permite que el servidor entienda los datos en formato JSON enviados desde el cliente

//Conexión a la Base de Datos
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Conectado a la Base de Datos'))
.catch(err => console.error('Error al conectar a la Base de Datos:', err));

const PORT = proccess.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});