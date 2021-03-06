const express = require("express"),
  admin = express.Router(),
  {
    code,
    client,
    view,
    action,
    get,
    post,
    key,
  } = require("../public/script/codes"),
  session = require("../workers/common/session"),
  invite = require("../workers/common/invitation"),
  { render } = require("../workers/common/inspector"),
  alert = require("../workers/common/alerts"),
  path = require("path"),
  verify = require("../workers/common/verification"),
  reset = require("../workers/common/passwordreset"),
  { sendException } = require("../workers/common/mailer"),
  worker = require("../workers/adminworker");

session.use(admin, client.admin);

admin.get(get.root, (_, res) => {
  res.redirect(worker.toLogin());
  // return render(res,view.admin.landing)
});

admin.get(get.authlogin, (req, res) => {
  const response = session.verify(req, client.admin);
  if (!session.valid(response))
    return render(res, view.admin.login, {
      autofill: req.query,
      nexturl: req.query.nexturl || null,
    });
  let data = req.query;
  delete data[key.uid[0]];
  return res.redirect(worker.toSession(response.user.id, data));
});

admin.post(post.auth, async (req, res) => {
  const body = req.body;
  switch (body.action) {
    case action.login:
      {
        session
          .login(req, res, client.admin)
          .then((response) => {
            return res.json({ result: response });
          })
          .catch((error) => {
            return res.json({ error: error });
          });
      }
      break;
    case action.logout:
      {
        session.finish(res).then((response) => {
          return res.json({ result: response });
        });
      }
      break;
    case action.signup:
      {
        session
          .signup(req, res, client.admin)
          .then((response) => {
            return res.json({ result: response });
          })
          .catch((error) => {
            return res.json({
              result: code.eventmsg(code.auth.ACCOUNT_CREATION_FAILED, error),
            });
          });
      }
      break;
    case action.verify:
      {
        //2fa
        const response = session.verify(req, client.admin);
        if (!session.valid(response))
          return res.json({ result: code.event(code.auth.SESSION_INVALID) });
        session
          .verify2fa(res, req.body.code, response.user, client.admin)
          .then((response) => {
            return res.json({ result: response });
          })
          .catch((error) => {
            return res.json({ error: error });
          });
      }
      break;
    case action.oauth:
      {
        const response = session.verify(req, client.admin);
        if (!session.valid(response))
          return res.json({ result: code.event(code.auth.SESSION_INVALID) });
        if (body.deauthorize) {
          return session
            .deauthorizeOauthDomain(response.user, body.domain)
            .then((resp) => {
              return res.json({ result: resp });
            })
            .catch((err) => {
              res.json({ result: err });
            });
        }
        session
          .getOauthToken(response.user, body.domain)
          .then((resp) => {
            return res.json({ result: resp });
          })
          .catch((err) => {
            res.json({ result: err });
          });
      }
      break;
    default:
      res.sendStatus(500);
  }
});

