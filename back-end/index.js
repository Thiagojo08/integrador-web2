const express = require('express');
const cors = require('cors');
const app = express();
const puerto = 3050; // Puedes cambiar el puerto según tus necesidades

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../front-end')); // Sirve archivos estáticos desde front-end

// Rutas para obtener datos de la API del museo
app.get('/api/departments', async (req, res) => {
    const response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments');
    const data = await response.json();
    res.json(data);
});

// Rutas para buscar objetos según parámetros
app.get('/api/search', async (req, res) => {
    const { q, geoLocation, departmentIds, page } = req.query;
    const urlBase = 'https://collectionapi.metmuseum.org/public/collection/v1/search?';

    const propiedadesBusqueda = [];
    if (q) propiedadesBusqueda.push(`q=${encodeURIComponent(q)}`);
    if (geoLocation) propiedadesBusqueda.push(`geoLocation=${encodeURIComponent(geoLocation)}`);
    if (departmentIds) propiedadesBusqueda.push(`departmentIds=${encodeURIComponent(departmentIds)}`);
    if (page) propiedadesBusqueda.push(`page=${encodeURIComponent(page)}`);

    const url = urlBase + propiedadesBusqueda.join('&');
    console.log('resultados',url);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error al buscar objetos:', error.message);
        res.status(500).json({ error: 'Error al buscar objetos en la API del museo' });
    }
});

app.get('/api/objects/:id', async (req, res) => {
    const { id } = req.params;
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error al buscar objetos:', error.message);
        res.status(500).json({ error: 'Error al buscar objetos en la API del museo' });
    }
});

app.listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
