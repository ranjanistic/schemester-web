const click = "click",
  input = "input",
  nothing = "";
class Codes {
  constructor() {
    class Servercodes {
      constructor() {
        this.DATABASE_ERROR = "server/database-error:";
        this.INSTITUTION_EXISTS = "server/institution-exists";
        this.INSTITUTION_CREATED = "server/institution-created";
        this.UIID_TAKEN = "server/uiid-already-taken";
        this.UIID_AVAILABLE = "server/uiid-available";
      }
    }
    class Clientcodes {
      constructor() {
        this.NETWORK_FAILURE = "client/network-error";
        this.NOT_SIGNED_IN = "client/not-signed-in";
      }
    }

    class Authcodes {
      constructor() {
        this.WRONG_PASSWORD = "auth/wrong-password";
        this.WEAK_PASSWORD = "auth/weak-password";
        this.USER_NOT_EXIST = "auth/no-user-found";
        this.USER_EXIST = "auth/user-found";
        this.AUTH_FAILED = "auth/authentication-failed";
        this.SESSION_VALID = "auth/user-logged-in";
        this.SESSION_INVALID = "auth/user-not-logged-in";
        this.EMAIL_INVALID = "auth/invalid-email";
        this.PASSWORD_INVALID = "auth/invalid-password";
        this.LOGGED_OUT = "auth/logged-out";
        this.ACCOUNT_CREATED = "auth/account-created";
        this.NAME_INVALID = "auth/invalid-name";
        this.ACCOUNT_CREATION_FAILED = "auth/account-not-created";
        this.AUTH_SUCCESS = "auth/sign-in-success";
        this.ACCOUNT_RESTRICTED = "auth/account-disabled";
        this.AUTH_REQ_FAILED = "auth/request-failed";
        this.REQ_LIMIT_EXCEEDED = "auth/too-many-requests";
        this.UIID_INVALID = "auth/invalid-uiid";
        this.WRONG_UIID = "auth/wrong-uiid";
      }
    }

    class ActionCodes {
      constructor() {
        this.ACCOUNT_DELETE = "action/delete-account";
        this.CHANGE_PASSWORD = "action/change-password";
        this.CHANGE_UID = "action/change-uid-email";
        this.SEND_INVITE = "action/send-invitation";
        this.ACCOUNT_VERIFY = "action/verify-account";
      }
    }

    class Mailcodes {
      constructor() {
        this.ACCOUNT_VERIFICATION = "mail/account-verification";
        this.RESET_PASSWORD = "mail/reset-password";
        this.PASSWORD_CHANGED = "mail/password-changed";
        this.EMAIL_CHANGED = "mail/email-address-changed";
        this.ACCOUNT_DELETED = "mail/account-deleted";
        this.INSTITUTION_INVITATION = "mail/invite-to-institution";
        this.ERROR_MAIL_NOTSENT = "mail/email-not-sent";
      }
    }
    this.auth = new Authcodes();
    this.client = new Clientcodes();
    this.server = new Servercodes();
    this.mail = new Mailcodes();
    this.action = new ActionCodes();
  }
}
const code = new Codes();

class Constant {
  constructor() {
    this.appName = "Schemester";
    this.hide = "none";
    this.show = "block";
    this.nothing = "";
    this.space = " ";
    this.tab = "  ";
    this.post = "post";
    this.get = "get";
    this.put = "put";
    this.backbluecovered = false;
    this.fetchContentType = "application/x-www-form-urlencoded; charset=UTF-8";
    this.emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#()])[A-Za-z\d@$!%*?&#()]{8,}$/;
    this.sessionKey = "bailment";//bailment ~ amaanat
    this.sessionID = "id";
    this.sessionUID = "uid";
    this.weekdays = Array(
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    );
    this.months = Array(
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    );
  }
}
const value = new Constant();
const constant = new Constant();

class Locations {
  constructor() {
    this.adminLoginPage = "/admin/auth/login";
    this.adminDashPage = "/admin/session";
    this.homepage = "/home";
    this.root = "/";
    this.registrationPage = "/admin/session";
    this.planspage = "/plans";
    this.adminSettings = "/admin/session";
  }
}
const locate = new Locations();

class Posts{
  constructor(){
    this.sessionValidate = '/admin/session/validate';
    this.authlogin = '/admin/auth/login';
    this.authlogout = '/admin/auth/logout';
  }
}
const post = new Posts();
class Colors {
  constructor() {
    this.base = "#216bf3";
    this.positive = this.base;
    this.error = "#c40c0c";
    this.active = "green";
    this.white = "#ffffff";
    this.black = "#000000";
    this.transparent = "#000000056";
  }
  getColorByType(type) {
    switch (type) {
      case actionType.positive:
        return this.positive;
      case actionType.negative:
        return this.error;
      case actionType.neutral:
        return this.white;
      case actionType.active:
        return this.active;
      case actionType.nothing: {
        return this.transparent;
      }
      default: {
        return type == false
          ? this.getColorByType(actionType.negative)
          : this.getColorByType(actionType.positive);
      }
    }
  }
}
var colors = new Colors();

class InputType {
  constructor() {
    this.name = "name";
    this.email = "email";
    this.password = "password";
    this.nonempty = "nonempty";
    this.match = "matching";
    this.username = "username";
  }
}
let inputType = new InputType();

