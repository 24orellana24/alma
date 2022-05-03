// Importación de funciones con las querys que procesan sobre la BD
const { nuevoCliente, consultaCliente } = require("./querys");

// Configuración dependencia express
const express = require("express");
const app = express();

// Configuración dependencia JWT
const jwt = require("jsonwebtoken");
const secretKey = "api-alma-$";

// Configuración dependencia uuid
const { v4: uuidv4 } = require('uuid');

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

app.post("/login", async (req, res) => {
const { rut, password } = req.body;
const datosCliente = await consultaCliente(rut);
  if (datosCliente !== undefined) {
    if (rut === datosCliente.rut && password === datosCliente.password) {
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 1200,
          data: datosCliente,
        },
        secretKey
      );
      res.send(`
        <a href="/bienvenida?token=${token}"> <h2 style="text-align:center"> ¡¡¡Bienvenid@ ${datosCliente.nombre.toUpperCase()}!!!... Pincha aquí para ir a tus datos</h2> </a>
        <script>
          localStorage.setItem("token", JSON.stringify("${token}"))
        </script>
      `);
    } else {
      res.send(`<script>alert("Rut o Password incorrectos"); window.location.href = "/login"; </script>`);
    }
  } else {
    res.send(`<script>alert("El rut NO se encuentra registrado"); window.location.href = "/login"; </script>`);
  }
});

app.get("/bienvenida", (req, res) => {
  let { token } = req.query;
  jwt.verify(token, secretKey, (error, decoded) => {
    error
    ? res.status(401).send({
      error: "401 No autorizado",
      message: err.message,
    })
    :
    res.render("dashboard", {
      layout: "dashboard",
      cliente: decoded.data
    });
  });
});

// Inicializando servidor en puerto 3000
app.listen(3000, () => console.log("Servidor activo en puerto 3000"))