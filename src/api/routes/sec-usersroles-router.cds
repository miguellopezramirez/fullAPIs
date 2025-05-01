using { sec as myur } from '../models/sec-usersroles';

@impl: 'src/api/controllers/sec-usersroles-controller.js'
service UsersRolesService @(path:'/api/sec/usersroles') {
    // Entidades básicas
    entity Users as projection on myur.ZTUSERS;
    entity Roles as projection on myur.ZTROLES;

    // DELETE universal (para usuarios o roles)
    @Core.Description: 'Elimina usuario o rol por ID'
    @path: 'delete'
    action delete(
        type: String enum { user; role }, // Obligatorio: 'user' o 'role'
        id: String                        // USERID o ROLEID
    ) returns {
        success: Boolean;
        message: String;
    };

    // PATCH USERS
    @Core.Description: 'Actualiza usuario'
    @path: 'update'
    action update( 
        type: String enum { user; role },
        user: Users, 
        role: Roles,       
    ) returns {
        success: Boolean;
        modifiedCount: Integer;
    };

    // POST USERS / ROLES
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