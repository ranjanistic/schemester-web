const appName = "Schemester",
  click = "click",
  input = "input",
  change = "change",
  nothing = "",
  space = " ",
  tab = "   ",
  hide = "none",
  show = "block",
  adminLoginPage = "/admin/auth",
  adminDashPage = "/admin/dash",
  homepage = "/home",
  root = "/",
  registrationPage = "/admin/register",
  planspage = "/plans",
  adminSettings = "/admin/manage",
  localDB = appName;

var cred = Array(2);

class Colors{
  constructor(){
    this.base = "#216bf3";
    this.positive = this.base;
    this.error = "#c40c0c";
    this.active = "green";
    this.white = "#ffffff";
    this.black = "#000000";
  }
  getColorByType(type){
    switch(type){
      case actionType.positive:
        return this.positive;
      case actionType.negative:
        return this.error;
      case actionType.neutral:
        return this.white;
      case actionType.active:
        return this.active;
      default:return this.base;
    }
  }
}
var colors = new Colors();

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
    this.error = getElement(errorId);
    setFieldSetof(this.fieldset, false);
  }
  setFieldCaption(caption) {
    this.caption.textContent = caption;
  }
  onTextInput(action) {
    this.input.oninput = () => {
      action();
    };
  }
  onTextDefocus(action) {
    this.input.onchange = () => {
      action();
    };
  }
  setFieldView(errorMsg = null) {
    setFieldSetof(this.fieldset, errorMsg == null, this.error, errorMsg);
  }
  setInputAttrs(hint, type, defaultValue) {
    this.input.placeholder = hint;
    this.input.type = type;
    this.input.value = defaultValue;
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
  }
  createSnack(text,type){
    this.text.innerHTML = text;
    setDefaultBackground(this.bar,type);
  }
  createButton(buttontext,action = null){
    this.button.innerHTML = buttontext;
    if(action!=null){
      this.button.onclick = _=>{
        action();
      }
    } else {
      this.button.onclick = _=>{
        this.hide();
      }
    }
  }

  show() {
    replaceClass(
      this.bar,
      "fmt-animate-bottom-off",
      "fmt-animate-bottom",
      true
    );
  }
  hide(){
    replaceClass(
      this
      .bar,
      "fmt-animate-bottom-off",
      "fmt-animate-bottom",
      false
    );
    visibilityOf(this.bar, false);
  }
}

let snackBar = (
  text = String(),
  actionText = String(),
  isNormal = true,
  action = () => {
    new Snackbar().hide();
  }
) => {
  var snack = new Snackbar();
  if (text != nothing) {
    snack.text.textContent = text;
    if (actionText != nothing && actionText != nothing) {
      snack.button.textContent = actionText;
      snack.button.onclick = () => {
        new Snackbar().hide();
        action();
      };
    }
    setDefaultBackground(snack.bar, isNormal);
    visibilityOf(snack.button, actionText != null && actionText != nothing);
    setTimeout(_=>{
      new Snackbar().hide();
    }, (5000));
  }
  replaceClass(
    snack.bar,
    "fmt-animate-bottom-off",
    "fmt-animate-bottom",
    text != nothing
  );
  visibilityOf(snack.bar, text != nothing);
  
};

