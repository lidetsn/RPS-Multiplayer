// to control the login and the game
firebase.initializeApp(Config.firebase);
// Application starts
window.onload = function() {   
    Session.init();//login
    Game.init();
};

