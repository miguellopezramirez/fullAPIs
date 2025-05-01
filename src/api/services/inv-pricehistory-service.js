const { update } = require('@sap/cds');
const ztpriceshistory = require('../models/mongodb/ztpriceshistory')

async function GetAllPricesHistory(req){
    try{
        const IdPrice = parseInt(req.req.query?.IdPrice);


        let pricesHistory;
        if(IdPrice  > 0){
            pricesHistory = await ztpriceshistory.findOne({ID:IdPrice});
        }else{
            pricesHistory = await ztpriceshistory.find();
        }

        pricesHistory = await ztpriceshistory.find().lean();
        return(pricesHistory)
    }catch(error){
        return FAIL(error);
    }finally{

    }
}

async function UpdateOnePricesHistory(req) {
    try {
        const IdPrice = parseInt(req.req.query?.IdPrice);
        const data = req.data; // los nuevos datos a actualizar

        if (isNaN(IdPrice)) {
            return { error: 'IdPrice inválido o no proporcionado' };
        }

        const updatedItem = await ztpriceshistory.findOneAndUpdate(
            { ID: IdPrice }, // Cambia por {_id: IdPrice} si trabajas con el ObjectId
            data,
            { new: true } // Retorna el documento ya actualizado
        );

        if (!updatedItem) {
            return { message: 'No se encontró un registro con ese IdPrice' };
        }

        return updatedItem;
    } catch (error) {
        return { error: 'Error al actualizar el historial de precios', details: error.message };
    }
}

module.exports = { 
    GetAllPricesHistory, UpdateOnePricesHistory 
};