class DialogID {
  viewId = "dialogView";
  boxId = "dialogBox";
  imageId = "dialogImage";
  contentId = "dialogContent";
  headingId = "dialogHeading";
  subHeadId = "dialogSubHeading";
  inputs = "inputFields";
  dialogInputField(index) {
    return "dialogInputField" + index;
  }
  dialogFieldCaption(index) {
    return "dialogFieldCaption" + index;
  }
  dialogInput(index) {
    return "dialogInput" + index;
  }
  dialogInputError(index) {
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
}

class ActionType {
  constructor() {
    this.neutral = "neutral";
    this.positive = "positive";
    this.negative = "negative";
    this.warning = "warning";
    this.active = "active";
  }
  getStyleClass(type) {
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
}
var actionType = new ActionType();

class Dialog extends DialogID {
  constructor(largeTextArea = 0) {
    super(DialogID);
    this.view = getElement(this.viewId);
    setDefaultBackground(this.view);
    this.box = getElement(this.boxId);
    opacityOf(this.box, 1);
    this.image = getElement(this.imageId);
    this.content = getElement(this.contentId);

    this.heading = getElement(this.headingId);
    this.subHeading = getElement(this.subHeadId);

    this.inputFields = getElement(this.inputs);
    visibilityOf(this.inputFields,false);
    this.options = getElement(this.optionsId);
    visibilityOf(this.options, false);
    this.textField = getElement(this.textFieldId);
    visibilityOf(this.textField,false);
  }
  createInputs(captions, hints, types, contents, autocompletes) {
    let total = captions.length;
    let fieldSet = String();
    for (var i = 0; i < total; i++) {
      fieldSet =
        fieldSet +
        '<fieldset class="fmt-row text-field" id="' +
        this.dialogInputField(i) +
        '">' +
        '<legend class="field-caption" id="' +
        this.dialogFieldCaption(i) +
        '"></legend>' +
        '<input class="text-input" id="' +
        this.dialogInput(i) +
        '">' +
        '<span class="fmt-right error-caption" id="' +
        this.dialogInputError(i) +
        '"></span></fieldset>';
    }
    this.inputFields.innerHTML = fieldSet;
    visibilityOf(this.inputFields, total > 0);
    this.inputField = Array(total);
    this.inputCaption = Array(total);
    this.input = Array(total);
    this.inputError = Array(total);
    for (var k = 0; k < total; k++) {
      this.inputField[k] = getElement(this.dialogInputField(k));
      this.inputCaption[k] = getElement(this.dialogFieldCaption(k));
      this.input[k] = getElement(this.dialogInput(k));
      this.inputError[k] = getElement(this.dialogInputError(k));
      this.input[k].value = null;
      setFieldSetof(this.inputField[k], true, this.inputError[k]);
    }
    for (var k = 0; k < total; k++) {
      this.inputCaption[k].textContent = captions[k];
      this.input[k].placeholder = hints[k];
      this.input[k].type = types[k];
      if (contents != null) {
        this.input[k].value = contents[k];
      }
      if (autocompletes != null) {
        this.input[k].autocomplete = autocompletes[k];
      }
    }
  }
  createRadios(labels, clicked) {
    let total = labels.length;
    visibilityOf(this.options, this.radioVisible);
    let radioSet = String();
    for (var i = 0; i < total; i++) {
      radioSet =
        radioSet +
        '<label class="radio-container" id="' +
        this.dialogChipLabel(i) +
        '">' +
        labels[i] +
        '<input type="radio" name="dialogChip" id="' +
        this.dialogChip(i) +
        '"><span class="checkmark"></span></label>';
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
      actionSet =
        actionSet +
        '<button class="' +
        actionType.getStyleClass(types[i]) +
        ' fmt-right" id="' +
        this.dialogButton(i) +
        '">' +
        labels[i] +
        "</button>";
    }
    actionSet +=
      '<img class="fmt-spin-fast fmt-right" width="50" src="/graphic/blueLoader.svg" id="' +
      this.actionLoader +
      '"/>';
    this.actions.innerHTML = actionSet;
    this.dialogButtons = Array(total);
    for (var k = total - 1; k >= 0; k--) {
      this.dialogButtons[k] = getElement(this.dialogButton(k));
    }
    this.loading = getElement(this.actionLoader);
    this.loader(false);
  }

  setDisplay(head, body, imgsrc = null) {
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
    this.textFieldCaption = getElement(this.textFieldCaptionId);
    this.textInput = getElement(this.textInputAreaId);
    this.textInputError = getElement(this.textInputErrorId);
    setFieldSetof(this.textField, true, this.textInputError);
    this.textFieldCaption.textContent = caption;
    this.textInput.placeholder = hint;
    visibilityOf(this.textField,true);
  }

