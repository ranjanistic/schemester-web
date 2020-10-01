const express = require("express"),
  admin = express.Router(),
  cookieParser = require("cookie-parser"),
  esession = require("express-session"),
  { ObjectId } = require("mongodb"),
  { check, validationResult } = require("express-validator"),
  {code,client,view,clog,get} = require("../public/script/codes"),
  session = require("../workers/common/session"),
  invite = require("../workers/common/invitation"),
  path = require("path"),
  fs = require("fs"),
  verify = require("../workers/common/verification"),
  share = require("../workers/common/sharedata"),
  reset = require("../workers/common/passwordreset"),
  worker = require("../workers/adminworker"),
  Admin = require("../config/db").getAdmin(),
  Institute = require("../config/db").getInstitute(),
  sessionsecret = session.adminsessionsecret;
const invalidsession = {result:code.event(code.auth.SESSION_INVALID)},
  authreqfailed =(error)=>{ return {result: code.eventmsg(code.auth.AUTH_REQ_FAILED, error)}}
  
admin.use(cookieParser(sessionsecret));

admin.get(get.root, (_, res)=>{
  res.redirect(worker.toLogin());
});

admin.get(get.authlogin, (req, res) => {
  session
    .verify(req, sessionsecret)
    .then((response) => {
      if (!session.valid(response))
        return res.render(view.admin.login, { autofill: req.query });
      let data = req.query;
      delete data["u"];
      return res.redirect(worker.toSession(response.user.id, data));
    })
    .catch((error) => {
      res.render(view.servererror, { error });
    });
});


admin.post('/auth',async (req,res)=>{
  const body = req.body;
  switch(body.action){
    case "login":{session.login(req, res, sessionsecret)
      .then((response) => {
        return res.json({ result: response });
      })
      .catch((error) => {
        return res.json(authreqfailed(error));
      });
    }break;
    case "logout":{
      session.finish(res).then((response) => {
        return res.json({ result: response });
      });
    }break;
    case "signup":{
      session.signup(req, res, sessionsecret)
      .then((response) => {
        return res.json({ result: response });
      })
      .catch((error) => {
        return res.json({
          result: code.eventmsg(code.auth.ACCOUNT_CREATION_FAILED, error),
        });
      });
    }break;
    default:res.sendStatus(500);
  }
});


