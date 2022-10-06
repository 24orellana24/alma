//const { validarDigito } = require("/my_modules/rut.js");

const rutIngresado = document.getElementById("rut");
const alertasRegistro = document.getElementById("alertas-registro");
rutIngresado.addEventListener("blur", () => {
  //console.log(`Prueba... ${validarDigito(rutIngresado.value)}`);
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
    
    console.log(`Ingresado: ${digitoVerificador}, ${isNaN(digitoVerificador)} | Calculado: ${digitoCalculado}, ${isNaN(digitoCalculado)}`);

    if (digitoVerificador == digitoCalculado) {      
      rutIngresado.value = `${rutValor.slice(0, -1)}-${digitoCalculado}`;
      alertasRegistro.style.display = "none";
    } else {
      alertasRegistro.style.display = "";
      alertasRegistro.innerHTML = "Formato rut erroneo: el rut debe ser sin puntos, con guión y dígito verificador. Si el dígito verificador es K, debe ser ingresado con MAYÚSCULA. Ej: 12345678-K";
      rutIngresado.focus();
    }

  } else {
    alertasRegistro.style.display = "";
    alertasRegistro.innerHTML = "Formato rut erroneo: el rut debe ser sin puntos, con guión y dígito verificador. Si el dígito verificador es K, debe ser ingresado con MAYÚSCULA. Ej: 12345678-K";
    rutIngresado.focus();
  }
});