  getInput(index) {
    return this.input[index];
  }
  getInputValue(index) {
    return this.input[index].value;
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
  setBackgroundColor(color = colors.base) {
    elementFadeVisibility(this.view, false);
    this.view.style.backgroundColor = color;
    elementFadeVisibility(this.view, true);
  }
  existence(show = true) {
    elementFadeVisibility(this.view, show);
  }
}

let clog = (msg) => {
  console.log(msg);
};

//idb classes
const dbName = appName;
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
let adminloginDialog = (isShowing = true) => {
  var loginDialog = new Dialog(2);
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
      Array(actionType.positive, actionType.negative)
    );
    loginDialog.onButtonClick(0, (_) => {
      //login
    });
    loginDialog.onButtonClick(1, (_) => {
      loginDialog.existence(false);
    });
  }
  loginDialog.existence(isShowing);
};

let resetPasswordDialog = (isShowing = true) => {
  var resetDialog = new Dialog(1);
  if (isShowing) {
    resetDialog.setDisplay(
      "Reset password",
      "Provide us your email address and we'll help you to reset your password via an email.",
      "/graphic/icons/schemester512.png"
    );
    resetDialog.createInputs(
      Array("Your email address"),
      Array("you@example.domain"),
      Array("email")
    );
    resetDialog.createActions(
      Array("Send Link", "Cancel"),
      Array(actionType.positive, actionType.negative)
    );
    resetDialog.getInput(0).onchange = () => {
      verificationValid();
    };
    let verificationValid = () => {
      var valid = isEmailValid(resetDialog.input[0].value);
      setFieldSetof(
        resetDialog.inputField[0],
        valid,
        resetDialog.inputError[0],
        "Invalid email address"
      );
      visibilityOf(resetDialog.getDialogButton(0), valid);
      resetDialog.getInput(0).oninput = () => {
        setFieldSetof(
          resetDialog.inputField[0],
          isEmailValid(resetDialog.input[0].value),
          resetDialog.inputError[0],
          "Invalid email address"
        );
        visibilityOf(
          resetDialog.getDialogButton(0),
          isEmailValid(resetDialog.input[0].value)
        );
      };
      return isEmailValid(resetDialog.getInputValue(0));
    };
    resetDialog.onButtonClick(0, () => {
      if (verificationValid()) {
        sendPassResetLink();
        snackBar(
          "You'll receive a link if your email address was correct. Reset your password from there.",
          "Got it"
        );
        resetDialog.existence(false);
      }
    });
    resetDialog.onButtonClick(1, () => {
      resetDialog.existence(false);
    });
  }

  resetDialog.existence(isShowing);
};

let changeEmailBox = (isShowing = true) => {
  var mailChange = new Dialog(3);
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

  mailChange.getInput(0).oninput = () => {
    visibilityOf(
      mailChange.getDialogButton(0),
      runEmptyCheck(
        mailChange.getInput(0),
        mailChange.inputField[0],
        mailChange.inputError[0]
      )
    );
  };
  mailChange.getInput(0).onchange = () => {
    visibilityOf(
      mailChange.getDialogButton(0),
      runEmptyCheck(
        mailChange.getInput(0),
        mailChange.inputField[0],
        mailChange.inputError[0]
      )
    );
  };
  mailChange.getInput(1).oninput = () => {
    visibilityOf(
      mailChange.getDialogButton(0),
      isEmailValid(mailChange.getInput(1))
    );
  };
  mailChange.getInput(1).onchange = () => {
    visibilityOf(
      mailChange.getDialogButton(0),
      runEmailCheck(
        mailChange.getInput(1),
        mailChange.inputField[1],
        mailChange.inputError[1]
      )
    );
  };
  mailChange.getInput(2).oninput = () => {
    visibilityOf(
      mailChange.getDialogButton(0),
      isEmailValid(mailChange.getInput(1))
    );
  };
  mailChange.getInput(2).onchange = () => {
    visibilityOf(
      mailChange.getDialogButton(0),
      runEmailCheck(
        mailChange.getInput(2),
        mailChange.inputField[1],
        mailChange.inputError[1]
      )
    );
  };
  mailChange.onButtonClick(0, () => {
    if (
      runEmptyCheck(
        mailChange.getInput(0),
        mailChange.inputField[0],
        mailChange.inputError[0]
      )
    ) {
      if (
        runEmailCheck(
          mailChange.getInput(1),
          mailChange.inputField[1],
          mailChange.inputError[1]
        )
      ) {
        if (
          runEmailCheck(
            mailChange.getInput(2),
            mailChange.inputField[2],
            mailChange.inputError[2]
          )
        ) {
          snackBar(
            "Your email id has been changed to " + mailChange.getInputValue(2),
            "okay",
            () => {
              snackBar("You need to login again");
              logoutUser(false);
            }
          );
          mailChange.existence(false);
          firebase.auth().signOut();
        }
      }
    }
  });
  mailChange.onButtonClick(1, () => {
    mailChange.existence(false);
  });
  mailChange.existence(isShowing);
};

let registrationDialog = (isShowing = true) => {
  if (false) {
    //if already logged in
    var confirmLogout = new Dialog();
    confirmLogout.setDisplay(
      "Already Logged In.",
      "You are currently logged in as <b>" +
        user.email +
        "</b>. You need to log out before creating a new account. Confirm log out?"
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
      logoutUser();
    });
    confirmLogout.existence(true);
  } else {
    var regDial = new Dialog(2);
    regDial.setDisplay(
      "Create Admin Account",
      "Create a new account with a working email address (individual or institution)."
    );
    regDial.createActions(
      Array("Next", "Cancel"),
      Array(actionType.positive, actionType.negative)
    );
    regDial.createInputs(
      Array("Email Address", "New Password"),
      Array("youremail@example.domain", "Strong password"),
      Array("email", "password"),
      null,
      Array("email", "current-password")
    );
    regDial.onButtonClick(1, () => {
      regDial.existence(false);
      new Snackbar().hide();
    });
    regDial.getInput(0).onchange = () => {
      if (
        runEmailCheck(
          regDial.getInput(0),
          regDial.inputField[0],
          regDial.inputError[0]
        )
      ) {
        regDial.getInput(1).focus();
      }
    };
    regDial.onButtonClick(0, () => {
      regDial.loader();
      new Snackbar().hide();
      if (isEmailValid(regDial.getInputValue(0))) {
        if (true) {
          ///isPasswordValid(regDial.getInput(1).value || true)){
          createAccount(
            regDial,
            regDial.getInputValue(0),
            regDial.getInput(1).value
          );
        } else {
          runPasswordCheck(
            regDial.getInput(1),
            regDial.inputField[1],
            regDial.inputError[1]
          );
          regDial.loader(false);
        }
      } else {
        runEmailCheck(
          regDial.getInput(0),
          regDial.inputField[0],
          regDial.inputError[0]
        );
        regDial.loader(false);
      }
    });
    regDial.existence(isShowing);
  }
};

