const ztlabels = require('../models/mongodb/ztlabels'); // Importar el modelo ZTLabels
const ztvalues = require('../models/mongodb/ztvalues');   // Importar el modelo ZTValues

// Crear un nuevo catálogo (ZTLabels)
async function createCatalog(req) {
    const { body } = req;
    console.log("[DEBUG] Body recibido:", body);

    try {
        // Validar los datos del cuerpo de la solicitud
        const { LABELID, DESCRIPTION, TYPE } = body;
        if (!LABELID || !DESCRIPTION || !TYPE) {
            throw new Error("Faltan datos obligatorios (LABELID, DESCRIPTION, TYPE)");
        }

        // Verificar si el catálogo con LABELID ya existe
        const existingCatalog = await ztlabels.findOne({ LABELID });
        if (existingCatalog) {
            throw new Error(`El catálogo con LABELID ${LABELID} ya existe.`);
        }

        // Crear el nuevo catálogo
        const newCatalog = new ztlabels({ LABELID, DESCRIPTION, TYPE });
        await newCatalog.save();

        return { success: true, message: `Catálogo ${LABELID} creado exitosamente.` };

    } catch (error) {
        console.error("[ERROR] createCatalog:", error.message);
        throw error;
    }
}

// Crear un nuevo valor para un catálogo (ZTValues)
async function createCatalogValue(req) {
    const { body } = req;
    console.log("[DEBUG] Body recibido:", body);

    try {
        const { LABELID, VALUEID, VALUE_DESCRIPTION } = body;
        if (!LABELID || !VALUEID || !VALUE_DESCRIPTION) {
            throw new Error("Faltan datos obligatorios (LABELID, VALUEID, VALUE_DESCRIPTION)");
        }

        // Verificar si el valor ya existe en el catálogo
        const existingValue = await ztvalues.findOne({ LABELID, VALUEID });
        if (existingValue) {
            throw new Error(`El valor con VALUEID ${VALUEID} ya existe para el catálogo ${LABELID}.`);
        }

        // Crear el nuevo valor para el catálogo
        const newValue = new ztvalues({ LABELID, VALUEID, VALUE_DESCRIPTION });
        await newValue.save();

        return { success: true, message: `Valor ${VALUEID} creado exitosamente en el catálogo ${LABELID}.` };

    } catch (error) {
        console.error("[ERROR] createCatalogValue:", error.message);
        throw error;
    }
}

module.exports = { createCatalog, createCatalogValue };