class TextInput {
  constructor(
    fieldId = String(),
    inputId = String(),
    errorId = String(),
    captionId = null
  ) {
    this.fieldset = getElement(fieldId);
    this.caption = captionId ? getElement(captionId) : null;
    this.input = getElement(inputId);
    this.error =
      errorId != nothing && errorId != null ? getElement(errorId) : null;
    this.normalize();
  }
  normalize(isNormal = true, errormsg = null) {
    setFieldSetof(this.fieldset, isNormal, this.error, errormsg);
  }
  setFieldCaption(caption) {
    this.caption.textContent = caption;
  }
  inputFocus() {
    this.input.focus();
  }
  onTextInput(action = (_) => {}) {
    this.input.oninput = () => {
      action();
    };
  }
  onTextDefocus(action) {
    this.input.onchange = () => {
      action();
    };
  }
  showValid(){
    setClassName(this.fieldset,actionType.getFieldStyle(bodyType.active));
  }
  showError(errorMsg = null, inputfocus = true) {
    setFieldSetof(this.fieldset, errorMsg == null, this.error, errorMsg);
    if (inputfocus) {
      this.input.focus();
    }
    this.onTextInput((_) => {
      this.normalize();
    });
  }
  setInputAttrs(hint = null, type = null, defaultValue = null) {
    if (hint != null) {
      this.input.placeholder = hint;
    }
    if (type != null) {
      this.input.type = type;
    }
    if (defaultValue != null) {
      this.input.value = defaultValue;
    }
  }
  getInput() {
    return this.input.value;
  }
}

class Snackbar {
  id = "snackBar";
  textId = "snackText";
  buttonId = "snackButton";
  constructor() {
    this.bar = getElement(this.id);
    this.text = getElement(this.textId);
    this.button = getElement(this.buttonId);
    this.button.innerHTML = null;
    hide(this.button);
    this.text.innerHTML = null;
    hide(this.bar);
  }

  createSnack(text, type) {
    this.text.innerHTML = text;
    setDefaultBackground(this.bar, type);
  }
  displayType(type) {
    if (!value.backbluecovered) {
      setClassName(
        this.bar,
        bodyType.getSnackStyle(bodyType.positive),
        bodyType.getSnackStyle(bodyType.negative),
        type,
        bodyType.getSnackStyle(bodyType.warning),
        bodyType.getSnackStyle(bodyType.active)
      );
      setClassName(
        this.button,
        actionType.getButtonStyle(actionType.neutral),
        actionType.getButtonStyle(actionType.neutral),
        type,
        actionType.getButtonStyle(actionType.neutral),
        actionType.getButtonStyle(actionType.neutral)
      );
    } else {
      setClassName(
        this.bar,
        bodyType.getSnackStyle(bodyType.neutral),
        bodyType.getSnackStyle(bodyType.negative),
        type,
        bodyType.getSnackStyle(bodyType.warning),
        bodyType.getSnackStyle(bodyType.active)
      );
      setClassName(
        this.button,
        actionType.getButtonStyle(actionType.positive),
        actionType.getButtonStyle(actionType.neutral),
        type,
        actionType.getButtonStyle(actionType.neutral),
        actionType.getButtonStyle(actionType.neutral)
      );
    }
  }
  createButton(buttontext, action = null) {
    this.button.innerHTML = buttontext;
    if (action != null) {
      this.button.onclick = (_) => {
        action();
      };
    } else {
      this.button.onclick = (_) => {
        this.hide();
      };
    }
    show(this.button);
  }
  existence(exist = true) {
    elementRiseVisibility(this.bar, exist);
  }
  show() {
    replaceClass(
      this.bar,
      "fmt-animate-bottom-off",
      "fmt-animate-bottom",
      true
    );
  }
  hide() {
    replaceClass(
      this.bar,
      "fmt-animate-bottom-off",
      "fmt-animate-bottom",
      false
    );
    hide(this.bar);
  }
}

var snackBar = (
  text = String(),
  actionText = String(),
  isNormal = actionType.positive,
  action = () => {
    new Snackbar().hide();
  }
) => {
  var snack = new Snackbar();
  snack.hide();
  if (text != nothing) {
    snack.text.textContent = text;
    if (actionText != null && actionText != nothing) {
      snack.createButton(actionText, (_) => {
        if (actionText == "Report") {
          feedBackBox(true, text, true);
        } else {
          action();
        }
        new Snackbar().hide();
      });
      setTimeout((_) => {
        new Snackbar().hide();
      }, text.length * 3 * 1000); //lengthwise timer.
    } else {
      setTimeout((_) => {
        new Snackbar().hide();
      }, text.length * (3 / 2) * 1000); //lengthwise timer for non action snackbar.
    }
    snack.displayType(isNormal);
  }
  snack.existence(text != nothing && text != null);
};

class DialogID {
  viewId = "dialogView";
  boxId = "dialogBox";
  imageId = "dialogImage";
  contentId = "dialogContent";
  headingId = "dialogHeading";
  subHeadId = "dialogSubHeading";
  inputs = "inputFields";
  dialogInputFieldID(index) {
    return "dialogInputField" + index;
  }
  dialogFieldCaptionID(index) {
    return "dialogFieldCaption" + index;
  }
  dialogInputID(index) {
    return "dialogInput" + index;
  }
  dialogInputErrorID(index) {
    return "dialogInputError" + index;
  }
  textFieldId = "dialogInputAreaField";
  textFieldCaptionId = "dialogAreaFieldCaption";
  textInputAreaId = "dialogInputArea";
  textInputErrorId = "dialogInputAreaError";

