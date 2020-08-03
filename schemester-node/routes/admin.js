const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");

const express = require("express"),
  router = express.Router(),
  cookieParser = require("cookie-parser"),
  { check, validationResult } = require("express-validator"),
  code = require("../hardcodes/events"),
  view = require("../hardcodes/views"),
  session = require("../workers/session"),
  invite = require("../workers/invitation"),
  verify = require("../workers/verification"),
  Admin = require("../collections/Admins"),
  Institute = require("../collections/Institutions");

const sessionsecret = session.adminsessionsecret;
const sessionID = "id";
const sessionUID = "uid";

router.use(cookieParser(sessionsecret));

router.get("/", function (req, res) {
  res.redirect(toLogin());
});

router.get("/auth/login*", (req, res) => {
  clog("admin login get");
  session
    .verify(req, sessionsecret)
    .then((response) => {
      clog(response);
      if (!session.valid(response)) {
        return res.render(view.admin.login, { autofill: req.query });
      } else {
        let data = req.query;
        delete data["u"];
        return res.redirect(toSession(response.user.id, data));
      }
    })
    .catch((error) => {
      res.render(view.servererror, { error });
    });
});

router.get("/session*", (req, res) => {
  let data = req.query;
  clog("admin session");
  clog(data);
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      clog("session catch");
      clog(e);
      return res.redirect(toLogin(data));
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.redirect(toLogin(data));
      try {
        if (data.u != response.user.id) return res.redirect(toLogin(data));

        const admin = await Admin.findOne({ _id: ObjectId(response.user.id) });
        if (!admin)
          return session.finish(res).then((response) => {
            if (response) res.redirect(toLogin(data));
          });
        let adata = getAdminShareData(admin);
        if (!adata.verified) return res.render(view.verification, { user: adata });
        let inst = await Institute.findOne({ uiid: response.user.uiid });
        if (!inst) {
          data.target = view.admin.target.register;
        } else {
          if (
            data.target == view.admin.target.register ||
            data.target == undefined
          ) {
            return res.redirect(
              toSession(adata.uid, { target: view.admin.target.dashboard })
            );
          }
        }
        try {
          switch (data.target) {
            case view.admin.target.register: {
              return res.render(view.admin.getViewByTarget(data.target), {
                adata,
              });
            }
            case view.admin.target.addteacher: {
              return res.render(view.admin.getViewByTarget(data.target), {
                user: adata,
                inst,
              });
            }
            case view.admin.target.manage: {
              return res.render(view.admin.getViewByTarget(data.target), {
                adata,
                inst,
                section: data.section,
              });
            }
            case view.admin.target.viewschedule: {
                clog(data);
                if (data.client == "teacher") {
                  const teacherScheduleInst = await Institute.findOne({
                    uiid: response.user.uiid,
                      "schedule.teachers": {
                        $elemMatch: { teacherID: data.teacherID },
                      }
                  }, {
                    projection: {
                      _id: 0, "schedule.teachers.$": 1 
                    } 
                  });
                  const teacherInst = await Institute.findOne({
                    uiid: response.user.uiid,
                    "users.teachers": {
                      $elemMatch: { teacherID: data.teacherID },
                    },
                  },{
                    projection: {
                       _id: 0, "users.teachers.$": 1 
                    } 
                  });
                  if (teacherInst && teacherScheduleInst) {
                    return res.render(view.admin.scheduleview, {
                      group: { teacher: true },
                      teacher: teacherInst.users.teachers[0],
                      schedule: teacherScheduleInst.schedule.teachers[0],
                      inst,
                    });
                  }
                  if (!teacherInst && !teacherScheduleInst) {
                    return res.render(view.admin.scheduleview, {
                      group: { teacher: false },
                      schedule: false,
                      inst,
                    });
                  }
                  if (!teacherInst && teacherScheduleInst) {
                    clog("here");
                    return res.render(view.admin.scheduleview, {
                      group: { teacher: false },
                      schedule: teacherScheduleInst.schedule.teachers[0],
                      inst,
                    });
                  } else {
                    return res.render(view.admin.scheduleview, {
                      group: { teacher: true },
                      teacher: teacherInst.users.teachers[0],
                      schedule: false,
                      inst,
                    });
                  }
                } else if (data.client == "student") {
                  const scheduleInst = await Institute.findOne({
                    uiid: response.user.uiid,
                    "schedule.students": {
                      $elemMatch: { classname: data.classname },
                    },
                  },{
                    projection: {
                      "_id":0,
                      "schedule.students.$": 1,
                    },
                  });
                  if (!scheduleInst) res.render(view.admin.scheduleview, { schedule: false });
                  return res.render(view.admin.scheduleview, {
                    group: { Class: true },
                    schedule:scheduleInst.schedule.students[0],
                    inst,
                  });
                } else {
                  return res.render(view.notfound);
                }
            } break;
            default: return res.render(view.admin.getViewByTarget(data.target), {adata,inst,});
          }
        } catch (e) {
          clog(e);
          data.target = view.admin.target.dashboard;
          return res.redirect(toLogin(data));
        }
      } catch (e) {
        clog(e);
        return res.render(view.servererror);
      }
    });
});

