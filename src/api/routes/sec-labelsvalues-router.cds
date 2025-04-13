// src/routes/sec-labelsvalues-router.cds

using {sec as mysec} from '../models/sec-esecurity';  // Importar el modelo que contiene las entidades 'labels' y 'values'

@impl: 'src/api/controllers/sec-labelsvalues-controller.js'  // Implementación del controlador que maneja las operaciones de la API
service catalogos @(path:'/api/catalogos') {

    // Proyección de las entidades labels y values
    entity labels as projection on mysec.labels;
    entity values as projection on mysec.values;

    // Ruta para obtener todos los catálogos
    @Core.Description: 'Get all labels'
    @path: 'getall'
    function getAllLabels() 
    returns array of labels;

    // Ruta para crear un nuevo catálogo (POST)
    @Core.Description: 'Create a new label'
    @path: 'create'
    action createLabel(label: labels) 
    returns array of labels;

    // Ruta para agregar un valor a un catálogo
    @Core.Description: 'Add a value to a label'
    @path: 'addvalue'
    action addValueToLabel(label: labels, value: values) 
    returns array of values;

    // Ruta para actualizar un catálogo y un valor
    @Core.Description: 'Update a label and value'
    @path: 'update'
    action updateLabel(label: labels, value: values)
    returns array of labels;

    // Ruta para eliminar un catálogo o un valor
    @Core.Description: 'Delete a label or value'
    @path: 'delete'
    function deleteLabelOrValue() 
    returns array of labels;
};
