//The admin login page script
var emailFieldSet, emailError, passwordFieldset, forgotPassword, emailInput,passwordInput,logInButton,logInLoader
,back;

function initializeElements(){
    emailFieldSet = getElement('email_fieldset');
    passwordFieldset = getElement('password_fieldset');
    puiidFieldSet = getElement("puiid_fieldset")
    forgotPassword = getElement('forgotpasswordButton');
    emailError = getElement("emailError");
    emailInput = getElement('adminemail');
    passwordInput = getElement('adminpassword');
    puiidInput = getElement('puiid');
    logInButton = getElement('loginAdminButton');
    logInLoader = getElement('loginLoader');
    back = getElement('backFromLogin');

    back.addEventListener(click,function(){
        showLoader();
        relocate(root);
    },false);
    logInButton.addEventListener(click, adminLogin, false);
    passwordInput.addEventListener(input,function(){
        setFieldSetof(passwordFieldset,true);
        visibilityOf(forgotPassword,false);
    },false);
    emailInput.addEventListener(change,focusToNext,false);
    passwordInput.addEventListener(change,focusToNext,false);
    visibilityOf(forgotPassword,false);
    forgotPassword.addEventListener(click,resetPasswordDialog,false);
    puiidInput.addEventListener(change,focusToNext,false);

}

function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if(user){
            relocate(root);
        }
    });
}

function adminLogin() {
    visibilityOf(logInLoader,true);
    visibilityOf(logInButton,false);
    setFieldSetof(emailFieldSet,true);
    setFieldSetof(passwordFieldset,true);
    snackBar(false);
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
    }
    firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        clog(errorCode);
        switch(errorCode){
            case "auth/wrong-password":{
                setFieldSetof(passwordFieldset,false);
                visibilityOf(forgotPassword,true);
                logInButton.textContent = "Retry";
            };break;
            case "auth/too-many-requests":{
                snackBar(true,'Too many unsuccessfull attempts, try again after a while.',false,nothing,false);
                logInButton.textContent = "Disabled";
            };break;
            case "auth/user-not-found":{
                setFieldSetof(emailFieldSet,false,emailError,"Account not found.");
                logInLoader.style.display = hide;
                emailInput.focus();
                logInButton.textContent = "Retry";
            };break;
            case "auth/invalid-email":{
                validateEmailID(emailInput,emailFieldSet,emailError);
            };break;
            case "auth/user-disabled":{
                snackButton.onclick = function(){
                    showLoader();
                    refer("/about.html#userDisabled");
                }
                logInButton.textContent = "Retry";
                snackBar(true,"This account has been disabled. You might want to contact us directly.",true,"Help",false);
            };break;
            case "auth/network-request-failed":{
                logInButton.textContent = "Retry";
                snackBar(true,'No internet connection',false,nothing,false);
            };break;
            default: {
                logInButton.textContent = "Retry";
                visibilityOf(forgotPassword,true);
                snackBar(true,errorCode+':'+errorMessage,true,'Help',false);
            }
        }
        visibilityOf(logInLoader,false);
        visibilityOf(logInButton,true);
    });
}

function validateEmailID(email,field,error){
    setFieldSetof(field,isEmailValid(email.value),error,"Invalid email address.");
    if(!isEmailValid(email.value)){
        email.focus();
        email.oninput = function(){
            setFieldSetof(field,true);
            validateEmailID(emailInput,emailFieldSet,emailError);
        }
    }
}

function focusToNext(){
    if(!isEmailValid(emailInput.value)){
        if(emailInput.value != nothing){
            validateEmailID(emailInput,emailFieldSet,emailError);
        }
        emailInput.focus();
    } else {
        if(passwordInput.value == nothing){
            passwordInput.focus();
        } else if(puiidInput.value == nothing){
            puiidInput.focus();
        }
    }
}
