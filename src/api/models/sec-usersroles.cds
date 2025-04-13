namespace sec;

entity ZTUSERS {
  key USERID      : String;
      PASSWORD    : String;
      USERNAME    : String;
      ALIAS       : String;
      FIRSTNAME   : String;
      LASTNAME    : String;
      BIRTHDAYDATE: String;
      COMPANYID   : Integer;
      COMPANYNAME : String;
      COMPANYALIAS: String;
      CEDIID      : String;
      EMPLOYEEID  : String;
      EMAIL       : String;
      PHONENUMBER : String;
      EXTENSION   : String;
      DEPARTMENT  : String;
      FUNCTION    : String;
      STREET      : String;
      POSTALCODE  : Integer;
      CITY        : String;
      REGION      : String;
      STATE       : String;
      COUNTRY     : String;
      AVATAR      : String;
      ROLES       : array of {
        ROLEID    : String;
        ROLEIDSAP : String;
      };
      DETAIL_ROW  : {
        ACTIVED   : Boolean;
        DELETED   : Boolean;
        DETAIL_ROW_REG: array of {
          CURRENT : Boolean;
          REGDATE : DateTime;
          REGTIME : Time;
          REGUSER : String;
        };
      };
}

entity ZTROLES {
  key ROLEID      : String;
      ROLENAME    : String;
      DESCRIPTION : String;
      PRIVILEGES  : array of {
        PROCESSID : String;
        PRIVILEGEID : array of String;
      };
      DETAIL_ROW  : {
        ACTIVED   : Boolean;
        DELETED   : Boolean;
        DETAIL_ROW_REG: array of {
          CURRENT : Boolean;
          REGDATE : DateTime;
          REGTIME : Time;
          REGUSER : String;
        };
      };
}