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
        });

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

        params: {
                    until: "2018-01-02T08:34:16Z",
                    /*verb: new TinCan.Verb(
                        {
                            id: "http://adlnet.gov/expapi/verbs/experienced"
                        }
                    ),*/ 
               },

        callback: function (err, data) {
            if (err !== null) {
                console.log("Failed to query statements: " + err);
                // TODO: do something with error, didn't get statements
                return;
            }

            if (data.more !== null) {
                // TODO: additional page(s) of statements should be fetched
            }

            //console.log(data);
            console.log('juan');
            //console.log('en callback de lrs.querystatements, data: ', data.statements)
            
            //prueba para ver el error este de mongo db:
            //Error: key http://id.tincanapi.com/extension/attempt-id must not contain '.'
            
            data.statements.forEach(function(current_value) {
                    //console.log(current_value.context);
                    console.log(current_value.context.extensions);
            });
            

            // TODO: do something with statements in data.statements
            //console.log(data.statements)
            //console.log(JSON.stringify(data.statements))

            //drop la coleccion 'statements' si existe, para no duplicar datos cada vez que ejecuto el server
            //dropColleccion();

            //Crea la db actualizada con todos los statements cada vez que arranca el servidor.
            //Tiene que estar corriendo apache y la app learninglocker
            //crearDB(data.statements);

        }
    }
);
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
                    db.close();             
            });
        });//Fin de MongoClient.connect
    
}// Fin de function crearDB

