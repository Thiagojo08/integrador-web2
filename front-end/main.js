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
const botonAnterior = document.getElementById("botonAnterior");
const botonSiguentes = document.getElementById("botonSiguiente");
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
  const ubicacionBuscar = ubicacion.value.charAt(0).toUpperCase() + ubicacion.value.slice(1).toLowerCase();
  const departamentoBuscar = departamentos.value; // AÑADIR DEPARTAMENTO
  //console.log(busqueda, ubicacionBuscar, departamentoBuscar);

 objetoDeBusqueda = {};
  if (busqueda) objetoDeBusqueda.busqueda= busqueda;
  if (ubicacionBuscar) objetoDeBusqueda.ubicacionBuscar = ubicacionBuscar;
  if (departamentoBuscar && departamentoBuscar !== "0") {
    objetoDeBusqueda.departamentoBuscar = departamentoBuscar; // AÑADIR FILTRO DEPARTAMENTO
  }
  paginaActual = 1; //reiniciar a la primera pagina cada vez que hacemos una nueva busqueda
  recuperarIdsObrasDeArte(objetoDeBusqueda, paginaActual);
}
formulario.addEventListener("submit", manejarEnvioFormulario);

// RECUPERAR IDs CON FILTRO ACUMULATIVO
function recuperarIdsObrasDeArte(objetoDeBusqueda, paginaActual) {
  //console.log('Desde la funcion', objetoDeBusqueda);
  const propiedadesBusqueda = [];

  if (objetoDeBusqueda.busqueda) {
    propiedadesBusqueda.push("q=" + objetoDeBusqueda.busqueda);
  }
  if (objetoDeBusqueda.ubicacion) {
    propiedadesBusqueda.push("geoLocation=" + objetoDeBusqueda.ubicacion);
  }
  if (objetoDeBusqueda.departamento) {
    propiedadesBusqueda.push("departmentIds=" + objetoDeBusqueda.departamento); 
  }

  const url = `${urlBase}search?${propiedadesBusqueda.join("&")}`;
  console.log("URL generada para la busqueda:", url);//Agrega esto

 // const url = urlBase + "search?" + propiedadesBusqueda.join("&");

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      if (
        data.objectIDs && Array.isArray(data.objectIDs) && data.objectIDs.length > 0) {
        paginasTotales = Math.ceil(data.objectIDs.length / 20); //calculo total de paginas
        actualizarBotonesdePaginacion();

        galeria.innerHTML = "";

        const inicio = (paginaActual - 1)*20;
        const fin = inicio + 20;
        const ids = data.objectIDs.slice(inicio,fin);
        console.log(ids);

        ids.forEach((id) => {
          fetch(`${urlBase}objects/${id}`)
            .then((res) => res.json())
            .then((obraDeArte) => {
              console.log(obraDeArte);
              renderizarTarjetas(obraDeArte);// renderiza los objetos
            });
        });
      } else {
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
  tarjetaContainer.setAttribute("class", "card");

  const imagen1 = document.createElement("div");
  imagen1.setAttribute("class", "image");

  const contenedor = document.createElement("div");
  contenedor.setAttribute("class", "content");

  const imagen = document.createElement("img");
  imagen.setAttribute("class", "imagen");
  imagen.setAttribute("src", obraDeArte.primaryImage ? obraDeArte.primaryImage: "imagenes/vacia.jpg"); //ingresar una imagen provisoria
  imagen.title = "Fecha: " + obraDeArte.objectDate || "Fecha no disponible";

  const titulo = document.createElement("span");
  titulo.setAttribute("class", "titulo");
  titulo.textContent = obraDeArte.title || "Titulo no disponible";

  const cultura = document.createElement("p");
  cultura.setAttribute("class", "desc");
  cultura.textContent = obraDeArte.culture || "Cultura no disponible";

  const dinastia = document.createElement("p");
  dinastia.setAttribute("class", "desc");
  dinastia.textContent = obraDeArte.dynasty || "Dinastia no disponible";

  //traduccion de el texto antes de ingresarlo a las cards

  tarjetaContainer.appendChild(titulo);
  tarjetaContainer.appendChild(imagen);
  tarjetaContainer.appendChild(cultura);
  tarjetaContainer.appendChild(dinastia);

  //si hay imagenes adicionales
  if (obraDeArte.additionalImages && obraDeArte.additionalImages.length > 0) {
    const verMasImgenes = document.createElement("button");
    verMasImgenes.textContent = "Ver más imágenes";
    verMasImgenes.addEventListener("click", () => {
      window.location.href = `ver-mas.html?id=${obraDeArte.objectID}`;
    });
    tarjetaContainer.appendChild(verMasImgenes);
  }

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
