//1.-importacion de las librerias
const cds = require ('@sap/cds');

//2.-importar el servicio
// aun no esta creado el servicio

//3.- estructura princiapl  de la clas de contorller


class InvestionsClass extends cds.ApplicationService{

    //4.-iniciiarlizarlo de manera asincrona
    async init (){

        this.on('getall', async (req)=> {
            
            //llamada al metodo de servicio y retorna el resultado de la ruta
           return GetAllPricesHistory(req);
        });

        return await super.init();
    };


};

module.exports = InvestionsClass;