var express = require('express');
var ejs = require('ejs');
var app = express.createServer(express.logger());

var mongoose = require('mongoose'); // include Mongoose MongoDB library
var schema = mongoose.Schema; 

/************ DATABASE CONFIGURATION **********/
app.db = mongoose.connect(process.env.MONGOLAB_URI); //connect to the mongolabs database - local server uses .env file

// Include models.js - this file includes the database schema and defines the models used
require('./models').configureSchema(schema, mongoose);

// Define your DB Model variables
var ItemInRoom = mongoose.model('ItemInRoom');
var Room = mongoose.model('Room');
var ItemType = mongoose.model('ItemType');
var Item = mongoose.model('Item');
var Player = mongoose.model('Player');
var GameLog = mongoose.model('GameLog');

/************* END DATABASE CONFIGURATION *********/


/*********** SERVER CONFIGURATION *****************/
//like a setup function
app.configure(function() {
    
    /*********************************************************************************
        Configure the template engine
        We will use EJS (Embedded JavaScript) https://github.com/visionmedia/ejs
        
        Using templates keeps your logic and code separate from your HTML.
        We will render the html templates as needed by passing in the necessary data.
    *********************************************************************************/

    app.set('view engine','ejs');  // use the EJS node module
    app.set('views',__dirname+ '/views'); // use /views as template directory
    app.set('view options',{layout:true}); // use /views/layout.html to manage your main header/footer wrapping template
    app.register('html',require('ejs')); //use .html files in /views -- instead of having to call them .ejs

    /******************************************************************
        The /static folder will hold all css, js and image assets.
        These files are static meaning they will not be used by
        NodeJS directly. 
        
        In your html template you will reference these assets
        as yourdomain.heroku.com/img/cats.gif or yourdomain.heroku.com/js/script.js
    ******************************************************************/
    app.use(express.static(__dirname + '/static'));
    
    //parse any http form post
    app.use(express.bodyParser());
    
    /**** Turn on some debugging tools ****/
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});
/*********** END SERVER CONFIGURATION *****************/

/* -------------------  -----------------*/






/* -------------------HOME PAGE -----------------*/

app.get('/', function(request, response) {
    
    /// build the query
    var query = ItemType.find({});
    query.sort('domPts',-1); //sort by date in descending order
    
    var queryRooms = Room.find({});
        queryRooms.sort('name',-1);
        
    var queryPlayers = Player.find({});
        
    var queryLog = GameLog.find({}).sort('timestamp', -1).limit(10);
    
    
    // run the query and display blog_main.html template if successful
    query.exec({}, function(err, allItemTypes){
        
        queryRooms.exec({}, function(err, allRooms){
            
            queryLog.exec({}, function(err, logs){
                
                queryPlayers.exec({}, function (err, allPlayers){
        
        if (err){
            console.log('No Item Types Available');
            console.log(err);
        }
        
               
        // prepare template data
        templateData = {
            players : allPlayers,
            itemTypes : allItemTypes,
            rooms : allRooms,
            logs : logs,
            pageTitle : 'ITPville'
        };
        
//       console.log("allItemTypes contains");
//      console.log(allItemTypes);
//        console.log("*****************");

        response.render("home.html", templateData);
        });
            });
            });
    });
});

app.post('/', function(request, response){
    console.log("Inside app.post('/')");
    console.log("form received and includes");
    console.log(request.body);
    
    var playerplaying = request.body.playerplaying;
    var itemChoices = request.body.itemChoices; 
    var rooms       = request.body.rooms;
    
    console.log("rooms :"+rooms);
    for (i=0; i < rooms.length; i++){ 
        console.log("room[" +i+ "]: "+ rooms[i]);
    }
    
    for (i=0; i < itemChoices.length; i++){    
        
        console.log("itemChoices.length: "+itemChoices.length);
        console.log("i: "+i);
        
    //    var itemTypeQuery = ItemType.findOne({itemTypeName: itemChoices[i]});
    //    var roomQuery = Room.findOne({name: rooms[i]});
       
        var foundItem = function(context,i) {
        // return a function here
        return function(err, ItemResults) {
            if(err) { console.log('fail'); }
            else {
                // do the magic with context and results
                console.log("found item type: "+ItemResults.itemTypeName);
                var thisItemType = ItemResults;
                Room.findOne({name: rooms[i]}, function(err, thisRoom){
                    
                    console.log("found room: "+ thisRoom.name);
                    
                    var newItemInRoomData = {
                itemName        : thisItemType.itemTypeName,
                //itemName    : itemChoices[i],
                roomName    : thisRoom.name,
                playerName  : playerplaying,
                domPts      : thisItemType.domPts //only reason i need to do a query here
            }
            console.log(newItemInRoomData);
            var newItemInRoom = new ItemInRoom(newItemInRoomData);
        
             var logData = {
                    log : newItemInRoom.playerName +" bought a " + newItemInRoom.itemName+ " and put it in "+ newItemInRoom.roomName+" for "+newItemInRoom.domPts+"dominance pts"
            }
            var newLogEntry = new GameLog(logData);
            console.log ("newLogEntry: "+newLogEntry.log);
            
            
            newItemInRoom.save();
            newLogEntry.save();
                    
                    
                    });
                
                
            }
        };
    }
       
        ItemType.findOne({itemTypeName: itemChoices[i]}, foundItem(this, i));
        
       /* itemTypeQuery.exec({}, function(err, thisItemType){
             roomQuery.exec({}, function(err, thisRoom){
             var newItemInRoomData = {
                itemName        : thisItemType.itemTypeName,
                //itemName    : itemChoices[i],
                roomName    : thisRoom.name,
                playerName  : playerplaying,
                domPts      : thisItemType.domPts //only reason i need to do a query here
            }
            console.log(newItemInRoomData);
            var newItemInRoom = new ItemInRoom(newItemInRoomData);
        
             var logData = {
                    log : newItemInRoom.playerName +" bought a " + newItemInRoom.itemName+ " and put it in "+ newItemInRoom.roomName+" for "+newItemInRoom.domPts
            }
            var newLogEntry = new GameLog(logData);
            console.log ("newLogEntry: "+newLogEntry.log);
            
            
            newItemInRoom.save();
            newLogEntry.save();
        });
             });
        */
            
    }//end for-loop
        
    response.redirect('/');
});


