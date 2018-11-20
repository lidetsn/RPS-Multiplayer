
var Game = (function() {

    var ref;
    var STATE = {OPEN: 1, JOINED: 2, WAITING_USER_RESPONSE: 3,RESPONSE_RECIVED: 4, COMPLETE: 5};   
    var openGameList;
    
   
 function createGameBtn(property,value,id) {
         $(id).attr(property,value)
         
      }
function creatAccount(){
    $("#create-account-container").show();
    $("#login-form").hide();

} function initiateGame() {
       
        console.log("creating a game here i am!");//for debuging purpose
        var user = firebase.auth().currentUser;
        var currentGame = {
               creator: {
                     uid: user.uid,
                     displayName: user.displayName,
                     answer:"",
                     responseRecived:"No"
                    },
                     state: STATE.OPEN,
                    
            };
        var key = ref.push();
        key.set(currentGame, function(error) {
            if (error) {
                console.log("Uh oh, error creating game.", error);
            } else {
                console.log("I created a game ...stp1! and its key is"+" " + key);
                console.log("I created a game ...stp1! and its key is"+" " + key.key);
                key.onDisconnect().remove();
                trackGameState(key.key);
               // createGameBtn("disabled","true","#create-game");
               $("#create-game-container").hide();
            }
        })
     }

    //add join game button

    function addJoinGameButton(key, game) {
            var item = document.createElement("li");               
            item.id = key;
            item.innerHTML = '<button  ' +
                             'class="bg-info">' +
                             'Join ' + game.creator.displayName + '</button>';                       
            item.addEventListener("click", function() {
              joinThisGame(key);               
            });
              openGameList.appendChild(item);// to have the list of open games
            }

    
    function joinThisGame(key) {
        console.log("Attempting to join game here i am: ", key);
        var user = firebase.auth().currentUser;
        ref.child(key).transaction(function(game) {
            if (!game.joiner) {
                game.state = STATE.JOINED;
                game.joiner = {
                         uid: user.uid,
                         displayName: user.displayName,
                         answer:"",
                         responseRecived:"No"
                 }
             }
            return game;
         }, function(error, committed, snapshot) {
            if (committed) {
                if (snapshot.val().joiner.uid == user.uid) {                 
                    trackGameState(key);
                  //  createGameBtn("disabled","true","#create-game");
                  $("#create-game-container").hide();
                } 
            } 
            else {
                console.log("Could not commit when trying to join game", error);
            }
        });
     }

    function joinedGame(game, gameRef) {
        if (game.creator.uid == firebase.auth().currentUser.uid) {        
            window.setTimeout(function() {
             gameRef.update({state: STATE.WAITING_USER_RESPONSE});
             }, 1000);
        }
     } 
          
     function getAnswer(){
      
            console.log(firebase.auth().currentUser.displayName +" "+"you clicked"+" "+$(this).val());         
            var ganswer=$(this).val();
            createGameBtn("disabled","true",".game-answer")
            $("#choices").hide()
            ref.on("child_added",function(snapshot){
            data=snapshot.val()
            var key=snapshot.key
            var gameref=ref.child(key);
            console.log("here is your Id"+data.creator.uid)
            console.log("the creator name is"+data.creator.displayName)
            console.log("The snap shot key is"+snapshot.key)
           
            if(firebase.auth().currentUser.uid===data.creator.uid){
                var creatorRef=gameref.child("creator")
                creatorRef.update({               
                answer : ganswer,  
                responseRecived:"Yes" ,
                wantstoplayAgain:"No" 
                });
            }   
            if(firebase.auth().currentUser.uid===data.joiner.uid){
                var joinerRef=gameref.child("joiner")
                joinerRef.update({
                    answer : ganswer,  
                    responseRecived:"Yes"  ,
                    wantstoplayAgain:"No"     
                });
            }   
            
         })
         
            ref.on("child_added",function(snapshot){//
            data=snapshot.val()
            var key=snapshot.key
            var gameref=ref.child(key);
           // if both response recived change the state
            if(data.creator.responseRecived==="Yes" && data.joiner.responseRecived==="Yes"){
            gameref.update({state: STATE.RESPONSE_RECIVED});
            }
            trackGameState(key);
           } );   
     }
     
    function waitUserResponse() {          
              $("#choices").show()
              //$(".game-answer").removeAttr( "disabled" ) 
       
    }   
    function determineWinner(game,gameRef) {
        
              var joinerSelect=game.joiner.answer;
              var creatorSelect=game.creator.answer;   
              var creatorWins=false
              var  joinerWins  =false        

              if (joinerSelect === creatorSelect) {           
                winner = "no winner/tie";
                }
              else if ((creatorSelect === 'paper' && joinerSelect === "rock") || (creatorSelect === 'scissor' && joinerSelect === 'paper') || (creatorSelect === 'rock' && joinerSelect === 'scissor')) {          
                //winner = creatorname;
                creatorWins=true;
               }
              else {
               // winner = joinerName;
                joinerWins=true;
            }    
                console.log("Setting game state as complete");
                gameRef.update({
                state: STATE.COMPLETE,
                "creator/wins": creatorWins,
               "joiner/wins": joinerWins
              });
    }

    
    function showWinner(game) {
       $("#result").show()
     
        var resultTitle = $("#showResult");
 
        if (game.creator.wins == game.joiner.wins) {
            console.log("draw")
            resultTitle.html( "It was a DRAW! ");
           // result.showModal();
            return;
        }

        var player = game.creator;
        if (game.joiner.uid == firebase.auth().currentUser.uid) {
            player = game.joiner;
        }

        if (player.wins) {
            resultTitle.html( "YOU WON! ");
            console.log("you won")
        } else {
            resultTitle.html("Sorry.<br/>You lost.")
            console.log("sorry")
        }
    }

    function playAgainGame(){
    
        ref.on("child_added",function(snapshot){
                    data=snapshot.val()
                    var key=snapshot.key
                    var gameref=ref.child(key);
        
                var creatorRef=gameref.child("creator")
                var joinerRef=gameref.child("joiner")
              var user=  firebase.auth().currentUser
            if(user.uid==data.creator.uid){
                creatorRef.update({               
                    answer:"",
                    responseRecived:"No",
                    wins:false,
                    wantstoplayAgain:"yes"
                   })
                   $(".game-answer").removeAttr( "disabled" ) 
                } 
                if(user.uid==data.joiner.uid){             
                   joinerRef.update({               
                    answer:"",
                    responseRecived:"No",
                    wins:false,
                    wantstoplayAgain:"yes"
                   })
                   $(".game-answer").removeAttr( "disabled" ) 
                }   
                                         
                   gameref.update({state: STATE.JOINED})
                  // $("#result").hide();  
                   $("#result").hide();                         
                   trackGameState(key);
                
               })
               
               
            }   
    //game state watcher

    function trackGameState(key) {

        var gameRef = ref.child(key);

        gameRef.on("value", function(snapshot) {

            var game = snapshot.val();
            console.log("Game update:", game);

            switch (game.state) {
                case STATE.JOINED:
                    joinedGame(game, gameRef);
                    break;
                case STATE.WAITING_USER_RESPONSE://take answer 
                    waitUserResponse(game,gameRef);
                    break;  
               case STATE.RESPONSE_RECIVED://take answer 
                    determineWinner(game,gameRef);
                    break;                 
                
                case STATE.COMPLETE:
                    showWinner(game);
                   
                    break;
            }
        })
    }

    // Exposed functions
    return {
        /*
         * Firebase event handlers for when open games are created,
         * and also handing when they are removed.
         * */
        init: function() {
           
            $(document).on("click","#create-game",initiateGame)
            $(document).on("click","#playAgain", playAgainGame) 
          /                                          
            $("#create-account-container").hide();
           $("#create-game-container").hide();
            $("#choices").hide();
            $("#resultOfTheGame").hide();
            $("#result").hide()
            $("#logout-container").hide()
            $("#choices").hide()
            $("#result").hide()
           
          

           $(document).on("click" ,".game-answer",getAnswer)
           $(document).on("click","#create-account", creatAccount)         
           choiceDialog = document.querySelector("#choices");
           result=document.querySelector("#resultOfTheGame");
           openGameList= document.querySelector("#games ul");
           ref = firebase.database().ref("/games");
           var openGames = ref.orderByChild("state").equalTo(STATE.OPEN);

           openGames.on("child_added", function(snapshot) {
                var data = snapshot.val();
                console.log("Game Added i am here waiting some one:", data);
                console.log("ur id is "+data.creator.uid)
                console.log("game key "+snapshot.key)
             //ignore our own games 
                if (data.creator.uid != firebase.auth().currentUser.uid) {
                    addJoinGameButton(snapshot.key, data);
                }
            });

            openGames.on("child_removed", function(snapshot) {
                var item = document.querySelector("#" + snapshot.key);
                if (item) {
                    item.remove();
                }
            });
        },
        
    };
})
();