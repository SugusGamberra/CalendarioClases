const express = require("express");
const morgan = require("morgan");
const path = require("path");
const router = require("./router/router");

if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: path.join(__dirname, '../../.env')});
}

const TOKEN_SECRETO_APP = process.env.SECRET_TOKEN;

if (!TOKEN_SECRETO_APP) {
    console.error("ERROR FATAL");
    process.exit(1);
}
console.log("Token secreto cargado");

const app = express();

// Configuración de rutas y carpetas
const publicPath = path.join(__dirname, '../public');
console.log('La ruta pública que Express está usando es:', publicPath);

// Configuración del servidor
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(publicPath, 'templates'));
app.set("view engine", "pug");

// Middlewaree
app.use(express.json());
app.use(express.static(publicPath));
app.use(morgan("dev"));
app.use("/", router);

module.exports = app;