//for account settings
router.post("/account/action", (req, res) => {
  session.verify(req, sessionsecret).then((response) => {
    if (!session.valid(response)) {
      res.redirect(`/admin/auth/login?target=manage`);
    } else {
      switch (req.body.action) {
        case code.action.CHANGE_PASSWORD:
          {
          }
          break;
        case code.action.CHANGE_ID:
          {
          }
          break;
        case code.action.ACCOUNT_DELETE:
          {
          }
          break;
        default:
          res.redirect(`/admin/auth/login?target=manage`);
      }
    }
  });
});

router.post("/session/validate", (req, res) => {
  let result;
  const { getuser } = req.body;
  clog("getuser=");
  clog(getuser);
  if (getuser) {
    clog("getuser");
    session
      .userdata(req, Admin, sessionsecret)
      .then((response) => {
        result = response;
        clog("postttt");
        clog(result);
        res.json({ result });
      })
      .catch((error) => {
        clog("errr");
        result = code.eventmsg(code.server.DATABASE_ERROR, error);
      });
  } else {
    clog("just verify");
    session
      .verify(req, sessionsecret)
      .then((response) => {
        result = response;
        clog("post validate");
        clog(result);
        clog("returning");
        res.json({ result });
      })
      .catch((error) => {
        clog("here");
        res.json({ event: code.auth.AUTH_REQ_FAILED, msg: error });
      });
  }
});

router.post(
  "/auth/signup",
  [
    check("username", code.auth.NAME_INVALID).not().isEmpty(),
    check("email", code.auth.EMAIL_INVALID).isEmail(),
    check("password", code.auth.PASSWORD_INVALID)
      .isAlphanumeric()
      .isLength({ min: 6 }),
    check("uiid", code.auth.UIID_INVALID).not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let result;
    if (!errors.isEmpty()) {
      result = { event: errors.array()[0].msg };
      res.json({ result });
      return;
    }
    session
      .signup(req, res, sessionsecret)
      .then((response) => {
        clog("Response");
        clog(response);
        result = response;
        return res.json({ result });
      })
      .catch((error) => {
        clog("error");
        clog(error);
        result = { event: code.auth.ACCOUNT_CREATION_FAILED, msg: error };
        return res.status(500).json({ result });
      });
  }
);

router.post("/auth/logout", (_, res) => {
  session.finish(res).then((response) => {
    let result = response;
    return res.json({ result });
  });
});

router.post(
  "/auth/login",
  [
    check("email", code.auth.EMAIL_INVALID).isEmail(),
    check("password", code.auth.PASSWORD_INVALID).not().isEmpty(),
    check("uiid", code.auth.UIID_INVALID).not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result = { event: errors.array()[0].msg };
      return res.json({ result });
    }
    let result = { event: code.auth.AUTH_REQ_FAILED };
    clog("inpost admin login");
    session
      .login(req, res, sessionsecret)
      .then((response) => {
        clog("post login");
        clog(response);
        result = response;
        return res.json({ result });
      })
      .catch((error) => {
        clog(error);
        result = { event: code.auth.AUTH_REQ_FAILED, msg: error };
        clog("post login:" + jstr(result));
        return res.json({ result });
      });
  }
);

