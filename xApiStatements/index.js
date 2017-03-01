var express = require('express');
var bodyParser = require('body-parser');//Lo uso en lineas 7 y 8
var my_app = express();

//Variables globales para el chat con socketio, 11dic16
var http = require('http').Server(my_app);


//************************************************************
//Este use es necesario para activar CORS y evitar
//errores del tipo: No 'Access-Control-Allow-Origin' , en la app cliente con angular.
my_app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//************************************************************

//Sin esto no lee ni Json ni urlencoded
//Ver request.body en web de express
my_app.use(bodyParser.json()); // for parsing application/json
my_app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded



//Server http para mongodb

//Crear variable para rutas
var routerRest = express.Router();

//Ruta para el post del reporte tipo 1, le llega el json con los parametros
routerRest.route("/reporte1")
        .post((request, response)=>{
            console.log('En post DE reporte 1');
            console.log("Post: leo todo el json de l request de report1" ,request.body);
            //console.log("Post: solo leo un dato del json  " ,request.body.dato);
            mongoReporte1(request.body, response);
});

//Ruta para el get de la colleccion actors
routerRest.route("/collection/actor")
        .get((request, response)=>{
            console.log('En get de collection Actor');
            //console.log("Post: solo leo un dato del json  " ,request.body.dato);
            mongoGetCollectionActor(response);
});

//Ruta para el get de la colleccion verbs
routerRest.route("/collection/verb")
        .get((request, response)=>{
            console.log('En get de collection verbs');
            mongoGetCollectionVerb(response);
});

//Ruta para el get de la colleccion targets
routerRest.route("/collection/target")
        .get((request, response)=>{
            console.log('En get de collection targets');
            mongoGetCollectionTarget(response);
});

//Ruta para el get de arbol de actividades
routerRest.route("/arbol/actividades")
        .get((request, response)=>{
            console.log('En get de collection targets');
            mongoGetArbolActividades(response);
});

//**************************************************************************************
//Ruta para el http del autocomplete de nombre
routerRest.route("/actor/autocomplete/:text")
        .get((request, response)=>{

            console.log('En GET DE autocomplete de nombre, patron de busqueda ' +request.params.text);
            //Busqueda por reg expression solo por actor
            mongoAutocomplete(request.params.text, response);
});//Fin del get de autocomplete/:text

//Ruta para el http del autocomplete cuando no tiene patron de busqueda(:text)
//Devuelve un array vacio
routerRest.route("/actor/autocomplete/")
        .get((request, response)=>{

            console.log('En GET DE autocomplete, patron de busqueda de nombres undefined' +request.params.text);

                //Devuelvo un array vacio
                let data= [];
                response.json(data)
                console.log('Estoy dentro del get del AUTOCOMPLETE nombres undefined: ' ,data);

        });//Fin del roter de autocomplete de nombre
//**************************************************************************************

//**************************************************************************************
//Ruta para el http del autocomplete de verbo
routerRest.route("/actor/autocompleteverbos/:text")
        .get((request, response)=>{

            console.log('En GET DE autocomplete de verbos, patron de busqueda ' +request.params.text);
            //Busqueda por reg expression solo por actor
            mongoAutocompleteVerbo(request.params.text, response);
});//Fin del get de autocomplete/:text

//Ruta para el http del autocomplete cuando no tiene patron de busqueda(:text)
//Devuelve un array vacio
routerRest.route("/actor/autocompleteverbos/")
        .get((request, response)=>{

            console.log('En GET DE autocomplete de verbos, patron de busqueda undefined' +request.params.text);

                //Devuelvo un array vacio
                let data= [];
                response.json(data)
                console.log('Estoy dentro del get del AUTOCOMPLETE undefined de verbos: ' ,data);

        });//Fin del roter de autocomplete/:text
//**************************************************************************************
             

my_app.use("/", routerRest);


http.listen(3000,()=>{
    console.log("Servidor de xAPI iniciado en *:3000");
});