  optionsId = "dialogOpts";
  dialogChipLabel(index) {
    return "dialogChipLabel" + index;
  }
  dialogChip(index) {
    return "dialogChip" + index;
  }
  actionsId = "dialogButtons";
  actionLoader = "dialogLoader";
  dialogButton(index) {
    return "dialogButton" + index;
  }
  basicDialogContent = `<img class="fmt-col fmt-quarter fmt-center fmt-padding" id="dialogImage" style="width: 80;"/>
    <div class="fmt-col fmt-threequarter" id="dialogContent">
      <div class="fmt-row" id="dialogHeading"></div>
      <div class="fmt-row" id="dialogSubHeading"></div>
      <div id="inputFields"></div>
      <fieldset class="fmt-row text-field" id="dialogInputAreaField">
        <legend class="field-caption" id="dialogAreaFieldCaption"></legend>
        <textarea class="text-input" rows="5" id="dialogInputArea"></textarea>
        <span class="fmt-right error-caption" id="dialogInputAreaError"></span>
      </fieldset>
      <div class="fmt-row" id="dialogActions">
        <span id="dialogOpts" class="fmt-padding fmt-left fmt-twothird"></span>
        <span id="dialogButtons" class="fmt-half fmt-right"></span>
      </div>
    </div>`;
  getloaderContent(heading = "Please wait", subheading) {
    return `<div class="fmt-col" id="dialogContent">
    <div class="fmt-row" id="dialogHeading">${heading}</div>
    <div class="fmt-row fmt-center" id="dialogSubHeading">${subheading}</div>
    <br/>
    <div class="fmt-center fmt-display-center">
    <img class="fmt-spin-fast" src="/graphic/blueLoader.svg"/>
    </div><br/></div>`;
  }
}

class ViewType {
  constructor() {
    this.neutral = "neutral";
    this.positive = "positive";
    this.negative = "negative";
    this.warning = "warning";
    this.active = "active";
    this.nothing = "nothing";
  }
  getButtonStyle(type) {
    switch (type) {
      case this.neutral:
        return "neutral-button";
      case this.positive:
        return "positive-button";
      case this.negative:
        return "negative-button";
      case this.warning:
        return "warning-button";
      case this.active:
        return "active-button";
      default:
        return "positive-button";
    }
  }
  getFieldStyle(type) {
    switch (type) {
      case this.neutral:
        return "text-field";
      case this.positive:
        return "text-field";
      case this.negative:
        return "text-field-error";
      case this.warning:
        return "text-field-warn";
      case this.active:
        return "text-field-active";
      default:
        return "text-field";
    }
  }
  getSnackStyle(type) {
    switch (type) {
      case this.neutral:
        return "snack-neutral";
      case this.positive:
        return "snack-positive";
      case this.negative:
        return "snack-negative";
      case this.warning:
        return "snack-warn";
      case this.active:
        return "snack-active";
      default:
        return "snack-positive";
    }
  }
}
const actionType = new ViewType();
const bodyType = new ViewType();

class Dialog extends DialogID {
  constructor() {
    super(DialogID);
    this.view = getElement(this.viewId);
    setDefaultBackground(this.view);
    this.box = getElement(this.boxId);
    opacityOf(this.box, 1);
    this.setBoxHTML(this.basicDialogContent); //sets default dialog html (left image, right heading, subheading, inputs, actions)
    this.image = getElement(this.imageId);
    this.content = getElement(this.contentId);

    this.heading = getElement(this.headingId);
    this.subHeading = getElement(this.subHeadId);
    this.inputFields = getElement(this.inputs);

    hide(this.inputFields);
    this.options = getElement(this.optionsId);
    hide(this.options);
    this.textField = getElement(this.textFieldId);
    hide(this.textField);
  }
  setBoxHTML(htmlcontent) {
    this.box.innerHTML = htmlcontent;
  }
  createInputs(
    captions,
    hints,
    types,
    contents = null,
    autocompletes = null,
    spellChecks = null,
    autocaps = null
  ) {
    let total = captions.length;
    let fieldSet = String();
    for (var i = 0; i < total; i++) {
      fieldSet += getInputField(
        this.dialogInputFieldID(i),
        this.dialogFieldCaptionID(i),
        this.dialogInputID(i),
        this.dialogInputErrorID(i)
      );
    }
    this.inputFields.innerHTML = fieldSet;
    visibilityOf(this.inputFields, total > 0);
    this.inputField = Array(total);
    for (var k = 0; k < total; k++) {
      this.inputField[k] = new TextInput(
        this.dialogInputFieldID(k),
        this.dialogInputID(k),
        this.dialogInputErrorID(k),
        this.dialogFieldCaptionID(k)
      );
    }

    for (var k = 0; k < total; k++) {
      this.inputField[k].caption.textContent = captions[k];
      this.inputField[k].setInputAttrs(hints[k], types[k]);
      this.inputField[k].input.value =
        contents != null && contents[k] != null && contents[k] != nothing
          ? contents[k]
          : value.nothing;
      this.inputField[k].input.autocomplete =
        autocompletes != null ? autocompletes[k] : value.nothing;
      this.inputField[k].input.spellcheck =
        spellChecks != null ? spellChecks[k] : true;
      this.inputField[k].input.autocapitalize =
        autocaps != null ? autocaps[k] : "none";
    }
  }
  createRadios(labels, clicked) {
    let total = labels.length;
    visibilityOf(this.options, this.radioVisible);
    let radioSet = String();
    for (var i = 0; i < total; i++) {
      radioSet += getRadioChip(
        this.dialogChipLabel(i),
        labels[i],
        this.dialogChip(i)
      );
    }
    this.options.innerHTML = radioSet;
    visibilityOf(this.options, total > 0);
    this.optionsRadio = Array(total);
    this.optionsRadioLabel = Array(total);
    for (var k = 0; k < total; k++) {
      this.optionsRadioLabel[k] = getElement(this.dialogChipLabel(k));
      this.optionsRadio[k] = getElement(this.dialogChip(k));
    }
    this.optionsRadioLabel[labels.indexOf(clicked)].click();
  }

  createActions(labels, types) {
    let total = labels.length;
    this.actions = getElement(this.actionsId);
    let actionSet = String();
    for (var i = total - 1; i >= 0; i--) {
      actionSet += getDialogButton(
        actionType.getButtonStyle(types[i]),
        this.dialogButton(i),
        labels[i]
      );
    }
    actionSet += getDialogLoaderSmall(this.actionLoader);

    this.actions.innerHTML = actionSet;
    this.dialogButtons = Array(total);
    for (var k = total - 1; k >= 0; k--) {
      this.dialogButtons[k] = getElement(this.dialogButton(k));
    }
    this.loading = getElement(this.actionLoader);
    this.loader(false);
  }

