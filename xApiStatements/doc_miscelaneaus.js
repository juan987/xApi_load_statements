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