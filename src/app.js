import express from "express";
import indexRoutes from "./routes/indexRoutes.js";
import exphbs from "express-handlebars";
import path from "path";
import morgan from "morgan";

const app = express();

app.set("views", path.join(__dirname, "views"));

// Configurar Handlebars con helpers personalizados
const hbs = exphbs.create({
  layoutsDir: path.join(app.get("views"), "layouts"),
  defaultLayout: "main",
  extname: ".hbs",
  helpers: {
    // Helper para comparación en selects
    compare: function (a, b) {
      return a === b ? "selected" : "";
    },
    // Helper adicional para futuras comparaciones
    eq: function (a, b) {
      return a === b;
    },
    // Helper para comparar números (less than)
    lt: function (a, b) {
      return a < b;
    },
    // Helper para comparar números (greater than)
    gt: function (a, b) {
      return a > b;
    },
    // Helper para formatear fechas
    formatDate: function (date) {
      if (!date) return "";
      try {
        const fecha = new Date(date);
        if (isNaN(fecha.getTime())) return date; // Si no es una fecha válida, retorna el valor original

        return fecha.toLocaleDateString("es-MX", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      } catch (error) {
        return date; // Si hay error, retorna el valor original
      }
    },
    formatDateForInput: function (date) {
      if (!date) return "";
      try {
        const fecha = new Date(date);
        if (isNaN(fecha.getTime())) return "";

        // Formato YYYY-MM-DD para input type="date"
        const año = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
        const dia = fecha.getDate().toString().padStart(2, "0");

        return `${año}-${mes}-${dia}`;
      } catch (error) {
        return "";
      }
    },
    // Helper para formatear moneda
    formatCurrency: function (amount) {
      if (amount === null || amount === undefined) return "$0.00";
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount);
    },
    // Helper para capitalizar primera letra
    capitalize: function (str) {
      if (typeof str !== "string") return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
  },
});

// Middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true })); // <- importante para medidas[largo]
app.use("/images", express.static(path.join(__dirname, "images"))); // <--- para las imagenes

// Ruta estática para los QR
app.use("/qr-images", express.static("D:\\muebleria\\src\\Qr"));

app.use(express.urlencoded({ extended: false }));

// Usar el motor con los helpers configurados
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

app.use(indexRoutes);

export default app;