  setDisplay(head, body = null, imgsrc = null) {
    this.heading.textContent = head;
    this.subHeading.innerHTML = body;
    visibilityOf(this.image, imgsrc != null);
    if (imgsrc == null) {
      this.content.classList.remove("fmt-threequarter");
    } else {
      this.content.classList.add("fmt-threequarter");
      this.image.src = imgsrc;
    }
    replaceClass(
      this.content,
      "fmt-padding-small",
      "fmt-padding",
      imgsrc == null
    );
  }

  loader(show = true) {
    visibilityOf(this.loading, show);
    for (var k = 0; k < this.dialogButtons.length; k++) {
      visibilityOf(this.dialogButtons[k], !show);
    }
    if (show) {
      opacityOf(this.box, 0.5);
    } else {
      opacityOf(this.box, 1);
    }
  }

  largeTextArea(caption, hint) {
    this.largeTextField = new TextInput(
      this.textFieldId,
      this.textInputAreaId,
      this.textInputErrorId,
      this.textFieldCaptionId
    );
    this.largeTextField.normalize();
    this.largeTextField.setInputAttrs(hint);
    this.largeTextField.caption.textContent = caption;
    show(this.largeTextField.fieldset);
  }

  getInput(index) {
    return this.inputField[index].input;
  }
  getInputValue(index) {
    return this.inputField[index].getInput();
  }
  getDialogChip(index) {
    return this.optionsRadio[index];
  }
  getDialogButton(index) {
    return this.dialogButtons[index];
  }
  onChipClick(index, action) {
    this.optionsRadio[index].onclick = () => {
      action();
    };
  }
  onButtonClick(index, action) {
    this.dialogButtons[index].onclick = () => {
      action();
    };
  }
  normalize() {
    this.inputField.forEach((field) => {
      field.normalize();
    });
  }
  setBackgroundColor(type = bodyType.positive) {
    this.view.style.backgroundColor = colors.getColorByType(type);
  }
  existence(show = true) {
    value.backbluecovered = show;
    elementFadeVisibility(this.view, show);
  }
}

let clog = (msg) => {
  console.log(msg);
};

//idb classes
let idb, lidb;
let transaction, localTransaction;
let dbVer = 1;
class KeyPath {
  constructor() {
    this.admin = "admin";
    this.institution = "institution";
    this.timings = "timings";
    this.localUIID = "localuiid";
  }
}
let kpath = new KeyPath();
class Modes {
  edit = "readwrite";
  view = "readonly";
}
const mode = new Modes();

class ObjectStores {
  default;
  teachers;
  batches;
  today;
  constructor() {
    this.localDataName = "localDB";
    this.localDBKey = "localuiid";
    this.defaultDataName = "defaults";
    this.defaultKey = "type";
    this.teacherScheduleName = "teachers";
    this.teachersKey = "day";
    this.batchesScheduleName = "batches";
    this.batchesKey = "day";
    this.todayScheduleName = "today";
    this.todayKey = "period";
  }
}
let objStore = new ObjectStores();
class Transactions {
  constructor(database) {
    this.local;
    this.default;
    this.teachers;
    this.batches;
    this.today;
    this.db = database;
  }
  getLocalTx(mode = null) {
    if (mode != null) {
      return (this.local = this.db.transaction(objStore.localDataName, mode));
    }
    return (this.local = this.db.transaction(objStore.localDataName));
  }
  getDefaultTx(mode = null) {
    if (mode != null) {
      return (this.default = this.db.transaction(
        objStore.defaultDataName,
        mode
      ));
    }
    return (this.default = this.db.transaction(objStore.defaultDataName));
  }
  getTeachersTx(mode) {
    if (mode != null) {
      return (this.default = this.db.transaction(
        objStore.teacherScheduleName,
        mode
      ));
    }
    return (this.default = this.db.transaction(objStore.teacherScheduleName));
  }
  getBatchesTx(mode) {
    if (mode != null) {
      return (this.default = this.db.transaction(
        objStore.batchesScheduleName,
        mode
      ));
    }
    return (this.default = this.db.transaction(objStore.batchesScheduleName));
  }
  getTodayTx(mode) {
    if (mode != null) {
      return (this.default = this.db.transaction(
        objStore.todayScheduleName,
        mode
      ));
    }
    return (this.default = this.db.transaction(objStore.todayScheduleName));
  }
}

let sendPassResetLink = () => {
  snackBar(
    "A link has been sent at your provided email address. Reset your password from there.",
    "Got it"
  );
};

//todo: modify Dialog.createinputs method for direct call, instead of DIalog.inputparams.
let adminloginDialog = (isShowing = true, sensitive = true) => {
  var loginDialog = new Dialog();
  if (isShowing) {
    loginDialog.setDisplay(
      "Authentication Required",
      "You are about to perform a sensitive action. Please provide your login credentials."
    );
    loginDialog.createInputs(
      Array("Email address", "Password"),
      Array("youremail@example.com", "Your password"),
      Array("email", "password")
    );
    loginDialog.createActions(
      Array("Continue", "Cancel"),
      Array(actionType.neutral, actionType.positive)
    );
    if (sensitive) {
      loginDialog.setBackgroundColor(bodyType.negative);
    }
    loginDialog.getInput(0).onchange = (_) => {
      validateTextField(loginDialog.inputField[0], inputType.email, (_) => {
        loginDialog.inputField[1].input.focus();
      });
    };
    loginDialog.getInput(1).onchange = (_) => {
      validateTextField(loginDialog.inputField[1], inputType.password);
    };
    loginDialog.onButtonClick(0, (_) => {
      if (
        !(
          stringIsValid(loginDialog.getInputValue(0), inputType.email) &&
          stringIsValid(loginDialog.getInputValue(1))
        )
      ) {
        validateTextField(
          loginDialog.inputField[1],
          inputType.password,
          (_) => {
            loginDialog.inputField[0].input.focus();
          }
        );
        validateTextField(loginDialog.inputField[0], inputType.email, (_) => {
          loginDialog.inputField[1].input.focus();
        });
      } else {
        snackBar("TBD");
        //todo: authenticate
      }
    });
    loginDialog.onButtonClick(1, (_) => {
      loginDialog.existence(false);
    });
  }
  loginDialog.existence(isShowing);
};

