const Admin = require("../collections/Admins"),
  Institute = require("../collections/Institutions"),
  view = require("../hardcodes/views"),
  bcrypt = require("bcryptjs"),
  code = require("../public/script/codes"),
  invite = require("./common/invitation"),
  verify = require("./common/verification"),
  reset = require("./common/passwordreset"),
  { ObjectId } = require("mongodb"),
  session = require("./common/session");
const { findOneAndUpdate } = require("../collections/Admins");

class AdminWorker {
  constructor() {
    this.self = new Self();
    this.default = new Default();
    this.users = new Users();
    this.schedule = new Schedule();
    this.invite = new Invite();
    this.vacation = new Vacations();
    this.prefs = new Preferences();
  }
  toSession = (u, query = { target: view.admin.target.dashboard }) => {
    let path = `/admin/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.admin.target.dashboard }) => {
    let i = 0;
    let path = "/admin/auth/login";
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
    class Account {
      constructor() {
        this.defaults = new Default();
        this.username = "username";
        this.email = "email";
        this.password = "password";
        this.uiid = "uiid";
        this.createdAt = "createdAt";
        this.verified = "verified";
        this.vlinkexp = "vlinkexp";
        this.rlinkexp = "rlinkexp";
      }
      //send feedback emails

      async createAccount(newadmin) {
        const result = await Admin.insertOne(newadmin);
        return result.insertedCount == 0 ? result.ops[0] : code.event(code.NO);
      }

      /**
       *
       */
      changeName = async (user, body) => {
        const newadmin = await Admin.findOneAndUpdate(
          { _id: ObjectId(user.id) },
          { $set: { [this.username]: body.newname } }
        );
        return newadmin
          ? code.event(
              (await this.defaults.admin.setName(user, body))
                ? code.OK
                : code.NO
            )
          : code.event(code.NO);
      };
      /**
       *
       */
      changePassword = async (user, body) => {
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(body.newpassword, salt);
        const newpassadmin = await Admin.findOneAndUpdate(
          { _id: ObjectId(user.id) },
          {
            $set: {
              [this.password]: epassword,
            },
            $unset: {
              [this.rlinkexp]: null,
            },
          }
        );
        return code.event(newpassadmin ? code.OK : code.NO);
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
              [this.email]: body.newemail,
              verified: false,
            },
          }
        );
        return newadmin
          ? code.event(
              (await this.defaults.admin.setEmail(user, body))
                ? code.OK
                : code.NO
            )
          : code.event(code.NO);
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
    class Preferences {
      constructor() {
        this.object = `prefs`;
        this.showemailtoteacher = "showemailtoteacher";
        this.showphonetoteacher = "showphonetoteacher";
        this.showemailtostudent = "showemailtostudent";
        this.showphonetostudent = "showphonetostudent";
      }
      getSpecificPath(specific) {
        return `${this.object}.${specific}`;
      }
      async setPreference(user, body) {
        let value;
        switch (body.specific) {
          case this.showemailtoteacher:
            {
              value = body.show;
            }
            break;
          case this.showphonetoteacher:
            {
              value = body.show;
            }
            break;
          case this.showemailtostudent:
            {
              value = body.show;
            }
            break;
          case this.showphonetostudent:
            {
              value = body.show;
            }
            break;
          default:
            return null;
        }
        const adoc = await Admin.findOneAndUpdate(
          { _id: ObjectId(user.id) },
          {
            $set: {
              [this.getSpecificPath(body.specific)]: value,
            },
          }
        );
        return code.event(adoc ? code.OK : code.NO);
      }
      async getPreference(user, body) {
        switch (body.specific) {
          case this.showemailtoteacher:
            break;
          case this.showphonetoteacher:
            break;
          case this.showemailtostudent:
            break;
          case this.showphonetostudent:
            break;
          default: {
            const adoc = await Admin.findOne({ _id: ObjectId(user.id) });
            return code.event(adoc ? adoc.prefs : code.NO);
          }
        }
        const adoc = await Admin.findOne({ _id: ObjectId(user.id) });
        clog(adoc[this.getSpecificPath(body.specific)]);
        return code.event(
          adoc ? adoc[this.getSpecificPath(body.specific)] : code.NO
        );
      }
    }
    this.account = new Account();
    this.prefs = new Preferences();
  }

  handleAccount = async (user, body, admin) => {
    switch (body.action) {
      case code.action.CHANGE_NAME:
        return await this.account.changeName(user, body);
      case code.action.CHANGE_PASSWORD:
        return await this.account.changePassword(user, body);
      case code.action.CHANGE_ID:
        return await this.account.changeEmailID(user, admin, body);
      case code.action.CHANGE_PHONE:
        return await this.account.changePhone(user, body);
      case code.action.ACCOUNT_DELETE:
        return await this.account.deleteAccount(user);
    }
  };
  handlePreferences = async (user, body) => {
    switch (body.action) {
      case "set":
        return await this.prefs.setPreference(user, body);
      case "get":
        return await this.prefs.getPreference(user, body);
    }
  };
  handleVerification = async (user, body) => {
    switch (body.action) {
      case "send": {
        const linkdata = await verify.generateLink(verify.target.admin, {
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
      case "send":
        {
          const linkdata = await reset.generateLink(verify.target.admin, {
            uid: user.id,
          });
          clog(linkdata);
          //todo: send email then return.
          return code.event(
            linkdata ? code.mail.MAIL_SENT : code.mail.ERROR_MAIL_NOTSENT
          );
        }
        break;
    }
  };
}

class Default {
  constructor() {
    const object = "default";
    class Admin {
      constructor() {
        this.object = "admin";
        this.path = `${object}.${this.object}`;
        this.namepath = `${this.path}.username`;
        this.emailpath = `${this.path}.email`;
        this.phonepath = `${this.path}.phone`;
      }
      async setEmail(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          {
            $set: {
              [this.emailpath]: body.newemail,
            },
          }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setName(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          {
            $set: {
              [this.namepath]: body.newname,
            },
          }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setPhone(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          {
            $set: {
              [this.phonepath]: body.newphone,
            },
          }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async getInfo() {}
    }
    class Institution {
      constructor() {
        this.object = "institute";
        this.path = `${object}.${this.object}`;
        this.namepath = `${this.path}.instituteName`;
        this.emailpath = `${this.path}.email`;
        this.phonepath = `${this.path}.phone`;
      }
      async setName(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.namepath]: body.newname } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setEmail(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.emailpath]: body.newemail } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setPhone(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.phonepath]: body.newphone } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async getInfo() {}
    }
    class Timing {
      constructor() {
        this.object = "timings";
        this.path = `${object}.${this.object}`;
        this.startpath = `${this.path}.startTime`;
        this.breakstartpath = `${this.path}.breakStartTime`;
        this.periodminpath = `${this.path}.periodMinutes`;
        this.breakminpath = `${this.path}.breakMinutes`;
        this.totalperiodspath = `${this.path}.periodsInDay`;
        this.daysinweekpath = `${this.path}.daysInWeek`;
      }
      async setStartTime(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.startpath]: body.start } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setBreakStartTime(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.breakstartpath]: body.breakstart } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setPeriodDuration(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.periodminpath]: Number(body.periodduration) } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setBreakDuration(user, body) {
        clog(body);
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.breakminpath]: Number(body.breakduration) } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }

      async setPeriodsInDay(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.totalperiodspath]: Number(body.totalperiods) } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setDaysInWeek(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.daysinweekpath]: body.daysinweek } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async getInfo() {}
    }
    this.admin = new Admin();
    this.institute = new Institution();
    this.timings = new Timing();
  }
  handleAdmin = async (user, inst, body) => {
    switch (body.action) {
      case code.action.CHANGE_NAME:
        return await this.admin.setName();
      case code.action.CHANGE_ID:
        return await this.admin.setEmail();
      case code.action.CHANGE_PHONE:
        return await this.admin.setPhone();
    }
  };
  handleInstitute = async (user, body) => {
    switch (body.action) {
      case code.action.CHANGE_NAME:
        return await this.institute.setName(user, body);
      case code.action.CHANGE_ID:
        return await this.institute.setEmail(user, body);
      case code.action.CHANGE_PHONE:
        return await this.institute.setPhone(user, body);
    }
  };
  handleTimings = async (user, body) => {
    switch (body.action) {
      case code.action.CHANGE_START_TIME:
        return await this.timings.setStartTime(user, body);
      case code.action.CHANGE_BREAK_START_TIME:
        return await this.timings.setBreakStartTime(user, body);
      case code.action.CHANGE_PERIOD_DURATION:
        return await this.timings.setPeriodDuration(user, body);
      case code.action.CHANGE_BREAK_DURATION:
        return await this.timings.setBreakDuration(user, body);
      case code.action.CHANGE_TOTAL_PERIODS:
        return await this.timings.setDaysInWeek(user, body);
      case code.action.CHANGE_WORKING_DAYS:
        return await this.timings.setPeriodsInDay(user, body);
    }
  };
  handleRegistration = async (user, body) => {
    //todo:validation
    clog(body.data);
    const existingInst = await Institute.findOne({ uiid: user.uiid });
    if (existingInst) {
      const doc = Institute.findOneAndUpdate(
        { uiid: user.uiid },
        {
          $set: {
            default: body.data.default,
          },
        }
      );
      return code.event(
        doc
          ? code.inst.INSTITUTION_CREATED
          : code.inst.INSTITUTION_CREATION_FAILED
      );
    }
    const registerdoc = {
      uiid: user.uiid,
      default: body.data.default,
      users: {
        teachers: [],
        classes: [],
      },
      schedule: {
        teachers: [],
        classes: [],
      },
      invite: {
        teacher: {
          active: false,
          createdAt: 0,
          expiresAt: 0,
        },
      },
      restricted: false,
      vacations: [],
      preferences: {},
    };
    const done = await Institute.insertOne(registerdoc);
    return code.event(
      done.insertedCount == 1
        ? code.inst.INSTITUTION_CREATED
        : code.inst.INSTITUTION_CREATION_FAILED
    );
  };
}

/**
 * For work under 'users' subdocument.
 */
class Users {
  constructor() {
    class TeacherAction {
      constructor() {}
      searchTeacher = async (inst, body) => {
        let teachers = Array();
        inst.users.teachers.forEach((teacher, t) => {
          if (
            String(teacher.username)
              .toLowerCase()
              .includes(String(body.q).toLowerCase()) ||
            String(teacher.teacherID)
              .toLowerCase()
              .includes(String(body.q).toLowerCase())
          ) {
            teachers.push({
              username: teacher.username,
              teacherID: teacher.teacherID,
              teacherUID: teacher._id,
            });
          }
        });
        clog(teachers);
        return {
          event: code.OK,
          teachers: teachers,
        };
      };
    }
    class ClassAction {
      constructor() {}
      searchClass = async (inst, body) => {
        let classes = Array();
        inst.users.classes.forEach((Class, t) => {
          if (
            String(Class.classname)
              .toLowerCase()
              .includes(String(body.q).toLowerCase()) ||
            String(Class.inchargeID)
              .toLowerCase()
              .includes(String(body.q).toLowerCase())
          ) {
            classes.push({
              classname: Class.classname,
              inchargeID: Class.inchargeID,
              classUID: Class._id,
            });
          }
        });
        clog(classes);
        return {
          event: code.OK,
          classes: classes,
        };
      };
    }
    this.teachers = new TeacherAction();
    this.classes = new ClassAction();
  }
  handleUserSearch = async (inst, body) => {
    switch (body.target) {
      case "teacher":
        return await this.teachers.searchTeacher(inst, body);
      case "student":
        return await this.classes.searchClass(inst, body);
    }
  };
  handleTeacherAction = async (inst, body) => {
    switch (body.action) {
    }
  };
  handleClassAction = async (inst, body) => {
    switch (body.action) {
    }
  };
}

/**
 * For work under 'schedule' subdocument.
 */
class Schedule {
  constructor() {
    const defaults = new Default();
    class TeacherAction {
      constructor() {}
      async scheduleUpload(inst, body) {

        let overwriting = false; //if existing teacher schedule being overwritten after completion.
        let incomplete = false; //if existing teacher schedule being rewritten without completion.
        let found = inst.schedule.teachers.some((teacher, index) => {
          if (teacher.teacherID == body.teacherID) {
            overwriting =
              teacher.days.length == inst.default.timings.daysInWeek.length;
            if (!overwriting) {
              incomplete = teacher.days.some((day, index) => {
                if (body.data.dayIndex <= day.dayIndex) {
                  return true;
                }
              });
            }
            return true;
          }
        });
        if (overwriting) {
          //completed schedule, must be edited from schedule view.
          return code.event(code.schedule.SCHEDULE_EXISTS);
        }
        if (incomplete) {
          //remove teacher schedule
          Institute.findOneAndUpdate(
            { uiid: inst.uiid },
            {
              $pull: {
                "schedule.teachers": { teacherID: body.teacherID },
              },
            }
          );
          found = false; //add as a new teacher schedule
        }
        let clashClass, clashPeriod, clashTeacher;
        let clashed = inst.schedule.teachers.some((teacher, _) => {
          let clashed = teacher.days.some((day, _) => {
            if (day.dayIndex == body.data.dayIndex) {
              let clashed = day.period.some((period, pindex) => {
                if (period.classname == body.data.period[pindex].classname) {
                  clashClass = period.classname;
                  clashPeriod = pindex;
                  return true;
                }
              });
              if (clashed) {
                return true;
              }
            }
          });
          if (clashed) {
            clashTeacher = teacher.teacherID;
            return true;
          }
        });
        if (clashed) {
          //if some period clashed with an existing teacher.
          return {
            event: code.schedule.SCHEDULE_CLASHED,
            clash: {
              classname: clashClass,
              period: clashPeriod,
              teacherID: clashTeacher,
            },
          };
        }
        if (found) {
          //existing teacher schedule, incomplete (new day index)
          const doc = await Institute.findOneAndUpdate(
            {
              uiid: inst.uiid,
              "schedule.teachers": {
                $elemMatch: { teacherID: body.teacherID },
              },
            },
            {
              $push: { "schedule.teachers.$[outer].days": body.data }, //new day push
            },
            {
              arrayFilters: [{ "outer.teacherID": body.teacherID }],
            }
          );
          clog("schedule appended?");
          if (doc) return code.event(code.schedule.SCHEDULE_CREATED); //new day created.
        } else {
          //no existing schedule teacherID
          const doc = await Institute.findOneAndUpdate(
            { uiid: inst.uiid },
            {
              $push: {
                "schedule.teachers": {
                  teacherID: body.teacherID,
                  days: [body.data],
                },
              }, //new teacher schedule push
            }
          );
          clog("schedule created?");
          if (doc) return code.event(code.schedule.SCHEDULE_CREATED); //new teacher new day created.
        }
      }
      /**
       * To receive data under schedule.teachers
       * @param {Document} inst
       * @param {JSON} body
       */
      async scheduleReceive(inst, body) {
        let filter, options;
        console.log(body);
        switch (body.specific) {
          case "single":
            {
              filter = {
                uiid: inst.uiid,
                "schedule.teachers": {
                  $elemMatch: { teacherID: body.teacherID },
                },
              };
              options = { projection: { _id: 0, "schedule.teachers.$": 1 } };
            }
            break;
          case "classes":
            {
              let newClasses = Array();
              inst.schedule.teachers.forEach((teacher, tindex) => {
                teacher.days.forEach((day, _) => {
                  day.period.forEach((period, _) => {
                    if (!newClasses.includes(period.classname)) {
                      newClasses.push(period.classname);
                    }
                  });
                });
              });
              clog(newClasses);
              return {
                event: code.OK,
                classes: newClasses,
              };
            }
            break;
          default: {
            filter = { uiid: inst.uiid };
            options = { projection: { _id: 0, "schedule.teachers": 1 } };
          }
        }
        const teacherInst = await Institute.findOne(filter, options);
        if (!teacherInst) {
          console.log("no");
          return code.event(code.schedule.SCHEDULE_NOT_EXIST);
        }
        switch (body.specific) {
          case "single":
            {
              console.log(teacherInst.schedule.teachers[0]);
              return {
                event: code.OK,
                schedule: teacherInst.schedule.teachers[0],
              };
            }
            break;
          case "classes":
            {
            }
            break;
          default:
            return {
              event: code.OK,
              teachers: teacherInst.schedule.teachers,
            };
        }
      }
      async scheduleUpdate(user, inst, body) {
        switch (body.specific) {
          case "renameclass":
            {
              if (body.teacherID) {
                clog(body);
                //only change in class shift of a teacher
                const path = `schedule.teachers.$[outer].days.$[outer1].period.${body.period}.classname`;
                //check clash with other teachers
                const clash = inst.schedule.teachers.some((teacher, t) => {
                  if (teacher.teacherID != body.teacherID) {
                    const clash = teacher.days.some((day, d) => {
                      if (day.dayIndex == body.dayIndex) {
                        return (
                          day.period[body.period].classname == body.newclassname
                        );
                      }
                    });
                    return clash;
                  }
                });
                if (clash) return code.event(code.schedule.SCHEDULE_CLASHED); //clashed
                const instdoc = await Institute.findOneAndUpdate(
                  {
                    uiid: user.uiid,
                    "schedule.teachers": {
                      $elemMatch: { teacherID: body.teacherID },
                    },
                  },
                  {
                    $set: {
                      [path]: body.newclassname,
                    },
                  },
                  {
                    arrayFilters: [
                      { "outer.teacherID": body.teacherID },
                      { "outer1.dayIndex": body.dayIndex },
                    ],
                  }
                );
                clog(instdoc);
                return code.event(instdoc ? code.OK : code.NO);
              } else {
                //todo: change in classname of all teachers (correction type)
                clog(body);

                // if (found) {
                //   return {
                //     event: code.schedule.SCHEDULE_CLASHED,
                //     clash: clashteachers,
                //   };
                // }
                let done = false;
                const promises = inst.schedule.teachers.map(
                  async (teacher, tindex) => {
                    teacher.days.forEach(async (day, dindex) => {
                      day.period.forEach(async (period, pindex) => {
                        if (period.classname == body.oldclassname) {
                          const setpath = `schedule.teachers.${tindex}.days.${dindex}.period.${pindex}.classname`;
                          const doc = await Institute.findOneAndUpdate(
                            { uiid: inst.uiid },
                            { $set: { [setpath]: body.newclassname } }
                          );
                          done = doc ? true : false;
                        }
                      });
                    });
                  }
                );
                await Promise.all(promises);
                clog(done);
                return code.event(done ? code.OK : code.NO);
              }
            }
            break;
          case "renamesubject":
            {
              clog(body);
              if (body.teacherID) {
                //only change in subject shift of a teacher
                const path = `schedule.teachers.$[outer].days.$[outer1].period.${body.period}.subject`;
                const instdoc = await Institute.findOneAndUpdate(
                  {
                    uiid: user.uiid,
                    "schedule.teachers": {
                      $elemMatch: { teacherID: body.teacherID },
                    },
                  },
                  {
                    $set: {
                      [path]: body.newsubject,
                    },
                  },
                  {
                    arrayFilters: [
                      { "outer.teacherID": body.teacherID },
                      { "outer1.dayIndex": body.dayIndex },
                    ],
                  }
                );
                clog(instdoc);
                return code.event(instdoc ? code.OK : code.NO);
              } else {
              } //change in subject of all teachers (correction type)
            }
            break;
          case "switchweekdays":
            {
              const daysinweek = Array();
              inst.schedule.teachers.forEach((teacher, tindex) => {
                teacher.days.forEach((d, dindex) => {
                  body.days.forEach(async (day, _) => {
                    if (!(day.new < 0) && day.new != null && day.new != "") {
                      if (!daysinweek.includes(day.new))
                        daysinweek.push(day.new);
                      if (day.old == d.dayIndex) {
                        const path = `schedule.teachers.${tindex}.days.${dindex}.dayIndex`;
                        const doc = await Institute.findOneAndUpdate(
                          { uiid: inst.uiid },
                          {
                            $set: { [path]: day.new },
                          }
                        );
                        //todo: doc return
                        clog(doc);
                        return code.event(doc ? code.OK : code.NO);
                      }
                    }
                  });
                });
              });
              clog(body.days);
              clog(daysinweek);
              if (daysinweek.length > 0) {
                return await defaults.timings.setDaysInWeek(user, {
                  daysinweek,
                });
              } else {
                return code.event(code.NO);
              }
            }
            break;
        }
        return;
      }
      async scheduleRemove(user, inst, body) {
        switch (body.specific) {
          case "weekday":
            {
              const promises = inst.schedule.teachers.map(
                async (teacher, tindex) => {
                  if (!(body.removeday < 0) && !isNaN(body.removeday)) {
                    const path = `schedule.teachers.${tindex}.days`;
                    const doc = await Institute.findOneAndUpdate(
                      { uiid: inst.uiid },
                      {
                        $pull: {
                          [path]: { dayIndex: body.removeday },
                          [defaults.timings.daysinweekpath]: body.removeday,
                        },
                      }
                    );
                  }
                }
              );
              await Promise.all(promises);
              return code.event(code.OK);
            }
            break;
          case "periods": {
          }
        }
      }
    }

    class ClassAction {
      constructor() {}
      async scheduleReceive(inst, body) {
        let newClasses = Array();
        inst.schedule.teachers.forEach((teacher, tindex) => {
          teacher.days.forEach((day, _) => {
            day.period.forEach((period, _) => {
              if (
                // !existingclasses.includes(period.classname) &&
                !newClasses.includes(period.classname)
              ) {
                newClasses.push(period.classname);
              }
            });
          });
        });
        clog(newClasses);
        return {
          event: code.OK,
          classes: newClasses,
        };
      }
      async scheduleUpdate(inst, body) {
        switch(body.specific){
          case "createclasses":{
            clog(body.classes);
            const doc = await Institute.findOneAndUpdate({uiid:inst.uiid},
              {
                $set:{
                  "schedule.classes":body.classes
                }
              }
            )
            return code.event(doc?code.schedule.SCHEDULE_CREATED:code.schedule.SCHEDULE_NOT_CREATED);
          }
        }
      }
    }

    this.teacher = new TeacherAction();
    this.classes = new ClassAction();
  }
  handleScheduleTeachersAction = async (user, inst, body) => {
    switch (body.action) {
      case "upload":
        return await this.teacher.scheduleUpload(inst, body);
      case "receive":
        return await this.teacher.scheduleReceive(inst, body);
      case "update":
        return await this.teacher.scheduleUpdate(user, inst, body);
      case "remove":
        return await this.teacher.scheduleRemove(user, inst, body);
      default:
        return code.event(code.server.DATABASE_ERROR);
    }
  };
  handleScheduleClassesAction = async (inst, body) => {
    switch (body.action) {
      case "receive":
        return await this.classes.scheduleReceive(inst, body);
      case "update":
        return await this.classes.scheduleUpdate(inst, body);
      default:
        return code.event(code.server.DATABASE_ERROR);
    }
  };
}

class Invite {
  constructor() {
    class TeacherAction {
      constructor() {}
      inviteLinkCreation = async (user, inst, body) => {
        clog("post create link ");
        if (inst.invite[body.target].active == true) {
          clog("already active");
          const validresponse = invite.checkTimingValidity(
            inst.invite[body.target].createdAt,
            inst.invite[body.target].expiresAt,
            inst.invite[body.target].createdAt
          );
          if (invite.isActive(validresponse)) {
            let link = invite.getTemplateLink(
              user.id,
              inst._id,
              body.target,
              inst.invite[body.target].createdAt
            );
            clog("templated");
            clog(link);
            clog("returning existing link");
            return {
              event: code.invite.LINK_EXISTS,
              link: link,
              exp: inst.invite[body.target].expiresAt,
            };
          }
        }
        clog("creating new link");
        const genlink = await invite.generateLink(
          user.id,
          inst._id,
          body.target,
          body.daysvalid
        );
        const path = "invite." + body.target;
        const document = await Institute.findOneAndUpdate(
          { uiid: inst.uiid },
          {
            $set: {
              [path]: {
                active: true,
                createdAt: genlink.create,
                expiresAt: genlink.exp,
              },
            },
          }
        );
        clog("returning");
        return document
          ? {
              event: code.invite.LINK_CREATED,
              link: genlink.link,
              exp: genlink.exp,
            }
          : code.event(code.invite.LINK_CREATION_FAILED);
      };

      inviteLinkDisable = async (inst, body) => {
        clog("post disabe link");
        const path = "invite." + body.target;
        const doc = await Institute.findOneAndUpdate(
          { uiid: inst.uiid },
          {
            $set: {
              [path]: {
                active: false,
                createdAt: 0,
                expiresAt: 0,
              },
            },
          }
        );
        clog("returning");
        return doc
          ? code.event(code.invite.LINK_DISABLED)
          : code.event(code.invite.LINK_DISABLE_FAILED);
      };
    }
    this.teacher = new TeacherAction();
  }
  handleInvitation = async (user, inst, body) => {
    switch (body.action) {
      case "create":
        return await this.teacher.inviteLinkCreation(user, inst, body);
      case "disable":
        return await this.teacher.inviteLinkDisable(inst, body);
    }
  };
}

class Vacations {
  constructor() {}
}

class Preferences {
  constructor() {
    const object = "preferences";
    this.allowTeacherAddSchedule = `${object}.allowTeacherAddSchedule`;
    this.active = `${object}.active`;
  }
  async handlePreferences(user, body) {
    switch (body.action) {
      case "set":
        {
          switch (body.specific) {
            case "allowTeacherAddSchedule":
              return await this.teacherAddSchedule(user, body.allow);
            case "active":
              return await this.scheduleActive(user, body.active);
            default:
              return await this.setAllPreferences(user, body);
          }
        }
        break;
      case "get":
        {
          switch (body.specific) {
            case "allowTeacherAddSchedule":
              return await this.canTeacherAddSchedule(user);
            case "active":
              return await this.isScheduleActive(user);
            default:
              return await this.allPreferences(user);
          }
        }
        break;
    }
  }
  async setAllPreferences(user, body) {}
  async allPreferences(user) {
    const doc = await Institute.findOne({ uiid: user.uiid });
    return code.event(doc ? doc.preferences : code.NO);
  }
  async canTeacherAddSchedule(user) {
    const doc = await Institute.findOne({ uiid: user.uiid });
    return doc ? doc.preferences.allowTeacherAddSchedule : code.event(code.NO);
  }
  async teacherAddSchedule(user, allow) {
    const doc = await Institute.findOneAndUpdate(
      { uiid: user.uiid },
      {
        $set: {
          [this.allowTeacherAddSchedule]: allow,
        },
      }
    );
    return code.event(doc ? code.OK : code.NO);
  }
  async isScheduleActive(user) {
    const doc = await Institute.findOne({ uiid: user.uiid });
    return code.event(doc ? doc.preferences.active : code.NO);
  }
  async scheduleActive(user, active) {
    const doc = await Institute.findOneAndUpdate(
      { uiid: user.uiid },
      {
        $set: {
          [this.active]: active,
        },
      }
    );
    return code.event(doc ? code.OK : code.NO);
  }
}

let clog = (msg) => console.log(msg);
module.exports = new AdminWorker();
