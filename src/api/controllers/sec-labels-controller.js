//1.-importacion de las librerias
const cds = require ('@sap/cds');

//2.-importar el servicio
// aun no esta creado el servicio
const servicio = require('../services/sec-labels-services')
//3.- estructura princiapl  de la clas de contorller


class InvestionsClass extends cds.ApplicationService{

    //4.-iniciiarlizarlo de manera asincrona
    async init (){

        this.on('getalllabel', async (req)=> {
            
            //llamada al metodo de servicio y retorna el resultado de la ruta
            console.log("a ver si pasa")
           return servicio.GetAllLablesValues(req);
        });

        // this.on("addone", async (req)=>{
        //     return servicio.AddOnePricesHistory(req);
        // })

        // this.on("updateone", async (req)=>{
        //     return servicio.UpdateOnePricesHistory(req);
        // })

        // this.on("deleteone", async (req)=>{
        //     return servicio.DeleteOnePricesHistory(req);
        // })


        return await super.init();
    };


};

module.exports = InvestionsClass;