let resetPasswordDialog = (isShowing = true, inputvalue = null) => {
  var resetDialog = new Dialog();
  if (isShowing) {
    resetDialog.setDisplay(
      "Reset password",
      "Provide us your email address and we'll help you to reset your password via an email.",
      "/graphic/icons/schemester512.png"
    );
    resetDialog.createInputs(
      Array("Your email address"),
      Array("you@example.domain"),
      Array("email"),
      Array(inputvalue)
    );
    resetDialog.createActions(
      Array("Send Link", "Cancel"),
      Array(actionType.positive, actionType.negative)
    );
    resetDialog.getInput(0).onchange = () => {
      validateTextField(resetDialog.inputField[0], inputType.email);
    };
    resetDialog.onButtonClick(0, () => {
      if (!stringIsValid(resetDialog.getInputValue(0), inputType.email)) {
        validateTextField(resetDialog.inputField[0], inputType.email);
        return;
      }
      sendPassResetLink(); //todo
      resetDialog.existence(false);
      snackBar(
        "You'll receive a link if your email address was correct. Reset your password from there.",
        "Got it"
      );
    });
    resetDialog.onButtonClick(1, () => {
      resetDialog.existence(false);
    });
  }
  resetDialog.existence(isShowing);
};

let changeEmailBox = (isShowing = true) => {
  var mailChange = new Dialog();
  mailChange.setDisplay(
    "Change Email Address",
    "You need to verify yourself, and then provide your new email address. You'll be logged out after successful change.",
    "/graphic/icons/schemester512.png"
  );
  mailChange.createInputs(
    Array(
      "Existing Account password",
      "Existing email address",
      "New email address"
    ),
    Array(
      "Current password",
      "youremail@example.domain",
      "someone@example.com"
    ),
    Array("password", "email", "email")
  );
  mailChange.createActions(
    Array("Change Email ID", "Abort"),
    Array(actionType.negative, actionType.positive)
  );

  mailChange.getInput(0).onchange = () => {
    validateTextField(mailChange.inputField[0], inputType.nonempty, (_) => {
      mailChange.getInput(1).focus();
    });
  };

  mailChange.getInput(1).onchange = () => {
    validateTextField(mailChange.inputField[1], inputType.email, (_) => {
      mailChange.getInput(2).focus();
    });
  };

  mailChange.getInput(2).onchange = () => {
    validateTextField(mailChange.inputField[2], inputType.email);
  };
  mailChange.onButtonClick(0, () => {
    if (
      !(
        stringIsValid(mailChange.getInputValue(0)) &&
        stringIsValid(mailChange.getInputValue(1), inputType.email) &&
        stringIsValid(mailChange.getInputValue(2), inputType.email)
      )
    ) {
      validateTextField(mailChange.inputField[0], inputType.nonempty, (_) => {
        mailChange.getInput(1).focus();
      });
      validateTextField(mailChange.inputField[1], inputType.email, (_) => {
        mailChange.getInput(2).focus();
      });
      validateTextField(mailChange.inputField[2], inputType.email);
      return;
    }
    //todo: changeadmniemail
    mailChange.existence(false);
    snackBar(
      "Your email id has been changed to " + mailChange.getInputValue(2),
      "Okay",
      () => {
        snackBar("You need to login again");
      }
    );
  });
  mailChange.onButtonClick(1, () => {
    mailChange.existence(false);
  });
  mailChange.existence(isShowing);
};

