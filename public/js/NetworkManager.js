// ================================================
// DECLARATION SOCKET
var socket = io();
// ================================================



// ================================================
// MAIN
var game;
var myRoom = [];
var personalRoomId = false;
var myConfig = {};
var isPlayerAlreadySet = false;

socket.on('newPlayer',function(dataNewPlayer){
    var room = dataNewPlayer[0];
    var score = dataNewPlayer[1];
    var props = dataNewPlayer[2];
    if(!isPlayerAlreadySet){
        for(var i=0;i<room.length;i++){     
            if(room[i].id == socket.id){
                myConfig = room[i];
                personalRoomId = room[i].id;
                game = new Game('renderCanvas',myConfig,props);
                isPlayerAlreadySet = true;
                document.getElementById('gameName').innerText = room[i].name;
            }
        }
    }
    game.displayScore(score);

    // Check the players who connect
    checkIfNewGhost(room);
});

// Check the players who log out
socket.on('disconnectPlayer', function(room){
checkIfGhostDisconnect(room);
});
// ================================================


// ================================================
// EXTRA FUNCTIONS
var sortRoom = function(room){ // sort the players in room by id
    return room.sort(function(a, b) {
            var nameA = a.id.toUpperCase(); // ignore upper and lowercase
            var nameB = b.id.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        // names must be equal
        return 0;
    });
}
var checkIfNewGhost = function(room){ // check if there is a new ghost in room
    for(var i=0;i<room.length;i++){
        if(room[i].id != personalRoomId){
            var ghostAlreadyExist = false;
            for(var j=0;j<myRoom.length;j++){
                if(room[i].id == myRoom[j].id){
                    ghostAlreadyExist = true;
                    break;
                }
            }
            if(!ghostAlreadyExist){ // if ghost not exist yet in myRoom
                createGhost(room[i],room[i].id);
            }
        }
    }
}
var checkIfGhostDisconnect = function(room){ // check if it miss a ghost in room
    for(var i=0;i<myRoom.length;i++){
        var ghostExist = false;
        for(var j=0;j<room.length;j++){
            if(myRoom[i].id == room[j].id){
                ghostExist = true;
                break;
            }
        }

        if(!ghostExist){ // if ghost not exist yet in myRoom
            deleteGhost(myRoom[i].id,i);
        }
    }
}
var createGhost = function(ghost,id){ // create a new ghost
    myRoom.push(ghost);
    newGhostPlayer = GhostPlayer(game,ghost,id);
    game._PlayerData.ghostPlayers.push(newGhostPlayer);
}
var updateGhost = function(data){ // update all the ghosts with room data
    socket.emit('updateData',[data,personalRoomId]);
}
var deleteGhost = function(index,position){ // delete the ghost by the index
    deleteGameGhost(game,index);
    myRoom.splice(position,1);
    // here function to destroy the ghost of the game
}
var sendGhostRocket = function(position, rotation, direction){
    socket.emit('newRocket',[position, rotation, direction, personalRoomId]);
}
var sendGhostLaser = function(position1, position2){
    socket.emit('newLaser',[position1, position2, personalRoomId]);
}
var sendDamages = function(damage,target){ // update all the ghosts with room data
    socket.emit('distributeDamage',[damage, target, personalRoomId]);
}
var sendPostMortem = function(whoKilledMe){ // update all the ghosts with room data
    if(!whoKilledMe){
        var whoKilledMe = personalRoomId;
    }
    socket.emit('killPlayer',[personalRoomId,whoKilledMe]);
}
var ressurectMe = function(position){ // update all the ghosts with room data
    var dataToSend = [game._PlayerData.sendActualData(),personalRoomId];
    dataToSend[0].ghostCreationNeeded = true;
    socket.emit('updateData',dataToSend);
}

var destroyPropsToServer = function(idServer,type){ // update all the ghosts with room data
    socket.emit('updatePropsRemove',[idServer,type]);
}
// ================================================
socket.on('requestPosition', function(room){
    var dataToSend = [game._PlayerData.sendActualData(),personalRoomId];
    socket.emit('updateData',dataToSend);
});

socket.on ('updatePlayer', function (arrayData) {
    if(arrayData.id != personalRoomId){
        if(arrayData.ghostCreationNeeded){
            var newGhostPlayer = GhostPlayer(game,arrayData,arrayData.id);
            game._PlayerData.ghostPlayers.push(newGhostPlayer);
        }else{
            game._PlayerData.updateLocalGhost(arrayData);
        }
    }
});

socket.on ('createGhostRocket', function (arrayData) {
    if(arrayData[3] != personalRoomId){
        game.createGhostRocket(arrayData);
    }
});

socket.on ('createGhostLaser', function (arrayData) {
    if(arrayData[2] != personalRoomId){
        game.createGhostLaser(arrayData);
    }
});

socket.on ('giveDamage', function (arrayData) {
    if(arrayData[1] == personalRoomId){
        console.log('receive damage')
        game._PlayerData.getDamage(arrayData[0],arrayData[2]);
    }
    
});

socket.on ('killGhostPlayer', function (arrayData) {
    var idArray = arrayData[0];
    var roomScore = arrayData[1];
    if(idArray[0] != personalRoomId){
        deleteGameGhost(game,idArray[0]);
    }
    if(idArray[1] == personalRoomId){
        // game._PlayerData.newDeadEnnemy(idArray[2]);
    }
    game.displayScore(roomScore);
});

socket.on ('ressurectGhostPlayer', function (idPlayer) {
    if(idPlayer != personalRoomId){
        deleteGameGhost(game,idPlayer);
    }
});

// socket.on ('deleteProps', function (deleteProp) {
//     game._ArenaData.deletePropFromServer(deleteProp)
// });
// socket.on ('recreateProps', function (createdProp) {
//     game._ArenaData.recreatePropFromServer(createdProp)
// });