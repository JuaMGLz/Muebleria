import express from "express";
import indexRoutes from "./routes/indexRoutes.js";
import exphbs from "express-handlebars";
import path from "path";
import morgan from "morgan";

const app = express();

app.set("views", path.join(__dirname, "views"));

//middlewares
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: false }));

app.engine(
  ".hbs",
  exphbs({
    layoutsDir: path.join(app.get("views"), "layouts"),
    defaultLayout: "main",
    extname: ".hbs",
  })
);

app.set("view engine", ".hbs");

app.use(indexRoutes);

export default app;
