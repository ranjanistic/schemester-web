//admin management default script

class Management {
  constructor() {
    this.sectionreq = getElement("section").innerHTML;
    switch (
      this.sectionreq //for section to be displayed
    ) {
      case locate.admin.section.institute:
        this.displayIndex = 1;
        break;
      case locate.admin.section.schedule:
        this.displayIndex = 2;
        break;
      case locate.admin.section.users:
        this.displayIndex = 3;
        break;
      case locate.admin.section.security:
        this.displayIndex = 4;
        break;
      case locate.admin.section.about:
        this.displayIndex = 5;
        break;
      default:
        this.displayIndex = 0;
        break;
    }
    clog(this.displayIndex);

    this.tabs = Array(
      getElement("adminTab"),
      getElement("institutionTab"),
      getElement("scheduleTab"),
      getElement("usersTab"),
      getElement("securityTab"),
      getElement("aboutTab")
    );
    setClassNames(this.tabs[this.displayIndex], "leftTabButtonSelected");
    this.chips = Array(
      getElement("madminTab"),
      getElement("minstitutionTab"),
      getElement("mscheduleTab"),
      getElement("musersTab"),
      getElement("msecurityTab"),
      getElement("maboutTab")
    );
    this.chips[this.displayIndex].click();
    this.boxes = Array(
      getElement("accountSettingsBox"),
      getElement("institutionSettingsBox"),
      getElement("scheduleSettingsBox"),
      getElement("usersSettingsBox"),
      getElement("securitySettingsBox"),
      getElement("aboutSettingsBox")
    );
    showElement(this.boxes, this.displayIndex);

    this.back = getElement("backFromSettings");
    this.contactDevs = getElement("contactDevelopers");
    this.logout = getElement("logoutAdmin");

    this.admin = new Admin();
    this.inst = new Institution();
    this.schedule = new Schedule();
    this.security = new Security();
    this.users = new Users();
    for (var i = 0; i < this.tabs.length; i++) {
      this.tabs[i].addEventListener(
        click,
        (_) => {
          this.handleTabClicks(
            event,
            this.tabs,
            this.boxes,
            "leftTabButtonSelected",
            "leftTabButton"
          );
        },
        false
      );
      this.chips[i].addEventListener(
        click,
        (_) => {
          this.handleTabClicks(event, this.chips, this.boxes);
        },
        false
      );
    }
    this.contactDevs.addEventListener(click, feedBackBox, false);
    this.back.addEventListener(click, this.undoAndReturn, false);
    this.logout.addEventListener(
      click,
      (_) => {
        showLoader();
        finishSession((_) => {
          relocate(locate.admin.login, { target: locate.admin.target.manage });
        });
      },
      false
    );
  }
  handleTabClicks = (event, clickables, showables, showClass, hideClass) => {
    var e = event.currentTarget;
    for (var k = 0; k < clickables.length; k++) {
      var condition = e == clickables[k];
      visibilityOf(showables[k], condition);
      if (showClass != null && hideClass != null) {
        setClassNames(clickables[k], showClass, hideClass, condition);
      }
    }
  };
  undoAndReturn = (_) => {
    showLoader();
    relocate(locate.admin.session, {
      u: localStorage.getItem(constant.sessionUID),
      target: locate.admin.target.dashboard,
    });
  };
}