//******************************
//******************************
//******************************
//******************************
//1 marzo, general el treeObject 
function mongoGetArbolActividades(response){
    docs1 = {data:[]};
    rama = {
        saludo: "hola",
        nombre: "Juan Miguel"
    }
    docs1.data.push(rama);
    console.log('en funcion mongoGetArbolActividades', docs1)
    response.json(docs1);

    //Prueba 3 de docs miscelaneous: Me da todos los padres con hijos
    /*db.statements.aggregate([
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
    ]) */

    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
        assert.equal(null, err);
        console.log("Successfully connected to MongoDB para generar arbol de padres con hijos.");
        var collectionItem = db.collection('statements');
        collectionItem.aggregate([//como en prueba 3 de miscelaneous
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
            ],
            function(err, docs) {//callback del aggregate
                assert.equal(null, err);
                if(err) { 
                    console.log('Estoy dentro del get del callback de mongoGetArbolActividades, ERROR ' ,err);
                }else{
                    console.log('coleccion de mongoGetArbolActividades: ' ,docs);
                    console.log('coleccion de mongoGetArbolActividades, longitud del array docs: ' ,docs.length);
                    console.log('coleccion de mongoGetArbolActividades', 
                                'longitud del array de hijos del elemento 0: ' ,docs[0].children.length);
                    console.log('coleccion de mongoGetArbolActividades', 
                                'longitud del array de hijos del elemento 1: ' ,docs[1].children.length);
                    //construccion del objeto recursivo de treenode
                    //con padres con hijos, y con padres sin hijos, segun los datos de la coleccion statements
                    arbol = {data:[]};
                    padre = {
                        "label": "cc",
                        "data": "cc",
                        "expandedIcon": "fa-folder-open",
                        "collapsedIcon": "fa-folder",
                        "children": []
                    };
                    hijo = {
                        "label": "cc",
                        "data": "cc",
                        "expandedIcon": "fa-folder-open",
                        "collapsedIcon": "fa-folder",
                        "children": []
                    };
                    //for(let i=0; i<docs.length, i++)
                    docs.forEach(function(datosNodoPadre) {
                        padre.label = datosNodoPadre.parent;
                        console.log('actividades padre: ', datosNodoPadre.parent )
                            datosNodoPadre.children.forEach(function(datosHijo){
                                hijo.label = datosHijo.actividad;
                                //hijo.data = datosHijo.name +", " +datosHijo.description
                                hijo.data = datosHijo.name
                                padre.children.push(hijo);
                            });//Fin del forEach de children
                        //al terminar, push del padre en el objeto arbol
                        arbol.data.push(padre);
                        //limpio el array de padre
                        padre.children = [];
                    });//fin del foreach de docs
                    //Muestra el arbol por consola
                    arbol.data.forEach(function(elementoDelArbol) {
                        console.log('mongoGetArbolActividades, el tree node es' ,elementoDelArbol);
                    });

                }//fin del else
            db.close();
        });//Fin de aggregate
    });//Fin de MongoClient.connect
}//Fin de function mongoGetArbolActividades(response)
//Fin e generar el tree object
//******************************
//******************************
//******************************
//******************************

function mongoGetCollectionTarget(response){
        MongoClient.connect('mongodb://localhost:27017/lrs1', (err, db) => {
        assert.equal(err,null);
        console.log('en mongoGetCollectionTarget');
        //Construccion del query document
        var query = {};
        //Construccion del projection document
        var projection = {"_id": 0, "objeto": 1};
        db.collection('targets').find(query).project(projection).toArray(function(err, docs) {
            if(err) { 
                    response.status(500).send('mongoGetCollectionTarget , Error en get de autocomplete');
                    console.log('Estoy dentro del get del mongoGetCollectionTarget, ERROR ' ,err);
                }else{
                    response.json(docs)
                    console.log('Estoy dentro del get del mongoGetCollectionTarget, verbos: ' ,docs);
            }
            return db.close();
        });//Cierre de toArray
    });//Fin de MongoClient.connect
}//Fin de funcion mongoGetCollectionTarget

function mongoGetCollectionVerb(response){
        MongoClient.connect('mongodb://localhost:27017/lrs1', (err, db) => {
        assert.equal(err,null);
        console.log('en mongoGetCollectionVerb');
        //Construccion del query document
        var query = {};
        //Construccion del projection document
        var projection = {"_id": 0, "verbo": 1};
        db.collection('verbos').find(query).project(projection).toArray(function(err, docs) {
            if(err) { 
                    response.status(500).send('mongoGetCollectionVerb , Error en get de autocomplete');
                    console.log('Estoy dentro del get del mongoGetCollectionVerb, ERROR ' ,err);
                }else{
                    response.json(docs)
                    console.log('Estoy dentro del get del mongoGetCollectionVerb, verbos: ' ,docs);
            }
            return db.close();
        });//Cierre de toArray
    });//Fin de MongoClient.connect
}//Fin de funcion mongoGetCollectionVerb