let registrationDialog = (isShowing = true, email = null, uiid = null) => {
  checkSessionVaildation(_=>{
    var confirmLogout = new Dialog();
    confirmLogout.setDisplay(
      "Already Logged In.",
      `You are currently logged in as <b>{user.email}</b>.
       You need to log out before creating a new account. Confirm log out?`
    );
    confirmLogout.createActions(
      Array("Stay logged in", "Log out"),
      Array(actionType.positive, actionType.negative)
    );
    confirmLogout.onButtonClick(0, () => {
      confirmLogout.existence(false);
    });
    confirmLogout.onButtonClick(1, () => {
      confirmLogout.loader();
      finishSession(_=>{registrationDialog(true)});
    });
    confirmLogout.existence(true);
  },_=>{
    var regDial = new Dialog();
    regDial.setDisplay(
      "Create Admin Account",
      "Create a new account with a working email address (individual or institution)."
    );
    regDial.createActions(
      Array("Next", "Cancel"),
      Array(actionType.positive, actionType.negative)
    );
    regDial.createInputs(
      Array(
        "Your name",
        "Email Address",
        "New Password",
        "Unique Institution ID - UIID"
      ),
      Array(
        "Shravan Kumar, or something?",
        "youremail@example.domain",
        "Strong password",
        "A unique ID for your institution"
      ),
      Array("text", "email", "password", "text"),
      Array(null, email, null, uiid),
      Array("name", "email", "new-password", "username"),
      Array(true, false, false, false),
      Array("words", "off", "off", "off")
    );
    regDial.onButtonClick(1, () => {
      regDial.existence(false);
    });
    regDial.getInput(0).onchange = () => {
      validateTextField(regDial.inputField[0], inputType.name, (_) => {
        regDial.getInput(1).focus();
      });
    };
    regDial.getInput(1).onchange = () => {
      validateTextField(regDial.inputField[1], inputType.email, (_) => {
        regDial.getInput(2).focus();
      });
    };
    regDial.getInput(2).onchange = () => {
      //todo: type is password
      validateTextField(regDial.inputField[2], inputType.password, (_) => {
        regDial.getInput(3).focus();
      });
    };
    regDial.getInput(3).onchange = () => {
      //todo: username validation
      validateTextField(regDial.inputField[3], inputType.username);
    };
    regDial.onButtonClick(0, () => {
      if (
        !(
          stringIsValid(regDial.getInputValue(0), inputType.name) &&
          stringIsValid(regDial.getInputValue(1), inputType.email) &&
          stringIsValid(regDial.getInputValue(2), inputType.password) &&
          stringIsValid(regDial.getInputValue(3), inputType.username)
        )
      ) {
        validateTextField(regDial.inputField[0], inputType.name, (_) => {
          regDial.getInput(1).focus();
        });
        validateTextField(regDial.inputField[1], inputType.email, (_) => {
          regDial.getInput(2).focus();
        });
        //todo: type is password
        validateTextField(regDial.inputField[2], inputType.password, (_) => {
          regDial.getInput(3).focus();
        });
        //todo: username validation
        validateTextField(regDial.inputField[3], inputType.username);
      } else {
        regDial.normalize();
        regDial.loader();
        createAccount(
          regDial,
          String(regDial.getInputValue(0)).trim(),
          String(regDial.getInputValue(1)).trim(),
          regDial.getInputValue(2),
          String(regDial.getInputValue(3)).trim()
        );
      }
    });
    regDial.existence(isShowing);
  })
};

let createAccount = (dialog, adminname, email, password, uiid) => {
  postData("/admin/auth/signup", {
    username: adminname,
    email: email,
    password: password,
    uiid: uiid,
  })
    .then((res) => {
      let result = res.result;
      dialog.loader(false);
      clog(result.event);
      switch (result.event) {
        case code.auth.ACCOUNT_CREATED:
          {
            clog(result);
            loadingBox();
          }
          break;
        case code.auth.USER_EXIST:
          {
            dialog.inputField[1].showError("Account already exists.");
            snackBar("Try signing in?", "Login", true, (_) => {
              refer(locate.adminLoginPage, { email: email, uiid: uiid });
            });
          }
          break;
        case code.server.UIID_TAKEN:
          {
            dialog.inputField[3].showError(
              "This UIID is not available. Try something different."
            );
          }
          break;
        case code.auth.EMAIL_INVALID:
          {
            dialog.inputField[1].showError("Invalid email address.");
          }
          break;
        case code.auth.PASSWORD_INVALID:
          {
            //todo: check invalidity and show suggesstions
            dialog.inputField[2].showError(
              "Invalid password, try something better."
            );
          }
          break;
        case code.auth.NAME_INVALID:
          {
            dialog.inputField[0].showError("This doesn't seem like a name.");
          }
          break;
        default: {
          dialog.existence(false);
          snackBar(`${result.event}:${result.msg}`, "Report", false);
        }
      }
    })
    .catch((error) => {
      clog(error);
      snackBar(error, "Report", false);
    });
};

let accountVerificationDialog = (isShowing = true, emailSent = false) => {
  var verify = new Dialog();
  if (emailSent) {
    verify.setDisplay(
      "Waiting for verification",
      `A link has been sent. Check your email box at 
      <b>{user.email}</b>, verify your account there, and then click continue here.`
    );
    verify.createActions(
      Array("Verify & Continue", "Abort"),
      Array(actionType.positive, actionType.negative)
    );
    verify.onButtonClick(1, () => {
      verify.loader();
      //todo : not verified, delete account
    });
    verify.onButtonClick(0, () => {
      verify.loader();
      //todo : check verification
    });
  } else {
    verify.setDisplay(
      "Verification Required",
      `We need to verify you. A link will be sent at <b>
        {user.email}
      </b>, you need to verify your account there. Confirm to send link?`
    );
    verify.createActions(
      Array("Send link", "Cancel"),
      Array(actionType.positive, actionType.negative)
    );
    verify.onButtonClick(1, () => {
      verify.loader();
      //todo: cancel verification
    });
    verify.onButtonClick(0, () => {
      verify.loader();

      //todo: send verification email
    });
  }
  verify.existence(isShowing);
};

let silentLogin = (email, password, action) => {
  //todo: login without relocation
};
let feedBackBox = (isShowing = true, defaultText = String(), error = false) => {
  var feedback = new Dialog();
  feedback.setDisplay(
    "Contact Developers",
    "Are you facing any problem? Or want a feature that helps you in some way? Explain everything that here. " +
      "We are always eager to listen from you.",
    "/graphic/icons/schemester512.png"
  );
  feedback.createInputs(
    Array("Your email address"),
    Array("To help or thank you directly ;)"),
    Array("email"),
    Array(nothing),
    Array("email")
  );
  feedback.largeTextArea(
    "Describe everything",
    "Start typing your experience here"
  );
  feedback.createRadios(
    Array("Feedback", "Error"),
    error ? "Error" : "Feedback"
  );

  feedback.setBackgroundColor(!error);

  feedback.createActions(
    Array("Submit", "Abort"),
    Array(actionType.positive, actionType.negative)
  );
  feedback.onChipClick(0, (_) => {
    feedback.setBackgroundColor();
  });
  feedback.onChipClick(1, (_) => {
    feedback.setBackgroundColor(bodyType.negative);
  });
  feedback.getInput(0).onchange = () => {
    validateTextField(feedback.inputField[0], inputType.email, (_) => {
      feedback.largeTextField.input.focus();
    });
  };

  feedback.largeTextField.input.value = defaultText;

  feedback.largeTextField.onTextDefocus((_) => {
    validateTextField(feedback.largeTextField, inputType.nonempty);
  });

  feedback.onButtonClick(0, () => {
    if (
      !(
        stringIsValid(feedback.getInputValue(0), inputType.email) &&
        stringIsValid(feedback.largeTextField.getInput())
      )
    ) {
      validateTextField(feedback.largeTextField, inputType.nonempty);
      validateTextField(feedback.inputField[0], inputType.email, (_) => {
        feedback.largeTextField.input.focus();
      });
    } else {
      refer(mailTo("schemester@outlook.in"), {
        subject: `From ${feedback.getInputValue(0)}`,
        body: feedback.largeTextField.getInput(),
      });
      feedback.existence(false);
      snackBar(
        "Thanks for the interaction. We'll look forward to that.",
        "Hide"
      );
    }
  });
  feedback.onButtonClick(1, () => {
    feedback.existence(false);
  });
  feedback.existence(isShowing);
};