admin.get(get.session, async (req, res) => {
  let query = req.query;
  const response = session.verify(req, client.admin);
  if (!session.valid(response)) return res.redirect(worker.toLogin(query));
  try {
    if (query.u != response.user.id) return res.redirect(worker.toLogin(query));
    const admin = await worker.self.account.getAccount(response.user);
    if (!admin)
      return session.finish(res).then((response) => {
        if (response) res.redirect(worker.toLogin(query));
      });
    if (!admin.verified) return render(res, view.verification, { user: admin });
    if (response.user.temp) {
      return render(res, view.twofactor, { user: admin });
    }

    let inst = await worker.inst.getInsituteByUIID(response.user);
    if (
      !inst ||
      !inst.default ||
      !inst.default.timings.daysInWeek.length ||
      !inst.default.timings.periodsInDay
    ) {
      query.target = view.admin.target.register;
      return render(res, view.admin.getViewByTarget(query.target), {
        adata: admin,
        inst: inst ? inst : false,
        uiid: response.user.uiid,
      });
    }
    if (
      query.target == view.admin.target.register ||
      query.target == undefined ||
      !query.target
    ) {
      return res.redirect(
        worker.toSession(admin.uid, { target: view.admin.target.dashboard })
      );
    }
    try {
      const alerts = await alert.adminAlerts();
      switch (query.target) {
        case view.admin.target.addteacher: {
          return render(res, view.admin.getViewByTarget(query.target), {
            user: admin,
            data: query,
            inst,
          });
        }
        case view.admin.target.manage: {
          return render(res, view.admin.getViewByTarget(query.target), {
            adata: admin,
            inst,
            section: query.section,
          });
        }
        case view.admin.target.classes: {
          return render(res, view.admin.getViewByTarget(query.target), {
            client: client.student,
            users: inst.users.classes,
            defaults: inst.default,
          });
        }
        case view.admin.target.teachers: {
          return render(res, view.admin.getViewByTarget(query.target), {
            client: client.teacher,
            users: inst.users.teachers,
            classes: inst.users.classes,
            defaults: inst.default,
          });
        }
        case view.admin.target.viewschedule: {
          if (query.type == client.teacher) {
            if (!(query.t || query.teacherID))
              return render(res, view.notfound);
            let teacher = query.t
              ? await worker.users.teachers.getTeacherByID(
                  response.user,
                  query.t
                )
              : await worker.users.teachers.getTeacherByTeacherID(
                  response.user,
                  query.teacherID
                );
            //if query.t (_id) is provided, means required teacher account considered exists.
            if (!teacher && query.t) return render(res, view.notfound);
            let tschedule = await worker.schedule.getScheduleByTeacherID(
              response.user,
              teacher ? teacher.teacherID : query.teacherID
            );
            if (!tschedule && query.teacherID)
              return render(res, view.notfound);
            return render(res, view.admin.scheduleview, {
              group: { teacher: true, pending: teacher ? false : true },
              teacher: teacher ? teacher : { teacherID: query.teacherID },
              schedule: tschedule ? tschedule : false,
              inst,
            });
          } else if (query.type == client.student) {
            //class schedule
            if (!(query.c || query.classname))
              return render(res, view.notfound);
            const classroom = query.c
              ? await worker.classroom.getClassByClassID(response.user, query.c)
              : await worker.classroom.getClassByClassname(
                  response.user,
                  query.classname
                );

            if (!classroom) return render(res, view.notfound); //no class
            const schedule = await worker.schedule.classes.getScheduleByClassname(
              response.user,
              classroom
            );
            return render(res, view.admin.scheduleview, {
              //both account and schedule
              group: { Class: true },
              Class: classroom,
              schedule: {
                days: schedule,
              },
              inst,
            });
          }
          return render(res, view.notfound);
        }
        default: {
          return render(res, view.admin.getViewByTarget(query.target), {
            adata: admin,
            inst,
            alerts,
          });
        }
      }
    } catch (e) {
      query.target = view.admin.target.dashboard;
      return res.redirect(worker.toLogin(query));
    }
  } catch (error) {
    sendException(error);
    return render(res, view.servererror, { error });
  }
});

/**
 * For self account subdoc (Admin collection).
 */
admin.post(post.self, async (req, res) => {
  const body = req.body;
  if (body.external) {
    switch (body.target) {
      case "account":
        return res.json({
          result: await worker.self.handleAccount(body.user, body),
        });
    }
    return;
  }
  const response = session.verify(req, client.admin);
  if (!session.valid(response))
    return res.json({ result: code.event(code.auth.SESSION_INVALID) });

  const admin = await worker.self.account.getAccount(response.user);
  if (!admin) return code.event(code.auth.USER_NOT_EXIST);
  switch (body.target) {
    case action.receive:
      return res.json({ result: admin });
    case action.authenticate:
      return res.json({
        result: await session.authenticate(req, res, body, client.admin),
      });
    case "account":
      return res.json({
        result: await worker.self.handleAccount(response.user, body),
      });
    case "preferences":
      return res.json({
        result: await worker.self.handlePreferences(response.user, body),
      });
  }
});

admin.post(post.sessionvalidate, (req, res) => {
  const { getuser } = req.body;
  if (getuser) {
    session
      .userdata(req, client.admin)
      .then((response) => {
        return res.json({ result: response });
      })
      .catch((error) => {
        sendException(error);
        return res.json({
          result: code.eventmsg(code.server.DATABASE_ERROR, error),
        });
      });
  } else {
    const response = session.verify(req, client.admin);
    return res.json({ result: response });
  }
});

/**
 * For current session account related requests.
 */
admin.post(post.session, (req, res) => {
  const response = session.verify(req, client.admin);
  if (!session.valid(response))
    return res.json({ result: code.event(code.auth.SESSION_INVALID) });
});

/**
 * For post requests in default subdoc.
 */
