// export Schemas to web.js
module.exports.configureSchema = function(Schema, mongoose) {
      
      
      
    //ItemTypes
    var ItemType = new Schema({
      itemTypeName     : String
    , picture   : String
    , cost      : Number
    , domPts    : Number
    , recurringPts: Number
    });
    
    // Items - 
 //   var Item = new Schema({
 //     itemtype  : {type: Schema.ObjectId, ref :'ItemType'}
    //, player    : String
    //, player    : {type: Schema.ObjectId, ref :'Player'}// use playername: String
//    });
    
      
    //to get a play in a room  
    var ItemInRoom = new Schema({
        itemName        : String,
        roomName    : String,
        playerName  : String,
        domPts      : Number
    });
    
    // Player - 
    var Player = new Schema({
      name     : String
    , password   : String
    , color   : String
    , money      : { type: Number, default: 100 }
    , items     : [ItemType]
//    , rooms     : [Room]
    });
    
    
    
    
    
    
    // Rooms - 
    var Room = new Schema({
      name      : String
    , domBonus : Number
//   , items     : [{ type: Schema.ObjectId, ref: 'Item' }]
//    , dominantPlayer      : {type: Player}
    });
    
 
    
    var GameLog = new Schema({
       log          : String,
       timestamp    : { type: Date, default: Date.now }
    });
    
/*
  Maybe.... Rooms have Items.
  Items are nested inside Rooms, and they have a player and an ItemType attached to them
  but some Items exist outside of rooms, like Super Brains and Office Hours with the residents
  
  several types of Items?
  ones that go in rooms (like zorb, interactive fish tank),
  ones that you keep as recurring (like super brain),
  ones that buy and use (office hours with resident, mountain dew)
*/
 

    // add schemas to Mongoose
    mongoose.model('ItemInRoom', ItemInRoom);
    mongoose.model('Room', Room);
    mongoose.model('ItemType', ItemType);
    mongoose.model('Player', Player);
    mongoose.model('GameLog', GameLog);


};