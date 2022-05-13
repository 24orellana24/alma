// Importación de funciones con las querys que procesan sobre la BD
const { nuevoCliente, consultaCliente, nuevoSemaforo, actualizarCliente, consultaSemaforo, nuevaCita } = require("./querys");

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
const fs = require("fs");
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

app.get("/login-asesor", async (req, res) => {
  res.render("login-asesor", {
    layout: "login-asesor"
  });
});

app.get("/dashboard", validarToken, async (req, res) => {
  const resultadoCliente = await consultaCliente(datosClienteDecodificados.rut);
  let resultadoSemaforo = await consultaSemaforo(datosClienteDecodificados.rut);
  if (resultadoSemaforo.length > 0) {
    resultadoSemaforo[0].fechahora = moment(resultadoSemaforo[0].fechahora).format("DD-MM-YYYY HH:mm:ss");
  } else {
    resultadoSemaforo = [{
      ingreso: 0,
      cuota: 0,
      deuda: 0,
      activo: 0,
      carga: 0,
      leverage: 0,
      patrimonio: 0,
      fechahora: moment(Date.now()).format("DD/MM/YYYY HH:mm:ss"),
      semaforo: 0
    }];
  }
  res.render("dashboard", {
    layout: "dashboard",
    cliente: resultadoCliente[0],
    semaforo: resultadoSemaforo[0]
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
const resultadoCliente = await consultaCliente(rut);
  if (resultadoCliente !== undefined) {
    if (rut === resultadoCliente[0].rut && password === resultadoCliente[0].password) {
      token = generadorAccesoToken(resultadoCliente[0]);
      res.redirect("/dashboard")
    } else {
      res.send(`<script>alert("Rut o Password incorrectos"); window.location.href = "/login"; </script>`);
    }
  } else {
    res.send(`<script>alert("El rut NO se encuentra registrado"); window.location.href = "/login"; </script>`);
  }
});

app.get("/dashboard/datos-personales", validarToken, async (req, res) => {
  const resultadoCliente = await consultaCliente(datosClienteDecodificados.rut);
  resultadoCliente[0].fechanacimiento = moment(resultadoCliente[0].fechanacimiento).format("YYYY-MM-DD");
  res.render("infopersonal", {
    layout: "infopersonal",
    cliente: resultadoCliente[0]
  });
});

app.post("/dashboard/agendar-asesoria", validarToken, async (req, res) => {
  const resultadoCliente = await consultaCliente(datosClienteDecodificados.rut);
  if (datosSemaforo) {    
    if (datosSemaforo.ingreso > 0) {
      await nuevoSemaforo(datosSemaforo);
    }
  }
  datosSemaforo = {}
  res.render("agenda", {
    layout: "agenda",
    cliente: resultadoCliente[0]
  });
});

let datosSemaforo;

app.post("/dashboard/calcular-semaforo", validarToken, (req, res) => {
  const { ingreso, cuota, deuda, activo } = req.body;
  let carga = 0;
  let leverage = 0;
  let patrimonio = 0;
  let evaluacion = 0;
  let color = ""
  let texto = ""

  if (ingreso > 0) {
    carga = (cuota / ingreso).toFixed(4);
    leverage = (deuda / ingreso).toFixed(4);
    patrimonio = activo - deuda;
    if (carga <= (1/4)) {
      evaluacion = 1;
      color = "success"
      texto = "BUENO"
    } else if (carga <= (2/4)) {
      evaluacion = 0;
      color = "warning"
      texto = "REGULAR"
    } else {
      evaluacion = -1;
      color = "danger"
      texto = "MALO"
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
    fechahora: moment(Date.now()).format("DD/MM/YYYY HH:mm:ss"),
    semaforo: evaluacion,
    color: color,
    texto: texto,
    rutCliente: datosClienteDecodificados.rut
  };
  res.render("dashboard", {
    layout: "dashboard",
    cliente: datosClienteDecodificados,
    semaforo: datosSemaforo
  });
});

app.post("/dashboard/datos-personales", validarToken, async (req, res) => {
  const { rut, email, apellido_paterno, apellido_materno, nombre, fecha_nacimiento, celular, comuna, password, nombre_foto } = req.body;
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
    nombre_foto: nombre_foto
  };
  
  if (req.files) {
    if (datosCliente.nombre_foto !== "foto_generica.png") {
      fs.unlink(`${__dirname}/assets/img/perfil/${datosCliente.nombre_foto}`, (err) => {
        if (err) {
          const { code } = err;
          res.send(`<script>alert("Error al actualizar foto de perfil: ${code}"); window.location.href = "/dashboard/datos-personales"; </script>`);
        }
      });
    }
    const { foto } = req.files;
    datosCliente.nombre_foto = `${rut}_${uuidv4()}.png`;
    foto.mv(`${__dirname}/assets/img/perfil/${datosCliente.nombre_foto}`);
  }

  const resultado = await actualizarCliente(datosCliente);

  if (resultado) {
    resultado[0].fechanacimiento = moment(resultado[0].fechanacimiento).format("YYYY-MM-DD");
    res.render("infopersonal", {
      layout: "infopersonal",
      cliente: resultado[0]
    });
  }

});

app.post("/dashboard/agendar-asesoria/cita", validarToken, async (req, res) => {
  const { fecha, hora, comentario } = req.body;
  const datosCita = {
    fecha: fecha,
    hora: hora,
    comentario: comentario,
    estado: false,
    rut: datosClienteDecodificados.rut
  }
  const resultadoCita = await nuevaCita(datosCita);

  if (resultadoCita) {
    res.send(`<script>alert("Cita agendada para el ${moment(resultadoCita[0].fecha).format("DD-MM-YYYY")} a las ${resultadoCita[0].hora} "); window.location.href = "/dashboard"; </script>`);
  } else {
    res.send(`<script>alert("Error al generar cita: ${error.code}"); window.location.href = "/dashboard/agendar-asesoria"; </script>`);
  };
})

// Inicializando servidor en puerto 3000
app.listen(3000, () => console.log("Servidor activo en puerto 3000"))