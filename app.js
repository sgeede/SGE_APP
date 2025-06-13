const RUTACONSULTAS = "./assets/db/peticiones/"; 

window.addEventListener("load", function(event) {
  var URLactual = window.location.pathname;
  URLactual = URLactual.replace("/", "")

  titulo = URLactual.charAt(0).toUpperCase() + URLactual.slice(1);
  if(URLactual == "solicitudes"){
    listarSolicitudes();
  }
  if(URLactual == "contratistas"){
    listarContratistasVista();
  }


  // let tiempoInactividad = 5000; // Tiempo en milisegundos (ejemplo: 3000 ms = 3 segundos)
  // let temporizador;

  // function reiniciarTemporizador() {
  //     clearTimeout(temporizador);
  //     temporizador = setTimeout(funcionInactiva, tiempoInactividad);
  // }

  // function funcionInactiva() {
  //     // Tu lógica aquí­, lo que quieres hacer después del tiempo de inactividad
  //     console.log("Usuario inactivo por " + tiempoInactividad + " ms");
  // }

  // // Configurar eventos para reiniciar el temporizador
  // document.addEventListener("keypress", reiniciarTemporizador);
  // document.addEventListener("click", reiniciarTemporizador);
  // window.addEventListener("scroll", reiniciarTemporizador);

  // // Iniciar el temporizador
  // reiniciarTemporizador();
  

});

function alertas(mensaje, tipoMensaje, autoclose = true){
  new Notify ({
      status: tipoMensaje,
      title: mensaje,
      text: '',
      effect: 'slide',
      speed: 300,
      customClass: '',
      customIcon: '',
      showIcon: true,
      showCloseButton: true,
      autoclose: autoclose,
      autotimeout: 4000,
      gap: 20,
      distance: 20,
      type: 3,
      position: "bottom right",
      customWrapper: '',
  })
  return;
}

function inputSoloNumero(input){
  let inputValue = input.value;
  inputValue = inputValue.replace(/[^0-9.]/g, '');
  input.value = inputValue;
}

function consulta(consulta){
  $.ajax({
    url: RUTACONSULTAS + 'sql' + '.php',
    method: 'POST',
    data: {sql:consulta},
    success: function(data) {
      console.log(data)
    },
    error: function(xhr, status, error) {
      console.log(error)
    }
  });
};




function consultaruta(rut){
  $.ajax({
    url: RUTACONSULTAS + 'ficheros' + '.php',
    method: 'POST',
    data: {ru:rut},
    success: function(data) {
      console.log(data)
    },
    error: function(xhr, status, error) {
      console.log(error)
    }
  });
};



function validarFormularios(event){
  event.preventDefault()

  const formulario = event.target;
  const elementos = formulario.getElementsByTagName("input");

  for (let i = 0; i < elementos.length; i++) {
    if (elementos[i].required) {
      if (elementos[i].type === "checkbox" || elementos[i].type === "radio") {
        if (!elementos[i].checked) {
          console.log("Â¡Formulario con datos requeridos no seleccionados!");
          alertas("Â¡Formulario con datos requeridos no seleccionados!", "error");
          return false;
        }
      } else if (elementos[i].value.length === 0) {
        console.log("Â¡Formulario con datos requeridos vací­os!");
        alertas("Â¡Formulario con datos requeridos vací­os!", "error");
        return false;
      }
    }
  }
  return true;
}

function realizarSolicitudPOST(url, datos) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: url,
      method: "POST",
      data: datos,
      dataType: "json",
      success: function(data) {
        resolve(data);
      },
      error: function(xhr, status, error) {
        reject({ status: status, error: error });
      }
    });
  });
}

$(document).ready(function() {
    $('.select-search-single').select2({
        language: "es"
      });
});

const opcionesDecimales = {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
};

$(".cal-csmo").change(function(){
  let consumos = document.querySelectorAll(".cal-csmo");
  total = 0;
  cont = 0;
  consumos.forEach(consumo => {
      if(consumo.value > 0){
          total += parseFloat(consumo.value);
          cont++;
      }
  });
  if(cont > 0){
    promedio = total/cont
    document.getElementById("promCsmo").value = promedio.toLocaleString("es-DO", opcionesDecimales);
  }else{
    document.getElementById("promCsmo").value = "";
  }

  generarDescripcion();
});


async function cargarModelosModulosFotovoltaicos(ID_MARCA) {
  try {
    const data = await realizarSolicitudPOST(RUTACONSULTAS + 'cargarModelosModulosFotovoltaicos' + '.php', { ID_MARCA: ID_MARCA });
    return data;
  } catch (error) {
    console.error('Error de solicitud:', error);
    return null;
  }
}

$(".cantPaneles").change(function(){
  let marcaPaneles = document.querySelectorAll(".marcaPaneles");
  let cantPaneles = document.querySelectorAll(".cantPaneles");
  let modeloPaneles = document.querySelectorAll(".modeloPaneles");
  cantPaneles.forEach(async (element, index) => {
    if((element.value == "" || element.value == 0) && marcaPaneles[index].value != ""){
      modeloPaneles[index].innerHTML = '<option value="">--Modelo</option>';
    }
  })
})

async function cargarModelosPaneles(event){
  let marcaEditada = event.target.id;
  let id = marcaEditada[marcaEditada.length - 1];

  document.getElementById("modeloPaneles"+id).innerHTML = '<option value="">--Modelo</option>';

  let marcaPaneles = document.querySelectorAll(".marcaPaneles")
  let cantPaneles = document.querySelectorAll(".cantPaneles")
  let modeloPaneles = document.querySelectorAll(".modeloPaneles")
  marcaPaneles.forEach(async (element, index) => {
    if(element.value == "" && modeloPaneles[index].value != ""){
      modeloPaneles[index].innerHTML = '<option value="">--Modelo</option>';
    }else if(cantPaneles[index].value == ""){
      element.value = "";
    }else if((cantPaneles[index].value > 0 && element.value != "" && modeloPaneles[index].value == "")){
        modeloPaneles[index].innerHTML = '<option value="">--Modelo</option>';
        datosOpciones = await cargarModelosModulosFotovoltaicos(element.value);

        datosOpciones.forEach(opcion => {
          const nuevaOpcion = document.createElement("option");
          nuevaOpcion.value = opcion.ID_MODELO;
          nuevaOpcion.text = opcion.DESC_MODELO;
          modeloPaneles[index].add(nuevaOpcion);
        })
    }
  });
}

$(".marcaPaneles").change(cargarModelosPaneles);


// Inversores
async function cargarModelosInversoresPromise(ID_MARCA) {
  try {
    const data = await realizarSolicitudPOST(RUTACONSULTAS + 'cargarModelosInversores' + '.php', { ID_MARCA: ID_MARCA });
    return data;
  } catch (error) {
    console.error('Error de solicitud:', error);
    return null;
  }
}

$(".cantInversores").change(function(){
  let marcaInversores = document.querySelectorAll(".marcaInversores");
  let cantInversores = document.querySelectorAll(".cantInversores");
  let modeloInversores = document.querySelectorAll(".modeloInversores");
  cantInversores.forEach(async (element, index) => {
    if((element.value == "" || element.value == 0) && marcaInversores[index].value != ""){
      modeloInversores[index].innerHTML = '<option value="">--Modelo</option>';
    }
  })
})

async function cargarModelosInversores(event){
  let marcaEditada = event.target.id;
  let id = marcaEditada[marcaEditada.length - 1];

  document.getElementById("modeloInversores"+id).innerHTML = '<option value="">--Modelo</option>';

  let marcaInversores = document.querySelectorAll(".marcaInversores");
  let cantInversores = document.querySelectorAll(".cantInversores");
  let modeloInversores = document.querySelectorAll(".modeloInversores");
  marcaInversores.forEach(async (element, index) => {
    // TENER EN CUENTA CAMBIOS DE MARCA
    // modeloInversores[index].innerHTML = '<option value="">--Modelo</option>';
    if(element.value == "" && modeloInversores[index].value != ""){
      modeloInversores[index].innerHTML = '<option value="">--Modelo</option>';
    }else if(cantInversores[index].value == ""){
      element.value = "";
    }else if((cantInversores[index].value > 0 && element.value != "" && modeloInversores[index].value == "")){
      modeloInversores[index].innerHTML = '<option value="">--Modelo</option>';
        datosOpciones = await cargarModelosInversoresPromise(element.value);

        datosOpciones.forEach(opcion => {
          const nuevaOpcion = document.createElement("option");
          nuevaOpcion.value = opcion.ID_MODELO;
          nuevaOpcion.text = opcion.DESC_MODELO;
          modeloInversores[index].add(nuevaOpcion);
        })
    }
  });
}

$(".marcaInversores").change(cargarModelosInversores);

function calcularCapacidadInversores(){
  let potInversores = document.querySelectorAll(".potInversores");
  let cantInversores = document.querySelectorAll(".cantInversores");
  let sumaKwn = new Array();

  potInversores.forEach((element, index) => {
    if((element.value > 0 && element.value != "") && cantInversores[index].value != ""){
      sumaKwn[index] = element.value * cantInversores[index].value;
    }
    
  });
  const sumaKwnTotal = sumaKwn.reduce((acumulador, valor) => acumulador + valor, 0);
  document.getElementById("capacidadInversores").value = sumaKwnTotal.toLocaleString("es-DO", opcionesDecimales);

  generarDescripcion();
}

$(".potInversores").change(calcularCapacidadInversores);
$(".cantInversores").change(calcularCapacidadInversores);

function calcularGeneracionPaneles(){
  let potPaneles = document.querySelectorAll(".potPaneles");
  let cantPaneles = document.querySelectorAll(".cantPaneles");
  let valorRadiacion = document.getElementById("valorRadiacion").value;
  let sumaGeneracionKwp = new Array();
  let sumaKwp = new Array();

  if(valorRadiacion == ""){
    alertas("Debe de ingresar el contrato", "error");
    return;
  }

  potPaneles.forEach((element, index) => {
    if((element.value > 0 && element.value != "") && cantPaneles[index].value != ""){
      sumaKwp[index] = ((element.value * cantPaneles[index].value) / 1000);
      sumaGeneracionKwp[index] = (((element.value * cantPaneles[index].value) / 1000) * valorRadiacion) * 30;
    }
    
  });
  const sumaKwpTotal = sumaKwp.reduce((acumulador, valor) => acumulador + valor, 0);
  document.getElementById("potSolicitadaPaneles").value = sumaKwpTotal.toLocaleString("es-DO", opcionesDecimales);
  const sumaGeneracionKwpTotal = sumaGeneracionKwp.reduce((acumulador, valor) => acumulador + valor, 0);
  document.getElementById("generacionPaneles").value = sumaGeneracionKwpTotal.toLocaleString("es-DO", opcionesDecimales);

  generarDescripcion();
}

