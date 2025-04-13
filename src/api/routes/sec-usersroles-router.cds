using { sec as myur } from '../models/sec-usersroles';

@impl: 'src/api/controllers/sec-usersroles-controller.js'
service UsersRolesService @(path: '/api/usersroles') {

    // Entidades
    entity Users as projection on myur.ZTUSERS;
    entity Roles as projection on myur.ZTROLES;

    // PATCH - Actualización parcial
    @Core.Description: 'Actualiza un usuario o rol (borrado lógico incluido)'
    @path: 'patchUserOrRole'
    action patchUserOrRole(
        data: Users  
    ) returns {
        success: Boolean;
        modifiedCount: Integer;
    };

    // DELETE - Borrado físico
    @Core.Description: 'Elimina físicamente un usuario o rol'
    @path: 'deleteUserOrRole'
    action deleteUserOrRole(
        data: Users 
    ) returns {
        success: Boolean;
        message: String;
    };

}