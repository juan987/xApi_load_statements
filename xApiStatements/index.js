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

//Realizar una busqueda
lrs.queryStatements(
    {
        params: {
            
            verb: new TinCan.Verb(
                {
                    id: "http://adlnet.gov/expapi/verbs/experienced"
                }
            ),
            
            //since: "2017-01-02T08:34:16Z"
        },
        callback: function (err, data) {
            if (err !== null) {
                console.log("Failed to query statements: " + err);
                // TODO: do something with error, didn't get statements
                //return;
            }

            if (data.more !== null) {
                // TODO: additional page(s) of statements should be fetched
            }

            //console.log(data);
            console.log('juan');

            // TODO: do something with statements in data.statements
            //console.log(data.statements)
            //console.log(JSON.stringify(data.statements))
            //drop la coleccion 'statements' si existe, para no duplicar datos cada vez que ejecuto el server
            dropColleccion();
            crearDB(data);

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
        console.log('en funcion crear db')
        MongoClient.connect('mongodb://localhost:27017/lrs1', function(err, db) {  
            assert.equal(null, err);
            console.log("Successfully connected to MongoDB.");
            db.collection("statements").insertMany(data.statements, function(err, res) {
                    console.log(res); 
                    db.close();             
            });
        });//Fin de MongoClient.connect
    
}// Fin de function crearDB