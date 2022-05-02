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

// Configuración dependencia fileupload
const expressFileUpload = require("express-fileupload");
app.use(expressFileUpload({
  limits: { fileSize: 5000000 },
  abortOnLimit: true,
  responseOnLimit: "El peso del archivo que intentas subir supera ellimite permitido",
}));

// Configuración dependencia body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración ruta de acceso para consumir framework boostrap
app.use("/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

// Configuración ruta de lectura de archivos propios del proyecto
app.use(express.static(`${__dirname}/assets`));

// Rutas de ejecución
app.get("/", async (req, res) => {
  res.render("index", {
    layout: "index"
  });
});

app.get("/registro", async (req, res) => {
  res.render("registro", {
    layout: "registro"
  });
});

app.get("/login", async (req, res) => {
  res.render("login", {
    layout: "login"
  });
});

app.get("/dashboard", async (req, res) => {
  res.render("dashboard", {
    layout: "dashboard"
  });
});

app.get("/agenda", async (req, res) => {
  res.render("agenda", {
    layout: "agenda"
  });
});

app.post("/registro", async (req, res) => {
  const datosCliente = req.body;
  console.log(datosCliente);
});

// Inicializando servidor en puerto 3000
app.listen(3000, () => console.log("Servidor activo en puerto 3000"))