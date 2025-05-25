using {inv as myph} from '../models/inv-investments';

@impl: 'src/api/controllers/inv-investments-controller.js'
service PricesHistoryRoute @(path:'/api/inv') {
    entity priceshistory as projection on myph.priceshistory;
    entity simulations as projection on myph.SIMULATION;
    
    @Core.Description:'get-all-prices-history'
    @path : 'pricehistory'
    function pricehistory()
    returns array of priceshistory;

    @Core.Description:'Simulate MA Crossover strategy'
    @path: 'simulation'
    action simulation(SIMULATION: simulations) returns array of simulations;

    @Core.Description:'get-all-strategys'
    @path : 'strategy'
    function strategy()
    returns array of String;

    @Core.Description:'get-all-simulations'
    @path : 'getSimulation'	
    action getSimulation(idUser: String, id: String)
    returns array of {};

    @Core.Description:'delete simulation by id and user'
    @path : 'deleteSimulation'
    action deleteSimulation(
        idUser : String
    )
    returns String;

    //updateSimulation
    @Core.Description: 'Actualizar nombre de simulación por ID'
    @path: 'updatesimulation'
    action updatesimulation(
        id: String,
        simulationName: String
    ) returns String;


    @Core.Description: 'get-all-symbols'
    @path: 'symbols'
    function symbols()
    returns array of String;

    @Core.Description:'Buscar empresas por símbolo o nombre'
    @path: 'company'
    function company(keyword: String) returns array of String;
    
    @Core.Description:'Calcular SMA (Simple Moving Averages) para SHORT y LONG'
    @path: 'calculateSMA'
    action calculateSMA(
        symbol: String,
        startDate: String,
        endDate: String,
        specs: String
    ) returns array of {
        date: DateTime;
        close: Decimal;
        short: Decimal;
        long: Decimal
    };
};