class Admin {
  constructor() {
    this.name = getElement("adminName");
    this.nameeditor = getElement("adminnameeditor")
    this.nameedit = getElement("editadminname")
    hide(this.nameeditor);
    this.email = getElement("adminEmailAddress");

    this.phone = getElement("adminPhoneNumber");
    this.phoneeditor = getElement("adminphoneeditor")
    this.phoneedit = getElement("editadminphone")
    hide(this.phoneeditor);
    this.creationTime = getElement("adminCreationTime");
    this.nameedit.onclick=_=>{
      this.handleNameEditor();
    }
    this.phoneedit.onclick=_=>{
      this.handlePhoneEditor();
    }
  }
  handleNameEditor(){
    hide(this.name);
    show(this.nameeditor);
    const nameField = new TextInput("adminnamefield","adminnameinput","adminnameerror",validType.name);
    nameField.setInput(localStorage.getItem('username'));
    const namesave = getElement("saveadminname");
    const namecancel = getElement("canceladminname");
    nameField.validate();
    nameField.enableInput();
    namecancel.onclick=_=>{
      show(this.name);
      hide(this.nameeditor);
    }
    namesave.onclick=_=>{
      nameField.validateNow();
      if(!nameField.isValid()) return;
      nameField.disableInput();
      if(nameField.getInput() == getElement("adminnameview").innerHTML){
        localStorage.setItem('username',nameField.getInput());
        return namecancel.click();
      }
      showLoader();
      postJsonData(post.admin.self,{
        target:"account",
        action:code.action.CHANGE_NAME,
        newname:nameField.getInput()
      }).then(resp=>{
        if(resp.event == code.OK){
          localStorage.setItem('username',nameField.getInput());
          getElement("adminnameview").innerHTML = nameField.getInput();
          show(this.name);
          hide(this.nameeditor);
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    }
  }
  handlePhoneEditor(){
    hide(this.phone);
    show(this.phoneeditor);
    const phoneField = new TextInput("adminphonefield","adminphoneinput","adminphoneerror",validType.phone);
    const phonesave = getElement("saveadminphone");
    const phonecancel = getElement("canceladminphone");
    phoneField.enableInput();
    phonecancel.onclick=_=>{
      show(this.phone);
      hide(this.phoneeditor);
    }
    phoneField.validate();
    phonesave.onclick=_=>{
      phoneField.validateNow();
      if(!phoneField.isValid()) return;
      phoneField.disableInput();
      if(phoneField.getInput() == getElement("adminphoneview").innerHTML){
        return phonecancel.click();
      }
      showLoader();
      postJsonData(post.admin.self,{
        target:"account",
        action:code.action.CHANGE_PHONE,
        newphone:phoneField.getInput()
      }).then(resp=>{
        if(resp.event == code.OK){
          getElement("adminphoneview").innerHTML = phoneField.getInput();
          show(this.phone);
          hide(this.phoneeditor);
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    }
  }
}

class Institution {
  constructor() {
    this.name = getElement("instituteName");
    this.nameview = getElement("institutenameview")
    this.nameeditor = getElement("institutenameeditor")
    this.nameedit = getElement("editinstitutename")
    hide(this.nameeditor);
    
    this.nameedit.onclick=_=>{
      this.handleNameEditor();
    }
    
    this.phone = getElement("institutePhone");
    this.phoneview = getElement("institutephoneview");
    this.phoneeditor = getElement("institutephoneeditor");
    this.phoneedit = getElement("editinstitutephone");
    hide(this.phoneeditor);

    this.phoneedit.onclick=_=>{
      this.handlePhoneEditor();
    }
    
    this.mail = getElement("instituteMail");
    this.mailview = getElement("institutemailview");
    this.maileditor = getElement("institutemaileditor");
    this.mailedit = getElement("editinstitutemail");
    hide(this.maileditor);
    this.mailedit.onclick=_=>{
      this.handleMailEditor();
    }
    this.uiid = getElement("uiid");
    this.subscriptionTill = getElement("subscriptionTill");
  }
  handleNameEditor(){
    hide(this.name);
    show(this.nameeditor);
    const nameField = new TextInput("institutenamefield","institutenameinput","institutenameerror",validType.name);
    const namesave = getElement("saveinstitutename");
    const namecancel = getElement("cancelinstitutename");
    nameField.enableInput();
    namecancel.onclick=_=>{
      show(this.name);
      hide(this.nameeditor);
    }
    nameField.validate();
    namesave.onclick=_=>{
      nameField.validateNow();
      if(!nameField.isValid()) return;
      nameField.disableInput();
      if(nameField.getInput() == this.nameview.innerHTML){
        return namecancel.click();
      }
      showLoader();
      postJsonData(post.admin.default,{
        target:"institute",
        action:code.action.CHANGE_NAME,
        newname:nameField.getInput()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.nameview.innerHTML = nameField.getInput();
          show(this.name);
          hide(this.nameeditor);
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    }
  }
  handleMailEditor(){
    hide(this.mail);
    show(this.maileditor);
    const mailField = new TextInput("institutemailfield","institutemailinput","institutemailerror",validType.email);
    const mailsave = getElement("saveinstitutemail");
    const mailcancel = getElement("cancelinstitutemail");
    mailField.enableInput();
    mailcancel.onclick=_=>{
      show(this.mail);
      hide(this.maileditor);
    }
    mailField.validate();
    mailsave.onclick=_=>{
      mailField.validateNow();
      if(!mailField.isValid()) return;
      mailField.disableInput();
      if(mailField.getInput() == this.mailview.innerHTML){
        return mailcancel.click();
      }
      showLoader();
      postJsonData(post.admin.default,{
        target:"institute",
        action:code.action.CHANGE_ID,
        newemail:mailField.getInput()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.mailview.innerHTML = mailField.getInput();
          show(this.mail);
          hide(this.maileditor);
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    }
  }
  handlePhoneEditor(){
    hide(this.phone);
    show(this.phoneeditor);
    const phoneField = new TextInput("institutephonefield","institutephoneinput","institutephoneerror",validType.phone);
    const phonesave = getElement("saveinstitutephone");
    const phonecancel = getElement("cancelinstitutephone");
    phoneField.enableInput();
    phonecancel.onclick=_=>{
      show(this.phone);
      hide(this.phoneeditor);
    }
    phoneField.validate();
    phonesave.onclick=_=>{
      phoneField.validateNow();
      if(!phoneField.isValid()) return;
      phoneField.disableInput();
      if(phoneField.getInput() == this.phoneview.innerHTML){
        return phonecancel.click();
      }
      showLoader();
      postJsonData(post.admin.default,{
        target:"institute",
        action:code.action.CHANGE_PHONE,
        newphone:phoneField.getInput()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.phoneview.innerHTML = phoneField.getInput();
          show(this.phone);
          hide(this.phoneeditor);
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    }
  }
}
class Schedule {
  constructor() {
    this.periodDuration = getElement("periodDuration");
    this.weekStartDay = getElement("weekStartDay");
    this.scheduleStartTime = getElement("scheduleStartTime");
    this.scheduleEndTime = getElement("scheduleEndTime");
    this.breakStartTime = getElement("breakStartTime");
    this.breakDuration = getElement("breakDuration");
    this.workDays = getElement("workdays");
    this.totalPeriods = getElement("totalPeriods");
  }
  setDetails(
    periodDuration,
    weekStartDay,
    scheduleStartTime,
    scheduleEndTime,
    breakStartTime,
    breakDuration,
    totalWorkDays,
    totalPeriodsInDay
  ) {
    this.periodDuration.textContent = periodDuration;
    this.weekStartDay.textContent = weekStartDay;
    this.scheduleStartTime.textContent = scheduleStartTime;
    this.scheduleEndTime.textContent = scheduleEndTime;
    this.breakStartTime.textContent = breakStartTime;
    this.breakDuration.textContent = breakDuration;
    this.workDays.textContent = totalWorkDays;
    this.totalPeriods.textContent = totalPeriodsInDay;
  }
}

class Security {
  constructor() {
    this.resetPass = getElement("resetPasswordButton");
    this.sendpasslink = getElement("sendpasswordlink");
    this.resetMail = getElement("resetMailButton");
    this.lastLogin = getElement("lastLoginTime");
    this.deleteAccount = getElement("deleteAdminAccount");
    this.resetPass.onclick = (_) => {
      adminloginDialog((_) => {
        resetPasswordDialog();
      });
    };
    if (Number(sessionStorage.getItem("linkin")) > 0) {
      opacityOf(this.sendpasslink, 0.5);
      let time = Number(sessionStorage.getItem("linkin"));
      const timer = setInterval(() => {
        time--;
        sessionStorage.setItem("linkin", time);
        this.sendpasslink.innerHTML = `Try again in ${time} seconds.`;
        if (Number(sessionStorage.getItem("linkin")) == 0) {
          clearInterval(timer);
          this.sendpasslink.innerHTML = "Get password link";
          opacityOf(this.sendpasslink, 1);
          this.sendpasslink.onclick = (_) => {this.linkSender()};
        }
      }, 1000);
    } else {
      this.sendpasslink.onclick = (_) => {this.linkSender()};
    }
    this.resetMail.onclick = (_) => {
      changeEmailBox();
    };
    this.deleteAccount.addEventListener(
      click,
      (_) => {
        adminloginDialog(
          (_) => {
            const delconf = new Dialog();
            delconf.setDisplay(
              "Delete?",
              `Are you sure you want to delete your Schemester account <b>${localStorage.getItem(
                "id"
              )}</b> permanently? The following consequencies will take place:<br/>
      <div>
      <ul>
      <li>You will not be able to recover your account forever.</li>
      <li>Your institution will also get deleted.</li>
      <li>Scheduling for your institution will stop, affecting all the users, and their accounts will be deleted too.</li>
      <li>Make sure you understand what your next step will lead to.</li>
      </ul><br/>
      <div class="active">If someone else is taking administration instead of you, then you can <a onclick="changeEmailBox()">transfer ownership of your institution</a> rather than deleting it.</div>
      </div>`
            );
            delconf.setBackgroundColorType(bodyType.negative);
            delconf.createActions(
              Array(`Delete account & Institution`, "No, step back"),
              Array(actionType.negative, actionType.positive)
            );
            delconf.onButtonClick(
              Array(
                (_) => {
                  delconf.loader();
                  postJsonData(post.admin.self, {
                    target: "account",
                    action: code.action.ACCOUNT_DELETE,
                  }).then((response) => {
                    if (response.event == code.OK) {
                      relocate(locate.root);
                    } else {
                      snackBar("Action Failed");
                    }
                  });
                },
                (_) => {
                  delconf.hide();
                }
              )
            );
            let time = 60;
            const snack = new Snackbar();
            snack.show();
            let timer = setInterval(() => {
              time--;
              snack.createSnack(`${time}s to revert.`, bodyType.negative);
              if (time == 0) {
                clearInterval(timer);
                delconf.hide();
                snack.hide();
              }
            }, 1000);
          },
          true,
          true
        );
      },
      false
    );
  }

  linkSender(){
      postJsonData(post.admin.manage, {
        type: "resetpassword",
        action: "send",
      }).then((response) => {
        clog(response);
        if (response.event == code.mail.MAIL_SENT) {
          snackBar(
            "A link for password reset has been sent to your email address."
          );
          opacityOf(this.sendpasslink, 0.4);
          this.sendpasslink.onclick = (_) => {};
          let time = 120;
          sessionStorage.setItem("linkin", time);
          const timer = setInterval(() => {
            time--;
            sessionStorage.setItem("linkin", time);
            this.sendpasslink.innerHTML = `Try again in ${time} seconds.`;
            if (Number(sessionStorage.getItem("linkin")) == 0) {
              clearInterval(timer);
              this.sendpasslink.innerHTML = "Get password link";
              opacityOf(this.sendpasslink, 1);
            }
          }, 1000);
        }
      });
  }

  setButtonText(resetMail, resetPass) {
    this.resetMail.textContent = resetMail;
    this.resetPass.textContent = resetPass;
  }
  getLastLogin() {
    return this.lastLogin.textContent;
  }
}
class Users {
  constructor() {
    this.invite = getElement("inviteUsers");
    this.invite.addEventListener(
      click,
      (_) => {
        this.linkGenerator(client.teacher);
      },
      false
    );

    class Teacher {
      constructor() {
        this.listview = getElement("teacherList");
        this.search = getElement("teacherSearch");
        this.load(false);
        this.search.oninput = (_) => {
          if (this.search.value) {
            this.load();
            postJsonData(post.admin.manage, {
              type: "search",
              target: client.teacher,
              q: this.search.value,
            }).then((response) => {
              if (response.event == "OK") {
                this.load(false, false);
                response.teachers.forEach((teacher, index) => {
                  this.appendList(
                    this.getSlate(teacher.username, teacher.teacherID)
                  );
                  getElement(`view${teacher.teacherID}`).onclick = (_) => {
                    clog(teacher.teacherID);
                    refer(locate.admin.session, {
                      target: locate.admin.target.viewschedule,
                      client: client.teacher,
                      teacherID: teacher.teacherID,
                    });
                  };
                });
              }
            });
          } else {
            this.load(false);
          }
        };
      }
      getSlate(name, email) {
        return `<div class="fmt-row container" style="margin:4px 0px">
        <div class="fmt-col fmt-twothird">
            <span class="group-text positive">${name}</span><br/>
            <span class="group-text questrial">${email}</span>
        </div>
        <div class="fmt-col fmt-third">
            <button class="positive-button fmt-right"id="view${email}">View</button>
        </div>
        </div>`;
      }
      load(show = true, noview = true) {
        if (show) {
          this.listview.innerHTML = this.getLoaderView();
        } else {
          if (noview) {
            this.listview.innerHTML = this.getDefaultView();
          } else {
            this.listview.innerHTML = "";
          }
        }
      }
      appendList(slate) {
        let last = this.listview.innerHTML;
        if (last == this.getDefaultView() || last == this.getLoaderView()) {
          this.listview.innerHTML = slate;
        } else {
          this.listview.innerHTML = last + slate;
        }
      }
      getLoaderView() {
        return `<div class="fmt-center" id="tlistLoader">
        <img class="fmt-spin-fast" width="50" src="/graphic/blueLoader.svg"/>
        </div>`;
      }
      getDefaultView() {
        return '<div class="fmt-center">Start Typing...<div>';
      }
      clearList() {
        this.listview.innerHTML = "Start typing";
      }
    }
    this.teacher = new Teacher();
    class Classes {
      constructor() {
        this.listview = getElement("classList");
        this.search = getElement("classSearch");
        this.load(false);
        this.search.oninput = (_) => {
          if (this.search.value) {
            this.load();
            postJsonData(post.admin.manage, {
              type: "search",
              q: this.search.value,
            }).then((response) => {
              if (response.event == "OK") {
                this.load(false, false);
                response.classes.forEach((Class, index) => {
                  this.appendList(
                    this.getSlate(Class.classname, Class.teachercount)
                  );
                  getElement(`view${teacher.teacherID}`).onclick = (_) => {
                    refer(locate.admin.session, {
                      target: "viewschedule",
                      client: client.student,
                      classname: Class.classname,
                    });
                  };
                });
              }
            });
          } else {
            this.load(false);
          }
        };
      }
      getSlate(classname, teachercount) {
        return `<div class="fmt-row container" style="margin:4px 0px">
        <div class="fmt-col fmt-twothird">
            <span class="group-text positive">${classname}</span><br/>
            <span class="group-text questrial">Taken by ${teachercount} teachers</span>
        </div>
        <div class="fmt-col fmt-third">
            <button class="positive-button fmt-right"id="view${classname}">View</button>
        </div>
        </div>`;
      }
      load(show = true, noview = true) {
        if (show) {
          this.listview.innerHTML = this.getLoaderView();
        } else {
          if (noview) {
            this.listview.innerHTML = this.getDefaultView();
          }
        }
      }
      appendList(slate) {
        let last = this.listview.innerHTML;
        if (last == this.getDefaultView() || last == this.getLoaderView()) {
          this.listview.innerHTML = slate;
        } else {
          this.listview.innerHTML = last + slate;
        }
      }
      getLoaderView() {
        return `<div class="fmt-center" id="clistLoader">
        <img class="fmt-spin-fast" width="50" src="/graphic/blueLoader.svg"/>
        </div>`;
      }
      getDefaultView() {
        return '<div class="fmt-center">Start Typing...<div>';
      }
      clearList() {
        this.listview.innerHTML = "Start typing";
      }
    }
    this.classes = new Classes();
  }
  linkGenerator = (target) => {
    clog("link generator");
    loadingBox(
      true,
      "Generating Link",
      `A link is being created for your to share with ${target}s of ${localStorage.getItem(
        "uiid"
      )} institute`
    );
    postData(post.admin.manage, {
      type: "invitation",
      action: "create",
      target: target,
    })
      .then((response) => {
        clog("link generate response");
        clog(response);
        if (
          response.event == code.invite.LINK_EXISTS ||
          response.event == code.invite.LINK_CREATED
        ) {
          clog("link generated box");
          let linkdialog = new Dialog();
          linkdialog.setDisplay(
            "Invitation Link",
            `<center><a href="${response.link}">${response.link}</a>
            <br/>This Link will automatically expire on <b>${getProperDate(
              String(response.exp)
            )}</b>.
          </center>`
          );
          linkdialog.createActions(
            Array("Disable Link", "Copy", "Done"),
            Array(actionType.negative, actionType.positive, actionType.neutral)
          );

          linkdialog.onButtonClick(
            Array(
              (_) => {
                this.revokeLink(target);
              },
              (_) => {
                navigator.clipboard
                  .writeText(response.link)
                  .then((_) => {
                    snackBar("Link copied to clipboard.");
                  })
                  .catch((err) => {
                    snackBar(
                      "Failed to copy, please do it manually.",
                      null,
                      false
                    );
                  });
              },
              (_) => {
                linkdialog.hide();
              }
            )
          );
          linkdialog.show();
        }
        switch (response.event) {
          case code.invite.LINK_EXISTS:
            {
              snackBar("This link already exists and can be shared.");
            }
            break;
          case code.invite.LINK_CREATED:
            {
              snackBar("Share this with teachers of your institution.");
            }
            break;
          case code.invite.LINK_CREATION_FAILED: {
            snackBar(`Unable to generate link:${response.msg}`, "Report");
          }
          default: {
            snackBar(`Error:${response.event}:${response.msg}`, "Report");
          }
        }
      })
      .catch((error) => {
        clog(error);
        snackBar(error);
      });
  };

  revokeLink(target) {
    clog("revoke link");
    postData("/admin/manage", {
      type: "invitation",
      action: "disable",
      target: target,
    })
      .then((response) => {
        clog("revoke link response");
        clog(response);
        if (response.event == code.invite.LINK_DISABLED) {
          clog("link disabled");
          snackBar("All links are inactive now.");
          let nolinkdialog = new Dialog();
          nolinkdialog.setDisplay(
            "Generate Link",
            `Create a link to share with ${target}s of ${localStorage.getItem(
              "uiid"
            )} institute, 
          so that they can access and take part in schedule management.`
          );
          nolinkdialog.createActions(
            Array("Create Link", "Abort"),
            Array(actionType.positive, actionType.negative)
          );
          nolinkdialog.onButtonClick(
            Array(
              (_) => {
                nolinkdialog.hide();
                this.linkGenerator(target);
              },
              (_) => {
                nolinkdialog.hide();
              }
            )
          );
          nolinkdialog.show();
        } else {
          clog("disabled:false");
          snackBar(`Link couldn't be disabled.`, "Try again", false, (_) => {
            this.revokeLink(target);
          });
        }
      })
      .catch((error) => {
        clog(error);
        snackBar(error);
      });
  }
}

window.onload = (_) => (window.app = new Management());
