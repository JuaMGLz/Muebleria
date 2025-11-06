// src/index.js
require('./database.js');   // Primero la conexión
const app = require("./app");  // Luego la app (donde se configura la sesión)

app.listen(3000);
console.log('Servidor escuchando en: ', 3000);


