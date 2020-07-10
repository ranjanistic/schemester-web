const mongoose = require('mongoose')
const Schema = mongoose.Schema
class Admins{
    constructor(){
        this.adminschema = new Schema({
            name:String,
            email:{type:String,unique: true},
            password:String,
            verified:Boolean,
            active:Boolean,
            ip:String
        });
    }
    getSchema(){
        return this.adminschema;
    }
    getModelOf(adminemailCollection,create = false){
        return mongoose.model(adminemailCollection,this.adminschema,adminemailCollection,!create);
    }
}

module.exports = new Admins();