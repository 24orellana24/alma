// Importación de funciones para operar con la base de datos
const { nuevoCliente, consultaCliente, nuevoSemaforo, actualizarCliente, consultaSemaforo, nuevaCita, consultaAsesor, consultaCitas, consultaSemaforos, consultaCita, actualizarCita, consultaCitasRut, eliminarCliente } = require("./assets/js/querys");

//const { generadorAccesoToken } = require("./funciones");

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
  responseOnLimit: "El peso del archivo que intentas subir supera el limite permitido",
}));

// Configuración dependencia body parser
const bodyParser = require("body-parser");
const { get } = require("http");
const { now } = require("moment");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración ruta de lectura de archivos propios del proyecto
app.use(express.static(`${__dirname}/assets`));

// Configuración dependencias para dar formato a los números
const numeral = require('numeral');
const es = require('numeral/locales/es');
numeral.locale('es');

// Rutas de ejecución
let fechaMiIndicador = "01-01-1900";
let indicadoresEconomicos;
app.get("/", async (req, res) => {
  const fechaDeHoy = moment(new Date).format("DD-MM-YYYY")
  if (fechaDeHoy !== fechaMiIndicador) {
    try {
      const { data } = await axios.get("https://mindicador.cl/api");
      indicadoresEconomicos = {
        uf: numeral(data.uf.valor).format('0,0.00'),
        dolar: numeral(data.dolar.valor).format('0,0.00'),
        euro: numeral(data.euro.valor).format('0,0.00'),
        utm: numeral(data.utm.valor).format('0,0.00'),
        ipc: numeral(data.ipc.valor).format('0.00'),
      };
      fechaMiIndicador = moment(indicadoresEconomicos.fecha).format("DD-MM-YYYY");
      console.log("Consulta exitosa a API mindicador.cl");
    } catch (error) {
      console.log("Error al consultsar API mindicador.cl");
    }
  }
  res.render("index", {
    layout: "index",
    indicadoresEconomicos: indicadoresEconomicos,
    activarAlerta: "none"
  });
});

app.get("/calculadora", async (req, res) => {
  res.render("calculadora", {
    layout: "calculadora",
    indicadoresEconomicos: indicadoresEconomicos
  });
});


app.get("/presupuesto", async (req, res) => {
  // Ingresos
  const ingresos = JSON.parse(JSON.stringify(tablaIngresos));
  const totalIngresosMensuales = numeral(ingresos.reduce((previo, actual) => previo + actual.montoIngresoMensual, 0)).format("0,0");
  const totalIngresosAnuales = numeral(ingresos.reduce((previo, actual) => previo + actual.montoIngresoAnual, 0)).format("0,0");
  let verTablaIngresos = "none"
  if (ingresos.length > 0) {
    verTablaIngresos = ""
  };
  for (let i = 0; i < ingresos.length; i++) {
    ingresos[i].montoIngreso = numeral(ingresos[i].montoIngreso).format("0,0");
    ingresos[i].montoIngresoMensual = numeral(ingresos[i].montoIngresoMensual).format("0,0");
    ingresos[i].montoIngresoAnual = numeral(ingresos[i].montoIngresoAnual).format("0,0");
  };
  // Gastos Financieros
  const gastosFinancieros = JSON.parse(JSON.stringify(tablaGastosFinancieros));
  const totalGastosFinancierosMensuales = numeral(gastosFinancieros.reduce((previo, actual) => previo + actual.gastoFinancieroMensual, 0)).format("0,0");
  const totalGastosFinancierosAnuales = numeral(gastosFinancieros.reduce((previo, actual) => previo + actual.gastoFinancieroAnual, 0)).format("0,0");
  let verTablaGastosFinancieros = "none"
  if (gastosFinancieros.length > 0) {
    verTablaGastosFinancieros = ""
  };
  for (let i = 0; i < gastosFinancieros.length; i++) {
    gastosFinancieros[i].cuotaGastoFinanciero = numeral(gastosFinancieros[i].cuotaGastoFinanciero).format("0,0");
    gastosFinancieros[i].gastoFinancieroMensual = numeral(gastosFinancieros[i].gastoFinancieroMensual).format("0,0");
    gastosFinancieros[i].gastoFinancieroAnual = numeral(gastosFinancieros[i].gastoFinancieroAnual).format("0,0");
    gastosFinancieros[i].saldoGastoFinanciero = numeral(gastosFinancieros[i].saldoGastoFinanciero).format("0,0");
   };
  res.render("presupuesto", {
    layout: "presupuesto",
    tablaIngresos: ingresos,
    totalIngresosMensuales: totalIngresosMensuales,
    totalIngresosAnuales: totalIngresosAnuales,
    verTablaIngresos: verTablaIngresos,
    tablaGastosFinancieros: gastosFinancieros,
    totalGastosFinancierosMensuales: totalGastosFinancierosMensuales,
    totalGastosFinancierosAnuales: totalGastosFinancierosAnuales,
    verTablaGastosFinancieros: verTablaGastosFinancieros,
    indicadoresEconomicos: indicadoresEconomicos
  });
});

