// Importación de funciones con las querys que procesan sobre la BD
const { nuevoCliente, consultaCliente, nuevoSemaforo, actualizarCliente, consultaSemaforo, nuevaCita, consultaAsesor, consultaCitas, consultaSemaforos, consultaCita, actualizarCita,consultaCitasRut, eliminarCliente } = require("./querys");

// Configuración dependencia express
const express = require("express");
const app = express();

// Configuración dependencia JWT
const jwt = require("jsonwebtoken");
const secretKey = "api-alma-$";

// Configuración dependencia uuid, moment y axios
const { v4: uuidv4 } = require('uuid');
const moment = require("moment");
const axios = require("axios");

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
const { get } = require("http");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración ruta de acceso para consumir framework boostrap
app.use("/bootstrap", express.static(`${__dirname}/node_modules/bootstrap/dist/css`));
app.use("/bootstrap-icons", express.static(`${__dirname}/node_modules/bootstrap-icons/font`));

// Configuración ruta de lectura de archivos propios del proyecto
app.use(express.static(`${__dirname}/assets`));

// Rutas de ejecución
let indicadoresEconomicos;
app.get("/", async (req, res) => {
  const { data } = await axios.get("https://mindicador.cl/api");
  indicadoresEconomicos = data;
  res.render("index", {
    layout: "index",
    indicadoresEconomicos: indicadoresEconomicos
  });
});

app.get("/registro", async (req, res) => {
  res.render("registro", {
    layout: "registro",
    indicadoresEconomicos: indicadoresEconomicos
  });
});

app.get("/login", async (req, res) => {
  res.render("login", {
    layout: "login",
    indicadoresEconomicos: indicadoresEconomicos
  });
});

app.get("/login-asesor", async (req, res) => {
  res.render("loginAsesor", {
    layout: "loginAsesor",
    indicadoresEconomicos: indicadoresEconomicos
  });
});

