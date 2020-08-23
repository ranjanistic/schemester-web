const code = require("../../public/script/codes"),
  time = require("./timer"),
  share = require("./sharedata"),
  { ObjectId } = require("mongodb"),
  Institute = require("../../collections/Institutions"),
  Admin = require("../../collections/Admins");

class PasswordReset {
  constructor() {
    this.type = "resetpassword";
    this.target = new Target();
    this.domain = "http://localhost:3000";
    this.defaultValidity = 15; //min
  }
  generateLink = async(target, data = {}, validity = this.defaultValidity)=>{
    const exp = time.getTheMomentMinute(validity);
    let link = String();
    switch (target) {
      case this.target.admin:
        {
          const admin = await Admin.findOneAndUpdate(
            { _id: ObjectId(data.uid) },
            {
              $set: {
                rlinkexp: exp,
              },
            }
          );
          if(!admin) return false;
          link = `${this.domain}/${target}/external?type=${this.type}&u=${data.uid}&exp=${exp}`;
        }
        break;
      default: {
        //same pattern for teacher & student
        link = `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&u=${data.uid}&exp=${exp}`;
      }
    }
    return {
      exp: exp,
      link: link,
    };
  }
  /**
   * If given time parameter is still greater than the current time, in SGT notation.
   * @param expiryTime The time to be checked valid in SGT notation.
   * @returns A boolean value, if valid, true, otherwise false.
   */
  isValidTime=(expiryTime)=> time.getTheMomentMinute() < Number(expiryTime);
  
  handlePasswordResetLink = async (query, clientType) => {
    switch (clientType) {
      case this.target.admin: {
        if (!query.u && !query.exp) return false;
        try {
          const admin = await Admin.findOne({ '_id': ObjectId(query.u) });
          if (!admin || !admin.rlinkexp) return false;
          if(Number(query.exp) != Number(admin.rlinkexp)) return false;
          if (!this.isValidTime(admin.rlinkexp)){
            const doc = await Admin.findOneAndUpdate({'_id':ObjectId(query.u)},{$unset:{rlinkexp:null}});
            return { user: { expired: true } };
          }
          return {user:share.getAdminShareData(admin)}
        }catch(e){
            return false;
        }
      }break;
      case this.target.teacher: {
        if (!(query.u && query.in)) return false;
        try {
            let teacherinst = await Institute.findOne(
              {
                "_id": ObjectId(query.in),
                "users.teachers": { $elemMatch: { "_id": ObjectId(query.u) } },
              },
              {
                projection: {
                  "_id":0,
                  "users.teachers.$": 1,
                },
              }
            );
            if (!teacherinst) return false;
            const teacher = teacherinst.users.teachers[0];
            if (!teacher || !teacher.rlinkexp) return false;
            if (!this.isValidTime(teacher.rlinkexp)) return { user: { expired: true } };
            return {user:share.getTeacherShareData(teacher)};
        } catch (e) {
            clog(e);
            return false;
        }
      } break;
      case this.target.student:{
        if (!(query.u && query.in && query.cls)) return false;
        try {
            let studclass = await Institute.findOne({
                '_id':ObjectId(query.in),
                'users.classes':{$elemMatch:{'_id':ObjectId(query.cls)}}
            },{
                $projection:{
                    '_id':0,
                    'users.classes.$':1
                }
            });
            if(!studclass) return false;
            let thestudent;
            let found = studclass.users.classes[0].students.some((student,_)=>{
                thestudent = share.getStudentShareData(student)
                return String(student._id) == String(query.u)
            });
            if(!found) return false;
            if(!this.isValidTime(thestudent.rlinkexp)) return {user:{expired:true}};
            return {user:thestudent};
        }catch{
            return false;
        }
      }
    }
  };
}  

/**
 * For target groups in different methods of verification purposes.
 */
class Target {
  constructor() {
    this.admin = "admin";
    this.teacher = "teacher";
    this.student = "student";
  }
}

module.exports = new PasswordReset();