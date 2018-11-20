// using the power of fire base documentatiion to authenticate user
//here i use login using email address and pasword
// you must create account to use the game
var Session = (function() {   
    var loggedIn = false;

    
    function authStateChangeListener(user) {
        console.log("Auth state change: ", user);

        //signin
        if (user) {
            console.log("I am now logged in as"+ user.displayName);
            loggedIn = true;
            closeLoginDialog();
            
            document.querySelector("#login-form").style.display = "none";
            document.querySelector("#logout").style.display = "block";

           
            Game.onlogin();
        } else { //signout
            if (loggedIn) {
                loggedIn = false;
                window.location.reload();
            }
        }
    }

    /*
     * Sign in with a username and password
     * */
    function signInWithEmailandPassword() {
        var email = document.querySelector("#email");
        var password = document.querySelector("#password");
        var valid = Forms.validateForm([email, password]);

        if (valid) {
            firebase.auth().signInWithEmailAndPassword(email.value, password.value).then(function(user) {
                console.log("Signed in with user: ", user);
                $("#create-game-container").show();
                $("#login-form").hide();
                $("#logout-container").show()
            }, function(error) {
                console.log("Sign in error: ", error);
            })
        } else {
            var data = {message: "All fields required"};
            
        }
    }

   
    function closeLoginDialog() {
        var dialog = document.querySelector("#login-dialog");
        if (dialog.open) {
            dialog.close();
        }
    }

    function submitCreateAccount() {
        //fields
        var displayName = document.querySelector("#entry-displayname");
        var email = document.querySelector("#entry-email");
        var password = document.querySelector("#entry-password");
        var valid = Forms.validateForm([displayName, email, password]);

        if (valid) {
            firebase.auth().createUserWithEmailAndPassword(email.value, password.value).then(function(user) {
                console.log('Create user and sign in Success', user);
                
                user.updateProfile({displayName: displayName.value});
                $("#create-account-container").hide();
               $("#create-game-container").show();
                $("#logout-container").show()
               
            }, function(error) {
                console.error('Create user and sign in Error', error);
                
            });
        } else {
            var data = {message: "All fields required"};
            
        }
    }
 
    return {
        
        init: function() {
           

            firebase.auth().onAuthStateChanged(authStateChangeListener);          
            document.querySelector("#logOut").addEventListener("click", function() {
          firebase.auth().signOut().then(function() {
               console.log('Signed Out');
             }, function(error) {
            console.error('Sign Out Error', error);
               });
             });
            $(document).on("click","#sign-in",signInWithEmailandPassword)
          
            $(document).on("click","#entry-submit",submitCreateAccount)
        },
    }
})();