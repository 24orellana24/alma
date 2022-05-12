const moment = require("moment");

// Configuración dependencia postgre_sql
const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgres",
  database: "alma",
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
      SET nombre=$1, apellidopaterno=$2, apellidomaterno=$3, fechanacimiento=$4, email=$5, celular=$6, comuna=$7, foto=$8, password=$9 WHERE rut=$10 RETURNING *;`,
      values: [cliente.nombre, cliente.apellido_paterno, cliente.apellido_materno, cliente.fecha_nacimiento, cliente.email, cliente.celular, cliente.comuna, cliente.nombre_foto, cliente.password, cliente.rut]
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

// Exportando funciones
module.exports = { nuevoCliente, consultaCliente, nuevoSemaforo, actualizarCliente, consultaSemaforo }