let loadingBox = (
  visible = true,
  title = "Please wait",
  subtitle = constant.nothing
) => {
  let load = new Dialog();
  load.setBoxHTML(load.getloaderContent(title, subtitle));
  load.setBackgroundColor(bodyType.nothing);
  load.existence(visible);
};

let checkSessionVaildation=(validAction = null, invalidAction = null,destination = locate.adminDashPage)=>{
  postData(post.sessionValidate, {
    [constant.sessionKey]: window.localStorage.getItem(constant.sessionKey),
    destination: destination,
  }).then((res) => {
    if (res.result.event == code.auth.SESSION_INVALID) {
      if(invalidAction == null){
        relocate(res.result.destination);
      } else{
        invalidAction();
      }
    } else {
      if(validAction == null){
        relocate(res.result.destination);
      }else{
        validAction()
      }
    }
  });
}

let validateTextField = (
  textfield = new TextInput(),
  type = inputType.nonempty,
  afterValidAction = (_) => {
    clog(nothing);
  },
  ifmatchField = null
) => {
  var error,
    matcher = constant.nothing;
  switch (type) {
    case inputType.name:
      {
        error = "There has to be a name.";
      }
      break;
    case inputType.email:
      {
        error = "Invalid email address.";
      }
      break;
    case inputType.match:
      {
        error = "This one is different.";
        matcher = ifmatchField.getInput();
      }
      break;
    default: {
      error = "This can't be empty";
    }
  }

  textfield.showError(error);
  if (!stringIsValid(textfield.getInput(), type, matcher)) {
    textfield.inputFocus();
    textfield.onTextInput((_) => {
      textfield.normalize();
      if (textfield.getInput() != nothing) {
        validateTextField(textfield, type, (_) => {
          afterValidAction();
        });
      } else {
        textfield.onTextInput((_) => {
          textfield.normalize();
        });
        textfield.onTextDefocus((_) => {
          if (stringIsValid(textfield.getInput(), type, matcher)) {
            afterValidAction();
          } else {
            textfield.showError(error);
            validateTextField(textfield, type, (_) => {
              afterValidAction();
            });
          }
        });
      }
    });
  } else {
    textfield.normalize();
    textfield.onTextDefocus((_) => {
      if (stringIsValid(textfield.getInput(), type, matcher)) {
        afterValidAction();
      } else {
        textfield.showError(error);
        validateTextField(textfield, type, (_) => {
          afterValidAction();
        });
      }
    });
  }
};

let finishSession =(afterfinish = ()=>{relocate(locate.root)})=>{
  window.localStorage.setItem(constant.sessionKey, null);
  afterfinish();
}

let setFieldSetof = (
  fieldset,
  isNormal = true,
  errorField = null,
  errorMsg = null
) => {
  if (errorField != null && errorMsg != null) {
    errorField.innerHTML = errorMsg;
  }
  if (isNormal && errorField != null) {
    errorField.innerHTML = nothing;
  }
  setClassName(
    fieldset,
    bodyType.getFieldStyle(bodyType.positive),
    bodyType.getFieldStyle(bodyType.negative),
    isNormal
  );
};

let setClassName = (
  element,
  normalClass,
  errorClass,
  condition = actionType.positive,
  warnClass,
  activeClass
) => {
  switch (condition) {
    case actionType.positive:
      {
        element.className = normalClass;
      }
      break;
    case actionType.negative:
      {
        element.className = errorClass;
      }
      break;
    case actionType.warning:
      {
        element.className = warnClass;
      }
      break;
    case actionType.active:
      {
        element.className = activeClass;
      }
      break;
    default: {
      if (condition == false) {
        element.className = errorClass;
      } else {
        element.className = normalClass;
      }
    }
  }
};

let showElement = (elements, index) => {
  for (var k = 0, j = 0; k < elements.length; k++, j++) {
    visibilityOf(elements[k], k == index);
  }
};

let elementFadeVisibility = (element, isVisible) => {
  replaceClass(
    element,
    "fmt-animate-opacity-off",
    "fmt-animate-opacity",
    isVisible
  );
  visibilityOf(element, isVisible);
};

let elementRiseVisibility = (element, isVisible) => {
  replaceClass(
    element,
    "fmt-animate-bottom-off",
    "fmt-animate-bottom",
    isVisible
  );
  visibilityOf(element, isVisible);
};

let setDefaultBackground = (element, type = actionType.positive) => {
  element.style.backgroundColor = colors.getColorByType(type);
  switch (type) {
    case actionType.neutral:
      element.style.color = colors.black;
      break;
    default:
      element.style.color = colors.white;
  }
};

let replaceClass = (element, class1, class2, replaceC1 = true) =>
  replaceC1
    ? element.classList.replace(class1, class2)
    : element.classList.replace(class2, class1);

