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
    
    // run the query and display blog_main.html template if successful
    query.exec({}, function(err, allItemTypes){
        
        queryRooms.exec({}, function(err, allRooms){
        
        if (err){
            console.log('No Item Types Available');
            console.log(err);
        }
               
        // prepare template data
        templateData = {
            itemTypes : allItemTypes,
            rooms : allRooms,
            pageTitle : 'ITPville'
        };
        
        console.log("allItemTypes contains");
        console.log(allItemTypes);
        console.log("*****************");

        response.render("home.html", templateData);
        });
    });
});

app.post('/', function(request, response){
    console.log("Inside app.post('/')");
    console.log("form received and includes");
    console.log(request.body);
    

    var itemChoices = request.body.itemChoices;
    var room        = request.body.rooms;
    console.log ("room[0]: "+room[0]);
    //loop through all choices
    console.log ("outside loop itemChoices.length: "+itemChoices.length);
    
    for (a=0; a < itemChoices.length; a++){
        
        //find the room the item belongs to
        //console.log ("itemChoices.length: + a : "+itemChoices.length + " " +a);
        
        Room.findOne({name:room[a]}, function(err,thisRoom){
            //create itemData from inputted data
            
            console.log("thisRoom is:" + thisRoom.name);
            console.log("thisRoom is:" + thisRoom);
        
            ItemType.findOne({name:itemChoices[a]}, function(err, thisItemType){
                
            
            var itemData = {
                itemtype : thisItemType,
                player : "Player1"
            }
            console.log("itemData: " + itemData);
        
            //create the new Item
            var newItem = new Item(itemData);
        
            //append the item to the room
            thisRoom.items.push(newItem);
    
            //create new log
            var newLogEntry = new GameLog(itemData.player+ " bought a " + itemData.itemType + " and put it in "+ thisRoom.name);
            console.log ("newLogEntry: "+newLogEntry);
            // save
            thisRoom.save();
            });

        });
    }
   
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
    query.sort('name',-1); //sort by date in descending order
    
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