function mongoGetCollectionActor(response){
        MongoClient.connect('mongodb://localhost:27017/lrs1', (err, db) => {
        assert.equal(err,null);
        console.log('en mongoGetCollectionActor');
        //Construccion del query document
        var query = {};
        //Construccion del projection document
        var projection = {"_id": 0, "actor": 1};
        db.collection('actors').find(query).project(projection).toArray(function(err, docs) {
            if(err) { 
                    response.status(500).send('mongoGetCollectionActor , Error en get de autocomplete');
                    console.log('Estoy dentro del get del mongoGetCollectionActor, ERROR ' ,err);
                }else{
                    response.json(docs)
                    console.log('Estoy dentro del get del mongoGetCollectionActor, actors: ' ,docs);
            }
            return db.close();
        });//Cierre de toArray
    });//Fin de MongoClient.connect
}//Fin de funcion mongoGetCollectionActor

//Funcion para obtener el reporte 1 en MongoDB
function mongoReporte1(body, response){
    MongoClient.connect('mongodb://localhost:27017/lrs1', (err, db) => {
        assert.equal(err,null);
        console.log('en mongoReporte1, recibido :', body);
        //Construccion del query document
        var query = {};
        query = {"actor.name":body.name};
        //Construccion del projection document
        var projection = {"_id": 0, "originalJSON": 1};
        db.collection('statements').find(query).project(projection).toArray(function(err, docs) {
        //db.collection('statements').find().limit(10).project(projection).toArray(function(err, docs) {
            if(err) { 
                    response.status(500).send('Autocomplete , Error en get de autocomplete');
                    console.log('Estoy dentro del get del AUTOCOMPLETE, ERROR ' ,err);
                }else{
                    response.json(docs)
                    console.log('Estoy dentro del get del AUTOCOMPLETE, actors: ' ,docs);
            }
            return db.close();
        });//Cierre de toArray
    });//Fin de MongoClient.connect

}//Fin de mongoReporte1

//Funcion para buscar en mongo db con el AUTOCOMPLETE de nombre
function mongoAutocomplete(text, response){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {

        assert.equal(err, null);
        console.log("Successfully connected to MongoDB autocomplete.");
        
        var query = queryDocument(text);
        var projection = projectionDocument();

        //Autocomplete con aggregation
                    var collectionItem = db.collection('statements');

                    collectionItem.aggregate([
                        {   $match: query
                        },
                        { $group: {
                                _id: "$actor.name",
                            num: { $sum: 1 }
                        } },
                        { $sort: { _id: 1 } }
                    ],
                    function(err, docs) {
                        if(err) { 
                                response.status(500).send('Autocomplete , Error en get de autocomplete');
                                console.log('Estoy dentro del get del AUTOCOMPLETE, ERROR ' ,err);
                            }else{
                                response.json(docs)
                                console.log('Estoy dentro del get del AUTOCOMPLETE, actors: ' ,docs);
                                //Docs es un array con los datos segun la projection, que aqui solo son los nombres de los actors
                        }
                        return db.close();
                    });

        //FIN de autocomplete con aggregation

        /*
        app.get('/', function(req, res){
        db.collection('movies').find({}).toArray(function(err, docs) {
            res.render('movies', { 'movies': docs } );
        });
        */

    // Peform a simple find and return all the documents
    /*
      collection.find({}, {skip:1, limit:1, fields:{b:1}}).toArray(function(err, docs) {
        assert.equal(null, err);
        assert.equal(1, docs.length);
        assert.equal(null, docs[0].a);
        assert.equal(2, docs[0].b);
    */

        /*   27-2-17
        //Find para el autocomplete original
        db.collection('statements').find(query).project(projection).toArray(function(err, docs) {
        //db.collection('statements').find().limit(10).project(projection).toArray(function(err, docs) {
            if(err) { 
                    response.status(500).send('Autocomplete , Error en get de autocomplete');
                    console.log('Estoy dentro del get del AUTOCOMPLETE, ERROR ' ,err);
                }else{
                    response.json(docs)
                    console.log('Estoy dentro del get del AUTOCOMPLETE, actors: ' ,docs);
                    //Docs es un array con los datos segun la projection, que aqui solo son los nombres de los actors
            }
            return db.close();
        });//Fin del find para el autocomplete
        */

        /*
        //ESte metodo es con un cursor explicito
        var cursor = db.collection('statements').find(query);
        cursor.project(projection);
        
        var numMatches = 0;

        cursor.forEach(
            function(doc) {
                numMatches = numMatches + 1;
                console.log( doc );
            },
            function(err) {
                assert.equal(err, null);
                console.log("Our query was:" + JSON.stringify(query));
                console.log("Matching documents: " + numMatches);

                return db.close();
            }
        );
        */

    });
}//Fin de mongoAutocomplete de nombre

