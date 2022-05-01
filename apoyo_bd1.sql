CREATE DATABASE alma;

CREATE TABLE clientes (
  id SERIAL,
  rut VARCHAR(12) NOT NULL UNIQUE,
  nombre VARCHAR(25) NOT NULL,
  apellido_paterno VARCHAR(25) NOT NULL,
  apellido_materno VARCHAR(25) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  email VARCHAR(50),
  celular INT(9) NOT NULL,
  comuna VARCHAR(50),
  estado BOOLEAN NOT NULL,
  foto VARCHAR(50) NOT NULL,
  password VARCHAR(15) NOT NULL,

  PRIMARY KEY (rut)
);