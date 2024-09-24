//DOM
const departamentosSelect = document.getElementById("departamentos");
const formulario = document.getElementById("formulario");
const terminoAbuscar = document.getElementById("terminoAbuscar");
const ubicacion = document.getElementById("ubicacion");
const departamentos = document.getElementById("departamentos");
const galeria = document.getElementById("galeria");

//VARIABLES
const urlBase = "http://localhost:3050/api/";
let paginaActual = 1;
let paginasTotales = 0;
let objetoDeBusqueda = {};
const botonAnterior = document.getElementById('botonAnterior')
const botonSiguentes = document.getElementById('botonSiguiente');
const inputNumPaginas = document.querySelector('input[type="NumPagina"]');

llenarSelect();
//FUNCIONES
function llenarSelect() {
  const departamentos = fetch(`${urlBase}departments`)
    .then((respuesta) => respuesta.json())
    .then((data) => {
      console.log(data);

      //crea la opcion de todos los departamentos dentro del select
      const todosOption = document.createElement("option");
      todosOption.setAttribute("value", "0");
      todosOption.textContent = "TODOS LOS DEPARTAMENTOS";
      departamentosSelect.appendChild(todosOption);

      data.departments.forEach((departamento) => {
        const miOpcion = document.createElement("option");
        miOpcion.setAttribute("value", departamento.departmentId);
        miOpcion.textContent = departamento.displayName;

        departamentosSelect.appendChild(miOpcion);
      });
    });
}

// MODIFICACIÓN EN LA FUNCION DEL FORMULARIO
function manejarEnvioFormulario(evento) {
  evento.preventDefault();
  const busqueda = terminoAbuscar.value;
  const ubicacionBuscar = ubicacion.value;
  const departamentoBuscar = departamentos.value; // AÑADIR DEPARTAMENTO
  //console.log(busqueda, ubicacionBuscar, departamentoBuscar);

  const objetoDeBusqueda = {};
  if (busqueda) objetoDeBusqueda.busqueda = busqueda;
  if (ubicacionBuscar) objetoDeBusqueda.ubicacion = ubicacionBuscar;
  if (departamentoBuscar && departamentoBuscar !== "0") {
    objetoDeBusqueda.departamento = departamentoBuscar; // AÑADIR FILTRO DEPARTAMENTO
  }
  paginaActual = 1; //reiniciar a la primera pagina cada vez que hacemos una nueva busqueda
  recuperarIdsObrasDeArte(objetoDeBusqueda, paginaActual);
}
formulario.addEventListener("submit", manejarEnvioFormulario);

// RECUPERAR IDs CON FILTRO ACUMULATIVO
function recuperarIdsObrasDeArte(objetoDeBusqueda) {
  //console.log('Desde la funcion', objetoDeBusqueda);
  const propiedadesBusqueda = [];

  if (objetoDeBusqueda.busqueda) {
    propiedadesBusqueda.push("q=" + objetoDeBusqueda.busqueda);
  }
  if (objetoDeBusqueda.ubicacion) {
    propiedadesBusqueda.push("geoLocation=" + objetoDeBusqueda.ubicacion);
  }
  if (objetoDeBusqueda.departamento) {
    propiedadesBusqueda.push("departmentIds=" + objetoDeBusqueda.departamento); //agrega filtro de departamento
  }
  propiedadesBusqueda.push("page=" + paginaActual);

  const url = urlBase + "search?" + propiedadesBusqueda.join("&");

  fetch(url)
    .then((res) => res.json())
    .then((data) => {

      console.log(data);

      if(data.objectIDs && Array.isArray(data.objectIDs) && data.objectIDs.length > 0){
        paginasTotales = Math.ceil(data.total / 20); //calculo total de paginas
        actualizarBotonesdePaginacion();

        galeria.innerHTML = "";

        const ids = data.objectIDs.slice(0, 20); //limitar a 20 resultados
        console.log(ids);

        ids.forEach((id) => {
        fetch(`${urlBase}objects/${id}`)
          .then((res) => {
          //    if(!res.ok){
          //      throw new Error(`Error al obtener el objeto con ID ${id}:${res.status}`);
          //  }
          return res.json();
        })
          .then((obraDeArte) => {
            console.log(obraDeArte);
            renderizarTarjetas(obraDeArte);
          })
          
        });
          } else{
            console.error("No se encontraron objetos para los filtros aplicados");
     }    
  })
  .catch((error) => {
    console.error("Error en la búsqueda de objetos:", error);
  });
}

function renderizarTarjetas(obraDeArte) {
  //renderizar tarjetas

  const tarjetaContainer = document.createElement("div");
  tarjetaContainer.setAttribute("class", "constenedor-tarjeta");

  const imagen = document.createElement("img");
  imagen.setAttribute("class", "imagen");
  imagen.setAttribute("src", obraDeArte.primaryImage);

  const titulo = document.createElement("h5");
  titulo.textContent = obraDeArte.title;
  //traducir datos antes de mostrarlos(ejemplo de funcion de traduccion)
  // traducirAlEspañol(obraDeArte.title,(tituloTraducido)=>{
  //     titulo.textContent = tituloTraducido;
  //});

  tarjetaContainer.appendChild(imagen);
  tarjetaContainer.appendChild(titulo);

  galeria.appendChild(tarjetaContainer);
}

function actualizarBotonesdePaginacion() {
  //actualiza el numero de paginas del input
  inputNumPaginas.value = paginaActual;

  //boton anterior: deshabilitado si estamos en la primera pagina
  botonAnterior.disabled = paginaActual === 1;

  //boton siguiete : deshabilitado si estamos en la ultima pagina
  botonSiguentes.disabled = paginaActual === paginasTotales;
}
//agrega evento a los botones de paginacion

botonAnterior.addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;
    recuperarIdsObrasDeArte(objetoDeBusqueda, paginaActual);
  }
});

botonSiguentes.addEventListener("click", () => {
  if (paginaActual < paginasTotales) {
    paginaActual++;
    recuperarIdsObrasDeArte(objetoDeBusqueda, paginaActual);
  }
});

// exports = {
//   llenarSelect,
//   recuperarIdsObrasDeArte,
//   renderizarTarjetas,
//   actualizarBotonesdePaginacion,
// };