//Funcion para buscar en mongo db con el AUTOCOMPLETE de verbo
function mongoAutocompleteVerbo(text, response){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {

        assert.equal(err, null);
        console.log("Successfully connected to MongoDB autocomplete verbo.");
        
        var query = {"verb.id":{"$regex": text, "$options": "i"}};
        console.log('query de verbo: ', query);
        var projection = { "_id": 0,"verb.id": 1,};
        console.log('projection de verbo: ', projection);

        /*
        db.collection('statements').find(query).project(projection).toArray(function(err, docs) {
        //db.collection('statements').find().limit(10).project(projection).toArray(function(err, docs) {
            if(err) { 
                    response.status(500).send('Autocomplete verbos, Error en get de autocomplete');
                    console.log('Estoy dentro del get del AUTOCOMPLETE verbos, ERROR ' ,err);
                }else{
                    response.json(docs)
                    console.log('Estoy dentro del get del AUTOCOMPLETE, verbos: ' ,docs);
                    //Docs es un array con los datos segun la projection, que aqui solo son los nombres de los actors
            }
            return db.close();
        });
        */

        //Autocomplete con aggregation
                    var collectionItem = db.collection('statements');

                    collectionItem.aggregate([
                        {   $match: query
                        },
                        { $group: {
                                _id: {verbo:"$verb.id"},
                            num: { $sum: 1 }
                        } },
                        { $sort: { _id: 1 } },
                        {
                          $project:{
                              _id:0, verbo:"$_id.verbo" 
                            }
                        }

                    ],
                    function(err, docs) {
                        if(err) { 
                                response.status(500).send('Autocomplete verbos, Error en get de autocomplete');
                                console.log('Estoy dentro del get del AUTOCOMPLETE verbos, ERROR ' ,err);
                            }else{
                                response.json(docs)
                                console.log('Estoy dentro del get del AUTOCOMPLETE, verbos: ' ,docs);
                                //Docs es un array con los datos segun la projection, que aqui solo son los nombres de los actors
                        }
                        return db.close();
                    });

        //FIN de autocomplete con aggregation

    });
}//Fin de mongoAutocomplete de verbo

//*******************************************************
//Funciones para el autocomplete con regex para nombre
function queryDocument(text) {
    console.log('texto de busqueda autocomplete: ', text);
    var query = {};
    query = {"actor.name":{"$regex": text, "$options": "i"}};
    console.log('query doc nombre:  ', query);
    return query;
}


function projectionDocument() {
    var projection = {
        "_id": 0,
        "actor.name": 1,
    };
    return projection;
}
//Fin de Funciones para el autocomplete con regex
//*******************************************************


//**************************************************************************************
//**************************************************************************************
//**************************************************************************************
//**************************************************************************************
//**************************************************************************************
//A partir de aqui es codigo de tincan api para obtener los statements
//desde learninglocker y guardarlos en mongodb


//Datos para conectar con la app en local: learninglocker
//Config.endpoint = "http://localhost/learninglocker/public/data/xAPI/";
//Config.authUser = "cf7d2b3b2ba6bad7490def67687ef4aeef4f29a0";
//Config.authPassword = "d17a9bcd7b65364cc76ce91722179a080eae3ec2";
//Config.actor = { "mbox":"roberto@bar.com", "name":"roberto" };
//Config.registration = "a85be06c-de5b-11e6-bf01-fe55135034f3";

