let tablaIngresos = [];

// Script para validar rut
const rutIngresado = document.getElementById("rut");
const alertasRegistro = document.getElementById("alerta-registro-rut");
rutIngresado.addEventListener("blur", () => {
  let rutValor = rutIngresado.value;
  if ( (/^[0-9]{7,8}[-|‐]{1}[0-9kK]{1}$/.test(rutValor)) || (/^\d{1,2}\.\d{3}\.\d{3}[-|‐][0-9kK]{1}$/.test(rutValor)) || (/^[0-9]{7,8}[0-9kK]{1}$/.test(rutValor)) ) {
    rutValor = rutValor.replace(/[\.|\-]/g, '');
    let rut = (rutValor.slice(0, rutValor.length - 1)).split("");
    let digitoVerificador = rutValor.slice(-1);
    if (digitoVerificador === "k") digitoVerificador = "K";
    let serie = 2; // serie que va de 2 a 7
    let largo = rut.length - 1;
    let sumaRut = 0;
    rut.forEach(elemento => {
      sumaRut = sumaRut + (rut[largo] * serie);
      largo = largo - 1;
      serie = serie + 1;
      if (serie > 7) serie = 2; 
    });

    let digitoCalculado = 11 - (sumaRut - ((~~(sumaRut/11)) * 11));

    if (digitoCalculado === 11) digitoCalculado = 0; 
    if (digitoCalculado === 10) digitoCalculado = "K";

    if (digitoVerificador == digitoCalculado) {      
      rutIngresado.value = `${rutValor.slice(0, -1)}-${digitoCalculado}`;
      alertasRegistro.style.display = "none";
    } else {
      alertasRegistro.style.display = "";
      rutIngresado.focus();
    }

  } else {
    alertasRegistro.style.display = "";
    rutIngresado.focus();
  }
});

// Script para calcular ratios financieros
function calcularRatios() {
  let ingreso = document.getElementById("ingreso").value;
  let cuota = document.getElementById("cuota").value;
  let deuda = document.getElementById("deuda").value;
  let activo = document.getElementById("activo").value;
  let carga = 0;
  let leverage = 0;
  let patrimonio = 0;
  let evaluacion = 0;
  let color = ""
  let texto = ""

  if (ingreso > 0) {
    document.getElementById("alerta-datosFinancieros-ingreso").style.display = "none";
    carga = ((cuota / ingreso) * 100).toFixed(2);
    leverage = (deuda / ingreso).toFixed(2);
    patrimonio = activo - deuda;
    if (carga <= (25)) {
      evaluacion = 1;
      color = "success"
      texto = "(Riesgo: BAJO)"
    } else if (carga <= (50)) {
      evaluacion = 0;
      color = "warning"
      texto = "(Riesgo: MEDIO)"
    } else {
      evaluacion = -1;
      color = "danger"
      texto = "(Riesgo: ALTO)"
    };
    document.getElementById("carga").value = carga;
    document.getElementById("leverage").value = leverage;
    document.getElementById("patrimonio").value = patrimonio;
    document.getElementById("fecha_hora").value = moment(Date.now()).format("DD/MM/YYYY HH:mm:ss");
    document.getElementById("tituloSemaforo").className = `card-title my-2 bg-${color} bg-opacity-50`;
    document.getElementById("notaRiesgo").innerText = `${texto}`;
  } else {
    document.getElementById("alerta-datosFinancieros-ingreso").style.display = "";
    document.getElementById("ingreso").focus();
  };
};

// Script para limpiar ratios financieros
function limpiarRatios() {
  document.getElementById("ingreso").value = "";
  document.getElementById("cuota").value = "";
  document.getElementById("deuda").value = "";
  document.getElementById("activo").value = "";
  document.getElementById("carga").value = "";
  document.getElementById("leverage").value = "";
  document.getElementById("patrimonio").value = "";
  document.getElementById("fecha_hora").value = "";
  document.getElementById("tituloSemaforo").className = `card-title my-2`;
  document.getElementById("notaRiesgo").innerText = "";
  document.getElementById("alerta-datosFinancieros-ingreso").style.display = "none";
};

