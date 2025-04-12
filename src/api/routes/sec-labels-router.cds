//import model
using {sec as mysec} from '../models/sec-esecurity';

@labels: 'src/api/controllers/sec-labels-controller.js'
service security @(path:'/api/sec/values') {
    //instance the entity
    entity labels as projection on mysec.labels;
    entity users as projection on mysec.users;

    //MARL: Ger Some Prices History
    //localhost:3333 /api/sec/values/getall
    @Core.Description:'get-all-prices-history'
    @path : 'getall'
    function getall()
    returns array of labels;

//     @Core.Description: 'add-one-prices-history'
//     @path: 'addone'
//     action addone(prices:priceshistory) returns array of priceshistory;

//     @Core.Description: 'update-one-prices-history'
//     @path: 'updateone'
//     action updateone(price:priceshistory) 
//     returns array of priceshistory;

//     @Core.Description: 'delete-one-prices-history'
//     @path: 'deleteone'
//     function deleteone() 
//     returns array of priceshistory;
};
