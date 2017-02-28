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
        _id: {miObjeto:"$target", parent:"$contextActivities.parent.id"},
        num: { $sum: 1 }
    } },
    { $sort: { _id: 1 } },
    {
        $project:{
            _id:0, objeto:"$_id.miObjeto" , parent:"$_id.parent"
        }
    },
])