$(".potPaneles").change(calcularGeneracionPaneles);
$(".cantPaneles").change(calcularGeneracionPaneles);
$("#valorRadiacion").change(calcularGeneracionPaneles);

function cargarDatosObservacion(circuito, ct, transf, tipoTransf){
  document.getElementById("datosCopiarObservacion").value = "Circuito: "+circuito+"\n"+"CT: "+ct+"\n"+"Transformador: "+transf+"\n"+tipoTransf;
}

async function consultarNIC(){
  limpiarCampos();
  let NIC = document.getElementById("NIC").value,
    nombreCliente = document.getElementById("nombreCliente"),
    documentoIdentificador = document.getElementById("documentoIdentificador"),
    telefonoCliente = document.getElementById("telefonoCliente"),
    tarifaCliente = document.getElementById("tarifaCliente"),
    direccionSistema = document.getElementById("direccionSistema"),
    sectorCliente = document.getElementById("sectorCliente"),
    municipioCliente = document.getElementById("municipioCliente"),
    conexionTransformador = document.getElementById("conexionTransformador"),
    provinciaCliente = document.getElementById("provinciaCliente"),
    obsCircuito = document.getElementById("obsCircuito"),
    obsCt = document.getElementById("obsCt"),
    obsCtransf = document.getElementById("obsCtransf"),
    obsContransf = document.getElementById("obsContransf");

    if(NIC == "" || NIC.length < 7 || isNaN(NIC)){
      alertas("Verifique el NIC ingresado", "error");
      return;
    }

  $.ajax({
    url: RUTACONSULTAS + 'consultarNIC' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {NIC:NIC},
    success: function(data) {
      if (data && Object.keys(data).length > 0) {
        nombreCliente.value = data.nombre;
        tarifaCliente.value = data.tarifa;
        documentoIdentificador.value = data.documento_identificador;
        sectorCliente.value = data.sector;
        municipioCliente.value = data.municipio;
        provinciaCliente.value = data.provincia;
        direccionSistema.value = data.direccion_cliente;
        telefonoCliente.value = data.telefono_cliente;
        conexionTransformador.value = data.tipo_conexion;
        obsCircuito.value = data.circuito;
        obsCt.value = data.centro_transformacion;
        obsCtransf.value = data.potencia;
        obsContransf.value = data.tipo_conexion;

        // cargarDatosObservacion(data.circuito, data.centro_transformacion, data.potencia, data.tipo_conexion);
        generarObservacion();
        consultarRadiacion();

        if(data.tarifa == "Bonoluz"){
          alertas("Cliente con tarifa Bonoluz.", "error",false);
        }
        

        alertas("Se cargaron los datos del cliente.", "success");
      }else{
        
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al cargar los datos. Verifique el NIC.", "error");
    }
  });
};

$("#consultarNIC").click(consultarNIC);
$("#NIC").keydown(function(event) {
  if (event.keyCode === 13) {
    consultarNIC();
  }
});

function obtenerIDTipoSolcitud(){
  var radios = document.getElementsByName("tipoSolicitud");
  var valorSeleccionado = "";
  for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
          valorSeleccionado = radios[i].value;
          break;
      }
  }
  return valorSeleccionado;
}

function obtenerIDTipoDocumento(){
  var radios = document.getElementsByName("tipoDocumento");
  var valorSeleccionado = "";
  for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
          valorSeleccionado = radios[i].value;
          break;
      }
  }
  return valorSeleccionado;
}

