using { sec as myur } from '../models/sec-usersroles';

@impl: 'src/api/controllers/sec-usersroles-controller.js'

service UsersRolesService @(path:'/api/sec/usersroles') {

    // Entidades básicas
    entity Users as projection on myur.ZTUSERS;
    entity Roles as projection on myur.ZTROLES;
    entity Role  as projection on myur.ZTROLES;

    //CRUD COMPLETO DE ROLES, inneccesario ya juntarlo con Usuarios ᶻ 𝘇 𐰁  
    @Core.Description: 'CRUD de Roles'
    @path            : 'rolesCRUD'
    action rolesCRUD()
    returns array of Roles;

    // GET ALL ROLES
    // http://localhost:3033/api/sec/usersroles/rolesCRUD?procedure=get&type=all

    // GET ALL ROLES WITH USERS
    // http://localhost:3033/api/sec/usersroles/rolesCRUD?procedure=get&type=users

    // POST ROLE
    // http://localhost:3033/api/sec/usersroles/rolesCRUD?procedure=post

    // DELETE LOGIC
    // http://localhost:3033/api/sec/usersroles/rolesCRUD?procedure=delete&type=logic&roleid=IdSecurityPrUEBA3

    // BORRADO FISICO
    // http://localhost:3033/api/sec/usersroles/rolesCRUD?procedure=delete&type=hard&roleid=IdSecurityPrUEBA3

    // ACTUALIZAR
    // http://localhost:3033/api/sec/usersroles/rolesCRUD?procedure=put&roleid=IdSecurityPrUEBA3



    //Sugiero hacer lo mismo para Users, algo asi:
    //    @Core.Description: 'crud-for-users'
    //    @path: 'usersCRUD'
    //    action usersCRUD()
    //    returns array of users;

    //Y se evita tener todo lo de abajo, la logica ya la llevara el servicio

    @Core.Description: 'CRUD de Usuarios'
    @path            : 'usersCRUD'
    action usersCRUD()
    returns array of Users;


// todo con post viva sap cds 
// GET ALL USERS:
// GET /api/sec/usersroles/usersCRUD?procedure=get&type=all
// GET ONE USER:
// GET /api/sec/usersroles/usersCRUD?procedure=get&type=one&userid=IdUserX
// POST USER:
// POST /api/sec/usersroles/usersCRUD?procedure=post
// PUT USER:
// PUT /api/sec/usersroles/usersCRUD?procedure=put&userid=IdUserX
// DELETE LÓGICO:
// DELETE /api/sec/usersroles/usersCRUD?procedure=delete&type=logic&userid=IdUserX
// DELETE FÍSICO:
// DELETE /api/sec/usersroles/usersCRUD?procedure=delete&type=hard&userid=IdUserX


//acciones auxiliar para users
    @Core.Description: 'Obtener todas las compañías'
    @path: 'getAllCompanies'
    action getAllCompanies() returns array of Users;

    @Core.Description: 'Obtener departamentos por compañía'
    @path: 'getDepartmentsByCompany'
    action getDepartmentsByCompany(companyIdStr: String) returns array of Users;

  @Core.Description: 'Obtener CEDIS y departamentos por compañía'
    @path: 'getCedisAndDepartmentsByCompany'
    action getCedisAndDepartmentsByCompany(companyIdStr: String) returns Users;
//este es el bueno, el que trae CEDIS y departamentos por compañia
  
    @Core.Description: 'Obtener compañías con CEDIs y departamentos'
    @path: 'getCompaniesWithCedisAndDepartments'
    action getCompaniesWithCedisAndDepartments() returns array of Users;
}