// ---------------------------ADMIN PAGE - ITEMS ---------------------------

//request submit page
app.get('/admin.html', function(request, response) {
    console.log("Requesting Submit Page");
    
    // build the query
    var query = ItemType.find({});
    query.sort('domPts',-1); //sort by date in descending order
    
    // run the query and display blog_main.html template if successful
    query.exec({}, function(err, allItemTypes){
        
        if (err){
            console.log('No Item Types Available');
            console.log(err);
        }
        
        // prepare template data
        templateData = {
            itemTypes : allItemTypes
        };
    
 
    response.render("admin.html", templateData);
    });
});

app.post('/admin.html', function(request, response){
    console.log("Inside app.post('/')");
    console.log("form received and includes")
    console.log(request.body);
    
    var newItemType = {
        itemTypeName : request.body.itemTypeName,
        picture : "picture url",
        domPts: request.body.domPts,
        cost: request.body.cost
    };
    /* can also say it like this:
      var newItemType = new ItemType();
      newItemType.itemTypeName = request.body.itemTypeName;
      newItemType.picture = request.body.picture;
      newItemType.domPts = request.body.domPts;
      newItemType.cost = request.body.cost;
      
      
      // it's *.nameonSchema = request.body.nameonhtmlform
    */
    
    // create a new blog post
    var itemType = new ItemType(newItemType);
    
    // save the blog post
    itemType.save();
    
    response.redirect('/admin.html');
});


// ---------------------------ADMIN PAGE - PLAYER ---------------------------

//request player page
app.get('/admin-player.html', function(request, response) {
    console.log("Requesting Player Page");
    
    // build the query
    var query = Player.find({});
    query.sort('money', 1); //sort by date in descending order
    
    // run the query and display blog_main.html template if successful
    query.exec({}, function(err, allPlayers){
        
        if (err){
            console.log('No Item Types Available');
            console.log(err);
        }
        
        // prepare template data
        templateData = {
            players : allPlayers
        };
    
 
    response.render("admin-player.html", templateData);
    });
});
app.post('/admin-player.html', function(request, response){
    console.log("Inside app.post('/player')");
    console.log("form received and includes")
    console.log(request.body);
    
    var newPlayer = {
        name : request.body.name,
        password : request.body.password
    };
    
    // create a new blog post
    var player = new Player(newPlayer);
    
    // save the blog post
    player.save();
    
    response.redirect('/admin-player.html');
});



// ---------------------------ADMIN PAGE - ROOM ---------------------------

//request submit page
app.get('/admin-room.html', function(request, response) {
    console.log("Requesting Room Page");
    
    // build the query
    var query = Room.find({});
    query.sort('name',-1); //sort by date in descending order
    
    // run the query and display blog_main.html template if successful
    query.exec({}, function(err, allRooms){
        
        if (err){
            console.log('No Item Types Available');
            console.log(err);
        }
        
        // prepare template data
        templateData = {
            rooms : allRooms
        };
    
 
    response.render("admin-room.html", templateData);
    });
});
app.post('/admin-room.html', function(request, response){
    console.log("Inside app.post('/player')");
    console.log("form received and includes")
    console.log(request.body);
    
    var newRoom = {
        name : request.body.name,
        domBonus : request.body.domBonus
    };
    
    // create a new blog post
    var room = new Room(newRoom);
    
    // save the blog post
    room.save();
    
    response.redirect('/admin-room.html');
});


/*app.get('/events/:eventNumber', function(request, response){
    
    //save requested card number
    eventNumber = request.params.eventNumber;
    
    // Get the card from cardArray
    eventData = eventsArray[eventNumber];
    
    if (eventData != undefined) {
        
        // Render the card_display template - pass in the cardData
        response.render("single-event.html", eventData);
        
    } else {
        // card not found. show the 'Card not found' template
        response.render("card_not_found.html");
        
    }
    
});

app.post('/events/:eventNumber', function(request, response){
   
   eventNumber = request.params.eventNumber;
   
   response.render("/submit.html", eventNumber);
    
});

app.get('/maptest.html', function(request, response){
    response.render("maptest.html");
});

*/

// Make server turn on and listen at defined PORT (or port 3000 if is not defined)
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});