function actualizarContratistas(){
  let dContratista = document.getElementById("dContratista");
  let idCTREditar = document.getElementById("idCTREditar");
  let options = "<option value=''>--Contratista</option>";
  $.ajax({
    url: RUTACONSULTAS + 'cargarContratistas' + '.php',
    method: 'POST',
    success: function(data) {
      document.getElementById("rncContratista").value = "";
      if (data && Object.keys(data).length > 0) {
        dContratista.innerHTML = options+data;
        idCTREditar.innerHTML = options+data;
      }else{
        dContratista.innerHTML = options;
        idCTREditar.innerHTML = options;
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al cargar contatistas.", "error");
      console.error('Request failed:', status, error);
    }
  });
}

function limpiarDatosCreacionContratistas(){
  document.getElementById("reNombreContratista").value = "";
  document.getElementById("reRNCContatista").value = "";
  document.getElementById("reTelefonoContratista").value = "";
  document.getElementById("reCorreoContratista").value = "";
  document.getElementById("reCorreoContratista2").value = "";
  document.getElementById("edNombreContratista").value = "";
  document.getElementById("edRNCContatista").value = "";
  document.getElementById("edTelefonoContratista").value = "";
  document.getElementById("edCorreoContratista").value = "";
  document.getElementById("edCorreoContratista2").value = "";
  document.getElementById("idCTREditar").value = "";
}

$("#formReDatosContratista").on("submit", async function(event){
  if(!validarFormularios(event)){return;}
  
  let nombreContratista = document.getElementById("reNombreContratista").value,
    RNC = document.getElementById("reRNCContatista").value,
    telefono = document.getElementById("reTelefonoContratista").value,
    correo = document.getElementById("reCorreoContratista").value,
    correo2 = document.getElementById("reCorreoContratista2").value;

    if(nombreContratista == ""){
      alertas("Ingrese el nombre del contratista.", "error");
      return;
    }else if(RNC == ""){
      alertas("Ingrese el RNC del contratista.", "error");
    }

    let ID_CTR=0;

  $.ajax({
    url: RUTACONSULTAS + 'registrarContratista' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {
      ID_CTR:ID_CTR,
      nombreContratista:nombreContratista,
      RNC:RNC,
      telefono:telefono,
      correo:correo,
      correo2:correo2},
    success: function(data) {
      // console.log(data)
      data = JSON.stringify(data);
      if (data && Object.keys(data).length > 0) {
        limpiarDatosCreacionContratistas();
        alertas("Contratista registrado.", "success");
      }else{
        alertas("Error al registrar el contratista.", "error");
      }
      actualizarContratistas();
    },
    error: function(xhr, status, error) {
      alertas("Error al registrar.", "error");
      console.error('Request failed:', status, error);
    }
  });
});

$("#formEdDatosContratista").on("submit", async function(event){
  if(!validarFormularios(event)){return;}
  
  let nombreContratista = document.getElementById("edNombreContratista").value,
    RNC = document.getElementById("edRNCContatista").value,
    telefono = document.getElementById("edTelefonoContratista").value,
    correo = document.getElementById("edCorreoContratista").value,
    correo2 = document.getElementById("edCorreoContratista2").value,
    idCTREditar = document.getElementById("idCTREditar").value;

    if(nombreContratista == ""){
      alertas("Ingrese el nombre del contratista.", "error");
      return;
    }else if(RNC == ""){
      alertas("Ingrese el RNC del contratista.", "error");
    }

  $.ajax({
    url: RUTACONSULTAS + 'registrarContratista' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {
      ID_CTR:idCTREditar,
      nombreContratista:nombreContratista,
      RNC:RNC,
      telefono:telefono,
      correo:correo,
      correo2:correo2},
    success: function(data) {
      // console.log(data)
      data = JSON.stringify(data);
      if (data && Object.keys(data).length > 0) {
        limpiarDatosCreacionContratistas();
        alertas("Contratista actualizado.", "success");
      }else{
        alertas("Error al actualizar el contratista.", "error");
      }
      actualizarContratistas();
    },
    error: function(xhr, status, error) {
      alertas("Error al actualizar.", "error");
      console.error('Request failed:', status, error);
    }
  });
});

async function consultarDContratista(){
  let ID_CTR = document.getElementById("dContratista").value;

  if(ID_CTR == ""){return;}
 
  $.ajax({
    url: RUTACONSULTAS + 'consultarContratista' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {ID_CTR:ID_CTR},
    success: function(data) {
      if (data && Object.keys(data).length > 0) {
        document.getElementById("rncContratista").value = data[0].RNC;
      }else{
        document.getElementById("rncContratista").value = "";
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al cargar los datos. Verifique el NIC.", "error");
      console.error('Request failed:', status, error);
    }
  });
};

$("#dContratista").change(consultarDContratista);

async function consultarDContratistaEdicion(){
  let ID_CTR = document.getElementById("idCTREditar").value;

  if(ID_CTR == ""){return;}
 
  $.ajax({
    url: RUTACONSULTAS + 'consultarContratista' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {ID_CTR:ID_CTR},
    success: function(data) {
      if (data && Object.keys(data).length > 0) {
        document.getElementById("edNombreContratista").value = data[0].NOMBRE_CTR;
        document.getElementById("edRNCContatista").value = data[0].RNC;
        document.getElementById("edTelefonoContratista").value = data[0].TELEFONO;
        document.getElementById("edCorreoContratista").value = data[0].CORREO;
        document.getElementById("edCorreoContratista2").value = data[0].CORREO2;
      }else{
        document.getElementById("edNombreContratista").value = "";
        document.getElementById("edRNCContatista").value = "";
        document.getElementById("edTelefonoContratista").value = "";
        document.getElementById("edCorreoContratista").value = "";
        document.getElementById("edCorreoContratista2").value = "";
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al cargar los datos. Verifique el NIC.", "error");
      console.error('Request failed:', status, error);
    }
  });
};

async function consultarRadiacion(){
  let sectorCliente = document.getElementById("sectorCliente").value,
    provinciaCliente = document.getElementById("provinciaCliente").value,
    municipioCliente = document.getElementById("municipioCliente").value;
 
  $.ajax({
    url: RUTACONSULTAS + 'consultarRadiacion' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {sectorCliente:sectorCliente,provinciaCliente:provinciaCliente,municipioCliente:municipioCliente},
    success: function(data) {
      if (data && Object.keys(data).length > 0) {
        document.getElementById("valorRadiacion").value = data[0].RADIACION;
        calcularGeneracionPaneles();
      }else{
        document.getElementById("valorRadiacion").value = "";
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al cargar la radiación.", "error");
      console.error('Request failed:', status, error);
    }
  });
};

function copiarDescripcion(elemento){
  let textarea = document.getElementById("datosCopiarDescripcion");
  textarea.select(); 
  if(document.execCommand("copy")){
    texto = elemento.value;
    elemento.value = 'Copiado';
    setTimeout(function(){
      elemento.value = texto;
    },300)
  }
}

function copiarObservacion(elemento){
  let textarea = document.getElementById("datosCopiarObservacion");
  textarea.select(); 
  if(document.execCommand("copy")){
    texto = elemento.value;
    elemento.value = 'Copiado';
    setTimeout(function(){
      elemento.value = texto;
    },300)
  }
}

$("#NIC").change(() => { 
  if(obtenerIDTipoSolcitud() == 2){
    document.getElementById("KWInstaladoInvAntes").value = "";
    document.getElementById("KWInstaladoPanAntes").value = "";
    document.getElementsByName("tipoSolicitud")[0].checked = true;
  }

 });


$("input[name='tipoSolicitud']").on("change", function() {
  generarDescripcion();
  let camposInstalado = document.getElementById("insAntAumento"),
    KWInstaladoInvAntes = document.getElementById("KWInstaladoInvAntes"),
    KWInstaladoPanAntes = document.getElementById("KWInstaladoPanAntes"),
    NIC = document.getElementById("NIC").value;
    KWInstaladoInvAntes.value = "";
    KWInstaladoPanAntes.value = "";
  if(obtenerIDTipoSolcitud() == 2){
    // console.log("Aumento")
    if(NIC == ""){
      document.getElementsByName("tipoSolicitud")[0].checked = true;
      alertas("Debe ingresar el NIC que realizará el aumento.", "error");
      return;
    }

 
  $.ajax({
    url: RUTACONSULTAS + 'consultarCapacidadInst' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {NIC:NIC},
    success: function(data) {
      if (data && Object.keys(data).length > 0) {
        KWInstaladoInvAntes.value = data[0].KW_INV_INST;
        KWInstaladoPanAntes.value = data[0].KWP_INST;

      camposInstalado.classList.remove("d-none")
      camposInstalado.classList.add("d-block")
        
      }else{
        // document.getElementById("valorRadiacion").value = "";
        KWInstaladoInvAntes.value = "";
        KWInstaladoPanAntes.value = "";
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al cargar la capacidad instalada.", "error");
      console.error('Request failed:', status, error);
    }
  });



  }else{
    // console.log("Demas")
    camposInstalado.classList.remove("d-block")
    camposInstalado.classList.add("d-none")
  }
});

function datosTipoSolicitud(dato){
  let opciones = document.getElementsByName("tipoSolicitud");

  let descTipoSolicitud,valorSeleccionado;

  for (let i = 0; i < opciones.length; i++) {
      if (opciones[i].checked) {
          valorSeleccionado = opciones[i].value;
          descTipoSolicitud = opciones[i].getAttribute("data-descripcion");
          break;
      }
  }
  return (dato=="id") ? valorSeleccionado: descTipoSolicitud;
}

function obtenerIDTipoDocumentos(){
  let opciones = document.getElementsByName("tipoDocumento")
  let valorSeleccionado;

  for (let i = 0; i < opciones.length; i++) {
      if (opciones[i].checked) {
          valorSeleccionado = opciones[i].value;
          break;
      }
  }
  return valorSeleccionado;
}

function generarDescripcion(){
  let potSolicitadaPaneles = document.getElementById("potSolicitadaPaneles").value,
    generacionPaneles = document.getElementById("generacionPaneles").value,
    capacidadInversores = document.getElementById("capacidadInversores").value,
    promCsmo = document.getElementById("promCsmo").value;

  let descTipoSolicitud = datosTipoSolicitud("desc");

  if(descTipoSolicitud == undefined){
    descTipoSolicitud = document.getElementById("tipoSolicitud").value
  }

  let descripcion = "Solicitud: "+descTipoSolicitud+"\nPot. solicitada: "+potSolicitadaPaneles+"KWP\nGen. en paneles: "+generacionPaneles+"\nPot. en inversores: "+capacidadInversores+"Kw\nProm. de consumo: "+promCsmo;

  document.getElementById("datosCopiarDescripcion").value = descripcion;
  
  generarObservacion();
}

function generarObservacion(){
  let potSolicitadaPaneles = document.getElementById("potSolicitadaPaneles").value,
    KWInstaladoPanAntes = document.getElementById("KWInstaladoPanAntes").value,
    KWInstaladoInvAntes = document.getElementById("KWInstaladoInvAntes").value,
    capacidadInversores = document.getElementById("capacidadInversores").value,
    obsCircuito = document.getElementById("obsCircuito").value,
    obsCt = document.getElementById("obsCt").value,
    obsCtransf = document.getElementById("obsCtransf").value,
    obsContransf = document.getElementById("obsContransf").value;

  let descripcion = "Circuito: "+obsCircuito+"\n"+"CT: "+obsCt+"\n"+"Transformador: "+obsCtransf+"\n"+obsContransf;;

  if(obtenerIDTipoSolcitud() == 2 || KWInstaladoPanAntes > 0){
    let totalAumentoKWP = parseFloat(KWInstaladoPanAntes) + parseFloat(potSolicitadaPaneles.replace(",",""));
    let totalAumentoKWINVER = parseFloat(KWInstaladoInvAntes) + parseFloat(capacidadInversores.replace(",",""));

    descripcion += "\n\nCon una potencia instalada de "+KWInstaladoPanAntes+ " y aumentará "+potSolicitadaPaneles+" para un total de " + totalAumentoKWP.toLocaleString("es-DO", opcionesDecimales) + ". En inversores instalado " + KWInstaladoInvAntes + " y aumentará " + capacidadInversores + " para un total de "+totalAumentoKWINVER.toLocaleString("es-DO", opcionesDecimales);
  }

  document.getElementById("datosCopiarObservacion").value = descripcion;  
}

function limpiarElemento(identificador){
  elemento = identificador.id.split("-")
  let inputs = [];

  if(elemento[0] == "inv"){
    inputs = ["marcaInversores","modeloInversores", "cantInversores", "potInversores"];
  }else{
    inputs = ["marcaPaneles","modeloPaneles", "cantPaneles", "potPaneles"];
  }

  inputs.forEach(input => {
    if(input == inputs[0] || input == inputs[1]){
      $('#'+input+elemento[1]).val(null).trigger('change');
    }else{
      document.getElementById(input+elemento[1]).value = "";
    }
  });
  calcularCapacidadInversores();
  calcularGeneracionPaneles();
}


function detalleInversores(){
  let inversores = document.getElementById("formInversores").elements;
  let gruposDe4SinElemento5 = [];

  for (let i = 0; i < inversores.length; i += 5) {
    let grupo = [];
    for (let j = 0; j < 4; j++) {
      if (i + j < inversores.length) {
        grupo.push(inversores[i + j].value);
      }
    }
    gruposDe4SinElemento5.push(grupo);
  }
  // console.log(gruposDe4SinElemento5);
  return gruposDe4SinElemento5;
}

function detallePaneles(){
  let inversores = document.getElementById("formPaneles").elements;
  let gruposDe4SinElemento5 = [];

  for (let i = 0; i < inversores.length; i += 5) {
    let grupo = [];
    for (let j = 0; j < 4; j++) {
      if (i + j < inversores.length) {
        grupo.push(inversores[i + j].value);
      }
    }
    gruposDe4SinElemento5.push(grupo);
  }
  // console.log(gruposDe4SinElemento5);
  return gruposDe4SinElemento5;
}

async function guardarRepresentanteAutorizado(ID_REP_AUT){
  return new Promise((resolve, reject) => {
  let nombreRepresentanteAut = document.getElementById("nombreRepresentanteAut").value,
  cedulaRepresentanteAut = document.getElementById("cedulaRepresentanteAut").value,
  idCargoRepresentanteAut = document.getElementById("idCargoRepresentanteAut").value,
  asientoSocialRepresentanteAut = document.getElementById("asientoSocialRepresentanteAut").value,
  dirRepresentanteAut = document.getElementById("dirRepresentanteAut").value,
  telRepresentanteAut = document.getElementById("telRepresentanteAut").value,
  ID_EST_CIVIL = document.getElementById("idEstadoCivilRepresentanteAut").value;

  if(nombreRepresentanteAut == "" || cedulaRepresentanteAut == "" || idCargoRepresentanteAut == "" || dirRepresentanteAut == "" || ID_EST_CIVIL == ""){
    alertas("Los datos del represetante autorizado están incompletos.", "error");
    return 0;
  }

  $.ajax({
    url: RUTACONSULTAS + 'ActualizarRepresentanteAutorizado' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {
      ID_REP_AUT:ID_REP_AUT,
      NOMBRE_REP:nombreRepresentanteAut,
      CEDULA:cedulaRepresentanteAut,
      ID_CARGO:idCargoRepresentanteAut,
      ASIENTO_SOCIAL:asientoSocialRepresentanteAut,
      DIR_REP:dirRepresentanteAut,
      TELEFONO:telRepresentanteAut,
      ID_EST_CIVIL:ID_EST_CIVIL
    },
    success: function(data) {
      if (data && Object.keys(data).length > 0) {
        // console.log(data[0].ID_REP_AUT)
        let idRep = data[0].ID_REP_AUT;
        resolve(idRep);
      }else{
        return 0;
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al registrar el representante autorizado.", "error");
      console.error('Request failed:', status, error);
    }
  });
});
}

function guardarDetalleInversores(ID_SOL){
  let detInversores = detalleInversores();

  $.ajax({
    url: RUTACONSULTAS + 'ActualizarInversores' + '.php',
    method: 'POST',
    // dataType: 'json',
    data: {ID_SOL:ID_SOL,INVERSORES:detInversores},
    success: function(data) {
      // console.log(data)
      if (data && Object.keys(data).length > 0) {
        // console.log(data)
      }else{
        return 0;
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al registrar datos inversores.", "error");
      console.error('Request failed:', status, error);
    }
  });
};

function guardarDetallePaneles(ID_SOL){
  let detPaneles = detallePaneles();

  $.ajax({
    url: RUTACONSULTAS + 'ActualizarPaneles' + '.php',
    method: 'POST',
    // dataType: 'json',
    data: {ID_SOL:ID_SOL,PANELES:detPaneles},
    success: function(data) {
      // console.log(data)
      if (data && Object.keys(data).length > 0) {
        // console.log(data)
      }else{
        return 0;
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al registrar datos paneles.", "error");
      console.error('Request failed:', status, error);
    }
  });
};

function validarDatosCompletos(){
  let detInversores = detalleInversores();
  let detPaneles = detallePaneles();

  let invVacios = 0, panVacios = 0;

  let datosInvcompletos = true;
  detInversores.forEach(inversor => {
    if(inversor[0] != "" || inversor[1] != ""){
      if(inversor[0] == "" || inversor[1] == "" || inversor[2] == "" || inversor[3] == ""){
        alertas("Debe completar los datos del inversor.", "error");
        datosInvcompletos = false;
        return false;
      }
    }else{
      invVacios += 1;
    }
  });

  if(invVacios == detInversores.length){
    alertas("No ha ingresado los inversores.", "error");
    return false;
  }

  let KWInstaladoInvAntes = document.getElementById("KWInstaladoInvAntes"),
    KWInstaladoPanAntes = document.getElementById("KWInstaladoPanAntes");

  if(obtenerIDTipoSolcitud() == 2 && (KWInstaladoInvAntes.value == "" || KWInstaladoPanAntes.value == "")){
    alertas("Debe completar los datos de las capacidades instaladas.", "error");
    return false;
  }
  let datosPancompletos = true;
  detPaneles.forEach(panel => {
    if(panel[0] != "" || panel[1] != ""){
      if(panel[0] == "" || panel[1] == "" || panel[2] == "" || panel[3] == ""){
        alertas("Debe completar los datos de los paneles.", "error");
        datosPancompletos = false;
        return false;
      }
    }else{
      panVacios += 1;
    }
  });

  if(!datosPancompletos || !datosInvcompletos){return;}

  if(panVacios == detPaneles.length){
    alertas("No ha ingresado los paneles.", "error");
    return false;
  }

  let nic = document.getElementById("NIC").value,
  nombreClt = document.getElementById("nombreCliente").value,
  idEstadoCivil = document.getElementById("idEstadoCivil").value,
  documentoIdentificador = document.getElementById("documentoIdentificador").value,
  idUbicacionInstalacion = document.getElementById("idUbicacionInstalacion").value,
  tecnologiaSistema = document.getElementById("tecnologiaSistema").value,
  dContratista = document.getElementById("dContratista").value,
  promCsmo = document.getElementById("promCsmo").value.replace(",",""),
  capacidadInversores = document.getElementById("capacidadInversores").value.replace(",",""),
  generacionPaneles = document.getElementById("generacionPaneles").value.replace(",",""),
  radiacion = document.getElementById("valorRadiacion").value,  
  CoordenadasCliente = document.getElementById("CoordenadasCliente").value,  
  sectorCliente = document.getElementById("sectorCliente").value,
  municipioCliente = document.getElementById("municipioCliente").value,
  provinciaCliente = document.getElementById("provinciaCliente").value;
  
  if(nic === "" && radiacion === ""){
    alertas("Debe de ingresar un contrato válido.", "error");
    return false;
  }else if (promCsmo === ""){
    alertas("No se ha calculado el promedio de consumo del cliente.", "error");
    return false;
  }else if (sectorCliente === "" || municipioCliente === "" || provinciaCliente === ""){
    alertas("consulte nuevamente el contrato del cliente.", "error");
    return false;
  }else if (capacidadInversores === "" || parseFloat(capacidadInversores) == 0){
    alertas("Debe ingresar los datos del inversor.", "error");
    return false;
  }else if (generacionPaneles === "" || parseFloat(generacionPaneles) == 0 ){
    alertas("Debe ingresar los datos de los paneles.", "error");
    return false;
  }else if(nombreClt === ""){
    alertas("Debe de ingresar el nombre del cliente.", "error");
    return false;
  }else if (idEstadoCivil === ""){
    alertas("Seleccione el estado civil.", "error");
    return false;
  }else if (documentoIdentificador === ""){
    alertas("Ingrese el número de documento.", "error");
    return false;
  }else if (idUbicacionInstalacion === ""){
    alertas("Seleccione la ubicación de la instalación.", "error");
    return false;
  }else if (tecnologiaSistema === ""){
    alertas("Seleccione la tecnologí­a del sistema.", "error");
    return false;
  }else if (dContratista === ""){
    alertas("Debe seleccionar un contratista.", "error");
    return false;
  }else if (CoordenadasCliente === ""){
    alertas("Debe ingresar las coordenadas.", "error");
    return false;
  }

  return true;
}

async function guardarSolicitud(){
  document.getElementById("registrarSolicitud").disabled = true;
  setTimeout(function() {
    document.getElementById("registrarSolicitud").disabled = false;
  }, 2000);

  if(!validarDatosCompletos()){
    return;
  }

  let nombreRepresentanteAut = document.getElementById("nombreRepresentanteAut").value;
  let ID_REP_AUT = "NULL";
  if(nombreRepresentanteAut != ""){
    ID_REP_AUT = await guardarRepresentanteAutorizado(0);
  }

  let nic = document.getElementById("NIC").value,
  idTipoSolicitud = datosTipoSolicitud("id"),
  nombreClt = document.getElementById("nombreCliente").value,
  conexionTransformador = document.getElementById("conexionTransformador").value,
  idEstadoCivil = document.getElementById("idEstadoCivil").value,
  idTipoDocumento = obtenerIDTipoDocumentos(),
  documentoIdentificador = document.getElementById("documentoIdentificador").value,
  telefonoCliente = document.getElementById("telefonoCliente").value,
  tarifaCliente = document.getElementById("tarifaCliente").value,
  direccionSistema = document.getElementById("direccionSistema").value,
  CoordenadasCliente = document.getElementById("CoordenadasCliente").value,
  sectorCliente = document.getElementById("sectorCliente").value,
  municipioCliente = document.getElementById("municipioCliente").value,
  provinciaCliente = document.getElementById("provinciaCliente").value,
  idUbicacionInstalacion = document.getElementById("idUbicacionInstalacion").value,
  tecnologiaSistema = document.getElementById("tecnologiaSistema").value,
  dContratista = document.getElementById("dContratista").value,
  radiacion = document.getElementById("valorRadiacion").value,
  promCsmo = document.getElementById("promCsmo").value.replace(",",""),
  capacidadInversores = document.getElementById("capacidadInversores").value.replace(",",""),
  generacionPaneles = document.getElementById("generacionPaneles").value.replace(",",""),
  potSolicitadaPaneles = document.getElementById("potSolicitadaPaneles").value.replace(",",""),
  KW_INV_INST_ACT = document.getElementById("KWInstaladoInvAntes").value.replace(",",""),
  KW_PAN_INST_ACT = document.getElementById("KWInstaladoPanAntes").value.replace(",","");

  if(nic == "" || nic == 0){
    alertas("Debe ingresar un contrato.","error");
    return;
  }
  
  $.ajax({
    url: RUTACONSULTAS + 'ActualizarSolicitud' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {
      NIC:nic,
      ID_TIPO_SOL:idTipoSolicitud,
      NOMBRE_CLT:nombreClt,
      ID_EST_CIVIL:idEstadoCivil,
      ID_TIPO_DOC:idTipoDocumento,
      NUM_DOC:documentoIdentificador,
      TELEFONO_CLT:telefonoCliente,
      TARIFA:tarifaCliente,
      DIR_SISTEMA:direccionSistema,
      COORDENADAS:CoordenadasCliente,
      SECTOR:sectorCliente,
      PROVINCIA:provinciaCliente,
      MUNICIPIO:municipioCliente,
      RADIACION:radiacion,
      ID_UBI_PROY:idUbicacionInstalacion,
      ID_TEC_SISTEMA:tecnologiaSistema,
      ID_CTR:dContratista,
      INVERSORES_KW:capacidadInversores,
      KWP:potSolicitadaPaneles,
      GEN_SISTEMA:generacionPaneles,
      PROM_CSMO:promCsmo,
      KW_INV_INST_ACT:KW_INV_INST_ACT,
      KW_PAN_INST_ACT:KW_PAN_INST_ACT,
      CON_TRANSFORMADOR:conexionTransformador,
      ID_REP_AUT:ID_REP_AUT
    },
    success: function(data) {
      if (data && Object.keys(data).length > 0) {
        if(data[0].ACCESO == 0){
          alertas("No tienes permisos suficientes.", "warning");
          return;
        }else{
          
          // console.log(data[0].ID_SOL)
          if(data[0].ID_SOL == "ERROR"){
            alertas(data[1].MENSAJE_ERROR, "error");
            return;
          }
          guardarDetalleInversores(data[0].ID_SOL)
          guardarDetallePaneles(data[0].ID_SOL)
          alertas("Solicitud ingresada.", "success");
          limpiarCampos();
        }
      }else{
        alertas("Error al registrar la soliciud.", "error");
        return 0;
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al registrar la soliciud.", "error");
      console.error('Request failed:', status, error);
    }
  });  
}

$("#registrarSolicitud").click(guardarSolicitud);

async function modificarSolicitud(){
  document.getElementById("modificarSolicitud").disabled = true;
  setTimeout(function() {
    document.getElementById("modificarSolicitud").disabled = false;
  }, 2000);

  let detInversores = detalleInversores();
  let detPaneles = detallePaneles();

  let invVacios = 0, panVacios = 0;

  let datosInvcompletos = true;
  detInversores.forEach(inversor => {
    if(inversor[0] != "" || inversor[1] != ""){
      if(inversor[0] == "" || inversor[1] == "" || inversor[2] == "" || inversor[3] == ""){
        alertas("Debe completar los datos del inversor.", "error");
        datosInvcompletos = false;
        return false;
      }
    }else{
      invVacios += 1;
    }
  });

  if(invVacios == detInversores.length){
    alertas("No ha ingresado los inversores.", "error");
    return false;
  }

  let datosPancompletos = true;
  detPaneles.forEach(panel => {
    if(panel[0] != "" || panel[1] != ""){
      if(panel[0] == "" || panel[1] == "" || panel[2] == "" || panel[3] == ""){
        alertas("Debe completar los datos de los paneles.", "error");
        datosPancompletos = false;
        return false;
      }
    }else{
      panVacios += 1;
    }
  });

  if(!datosPancompletos || !datosInvcompletos){return;}

  if(panVacios == detPaneles.length){
    alertas("No ha ingresado los paneles.", "error");
    return false;
  }



  let ID_REP_AUT = document.getElementById("ID_REP_AUT").value,
    nombreRepresentanteAut = document.getElementById("nombreRepresentanteAut").value;
  if(ID_REP_AUT != "" || nombreRepresentanteAut != ""){
    ID_REP_AUT = await guardarRepresentanteAutorizado(ID_REP_AUT);
  }
  
  let ID_SOL = document.getElementById("ID_SOL").value
  nombreClt = document.getElementById("nombreCliente").value,
  conexionTransformador = document.getElementById("conexionTransformador").value,
  SidUbicacionInstalacion = document.getElementById("SidUbicacionInstalacion").value,
  idTipoDocumento = obtenerIDTipoDocumentos(),
  documentoIdentificador = document.getElementById("documentoIdentificador").value,
  tarifaCliente = document.getElementById("tarifaCliente").value,
  dContratista = document.getElementById("dContratista").value,
  capacidadInversores = document.getElementById("capacidadInversores").value.replace(",",""),
  generacionPaneles = document.getElementById("generacionPaneles").value.replace(",",""),
  potSolicitadaPaneles = document.getElementById("potSolicitadaPaneles").value.replace(",",""),
  CoordenadasCliente = document.getElementById("CoordenadasCliente").value;
  
  $.ajax({
    url: RUTACONSULTAS + 'ModificarSolicitud' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {
      ID_SOL:ID_SOL,
      NOMBRE_CLT:nombreClt,
      ID_TIPO_DOC:idTipoDocumento,
      NUM_DOC:documentoIdentificador,
      TARIFA:tarifaCliente,
      ID_CTR:dContratista,
      INVERSORES_KW:capacidadInversores,
      KWP:potSolicitadaPaneles,
      GEN_SISTEMA:generacionPaneles,
      CON_TRANSFORMADOR:conexionTransformador,
      ID_REP_AUT:ID_REP_AUT,
      CoordenadasCliente:CoordenadasCliente,
      SidUbicacionInstalacion:SidUbicacionInstalacion
    },
    success: function(data) {
      if (data && Object.keys(data).length > 0) {
        console.log(data);
        if(data[0].ACCESO == 0){
          alertas("No tienes permisos suficientes.", "warning");
          return;
        }else{
          // console.log(data)
          console.log("Actualizando datos pan/inv");
          guardarDetalleInversores(ID_SOL)
          guardarDetallePaneles(ID_SOL)
          alertas("Solicitud actualizada.", "success");
        }
      }else{
        alertas("Error al actualizada la soliciud.", "error");
        return 0;
      }
    },
    error: function(xhr, status, error) {
      console.log(error)
      alertas("Error al actualizada la soliciud.", "error");
      console.error('Request failed:', status, error);
    }
  });  
}

$("#modificarSolicitud").click(modificarSolicitud);

function actualizarPerfil(){
  $.ajax({
    url: RUTACONSULTAS + 'actualizarPerfil' + '.php',
    method: 'POST',
    dataType: 'json',
    success: function(data) {
      location.reload();
    },
    error: function(xhr, status, error) {
      console.error('Request failed:', status, error);
    }
  });
}

$("#actualizarPerfil").click(actualizarPerfil);

function getRandomDelay(minSeconds, maxSeconds) {
    const random = Math.random();

    const threshold = 0.7;

    if (random > threshold) {
        const highMin = 12;
        return Math.floor(Math.random() * (maxSeconds - highMin + 1) * 1000) + (highMin * 1000);
    } else {
        return Math.floor(Math.random() * (maxSeconds - minSeconds + 1) * 1000) + (minSeconds * 1000);
    }
}

function delay(minMs, maxMs) {
  const randomMs = getRandomDelay(minMs, maxMs);
    return new Promise(resolve => setTimeout(resolve, randomMs));
}

async function cargarDatosCartaNoObjecion(){
  let nic = document.getElementById("nicNoObjecion").value,
  botonGenerar = document.getElementById("BTNnicNoObjecion")

  let cargaCargaNoObjecion = document.getElementById("cargaCargaNoObjecion"),
  switchFirmaDocumentos = document.getElementById("switchFirmaDocumentos").checked;

  if(nic == ""){
    alertas("Debe ingresar un contrato.","error");
    return;
  }
  cargaCargaNoObjecion.classList.toggle("d-none");

  botonGenerar.disabled = true;
  await delay(10, 25);
  
  $.ajax({
    url: RUTACONSULTAS + 'cargarDatosCartaNoObjecion' + '.php',
    method: 'POST',
    dataType: 'json',data: {NIC:nic},
    success: function(data) {
      setTimeout(function() {
          botonGenerar.disabled = false;
      }, 4000);
      if (data && Object.keys(data).length > 0) {

        if(data[0].ACCESO == 0){
          alertas("No tienes permisos suficientes.", "warning");
          return;
        }
        
        let iframe = document.getElementById("iframeCartaNoObjecion");
        let parametrosObj = {
          firmarDocumentos:switchFirmaDocumentos,
          NIC: data[0].NIC,
          NOMBRE_CLT: data[0].NOMBRE_CLT,
          INVERSORES_KW: data[0].INVERSORES_KW, 
          KWP: data[0].KWP,
          KW_INV_INST_ACT: data[0].KW_INV_INST_ACT, 
          KW_PAN_INST_ACT: data[0].KW_PAN_INST_ACT,
          INVER: data[0].INVERSORES,
          PANELES: data[0].PANELES,
          NOMBRE_CTR: data[0].NOMBRE_CTR,
          DESC_SOL: data[0].DESC_SOL,
          CIRCUITO: data[0].CIRCUITO,
          ID_SOL: data[0].ID_SOL,
        };
        
        let queryParamsParametrosObj = Object.entries(parametrosObj)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return value.map((objeto, index) =>
                Object.entries(objeto)
                  .map(([objKey, objValue]) =>
                    `${key}[${index}][${objKey}]=${encodeURIComponent(objValue)}`
                  )
                  .join('&')
              ).join('&');
            } else {
              return `${key}=${encodeURIComponent(value)}`;
            }
          })
          .join('&');
          
          let nuevaURLParametrosObj = "formato_documentos/generarcartanoobjecion.php?" + queryParamsParametrosObj;
          iframe.src = nuevaURLParametrosObj;

      }else{
        alertas("Este contrato no ha sido ingresado.", "error");
      }
      cargaCargaNoObjecion.classList.toggle("d-none");
    },
    error: function(xhr, status, error) {
      botonGenerar.disabled = false;
      alertas("Este contrato no ha sido ingresado.", "error");
      cargaCargaNoObjecion.classList.toggle("d-none");
      // console.error('Request failed:', status, error);
    }
  });
}

$("#BTNnicNoObjecion").click(cargarDatosCartaNoObjecion);

$("#nicNoObjecion").keydown(function(event) {
  if (event.keyCode === 13) {
    cargarDatosCartaNoObjecion();
  }
});

async function cargarDatosAcuerdos(){
  let nic = document.getElementById("nicAcuerdos").value,
  botonGenerar = document.getElementById("BTNnicAcuerdos")

  let cargaCargaNoObjecion = document.getElementById("cargaCargaNoObjecion");

  if(nic == ""){
    alertas("Debe ingresar un contrato.","error");
    return;
  }
  botonGenerar.disabled = true;

  await delay(15, 32);
  
  $.ajax({
    url: RUTACONSULTAS + 'cargarDatosAcuerdos' + '.php',
    method: 'POST',
    dataType: 'json',data: {NIC:nic},
    success: function(data) {
      setTimeout(function() {
          botonGenerar.disabled = false;
      }, 4000);
      
      if (data && Object.keys(data).length > 0) {

        if(data[0].ACCESO == 0){
          alertas("No tienes permisos suficientes.", "warning");
          return;
        }
        
        let iframe = document.getElementById("iframeCartaNoObjecion");
        let parametrosObj = {
          NIC: data[0].NIC,
          FECHA_REGISTRO: data[0].FECHA_REGISTRO,
          NOMBRE_CLT: data[0].NOMBRE_CLT,
          NUM_DOC: data[0].NUM_DOC,
          TARIFA: data[0].TARIFA,
          DESC_UBI: data[0].DESC_UBI,
          NOMBRE_REP: data[0].NOMBRE_REP,
          CEDULA_REP: data[0].CEDULA_REP, 
          KWP: data[0].KWP,
          MUNICIPIO: data[0].MUNICIPIO,
          PROVINCIA: data[0].PROVINCIA,
          DIR_SISTEMA : data[0].DIR_SISTEMA,
          KW_PAN_INST_ACT: data[0].KW_PAN_INST_ACT,
          KW_INV_INST_ACT: data[0].KW_INV_INST_ACT,
          ESTADO_CIVIL_CLT: data[0].ESTADO_CIVIL_CLT,
          ESTADO_CIVIL_REP: data[0].ESTADO_CIVIL_REP,
          ASIENTO_SOCIAL: data[0].ASIENTO_SOCIAL,
          DESC_CARGO: data[0].DESC_CARGO,
          DIR_REP: data[0].DIR_REP,
          CON_TRANSFORMADOR: data[0].CON_TRANSFORMADOR,
          KW_INVERSORES: data[0].INVERSORES_KW,
          VOLTAJE: data[0].VOLTAJE,
          ID_SOL: data[0].ID_SOL,
        };
        
        let queryParamsParametrosObj = Object.entries(parametrosObj)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return value.map((objeto, index) =>
                Object.entries(objeto)
                  .map(([objKey, objValue]) =>
                    `${key}[${index}][${objKey}]=${encodeURIComponent(objValue)}`
                  )
                  .join('&')
              ).join('&');
            } else {
              return `${key}=${encodeURIComponent(value)}`;
            }
          })
          .join('&');
          
          let nuevaURLParametrosObj = "formato_documentos/generaracuerdos.php?" + queryParamsParametrosObj;
          iframe.src = nuevaURLParametrosObj;

      }else{
        alertas("Este contrato no ha sido ingresado.", "error");
      }
    },
    error: function(xhr, status, error) {
      botonGenerar.disabled = false;
      alertas("Este contrato no ha sido ingresado.", "error");
      cargaCargaNoObjecion.classList.toggle("d-none");
      // console.error('Request failed:', status, error);
    }
  });
}

$("#BTNnicAcuerdos").click(cargarDatosAcuerdos);

$("#nicAcuerdos").keydown(function(event) {
  if (event.keyCode === 13) {
    cargarDatosAcuerdos();
  }
});


function cargarDatosFicha2Visita(){
  let nic = document.getElementById("nicFicha2Visita").value
BTNnicFicha2Visita
  let cargaCargaNoObjecion = document.getElementById("cargaCargaNoObjecion");

  if(nic == ""){
    alertas("Debe ingresar un contrato.","error");
    return;
  }

  $.ajax({
    url: RUTACONSULTAS + 'cargarDatosAcuerdos' + '.php',
    method: 'POST',
    dataType: 'json',data: {NIC:nic},
    success: function(data) {
      if (data && Object.keys(data).length > 0) {

        if(data[0].ACCESO == 0){
          alertas("No tienes permisos suficientes.", "warning");
          return;
        }

        let iframe = document.getElementById("iframeCartaNoObjecion");
        let parametrosObj = {
          NIC: data[0].NIC,
          FECHA_REGISTRO: data[0].FECHA_REGISTRO,
          NOMBRE_CLT: data[0].NOMBRE_CLT,
          NUM_DOC: data[0].NUM_DOC,
          TARIFA: data[0].TARIFA,
          DESC_UBI: data[0].DESC_UBI,
          NOMBRE_REP: data[0].NOMBRE_REP,
          CEDULA_REP: data[0].CEDULA_REP, 
          KWP: data[0].KWP,
          MUNICIPIO: data[0].MUNICIPIO,
          PROVINCIA: data[0].PROVINCIA,
          DIR_SISTEMA : data[0].DIR_SISTEMA,
          KW_PAN_INST_ACT: data[0].KW_PAN_INST_ACT,
          ESTADO_CIVIL_CLT: data[0].ESTADO_CIVIL_CLT,
          ESTADO_CIVIL_REP: data[0].ESTADO_CIVIL_REP,
          ASIENTO_SOCIAL: data[0].ASIENTO_SOCIAL,
          DESC_CARGO: data[0].DESC_CARGO,
          DIR_REP: data[0].DIR_REP,
          CON_TRANSFORMADOR: data[0].CON_TRANSFORMADOR,
          KW_INVERSORES: data[0].INVERSORES_KW,
          VOLTAJE: data[0].VOLTAJE,
        };
        
        let queryParamsParametrosObj = Object.entries(parametrosObj)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return value.map((objeto, index) =>
                Object.entries(objeto)
                  .map(([objKey, objValue]) =>
                    `${key}[${index}][${objKey}]=${encodeURIComponent(objValue)}`
                  )
                  .join('&')
              ).join('&');
            } else {
              return `${key}=${encodeURIComponent(value)}`;
            }
          })
          .join('&');
          
          let nuevaURLParametrosObj = "formato_documentos/generarficha2visita.php?" + queryParamsParametrosObj;
          iframe.src = nuevaURLParametrosObj;

      }else{
        alertas("Este contrato no ha sido ingresado.", "error");
      }
    },
    error: function(xhr, status, error) {
      alertas("Este contrato no ha sido ingresado.", "error");
      cargaCargaNoObjecion.classList.toggle("d-none");
      // console.error('Request failed:', status, error);
    }
  });
}