admin.post("/default", async (req, res) => {
  const response = session.verify(req, client.admin);
  if (!session.valid(response))
    return res.json({ result: code.event(code.auth.SESSION_INVALID) });
  const body = req.body;
  const inst = await worker.inst.getInsituteByUIID(response.user);
  if (body.target != action.registerInstitute && !inst)
    return res.json({ result: code.event(code.inst.INSTITUTION_NOT_EXISTS) });
  switch (body.target) {
    case action.registerInstitute: {
      return res.json({
        result: await worker.default.handleRegistration(response.user, body),
      });
    }
    case "admin":
      return res.json({
        result: await worker.default.handleAdmin(response.user, inst, body),
      });
    case "institute":
      return res.json({
        result: await worker.default.handleInstitute(response.user, body),
      });
    case "timings":
      return res.json({
        result: await worker.default.handleTimings(response.user, body),
      });
    case code.inst.BACKUP_INSTITUTION:
      {
        worker.default.institute.createInstituteBackup(
          response.user,
          (filename, error) => {
            if (error) return res.json({ result: code.event(code.NO) });
            return res.json({
              result: {
                event: code.OK,
                url: `/${client.admin}/download?type=${code.inst.BACKUP_INSTITUTION}&res=${filename}`,
              },
            });
          }
        );
      }
      break;
  }
});

admin.get(get.download, async (req, res) => {
  const response = session.verify(req, client.admin);
  if (!session.valid(response)) return render(res, view.forbidden);
  const query = req.query;
  if (!(query.type && query.res)) return render(res, view.notfound);
  switch (query.type) {
    case code.inst.BACKUP_INSTITUTION: {
      try {
        if (
          response.user.id ==
            String(query.res).slice(0, query.res.indexOf("_")) &&
          response.user.uiid ==
            String(query.res).slice(
              query.res.indexOf("_") + 1,
              query.res.lastIndexOf("_")
            )
        ) {
          res.download(
            path.join(
              __dirname + `/../backups/${response.user.uiid}/${query.res}`
            ),
            (err) => {
              if (err) render(res, view.notfound);
            }
          );
        } else {
          render(res, view.notfound);
        }
      } catch {
        render(res, view.notfound);
      }
    }
  }
});

/**
 * For actions related to users subdocument.
 */
admin.post("/users", async (req, res) => {
  const response = session.verify(req, client.admin);
  if (!session.valid(response))
    return res.json({ result: code.event(code.auth.SESSION_INVALID) });
  const inst = await worker.inst.getInsituteByUIID(response.user);
  if (!inst)
    return res.json({ result: code.event(code.inst.INSTITUTION_NOT_EXISTS) });
  const body = req.body;
  switch (body.target) {
    case client.teacher:
      return res.json({
        result: await worker.users.handleTeacherAction(response.user, body),
      });
    case client.student:
      return res.json({
        result: await worker.users.handleClassAction(response.user, body, inst),
      });
  }
});

admin.post("/pseudousers", async (req, res) => {
  const response = session.verify(req, client.admin);
  if (!session.valid(response))
    return res.json({ result: code.event(code.auth.SESSION_INVALID) });
  const body = req.body;
  switch (body.target) {
    case client.teacher:
      return res.json({
        result: await worker.pseudo.handleTeachers(response.user, body),
      });
    case client.student:
      return res.json({
        result: await worker.pseudo.handleStudents(response.user, body),
      });
  }
});

/**
 * For actions related to schedule subdocument.
 */
admin.post(post.schedule, async (req, res) => {
  const response = session.verify(req, client.admin);
  if (!session.valid(response))
    return res.json({ result: code.event(code.auth.SESSION_INVALID) });
  const inst = await worker.inst.getInsituteByUIID(response.user);
  if (!inst)
    return res.json({ result: code.event(code.inst.INSTITUTION_NOT_EXISTS) });
  const body = req.body;
  switch (body.target) {
    case client.teacher:
      return res.json({
        result: await worker.schedule.handleScheduleTeachersAction(
          response.user,
          body,
          inst
        ),
      });
    case client.student:
      return res.json({
        result: await worker.schedule.handleScheduleClassesAction(
          response.user,
          body,
          inst
        ),
      });
  }
});