router.post(
  "/session/registerinstitution",
  // [
  //   check("adminName",code.inst.INVALID_ADMIN_NAME).notEmpty(),
  //   check("adminPhone",code.inst.INVALID_ADMIN_PHONE).isNumeric(),
  //   check("adminEmail",code.inst.INVALID_ADMIN_EMAIL).isEmail(),
  //   check("instName",code.inst.INVALID_INST_NAME).notEmpty(),
  //   check("instPhone",code.inst.INVALID_INST_PHONE).isNumeric(),
  //   check("instUIID",code.inst.INVALID_INST_UIID).notEmpty(),
  //   check("startTime",code.inst.INVALID_TIME_START).notEmpty(),
  //   check("endTime",code.inst.INVALID_TIME_END).notEmpty(),
  //   check("breakStartTime",code.inst.INVALID_TIME_BREAKSTART).notEmpty(),
  //   check("weekStartDay",code.inst.INVALID_DAY).notEmpty(),
  //   check("periodDuration",code.inst.INVALID_DURATION_PERIOD).isNumeric(),
  //   check("breakDuration",code.inst.INVALID_DURATION_BREAK).isNumeric(),
  //   check("workingDays",code.inst.INVALID_WORKING_DAYS).isLength({min:1,max:7}),
  //   check("periodsInDay",code.inst.INVALID_PERIODS).isLength({min:1,max:1440})
  // ]
  // ,
  async (req, res) => {
    let result;
    clog("in registration final");
    clog(req.body);
    const data = req.body;
    session.verify(req, sessionsecret).then(async (response) => {
      if (!session.valid(response)) {
        clog("invalid session");
        await session.finish(res);
        result = { event: code.auth.SESSION_INVALID };
        return res.json({ result });
      }
      clog(response);
      let inst = await Institute.findOne({ uiid: response.user.uiid });
      if (!inst) {
        clog("creating inst");
        const registerdoc = {
          uiid: response.user.uiid,
          default: {
            admin: {
              email: data.adminemail,
              username: data.adminname,
              phone: data.adminphone,
            },
            institute: {
              instituteName: data.instname,
              email: data.instemail,
              phone: data.instphone,
              prefs: {},
            },
            timings: {
              startTime: data.starttime,
              endTime: data.endtime,
              breakStartTime: data.breakstarttime,
              periodMinutes: data.periodduration,
              breakMinutes: data.breakduration,
              periodsInDay: data.totalperiods,
              daysInWeek: String(data.workingdays).split(","),
            },
          },
          users: {
            teachers: [],
            students: [],
          },
          schedule: {
            teachers: [],
            students: [],
          },
          invite: {
            teacher: {
              active: false,
              createdAt: 0,
              expiresAt: 0,
            },
            student: {
              active: false,
              createdAt: 0,
              expiresAt: 0,
            },
          },
          active: false,
          restricted: false,
          vacations: [],
          prefs: {},
        };
        const done = await Institute.insertOne(registerdoc);
        if (done.insertedCount == 1) {
          clog("institute created");
          result = code.event(code.inst.INSTITUTION_CREATED);
          return res.json({ result });
        } else {
          result = code.event(code.inst.INSTITUTION_CREATION_FAILED);
          return res.json({ result });
        }
      }
    });
  }
);