$("#BTNnicFicha2Visita").click(cargarDatosFicha2Visita);

$("#nicFicha2Visita").keydown(function(event) {
  if (event.keyCode === 13) {
    cargarDatosFicha2Visita();
  }
});

async function cargarModelosInversoresEditar(id, ID_MARCA){
  document.getElementById("modeloInversores"+id).innerHTML = '<option value="">--Modelo</option>';
  datosOpciones = await cargarModelosInversoresPromise(ID_MARCA);
  let modeloInversores = document.querySelectorAll(".modeloInversores");
  datosOpciones.forEach(opcion => {
    const nuevaOpcion = document.createElement("option");
    nuevaOpcion.value = opcion.ID_MODELO;
    nuevaOpcion.text = opcion.DESC_MODELO;
    modeloInversores[id-1].add(nuevaOpcion);
  })
}

async function cargarModelosPanelesEditar(id, ID_MARCA){
  document.getElementById("modeloPaneles"+id).innerHTML = '<option value="">--Modelo</option>';
  datosOpciones = await cargarModelosModulosFotovoltaicos(ID_MARCA);
  let modeloPaneles = document.querySelectorAll(".modeloPaneles");
  datosOpciones.forEach(opcion => {
    const nuevaOpcion = document.createElement("option");
    nuevaOpcion.value = opcion.ID_MODELO;
    nuevaOpcion.text = opcion.DESC_MODELO;
    modeloPaneles[id-1].add(nuevaOpcion);
  })
}