// Script para generar informe de riesgo
function informeRiesgo() {
  let ingreso = document.getElementById("ingreso").value;
  let deuda = document.getElementById("deuda").value;
  let activo = document.getElementById("activo").value;
  let carga = document.getElementById("carga").value;
  let leverage = document.getElementById("leverage").value;
  let patrimonio = document.getElementById("patrimonio").value;
  let evaluacionCarga = "";
  let evaluacionLeverage = "";
  let evaluacionPatrimonio = "";

  if (ingreso > 0 && carga != "") {

    if (carga <= (25)) {
      evaluacionCarga = "BAJA"
    } else if (carga <= (50)) {
      evaluacionCarga = "MEDIA"
    } else {
      evaluacionCarga = "ALTA"
    };
  
    if (leverage <= (10)) {
      evaluacionLeverage = "BAJO"
    } else if (carga <= (15)) {
      evaluacionLeverage = "MEDIO"
    } else {
      evaluacionLeverage = "ALTO"
    };
  
    if (patrimonio <= (0)) {
      evaluacionPatrimonio = "NULO"
    } else if (carga <= (ingreso * 1,25)) {
      evaluacionPatrimonio = "BAJO"
    } else if (carga <= (ingreso * 1,50)) {
      evaluacionPatrimonio = "MEDIO"
    } else {
      evaluacionPatrimonio = "ALTO"
    };

    document.getElementById("sinIndicadores").style.display = "none";
  
    document.getElementById("infoCarga").innerHTML = `Corresponde al porcentaje de tus ingresos que destinas al pago de deudas financieras. Para tu nivel de ingresos de <b>$${ingreso}</b>, tu carga financiera es <b>${evaluacionCarga}</b>, ya que un <b>${carga}%</b>, de tus ingresos está siendo destinado al pago de deudas.`;
  
    document.getElementById("infoLeverage").innerHTML = `Corresponde a cuantas veces tus ingresos se encuentran comprometidos en relación a tu deuda (se mide en veces renta = vr). Para tu nivel de deuda de <b>$${deuda}</b>, tu nivel de endeudamiento es <b>${evaluacionLeverage}</b>, ya que para pagar el total de tu deuda, necesitas disponer de <b>${leverage} meses de ingresos</b>.`;
  
    document.getElementById("infoPatrimonio").innerHTML = `Corresponde a la diferencia entre tu nivel de activos versus tus pasivos, a mayor nivel patrimonial, mejor es tu posición para enfretar tu nivel de endudamiento. Para tu nivel de activos de <b>$${activo}</b>, tu nivel patrimonial es <b>${evaluacionPatrimonio}</b>, ya que si liquidas todos tus activos te queda un saldo de <b>$${patrimonio}</b>.`;

  } else {

    document.getElementById("sinIndicadores").style.display = "";

    document.getElementById("sinIndicadores").innerHTML = "No hay indicadores para generar informe. Revise sección DATOS FINANCIEROS y presione el botón CALCULAR para que se generen los indicadores. Gracias!"

    document.getElementById("infoCarga").innerHTML = "";

    document.getElementById("infoLeverage").innerHTML = "";

    document.getElementById("infoPatrimonio").innerHTML = "";

  };

}

// Sumar ingresos
function sumarIngreso() {
  let tipoIngreso = document.getElementById("tipoIngreso");
  let montoIngreso = document.getElementById("montoIngreso");
  let comentarioIngreso = document.getElementById("comentarioIngreso");
  let alertaPresupuestoIngreso = document.getElementById("alerta-presupuesto-ingresos");
  let btnAlertaPresupuestoIngreso = document.getElementById("btn-alerta-presupuesto-ingresos");
  if (tipoIngreso.value != "" && montoIngreso.value > 0) {
    document.getElementById("tablaIngresos").style.display = "";
    tablaIngresos.push({
      tipoIngreso: tipoIngreso.value,
      montoIngreso: Number(montoIngreso.value),
      comentarioIngreso: comentarioIngreso.value,
    });
    tipoIngreso.value = "";
    montoIngreso.value = "";
    comentarioIngreso.value = "";

    constructorTablaIngresos(tablaIngresos);

    escuchandoBotonesEliminarIngreso();
    
    ocultarAlertaPresupuestoIngreso(alertaPresupuestoIngreso);
  
  } else {
    alertaPresupuestoIngreso.style.display = "";
    btnAlertaPresupuestoIngreso.focus();
  };
};

function constructorTablaIngresos(tablaIngresos) {
  document.getElementById("filasIngresos").innerHTML = ""
  let indice = 0;
  let sumaIngresos = 0;
  let totalIngresos = document.getElementById("totalIngresos");
  tablaIngresos.forEach(element => {
    indice = indice + 1;
    sumaIngresos = sumaIngresos + element.montoIngreso;      
    document.getElementById("filasIngresos").innerHTML += `
    <tr>
      <th scope="row">${indice}</th>
      <td>${element.tipoIngreso}</td>
      <td>${element.montoIngreso}</td>
      <td>${element.comentarioIngreso}</td>
      <td><button id="btn-ing-${indice}" type="button" class="btn-Restar-Ingreso text-danger bg-transparent border-0 rounded-circle" title="eliminar"><i class="bi bi-dash-circle-fill"></i></button></td>
    </tr>
    `
  });
  totalIngresos.value = sumaIngresos;
  if (tablaIngresos.length <= 0) document.getElementById("tablaIngresos").style.display = "none";
};

function escuchandoBotonesEliminarIngreso() {
  let botonesRestarIngreso = document.querySelectorAll(".btn-Restar-Ingreso");

  const clickRestarIngreso = function () {
    const indiceEliminar = this.id.split("-");
    tablaIngresos.splice(indiceEliminar[2] - 1, 1);
    constructorTablaIngresos(tablaIngresos);
    escuchandoBotonesEliminarIngreso();
  };

  botonesRestarIngreso.forEach(boton => {
    boton.addEventListener("click", clickRestarIngreso);
  });
};

function ocultarAlertaPresupuestoIngreso() {
  document.getElementById("alerta-presupuesto-ingresos").style.display = "none";
};