//Como en http://rusticisoftware.github.io/TinCanJS/
//y en https://github.com/RusticiSoftware/TinCanJS

var TinCan = require('tincanjs');
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

//Creacion del objeto LRS
var lrs;

try {
    lrs = new TinCan.LRS(
        {
            endpoint: "http://localhost/learninglocker/public/data/xAPI/",
            username: "cf7d2b3b2ba6bad7490def67687ef4aeef4f29a0",
            password: "d17a9bcd7b65364cc76ce91722179a080eae3ec2",
            allowFail: false
        }
    );
}
catch (ex) {
    console.log("Failed to setup LRS object: " + ex);
    // TODO: do something with error, can't communicate with LRS
}

//Realizar una busqueda en learninglockers
lrs.queryStatements(
    {
        /*
        params: {
            
            verb: new TinCan.Verb(
                {
                    id: "http://adlnet.gov/expapi/verbs/experienced"
                }
            ), 
            
            //since: "2017-01-02T08:34:16Z"
        }, */
                    //since: "2016-01-02T08:34:16Z",
                    //ascending: true

        params: {//no envio parametros, por ahora
                    //until: "2018-01-02T08:34:16Z",
                    /*verb: new TinCan.Verb(
                        {
                            id: "http://adlnet.gov/expapi/verbs/experienced"
                        }
                    ),*/ 
               },

        callback: function (err, data) {
            if (err !== null) {
                // do something with error, didn't get statements
                console.log("Failed to query statements: " + err);
                return;
            }

            if (data.more !== null) {
                // TODO: additional page(s) of statements should be fetched
                console.log('hay mas datos en el lrs, data more !== null: ', data.more);
            }

            //console.log(data);
            console.log('juan en metodo lrs.queryStatements');
            //console.log('en callback de lrs.querystatements, data: ', data.statements)
            
            //prueba para ver el error este de mongo db:
            //Error: key http://id.tincanapi.com/extension/attempt-id must not contain '.'
            
            data.statements.forEach(function(current_value) {
                    //console.log(current_value.context);
                    //console.log(current_value.context.extensions);
                    //muestra los current_value.context.extensions distintos de null
                    if(current_value.context.extensions !== null){
                        /* Original, lo cambio por la funcion function cambiarPuntos(string_uri)
                       console.log(current_value.context.extensions);
                       //recupero la clave con puntos
                       console.log('json stringify',JSON.stringify(current_value.context.extensions));  
                       console.log('json parse',JSON.parse(JSON.stringify(current_value.context.extensions)));
                       let string_uri =  JSON.stringify(current_value.context.extensions);
                       console.log('la extension como string: ', string_uri);
                       //sustituir los puntos por &40
                       let claveSinPuntos = string_uri.replace(/[.]/g, "&40");
                       console.log('stringUriSinPuntos: ', claveSinPuntos);
                       let parseObject = JSON.parse(claveSinPuntos);
                       //Reescribe el objeto current_value.context.extensions con &40 en vez de puntos
                       current_value.context.extensions = parseObject;
                       console.log('objeto current_value.context.extensions con &40 en vez de puntos',current_value.context.extensions);
                       */

                       console.log(current_value.context.extensions);
                       current_value.context.extensions = reemplazarPuntos(JSON.stringify(current_value.context.extensions))
                       console.log('objeto current_value.context.extensions con &40 en vez de puntos',current_value.context.extensions);
                    }// fin de if(current_value.context.extensions
                    if(current_value.result !== null){//verifica que la clave result existe
                        if(current_value.result.extensions !== null){
                            console.log(current_value.result.extensions);
                            current_value.result.extensions = reemplazarPuntos(JSON.stringify(current_value.result.extensions))
                            console.log('objeto current_value.result.extensions con &40 en vez de puntos',current_value.result.extensions);
                        }
                    }
            });
            

            // TODO: do something with statements in data.statements
            //console.log(data.statements)
            //console.log(JSON.stringify(data.statements))

            //drop la coleccion 'statements' si existe, para no duplicar datos cada vez que ejecuto el server
            dropColleccion();

            //Crea la db actualizada con todos los statements cada vez que arranca el servidor.
            //Tiene que estar corriendo apache y la app learninglocker
            crearDB(data.statements);

        }
    }
);