router.post("/session/receiveinstitution", async (req, res) => {
  session
    .verify(req, sessionsecret)
    .then(async (response) => {
      let result;
      const { uiid, doc } = req.body;
      if (!session.valid(response)) {
        result = { event: code.auth.SESSION_INVALID };
        return res.json({ result });
      }
      let inst = await Institute.findOne({ uiid });
      if (!inst) {
        clog(uiid);
        inst = new Institute({
          uiid: uiid,
          invite: {
            teacher: {},
          },
        });
        clog("vallll");
        val = await inst.save();
        clog("val:" + val);
        if (val) {
          result = { event: code.inst.INSTITUTION_CREATED };
        } else {
          result = { event: code.inst.INSTITUTION_CREATION_FAILED };
        }
      } else {
        if (inst[doc]) {
          result = { event: code.inst.INSTITUTION_DEFAULTS_SET };
        } else {
          result = { event: code.inst.INSTITUTION_EXISTS };
        }
      }
      return res.json({ result });
    })
    .catch((error) => {
      result = { event: code.server.DATABASE_ERROR, msg: error };
      return res.json({ result });
    });
});

router.post("/schedule", (req, res) => {
  let result;
  session
    .verify(req, sessionsecret)
    .catch((error) => {
      clog(error);
      return res.json({
        result: code.eventmsg(code.inst.SCHEDULE_UPLOAD_FAILED, error),
      });
    })
    .then(async (response) => {
      if (!session.valid(response))
        return res.json({ result: code.event(code.auth.SESSION_INVALID) });
      const inst = await Institute.findOne({ uiid: response.user.uiid });
      if (!inst)
        return res.json({
          result: code.event(code.inst.INSTITUTION_NOT_EXISTS),
        });
      const body = req.body;
      switch (body.target) {
        case "teacher":
          {
            switch (req.body.action) {
              case "upload":
                {
                  let overwriting = false; //if existing teacher schedule being overwritten after completion.
                  let incomplete = false; //if existing teacher schedule being rewritten without completion.
                  let found = inst.schedule.teachers.some((teacher, index) => {
                    if (teacher.teacherID == body.teacherID) {
                      if (
                        teacher.days.length ==
                        inst.default.timings.daysInWeek.length
                      ) {
                        overwriting = true;
                      } else {
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
                    result = code.event(code.schedule.SCHEDULE_EXISTS);
                    return res.json({ result });
                  }
                  if (incomplete) {
                    //remove teacher schedule
                    Institute.findOneAndUpdate(
                      { uiid: response.user.uiid },
                      {
                        $pull: {
                          "schedule.teachers": { teacherID: body.teacherID },
                        },
                      }
                    );
                    found = false; //add as a new teacher schedule
                  }
                  if (found) {
                    //existing teacher schedule, incomplete (new day index)
                    const filter = {
                      uiid: response.user.uiid,
                      "schedule.teachers": {
                        $elemMatch: { teacherID: body.teacherID },
                      }, //existing schedule teacherID
                    };
                    const newdocument = {
                      $push: { "schedule.teachers.$[outer].days": body.data }, //new day push
                    };
                    const options = {
                      arrayFilters: [{ "outer.teacherID": body.teacherID }],
                    };
                    const doc = await Institute.findOneAndUpdate(
                      filter,
                      newdocument,
                      options
                    );
                    clog("schedule appended?");
                    if (doc)
                      return res.json({
                        result: code.event(code.schedule.SCHEDULE_CREATED),
                      }); //new day created.
                  } else {
                    //no existing schedule teacherID
                    const filter = { uiid: response.user.uiid };
                    const newdocument = {
                      $push: {
                        "schedule.teachers": {
                          teacherID: body.teacherID,
                          days: [body.data],
                        },
                      }, //new teacher schedule push
                    };
                    const doc = await Institute.findOneAndUpdate(
                      filter,
                      newdocument
                    );
                    clog("schedule created?");
                    if (doc)
                      return res.json({
                        result: code.event(code.schedule.SCHEDULE_CREATED),
                      }); //new teacher new day created.
                  }
                }
                break;
              case "receive":
                {
                  const teacherInst = await Institute.findOne({
                      uiid: response.user.uiid,
                      "schedule.teachers": {
                        $elemMatch: {
                          "teacherID": body.teacherID,
                        },
                      },
                    },
                    {
                      projection: {
                        _id: 0,
                        "schedule.teachers.$": 1,
                      },
                    }
                  );
                  if (teacherInst) {
                    return res.json({
                      result: {
                        event: "OK",
                        schedule: teacherInst.schedule.teachers[0],
                      },
                    });
                  } else {
                    return res.json({
                      result: code.event(code.schedule.SCHEDULE_NOT_EXIST),
                    });
                  }
                }
                break;
              case "update":
                {
                }
                break;
              default:
                throw Error("invalid teacher schedule action");
            }
          }
          break;
      }
    });
});

router.post("/manage", async (req, res) => {
  clog("in post manage");
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      clog(e);
      return res.json({ result: code.eventmsg(code.auth.AUTH_REQ_FAILED, e) });
    })
    .then(async (response) => {
      if (!session.valid(response)) {
        return res.json({ result: response });
      }
      clog(req.body);
      const data = req.body;
      switch (data.type) {
        case invite.type:
          {
            clog("invite type");
            switch (data.action) {
              case "create": {
                clog("post create link ");
                const inst = await Institute.findOne({
                  uiid: response.user.uiid,
                });
                if (!inst)
                  return res.json({
                    result: code.event(code.inst.INSTITUTION_NOT_EXISTS),
                  });

                if (inst.invite[data.target].active == true) {
                  clog("already active");
                  const validresponse = invite.checkTimingValidity(
                    inst.invite[data.target].createdAt,
                    inst.invite[data.target].expiresAt,
                    inst.invite[data.target].createdAt
                  );
                  if (invite.isActive(validresponse)) {
                    clog("already valid link");
                    clog(response);
                    let link = invite.getTemplateLink(
                      response.user.id,
                      inst._id,
                      data.target,
                      inst.invite[data.target].createdAt
                    );
                    clog("templated");
                    clog(link);
                    result = {
                      event: code.invite.LINK_EXISTS,
                      link: link,
                      exp: inst.invite[data.target].expiresAt,
                    };
                    clog("returning existing link");
                    return res.json({ result });
                  }
                }
                clog("creating new link");
                const genlink = await invite.generateLink(
                  response.user.id,
                  inst._id,
                  data.target,
                  data.daysvalid
                );
                const path = "invite." + data.target;
                const document = await Institute.findOneAndUpdate(
                  { uiid: response.user.uiid },
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
                if (document) {
                  clog("link created");
                  result = {
                    event: code.invite.LINK_CREATED,
                    link: genlink.link,
                    exp: genlink.exp,
                  };
                } else {
                  result = code.event(code.invite.LINK_CREATION_FAILED);
                }
                clog("returning result");
                clog(result);
                return res.json({ result });
              }
              case "disable": {
                clog("post disabe link");
                const path = "invite." + req.body.target;
                const doc = await Institute.findOneAndUpdate(
                  { uiid: response.user.uiid },
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
                if (doc) {
                  clog("link disabled true");
                  result = code.event(code.invite.LINK_DISABLED);
                } else {
                  result = code.event(code.invite.LINK_DISABLE_FAILED);
                }
                clog("returning result");
                clog(result);
                return res.json({ result });
              }
            }
          }
          break;
        case verify.type:
          {
            switch (data.action) {
              case "send":
                {
                  clog(response);
                  const linkdata = verify.generateLink(verify.target.admin, {
                    uid: response.user.id,
                  });
                  clog(linkdata);
                  //todo: send email then save.
                  let admin = await Admin.findOneAndUpdate(
                    { _id: ObjectId(response.user.id) },
                    {
                      $set: {
                        vlinkexp: linkdata.exp,
                      },
                    }
                  );
                  clog(admin);
                  return admin
                    ? res.json({ result: code.event(code.mail.MAIL_SENT) })
                    : res.json({
                        result: code.event(code.mail.ERROR_MAIL_NOTSENT),
                      });
                }
                break;
              case "check":
                {
                  const admin = await Admin.findOne({
                    _id: ObjectId(response.user.id),
                  });
                  if (!admin)
                    return res.json({
                      result: code.event(code.auth.USER_NOT_EXIST),
                    });
                  return admin.verified
                    ? res.json({ result: code.event(code.verify.VERIFIED) })
                    : res.json({
                        result: code.event(code.verify.NOT_VERIFIED),
                      });
                }
                break;
            }
          }
          break;
        case "search": {
          switch (data.target) {
            case "teacher": {
              let inst = await Institute.findOne({ uiid: response.user.uiid });
              if (!inst) return code.inst.INSTITUTION_NOT_EXISTS;
              let teachers = Array();
              inst.users.teachers.forEach((teacher, index) => {
                if (
                  String(teacher.username).toLowerCase() ==
                    String(data.q).toLowerCase() ||
                  String(teacher.username)
                    .toLowerCase()
                    .includes(String(data.q).toLowerCase()) ||
                  String(teacher.teacherID) == String(data.q).toLowerCase() ||
                  String(teacher.teacherID).includes(
                    String(data.q).toLowerCase()
                  )
                ) {
                  teachers.push({
                    username: teacher.username,
                    teacherID: teacher.teacherID,
                  });
                }
              });
              inst.schedule.teachers.forEach((teacher, index) => {
                clog(teacher.teacherID);
                let nope = teachers.filter((t) => {
                  clog(t);
                  return t.teacherID != teacher.teacherID;
                });
                clog(nope);
                if (nope) {
                  if (
                    String(teacher.teacherID).includes(
                      String(data.q).toLowerCase()
                    )
                  ) {
                    teachers.push({
                      username: "Not set",
                      teacherID: teacher.teacherID,
                    });
                  }
                }
              });
              clog(teachers);
              return res.json({
                result: {
                  event: "OK",
                  teachers: teachers,
                },
              });
            }
            default:
              res.sendStatus(500);
          }
        }
        default:
          res.sendStatus(500);
      }
    });
});

router.get("/external*", async (req, res) => {
  const query = req.query;
  switch (query.type) {
    case verify.type:
      {
        //verification link
        if (!query.u) return res.render(view.notfound);
        try {
          const admin = await Admin.findOne({ _id: ObjectId(query.u) });
          if (!admin || !admin.vlinkexp) return res.render(view.notfound);
          if (!verify.isValidTime(admin.vlinkexp))
            return res.render(view.verification, { user: { expired: true } });

          const doc = await Admin.findOneAndUpdate(
            { _id: ObjectId(query.u) },
            { $set: { verified: true }, $unset: { vlinkexp: null } },
            { returnOriginal: false }
          );
          if (!doc) return res.render(view.notfound);
          return res.render(view.verification, {
            user: getAdminShareData(doc.value),
          });
        } catch (e) {
          clog(e);
          return res.render(view.notfound);
        }
      }
      break;
    default:
      res.render(view.notfound);
  }
});

const toSession = (u, query = { target: view.admin.target.dashboard }) => {
  let path = `/admin/session?u=${u}`;
  for (var key in query) {
    if (query.hasOwnProperty(key)) {
      path = `${path}&${key}=${query[key]}`;
    }
  }
  clog("path");
  clog(path);
  return path;
};
const toLogin = (query = { target: view.admin.target.dashboard }) => {
  let i = 0;
  let path = "/admin/auth/login";
  for (var key in query) {
    if (query.hasOwnProperty(key)) {
      path =
        i > 0 ? `${path}&${key}=${query[key]}` : `${path}?${key}=${query[key]}`;
      i++;
    }
  }
  clog("path");
  clog(path);
  return path;
};
const getAdminShareData = (data = {}) => {
  return {
    isAdmin: true,
    [sessionUID]: data._id,
    username: data.username,
    [sessionID]: data.email,
    uiid: data.uiid,
    createdAt: data.createdAt,
    verified: data.verified,
    vlinkexp: data.vlinkexp,
  };
};

let clog = (msg) => console.log(msg);

let jstr = (obj) => JSON.stringify(obj);

module.exports = router;