let resultadoCitasRut;
let resultadoSemaforos;
app.get("/dashboard", validarToken, async (req, res) => {
  const resultadoCliente = await consultaCliente(datosDecoded.rut);
  resultadoCitasRut = await consultaCitasRut(datosDecoded.rut);
  let resultadoSemaforo = await consultaSemaforo(datosDecoded.rut);
  resultadoSemaforos = await consultaSemaforos(datosDecoded.rut);

  resultadoCitasRut.forEach(element => element.fecha = moment(element.fecha).format("DD-MM-YYYY"));

  if (resultadoSemaforo.length > 0) {
    resultadoSemaforo = [calcularSemaforo(resultadoSemaforo[0].ingreso, resultadoSemaforo[0].cuota, resultadoSemaforo[0].deuda, resultadoSemaforo[0].activo)];
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

  resultadoSemaforos.forEach(element => {
    element.fechahora = moment(element.fechahora).format("DD-MM-YYYY HH:mm");
    if (element.semaforo == 1) {
      element["color"] = "success";
      element["texto"] = "BUENO";
    } else if (element.semaforo == 0) {
      element["color"] = "warning";
      element["texto"] = "REGULAR";
    } else {
      element["color"] = "danger";
      element["texto"] = "MALO";
    }
  });

  res.render("dashboard", {
    layout: "dashboard",
    cliente: resultadoCliente[0],
    semaforo: resultadoSemaforo[0],
    citas: resultadoCitasRut,
    indicadores: resultadoSemaforos,
    totales: {"totalCitas": totalCitas = resultadoCitasRut.length, "totalSemaforos": totalSemaforos = resultadoSemaforos.length},
    indicadoresEconomicos: indicadoresEconomicos
  });
});

function generadorAccesoToken(cliente) {
  return jwt.sign(cliente, secretKey, {expiresIn: "15m"})  
}

let token = "";
let datosDecoded = {};

function validarToken(req, res, next) {
  if (!token) res.send("Token no generado función validarToken");
  jwt.verify(token, secretKey, (error, decoded) => {
    if (error) {
      res.send("Acceso Denegado al validarToken");
    } else {
      datosDecoded = decoded;
      next();
    }
  });
}

app.get("/dashboard/datos-personales", validarToken, async (req, res) => {
  const resultadoCliente = await consultaCliente(datosDecoded.rut);
  resultadoCliente[0].fechanacimiento = moment(resultadoCliente[0].fechanacimiento).format("YYYY-MM-DD");
  res.render("infopersonal", {
    layout: "infopersonal",
    cliente: resultadoCliente[0],
    indicadoresEconomicos: indicadoresEconomicos
  });
});

app.post("/registro", async (req, res) => {
  const { rut, email, apellido_paterno, apellido_materno, nombre, fecha_nacimiento, celular, comuna, password, rep_password } = req.body;
  const resultadoCliente = await consultaCliente(rut);

  if (password === rep_password) {

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

    if (resultadoCliente.length > 0  && resultadoCliente[0].estado === false) {

      if (req.files) {
        const { foto } = req.files;
        datosCliente.nombre_foto = `${rut}_${uuidv4()}.png`;
        foto.mv(`${__dirname}/assets/img/perfil/${datosCliente.nombre_foto}`);
      };

      const resultado = await actualizarCliente(datosCliente);
      res.send(`<script>alert("Cuenta creada con éxito"); window.location.href = "/login"; </script>`);

    } else if (resultadoCliente.length > 0  && resultadoCliente[0].estado === true) {
      res.send(`<script>alert("Rut ya registrado"); window.location.href = "/login"; </script>`);
      
    } else {

      if (req.files) {
        const { foto } = req.files;
        datosCliente.nombre_foto = `${rut}_${uuidv4()}.png`;
        foto.mv(`${__dirname}/assets/img/perfil/${datosCliente.nombre_foto}`);
      };

      const resultado = await nuevoCliente(datosCliente);
      res.send(`<script>alert("Cuenta creada con éxito}"); window.location.href = "/login"; </script>`);
    }
    

  } else {
    res.send(`<script>alert("Password y Repetir Password deben ser iguales"); window.location.href = "/registro"; </script>`);
  };

});

app.post("/login", async (req, res) => {
  const { rut, password } = req.body;
  const resultadoCliente = await consultaCliente(rut);
  if (resultadoCliente.length > 0 && resultadoCliente !== undefined) {
    if (rut === resultadoCliente[0].rut && password === resultadoCliente[0].password && resultadoCliente[0].estado === true) {
      token = generadorAccesoToken(resultadoCliente[0]);
      res.redirect("/dashboard")
    } else {
      res.send(`<script>alert("Rut o Password incorrectos"); window.location.href = "/login"; </script>`);
    }
  } else {
    res.send(`<script>alert("Rut o Password incorrectos"); window.location.href = "/login"; </script>`);
  }
});

app.post("/dashboard/agendar-asesoria", validarToken, async (req, res) => {
  resultadoCitasRut = await consultaCitasRut(datosDecoded.rut);
  let citasPorFinalizar = 0;
  resultadoCitasRut.forEach(element => {
    if (element.estado == false) {
      citasPorFinalizar = citasPorFinalizar + 1;
    }
  });
  if (citasPorFinalizar) {
    res.send(`<script>alert("Ya tiene una asesoría en proceso, no puede generar una nueva asesoría"); window.location.href = "/dashboard"; </script>`);
  } else {
    const resultadoCliente = await consultaCliente(datosDecoded.rut);
    if (datosSemaforo) {    
      if (datosSemaforo.ingreso > 0) {
        await nuevoSemaforo(datosSemaforo);
      }
    }
    datosSemaforo = {}
    res.render("agenda", {
      layout: "agenda",
      cliente: resultadoCliente[0],
      indicadoresEconomicos: indicadoresEconomicos
    });
  };
});

let datosSemaforo;

function calcularSemaforo(ingreso, cuota, deuda, activo) {
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
    rutCliente: datosDecoded.rut
  };
  return datosSemaforo;
}

app.post("/dashboard/calcular-semaforo", validarToken, async (req, res) => {
  const { ingreso, cuota, deuda, activo } = req.body;
  const datosSemaforo = calcularSemaforo(ingreso, cuota, deuda, activo);
  const resultadoCliente = await consultaCliente(datosDecoded.rut);

  res.render("dashboard", {
    layout: "dashboard",
    cliente: resultadoCliente[0],
    semaforo: datosSemaforo,
    citas: resultadoCitasRut,
    indicadores: resultadoSemaforos,
    totales: {"totalCitas": totalCitas = resultadoCitasRut.length, "totalSemaforos": totalSemaforos = resultadoSemaforos.length},
    indicadoresEconomicos: indicadoresEconomicos
  });
});

app.post("/dashboard/datos-personales", validarToken, async (req, res) => {
  const { rut, email, apellido_paterno, apellido_materno, nombre, fecha_nacimiento, celular, comuna, password, rep_password, nombre_foto } = req.body;
  if (password === rep_password) {

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
      res.send(`<script>alert("Datos personales actualizados"); window.location.href = "/dashboard/datos-personales"; </script>`);
    }

  } else {
    res.send(`<script>alert("Password y Repetir Password deben ser iguales"); window.location.href = "/dashboard/datos-personales"; </script>`);
  };

});

app.post("/dashboard/agendar-asesoria/cita", validarToken, async (req, res) => {
  const { fecha, hora, comentario } = req.body;
  const datosCita = {
    fecha: fecha,
    hora: hora,
    comentario: comentario,
    estado: false,
    rut: datosDecoded.rut

  }

  const resultadoCita = await nuevaCita(datosCita);

  if (resultadoCita) {
    res.send(`<script>alert("Cita agendada para el ${moment(resultadoCita[0].fecha).format("DD-MM-YYYY")} a las ${resultadoCita[0].hora} "); window.location.href = "/dashboard"; </script>`);
  } else {
    res.send(`<script>alert("Error al generar cita: ${error.code}"); window.location.href = "/dashboard/agendar-asesoria"; </script>`);
  };
})

