//Datos para conectar con la app en local: learninglocker
//Config.endpoint = "http://localhost/learninglocker/public/data/xAPI/";
//Config.authUser = "cf7d2b3b2ba6bad7490def67687ef4aeef4f29a0";
//Config.authPassword = "d17a9bcd7b65364cc76ce91722179a080eae3ec2";
//Config.actor = { "mbox":"roberto@bar.com", "name":"roberto" };
//Config.registration = "a85be06c-de5b-11e6-bf01-fe55135034f3";

//Inicializar api tincan como en: https://www.npmjs.com/package/tincan
var tincan = require("tincan");
//var myApp = new tincan("https://localhost/learninglocker/public/data/xAPI/", 
var myApp = new tincan("localhost/learninglocker", 
            "cf7d2b3b2ba6bad7490def67687ef4aeef4f29a0", "d17a9bcd7b65364cc76ce91722179a080eae3ec2");


// Look up a user
myApp.user({token: "a85be06c-de5b-11e6-bf01-fe55135034f3"}, function(err, user){
	if(!err && user){
		// Insert some data
		//myApp.insert({name: user.name, image: user.avatar, age: 37, online: true});

        //buscar todos los statements
        myApp.find({},function(error, data){
            if (error){
                console.log('error', error)
            }else{
                console.log('success', data)
            }
        });
	}else
		console.log("User is not logged in");
});


//buscar todos los statements
/*
myApp.find({},function(error, data){
    if (error){
        console.log('error', error)
    }else{
        console.log('success', data)
    }
});
*/