admin.get(get.session, async(req, res) => {
  let data = req.query;
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      return res.redirect(worker.toLogin(data));
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.redirect(worker.toLogin(data));
      try {
        if (data.u != response.user.id) return res.redirect(worker.toLogin(data));
        const admin = await Admin.findOne({ "_id": ObjectId(response.user.id) });
        if (!admin)
          return session.finish(res).then((response) => {
            if (response) res.redirect(worker.toLogin(data));
          });
        let adata = share.getAdminShareData(admin);
        if (!admin.verified)
          return res.render(view.verification, { user: adata });
        let inst = await Institute.findOne({ uiid: response.user.uiid });
        if (!inst || !inst.default || !inst.default.timings.daysInWeek.length || !inst.default.timings.periodsInDay) {
          data.target = view.admin.target.register;
          return res.render(view.admin.getViewByTarget(data.target), {
            adata,inst:inst?inst:false
          });
        }
        if (
          data.target == view.admin.target.register ||
          data.target == undefined ||
          !data.target
        ) {
          return res.redirect(
            worker.toSession(adata.uid, { target: view.admin.target.dashboard })
          );
        }
        try {
          switch (data.target) {
            case view.admin.target.addteacher: {
              return res.render(view.admin.getViewByTarget(data.target), {
                user: adata,
                data:data,
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
            case view.admin.target.classes:{
              return res.render(view.admin.getViewByTarget(data.target),{
                client:client.student,
                users:inst.users.classes,
                defaults:inst.default,
              });
            }
            case view.admin.target.teachers:{
              return res.render(view.admin.getViewByTarget(data.target),{
                client:client.teacher,
                users:inst.users.teachers,
                classes:inst.users.classes,
                defaults:inst.default,
              });
            }
            case view.admin.target.viewschedule:{
                if (data.type == client.teacher) {
                  if(data.t){ //if teacher _id is provided, means required teacher account considered exists.
                    const teacherInst = await Institute.findOne({
                      uiid: response.user.uiid,
                      "users.teachers": {
                        $elemMatch: { "_id": ObjectId(data.t) },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "users.teachers.$": 1,
                      },
                    });
                    if(!teacherInst) return res.render(view.notfound);  //no account for data.t (_id).
                    const teacher = teacherInst.users.teachers[0];
                    const teacherScheduleInst = await Institute.findOne({
                      uiid: response.user.uiid,
                      "schedule.teachers": {
                        $elemMatch: { "teacherID": teacher.teacherID },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "schedule.teachers.$": 1,
                      },
                    });
                    if(!teacherScheduleInst){ //teacher account:true, schedule:false
                      return res.render(view.admin.scheduleview, {
                        group: { teacher: true },
                        teacher,
                        schedule: false,
                        inst,
                      });
                    }
                    return res.render(view.admin.scheduleview, { //both account and schedule
                      group: { teacher: true },
                      teacher: teacher,
                      schedule: teacherScheduleInst.schedule.teachers[0],
                      inst,
                    });
                  } else {  //user account considered not exists.
                    if(!data.teacherID) return res.render(view.notfound); //so teacher ID must be provided for schedule.
                    const teacherdoc = await Institute.findOne({ //checking for account by teacher ID, in case it exists.
                      uiid: response.user.uiid,
                      "users.teachers": {
                        $elemMatch: { "teacherID": data.teacherID },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "users.teachers.$": 1,
                      },
                    });
                    if(teacherdoc){  //then providing teacher _id to session, for previous condition.
                      data['t'] = teacherdoc.users.teachers[0]._id;
                      return res.redirect(worker.toSession(data.u,data))
                    }
                    const teacherScheduledoc = await Institute.findOne({ //finding schedule with teacherID
                      uiid: response.user.uiid,
                      "schedule.teachers": {
                        $elemMatch: { "teacherID": data.teacherID},
                      },
                    },{
                      projection: {
                        _id: 0,
                        "schedule.teachers.$": 1,
                      },
                    });
                    if(!teacherScheduledoc)//no schedule found, so 404, as only schedule was requested.
                      return res.render(view.notfound);

                    return res.render(view.admin.scheduleview, {  //account not found, so only schedule.
                      group: { teacher: true, pending:true },
                      teacher:{teacherID:data.teacherID},
                      schedule: teacherScheduledoc.schedule.teachers[0],
                      inst,
                    });
                  }
                } else if (data.type == client.student) {  //class schedule
                  if(data.c){ //if class _id is provided, means required class considered exists.
                    const classdoc = await Institute.findOne({
                      uiid: response.user.uiid,
                      "users.classes": {
                        $elemMatch: { "_id": ObjectId(data.c) },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "users.classes.$": 1,
                      },
                    });
                    if(!classdoc) return res.render(view.notfound);  //no class for data.c (_id).
                    const Class = classdoc.users.classes[0];

                    const scheduleresp = await worker.schedule.classes.scheduleReceive(response.user,{classname :Class.classname})
                    if(!scheduleresp.schedule.days){ //class exists:true, schedule:false
                      return res.render(view.admin.scheduleview, {
                        group: { Class: true },
                        Class: Class,
                        schedule: false,
                        inst,
                      });
                    }
                    return res.render(view.admin.scheduleview, { //both account and schedule
                      group: { Class: true },
                      Class: Class,
                      schedule: scheduleresp.schedule,
                      inst,
                    });
                  } else {  //class considered not exists.
                    if(!data.classname) return res.render(view.notfound); //at least classname must be provided for schedule.
                    const classdoc = await Institute.findOne({ //checking for account by teacher ID, in case it exists.
                      uiid: response.user.uiid,
                      "users.classes": {
                        $elemMatch: { "classname": data.classname },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "users.classes.$": 1,
                      },
                    });
                    if(classdoc){  //then providing class _id to session, for previous condition.
                      data['c'] = classdoc.users.classes[0]._id;
                      return res.redirect(worker.toSession(data.u,data))
                    }
                    const scheduleresp = await worker.schedule.classes.scheduleReceive(response.user,{classname :data.classname})
                    if(scheduleresp.event == code.inst.CLASS_NOT_FOUND) 
                      return res.render(view.admin.getViewByTarget(data.target),{
                        group: { Class: true, pending:true },
                        Class:{classname:data.classname},
                        schedule:false,
                        inst,
                      });
                    if(!scheduleresp.schedule.days)//no schedule found, so 404, as only schedule was requested.
                      return res.render(view.notfound);
                    return res.render(view.admin.scheduleview, {  //class not found, so only schedule.
                      group: { Class: true },
                      Class:{classname:data.classname},
                      schedule: scheduleresp.schedule,
                      inst,
                    });
                  }
                }
                return res.render(view.notfound);
              }
            default:
              return res.render(view.admin.getViewByTarget(data.target), {
                adata,
                inst,
              });
          }
        } catch (e) {
          data.target = view.admin.target.dashboard;
          return res.redirect(worker.toLogin(data));
        }
      } catch (e) {
        return res.render(view.servererror,{error:e});
      }
    });
});

/**
 * For self account subdoc (Admin collection).
 */
admin.post("/self", async (req, res) => {
  const body = req.body;
  if(body.external){
    switch (body.target) {
      case "account": return res.json({ result: await worker.self.handleAccount(body.user,body)});
    }
    return;
  }
  session.verify(req, sessionsecret)
  .catch(e=>{
    return authreqfailed(e);
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.json({result:code.event(code.auth.SESSION_INVALID)});
    const admin = await Admin.findOne({'_id':ObjectId(response.user.id)});
    if(!admin) return code.event(code.auth.USER_NOT_EXIST);
    switch (body.target) {
      case "receive": return res.json({result:share.getAdminShareData(admin)});
      case "authenticate": return res.json({result:await session.authenticate(req,res,body,sessionsecret)});
      case "account": return res.json({ result: await worker.self.handleAccount(response.user,body,admin)});
      case "preferences": return res.json({result: await worker.self.handlePreferences(response.user,body)});
    }
  });
});

admin.post("/session/validate", (req, res) => {
  const { getuser } = req.body;
  if (getuser) {
    session.userdata(req, sessionsecret)
      .then((response) => {
        return res.json({ result:response});
      })
      .catch((error) => {
        return res.json({result:code.eventmsg(code.server.DATABASE_ERROR, error)});
      });
  } else {
    session.verify(req, sessionsecret)
      .then((response) => {
        return res.json({ result:response });
      })
      .catch((error) => {
        return res.json({ event: code.auth.AUTH_REQ_FAILED, msg: error });
      });
  }
});
/**
 * For current session account related requests.
 */
admin.post('/session',(req,res)=>{
  session.verify(req, sessionsecret)
  .catch(e=>{
    return res.json({result:code.eventmsg(code.auth.AUTH_FAILED,e)});
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.json({ result:code.event(code.auth.SESSION_INVALID)});
  })
});

/**
 * For post requests in default subdoc.
 */
admin.post('/default',(req,res)=>{
  session.verify(req, sessionsecret)
    .catch(e=>{
      return res.json({result:code.eventmsg(code.auth.AUTH_FAILED,e)});
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.json({ result:code.event(code.auth.SESSION_INVALID)});
      const body = req.body;
      const inst = await Institute.findOne({ uiid: response.user.uiid });
      if(body.target!="registerinstitute" && !inst) return res.json({result:code.event(code.inst.INSTITUTION_NOT_EXISTS)});
      switch(body.target){
        case "registerinstitute":{
          return res.json({result:await worker.default.handleRegistration(response.user,body)})
        }
        case "admin": return res.json({result:await worker.default.handleAdmin(response.user,inst,body)});
        case "institute":return res.json({result:await worker.default.handleInstitute(response.user,body)});
        case "timings": return res.json({result:await worker.default.handleTimings(response.user,body)});
        case code.inst.BACKUP_INSTITUTION:{
          worker.default.institute.createInstituteBackup(response.user,(filename,error)=>{
            if(error) return res.json({result:code.event(code.NO)});
            return res.json({result:{
              event:code.OK,
              url:`/${client.admin}/download?type=${code.inst.BACKUP_INSTITUTION}&res=${filename}`,
            }})
          });
        }break;
      }
    });
});

admin.get(get.download,async(req,res)=>{
  session.verify(req, sessionsecret)
  .catch(e=>{
    return res.json({result:code.eventmsg(code.auth.AUTH_FAILED,e)});
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.render(view.forbidden);
    const query = req.query;
    if(!(query.type&&query.res)) return res.render(view.notfound);
    switch(query.type){
      case code.inst.BACKUP_INSTITUTION:{
        try{
          if(response.user.id == String(query.res).slice(0,query.res.indexOf('_')) && response.user.uiid == String(query.res).slice(query.res.indexOf('_')+1,query.res.lastIndexOf('_'))){
            res.download(path.join(__dirname+`/../backups/${response.user.uiid}/${query.res}`),(err)=>{
              if(err) res.render(view.notfound);
            });
          } else {
            res.render(view.notfound);
          }
        }catch{
          res.render(view.notfound);
        }
      }
    }
  })
})
/**
 * For actions related to users subdocument.
 */
admin.post("/users",async (req,res)=>{
  session
    .verify(req, sessionsecret)
    .catch((error) => {
      return res.json({
        result: code.eventmsg(code.auth.AUTH_FAILED, error),
      });
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.json({ result: code.event(code.auth.SESSION_INVALID) });
      const inst = await Institute.findOne({uiid:response.user.uiid});
      if (!inst) return res.json({result: code.event(code.inst.INSTITUTION_NOT_EXISTS)});
      const body = req.body;
      switch(body.target){ 
        case client.teacher:return res.json({result: await worker.users.handleTeacherAction(response.user,body)});
        case client.student:return res.json({result: await worker.users.handleClassAction(response.user,body,inst)});
      }
    });
});

admin.post("/pseudousers",async(req,res)=>{
  session
    .verify(req, sessionsecret)
    .catch((error) => {
      return res.json({
        result: code.eventmsg(code.auth.AUTH_FAILED, error),
      });
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.json({ result: code.event(code.auth.SESSION_INVALID) });
      const body = req.body;
      switch(body.target){
        case client.teacher:return res.json({result:await worker.pseudo.handleTeachers(response.user,body)})
        case client.student: return res.json({result:await worker.pseudo.handleStudents(response.user,body)})
      }
    })
})

/**
 * For actions related to schedule subdocument.
*/
admin.post("/schedule", async (req, res) => {
  session.verify(req, sessionsecret).catch((error) => {
    return res.json({
      result: code.eventmsg(code.auth.AUTH_FAILED, error),
    });
  }).then(async (response) => {
    if (!session.valid(response)) return res.json({ result: code.event(code.auth.SESSION_INVALID) });
    const inst = await Institute.findOne({ uiid: response.user.uiid });
    if (!inst) return res.json({result: code.event(code.inst.INSTITUTION_NOT_EXISTS)});
    const body = req.body;
    switch (body.target) {
      case client.teacher: return res.json({result:await worker.schedule.handleScheduleTeachersAction(response.user,body,inst)});
      case client.student: return res.json({result:await worker.schedule.handleScheduleClassesAction(response.user,body,inst)});
    }
  }); 
});

admin.post("/receivedata",async(req,res)=>{
  session.verify(req, sessionsecret).catch((error) => {
    return res.json({
      result: code.eventmsg(code.auth.AUTH_FAILED, error),
    });
  }).then(async (response) => {
    if (!session.valid(response)) return res.json({ result: code.event(code.auth.SESSION_INVALID) });
    const body = req.body;
    switch(body.target){  
      case "default":return res.json({result:await worker.default.getDefaults(response.user)});
      case "users":return res.json({result:await worker.users.getUsers(response.user)});
      case "schedule":return res.json({result:await worker.schedule.getSchedule(response.user)});
      case "classroom":return res.json({result:await worker.classroom.getClasses(response.user,body)});
      case "pseudousers":return res.json({result:await worker.pseudo.getPseudoUsers(response.user,body)});
      case "vacations":return res.json({result:await worker.vacation.getVacations(response.user)});
      case "preferences":return res.json({result:await worker.prefs.getPreferences(response.user)});
      case "invite":return res.json({result:await worker.invite.getInvitation(response.user)});
      default:return res.json({result:await worker.getInstitute(response.user)})
    }
  })
})

admin.post("/dashboard",async(req,res)=>{
  session.verify(req, sessionsecret).catch((error) => {
    return res.json({
      result: code.eventmsg(code.auth.AUTH_FAILED, error),
    });
  }).then(async (response) => {
    if (!session.valid(response)) return res.json({ result: code.event(code.auth.SESSION_INVALID) });
    const body = req.body;
    switch(body.target){  
      case "today":case "today": return res.json({result:await worker.today.handlerequest(response.user,body)});
      
    }
  });
});

admin.post("/manage", async (req, res) => { //for settings
  const body = req.body;
  if(body.external){
    switch (body.type) {
      case reset.type:{
        const user = await Admin.findOne({'email':body.email});
        if(!user) return {result:code.event(code.OK)};  //don't tell if user not exists, while sending reset email.
        return res.json({result:await worker.self.handlePassReset({id:user._id},body)});
      };
    }
  }
  session.verify(req, sessionsecret)
    .catch((e) => {
      return res.json({ result: code.eventmsg(code.auth.AUTH_REQ_FAILED, e) });
    })
    .then(async (response) => {
      if (!session.valid(response))return res.json({ result: response });
      const inst = await Institute.findOne({uiid: response.user.uiid,});
      if (!inst && body.type!=verify.type)
        return res.json({
          result: code.event(code.inst.INSTITUTION_NOT_EXISTS),
        });
      switch (body.type) {
        case invite.type: return res.json({ result:await worker.invite.handleInvitation(response.user,inst,body)});
        case verify.type: return res.json({ result: await worker.self.handleVerification(response.user,body)});
        case reset.type: return res.json({result:await worker.self.handlePassReset(response.user,body)});
        case "search": return res.json({result: await worker.users.handleUserSearch(inst,body)});
        case "preferences" : return res.json({result:await worker.prefs.handlePreferences(response.user,body)});
        default: res.sendStatus(500);
      }
    });
});

admin.post('/mail',async(req,res)=>{
  session.verify(req, sessionsecret).catch((e) => {
    return res.json(authreqfailed(e));
  }).then(async (response) => {
    if (!session.valid(response))return res.json({ result: response });
    const body = req.body;
    switch(body.type){
      case invite.personalType:{
        switch(body.target){
          case client.teacher: return res.json({result:await worker.users.teachers.sendInvitation(response.user,body)});
        }
      }break;
    }
  })
})

/**
 * For external links, not requiring valid session.
 */
admin.get(get.external, async (req, res) => {
  const query = req.query;
  switch (query.type) {
    case verify.type:{
      verify.handleVerification(query, client.admin).then(async(resp) => {
        if (!resp)
          return res.render(view.notfound);
        return res.render(view.verification, { user: resp.user });
      }).catch(e=>{
        return res.render(view.servererror, {error:e});
      });
    }break;
    case reset.type:{
      reset.handlePasswordResetLink(query,client.admin).then(async(resp)=>{
        if (!resp) return res.render(view.notfound);
        return res.render(view.passwordreset, { user: resp.user });
      }).catch(e=>{
        return res.render(view.servererror, {error:e});
      });
    }break;
    default:res.render(view.notfound);
  }
});

module.exports = admin;
