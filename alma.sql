\! echo ""
\! echo ""
\! echo "*************************************************************"
\! echo "** ALMA... iniciando creación de base de datos y tablas    **"
\! echo "*************************************************************"
\! echo ""
\! echo ""

CREATE DATABASE alma;

CREATE TABLE clientes (
  id SERIAL,
  rut VARCHAR(12) NOT NULL UNIQUE,
  nombre VARCHAR(25) NOT NULL,
  apellidoPaterno VARCHAR(25),
  apellidoMaterno VARCHAR(25),
  fechaNacimiento DATE,
  email VARCHAR(50) NOT NULL,
  celular NUMERIC(9, 0) NOT NULL,
  comuna VARCHAR(50),
  estado BOOLEAN NOT NULL,
  foto VARCHAR(100),
  password VARCHAR(15) NOT NULL,

  PRIMARY KEY (rut)
);

CREATE TABLE asesores (
  id SERIAL,
  rut VARCHAR(12) NOT NULL UNIQUE,
  nombre VARCHAR(25) NOT NULL,
  apellidoPaterno VARCHAR(25) NOT NULL,
  apellidoMaterno VARCHAR(25) NOT NULL,
  email VARCHAR(50) NOT NULL,
  celular NUMERIC(9, 0) NOT NULL,
  foto VARCHAR(100),
  estado BOOLEAN NOT NULL,
  password VARCHAR(15) NOT NULL,

  PRIMARY KEY (rut)
);

CREATE TABLE indicadores (
  id SERIAL,
  ingreso INT NOT NULL,
  cuota INT NOT NULL,
  deuda INT NOT NULL,
  activo INT NOT NULL,
  carga DECIMAL (12, 4) NOT NULL,
  leverage DECIMAL (12, 4) NOT NULL,
  patrimonio INT NOT NULL,
  fechaHora DATE NOT NULL,
  semaforo INT NOT NULL,
  idRut VARCHAR(12) NOT NULL,

  FOREIGN KEY (idRut) REFERENCES clientes (rut)
);

CREATE TABLE citas (
  idCita SERIAL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  comentario VARCHAR(500) NOT NULL,
  estado BOOLEAN NOT NULL,
  idRut VARCHAR(12) NOT NULL,
  idRutAsesor VARCHAR(25),
  comentarioAsesor VARCHAR(500),

  FOREIGN KEY (idRut) REFERENCES clientes (rut),
  FOREIGN KEY (idRutAsesor) REFERENCES asesores (rut)
);

\! echo ""
\! echo ""
\! echo "***************************************************************"
\! echo "** ALMA... finalizando creación de base de datos y tablas    **"
\! echo "***************************************************************"
\! echo ""
\! echo ""
