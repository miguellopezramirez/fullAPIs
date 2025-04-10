//1.-importacion de las librerias
const cds = require ('@sap/cds');

//2.-importar el servicio
// aun no esta creado el servicio
const servicio = require('../services/inv-priceshistory-service')
//3.- estructura princiapl  de la clas de contorller


class InvestionsClass extends cds.ApplicationService{

    //4.-iniciiarlizarlo de manera asincrona
    async init (){

        this.on('getall', async (req)=> {
            
            //llamada al metodo de servicio y retorna el resultado de la ruta
           return servicio.GetAllPricesHistory(req);
        });

        this.on("addone", async (req)=>{
            return servicio.AddOnePricesHistory(req);
        })

        this.on("updateone", async (req)=>{
            return servicio.UpdateOnePricesHistory(req);
        })

        this.on("deleteone", async (req)=>{
            return servicio.DeleteOnePricesHistory(req);
        })


        return await super.init();
    };


};

module.exports = InvestionsClass;