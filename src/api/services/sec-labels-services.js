const ztlabels = require('../models/mongodb/ztlabels')
const ztvalues = require('../models/mongodb/ztvalues')
async function GetAllLablesValues(req) {
    try {
        const type = parseInt(req.req.query?.type);

        if (type == 1) {
            
            return getLabels(req);
        } else if (type == 2) {
            
            return getValues(req)
        } else {
            // Podés personalizar esta parte según tu API
            return { message: "Parámetro 'type' no válido. Usa 1 para labels o 2 para values." };
        }
    } catch (error) {
        throw error;
    }
}

async function getLabels(req) {
    try {
        const labels = await ztlabels.find().lean();
        return (labels);
    } catch (error) {
        throw error;
    }
}

async function getValues(req) {
    try {
        const values = await ztvalues.find().lean();
        return (values);
    } catch (error) {
        throw error;
    }
}

module.exports = {GetAllLablesValues}