app.get("/registro", async (req, res) => {
  res.render("registro", {
    layout: "registro",
    indicadoresEconomicos: indicadoresEconomicos
  });
});

app.get("/login-cliente", async (req, res) => {
  res.render("login", {
    layout: "login",
    activarAlerta: "none",
    ruta: req.route.path,
    tituloLogin: "Credenciales de Cliente",
    indicadoresEconomicos: indicadoresEconomicos
  });
});

app.get("/login-asesor", async (req, res) => {
  res.render("login", {
    layout: "login",
    activarMensaje: "none",
    ruta: req.route.path,
    tituloLogin: "Credenciales de Asesor",
    indicadoresEconomicos: indicadoresEconomicos
  });
});

let resultadoCitasRut;
let resultadoSemaforo;
let resultadoSemaforos;
let resultadoCliente;
let notificacion = {
  activarToast: false,
  tipoToast: "",
  mensajeToast: "",
}; //revisar

app.get("/dashboard", validarToken, async (req, res) => {
  resultadoCliente = await consultaCliente(datosDecoded.rut);
  resultadoCitasRut = await consultaCitasRut(datosDecoded.rut);
  resultadoSemaforo = await consultaSemaforo(datosDecoded.rut);
  resultadoSemaforos = await consultaSemaforos(datosDecoded.rut);

  resultadoCitasRut.forEach(element => element.fecha = moment(element.fecha).format("DD-MM-YYYY"));

  if (resultadoSemaforo.length <= 0) {
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

  resultadoSemaforo.forEach(element => {
    element.fechahora = moment(element.fechahora).format("DD-MM-YYYY HH:mm");
    if (element.semaforo == 1) {
      element["color"] = "success";
      element["texto"] = "(Riesgo: BAJO)";
    } else if (element.semaforo == 0) {
      element["color"] = "warning";
      element["texto"] = "(Riesgo: MEDIO)";
    } else {
      element["color"] = "danger";
      element["texto"] = "(Riesgo: ALTO)";
    }
  });

  resultadoSemaforos.forEach(element => {
    element.fechahora = moment(element.fechahora).format("DD-MM-YYYY HH:mm");
    if (element.semaforo == 1) {
      element["color"] = "success";
      element["texto"] = "(Riesgo: BAJO)";
    } else if (element.semaforo == 0) {
      element["color"] = "warning";
      element["texto"] = "(Riesgo: MEDIO)";
    } else {
      element["color"] = "danger";
      element["texto"] = "(Riesgo: ALTO)";
    }
  });

  res.render("dashboard", {
    layout: "dashboard",
    cliente: resultadoCliente[0],
    semaforo: resultadoSemaforo[0],
    citas: resultadoCitasRut,
    indicadores: resultadoSemaforos,
    totales: {"totalCitas": totalCitas = resultadoCitasRut.length, "totalSemaforos": totalSemaforos = resultadoSemaforos.length},
    indicadoresEconomicos: indicadoresEconomicos,
    activarToast: notificacion.activarToast,
    tipoToast: notificacion.tipoToast,
    mensajeToast: notificacion.mensajeToast
  });
  notificacion.activarToast = false;
});

let token = "";
let datosDecoded = {};

function generadorAccesoToken(cliente) {
  return jwt.sign(cliente, secretKey, {expiresIn: "10m"})  
}

function validarToken(req, res, next) {
  if (!token) res.send("Token no generado función validarToken");
  jwt.verify(token, secretKey, (error, decoded) => {
    if (error) {
      res.send(`<script>alert("Acceso Denegado al validar Token"); window.location.href = "/"; </script>`);
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
      res.render("registro", {
        layout: "registro",
        indicadoresEconomicos: indicadoresEconomicos,
        activarToast: true,
        tipoToast: "danger",
        mensajeToast: "Rut ya registrado",
      });      
    } else {

      if (req.files) {
        const { foto } = req.files;
        datosCliente.nombre_foto = `${rut}_${uuidv4()}.png`;
        foto.mv(`${__dirname}/assets/img/perfil/${datosCliente.nombre_foto}`);
      };

      const resultado = await nuevoCliente(datosCliente);
      res.send(`<script>alert("Cuenta creada con éxito"); window.location.href = "/login"; </script>`);
    }
    
  } else {
    res.send(`<script>alert("Password y Repetir Password deben ser iguales"); window.location.href = "/registro"; </script>`);
  };

});

app.post("/login-cliente", async (req, res) => {
  const { rut, password } = req.body;
  const resultadoCliente = await consultaCliente(rut);
  if (resultadoCliente.length > 0 && resultadoCliente !== undefined) {
    if (rut === resultadoCliente[0].rut && password === resultadoCliente[0].password && resultadoCliente[0].estado === true) {
      token = generadorAccesoToken(resultadoCliente[0]);
      res.redirect("/dashboard")
    } else {
      res.render("login", {
        layout: "login",
        ruta: req.route.path,
        tituloLogin: "Credenciales de Cliente",
        indicadoresEconomicos: indicadoresEconomicos,
        activarToast: true,
        tipoToast: "danger",
        mensajeToast: "Revisar Rut y/o Constraseña",
      });
    }
  } else {
    res.render("login", {
      layout: "login",
      ruta: req.route.path,
      tituloLogin: "Credenciales de Cliente",
      indicadoresEconomicos: indicadoresEconomicos,
      activarToast: true,
      tipoToast: "danger",
      mensajeToast: "Revisar Rut y/o Constraseña",
    });
  }
});

let datosSemaforo;

app.post("/dashboard/agendar-asesoria", validarToken, async (req, res) => {
  const {ingreso, cuota, deuda, activo, carga, leverage, patrimonio, fecha_hora} = req.body;
  
  let evaluacionCarga
  
  if (carga <= (25)) {
    evaluacionCarga = 1
  } else if (carga <= (50)) {
    evaluacionCarga = 0
  } else {
    evaluacionCarga = -1
  };

  datosSemaforo = {
    ingreso: Number(ingreso),
    cuota: Number(cuota),
    deuda: Number(deuda),
    activo: Number(activo),
    carga: Number(carga),
    leverage: Number(leverage),
    patrimonio: Number(patrimonio),
    fechahora: moment(Date.now()).format("DD/MM/YYYY HH:mm:ss"),
    semaforo: evaluacionCarga,
    rutCliente: datosDecoded.rut
  };
  
  resultadoCitasRut = await consultaCitasRut(datosDecoded.rut);
  let citasPorFinalizar = 0;
  resultadoCitasRut.forEach(element => {
    if (element.estado == false) {
      citasPorFinalizar = citasPorFinalizar + 1;
    }
  });
  if (citasPorFinalizar) {
    notificacion.activarToast = true;
    notificacion.tipoToast = "danger";
    notificacion.mensajeToast = "Ya tiene una cita en proceso o sin finalizar. No puede generar una nueva cita.";
    res.redirect("/dashboard");
    
  } else {
    const resultadoCliente = await consultaCliente(datosDecoded.rut);
    let fechasDisponibles = [];
    let numeroDias = 6;
    do {
      numeroDias = numeroDias + 1;
      let fechaAgregar = new Date(moment().add(numeroDias, "days").calendar());
      fechasDisponibles.push(moment(fechaAgregar).format("DD-MM-YYYY"));
    } while (numeroDias < 13);
    //datosSemaforo = {}
    res.render("agenda", {
      layout: "agenda",
      cliente: resultadoCliente[0],
      indicadoresEconomicos: indicadoresEconomicos,
      fechasDisponibles: fechasDisponibles,
    });
  };
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
    resultado[0].fechanacimiento = moment(resultado[0].fechanacimiento).format("YYYY-MM-DD");
  
    if (resultado) {
      res.render("infopersonal", {
        layout: "infopersonal",
        cliente: resultado[0],
        indicadoresEconomicos: indicadoresEconomicos,
        activarToast: true,
        tipoToast: "success",
        mensajeToast: "Datos Actualizados",
    })};

  } else {
    res.send(`<script>alert("Password y Repetir Password deben ser iguales"); window.location.href = "/dashboard/datos-personales"; </script>`);
  };

});

