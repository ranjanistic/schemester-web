
class AdminLogin{
  constructor(){
    value.backbluecovered = true;
    this.view = getElement("workbox");

    this.darkmode = new Switch('darkmode');
    this.darkmode.turn(theme.isDark());
    this.darkmode.onTurnChange(_=>{theme.setDark()},_=>{theme.setLight()});
    
    this.emailField = new TextInput("email_fieldset","adminemail","emailError",validType.email);
    this.passField = new TextInput("password_fieldset","adminpassword","passError",validType.nonempty);
    this.uiidField = new TextInput("uiid_fieldset","uiid","uiidError",validType.nonempty);

    this.logInButton = getElement("loginAdminButton");
    this.logInLoader = getElement("loginLoader");
    this.back = getElement("backFromLogin");
    this.forgotPassword = getElement("forgotpasswordButton");
    hide(this.forgotPassword);

    this.target = String(getElement('target').innerHTML);
    if(!stringIsValid(this.target,validType.nonempty)){
      this.target = 'dashboard';
    }

    this.back.addEventListener(click,_=> {showLoader();relocate(locate.homepage)});
    this.emailField.validate(_=>{this.passField.inputFocus()});
    this.passField.validate(_=>{this.uiidField.inputFocus()});
    this.uiidField.validate();

    this.passField.onTextInput(_=>{
      this.passField.normalize();
      hide(this.forgotPassword);
    });
    resumeElementRestriction(this.forgotPassword,"adminforgot",_=>{
      this.forgotPassword.onclick = (_) => {this.linkSender()};
    });
    this.logInButton.onclick=_=>{this.loginAdmin(this.emailField.getInput(),this.passField.getInput(),this.uiidField.getInput())};
    
  }
  linkSender(){
    if(!this.emailField.isValid()) return this.emailField.showError('Please provide your email address to help us reset your password.');
    snackBar('To reset your password, a link will be sent to your provided email address.','Send Link',true,_=>{
      this.forgotPassword.onclick = (_) => {};
      snackBar(`Sending link to ${this.emailField.getInput()}`);
      postJsonData(post.admin.manage,{
        external:true,
        type:"resetpassword",
        action:"send",
        email:this.emailField.getInput()
      }).then((resp)=>{
        if(resp.event== code.mail.ERROR_MAIL_NOTSENT){
          this.forgotPassword.onclick = (_) => {this.linkSender()};
          return snackBar('An error occurred','Report');
        }
        snackBar("If your email address was correct, you'll receive an email from us in a few moments.",'Hide');
        restrictElement(this.forgotPassword,120,'adminforgot',_=>{
          this.forgotPassword.onclick = (_) => {this.linkSender()};
        });
      })
    })
  }
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.logInButton, !show);
    opacityOf(this.view,show?0.5:1);
  }
  loginAdmin =(email,password, uiid)=>{
    if(!(stringIsValid(email,validType.email)&&stringIsValid(password)&&stringIsValid(uiid))){
      this.emailField.validateNow(_=>{this.passField.inputFocus()});
      this.passField.validateNow(_=>{this.uiidField.inputFocus()});
      this.uiidField.validateNow();
    } else{
      this.loader();
      hide(this.forgotPassword);
      this.emailField.normalize();
      this.passField.normalize();
      this.uiidField.normalize();
      postJsonData(post.admin.auth,{
        action:'login',
        email:String(this.emailField.getInput()).trim(),
        password:this.passField.getInput(),
        uiid:String(this.uiidField.getInput()).trim(),
        target:this.target
      })
      .then((result) => {
        this.handleAuthResult(result);
      }).catch((error)=>{
        snackBar(error,'Report',false);
      });
    }
  }
  

  handleAuthResult=(result)=>{
    if(result.event == code.auth.AUTH_SUCCESS){
      saveDataLocally(result.user);
      return relocate(locate.admin.session,{
        u:result.user.uid,
        target:result.target
      });
    }
    this.loader(false);
    switch (result.event) {
      case code.auth.WRONG_PASSWORD:{
        this.passField.showError(constant.nothing);
        show(this.forgotPassword);
        this.logInButton.innerHTML = "Retry";
      }break;
      case code.auth.WRONG_UIID:{
        return this.uiidField.showError("Incorrect UIID.");
      }break;
      case code.auth.REQ_LIMIT_EXCEEDED:{
        snackBar("Too many unsuccessfull attempts, try again after a while.","Hide",actionType.negative);
        return this.logInButton.innerHTML = "Disabled";
      }break;
      case code.auth.USER_NOT_EXIST:{
        this.emailField.showError("Account not found.");
        this.logInButton.textContent = "Retry";
        return snackBar("Try registering a new account?","Create Account",true,_=>{showadminregistration(true,this.emailField.getInput(),this.uiidField.getInput())})
      }break;
      case code.auth.EMAIL_INVALID:{
        return validateTextField(this.emailField,validType.email);
      }break;
      case code.auth.ACCOUNT_RESTRICTED:{
        this.logInButton.textContent = "Retry";
        return snackBar("This account has been disabled. You might want to contact us directly.","Help",false,_=> {feedBackBox(true,getLogInfo(result.event,"This account has been disabled. You might want to contact us directly."),true)});
      }break;
      case code.auth.AUTH_REQ_FAILED:{
        this.logInButton.textContent = "Retry";
        return snackBar("Request failed.", null, false);
      }break;
      default: {
        this.logInButton.textContent = "Retry";
        show(this.forgotPassword);
        return snackBar(result.event+':'+result.msg, "Help", false, _=> {feedBackBox(true,result.event,true)});
      }
    }
  }
}


window.onload =_=> window.app = new AdminLogin();

