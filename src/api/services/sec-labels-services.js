const ztlabels = require('../models/mongodb/ztlabels')
async function GetAllLablesValues(req) {
    try {
        let labels;
        labels = await ztlabels.find().lean();
        console.log(labels);
        return (labels);
    } catch (error) {
        throw error;
    }
}

async function getLabelValues(req) {
    try {
        ztlabels = await ztlabels.find().lean();
        return (ztlabels);
    } catch (error) {
        throw error;
    }
}

module.exports = {GetAllLablesValues}