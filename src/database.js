import mongoose from "mongoose";

// Configurar strictQuery para evitar la advertencia
mongoose.set("strictQuery", false);

mongoose.connect("mongodb://localhost:27017/muebleria", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Conexión exitosa a la base de datos");
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos", err);
  });