//not working todo
let createAccount = (dialog, email, password) => {
  fetch("/admin/auth/signup", {
    method: "post",
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: `email=${email}&password=${password}`,
  })
    .then((res) => res.json())
    .then((res) => {
      clog(res);
      dialog.loader(false);
      dialog.existence(false);
      alert(res.event);
      switch (res.event) {
        case code.auth.ACCOUNT_CREATED:
          {
            alert(code.auth.ACCOUNT_CREATED);
          }
          break;
        default:
          alert(code.auth.ACCOUNT_CREATION_FAILED);
      }
    })
    .catch((error) => clog(error));
};

let accountVerificationDialog = (isShowing = true, emailSent = false) => {
  var verify = new Dialog();
  var user = firebase.auth().currentUser;
  if (emailSent) {
    verify.setDisplay(
      "Waiting for verification",
      "A link has been sent. Check your email box at <b>" +
        user.email +
        "</b>, verify your account there, and then click continue here."
    );
    verify.createActions(
      Array("Verify & Continue", "Abort"),
      Array(actionType.positive, actionType.negative)
    );
    verify.onButtonClick(1, () => {
      verify.loader();
      user
        .delete()
        .then(() => {
          verify.existence(false);
          snackBar("Your account was not created.", null, false);
        })
        .catch((error) => {
          verify.loader(false);
          snackBar(error, "Report", false);
        });
    });
    verify.onButtonClick(0, () => {
      verify.loader();
      clog("cred:" + cred);
      firebase.auth().signOut();
      silentLogin(cred[0], cred[1], () => {
        user = firebase.auth().currentUser;
        if (user.emailVerified) {
          relocate(planspage);
        } else {
          snackBar("Not yet verified", null, false);
          verify.loader(false);
        }
      });
    });
  } else {
    verify.setDisplay(
      "Verification Required",
      "We need to verify you. A link will be sent at <b>" +
        user.email +
        "</b>, you need to verify your account there. Confirm to send link?"
    );
    verify.createActions(
      Array("Send link", "Cancel"),
      Array(actionType.positive, actionType.negative)
    );
    verify.onButtonClick(1, () => {
      verify.loader();
      user
        .delete()
        .then(() => {
          verify.existence(false);
          snackBar("Your account was not created.", null, false);
        })
        .catch((error) => {
          verify.loader(false);
          snackBar(error, "Report", false);
        });
    });
    verify.onButtonClick(0, () => {
      verify.loader();
      user
        .sendEmailVerification()
        .then(() => {
          snackBar("Email sent");
          accountVerificationDialog(true, true);
          verify.loader(false);
        })
        .catch((error) => {
          snackBar(error, "Report", false);
          clog(error);
          verify.loader(false);
          // An error happened.
        });
    });
  }
  verify.existence(isShowing);
};
let logoutUser = (sendHome = true) => {
  firebase.auth().signOut();
  if (sendHome) {
    relocate(root);
  } else {
    relocate(adminLoginPage);
  }
};
let silentLogin = (email, password, action) => {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      action();
    })
    .catch((error) => {
      snackBar(error, null, false);
    });
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
    Array("email"),Array(nothing),Array('email')
  );
  feedback.largeTextArea(
    "Describe everything",
    "Start typing your experience here"
  );
  feedback.createRadios(
    Array("Feedback", "Error"),
    error ? "Error" : "Feedback"
  );
  feedback.createActions(
    Array("Submit", "Abort"),
    Array(actionType.positive, actionType.negative)
  );
  feedback.onChipClick(0, (_) => {
    feedback.setBackgroundColor();
  });
  feedback.onChipClick(1, (_) => {
    feedback.setBackgroundColor(colors.error);
  });
  feedback.getInput(0).onchange = () => {
    visibilityOf(
      feedback.getDialogButton(0),
      runEmailCheck(
        feedback.getInput(0),
        feedback.inputField[0],
        feedback.inputError[0]
      )
    );
    if (isEmailValid(feedback.getInputValue(0))) {
      feedback.textInput.focus();
    }
  };
  feedback.textInput.value = defaultText;
  feedback.textInput.oninput = () => {
    visibilityOf(
      feedback.getDialogButton(0),
      runEmptyCheck(
        feedback.textInput,
        feedback.textField,
        feedback.textInputError
      )
    );
  };
  feedback.textInput.onchange = () => {
    visibilityOf(
      feedback.getDialogButton(0),
      runEmptyCheck(
        feedback.textInput,
        feedback.textField,
        feedback.textInputError
      )
    );
  };

  feedback.onButtonClick(0, () => {
    if (
      runEmailCheck(
        feedback.getInput(0),
        feedback.inputField[0],
        feedback.inputError[0]
      )
    ) {
      if (
        runEmptyCheck(
          feedback.textInput,
          feedback.textField,
          feedback.textInputError
        )
      ) {
        refer(
          "mailto:schemester@outlook.in?subject=From " +
            feedback.getInputValue(0) +
            "&body=" +
            feedback.textInput.value
        );
        snackBar(
          "Thanks for the interaction. We'll look forward to that.",
          "Hide"
        );
        feedback.existence(false);
      }
    }
  });
  feedback.onButtonClick(1, () => {
    feedback.existence(false);
  });
  feedback.existence(isShowing);
};

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
  setClassName(fieldset, "text-field", "text-field-error", isNormal);
};

