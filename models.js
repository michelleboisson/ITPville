// export Schemas to web.js
module.exports.configureSchema = function(Schema, mongoose) {
      
    // Player - 
    var Player = new Schema({
      name     : String
    , password   : String
    , color   : String
    , money      : { type: Number, default: 25 }
    , items     : [Item]
//    , rooms     : [Room]
    });
    
    // Rooms - 
    Room = new Schema({
      name      : String
    , domBonus : Number
    , items     : [Item] 
//    , dominantPlayer      : {type: Player}
    });
    
    //ItemTypes
    var ItemType = new Schema({
      itemTypeName     : String
    , picture   : String
    , domPts    : Number
    , cost      : Number
    });
    
    // Items - 
    var Item = new Schema({
      itemtype      : {type: Schema.ObjectId, ref :'ItemType'}
    , room      : {type: Schema.ObjectId, ref :'Room'}
    , player  : {type: Schema.ObjectId, ref :'Player'}
    });
    

 

    // add schemas to Mongoose
    mongoose.model('Room', Room);
    mongoose.model('ItemType', ItemType);
    mongoose.model('Item', Item);
    mongoose.model('Player', Player);

};