app.post("/login-asesor", async (req, res) => {
  const { rut, password } = req.body;
  const resultadoAsesor = await consultaAsesor(rut);
  if (resultadoAsesor.length > 0 && resultadoAsesor !== undefined) {
    if (rut === resultadoAsesor[0].rut && password === resultadoAsesor[0].password) {
      token = generadorAccesoToken(resultadoAsesor[0]);
      res.redirect("/dashboard-asesor");
    } else {
      res.send(`<script>alert("Rut o Password incorrectos"); window.location.href = "/login-asesor"; </script>`);
    }
  } else {
    res.send(`<script>alert("Rut o Password incorrectos"); window.location.href = "/login-asesor"; </script>`);
  }
});

app.get("/dashboard-asesor", validarToken, async (req, res) =>{
  const resultadoAsesor = await consultaAsesor(datosDecoded.rut);
  const resultadoCitas = await consultaCitas();
  let citasPendientes = 0
  let citasFinalizadas = 0
  
  resultadoCitas.forEach(element => {
    element.fecha = moment(element.fecha).format("DD-MM-YYYY");
    (element.estado) ? citasFinalizadas = citasFinalizadas + 1 : citasPendientes = citasPendientes + 1;
  });
  
  res.render("dashboardAsesor", {
    layout: "dashboardAsesor",
    asesor: resultadoAsesor[0],
    citas: resultadoCitas,
    citasFinalizadas: citasFinalizadas,
    citasPendientes: citasPendientes,
    indicadoresEconomicos: indicadoresEconomicos
  });
})

app.get("/dashboard-asesor/cita?", validarToken, async (req, res) => {
  const { id, rut } = req.query;
  const resultadoAsesor = await consultaAsesor(datosDecoded.rut);
  const resultadoCliente = await consultaCliente(rut);
  const resultadoCita = await consultaCita(id);
  resultadoSemaforos = await consultaSemaforos(rut);
  resultadoCitasRut = await consultaCitasRut(rut);

  resultadoCliente[0].fechanacimiento = moment(resultadoCliente[0].fechanacimiento).format("YYYY-MM-DD");
  resultadoCita[0].fecha = moment(resultadoCita[0].fecha).format("YYYY-MM-DD");

  resultadoCitasRut.forEach(element => element.fecha = moment(element.fecha).format("DD-MM-YYYY"));

  resultadoSemaforos.forEach(element => {
    element.fechahora = moment(element.fechahora).format("DD-MM-YYYY HH:mm");
    if (element.semaforo == 1) {
      element["color"] = "success";
      element["texto"] = "BUENO";
    } else if (element.semaforo == 0) {
      element["color"] = "warning";
      element["texto"] = "REGULAR";      
    } else {
      element["color"] = "danger";
      element["texto"] = "MALO";
    }
  });

  res.render("cita", {
    layout: "cita",
    asesor: resultadoAsesor[0],
    cliente: resultadoCliente[0],
    cita: resultadoCita[0],
    citas: resultadoCitasRut,
    indicadores: resultadoSemaforos,
    totales: {"totalCitas": totalCitas = resultadoCitasRut.length, "totalSemaforos": totalSemaforos = resultadoSemaforos.length},
    indicadoresEconomicos: indicadoresEconomicos
  });
});

app.post("/dashboard-asesor/cerrar-cita", validarToken, async (req, res) => {
  const { idCita, comentarioAsesor } = req.body;
  const datosCita = {
    idCita: idCita,
    comentarioAsesor: comentarioAsesor,
    rutAsesor: datosDecoded.rut,
    estado: true
  };

  const resultadoCita = await actualizarCita(datosCita);

  if (resultadoCita) {
    res.send(`<script>alert("Actualización de la cita guardada con éxito"); window.location.href = "/dashboard-asesor"; </script>`);
  } else {
    res.send(`<script>alert("Error al actualizar cita: ${error.code}"); window.location.href = "#"; </script>`);
  };

});

app.get("/dashboard/eliminar", validarToken, async (req, res) => {
  const resultadoEliminar = await eliminarCliente(datosDecoded.rut);

  if (resultadoEliminar) {
    res.send(`<script>alert("Eliminación de la cuenta exitosa"); window.location.href = "/"; </script>`);
  } else {
    res.send(`<script>alert("Error al eliminar cuenta ${resultadoEliminar}"); window.location.href = "#"; </script>`);
  };

});

// Inicializando servidor en puerto 3000
app.listen(3000, () => console.log("Servidor activo en puerto 3000"))