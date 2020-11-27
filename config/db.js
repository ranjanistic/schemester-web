const {MongoClient} = require('mongodb'),
  {db} = require('./config.json'),
  {token} = require("./../workers/common/inspector");

var dbobj;
module.exports = {
  connectToDB: (key, callback )=>{
    try{
      if(!token.verify(key)) throw 403;
      MongoClient.connect(
        true
        ?`mongodb+srv://${token.verify(db.username)}:${token.verify(db.pass)}@realmcluster.njdl8.mongodb.net/${db.name}?retryWrites=true&w=majority`
        :`mongodb://localhost:27017/${db.name}`,
        { useNewUrlParser: true , useUnifiedTopology: true}, ( err, client )=> {
        if(!err) dbobj = client.db(db.name);
        return callback( err,db.name );
      });
    } catch(e){
      return callback("ACCESS DENIED:DB KEY FAILURE")
    }
  },
  getAdmin:(key)=>{
    try{
      if(token.verify(key)) return dbobj.collection(db.admin_collection);
      throw 403
    } catch(e){
      console.log("ACESSS DENIED:COLLECTION 0 KEY FAILURE");
    }
    return null;
  },
  getInstitute:(key)=>{
    try{
      if(token.verify(key)) return dbobj.collection(db.institute_collection);
      throw 403
    } catch(e){
      console.log("ACESSS DENIED:COLLECTION 1 KEY FAILURE");
    }
    return null;
  }
};