async function consultarSolicitud(){
  limpiarCampos();
  let NIC = document.getElementById("NICeditar").value,
    nombreCliente = document.getElementById("nombreCliente"),
    documentoIdentificador = document.getElementById("documentoIdentificador"),
    fechaSolicitud = document.getElementById("fechaSolicitud"),
    tarifaCliente = document.getElementById("tarifaCliente"),
    tipoSolicitud = document.getElementById("tipoSolicitud"),
    sectorCliente = document.getElementById("sectorCliente"),
    promCsmo = document.getElementById("promCsmo"),
    valorRadiacion = document.getElementById("valorRadiacion"),
    conexionTransformador = document.getElementById("conexionTransformador"),
    CoordenadasCliente = document.getElementById("CoordenadasCliente"),
    ID_SOL = document.getElementById("ID_SOL"),
    ID_REP_AUT = document.getElementById("ID_REP_AUT"),
    nombreRepresentanteAut = document.getElementById("nombreRepresentanteAut"),
    cedulaRepresentanteAut = document.getElementById("cedulaRepresentanteAut"),
    asientoSocialRepresentanteAut = document.getElementById("asientoSocialRepresentanteAut"),
    dirRepresentanteAut = document.getElementById("dirRepresentanteAut"),
    telRepresentanteAut = document.getElementById("telRepresentanteAut"),
    STarifa = document.getElementById("STarifa"),
    SConTransformador = document.getElementById("SConTransformador"),
    KWInstaladoPanAntes = document.getElementById("KWInstaladoPanAntes"),
    KWInstaladoInvAntes = document.getElementById("KWInstaladoInvAntes"),
    idEstadoCivilRepresentanteAut = document.getElementById("idEstadoCivilRepresentanteAut");
    SidUbicacionInstalacion = document.getElementById("SidUbicacionInstalacion");
    
    if(NIC == "" || NIC.length < 7 || isNaN(NIC)){
      alertas("Verifique el NIC ingresado", "error");
      return;
    }

  $.ajax({
    url: RUTACONSULTAS + 'consultarSolicitud' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {NIC:NIC},
    success: function(data) {
      data = data[0]
      if (data && Object.keys(data).length > 0) {
        // console.log(data[0])
        ID_SOL.value = data.ID_SOL;
        nombreCliente.value = data.NOMBRE_CLT;
        tarifaCliente.value = data.TARIFA;
        documentoIdentificador.value = data.NUM_DOC;
        sectorCliente.value = data.SECTOR;
        fechaSolicitud.value = data.FECHA_REGISTRO;
        tipoSolicitud.value = data.DESC_SOL;
        promCsmo.value = data.PROM_CSMO.toLocaleString("es-DO", opcionesDecimales);
        conexionTransformador.value = data.CON_TRANSFORMADOR;
        CoordenadasCliente.value = data.COORDENADAS;
        valorRadiacion.value = data.RADIACION;
        KWInstaladoPanAntes.value = data.KW_PAN_INST_ACT;
        KWInstaladoInvAntes.value = data.KW_INV_INST_ACT;

        SidUbicacionInstalacion. value = data.ID_UBI_PROY;
        STarifa.value = data.TARIFA;
        SConTransformador.value = data.CON_TRANSFORMADOR;

        document.getElementById(data.ID_TIPO_DOC+data.ABR_DOC).checked = true;
        $('#idEstadoCivilRepresentanteAut').val(data.ID_EST_CIVIL_REP).trigger('change.select2');

        $('#dContratista').val(data.ID_CTR).trigger('change.select2');
        consultarDContratista();

        if(data.ID_REP_AUT != ""){
          ID_REP_AUT.value = data.ID_REP_AUT;
          nombreRepresentanteAut.value = data.NOMBRE_REP;
          cedulaRepresentanteAut.value = data.CED_REP;
          asientoSocialRepresentanteAut.value = data.ASIENTO_SOCIAL;
          dirRepresentanteAut.value = data.DIR_REP;
          telRepresentanteAut.value = data.TEL_REP;
          $('#idCargoRepresentanteAut').val(data.ID_CARGO).trigger('change.select2');
        }
        
        if(data.INVERSORES && Object.keys(data.INVERSORES).length > 0) {
          let contDInv = 1;
          async function processInversor(inversor, currentCont) {
            cantInv = document.getElementById("cantInversores" + currentCont);
            potInv = document.getElementById("potInversores" + currentCont);
            cantInv.value = inversor.CANT;
            potInv.value = inversor.KW_UNI;
            $('#marcaInversores' + currentCont).val(inversor.ID_MARCA).trigger('change.select2');
            await cargarModelosInversoresEditar(currentCont, inversor.ID_MARCA);
            $('#modeloInversores' + currentCont).val(inversor.ID_MODELO).trigger('change.select2');
            return currentCont + 1;
          }
          (async () => {
            for (const inversor of data.INVERSORES) {
              contDInv = await processInversor(inversor, contDInv);
            }
            calcularCapacidadInversores();
          })();
        }

        if(data.PANELES && Object.keys(data.PANELES).length > 0) {
          let contDPan = 1;
          async function processPaneles(paneles, currentCont) {
            // console.log(currentCont);
            // console.log(paneles);
            cantPan = document.getElementById("cantPaneles" + currentCont);
            potPan = document.getElementById("potPaneles" + currentCont);
            cantPan.value = paneles.CANT;
            potPan.value = paneles.KW_UNI;
            $('#marcaPaneles' + currentCont).val(paneles.ID_MARCA).trigger('change.select2');
            await cargarModelosPanelesEditar(currentCont, paneles.ID_MARCA);
            $('#modeloPaneles' + currentCont).val(paneles.ID_MODELO).trigger('change.select2');
            return currentCont + 1;
          }
          (async () => {
            for (const paneles of data.PANELES) {
              contDPan = await processPaneles(paneles, contDPan);
            }
            calcularGeneracionPaneles();
          })();
        }
        consultarNICModificacion();
        alertas("Se cargaron los datos de la solicitud.", "success");
      }else{
        
      }
    },
    error: function(xhr, status, error) {
      alertas("Error al cargar los datos. Verifique el NIC.", "error");
    }
  });
};

