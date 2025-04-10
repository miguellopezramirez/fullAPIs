//import model
using {inv as myph} from '../models/inv-inversions';

@impl: 'src/api/controllers/inv-priceshistory-controller.js'
service PricesHistoryRoute @(path:'/api/inv') {
    //instance the entity
    entity priceshistory as projection on myph.priceshistory;
    entity strategies as projection on myph.strategies;

    //MARL: Ger Some Prices History
    //localhost:3333 /api/priceshistory/getall
    @Core.Description:'get-all-prices-history'
    @path : 'getall'
    function getall()
    returns array of priceshistory;

    @Core.Description: 'add-one-prices-history'
    @path: 'addone'
    action addone(prices:priceshistory) returns array of priceshistory;

    @Core.Description: 'update-one-prices-history'
    @path: 'updateone'
    action updateone(price:priceshistory) 
    returns array of priceshistory;

    @Core.Description: 'delete-one-prices-history'
    @path: 'deleteone'
    function deleteone() 
    returns array of priceshistory;
};
