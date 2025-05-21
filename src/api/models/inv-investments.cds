namespace inv;

entity priceshistory{
    key DATE:   DateTime;
        OPEN:   Decimal;
        HIGH:   Decimal;
        LOW:    Decimal;
        CLOSE:  Decimal;
        VOLUME: Decimal;
   
};

entity strategies{
    key ID          :Integer; 
        NAME        : String;
        DESCRIPTION : String;
        TIME        : Time;
        RISK        : Double;
};

entity simulations {
    key idSimulation     : String;
        idUser           : String;
        idStrategy       : String;
        simulationName   : String;
        symbol           : String;
        startDate        : Date;
        endDate          : Date;
        amount           : Decimal(15,2);
        specs            : String;
        result           : Decimal(15,2);
        percentageReturn : Decimal(5,2);
        
        signals          : Composition of many {
            date      : Timestamp;
            type      : String; // Podrías usar un enum si lo deseas (buy/sell)
            price     : Decimal(15,2);
            reasoning : String;
        };

        transactions    : Composition of many {  
            date        : Timestamp;
            type        : String;
            price       : Decimal(15,2);
            reasoning   : String;
            shares      : Decimal(15,6);  
            proceeds    : Decimal(15,2);  
            stopLoss    : Decimal(15,2);  
            takeProfit  : Decimal(15,2);  
            isStopLoss  : Boolean;        
            isFinal     : Boolean;        
        };

        chart_data      : Composition of many { 
            date        : Timestamp;
            open        : Decimal(15,2);
            high        : Decimal(15,2);
            low         : Decimal(15,2);
            close       : Decimal(15,2);
            volume      : Integer;
            short_ma    : Decimal(15,2);
            long_ma     : Decimal(15,2);
        };

        DETAIL_ROW       : Composition of one {
            ACTIVED        : Boolean default true;
            DELETED        : Boolean default false;
            DETAIL_ROW_REG : Composition of many {
                CURRENT  : Boolean;
                REGDATE  : Timestamp;
                REGTIME  : Timestamp;
                REGUSER  : String;
            };
        };
}
