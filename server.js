// import configX from './src/config/dotenvXConfig'; 


const express = require ("express");
const cds = require("@sap/cds");
const cors = require("cors");
const router = express.Router();
// Importa mongoose usando require (ya que estás usando CommonJS)
const mongoose =  require('./src/config/connectToMongoDB.config').mongoose; 
const docEnvX = require("./src/config/dotenvXConfig")



module.exports = async (o) =>{
    try{
        let app = express();
        app.express = express;
        app.use(express.json({limit: "500kb"}));
        app.use(cors());
        app.use('/api', router);
        
        app.get('/', (req, res) => {
        res.end(`SAP CDS está en ejecución...${req.url}`);});

        o.app = app;
        o.app.httpServer = await cds.server(o);
        return o.app.httpServer;
    }
    catch(error){
        console.error('Error strating server:',error);
        process.exit(1);
    }
};