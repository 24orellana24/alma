function validarDigito(rut) {
  let rut = rut.replace(/[\.|\-]/g, '');
  let rutCuerpo = (rut.slice(0, rut.length - 1)).split("");
  let rutDigito = rut.slice(-1);
  if (rutDigito === "k") rutDigito = "K";
  let serie = 2; // serie que va de 2 a 7
  let largo = rutCuerpo.length - 1;
  let sumaRut = 0;
  rut.forEach(elemento => {
    sumaRut = sumaRut + (rutCuerpo[largo] * serie);
    largo = largo - 1;
    serie = serie + 1;
    if (serie > 7) serie = 2; 
  });

  let digitoCalculado = 11 - (sumaRut - ((~~(sumaRut/11)) * 11));

  if (digitoCalculado === 11) digitoCalculado = 0; 
  if (digitoCalculado === 10) digitoCalculado = "K";
  
  //console.log(`Ingresado: ${rutDigito}, ${isNaN(rutDigito)} | Calculado: ${digitoCalculado}, ${isNaN(digitoCalculado)}`);

  if (rutDigito == digitoCalculado) {      
    return true;
  } else {
    return false;
  }
}

module.exports = { validarDigito }