let showLoader = (_) => show(getElement("navLoader"));
let hideLoader = (_) => hide(getElement("navLoader"));
let opacityOf = (element, value = 1) => (element.style.opacity = String(value));
let visibilityOf = (element, visible = true) =>
  (element.style.display = visible ? constant.show : constant.hide);
let hide = (element = new HTMLElement()) => visibilityOf(element, false);
let show = (element = new HTMLElement()) => visibilityOf(element, true);

let stringIsValid = (
  value = String,
  type = inputType.nonempty,
  ifMatchValue = String
) => {
  switch (type) {
    case inputType.name:
      return stringIsValid(String(value).trim());
    case inputType.email:
      return constant.emailRegex.test(String(value).toLowerCase());
    //todo: case inputType.password: return constant.passRegex.test(String(passValue));
    case inputType.match:
      return value == ifMatchValue;
    default:
      return value != null && value != constant.nothing;
  }
};

let getDayName = (dIndex = Number) =>
  dIndex < constant.weekdays.length ? constant.weekdays[dIndex] : null;
let getMonthName = (mIndex = Number) =>
  mIndex < constant.months.length ? constant.months[mIndex] : null;
let getElement = (id) => document.getElementById(id);

let relocate = (path, data = null) => {
  if (data != null) {
    let i = 0;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        path =
          i > 0 ? `${path}&${key}=${data[key]}` : `${path}?${key}=${data[key]}`;
        i++;
      }
    }
  }
  window.location.replace(path);
};

let postData = async (url = String, data = {}) => {
  const response = await fetch(url, {
    method: constant.post,
    mode: "same-origin",
    headers: { "Content-type": constant.fetchContentType },
    body: getRequestBody(data, true),
  });
  return response.json();
};

let putData = async (url = String, data = {}) => {
  await fetch(url, {
    method: constant.put,
    mode: "same-origin",
    headers: { "Content-type": constant.fetchContentType },
    body: getRequestBody(data, true),
  });
};

let refer = (href, data = null) => {
  href += data != null ? getRequestBody(data) : constant.nothing;
  clog(String(href).indexOf('?'));
  window.location.href = href;
};

let getRequestBody = (data = {}, isPost = false) => {
  let i = 0;
  let body = constant.nothing;
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      clog(key + ":" + data[key]);
      if (isPost) {
        body =
          i > 0 ? `${body}&${key}=${data[key]}` : `${body}${key}=${data[key]}`;
      } else {
        body =
          i > 0 ? `${body}&${key}=${data[key]}` : `${body}?${key}=${data[key]}`;
      }
      i++;
    }
  }
  clog(body);
  return body;
};

let mailTo = (to) => `mailto:${to}`;

let idbSupported = () => {
  if (!window.indexedDB) {
    clog("IDB:0");
    snackBar(
      "This browser is outdated for Schemester to work. Switch to Chrome/Edge/Safari/Firefox, or any modern browser.",
      "Learn more",
      actionType.negative,
      (_) => {
        refer("https://google.com/search", {
          q: "modern+browsers",
        });
      }
    );
  }
  return window.indexedDB;
};

let addNumberSuffixHTML = (number) => {
  var str = String(number);
  switch (number) {
    case 1:
      return number + "<sup>st</sup>";
    case 2:
      return number + "<sup>nd</sup>";
    case 3:
      return number + "<sup>rd</sup>";
    default: {
      if (number > 9) {
        if (str.charAt(str.length - 2) == "1") {
          return number + "<sup>th</sup>";
        } else {
          switch (str.charAt(str.length - 1)) {
            case "1":
              return number + "<sup>st</sup>";
            case "2":
              return number + "<sup>nd</sup>";
            case "3":
              return number + "<sup>rd</sup>";
            default:
              return number + "<sup>th</sup>";
          }
        }
      } else {
        return number + "<sup>th</sup>";
      }
    }
  }
};

let setTimeGreeting =(element = new HTMLElement())=> {
  var today = new Date();
  if (today.getHours() < 4) {
    element.innerHTML = "Good night!";
  } else if (today.getHours() < 11) {
    element.innerHTML = "Good morning!";
  } else if (today.getHours() < 15) {
    element.innerHTML = "Good afternoon";
  } else if (today.getHours() < 20) {
    element.innerHTML = "Good evening";
  } else {
    element.innerHTML = "Schemester";
  }
}

let getProperDate = (dateTillMillis = String()) => {
  let year = dateTillMillis.substring(0, 4);
  let month = dateTillMillis.substring(4, 6);
  let date = dateTillMillis.substring(6, 8);
  let hour = dateTillMillis.substring(8, 10);
  let min = dateTillMillis.substring(10, 12);
  let sec = dateTillMillis.substring(12, 14);
  //let mill = dateTillMillis.substring(14,18);
  clog(dateTillMillis.substring(6, 8));
  return `${getMonthName(
    month - 1
  )} ${date}, ${year} at ${hour}:${min} hours ${sec} seconds`;
};

let getRadioChip = (labelID, label, radioID) =>
  `<label class="radio-container" id="${labelID}">${label}<input type="radio" name="dialogChip" id="${radioID}"><span class="checkmark"></span></label>`;
let getInputField = (fieldID, captionID, inputID, errorID) =>
  `<fieldset class="fmt-row text-field" id="${fieldID}"> 
  <legend class="field-caption" id="${captionID}"></legend> 
  <input class="text-input" id="${inputID}">
  <span class="fmt-right error-caption" id="${errorID}"></span></fieldset>`;
let getDialogButton = (buttonClass, buttonID, label) =>
  `<button class="${buttonClass} fmt-right" id="${buttonID}">${label}</button>`;
let getDialogLoaderSmall = (loaderID) =>
  `<img class="fmt-spin-fast fmt-right" width="50" src="/graphic/blueLoader.svg" id="${loaderID}"/>`;