//funcion para quitar puntos de las claves que los contenga en el statement recibido del LRS
//recibe el objeto que tiene la key con puntos como un string y lo devuelve como un objeto
//json cuya clave tiene &40 en vez de puntos.
function reemplazarPuntos(string_uri){
    let claveSinPuntos = string_uri.replace(/[.]/g, "&40");
    return JSON.parse(claveSinPuntos);
}

function dropColleccion(){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
            assert.equal(null, err);
            console.log("Successfully connected to MongoDB para borrar coleccion.");
            //Borrar toda la coleccion, para no duplicar datos cada vez que arranca el server
            db.dropCollection("statements", function(err, resp){
                assert.equal(null, err);
                console.log('coleccion borrada', resp);
                db.close();
            });
        });//Fin de MongoClient.connect

}

function crearDB(data){
        //console.log('en funcion crear db, data: ', data)
        MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
            assert.equal(null, err);
            console.log("Successfully connected to MongoDB.");
            db.collection("statements").insertMany(data, function(err, res) {
                    console.log('resultado de la insercion en mongo db si hay error', err); 
                    console.log('resultado de la insercion en mongo db', res);
                      dropColleccionActors();
                    dbCrearColeccionDeActors();
                      dropColleccionVerbos();
                    dbCrearColeccionDeVerbs();
                      dropColleccionTargets();
                    crearColeccionDeTargets();
                     dropColleccionTargetsWithParentField();
                    crearColeccionDeTargetsWithParentField();
                    db.close();             
            });
        });//Fin de MongoClient.connect
    
}// Fin de function crearDB
function dropColleccionActors(){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
            assert.equal(null, err);
            console.log("Successfully connected to MongoDB para borrar coleccion de actors.");
            //Borrar toda la coleccion, para no duplicar datos cada vez que arranca el server
            db.dropCollection("actors", function(err, resp){
                assert.equal(null, err);
                console.log('coleccion de Actors borrada', resp);
                db.close();
            });
        });//Fin de MongoClient.connect

}//Fin de dropColleccionActors
function dbCrearColeccionDeActors(){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
        assert.equal(null, err);
        console.log("Successfully connected to MongoDB en dbCrearColeccionDeActors.");
        var collectionItem = db.collection('statements');
        collectionItem.aggregate([
                { $group: {
                    _id: {actor:"$actor"},
                    num: { $sum: 1 }
                } },
                { $sort: { _id: 1 } },
                {
                    $project:{
                        _id:0, actor:"$_id.actor" 
                    }
                }
            ],
            function(err, docs) {//callback del aggregate
                assert.equal(null, err);
                if(err) { 
                    console.log('Estoy dentro del get del callback de crear coleccion de actors, ERROR ' ,err);
                }else{
                    console.log('coleccion de actores: ' ,docs);
                    //Crear coleccion de actors
                    let collectionActors = db.collection('actors');
                    collectionActors.insertMany(docs, function(err, res){
                        assert.equal(null, err);
                        console.log('coleccion de actores creada: ', res)
                    });
                }
            db.close();
        });//Fin de aggregate
    });//Fin de  MongoClient.connect
}//Fin de funcion dbCrearColeccionDeActors
function dropColleccionVerbos(){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
            assert.equal(null, err);
            console.log("Successfully connected to MongoDB para borrar coleccion de verbos.");
            //Borrar toda la coleccion, para no duplicar datos cada vez que arranca el server
            db.dropCollection("verbos", function(err, resp){
                assert.equal(null, err);
                console.log('coleccion de verbos borrada', resp);
                db.close();
            });
        });//Fin de MongoClient.connect

}
function dbCrearColeccionDeVerbs(){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
        assert.equal(null, err);
        console.log("Successfully connected to MongoDB en dbCrearColeccionDeVerbs.");
        var collectionItem = db.collection('statements');
        collectionItem.aggregate([
                { $group: {
                    _id: {verbo:"$verb"},
                    num: { $sum: 1 }
                } },
                { $sort: { _id: 1 } },
                {
                    $project:{
                        _id:0, verbo:"$_id.verbo" 
                    }
                }
            ],
            function(err, docs) {//callback del aggregate
                assert.equal(null, err);
                if(err) { 
                    console.log('Estoy dentro del get del callback de crear coleccion de verbos, ERROR ' ,err);
                }else{
                    console.log('coleccion de verbos: ' ,docs);
                    //Crear coleccion de actors
                    let collectionActors = db.collection('verbos');
                    collectionActors.insertMany(docs, function(err, res){
                        assert.equal(null, err);
                        console.log('coleccion de verbos creada: ', res)
                    });
                }
            db.close();
        });//Fin de aggregate
    });//Fin de  MongoClient.connect
}//Fin de funcion dbCrearColeccionDeVerbs

