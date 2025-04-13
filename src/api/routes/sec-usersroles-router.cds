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
    @path: 'update-user'
    action updateuser(
        users: Users       
    ) returns {
        success: Boolean;
        modifiedCount: Integer;
    };

    // PATCH ROLES
    @Core.Description: 'Actualiza usuario o rol'
    @path: 'update-rol'
    action updaterol(
        roles: Roles       
    ) returns {
        success: Boolean;
        modifiedCount: Integer;
    };
}