$("#consultarSolicitud").click(consultarSolicitud);

$("#NICeditar").keydown(function(event) {
  if (event.keyCode === 13) {
    consultarSolicitud();
  }
});

async function consultarNICModificacion(){
  let NIC = document.getElementById("NICeditar").value,
    obsCircuito = document.getElementById("obsCircuito"),
    obsCt = document.getElementById("obsCt"),
    obsCtransf = document.getElementById("obsCtransf"),
    obsContransf = document.getElementById("obsContransf");

    if(NIC == "" || NIC.length < 7 || isNaN(NIC)){
      alertas("Verifique el NIC ingresado", "error");
      return;
    }

  $.ajax({
    url: RUTACONSULTAS + 'consultarNIC' + '.php',
    method: 'POST',
    dataType: 'json',
    data: {NIC:NIC},
    success: function(data) {
      if (data && Object.keys(data).length > 0) {
        obsCircuito.value = data.circuito;
        obsCt.value = data.centro_transformacion;
        obsCtransf.value = data.potencia;
        obsContransf.value = data.tipo_conexion;

        generarObservacion();
      }
    },
    error: function(xhr, status, error) {
      // alertas("Error al cargar los datos. Verifique el NIC.", "error");
    }
  });
};


function limpiarCampos(){
  document.querySelectorAll('form').forEach(form => form.reset());
  $('select').val("").trigger('change.select2');

  document.getElementById("NIC").value = "";
  document.getElementsByName("tipoSolicitud")[0].checked = true;
}

$("#SConTransformador").change(function(){
  let SConTransformador = document.getElementById("SConTransformador");
  let conexionTransformador = document.getElementById("conexionTransformador");
  conexionTransformador.value = SConTransformador.value;
})