admin.post(post.receivedata, async (req, res) => {
  const response = session.verify(req, client.admin);
  if (!session.valid(response))
    return res.json({ result: code.event(code.auth.SESSION_INVALID) });
  const body = req.body;
  switch (body.target) {
    case "default":
      return res.json({
        result: await worker.default.getDefaults(response.user),
      });
    case "users":
      return res.json({ result: await worker.users.getUsers(response.user) });
    case "schedule":
      return res.json({
        result: await worker.schedule.getSchedule(response.user),
      });
    case "classroom":
      return res.json({
        result: await worker.classroom.getClasses(response.user, body),
      });
    case "pseudousers":
      return res.json({
        result: await worker.pseudo.getPseudoUsers(response.user, body),
      });
    case "vacations":
      return res.json({
        result: await worker.vacation.getVacations(response.user),
      });
    case "preferences":
      return res.json({
        result: await worker.prefs.getPreferences(response.user),
      });
    case "invite":
      return res.json({
        result: await worker.invite.getInvitation(response.user),
      });
    default:
      return res.json({ result: await worker.getInstitute(response.user) });
  }
});

admin.post(post.dashboard, async (req, res) => {
  const response = session.verify(req, client.admin);
  if (!session.valid(response))
    return res.json({ result: code.event(code.auth.SESSION_INVALID) });
  const body = req.body;
  switch (body.target) {
    case "today":
    case "today":
      return res.json({
        result: await worker.today.handlerequest(response.user, body),
      });
  }
});

admin.post(post.manage, async (req, res) => {
  //for settings
  const body = req.body;
  if (body.external) {
    switch (body.type) {
      case reset.type: {
        return res.json({
          result: await worker.self.handlePassReset(null, body),
        });
      }
    }
  }
  const response = session.verify(req, client.admin);
  if (!session.valid(response)) return res.json({ result: response });
  const inst = await worker.inst.getInsituteByUIID(response.user);
  if (!inst && body.type != verify.type)
    return res.json({
      result: code.event(code.inst.INSTITUTION_NOT_EXISTS),
    });
  switch (body.type) {
    case invite.type:
      return res.json({
        result: await worker.invite.handleInvitation(response.user, inst, body),
      });
    case verify.type:
      return res.json({
        result: await worker.self.handleVerification(response.user, body),
      });
    case reset.type:
      return res.json({
        result: await worker.self.handlePassReset(response.user, body),
      });
    case "twofactor": {
      return res.json({ result: await worker.self.send2fa(response.user) });
    }
    case "search":
      return res.json({
        result: await worker.users.handleUserSearch(inst, body),
      });
    case "preferences":
      return res.json({
        result: await worker.prefs.handlePreferences(response.user, body),
      });
    default:
      res.sendStatus(500);
  }
});

admin.post(post.mail, async (req, res) => {
  const response = session.verify(req, client.admin);
  if (!session.valid(response)) return res.json({ result: response });
  const body = req.body;
  switch (body.type) {
    case invite.personalType:
      {
        switch (body.target) {
          case client.teacher:
            let teacher = await worker.users.teachers.getTeacherByTeacherID(
              response.user,
              body.to
            );
            if (!teacher) {
              teacher = await worker.users.teachers.getTeacherByTeacherID(
                response.user,
                body.to,
                true
              );
              if (teacher) return res.json({ result: code.event(code.OK) });
            } else return res.json({ result: code.event(code.OK) });

            return res.json({
              result: await worker.users.teachers.sendInvitation(
                response.user,
                body
              ),
            });
        }
      }
      break;
  }
});

/**
 * For external links, not requiring valid session.
 */
admin.get(get.external, async (req, res) => {
  const query = req.query;
  switch (query.type) {
    case verify.type:
      {
        verify
          .handleVerification(query, client.admin)
          .then(async (resp) => {
            if (!resp) return render(res, view.notfound);
            return render(res, view.verification, { user: resp.user });
          })
          .catch((error) => {
            sendException(error);
            return render(res, view.servererror, { error });
          });
      }
      break;
    case reset.type:
      {
        reset
          .handlePasswordResetLink(query, client.admin)
          .then(async (resp) => {
            if (!resp) return render(res, view.notfound);
            return render(res, view.passwordreset, { user: resp.user });
          })
          .catch((error) => {
            sendException(error);
            return render(res, view.servererror, { error });
          });
      }
      break;
    case invite.type:
      {
        invite
          .handleInvitation(query, client.admin)
          .then((resp) => {
            return resp
              ? render(res, view.userinvitaion, { invite: resp.invite })
              : render(res, view.notfound);
          })
          .catch((e) => {
            return render(res, view.notfound);
          });
      }
      break;
    default:
      render(res, view.notfound);
  }
});

module.exports = admin;
