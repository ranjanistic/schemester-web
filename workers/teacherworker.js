const Institute = require("../collections/Institutions"),
  view = require("../hardcodes/views"),
  code = require("../public/script/codes"),
  { ObjectId } = require("mongodb");
class TeacherWorker {
  constructor() {
    this.self = new Self();
    this.schedule = new Schedule();
    this.classroom = new Classroom();
  }
  toSession = (u, query = { target: view.teacher.target.dash }) => {
    let path = `/teacher/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.teacher.target.dash }) => {
    let i = 0;
    let path = "/teacher/auth/login";
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path =
          i > 0
            ? `${path}&${key}=${query[key]}`
            : `${path}?${key}=${query[key]}`;
        i++;
      }
    }
    return path;
  };
}

class Self {
  constructor() {
    const path = `users.teachers`
    class Account {
      constructor() {
        this.username = 'username';
        this.uid = '_id';
        this.teacherID = 'teacherID';
        this.password = 'password';
        this.createdAt = 'createdAt';
        this.verified = 'verified';
        this.vlinkexp = 'vlinkexp';
        this.rlinkexp = 'rlinkexp';
      }
      //send feedback emails

      async createAccount(newadmin){
        const result = await Admin.insertOne(newadmin);
        return result.insertedCount==0?result.ops[0]:code.event(code.NO)
      }

      /**
       * To change current teacher's user name
       */
      changeName = async (user, body) => {
        const namepath = `${path}.$.${this.username}`;
        const newteacher = await Institute.findOneAndUpdate({uiid:user.uiid, [path]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}},{
          $set:{
            [namepath]:body.newname
          }  
        });
        return code.event(newteacher ? code.OK : code.NO);
      };

      /**
       * To change current teacher's user password
       */
      changePassword = async (user, body) => {
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(body.newpassword, salt);
        const passpath = `${path}.$.${this.password}`;
        const newteacher = await Institute.findOneAndUpdate({uiid:user.uiid, [path]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}},{
          $set:{
            [passpath]:epassword
          },
          $unset: {
            [passpath]: null,
          },  
        });
        return code.event(newteacher ? code.OK : code.NO);
      };

      /**
       * 
       */
      changeEmailID = async (user, admin, body) => {
        if (admin.email == body.newemail)
          return code.event(code.auth.SAME_EMAIL);
        const someadmin = await Admin.findOne({ email: body.newemail });
        if (someadmin) return code.event(code.auth.USER_EXIST);
        const newadmin = await Admin.findOneAndUpdate(
          { _id: ObjectId(user.id) },
          {
            $set: {
              [this.teacherID]: body.newemail,
              verified: false,
            },
          }
        );
        return newadmin?code.event(
          (await this.defaults.admin.setEmail(user, body)) ? code.OK : code.NO
        ):code.event(code.NO);
      };

      /**
       * 
       */
      changePhone = async (user, body) => {
        return code.event(
          (await this.defaults.admin.setPhone(user, body)) ? code.OK : code.NO
        );
      };

      /**
       * 
       */
      deleteAccount = async (user) => {
        const del = await Admin.findOneAndDelete({ _id: ObjectId(user.id) });
        return code.event(del ? code.OK : code.NO);
      };
    }
    class Preferences{
      constructor(){
        this.object = `prefs`;
        this.showemailtoteacher = 'showemailtoteacher';
        this.showphonetoteacher = 'showphonetoteacher';
        this.showemailtostudent = 'showemailtostudent';
        this.showphonetostudent = 'showphonetostudent';
      }
      getSpecificPath(specific){
        return `${this.object}.${specific}`;
      }
      async setPreference(user,body){
        let value;
        switch(body.specific){
          case this.showemailtoteacher:{value = body.show}break;
          case this.showphonetoteacher:{value = body.show}break;
          case this.showemailtostudent:{value = body.show}break;
          case this.showphonetostudent:{value = body.show}break;
          default:return null;
        }
        const adoc = await Admin.findOneAndUpdate({"_id":ObjectId(user.id)},{
          $set:{
            [this.getSpecificPath(body.specific)]:value
          }
        });
        return code.event(adoc?code.OK:code.NO);
      }
      async getPreference(user,body){
        switch(body.specific){
          case this.showemailtoteacher:break;
          case this.showphonetoteacher:break;
          case this.showemailtostudent:break;
          case this.showphonetostudent:break;
          default:{
            const adoc = await Admin.findOne({"_id":ObjectId(user.id)});
            return code.event(adoc?adoc.prefs:code.NO);
          }
        }
        const adoc = await Admin.findOne({"_id":ObjectId(user.id)});
        clog(adoc[this.getSpecificPath(body.specific)]);
        return code.event(adoc?adoc[this.getSpecificPath(body.specific)]:code.NO);
      }
      
    }
    this.account = new Account();
    this.prefs = new Preferences();
  }

  handleAccount = async (user, body,teacher) => {
    switch (body.action) {
      case code.action.CHANGE_NAME:
        return await this.account.changeName(user, body);
      case code.action.CHANGE_PASSWORD:
        return await this.account.changePassword(user, body);
      case code.action.CHANGE_ID:
        return await this.account.changeEmailID(user, teacher, body);
      case code.action.CHANGE_PHONE:
        return await this.account.changePhone(user, body);
      case code.action.ACCOUNT_DELETE:
        return await this.account.deleteAccount(user);
    }
  };
  handlePreferences = async (user, body) => {
    switch (body.action) {
      case "set": return await this.prefs.setPreference(user,body);
      case "get": return await this.prefs.getPreference(user,body)
    }
  };
  handleVerification = async (user, body) => {
    switch (body.action) {
      case "send": {
        const linkdata = await verify.generateLink(verify.target.teacher, {
          uid: user.id,
        });
        clog(linkdata);
        //todo: send email then return.
        return code.event(
          linkdata ? code.mail.MAIL_SENT : code.mail.ERROR_MAIL_NOTSENT
        );
      }
      case "check": {
        const admin = await Admin.findOne({ _id: ObjectId(user.id) });
        if (!admin) return code.event(code.auth.USER_NOT_EXIST);
        return code.event(
          admin.verified ? code.verify.VERIFIED : code.verify.NOT_VERIFIED
        );
      }
    }
  };
  handlePassReset = async (user, body) => {
    switch (body.action) {
      case "send":{
          const linkdata = await reset.generateLink(verify.target.teacher, {
            uid: user.id,
          });
          clog(linkdata);
          //todo: send email then return.
          return code.event(
            linkdata ? code.mail.MAIL_SENT : code.mail.ERROR_MAIL_NOTSENT
          );
      }break;
    }
  };
}


class Schedule{
  constructor(){}
  getSchedule = async (user, dayIndex = null) => {
    const teacheruser = await Institute.findOne(
      {
        uiid: user.uiid,
        "users.teachers": { $elemMatch: { "_id": ObjectId(user.id) } },
      },
      { projection: { "_id": 0, "users.teachers.$": 1 } }
    );
    if (!teacheruser)
      return session.finish(res).then((response) => {
        if (response) res.redirect(this.toLogin());
      });
    const teacher = teacheruser.users.teachers[0];
    const teacherschedule = await Institute.findOne(
      {
        uiid: user.uiid,
        "schedule.teachers": { $elemMatch: { teacherID: teacher.teacherID } },
      },
      {
        projection: {
          "_id":0,
          "default": 1,
          "schedule.teachers.$": 1,
        },
      }
    );
    clog(teacherschedule);
    if (!teacherschedule) return false;
    const schedule = teacherschedule.schedule.teachers[0].days;
    const timings = teacherschedule.default.timings;
    if (dayIndex==null) return { schedule: schedule, timings:timings};
    let today = teacherschedule.schedule.teachers[0].days[0];
    const found = schedule.some((day, index) => {
      if (day.dayIndex == dayIndex) {
        today = day;
        return true;
      }
    });
    if (!found) return { schedule: false, timings:timings};
    return { schedule: today, timings:timings};
  };
  

}

class Classroom{
  constructor(){

  }
  async getClassroom(user,classname){
    const classdoc = await Institute.findOne({
      uiid:user.uiid,"users.classes":{$elemMatch:{"classname":classname}}
    },{projection:{"users.classes.$":1}});
    if(!classdoc) return {teacher:teacher,classroom:false}
    return {classroom :classdoc.users.classes[0]}
  }
}

const clog = (m) =>console.log(m);
module.exports = new TeacherWorker();