$("#STarifa").change(function(){
  let STarifa = document.getElementById("STarifa");
  let tarifaCliente = document.getElementById("tarifaCliente");
    tarifaCliente.value = STarifa.value;
})

function activarDataTable(){
  const dataTable = new simpleDatatables.DataTable(".datatable", {
      searchable: true,
      fixedHeight: true,
      paging: true,
      sortable: true,
      // fixedHeight: true,
      fixedColumns: true,
      // scrollX: true
  })
}

function listarSolicitudes(){
  $.ajax({
      url: RUTACONSULTAS + "listarSolicitudes" + ".php",
      method: "POST",
      dataType: 'json',
      success: function(data) {
        if (data && Object.keys(data).length > 0) {
          // console.log(data)
          contenedorExis = document.getElementById("listarSolicitudes");
          let solicitudes = JSON.parse(data);
          solicitudes = Object.entries(solicitudes).map(([key, value]) => value);

          // console.log(solicitudes)
          
          let datos = "";
          // Lista todos los datos de los usuarios y los almacena en la variable datos
          solicitudes.forEach(element => {
              carga = `
              <tr>
                  <td>${element.FECHA_REGISTRO}</td>
                  <td>${element.NIC}</td>
                  <td>${element.NOMBRE_CLT}</td>
                  <td>${element.DESC_SOL}</td>
                  <td>${element.TARIFA}</td>
                  <td>${element.SECTOR}</td>
                  <td>${element.NOMBRE_CTR}</td>
                  <td>${element.TELEFONO_CTR}</td>
                  <td>${element.INVERSORES_KW.toLocaleString("es-DO", opcionesDecimales)}</td>
                  <td>${element.KWP.toLocaleString("es-DO", opcionesDecimales)}</td>
                  <td>${element.KW_INV_INST_ACT.toLocaleString("es-DO", opcionesDecimales)}</td>
                  <td>${element.KW_PAN_INST_ACT.toLocaleString("es-DO", opcionesDecimales)}</td>
                  <td>${element.PROM_CSMO.toLocaleString("es-DO", opcionesDecimales)}</td>
                  <td>${element.GEN_SISTEMA.toLocaleString("es-DO", opcionesDecimales)}</td>
                  <td>${element.NOMBRE}</td>
                  <td>${element.NOMBRE_ULT_CAMBIO}</td>
                  <td>${element.FECHA_ULT_CAMBIO}</td>
              </tr>
              `
              datos += carga;
          });

          contenedor = `<div class="card recent-sales overflow-auto">
          <div class="card-body bg-white">
            <h5 class="card-title">Solicitudes <span>| Lista de solicitudes</span></h5>
            <table class="table table-striped datatable">
              <thead>
                <tr>
                  <th scope="col">FECHA REGISTRO</th>
                  <th scope="col">NIC</th>
                  <th scope="col">NOMBRE CLIENTE</th>
                  <th scope="col">SOLICITUD</th>
                  <th scope="col">TARIFA</th>
                  <th scope="col">SECTOR</th>
                  <th scope="col">CONTRATISTA</th>
                  <th scope="col">TELEFONO CONTRATISTA</th>
                  <th scope="col">KW INVERSORES</th>
                  <th scope="col">KWP</th>
                  <th scope="col">KW INVERSORES EXISTENTE</th>
                  <th scope="col">KWP EXISTENTE</th>
                  <th scope="col">PROM. CONSUMO</th>
                  <th scope="col">GEN. SISTEMA</th>
                  <th scope="col">USUARIO INGRESO</th>
                  <th scope="col">USUARIO ULT. CAMBIO</th>
                  <th scope="col">FECHA ULT. CAMBIO</th>
                </tr>
              </thead>
                  <tbody>
                      ${datos}
                  </tbody>
              </table>
              </div>
            </div>
            `; 
          contenedorExis.innerHTML = contenedor;
 
          new DataTable('.datatable', {
            "columnDefs": [
              { 
                "targets": [0,16], // Reemplaza 0 con el í­ndice de tu columna de fechas
                "type": "moment-date",
                "render": function (data, type, row, meta) {
                    if (type === 'display' && data) {
                        // Formatear la fecha a "DD/MM/YYYY" con ceros a la izquierda
                        var formattedDate = moment(data).format("DD/MM/YYYY");
                        return formattedDate;
                    } else {
                        return data;
                    }
                }
            },
              { 
                  "targets": "_all",
                  "render": function (data, type, row, meta) {
                      return type === 'display' && typeof data === 'string' ?
                          '<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="' + data + '">' + data + '</div>' :
                          data;
                  }
              }
          ],
            order: [[0, 'desc']],
            scrollX: true,
            pagingType: 'full_numbers'
        });
        }
      },
      error: function(xhr, status, error) {
        console.log(error)
      }
    });
  }


  function obtenerUltimoNoNulo(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i].ENERGIA_ACUMULADA !== null && array[i].ENERGIA_ACUMULADA !== "No Disponible") {
            return array[i].ENERGIA_ACUMULADA;
        }
    }
    return null; 
}

  $("#consultarHistoricoConsumo").click(listarHistoricoConsumo);
  $("#NICH").keydown(function(event) {
    if (event.keyCode === 13) {
      listarHistoricoConsumo();
    }
  });
  
  async function listarHistoricoConsumo(){
    let NIC = document.getElementById("NICH").value;
    let ANO = document.getElementById("ANOHISTORICO").value;
    let contenedorExis = document.getElementById("listarHistoricoConsumo");
  

    if(NIC == "" || NIC.length < 7 || isNaN(NIC)){
      alertas("Verifique el NIC ingresado", "error");
      return;
    }

    if(ANO == "" || isNaN(NIC)){
      alertas("Seleccione el año a consultar", "error");
      return;
    }
    
    contenedorExis.innerHTML = "<div class='w-100 text-center' style='height: 40vh; align-content: center;'><div class='spinner-border' role='status'><span class='visually-hidden'>Loading...</span></div></div>"
    
    // await delay(1, 3);

    $.ajax({
        url: RUTACONSULTAS + "historicoConsumo" + ".php",
        method: "POST",
        dataType: 'json',
        data: {NIC:NIC,ANO:ANO},
        success: function(data) {
          if (data && Object.keys(data).length > 0) {
            if(data[0].ACCESO == 0){
              alertas("No tienes permisos suficientes.", "warning");
              return;
            }

            let consumos = JSON.parse(data);
            consumos = Object.entries(consumos).map(([key, value]) => value);
  
            let datos = "";
            // console.log(consumos)

            const ultimoConsumo = consumos[consumos.length - 1];
            // console.log(ultimoConsumo.ENERGIA_ACUMULADA);
            
            const ultimoConsumoEC = obtenerUltimoNoNulo(consumos)

            try {
              document.getElementById("HCNombreCliente").value = ultimoConsumo.NOMBRE_CLT
              document.getElementById("HCEnergiaAcumulada").value = ultimoConsumoEC.toLocaleString("es-DO", opcionesDecimales)
            } catch (error) {
              document.getElementById("HCNombreCliente").value = ""
              document.getElementById("HCEnergiaAcumulada").value = ""
              contenedorExis.innerHTML = "<h4 class='text-danger text-center'>Cliente no pertenecia al PMN en el año seleccionado.</h4>"
              alertas("Error al cargar los datos. Verifique el NIC.", "error");
              return
            }

            consumos.forEach(element => {
                carga = `
                <tr>
                    <td>${element.MES}</td>
                    <td>${element.CSMO_EDENORTE.toLocaleString("es-DO", opcionesDecimales)}</td>
                    <td>${element.INYECCION_CLT.toLocaleString("es-DO", opcionesDecimales)}</td>
                    <td>${element.CSMO_NETO.toLocaleString("es-DO", opcionesDecimales)}</td>
                    <td>${element.ENERGIA_ACUMULADA.toLocaleString("es-DO", opcionesDecimales)}</td>
                    <td>${element.CSMO_NETO_CON_ENERGIA_ACUMULADA.toLocaleString("es-DO", opcionesDecimales)}</td>
                    <td>${element.DESCUENTO_ENERGIA_ACUMULADA.toLocaleString("es-DO", opcionesDecimales)}</td>
                    <td>${element.F_ULT_ACT}</td>
                    <td>${element.KW_INV_INST.toLocaleString("es-DO", opcionesDecimales)}</td>
                    <td>${element.KWP_INST.toLocaleString("es-DO", opcionesDecimales)}</td>
                    <td>${element.TARIFA}</td>
                </tr>
                `
                datos += carga;
            });
  
            contenedor = `<div class="card recent-sales overflow-auto">
            <div class="card-body bg-white">
              <h5 class="card-title">Consumos <span>| Lista de consumos</span></h5>
              <table class="table table-striped datatable">
                <thead>
                  <tr>
                    <th scope="col">MES</th>
                    <th scope="col">CONSUMO EDENORTE</th>
                    <th scope="col">INYECCION</th>
                    <th scope="col">CONSUMO NETO</th>
                    <th scope="col">ENERGIA ACUMULADA</th>
                    <th scope="col">CONSUMO NETO CON ENERGIA ACUMULADA</th>
                    <th scope="col">DESCUENTO ENERGIA ACUMULADA</th>
                    <th scope="col">FECHA ULT. ACT. CONSUMOS</th>
                    <th scope="col">KW INVERSORES</th>
                    <th scope="col">KWP</th>
                    <th scope="col">TARIFA</th>
                  </tr>
                </thead>
                    <tbody>
                        ${datos}
                    </tbody>
                </table>
                </div>
              </div>
              `; 
            contenedorExis.innerHTML = contenedor;
   

            $.fn.dataTable.ext.order['month-pre'] = function (data) {
              var months = {
                  'Enero': 0,
                  'Febrero': 1,
                  'Marzo': 2,
                  'Abril': 3,
                  'Mayo': 4,
                  'Junio': 5,
                  'Julio': 6,
                  'Agosto': 7,
                  'Septiembre': 8,
                  'Octubre': 9,
                  'Noviembre': 10,
                  'Diciembre': 11
              };
              return months[data] !== undefined ? months[data] : -1;
          };
          
            new DataTable('.datatable', {
              "columnDefs": [
                { 
                  "targets": [7], // Reemplaza 0 con el í­ndice de tu columna de fechas
                  "type": "moment-date",
                  "render": function (data, type, row, meta) {
                      if (type === 'display' && data) {
                          // Formatear la fecha a "DD/MM/YYYY" con ceros a la izquierda
                          var formattedDate = moment(data).format("DD/MM/YYYY");
                          return formattedDate;
                      } else {
                          return data;
                      }
                  }
              },
                { 
                    "targets": "_all",
                    "render": function (data, type, row, meta) {
                        return type === 'display' && typeof data === 'string' ?
                            '<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="' + data + '">' + data + '</div>' :
                            data;
                    }
                },
                { 
                  "targets": [0], // Índice de la columna de meses
                  "orderDataType": "month-pre"
              }
            ],
              order: [[0, 'asc']],
              scrollX: true,
              "pageLength": 25,
              pagingType: 'full_numbers',
              "paging": false,
              "searching": false,
              "bLengthChange": false,
              "ordering": false
          }); 
          }else{
            alertas("Error al cargar los datos. Verifique el NIC.", "error");
          }
        },
        error: function(xhr, status, error) {
          alertas("Error al cargar los datos. Verifique el NIC.", "error");
          console.log(error)
        }
      });
    }

  function listarContratistasVista(){
    $.ajax({
        url: RUTACONSULTAS + "listarContratistasVista" + ".php",
        method: "POST",
        dataType: 'json',
        success: function(data) {
          if (data && Object.keys(data).length > 0) {
            // console.log(data)
            contenedorExis = document.getElementById("listarContratistas");
            let solicitudes = JSON.parse(data);
            solicitudes = Object.entries(solicitudes).map(([key, value]) => value);
  
            // console.log(solicitudes)
            
            let datos = "";
            // Lista todos los datos de los usuarios y los almacena en la variable datos
            solicitudes.forEach(element => {
                carga = `
                <tr>
                    <td>${element.NOMBRE_CTR}</td>
                    <td>${element.TELEFONO}</td>
                    <td>${element.CORREO}</td>
                </tr>
                `
                datos += carga;
            });
  
            contenedor = `<div class="card recent-sales overflow-auto">
            <div class="card-body bg-white">
              <h5 class="card-title">Contratistas <span>| Lista de Contratistas</span></h5>
              <table class="table table-striped datatable">
                <thead>
                  <tr>
                    <th scope="col">CONTRATISTA</th>
                    <th scope="col">TELEFONO</th>
                    <th scope="col">CORREO</th>
                  </tr>
                </thead>
                    <tbody>
                        ${datos}
                    </tbody>
                </table>
                </div>
              </div>
              `; 
            contenedorExis.innerHTML = contenedor;
   
            new DataTable('.datatable', {
              "columnDefs": [
                
                { 
                    "targets": "_all",
                    "render": function (data, type, row, meta) {
                        return type === 'display' && typeof data === 'string' ?
                            '<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="' + data + '">' + data + '</div>' :
                            data;
                    }
                }
            ],
              order: [[0, 'asc']],
              scrollX: true,
              pagingType: 'full_numbers'
          });
          }
        },
        error: function(xhr, status, error) {
          console.log(error)
        }
      });
    }


