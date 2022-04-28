// Configuración dependencia express
const express = require("express");
const app = express();

// Configuración dependencia handlebars y sus rutas
const exphbs = require("express-handlebars");
app.set("view engine", "handlebars");
app.engine(
  "handlebars",
  exphbs.engine({
    layoutsDir: __dirname + "/views",
    partialsDir: __dirname + "/views/components/",
  })
);

// Configuración ruta de acceso para consumir framework boostrap
app.use("/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

// Configuración ruta de lectura de archivos propios del proyecto
app.use(express.static(`${__dirname}/assets`));

// Rutas de ejecución
app.get("/", async (req, res) => {
  //const data = await consultaSkaters();
  res.render("index", {
    layout: "index"
    //skaters: data
  });
});

app.get("/registro", async (req, res) => {
  //const data = await consultaSkaters();
  res.render("registro", {
    layout: "registro"
    //skaters: data
  });
});

// Inicializando servidor en puerto 3000
app.listen(3000, () => console.log("Servidor activo en puerto 3000"))