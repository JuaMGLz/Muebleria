const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const exphbs = require("express-handlebars"); // Importación compatible
const path = require("path");
const morgan = require("morgan");
const mongoose = require("mongoose");
const moment = require("moment");

const indexRoutes = require("./routes/indexRoutes.js");
const authRoutes = require("./routes/authRoutes.js");

const app = express();

// Motor de vistas y middlewares
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs({ // Usar exphbs directamente como función
    defaultLayout: "main",
    extname: ".hbs",
    // Definición de Helpers COMPLETOS
    helpers: {
      formatDate: (date) => {
        return moment(date).format("DD/MM/YYYY");
      },
      lt: (v1, v2) => {
        return v1 < v2;
      },
      eq: (v1, v2) => v1 === v2,
      gt: (v1, v2) => v1 > v2,
      ne: (v1, v2) => v1 !== v2,
      // Helper de moneda
      formatCurrency: (amount) => {
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 2
        }).format(amount);
      },
      // ✅ Helper 'compare' añadido para solucionar el error en editarProducto.hbs
      compare: (lvalue, rvalue) => {
        // Convertir a String para manejar ObjectIds de Mongoose
        if (String(lvalue) === String(rvalue)) {
          return 'selected';
        }
        return '';
      },
      // ✅ Helper 'formatDateForInput' añadido para el error en ventas (editarVenta.hbs)
      formatDateForInput: (date) => {
        return moment(date).format("YYYY-MM-DD");
      }
    },
  })
);
app.set("view engine", ".hbs");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// Usar la sesión con connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secreto",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      ttl: 60 * 60 * 24 * 7,
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
  })
);

// Exponer usuario de sesión a las vistas HBS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// =====================
//       RUTAS
// =====================
// Rutas de auth (login/logout) primero
app.use(authRoutes);

// Rutas principales
app.use(indexRoutes);

// Archivos estáticos
// Usamos path.join(__dirname, ...) para que las rutas sean relativas y funcionen en cualquier PC
app.use("/qr-images", express.static(path.join(__dirname, "Qr")));
app.use("/images", express.static(path.join(__dirname, "Images")));


// Exporta la app para usarla en otros archivos
module.exports = app;