let setClassName = (element, normalClass, eventClass, condition) => {
  if (condition != null) {
    if (condition) {
      element.className = normalClass;
    } else {
      element.className = eventClass;
    }
  } else {
    element.className = normalClass;
  }
};

let runEmailCheck = (input, fieldset, error) => {
  setFieldSetof(
    fieldset,
    isEmailValid(input.value),
    error,
    "Invalid email address"
  );
  input.oninput = () => {
    setFieldSetof(
      fieldset,
      isEmailValid(input.value),
      error,
      "Invalid email address"
    );
  };
  return isEmailValid(input.value);
};

let runPasswordCheck = (input, fieldset, error) => {
  setFieldSetof(
    fieldset,
    isPasswordValid(input.value),
    error,
    "Password should atleast contain:\n" +
      "· Uppercase and lowercase letters\n· Numbers\n· Special charecters"
  );
  input.oninput = () => {
    setFieldSetof(
      fieldset,
      input.value.length >= 8,
      error,
      "Password should be atleast 8 charecters long"
    );
    setFieldSetof(
      fieldset,
      isPasswordValid(input.value),
      error,
      "Password should atleast contain:\n" +
        "· Uppercase and lowercase letters\n· Numbers\n· Special charecters"
    );
  };
};

let runEmptyCheck = (input, fieldset, error) => {
  setFieldSetof(
    fieldset,
    isNotEmpty(input.value),
    error,
    "This can't be empty"
  );
  input.oninput = () => {
    setFieldSetof(
      fieldset,
      isNotEmpty(input.value),
      error,
      "This can't be empty"
    );
  };
  return isNotEmpty(input.value);
};

