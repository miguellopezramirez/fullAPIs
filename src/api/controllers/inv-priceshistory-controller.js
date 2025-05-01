const { GetAllPricesHistory, UpdateOnePricesHistory } = require('../services/inv-pricehistory-service');

class InvestionsClass extends cds.ApplicationService {

    async init() {

        this.on('getall', async (req) => {
            return GetAllPricesHistory(req);
        });

        this.on('updateone', async (req) => {
            return UpdateOnePricesHistory(req);
        });

        return await super.init();
    }
};

module.exports = InvestionsClass;