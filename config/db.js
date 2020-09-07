const {code} = require('../public/script/codes'),
MongoClient = require('mongodb').MongoClient,
getLink=(cloud=false)=>cloud?`mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/${code.db.DBNAME}?retryWrites=true&w=majority`:`mongodb://localhost:27017/${code.db.DBNAME}`;
var _db;

module.exports = {
  connectToServer: ( callback )=>{
    MongoClient.connect(
       getLink(),
      { useNewUrlParser: true , useUnifiedTopology: true}, function( err, client ) {
      _db  = client.db(code.db.DBNAME);
      return callback( err );
    });
  },

  getDb: ()=>{
    return _db;
  },
  getAdmin:()=>{
    return _db.collection(code.db.ADMIN_COLLECTION)
  },
  getInstitute:()=>{
    return _db.collection(code.db.INSTITUTE_COLLECTION)
  }
};