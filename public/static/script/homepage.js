//Homepage default script
var adminLogin, adminSignup,adminDash;
const click = 'click';
function initializeElements(){
    adminLogin = document.getElementById('adminLogin');
    adminSignup = document.getElementById('registerInstitution');
    adminDash = document.getElementById('adminDashboard');
    adminSignup.addEventListener(click, function(){
        showLoader();
        window.location.href ="registration.html";
    }, false);
    showGreeting();
}
function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            adminLogin.addEventListener(click, function(){
                showLoader();
                window.location.href = "admin/admin_dash.html";
            }, false);
            adminDash.addEventListener(click, function(){
                showLoader();
                window.location.replace("admin/admin_dash.html");
            }, false);
        } else {
            adminLogin.addEventListener(click, function(){
                showLoader();
                window.location.href = "admin/admin_login.html";
            }, false);
            adminDash.addEventListener(click, function(){
                showLoader();
                window.location.href = "admin/admin_login.html";
            }, false);
        }
    });
}
function showGreeting(){
    var today = new Date();
    var greeting = document.getElementById('homeGreeting');
    if(today.getHours()<4){
        greeting.textContent = "Good night!"
    } else if(today.getHours()<11){
        greeting.textContent = "Good morning!"
    } else if(today.getHours()<15){
        greeting.textContent = "Good afternoon"
    } else if(today.getHours()<20){
        greeting.textContent = "Good evening"
    }else {
        greeting.textContent = "Schemester"
    }
}
function showLoader(){
    document.getElementById('homeNavLoader').style.display = "block";
}

window.onload = function() {
    initializeElements();
    initAuthStateListener();
};