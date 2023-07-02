window.addEventListener('load', function() {
  const calcularTiempoBtn = document.getElementById('calcular-tiempo-btn');
  const calcularImpuestosBtn = document.getElementById('calcular-impuestos-btn');

  // Cargar ciudades y valores desde el archivo JSON utilizando fetch
  if (!localStorage.getItem('ciudadesPorContinente')) {
    fetch('ciudades.json')
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        localStorage.setItem('ciudadesPorContinente', JSON.stringify(data));
      })
      .catch(function(error) {
        console.log('Error al cargar el archivo JSON:', error);
      });
  }

  calcularTiempoBtn.addEventListener('click', async function() {
    const tipoEnvio = document.getElementById('tipo-envio').value;
    const puntoPartida = document.getElementById('punto-partida').value;
    const destinoPais = document.getElementById('destino-pais').value;
    const clasificacion = document.getElementById('clasificacion').value;
    const tipoTejido = document.getElementById('tipo-tejido').value;

    try {
      const diasEnvio = await calcularDiasEnvio(puntoPartida, destinoPais);
      const tiempoAdicional = calcularTiempoAdicional(tipoTejido);
      const diasTotales = diasEnvio + tiempoAdicional.tiempoAdicional; 
      const resultadoElement = document.getElementById('resultadoTiempo');
      resultadoElement.innerHTML = `
        Días de envío: ${diasEnvio} <br>
        Tiempo adicional por tela y tipo de tejido: ${tiempoAdicional.mensaje} <br>
        Total de días estimados: ${diasTotales}
      `;
      const cantidadProductosElement = document.getElementById('cantidad-productos');
      const cantidadProductos = parseInt(cantidadProductosElement.value);
      const resultadoCantidadProductosElement = document.getElementById('resultadoCantidadProductos');
    } catch (error) {
      console.error(error);
    }
  });

  calcularImpuestosBtn.addEventListener('click', function() {
    const tipoEnvio = document.getElementById('tipo-envio').value;
    const destinoPais = document.getElementById('destino-pais').value;
    const cantidadProductos = parseInt(document.getElementById('cantidad-productos').value);
    const pesoTotal = parseInt(document.getElementById('peso-total').value);
    const valorDeclarado = parseInt(document.getElementById('valor-declarado').value);

    const valorFinalEnvio = calcularValorFinalEnvio(tipoEnvio, destinoPais, cantidadProductos, pesoTotal, valorDeclarado);    
    const resultadoElement = document.getElementById('resultadoImpuestos');
      resultadoElement.innerHTML =`
    Valor por exceso de peso: ${calcularCostoExtraPeso(pesoTotal)} <br>
    IVA: $${valorFinalEnvio * 0.21} <br>
    El valor final del envío es: $${valorFinalEnvio.toFixed(2)}
    `;
  });


  async function calcularDiasEnvio(puntoPartida, destinoPais) {
    let diasEnvio = 0;
  
    if (puntoPartida === 'Argentina' && destinoPais === 'Argentina') {
      diasEnvio = 3;
    } else if (destinoPais === 'america') {
      diasEnvio = 5;
    } else if (destinoPais === 'europa') {
      diasEnvio = 8;
    } else if (destinoPais === 'asia') {
      diasEnvio = 12;
    }
  
    return diasEnvio;
  }


  // Función para calcular el tiempo adicional por tipo de tejido
  function calcularTiempoAdicional(tipoTejido) {
    let tiempoAdicional = 0;
    let mensaje = '';
  
    if (tipoTejido === 'punto') {
      tiempoAdicional = 4;
      mensaje = '4 por tejido de punto.';
    } else if (tipoTejido === 'plano') {
      tiempoAdicional = 1;
      mensaje = '1 por tejido plano.';
    } else {
      tiempoAdicional = 0;
      mensaje = 'No se requiere.';
    }
  
    return { tiempoAdicional, mensaje };
  }

  


  function calcularValorFinalEnvio(tipoEnvio, destinoPais, cantidadProductos, pesoTotal, valorDeclarado) {
    const ciudadesPorContinente = JSON.parse(localStorage.getItem('ciudadesPorContinente'));
    const tarifasEnvioNacional = {
      hasta70Productos: 4000,
      hasta100Productos: 5500
    };
    const tarifasEnvioInternacional = {
      america: {
        hasta70Productos: 16000,
        hasta100Productos: 21000
      },
      europa: {
        hasta70Productos: 19000,
        hasta100Productos: 27000
      },
      asia: {
        hasta70Productos: 24000,
        hasta100Productos: 31000
      }
    };
  
    let valorEnvio = 0;
  
    if (tipoEnvio === 'nacional') {
      if (cantidadProductos <= 70) {
        valorEnvio = tarifasEnvioNacional.hasta70Productos;
      } else if (cantidadProductos <= 100) {
        valorEnvio = tarifasEnvioNacional.hasta100Productos;
      } else {
        // Mostrar alerta en caso de superar el límite de unidades
        alert('La cantidad de productos supera el límite permitido de 100 unidades para envío nacional.');
      }
    } else if (tipoEnvio === 'internacional') {
      if (destinoPais === 'america') {
        if (cantidadProductos <= 70) {
          valorEnvio = tarifasEnvioInternacional.america.hasta70Productos;
        } else if (cantidadProductos <= 100) {
          valorEnvio = tarifasEnvioInternacional.america.hasta100Productos;
        } else {
          // Mostrar alerta en caso de superar el límite de unidades
          alert('La cantidad de productos supera el límite permitido de 100 unidades para envío internacional a América.');
        }
      } else if (destinoPais === 'europa') {
        if (cantidadProductos <= 70) {
          valorEnvio = tarifasEnvioInternacional.europa.hasta70Productos;
        } else if (cantidadProductos <= 100) {
          valorEnvio = tarifasEnvioInternacional.europa.hasta100Productos;
        } else {
          // Mostrar alerta en caso de superar el límite de unidades
          alert('La cantidad de productos supera el límite permitido de 100 unidades para envío internacional a Europa.');
        }
      } else if (destinoPais === 'asia') {
        if (cantidadProductos <= 70) {
          valorEnvio = tarifasEnvioInternacional.asia.hasta70Productos;
        } else if (cantidadProductos <= 100) {
          valorEnvio = tarifasEnvioInternacional.asia.hasta100Productos;
        } else {
          // Mostrar alerta en caso de superar el límite de unidades
          alert('La cantidad de productos supera el límite permitido de 100 unidades para envío internacional a Asia.');
        }
      }
    }
  
    const costoExtraPeso = calcularCostoExtraPeso(pesoTotal);
    const costoTotal = valorEnvio + costoExtraPeso;
    const iva = calcularIva(costoTotal);

    return costoTotal + iva;
  }
  
  function calcularIva(costoTotal) {
    const iva = costoTotal * 0.21;
    return iva;
  }
  
  
  
  function calcularCostoExtraPeso(pesoTotal) {
    const pesoLimite = 5000;
    const costoExtraPorCada300gr = 100;
  
    if (pesoTotal > pesoLimite) {
      const pesoExtra = pesoTotal - pesoLimite;
      const costoExtra = Math.ceil(pesoExtra / 300) * costoExtraPorCada300gr;
      return costoExtra;
    } else {
      return 0;
    }
  }



});

//revisar la cuenta de los retrasos, agregar el ingreso de informacion personal y darle estiilos a la pagina
