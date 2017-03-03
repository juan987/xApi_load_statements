//prueba de aggregate en la shell para nombres

db.statements.aggregate([
                        { $match:{
                                    "actor.name":"roberto" 
                                }
                        },
                        { $group: {
                                    _id: "$actor.name",
                                    num: { $sum: 1 }
                        } },
                        { $sort: { _id: 1 } }
                    ])

//prueba de aggregate con padre
db.statements.aggregate([
    { $group: {
        _id: {miObjeto:"$target.id", parent:"$context.contextActivities.parent.id"},
        num: { $sum: 1 }
    } },
    { $sort: { _id: 1 } },
    {
        $project:{
            _id:0, objeto:"$_id.miObjeto" , parent:"$_id.parent"
        }
    },
])

//prueba de aggregate con parent primero
db.statements.aggregate([
    {$project:{"context.contextActivities.parent.id" :1, "target.id":1, _id :0}},
    { $group: {
        _id: {parent:"$context.contextActivities.parent.id", miObjeto:"$target.id" },
        num: { $sum: 1 }
    } },
    { $sort: { _id: 1 } },
    {
        $project:{
           parent:"$_id.parent",  _id:0, actividad:"$_id.miObjeto" 
        }
    },
])


//1 de marzo, prueba 1, este aparentemente funciona igual que el de prueba 2.
db.statements.aggregate([
    {$match:{"context.contextActivities.parent":{$exists: true}}},
    {$unwind:"$context.contextActivities.parent"},
    { $group: {
        _id: {parent:"$context.contextActivities.parent.id"},
        children: { $push:  { actividad: "$target.id", nombre: "$target.definition.name", description: "$target.definition.description" } }
    } },
    { $sort: { _id: 1 } },
    {
        $project:{
            _id:0 , parent:"$_id.parent", children:1
        }
    },
])

//prueba 2, este es el bueno, y da el mismo resultado que el 3
db.statements.aggregate([
    {$unwind:"$context.contextActivities.parent"},
    {$match:{"context.contextActivities.parent":{$exists: true}}},
    { $group: {
        _id: {parent:"$context.contextActivities.parent.id"},
        children: { $push:  { actividad: "$target.id", nombre: "$target.definition.name", description: "$target.definition.description" } }
    } },
    { $sort: { _id: 1 } },
    {
        $project:{
            _id:0 ,  parent:"$_id.parent", children:1
        }
    },
])

//ESTE ES EL BUENO: prueba 3, no hago match, solo agrego por parent, da el mismo resultado que el dos y el macth no hace falta
//muestra los padres que tienen hijos.
db.statements.aggregate([
    {$unwind:"$context.contextActivities.parent"},
    { $group: {
        _id: {parent:"$context.contextActivities.parent.id"},
        children: { $push:  { actividad: "$target.id", nombre: "$target.definition.name", description: "$target.definition.description" } }
    } },
    { $sort: { _id: 1 } },
    {
        $project:{
            _id:0 ,  parent:"$_id.parent", children:1
        }
    },
])



//ME SIRVE
//prueba 5, mostrar las actividades que no tienen padre,
//o sea, las que son raiz 
db.statements.aggregate([
    {$unwind:{path:"$context.contextActivities.parent",
        preserveNullAndEmptyArrays: true}
    },
    {$match:{"context.contextActivities.parent.id":{$exists: false}}},
    { $group: {
        _id: {parent:"$target.id"},
    } },
    { $sort: { _id: 1 } },
    {
        $project:{
            _id:0 ,  parent:"$_id.parent"
        }
    },
])

//para sacar los padres puros
db.statements.aggregate([
        {$match:{"context.contextActivities.parent.id":{$exists: false}}},
    { $group: {
        _id: {parent:"$target.id"},
    } },
    { $sort: { _id: 1 } },
    {
        $project:{
            _id:0 ,  parent:"$_id.parent"
        }
    },

])

