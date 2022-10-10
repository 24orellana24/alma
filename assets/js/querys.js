const moment = require("moment");

// Configuración dependencia postgre_sql
const { Pool } = require("pg");
const pool = new Pool({
  //user: "postgres",
  user: "almafinanciera",
  host: "localhost",
  //password: "postgres",
  password: "josealma24financiera24",
  //database: "alma",
  database: "almafina_taurus",
  port: 5432,
});

// Función para ingresar a un nuevo cliente a la BD
async function nuevoCliente(cliente) {
  try {
    const SQLquery = {
      text: `
      INSERT INTO
      clientes (rut, nombre, apellidopaterno, apellidomaterno, fechanacimiento, email, celular, comuna, estado, foto, password)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;`,
      values: [cliente.rut, cliente.nombre, cliente.apellido_paterno, cliente.apellido_materno, cliente.fecha_nacimiento, cliente.email, cliente.celular, cliente.comuna, cliente.estado, cliente.nombre_foto, cliente.password]
    }
    const resultado = await pool.query(SQLquery);
    return resultado.rows;
  } catch (error) {
    console.log(`Error en query nuevo cliente:\n${error}`);
    return error.code;
  }
}

// Función para consultar a un cliente de la BD
async function consultaCliente(rut) {
  try {
    const SQLquery = {
      text: `SELECT * FROM clientes WHERE rut=$1`,
      values: [rut]
    }
    const resultadoCliente = await pool.query(SQLquery);
    return resultadoCliente.rows;
  } catch (error) {
    console.log(`Error en query consulta cliente:\n${error}`);
    return error.code;
  }
}

// Función para registrar datos del semáforo al solicitar acesoría
async function nuevoSemaforo(semaforo) {
  try {
    const SQLquery = {
      text: `
      INSERT INTO
      indicadores (ingreso, cuota, deuda, activo, carga, leverage, patrimonio, fechahora, semaforo, idrut)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;`,
      values: [semaforo.ingreso, semaforo.cuota, semaforo.deuda, semaforo.activo, semaforo.carga, semaforo.leverage, semaforo.patrimonio, moment(semaforo.fecha_hora).format(), semaforo.semaforo, semaforo.rutCliente]
    }
    const resultado = await pool.query(SQLquery);
    return resultado.rows;
  } catch (error) {
    console.log(`Error en query nuevo semáforo:\n${error}`);
    return error.code;
  }
}

// Función para actualizar la información de un cliente en la BD
async function actualizarCliente(cliente) {
  try {
    const SQLquery = {
      text: `
      UPDATE clientes
      SET nombre=$1, apellidopaterno=$2, apellidomaterno=$3, fechanacimiento=$4, email=$5, celular=$6, comuna=$7, foto=$8, password=$9, estado=$10 WHERE rut=$11 RETURNING *;`,
      values: [cliente.nombre, cliente.apellido_paterno, cliente.apellido_materno, cliente.fecha_nacimiento, cliente.email, cliente.celular, cliente.comuna, cliente.nombre_foto, cliente.password, true, cliente.rut]
    }
    const resultado = await pool.query(SQLquery);
    return resultado.rows;
  } catch (error) {
    console.log(`Error en query actualizar cliente:\n${error}`);
    return error.code;
  }
}

// Función para consultar último semáforo generado por el cliente
async function consultaSemaforo(rut) {
  try {
    const SQLquery = {
      text: `SELECT * FROM indicadores WHERE idrut = $1 AND fechahora = (SELECT MAX(fechahora) FROM indicadores WHERE idrut = $1);`,
      values: [rut]
    }
    const resultadoSemaforo = await pool.query(SQLquery);
    return resultadoSemaforo.rows;
  } catch (error) {
    console.log(`Error en query consulta semáforo:\n${error}`);
    return error.code;
  }
}

// Función para registrar datos del semáforo al solicitar acesoría
async function nuevaCita(cita) {
  try {
    const SQLquery = {
      text: `
      INSERT INTO
      citas (fecha, hora, comentario, estado, idrut)
      values ($1, $2, $3, $4, $5)
      RETURNING *;`,
      values: [cita.fecha, cita.hora, cita.comentario, cita.estado, cita.rut]
    }
    const resultadoCita = await pool.query(SQLquery);
    return resultadoCita.rows;
  } catch (error) {
    console.log(`Error en query nueva cita:\n${error}`);
    return error.code;
  }
}

