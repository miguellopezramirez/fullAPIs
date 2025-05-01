//import { type } from '@sap/cds';

const mongoose = require('mongoose')
const { Decimal128 } = mongoose.Schema.Types;

const priceshistorySchema = new mongoose.Schema({
    ID      : {type : Number, requierd  : true},
    DATE    : {type : Date},
    OPEN    : {type : Decimal128},
    HIGH    : {type : Decimal128},
    LOW     : {type : Decimal128},
    CLOSE   : {type : Decimal128},
    VOLUME  : {type : Decimal128}
});

module.exports = mongoose.model(
    'ZTPRICESHISTORY',
    priceshistorySchema,
    'ZTPRICESHISTORY'
);