const { ObjectId } = require("mongodb"),
  { client, stringIsValid, validType } = require("../../public/script/codes"),
  jwt = require("jsonwebtoken"),
  timer = require("./timer"),
  { appname, site, email, SSH, NODE_ENV } = require("./../../config/config.js");

/**
 * For inspection of data received by client.
 */
class Inspector {
  constructor() {
    this.token = {
      sign: (value) => {
        return jwt.sign(value, SSH);
      },
      verify: (token) => {
        return jwt.verify(token, SSH);
      },
    };
    this.isDev = NODE_ENV !== "production";
  }

  render(response, view, data = {}) {
    data["acsrf"] = jwt.sign(timer.getMoment(), SSH);
    data["appname"] = appname;
    data["site"] = site;
    data["mailto"] = jwt.verify(email, SSH);
    data["year"] = new Date().getFullYear();
    return response.render(view, data);
  }

  isValidObjectID(objectId) {
    try {
      return ObjectId(objectId) ? true : false;
    } catch {
      return false;
    }
  }
  /**
   * Checks auth token validity
   * @param {JSON} token The masked session token
   * @param {String} clientType The global client type.
   */
  sessionTokenValid(token, clientType) {
    try {
      if (!ObjectId(token.id) || !token.uiid) return false;
      switch (clientType) {
        case client.student:
          if (!token.classname) return false;
        default:
          return true;
      }
    } catch (e) {
      return false;
    }
  }
  instDocValid(doc) {
    //validate institute registration doc.
    return true;
  }

  randomCode(length = 6) {
    let result = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  emailValid = (emailstring) => stringIsValid(emailstring, validType.email);
  passValid = (passstring) => stringIsValid(passstring, validType.password);
}

module.exports = new Inspector();