// Función para consultar a un asesor de la BD
async function consultaAsesor(rut) {
  try {
    const SQLquery = {
      text: `SELECT * FROM asesores WHERE rut=$1`,
      values: [rut]
    }
    const resultadoAsesor = await pool.query(SQLquery);
    return resultadoAsesor.rows;
  } catch (error) {
    console.log(`Error en query consulta asesor:\n${error}`);
    return error.code;
  }
}

// Función para consultar todas las citas de la BD
async function consultaCitas() {
  try {
    const SQLquery = {
      text: `SELECT ci.idcita, ci.fecha, ci.hora, cl.rut, cl.nombre, cl.celular, cl.email, ci.estado FROM citas as ci JOIN clientes as cl ON idrut = cl.rut ORDER BY ci.fecha ASC, ci.hora ASC`,
    }
    const resultadoCitas = await pool.query(SQLquery);
    return resultadoCitas.rows;
  } catch (error) {
    console.log(`Error en query consulta citas:\n${error}`);
    return error.code;
  }
}

// Función para consultar semáforos generado por un cliente
async function consultaSemaforos(idrut) {
  try {
    const SQLquery = {
      text: `SELECT * FROM indicadores WHERE idrut = $1 ORDER BY fechahora DESC;`,
      values: [idrut]
    }

    const resultadoSemaforos = await pool.query(SQLquery);

    return resultadoSemaforos.rows;

  } catch (error) {
    console.log(`Error en query consulta semáforo:\n${error}`);
    return error.code;
  }
}

// Función para consultar una cita de la BD
async function consultaCita(idcita) {
  try {
    const SQLquery = {
      text: `SELECT * FROM citas WHERE idcita=$1`,
      values: [idcita]
    }
    const resultadoCita = await pool.query(SQLquery);
    return resultadoCita.rows;
  } catch (error) {
    console.log(`Error en query consultar una cita:\n${error}`);
    return error.code;
  }
}

// Función para actualizar una cita en la BD
async function actualizarCita(cita) {
  try {
    const SQLquery = {
      text: `
      UPDATE citas
      SET estado=$1, idrutasesor=$2, comentarioasesor=$3
      WHERE idcita=$4
      RETURNING *;`,
      values: [cita.estado, cita.rutAsesor, cita.comentarioAsesor, cita.idCita]
    }
    const resultadoCita = await pool.query(SQLquery);
    return resultadoCita.rows;
  } catch (error) {
    console.log(`Error en query actualizar cita:\n${error}`);
    return error;
  }
}

// Función para consultar todas las citas de la BD de un rut
async function consultaCitasRut(idrut) {
  try {
    const SQLquery = {
      text: `SELECT * FROM citas WHERE idrut=$1  ORDER BY fecha DESC, hora DESC`,
      values: [idrut]
    }
    const resultadoCitas = await pool.query(SQLquery);
    return resultadoCitas.rows;
  } catch (error) {
    console.log(`Error en query consulta citas de un rut:\n${error}`);
    return error.code;
  }
}

// Función para que el cliente pueda eliminar su cuenta
async function eliminarCliente(rut) {
  try {
    const SQLquery = {
      text: `
      UPDATE clientes
      SET estado=$1
      WHERE rut=$2
      RETURNING *;`,
      values: [false, rut]
    }
    const resultadoEliminar = await pool.query(SQLquery);
    return resultadoEliminar.rows;
  } catch (error) {
    console.log(`Error en query eliminar cuenta de un rut:\n${error}`);
    return error.code;
  }
}

// Exportando funciones
module.exports = { nuevoCliente, consultaCliente, nuevoSemaforo, actualizarCliente, consultaSemaforo, nuevaCita, consultaAsesor, consultaCitas, consultaSemaforos, consultaCita, actualizarCita, consultaCitasRut, eliminarCliente }