    // ================================================
// FRAMEWORK DECLARATION
var express = require('express')
  , http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var os = require('os');
var ifaces = os.networkInterfaces();
// ================================================



// ================================================
// SHOW IP ADDRESS IN CONSOLE
console.log('=============');
console.log('IP ADDRESS:');
Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
    }
    if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':' + alias, iface.address);
    } else {
        // this interface has only one ipv4 adress
        console.log(ifname, iface.address);
    }
    ++alias;
    });
});
console.log('=============');
// ================================================



// ================================================
// DECLARATION
var room = [];
var sockets = {};
var namesList = [
        "Alpha",
        "Bravo",
        "Charlie",
        "Delta",
        "Echo",
        "Foxtrot",
        "Golf",
        "Hotel",
        "India",
        "Juliett",
        "Kilo",
        "Lima",
        "Mike",
        "November",
        "Oscar",
        "Papa",
        "Québec",
        "Romeo",
        "Sierra",
        "Tango",
        "Uniform",
        "Victor",
        "Whisky",
        "X-ray",
        "Yankee",
        "Zulu"];
var spawnPointsList = [
    {x:-20, y:5, z:0},
    {x:0, y:5, z:0},
    {x:20, y:5, z:0},
    {x:40, y:5, z:0}
];

var bonusBoxes = [
    {x:40, y:1.5,z:-20,t:2,v:1},
    {x:-40, y:1.5,z:-20,t:0,v:1}
];
var weaponBoxes = [
    {x:40, y:1.5,z:20,t:2,v:1},
    {x:-40, y:1.5,z:20,t:3,v:1}
];
var ammosBoxes = [
    {x:-70, y:1.5,z:20,t:2,v:1},
    {x:-70, y:1.5,z:-20,t:3,v:1},
];

var props = [bonusBoxes,weaponBoxes,ammosBoxes]
var countUsers = 0; // number of users since the beginning of the server
// ================================================



// ================================================
// USE PUBLIC FOLDER AS STATIC FOLDER
app.use(express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/public'));
// ================================================



// ================================================
// START LISTENING CLIENT
io.on('connection', function(socket){
    var name = getAName();
    countUsers++;
    socket.name = name;
    var tempUser = {
        id: socket.client.id,
        name: socket.name,
        life: 100,
        armor: 0,
        jumpNeed: false,
        position: getSpawnPoint(), // ex: { x:100, y:5, z:0}
        actualTypeWeapon: 1,
        axisMovement: [false,false,false,false],
        rotation: {x:0, y:0, z:0},
        score: 0
    };
    room.push(tempUser);
    console.log(room);
    io.emit('newPlayer',[room,getTopFive(room),props]); // all include sender

    // ================================================
    // LISTENERS
    socket.on('disconnect', function() {
        for(var i=0;i<room.length;i++){  
            if(room[i].id === socket.client.id){
                room.splice(i, 1);
                io.emit('disconnectPlayer',room); // all include sender
            }
        }
    });
    socket.on('newRocket', function(data) {
        io.sockets.emit ('createGhostRocket', data);
    });
    socket.on('newLaser', function(data) {
        io.sockets.emit ('createGhostLaser', data);
    });
    socket.on('distributeDamage', function(data) {
        io.sockets.emit ('giveDamage', data);
    });
    socket.on('killPlayer', function(arrayData) {
        var idPlayer = arrayData[0];
        var idKiller = arrayData[1];
        for(var i=0;i<room.length;i++){ 
            if(room[i].id === idKiller){
                if(idKiller === idPlayer){
                    room[i].score--;
                }else{
                    room[i].score++;
                }
            }
            if(room[i].id === idPlayer){
                arrayData[2] = room[i].name;
            }
        }
        io.sockets.emit ('killGhostPlayer', [arrayData,room]);
    });
    socket.on('ressurectPlayer', function(idPlayer) {
        io.sockets.emit ('ressurectGhostPlayer', idPlayer);
    });
    socket.on('updateData', function(arrayData) {
        var idPlayer = arrayData[1];
        var data = arrayData[0];
        for(var i=0;i<room.length;i++){  
            if(room[i].id === idPlayer){
                var datasend = {};
                if(data.position){
                    room[i].position.x = data.position.x;
                    room[i].position.y = data.position.y;
                    room[i].position.z = data.position.z;
                    datasend.position = room[i].position;
                }
                if(data.axisMovement){
                    room[i].axisMovement = data.axisMovement;
                    datasend.axisMovement = room[i].axisMovement;
                }
                if(data.rotation){
                    // console.log(data.rotation)
                    room[i].rotation.x = data.rotation.x;
                    room[i].rotation.y = data.rotation.y;
                    room[i].rotation.z = data.rotation.z;
                    datasend.rotation = room[i].rotation;
                }
                if(data.armor){
                    room[i].armor = data.armor;
                    room[i].health = data.health;
                    datasend.armor = room[i].armor;
                    datasend.health = room[i].health;
                }
                if(data.actualWeapon){
                    room[i].actualWeapon = data.actualWeapon;
                    datasend.actualWeapon = room[i].actualWeapon;
                }
                if(data.jumpNeed){
                    room[i].jumpNeed = data.jumpNeed;
                    datasend.jumpNeed = room[i].jumpNeed;
                }
                if(data.ghostCreationNeeded){
                    datasend.ghostCreationNeeded = true;
                }
                datasend.id = room[i].id;
                io.sockets.emit ('updatePlayer', datasend);
                break;
            }
        }
    });
    socket.on('updatePropsRemove', function(dataRemove) {
        var idServer = dataRemove[0];
        var type = dataRemove[1];
        io.sockets.emit ('deleteProps', dataRemove);
        switch (type){
            case 'ammos' :
                ammosBoxes[idServer].v = 0;
                launchCountDownRepop(2000,dataRemove);
            break;
            case 'bonus' :
                bonusBoxes[idServer].v = 0;
                launchCountDownRepop(2000,dataRemove);
            break;
            case 'weapon' :
                weaponBoxes[idServer].v = 0;
                launchCountDownRepop(2000,dataRemove);
            break;
        }
    });
    // ================================================
});
// ================================================



// ================================================
// EXTRA FUNCTIONS
var getAName = function(){
    return namesList[(countUsers % namesList.length)] + (countUsers/namesList.length|0!=0 ? (countUsers/namesList.length|0)+1 : "");
}

var getSpawnPoint = function(){
    return spawnPointsList[countUsers % spawnPointsList.length];
}

var getTopFive = function(room){
    var score = room;
    function compare(a,b) {
        if (a.score < b.score)
            return -1;
        if (a.score > b.score)
            return 1;
        return 0;
    }

    score.sort(compare);
    return score;
}

var launchCountDownRepop = function(time,dataRemoved){
    var dataRecreated = dataRemoved;
    setTimeout(function() {
        io.emit('recreateProps',dataRecreated);
        switch (dataRecreated[1]){
            case 'ammos' :
                ammosBoxes[dataRecreated[0]].v = 1;
            break;
            case 'bonus' :
                bonusBoxes[dataRecreated[0]].v = 1;
            break;
            case 'weapon' :
                weaponBoxes[dataRecreated[0]].v = 1;
            break;
        }
    }, time);
}
// ================================================d

// ================================================
// CHECK POSITION PLAYERS
setInterval(function(){
    io.emit('requestPosition',room);
}, 5000);
// ================================================



// ================================================
// START LISTENING ON THE PORT
server.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    //console.log('JustSquare listening at http://%s:%s', host, port);
    console.log(`Server is up on port ${port}: http://localhost:${port}/`);
});
// ================================================