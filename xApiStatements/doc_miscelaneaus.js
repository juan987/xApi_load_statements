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

//prueba de aggragate con padre
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

//prueba de agregate con parent primero
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

