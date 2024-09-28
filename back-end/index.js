const express = require("express");
const cors = require("cors");
const fetch = require('node-fetch');
const app = express();
const puerto =  process.env.PORT || 3050;
const translate = require("node-google-translate-skidz");

app.use(cors());
app.use(express.json());
app.use(express.static("../front-end"));

// Rutas para obtener datos de la API del museo
app.get("/api/departments", async (req, res) => {
  try {
    const response = await fetch(
      "https://collectionapi.metmuseum.org/public/collection/v1/departments"
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener departamentos:", error.message);
    res.status(500).json({ error: "Error al obtener departamentos" });
  }
});

// Rutas para buscar objetos según parámetros
app.get("/api/search", async (req, res) => {
  const { q, geoLocation, departmentIds, page } = req.query;
  const urlBase =
    "https://collectionapi.metmuseum.org/public/collection/v1/search?";

  const propiedadesBusqueda = [];
  if (q) propiedadesBusqueda.push(`q=${encodeURIComponent(q)}`);
  if (geoLocation)
    propiedadesBusqueda.push(`geoLocation=${encodeURIComponent(geoLocation)}`);
  if (departmentIds)
    propiedadesBusqueda.push(
      `departmentIds=${encodeURIComponent(departmentIds)}`
    );

  const url = urlBase + propiedadesBusqueda.join("&");
  console.log("resultados", url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Error en la respuesta de la API: ${response.statusText}`
      );
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error al buscar objetos:", error.message);
    res
      .status(500)
      .json({ error: "Error al buscar objetos en la API del museo" });
  }
});

app.get("/api/objects/:id", async (req, res) => {
  const { id } = req.params;
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Error en la respuesta de la API: ${response.statusText}`
      );
    }
    const data = await response.json();
    //tradurcir texto de cultura, titulo y dinastia
    const [tituloTraducido, culturaTraducida, dinastiaTraducida] =
      await Promise.all([
        traducir(data.title),
        traducir(data.culture),
        traducir(data.dynasty),
      ]);

    const objetoTraducido = {
      ...data,
      title: tituloTraducido,
      culture: culturaTraducida,
      dynasty: dinastiaTraducida,
    };

    res.json(objetoTraducido);
  } catch (error) {
    console.error("Error al buscar objetos:", error.message);
    res
      .status(500)
      .json({ error: "Error al buscar objetos en la API del museo" });
  }
});

//ruta para traducir texto de dinastia, titulo y cultura de los objetos extraidos desde la api

app.post("/api/translate", async (req, res) => {
  const { text, targetLang } = req.body;
  try {
    const translatedText = await traducir(text, targetLang);
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: "Error al traducir el texto" });
  }
});

async function traducir(texto, targetLang = "es") {
  if (!texto) {
    return Promise.resolve("");
  }
  return new Promise((resolve, reject) => {
    translate(
      {
        text: texto,
        source: "en",
        target: targetLang,
      },
      (resultado) => {
        if (resultado && resultado.translation) {
          resolve(resultado.translation);
        } else {
          reject(new Error("Error al traducir el texto"));
        }
      }
    );
  });
}

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