app.post("/dashboard/agendar-asesoria/cita", validarToken, async (req, res) => {
  let { fecha, hora, comentario } = req.body;
  fecha = fecha.split("-");
  const datosCita = {
    fecha: new Date(fecha[2], fecha[1], fecha[0]),
    hora: hora,
    comentario: comentario,
    estado: false,
    rut: datosDecoded.rut
  }

  console.log(datosSemaforo);

  const resultadoNuevaCita = await nuevaCita(datosCita);
  const resultadoNuevoSemaforo = await nuevoSemaforo(datosSemaforo);

  if (resultadoNuevaCita && resultadoNuevoSemaforo) {
    res.send(`<script>alert("Cita agendada para el ${moment(resultadoNuevaCita[0].fecha).format("DD-MM-YYYY")} a las ${resultadoNuevaCita[0].hora} "); window.location.href = "/dashboard"; </script>`);
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
      res.render("login", {
        layout: "login",
        activarMensaje: "",
        ruta: req.route.path,
        tituloLogin: "Credenciales de Asesor",
        indicadoresEconomicos: indicadoresEconomicos,
        activarToast: true,
        tipoToast: "danger",
        mensajeToast: "Revisar Rut y/o Constraseña",
      });
    }
  } else {
    res.render("login", {
      layout: "login",
      activarMensaje: "",
      ruta: req.route.path,
      tituloLogin: "Credenciales de Asesor",
      indicadoresEconomicos: indicadoresEconomicos,
      activarToast: true,
      tipoToast: "danger",
      mensajeToast: "Revisar Rut y/o Constraseña",
    });
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

let tablaIngresos = [];
app.post("/presupuesto-sumarIngreso", async (req, res) => {
  const { tipoIngreso, tipoPeriocidad, montoIngreso, comentarioIngreso } = req.body;
  const montoIngresoMensual = calcularPeriocidad(tipoPeriocidad, montoIngreso);
  tablaIngresos.push({
    indice: tablaIngresos.length + 1,
    tipoIngreso: tipoIngreso,
    tipoPeriocidad: tipoPeriocidad,
    montoIngreso: Number(montoIngreso),
    montoIngresoMensual: Number(montoIngresoMensual),
    montoIngresoAnual: Number(montoIngresoMensual * 12),
    comentarioIngreso: comentarioIngreso
  });
  res.redirect("/presupuesto");
});

let tablaGastosFinancieros = [];
app.post("/presupuesto-sumarGastoFinanciero", async (req, res) => {
  const { tipoGastoFinanciero, periocidadGastoFinanciero, cuotaGastoFinanciero, saldoGastoFinanciero, comentarioGastoFinanciero } = req.body;
  const montoGastoFinancieroMensual = calcularPeriocidad(periocidadGastoFinanciero, cuotaGastoFinanciero);
  tablaGastosFinancieros.push({
    indiceGastoFinanciero: tablaGastosFinancieros.length + 1,
    tipoGastoFinanciero: tipoGastoFinanciero,
    periocidadGastoFinanciero: periocidadGastoFinanciero,
    cuotaGastoFinanciero: Number(cuotaGastoFinanciero),
    saldoGastoFinanciero: Number(saldoGastoFinanciero),
    comentarioGastoFinanciero: comentarioGastoFinanciero,
    gastoFinancieroMensual: Number(montoGastoFinancieroMensual),
    gastoFinancieroAnual: Number(montoGastoFinancieroMensual * 12)
  });
  console.log(tablaGastosFinancieros);
  res.redirect("/presupuesto");
});

function calcularPeriocidad (tipoPeriocidad, montoIngreso) {
  let montoIngresoMensual = 0;
  switch (tipoPeriocidad) {
    case "Mensual":
      montoIngresoMensual = montoIngreso / 1;
      break;
    case "Bimensual":
      montoIngresoMensual = montoIngreso / 2;
      break;
    case "Trimestral":
      montoIngresoMensual = montoIngreso / 3;
      break;
    case "Cuatrimestral":
      montoIngresoMensual = montoIngreso / 4;
      break;
    case "Semestral":
      montoIngresoMensual = montoIngreso / 6;
      break;
    case "Anual":
      montoIngresoMensual = montoIngreso / 12;
      break;
  }
  return montoIngresoMensual;
}

app.post("/presupuesto-consultarIngreso", async (req, res) => {
  const indice = req.body.indice - 1;
  res.send(tablaIngresos[indice]);
});

app.post("/presupuesto-modificarIngreso", async (req, res) => {
  const {indiceIngreso, tipoIngreso, tipoPeriocidad, montoIngreso, comentarioIngreso } = req.body;
  const montoIngresoMensual = calcularPeriocidad(tipoPeriocidad, montoIngreso);
  tablaIngresos[indiceIngreso - 1].tipoIngreso = tipoIngreso;
  tablaIngresos[indiceIngreso - 1].tipoPeriocidad = tipoPeriocidad;
  tablaIngresos[indiceIngreso - 1].montoIngreso = montoIngreso;
  tablaIngresos[indiceIngreso - 1].montoIngresoMensual = montoIngresoMensual;
  tablaIngresos[indiceIngreso - 1].montoIngresoAnual = montoIngresoMensual * 12;
  tablaIngresos[indiceIngreso - 1].comentarioIngreso = comentarioIngreso;
  res.redirect("/presupuesto");
});

app.post("/presupuesto-borrarIngresos", async (req, res) => {
  tablaIngresos = [];
  res.redirect("/presupuesto");
});

app.post("/presupuesto-borrarGastosFinancieros", async (req, res) => {
  tablaGastosFinancieros = [];
  res.redirect("/presupuesto");
});

app.post("/presupuesto-restarIngreso", async (req, res) => {
  const { indice } = req.body;
  tablaIngresos = tablaIngresos.filter(tabla => tabla.indice != indice);
  for (let i = 0; i < tablaIngresos.length; i++) {
    tablaIngresos[i].indice = i + 1;
  };
  res.end();
});

app.post("/presupuesto-restarGastoFinanciero", async (req, res) => {
  const { indice } = req.body;
  tablaGastosFinancieros = tablaGastosFinancieros.filter(tabla => tabla.indice != indice);
  for (let i = 0; i < tablaGastosFinancieros.length; i++) {
    tablaGastosFinancieros[i].indice = i + 1;
  };
  res.end();
}); 

// Inicializando servidor en puerto 3000
app.listen(3000, () => console.log("Servidor activo en puerto 3000"));