let showElement = (elements, index) => {
  for (var k = 0, j = 0; k < elements.length; k++, j++) {
    visibilityOf(elements[k], k == index);
  }
};

let replaceClass = (element, class1, class2, replaceC1 = true) => {
  replaceC1
    ? element.classList.replace(class1, class2)
    : element.classList.replace(class2, class1);
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

let setDefaultBackground = (element,type = actionType.positive) => {
  element.style.backgroundColor = colors.getColorByType(type);
  switch(type){
    case actionType.neutral:element.style.color = colors.black;break;
    default:element.style.color = colors.white;
  }
};

let showLoader = () => {
  visibilityOf(getElement("navLoader"), true);
};
let hideLoader = () => {
  visibilityOf(getElement("navLoader"), false);
};

let opacityOf = (element, value) => {
  element.style.opacity = String(value);
};

let visibilityOf = (element, visible = Boolean()) => {
  if (visible) {
    element.style.display = show;
  } else {
    element.style.display = hide;
  }
};

let isNotEmpty = (text) => {
  return (
    text != null && text != nothing && text.length > 0 && text.trim() != null
  );
};

let isEmailValid = (emailValue) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(String(emailValue).toLowerCase());
};
let isPasswordValid = (passValue) => {
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#()])[A-Za-z\d@$!%*?&#()]{8,}$/;
  return passRegex.test(String(passValue));
};
let getDayName = (dIndex) => {
  switch (dIndex) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return "Error";
  }
};
let getMonthName = (mIndex) => {
  switch (mIndex) {
    case 0:
      return "January";
    case 1:
      return "February";
    case 2:
      return "March";
    case 3:
      return "April";
    case 4:
      return "May";
    case 5:
      return "June";
    case 6:
      return "July";
    case 7:
      return "August";
    case 8:
      return "September";
    case 9:
      return "October";
    case 10:
      return "November";
    case 11:
      return "December";
    default:
      return "Error";
  }
};

let getElement = (id) => {
  return document.getElementById(id);
};
let relocate = (path) => {
  window.location.replace(path);
};
let refer = (href) => {
  window.location.href = href;
};

let idbSupported = () => {
  if (!window.indexedDB) {
    clog("IDB:0");
    snackBar(
      "This browser is outdated for Schemester to work. Switch to Chrome/Edge/Safari/Firefox, or any modern browser.",
      nothing,
      false
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
let checkmark = (text) => {
  return `<label class=\"check-container\">${text}<input type=\"checkbox\"><span class=\"tickmark\"></span></label>`;
};

let radiobox = (content) => {
  return `<label class=\"radio-box-container\"><input type=\"radio\" checked=\"checked\" name=\"radio\"><div class=\"radio-box-mark\">${content}</div></label>`;
};

let getProperDate =(dateTillMillis = String())=>{
  let year =  dateTillMillis.substring(0,4);
  let month = dateTillMillis.substring(4,6);
  let date = dateTillMillis.substring(6,8);
  let hour = dateTillMillis.substring(8,10);
  let min = dateTillMillis.substring(10,12);
  let sec = dateTillMillis.substring(12,14);
  //let mill = dateTillMillis.substring(14,18);
  clog(dateTillMillis.substring(6,8));
  return `${getMonthName(month-1)} ${date}, ${year} at ${hour}:${min} hours ${sec} seconds`;
}

class Codes {
  constructor() {
    class Servercodes {
      constructor() {
        this.DATABASE_ERROR = "server/database-error:";
        this.INSTITUTION_EXISTS = "server/institution-collection-exists";
        this.INSTITUTION_CREATED = "server/institution-collection-created";
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
        this.EMAIL_INVALID = "auth/invalid-email";
        this.LOGGED_OUT = "auth/logged-out";
        this.ACCOUNT_CREATED = "auth/account-created";
        this.ACCOUNT_CREATION_FAILED = "auth/account-not-created";
        this.AUTH_SUCCESS = "auth/sign-in-success";
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
  }
}

const code = new Codes();
