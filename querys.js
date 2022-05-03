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
    const datosCliente = await pool.query(SQLquery);
    return datosCliente.rows[0];
  } catch (error) {
    console.log(`Error en query consulta cliente:\n${error}`);
    return error.code;
  }
}

// Exportando funciones
module.exports = { nuevoCliente, consultaCliente }