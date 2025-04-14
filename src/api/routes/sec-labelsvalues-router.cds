//import model
using {sec as mysec} from '../models/sec-esecurity';

@impl: 'src/api/controllers/sec-labelsvalues-controller.js'
service security @(path:'/api/sec/values') {
    //instance the entity
    entity labels as projection on mysec.labels;
    entity values as projection on mysec.values;

    //MARL: Ger Some Prices History
    //localhost:3333 /api/sec/values/getalllabel
    @Core.Description:'get all labels'
    @path : 'getall'
    function getall()
    returns array of labels;

//     @Core.Description: 'add-one-prices-history'
//     @path: 'addone'
//     action addone(prices:priceshistory) returns array of priceshistory;

    @Core.Description: 'update-one-labels-values'
    @path: 'updatevalues'
    action updatevalues(label:labels, value:values) 
    returns array of labels;

    @Core.Description: 'delete-one-labels-values'
    @path: 'deletevalues'
    function deletevalues() 
    returns array of labels;
};
