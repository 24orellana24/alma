// Importación de funciones con las querys que procesan sobre la BD
const { nuevoCliente, consultaCliente, nuevoSemaforo } = require("./querys");

// Configuración dependencia express
const express = require("express");
const app = express();

// Configuración dependencia JWT
const jwt = require("jsonwebtoken");
const secretKey = "api-alma-$";

// Configuración dependencia uuid y moment
const { v4: uuidv4 } = require('uuid');
const moment = require("moment");

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
app.use("/bootstrap", express.static(`${__dirname}/node_modules/bootstrap/dist/css`));
app.use("/bootstrap-icons", express.static(`${__dirname}/node_modules/bootstrap-icons/font`));

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

app.get("/dashboard", validarToken, async (req, res) => {
  res.render("dashboard", {
    layout: "dashboard",
    cliente: datosClienteDecodificados
  });
});

app.post("/registro", async (req, res) => {
  const { rut, email, apellido_paterno, apellido_materno, nombre, fecha_nacimiento, celular, comuna, password } = req.body;
  const datosCliente = {
    rut: rut,
    email: email,
    apellido_paterno: apellido_paterno,
    apellido_materno: apellido_materno,
    nombre: nombre,
    fecha_nacimiento: fecha_nacimiento,
    celular: celular,
    comuna: comuna,
    password: password,
    estado: true,
    nombre_foto: "foto_generica.png"
  };
  
  if (req.files) {
    const { foto } = req.files;
    datosCliente.nombre_foto = `${rut}_${uuidv4()}.png`;
    foto.mv(`${__dirname}/assets/img/perfil/${datosCliente.nombre_foto}`);
  }

  const resultado = await nuevoCliente(datosCliente);
  
  if (resultado === "23505") {
    res.send(`<script>alert("El rut ya se encuentra registrado"); window.location.href = "/registro"; </script>`);
  } else {
    res.redirect("/login");
  }

});

function generadorAccesoToken(cliente) {
  return jwt.sign(cliente, secretKey, {expiresIn: "15m"})  
}

let token = "";
let datosClienteDecodificados = {};

function validarToken(req, res, next) {
  if (!token) res.send("Token no generado función validarToken");
  jwt.verify(token, secretKey, (error, decoded) => {
    if (error) {
      res.send("Acceso Denegado al validarToken");
    } else {
      datosClienteDecodificados = decoded;
      next();
    }
  });
}

app.post("/login", async (req, res) => {
const { rut, password } = req.body;
const datosCliente = await consultaCliente(rut);
  if (datosCliente !== undefined) {
    if (rut === datosCliente.rut && password === datosCliente.password) {
      token = generadorAccesoToken(datosCliente);
      res.redirect("/dashboard")
    } else {
      res.send(`<script>alert("Rut o Password incorrectos"); window.location.href = "/login"; </script>`);
    }
  } else {
    res.send(`<script>alert("El rut NO se encuentra registrado"); window.location.href = "/login"; </script>`);
  }
});

app.get("/dashboard/datos-personales", validarToken, (req, res) => {
  res.render("infopersonal", {
    layout: "infopersonal",
    cliente: datosClienteDecodificados
  });
});

app.post("/dashboard/agendar-asesoria", validarToken, async (req, res) => {
  console.log(datosSemaforo);
  if (datosSemaforo.ingreso > 0) {
    await nuevoSemaforo(datosSemaforo);
  }
  datosSemaforo = {}
  console.log(datosSemaforo)
  res.render("agenda", {
    layout: "agenda",
    cliente: datosClienteDecodificados
  });
});

let datosSemaforo;

app.post("/dashboard/calcular-semaforo", validarToken, (req, res) => {
  const { ingreso, cuota, deuda, activo } = req.body;
  let carga = 0;
  let leverage = 0;
  let patrimonio = 0;
  let evaluacion = -1;

  if (ingreso > 0) {
    carga = cuota / ingreso;
    leverage = deuda / ingreso;
    patrimonio = activo - deuda;
    if (carga <= (1/4)) {
      evaluacion = 1;
    } else if (carga <= (2/4)) {
      evaluacion = 0;
    } else {
      evaluacion = -1;
    };
  };

  datosSemaforo = {
    ingreso: Number(ingreso),
    cuota: Number(cuota),
    deuda: Number(deuda),
    activo: Number(activo),
    carga: carga,
    leverage: leverage,
    patrimonio: patrimonio,
    fecha_hora: moment(Date.now()).format("DD/MM/YYYY HH:mm:ss"),
    semaforo: evaluacion,
    rutCliente: datosClienteDecodificados.rut
  };
  res.render("dashboard", {
    layout: "dashboard",
    cliente: datosClienteDecodificados,
    semaforo: datosSemaforo
  });
});

// Inicializando servidor en puerto 3000
app.listen(3000, () => console.log("Servidor activo en puerto 3000"))