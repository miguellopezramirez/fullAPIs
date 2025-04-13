const catalogosService = require('../services/sec-catalogos-service');

// Crear un catálogo
async function createCatalog(req, res) {
    try {
        const result = await catalogosService.createCatalog(req);
        res.status(201).json(result); // Enviar respuesta de éxito con código 201
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// Crear un valor para un catálogo
async function createCatalogValue(req, res) {
    try {
        const result = await catalogosService.createCatalogValue(req);
        res.status(201).json(result); // Enviar respuesta de éxito con código 201
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = { createCatalog, createCatalogValue };
