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

    // Ruta para obtener todos los usuarios
    @Core.Description: 'Obtiene todos los usuarios'
    @path: 'fetchAllUsers'
    function fetchAll()
    returns array of Users;


    // Ruta para obtener un usuario por ID (aunque sea opcional)
    @Core.Description: 'Obtiene un usuario por ID'
    @path: 'getUserById'
    function getUserById(USERID: String)
    returns Users;


    // DELETE universal (usuario o rol)
    @Core.Description: 'Elimina usuario o Rol por ID'
    @Path: 'delete'
    action delete(
        type: String enum { user; role },
        id: String,
        mode: String enum { logical; physical } // default lógico
    ) returns {
        success: Boolean;
        message: String;
    };

    // PATCH universal
    @Core.Description: 'Actualiza usuario o rol'
    @path: 'update'
    action update( 
        type: String enum { user; role },
        user: Users, 
        role: Roles
    ) returns {
        success: Boolean;
        modifiedCount: Integer;
    };

    // POST universal
    @Core.Description: 'Crea un nuevo usuario o rol'
    @path: 'create'
    action create(
        type: String enum { user; role },
        user: Users,
        role: Roles
    ) returns {
        success: Boolean;
        USERID: String;
        ROLEID: String;
    };
}




