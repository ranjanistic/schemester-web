if(process.env.NODE_ENV == 'development')
 require("dotenv").config({ silent: process.env.NODE_ENV === 'production' });

const {ObjectId} = require("mongodb"),{client,stringIsValid,validType} = require("../../public/script/codes"),jwt = require("jsonwebtoken");

/**
 * For inspection of data received by client.
 */
class Inspector{
    constructor(){
      this.token = {
        sign:(value)=>{
          return jwt.sign(value,process.env.SSH)
        },
        verify:(token)=>{
          return jwt.verify(token,process.env.SSH)
        },
      }
    }
    /**
     * Checks auth token validity
     * @param {JSON} token The masked session token
     * @param {String} clientType The global client type.
     */
    sessionTokenValid(token,clientType){
      try{
        if(!ObjectId(token.id)||!token.uiid) return false;
        switch(clientType){
          case client.student:if(!token.classname) return false;
          default:return true;
        }
      } catch(e){
        return false;
      }
    }
    instDocValid(doc){  //validate institute registration doc.
      return true;
    }
    emailValid=(emailstring)=>stringIsValid(emailstring,validType.email)
    passValid =(passstring)=>stringIsValid(passstring,validType.password)

}

module.exports = new Inspector();