function dropColleccionTargets(){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
            assert.equal(null, err);
            console.log("Successfully connected to MongoDB para borrar coleccion de targets.");
            //Borrar toda la coleccion, para no duplicar datos cada vez que arranca el server
            db.dropCollection("targets", function(err, resp){
                assert.equal(null, err);
                console.log('coleccion de targets borrada', resp);
                db.close();
            });
        });//Fin de MongoClient.connect

}

//Los docs de esta colleccin no tienen field parent.
function crearColeccionDeTargets(){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
        assert.equal(null, err);
        console.log("Successfully connected to MongoDB en crearColeccionDeTargets.");
        var collectionItem = db.collection('statements');
        collectionItem.aggregate([
                { $group: {
                    _id: {miObjeto:"$target"},
                    num: { $sum: 1 }
                } },
                { $sort: { _id: 1 } },
                {
                    $project:{
                        _id:0, objeto:"$_id.miObjeto" 
                    }
                }
            ],
            function(err, docs) {//callback del aggregate
                assert.equal(null, err);
                if(err) { 
                    console.log('Estoy dentro del get del callback de crear coleccion de targets, ERROR ' ,err);
                }else{
                    console.log('coleccion de targets: ' ,docs);
                    //Crear coleccion de actors
                    let collectionActors = db.collection('targets');
                    collectionActors.insertMany(docs, function(err, res){
                        assert.equal(null, err);
                        console.log('coleccion de objetos targets: ', res)
                    });
                }
            db.close();
        });//Fin de aggregate
    });//Fin de  MongoClient.connect
}//Fin de funcion crearColeccionDeTargets



function dropColleccionTargetsWithParentField(){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
            assert.equal(null, err);
            console.log("Successfully connected to MongoDB para borrar coleccion de targetsConParent.");
            //Borrar toda la coleccion, para no duplicar datos cada vez que arranca el server
            db.dropCollection("targetsConParent", function(err, resp){
                assert.equal(null, err);
                console.log('coleccion de targetsConParent borrada', resp);
                db.close();
            });
        });//Fin de MongoClient.connect

}
//Los docs de esta colleccin no tienen field parent.
//REf: https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-parent-references/
function crearColeccionDeTargetsWithParentField(){
    MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
        assert.equal(null, err);
        console.log("Successfully connected to MongoDB en crearColeccionDeTargetsWithParentField.");
        var collectionItem = db.collection('statements');
        /*collectionItem.aggregate([
                { $group: {
                    _id: {miObjeto:"$target"},
                    num: { $sum: 1 }
                } },
                { $sort: { _id: 1 } },
                {
                    $project:{
                        _id:0, objeto:"$_id.miObjeto" 
                    }
                }
            ],*/
        collectionItem.aggregate([
                //{$unwind:"$context.contextActivities.parent"},  //Con esto, no se insertan los targets raices
                { $group: {
                    _id: {miObjeto:"$target", parent:"$context.contextActivities.parent.id"},
                    num: { $sum: 1 }
                } },
                { $sort: { _id: 1 } },
                {
                    $project:{
                        _id:0, objeto:"$_id.miObjeto" , parent:"$_id.parent"
                    }
                },
            ],
            function(err, docs) {//callback del aggregate
                assert.equal(null, err);
                if(err) { 
                    console.log('Estoy dentro del get del callback de crear coleccion de targetsConParent, ERROR ' ,err);
                }else{
                    console.log('coleccion de targetsConParent: ' ,docs);
                    //Crear coleccion de actors
                    let collectionActors = db.collection('targetsConParent');
                    collectionActors.insertMany(docs, function(err, res){
                        assert.equal(null, err);
                        console.log('coleccion de objetos targetsConParent: ', res)
                    });
                }
            db.close();
        });//Fin de aggregate
    });//Fin de  MongoClient.connect
}//Fin de funcion crearColeccionDeTargetsWithParentField