$("#formeqMarcaInversor").on("submit", async function(event) {
if (!validarFormularios(event)) { return; }

    let eqMarcaInversor = document.getElementById("eqMarcaInversor").value,
    eqChInversor = document.getElementById("eqChInversor").checked,
    eqCertificacionInversor = document.getElementById("eqCertificacionInversor").files[0];

if (eqMarcaInversor == "") {
    alertas("Ingrese la marca del inversor.", "error");
    return;
} else if (!eqChInversor) {
    alertas("Debe confirmar que el documento fue validado.", "error");
    return;
} else if (!eqCertificacionInversor) {
    alertas("Debe adjuntar un documento en formato PDF.", "error");
    return;
} else if (eqCertificacionInversor.type !== "application/pdf") {
    alertas("El archivo debe estar en formato PDF.", "error");
    return;
}

let formData = new FormData();
formData.append("eqMarcaInversor", eqMarcaInversor);
formData.append("eqCertificacionInversor", eqCertificacionInversor);

$.ajax({
    url: RUTACONSULTAS + 'registrarMarcaInversores.php',
    method: 'POST',
    dataType: 'json',
    data: formData,
    processData: false,
    contentType: false,
    success: function(data) {
        console.log(data)
    if (data && Object.keys(data).length > 0) {
        if(data[0].ACCESO == 0){
            alertas("No tienes permisos suficientes.", "warning");
            return;
          }

          if(typeof data === "string") {
                data = JSON.parse(data);
          }

          if(data[0].ERROR == "ERROR"){
            alertas(data[0].MENSAJE_ERROR, "error");
            return;
          }

          document.getElementById("formeqMarcaInversor").reset();

        alertas("La marca fue registrada correctamente.", "success");
    } else {
        alertas("Error al registrar la marca.", "error");
    }
    },
    error: function(xhr, status, error) {
        alertas("Error al registrar.", "error");
        console.error('Request failed:', status, error);
    }
});
});


$("#formeqMarcaModFov").on("submit", async function(event) {
    if (!validarFormularios(event)) { return; }
    
        let eqMarcaModFov = document.getElementById("eqMarcaModFov").value,
        eqChModFov = document.getElementById("eqChModFov").checked,
        eqCertificacionModFov = document.getElementById("eqCertificacionModFov").files[0];
    
    if (eqMarcaModFov == "") {
        alertas("Ingrese la marca del módulo fotovoltaico.", "error");
        return;
    } else if (!eqChModFov) {
        alertas("Debe confirmar que el documento fue validado.", "error");
        return;
    } else if (!eqCertificacionModFov) {
        alertas("Debe adjuntar un documento en formato PDF.", "error");
        return;
    } else if (eqCertificacionModFov.type !== "application/pdf") {
        alertas("El archivo debe estar en formato PDF.", "error");
        return;
    }
    
    let formData = new FormData();
    formData.append("eqMarcaInversor", eqMarcaModFov);
    formData.append("eqCertificacionInversor", eqCertificacionModFov);
    
    $.ajax({
        url: RUTACONSULTAS + 'registrarMarcaPaneles.php',
        method: 'POST',
        dataType: 'json',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            console.log(data)
        if (data && Object.keys(data).length > 0) {
            if(data[0].ACCESO == 0){
                alertas("No tienes permisos suficientes.", "warning");
                return;
              }
    
              if(typeof data === "string") {
                    data = JSON.parse(data);
              }
    
              if(data[0].ERROR == "ERROR"){
                alertas(data[0].MENSAJE_ERROR, "error");
                return;
              }
              
              document.getElementById("formeqMarcaModFov").reset();
    
            alertas("La marca fue registrada correctamente.", "success");
        } else {
            alertas("Error al registrar la marca.", "error");
        }
        },
        error: function(xhr, status, error) {
            alertas("Error al registrar.", "error");
            console.error('Request failed:', status, error);
        }
    });
    });


    $("#formeqModeloInversor").on("submit", async function(event) {
        if (!validarFormularios(event)) { return; }
        
            let eqMarcaID = document.getElementById("eqMarcaInversorID").value,
            eqModelo = document.getElementById("eqMarcaModeloInversor").value,
            eqChModFov = document.getElementById("eqChModeloInversor").checked,
            eqCertificacionModFov = document.getElementById("eqCertificacionModeloInversor").files[0];
        
        if (eqMarcaID == "") {
            alertas("Seleccione la marca del inversor.", "error");
            return;
        } else if (eqModelo == "") {
            alertas("Ingrese el modelo del inversor.", "error");
            return;
        }else if (!eqChModFov) {
            alertas("Debe confirmar que el documento fue validado.", "error");
            return;
        } else if (!eqCertificacionModFov) {
            alertas("Debe adjuntar un documento en formato PDF.", "error");
            return;
        } else if (eqCertificacionModFov.type !== "application/pdf") {
            alertas("El archivo debe estar en formato PDF.", "error");
            return;
        }
        
        let formData = new FormData();
        formData.append("eqMarcaID", eqMarcaID);
        formData.append("eqModelo", eqModelo);
        formData.append("eqCertificacion", eqCertificacionModFov);
        
        $.ajax({
            url: RUTACONSULTAS + 'registrarModeloInversor.php',
            method: 'POST',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                console.log(data)
            if (data && Object.keys(data).length > 0) {
                if(data[0].ACCESO == 0){
                    alertas("No tienes permisos suficientes.", "warning");
                    return;
                  }
        
                  if(typeof data === "string") {
                        data = JSON.parse(data);
                  }
        
                  if(data[0].ERROR == "ERROR"){
                    alertas(data[0].MENSAJE_ERROR, "error");
                    return;
                  }
                  
                  document.getElementById("formeqModeloInversor").reset();
                  $('select').val("").trigger('change.select2');
        
                alertas("El modelo fue registrado correctamente.", "success");
            } else {
                alertas("Error al registrar modelo.", "error");
            }
            },
            error: function(xhr, status, error) {
                alertas("Error al registrar.", "error");
                console.error('Request failed:', status, error);
            }
        });
        });


        $("#formeqModeloModFov").on("submit", async function(event) {
            if (!validarFormularios(event)) { return; }
            
                let eqMarcaID = document.getElementById("eqMarcaModFovID").value,
                eqModelo = document.getElementById("eqMarcaModeloModFov").value,
                eqChModFov = document.getElementById("eqChModeloModFov").checked,
                eqCertificacionModFov = document.getElementById("eqCertificacionModeloFov").files[0];
            
            if (eqMarcaID == "") {
                alertas("Seleccione la marca del módulo fotovoltaico.", "error");
                return;
            } else if (eqModelo == "") {
                alertas("Ingrese el modelo del módulo fotovoltaico.", "error");
                return;
            }else if (!eqChModFov) {
                alertas("Debe confirmar que el documento fue validado.", "error");
                return;
            } else if (!eqCertificacionModFov) {
                alertas("Debe adjuntar un documento en formato PDF.", "error");
                return;
            } else if (eqCertificacionModFov.type !== "application/pdf") {
                alertas("El archivo debe estar en formato PDF.", "error");
                return;
            }
            
            let formData = new FormData();
            formData.append("eqMarcaID", eqMarcaID);
            formData.append("eqModelo", eqModelo);
            formData.append("eqCertificacion", eqCertificacionModFov);
            
            $.ajax({
                url: RUTACONSULTAS + 'registrarModeloPaneles.php',
                method: 'POST',
                dataType: 'json',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    console.log(data)
                if (data && Object.keys(data).length > 0) {
                    if(data[0].ACCESO == 0){
                        alertas("No tienes permisos suficientes.", "warning");
                        return;
                      }
            
                      if(typeof data === "string") {
                            data = JSON.parse(data);
                      }
            
                      if(data[0].ERROR == "ERROR"){
                        alertas(data[0].MENSAJE_ERROR, "error");
                        return;
                      }
                      
                      document.getElementById("formeqModeloModFov").reset();
                      $('select').val("").trigger('change.select2');
            
                    alertas("El modelo fue registrado correctamente.", "success");
                } else {
                    alertas("Error al registrar modelo.", "error");
                }
                },
                error: function(xhr, status, error) {
                    alertas("Error al registrar.", "error");
                    console.error('Request failed:', status, error);
                }
            });
            });
