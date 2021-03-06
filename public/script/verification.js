class Verification {
  constructor() {
    backRoot();
    new ThemeSwitch('darkmode');
    this.view = getElement("workbox");
    value.backbluecovered = true;
    this.data = new ReceiveData();
    this.logout = getElement('logout');
    this.logout.onclick=_=>{
      finishSession(this.data.client);
    }
    if (this.data.verified) {
      window.fragment = new Verified(this.data);
    } else if (this.data.expired) {
      window.fragment = new Expired(this.data);
    } else {
      this.loader = getElement("verifyLoader");
      hide(this.loader);
      this.sendlink = getElement("sendlink");
      this.check = getElement("checkverified");
      this.later = getElement("later");      
      this.deleteaccount = getElement("resetaccount");
      this.deleteaccount.onclick = (_) => {
        this.accountDelete()
      };
      this.later.onclick = (_) => {
        refer(locate.homepage);
      };
      resumeElementRestriction(this.sendlink,'verificationlinkid',_=>{
        this.sendlink.onclick = (_) => {this.sendVerificationLink()};
      })
      this.check.onclick = (_) => {
        this.checkVerification();
      };
    }
  }
  load(show = true) {
    visibilityOf(this.sendlink, !show);
    visibilityOf(this.later, !show);
    visibilityOf(this.check, !show);
    visibilityOf(this.deleteaccount, !show);
    visibilityOf(this.loader, show);
    opacityOf(this.view, show ? 0.5 : 1);
  }
  checkVerification() {
    this.load();
    let postlink;
    switch (this.data.client) {
      case client.admin:postlink = post.admin.manage;break;
      case client.teacher:postlink = post.teacher.manage;break;
      case client.student:postlink = post.student.manage;break;
    }    
    postJsonData(postlink, {
      type: "verification",
      action: action.check,
    }).then((response) => {
      if (response.event == code.verify.VERIFIED) {
        location.reload();
      } else {
        snackBar("Not yet verified", "Recheck", false, (_) => {
          this.checkVerification();
        });
        this.load(false);
      }
    });
  }
  sendVerificationLink() {
    this.load();
    this.sendlink.onclick=_=>{};
    snackBar(`Sending link to ${this.data.email}...`); //todo
    let postlink;
    switch (this.data.client) {
      case client.admin:postlink = post.admin.manage;break;
      case client.teacher:postlink = post.teacher.manage;break;
      case client.student:postlink = post.student.manage;break;
    }
    postJsonData(postlink, {
      type: "verification",
      action: action.send,
    }).then((response) => {
      this.afterSend(response);
    }).catch((e) => {
      clog(e);
      this.afterSend({event:false});
    });
  }
  afterSend(response) {
    this.load(false);
    if (response.event != code.mail.MAIL_SENT) {
      this.sendlink.onclick = (_) => {
        this.sendVerificationLink();
      };
      snackBar("Unable to send email", "Try again", false, (_) => {
        this.sendlink.click();
      });
    } else {
      snackBar(`Link sent to ${this.data.email}. Check your spam folder too!`);
      restrictElement(this.sendlink,60,'verificationlinkid',_=>{
        this.sendlink.onclick = (_) => {this.sendVerificationLink()};
      });
    }
  }
  accountDelete(){
    this.load();
    snackBar(`Deleting ${this.data.email}...`);
    let postlink;
    switch (this.data.client) {
      case client.admin:postlink = post.admin.self;break;
      case client.teacher:postlink = post.teacher.self;break;
      case client.student:postlink = post.student.self;break;
    }
    postJsonData(postlink,{
      target:"account",
      action:code.action.ACCOUNT_DELETE,
    }).then(response=>{
      if(response.event == code.OK){
        finishSession(this.data.client,_=>{
          this.view.innerHTML = `<button class="positive-button" onclick="relocate(locate.homepage)">Explore schemester</button>`;
          this.load(false);
          snackBar(`${this.data.email} account was deleted`);
          switch (this.data.client) {
            case client.admin:return showadminregistration(true, null, this.data.uiid);
            case client.teacher:return showTeacherRegistration(true,null,this.data.uiid);
            case client.student:return showStudentRegistration(true,null,this.data.uiid);
          }
        });
      } else {
        snackBar('Try later','Report',false);
      }
    })
  }
}

class Verified {
  constructor(data) {
    this.continuesession = getElement("continueSession");
    this.explore = getElement("explore");
    this.continuesession.onclick = (_) => {
      relocate(data.client==client.admin?locate.admin.session:data.client==client.teacher?locate.teacher.session:data.client == client.student?locate.student.session:locate.root);
    };
    this.explore.onclick = (_) => {
      relocate(locate.homepage);
    };
  }
}

class Expired {
  constructor(data) {
    this.returnback = getElement("returnhome");
    this.returnback.onclick = (_) => {
      relocate(locate.root);
    };
  }
}

class ReceiveData {
  constructor() {
    this.expired = getElement("expired").innerHTML ? true : false;
    this.verified = getElement("verified").innerHTML == "true" ? true : false;
    if(!this.expired){
        this.client = getElement("client").innerHTML;
    }
    this.username = getElement("username").innerHTML;
    this.email = getElement("email").innerHTML;
    this.userid = getElement("uid").innerHTML;
    this.uiid = getElement("uiid").innerHTML;
    localStorage.setItem("client", this.client);
    localStorage.setItem("username", this.username);
    localStorage.setItem("id", this.email);
    localStorage.setItem("uid", this.userid);
    localStorage.setItem("uiid", this.uiid);
  }
}
window.onload = (_) =>{
  theme.setNav();
  new Verification();
}
