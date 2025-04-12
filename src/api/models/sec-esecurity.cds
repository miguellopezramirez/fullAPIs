namespace sec;

entity users{
    key USERID :String;
        USERNAME : String;
        PASSWORD : String;
}

entity labels {
    key LABELID    : String;
    COMPANYID      : String;
    CEDIID         : String;
    LABEL          : String;
    INDEX          : String;
    COLLECTION     : String;
    SECTION        : String;
    SEQUENCE       : Integer;
    IMAGE          : String;
    DESCRIPTION    : String;
    DETAIL_ROW     : Composition of one {
        ACTIVED   : Boolean default true;
        DELETED   : Boolean default false;
        DETAIL_ROW_REG : Composition of many {
            CURRENT  : Boolean;
            REGDATE : Timestamp;
            REGTIME : Timestamp;
            REGUSER : String;
        };
    };
}
