var openGameList;


var Game = {  

    ref:"",
     STATE : {OPEN: 1, JOINED: 2, WAITING_USER_RESPONSE: 3,RESPONSE_RECIVED: 4, COMPLETE: 5},  
   
    
   
  createGameBtn: function (property,value,id) {
                 $(id).attr(property,value)
         
      },

initiateGame:function() {
       
        console.log("creating a game here i am!");//for debuging purpose
        var user = firebase.auth().currentUser;
        var currentGame = {
                 creator: {
                     uid: user.uid,
                     displayName: user.displayName,
                     answer:"",
                     responseRecived:"No"
                    },
                     state: Game.STATE.OPEN,
                    
               };
        var key = ref.push();//every game has a unique key
        key.set(currentGame, function(error) {
            if (error) {
                console.log("Uh oh, error creating game.", error);
            } else {
                console.log("I created a game ...stp1! and its key is"+" " + key);
                console.log("I created a game ...stp1! and its key is"+" " + key.key);
                key.onDisconnect().remove();
                Game.trackGameState(key.key);
                Game.init1();
               Game.createGameBtn("disabled","true","#create-game");
             //  $("#create-game-container").hide();

            }
        })
     },

    //add join game button

    addJoinGameButton:function (key, game) {
            var item = document.createElement("li");               
            item.id = key;
            item.innerHTML = '<button  ' +
                             'class="bg-info">' +
                             'Join ' + game.creator.displayName + '</button>';                       
            item.addEventListener("click", function() {
              Game.joinThisGame(key);               
            });
              openGameList.appendChild(item);// to have the list of open games
            },

    
joinThisGame: function (key) {
        console.log("Attempting to join game here i am: ", key);
        var user = firebase.auth().currentUser;
        ref.child(key).transaction(function(game) {
            if (!game.joiner) {
                game.state = Game.STATE.JOINED;
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
                    Game.trackGameState(key);
                   Game.createGameBtn("disabled","true","#create-game");
                 // $("#create-game-container").hide();
                } 
            } 
            else {
                console.log("Could not commit when trying to join game", error);
            }
        });
     },

    joinedGame:function (game, gameRef) {
        if (game.creator.uid == firebase.auth().currentUser.uid) {        
            window.setTimeout(function() {
             gameRef.update({state: Game.STATE.WAITING_USER_RESPONSE});
             }, 1000);
        }
     } ,
          
     getAnswer:function(){
      
            console.log(firebase.auth().currentUser.displayName +" "+"you clicked"+" "+$(this).val());         
            var ganswer=$(this).val();
            Game.createGameBtn("disabled","true",".game-answer")
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
                Game.createGameBtn("disabled","true",".game-answer")
            }   
            if(firebase.auth().currentUser.uid===data.joiner.uid){
                var joinerRef=gameref.child("joiner")
                joinerRef.update({
                    answer : ganswer,  
                    responseRecived:"Yes"  ,
                    wantstoplayAgain:"No"     
                });
                Game.createGameBtn("disabled","true",".game-answer")
            }   
            
         })
         
            ref.on("child_added",function(snapshot){//
            data=snapshot.val()
         var key=snapshot.key
             var gameref=ref.child(key);
        //    if both response recived change the state
            if(data.creator.responseRecived==="Yes" && data.joiner.responseRecived==="Yes"){
            gameref.update({state: Game.STATE.RESPONSE_RECIVED});
            }
         n
            Game.trackGameState(key);
           } );   
     },
     
     waitUserResponse:function (game,gameRef) {          
             $("#choices").show()
          /*    var d=$("div")
             var r= $("<button>")
          r.text("rock")
             r.attr("value", "rock")
             r.addClass("game-answer")
            var s= $("<button>")
              s.text("scissor").addClass("game-answer")
             s.attr("value","scissor")
             var p= $("<button>")
              p.text("paper").addClass("game-answer")
         p.attr("value","paper")
            $("#choices").append(r,s,p)
             
             $(document).on("click" ,".game-answer", Game.getAnswer)*/
             
        
              //$(".game-answer").removeAttr( "disabled" ) 
         
    } ,  
determineWinner:function (game,gameRef) {
        
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
                state: Game.STATE.COMPLETE,
                "creator/wins": creatorWins,
               "joiner/wins": joinerWins
              });
    },

    
showWinner:function(game) {
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
    },

playAgainGame:function(){
    
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
                                         
                   gameref.update({state: Game.STATE.JOINED})
                  // $("#result").hide();  
                   $("#result").hide();                         
                   Game.trackGameState(key);
                
               })
               
               
            }  ,
    //game state watcher
 trackGameState:function(key) {

        var gameRef = ref.child(key);

        gameRef.on("value", function(snapshot) {

            var game = snapshot.val();
            console.log("Game update:", game);

            switch (game.state) {
                case Game.STATE.JOINED:
                    Game.joinedGame(game, gameRef);
                    break;
                case Game.STATE.WAITING_USER_RESPONSE://take answer 
                    Game.waitUserResponse(game,gameRef);
                    break;  
               case Game.STATE.RESPONSE_RECIVED://take answer 
                    Game.determineWinner(game,gameRef);
                    break;                 
                
                case Game.STATE.COMPLETE:
                    Game.showWinner(game);
                   
                    break;
            }
        })
    },
               
    // Exposed functions
    
        /*
         * Firebase event handlers for when open games are created,
         * and also handing when they are removed.
         * */
        init: function() {
           
            $(document).on("click","#create-game",Game.initiateGame)
            $(document).on("click","#playAgain", Game.playAgainGame) 
                                                   
            $("#create-account-container").hide();
           $("#create-game-container").hide();
            //$("#choices").hide();
            $("#resultOfTheGame").hide();
            $("#result").hide()
            $("#logout-container").hide()
           $("#choices").hide()
            $("#result").hide()
           
        },
        init1:function(){

         $(document).on("click" ,".game-answer",Game.getAnswer)
           $(document).on("click","#create-account",creatAccount)         
           choiceDialog = document.querySelector("#choices");
           result=document.querySelector("#resultOfTheGame");
           openGameList= document.querySelector("#games ul");
           ref = firebase.database().ref("/games");
           var openGames = ref.orderByChild("state").equalTo(Game.STATE.OPEN);

           openGames.on("child_added", function(snapshot) {
                var data = snapshot.val();
                console.log("Game Added i am here waiting some one:", data);
                console.log("ur id is "+data.creator.uid)
                console.log("game key "+snapshot.key)
             //ignore our own games 
                if (data.creator.uid != firebase.auth().currentUser.uid) {
                    Game.addJoinGameButton(snapshot.key, data);
                }
            });

            openGames.on("child_removed", function(snapshot) {
                var item = document.querySelector("#" + snapshot.key);
                if (item) {
                    item.remove();
                }
            });
        }
        
    }


    function creatAccount(){
        $("#create-account-container").show();
        $("#login-form").hide();
    
    } 