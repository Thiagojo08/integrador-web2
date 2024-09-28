const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (id) {
  fetch(`http://localhost:3050/api/objects/${id}`)
    .then((res) => res.json())
    .then((data) => {
      const contenedor = document.getElementById('imagenesAdicionales');
      data.additionalImages.forEach((imageUrl) => {
        const img = document.createElement("img");
        img.setAttribute("class", "imagenAdicional");
        img.src = imageUrl;
        img.classList.add("imagen-adicional");
        contenedor.appendChild(img);
      });
    })
    .catch((error) => console.error("Error al cargar imágenes adicionales:", error));
}
