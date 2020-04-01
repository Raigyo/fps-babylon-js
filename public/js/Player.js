//Player component

//Movements + Camera component
Player = function(game, canvas) {
    //Instanciation:
    // _this is access to the object inside Player component
    var _this = this;
    // To Test if shoot is activated
    this.weaponShoot = false;
    // List of players displayed on screen
    this.ghostPlayers=[];
    // Game component imported in the Player component
    this.game = game;
    // Speed of the player
    this.speed = 1;
    // Mouse movement speed
    this.angularSensibility = 200;
    // Counter of killed in a row
    this.killStreak = 0;
    // Text boxes for announcements
    this.displayAnnouncement = document.getElementById('announcementKill');
    this.textDisplayAnnouncement = document.getElementById('textAnouncement');
    // Axis movement X et Z
    this.axisMovement = [false,false,false,false];//Movement axis X & Z

    // Connect life and armor to 2D
    this.textHealth = document.getElementById('textHealth');
    this.textArmor = document.getElementById('textArmor');
  
    //Event listener: keys released + send data to SocketIO
    window.addEventListener("keyup", function(evt) {
        if(evt.keyCode == 90 || evt.keyCode == 83 || evt.keyCode == 81 || evt.keyCode == 68 ){
            switch(evt.keyCode){
                case 90:
                _this.camera.axisMovement[0] = false;
                break;
                case 83:
                _this.camera.axisMovement[1] = false;
                break;
                case 81:
                _this.camera.axisMovement[2] = false;
                break;
                case 68:
                _this.camera.axisMovement[3] = false;
                break;
            }
            var data={
                axisMovement : _this.camera.axisMovement
            };
            _this.sendNewData(data)
            
        }
    }, false);
  
    //Event listener: keys pressed + send data to SocketIO
    window.addEventListener("keydown", function(evt) {
        if(evt.keyCode == 90 || evt.keyCode == 83 || evt.keyCode == 81 || evt.keyCode == 68 ){
            switch(evt.keyCode){
                case 90:
                _this.camera.axisMovement[0] = true;
                break;
                case 83:
                _this.camera.axisMovement[1] = true;
                break;
                case 81:
                _this.camera.axisMovement[2] = true;
                break;
                case 68:
                _this.camera.axisMovement[3] = true;
                break;
            }
            var data={
                axisMovement : _this.camera.axisMovement
            };
            _this.sendNewData(data)
        }
        
    }, false);
  
    //Event listener: mouse movements
    window.addEventListener("mousemove", function(evt) {
        //If user accepted the use of mouse
        if(_this.rotEngaged === true){
            _this.camera.playerBox.rotation.y+=evt.movementX * 0.001 * (_this.angularSensibility / 250);
            var nextRotationX = _this.camera.playerBox.rotation.x + (evt.movementY * 0.001 * (_this.angularSensibility / 250));
            //Conditional: detect if it's possible to move verticaly (to avoid '360° view')
            if( nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)){
                _this.camera.playerBox.rotation.x+=evt.movementY * 0.001 * (_this.angularSensibility / 250);
            }
            var data={
                rotation : _this.camera.playerBox.rotation
            };
            _this.sendNewData(data)
        }
    }, false);//\mousemove

    // We get scene canvas
    var canvas = this.game.scene.getEngine().getRenderingCanvas();
  
    // Check if we are on scene then affect the click press to shoot (_this.controlEnabled)
    canvas.addEventListener("pointerdown", function(evt) {
        if (_this.controlEnabled && !_this.weaponShoot) {
            _this.weaponShoot = true;
            _this.handleUserMouseDown();
            console.log('fire');
        }
    }, false);//\mousedown

    // Check if we are on scene then affect the click release
    canvas.addEventListener("pointerup", function(evt) {
        if (_this.controlEnabled && _this.weaponShoot) {
            _this.weaponShoot = false;
            _this.handleUserMouseUp();
            console.log('cease fire');
        }
    }, false);//\mouseup

    // Change of weapons
    this.previousWheeling = 0;
    canvas.addEventListener("wheel", function(evt) {        
        // If the difference between the two mouse turns is minimal
        if(Math.round(evt.timeStamp - _this.previousWheeling)>10){
            if(evt.deltaY<0){
                // If we scroll up, we will look for the next weapon
                _this.camera.weapons.nextWeapon(1);
                //console.log("next");
            }else{
                // If we scroll down, we will look for the previous weapon
                _this.camera.weapons.nextWeapon(-1);
                //console.log("previous");
            }
            // We assign to previousWheeling the current value
            _this.previousWheeling = evt.timeStamp;
        }
        
    }, false);//\mousewheel
  
    // Cam init
    this._initCamera(this.game.scene, canvas);
    // If user clics on the scene controlEnabled = true
    this.controlEnabled = false;
    // Event to check click on scene
    this._initPointerLock();
    // Life and armor display
    this.textHealth.innerText = this.camera.health;
    this.textArmor.innerText = this.camera.armor;     
    // Player can jump or not
    _this.camera.canJump = true;
    // Jump height
    _this.jumpHeight = 10;
    // Character height
    _this.originHeight = _this.camera.playerBox.position.clone();

    //Event listener: jump with spacebar
    window.addEventListener("keypress", function(evt) {
        // KeyCode 32 corresponds to bare space
        if(evt.keyCode === 32){
            console.log('Jumped!');
            if(_this.camera.canJump===true){
                // We define the jump height at the player's current position
                // plus the jumpHeight variable
                _this.camera.jumpNeed = _this.camera.playerBox.position.y + _this.jumpHeight;
                _this.camera.canJump=false;
                // To see jump of other players
                var data={
                    jumpNeed : _this.camera.jumpNeed
                };
                _this.sendNewData(data);
            }
        }
    }, false);//\keypress

};//\Player = function(game, canvas)

//Prototype
Player.prototype = {
    //Notes:
    //_ prefixed variable names are considered private by convention but are still public in JS
    //Javascript Vanilla uses Prototypes instead of Classes in POO
    //Init Player movement/Camera
    _initCamera : function(scene, canvas) {
        //Random spawn
        //Math.random gives us a number between 0 and 1
        let randomPoint = Math.random();
        //randomPoint rounds off this number and the number of spawnPoints
        randomPoint = Math.round(randomPoint * (this.game.allSpawnPoints.length - 1));
        //We say that the spawnPoint is the one chosen according to the random above
        this.spawnPoint = this.game.allSpawnPoints[randomPoint];
        //Player movement (followed by camera: same principle than FPS conroller in Unity)
        var playerBox = BABYLON.Mesh.CreateBox("headMainPlayer", 3, scene);
        //playerBox.position = new BABYLON.Vector3(-20, 5, 0);
        //playerBox.ellipsoid = new BABYLON.Vector3(2, 5, 2);//height of eyes
        playerBox.position = this.spawnPoint.clone();
        playerBox.ellipsoid = new BABYLON.Vector3(2, 10, 2);
        // Cam creation
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene);
        this.camera.playerBox = playerBox
        this.camera.parent = this.camera.playerBox;
        // Add collisions with playerBox
        this.camera.playerBox.checkCollisions = true;
        this.camera.playerBox.applyGravity = true;
        // If player is alive or not
        this.isAlive = true;
        // Player health
        this.camera.health = 100;
        // Main player?
        this.camera.isMain = true;
        // Armor health
        this.camera.armor = 0;
        // We create weapons
        this.camera.weapons = new Weapons(this);
        // Axis for movement X and Z (Up, Down, Left, Right)
        this.camera.axisMovement = [false,false,false,false];  
        // Cam reinit after respawn
        //this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.canJump = true;
        this.game.scene.activeCamera = this.camera;
        //Activate collision/hitbox on player
        var hitBoxPlayer = BABYLON.Mesh.CreateBox("hitBoxPlayer", 3, scene);
        hitBoxPlayer.parent = this.camera.playerBox;
        hitBoxPlayer.scaling.y = 2;
        hitBoxPlayer.isPickable = true;
        hitBoxPlayer.isMain = true;
    },//\_initCamera

    //Make the shoot available in Weapon component
    handleUserMouseDown : function() {
        if(this.isAlive === true){
            this.camera.weapons.fire();
        }
    },//\handleUserMouseDown

    //Make the stop shoot available in Weapon component
    handleUserMouseUp : function() {
        if(this.isAlive === true){
            this.camera.weapons.stopFire();
        }
    },//\handleUserMouseUp

    //Init Pointer lock in canvas
    _initPointerLock : function() {
        var _this = this;
        // Request for the pointer capture (to browser/user)
        var canvas = this.game.scene.getEngine().getRenderingCanvas();
        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);
        // Event to change rotation parameter
        var pointerlockchange = function (event) {
            _this.controlEnabled = (document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas || document.msPointerLockElement === canvas || document.pointerLockElement === canvas);
            if (!_this.controlEnabled) {
                _this.rotEngaged = false;// Mouse cannot move in scene
            } else {
                _this.rotEngaged = true;// Mouse can move in scene
            }
        };
        // Event to change the pointer state according to the browser
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    },//\_initPointerLock

    //Player movement: check where the player is looking then move it in that direction if the key 'forward' is pressed
    //The player's rotation axis is a value in radians expressed on the Y axis. The player rotates horizontally on this axis
    //the new position of the object is determined by its old position, to which the speed multiplied by the direction vector is added.
    _checkMove : function(ratioFps){
        // We move the player by assigning the camera to him
        this._checkUniqueMove(ratioFps,this.camera);
        for (var i = 0; i < this.ghostPlayers.length; i++) {
            // We move every ghost in ghostPlayers
            this._checkUniqueMove(ratioFps,this.ghostPlayers[i]);
        }
    },//\_checkMove

    _checkUniqueMove : function(ratioFps, player) {
        let relativeSpeed = this.speed / ratioFps;
        var playerSelected = player
        // We check if it's a ghost or not (only ghost has a head element)
        if(playerSelected.head){
            var rotationPoint = playerSelected.head.rotation;
        }else{
            var rotationPoint = playerSelected.playerBox.rotation;
        }
        if(playerSelected.axisMovement[0]){
            forward = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(rotationPoint.y))) * relativeSpeed, 
                0, 
                parseFloat(Math.cos(parseFloat(rotationPoint.y))) * relativeSpeed
            );
            playerSelected.playerBox.moveWithCollisions(forward);
        }
        if(playerSelected.axisMovement[1]){
            backward = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(rotationPoint.y))) * relativeSpeed, 
                0, 
                parseFloat(-Math.cos(parseFloat(rotationPoint.y))) * relativeSpeed
            );
            playerSelected.playerBox.moveWithCollisions(backward);
        }
        if(playerSelected.axisMovement[2]){
            left = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed, 
                0, 
                parseFloat(Math.cos(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed
            );
            playerSelected.playerBox.moveWithCollisions(left);
        }
        if(playerSelected.axisMovement[3]){
            right = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed, 
                0, 
                parseFloat(-Math.cos(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed
            );
            playerSelected.playerBox.moveWithCollisions(right);
        }
        if(playerSelected.jumpNeed){
            // Lerp (softened movement to a position)
            percentMove = playerSelected.jumpNeed - playerSelected.playerBox.position.y;
            // Axis of movement
            up = new BABYLON.Vector3(0,percentMove/4 *  relativeSpeed,0);
            playerSelected.playerBox.moveWithCollisions(up);
            // We check if the player has approximately reached the desired height
            if(playerSelected.playerBox.position.y + 1 > playerSelected.jumpNeed){
                // If this is the case, we prepare airTime
                playerSelected.airTime = 0;
                playerSelected.jumpNeed = false;
            }
        }else{
            // If the ascent is complete, we descend
            // We draw a radius from the player
            var rayPlayer = new BABYLON.Ray(playerSelected.playerBox.position,new BABYLON.Vector3(0,-1,0));
            // We look at the first object we touch
            // We exclude all meshes that belong to the player
            var distPlayer = this.game.scene.pickWithRay(rayPlayer, function (item) {
                if (item.name == "hitBoxPlayer" || item.id == "headMainPlayer" || item.id == "bodyGhost"  || item.isPlayer)
                    return false;
                else
                    return true;
            });
            // isMain permet de vérifier si c'est le joueur
            if(playerSelected.isMain){
                // targetHeight is equal to the height of the character
                var targetHeight = this.originHeight.y;
            }else{
                // if it's a ghost, we set the height at 3
                var targetHeight = 3;
            }
            // If the distance from the ground is less than or equal to the height of the player 
            //-> We have touched the ground
            if(distPlayer.distance <= targetHeight){
                // If he's the main player and he can't jump anymore
                if(playerSelected.isMain && !playerSelected.canJump){
                    playerSelected.canJump = true;
                }
                // We reset airTime to 0
                playerSelected.airTime = 0;
            }else{
                // Otherwise, we increase airTime
                playerSelected.airTime++;
                // And we move the player down, with a value multiplied by airTime
                playerSelected.playerBox.moveWithCollisions(new BABYLON.Vector3(0,(-playerSelected.airTime/30) * relativeSpeed ,0));
            }
        }
    },//\_checkUniqueMove

    getDamage : function(damage){
        var damageTaken = damage;
        //Armor damage buffer
        if(this.camera.armor > Math.round(damageTaken/2)){
            this.camera.armor -= Math.round(damageTaken/2);
            damageTaken = Math.round(damageTaken/2);
        }else{
            damageTaken = damageTaken - this.camera.armor;
            this.camera.armor = 0;
        }
        // If player i still have life
        if(this.camera.health>damageTaken){
            this.camera.health-=damageTaken;
            if(this.camera.isMain){
                this.textHealth.innerText = this.camera.health;
                this.textArmor.innerText = this.camera.armor;
            }
        }else{
            //Otherwise he's dead
            console.log('You\'re dead...');
            if(this.camera.isMain){
                this.textHealth.innerText = 0;
                this.textArmor.innerText = 0;
            }
            this.playerDead(whoDamage)
        }       
    },//\_getDamage

    playerDead : function(whoKilled) {
        // Dead announcement
        if(this.displayAnnouncement.classList.contains("annoucementClose")){
            this.displayAnnouncement.classList.remove("annoucementClose");
        }
        this.textDisplayAnnouncement.style.fontSize = '1rem';
        this.textDisplayAnnouncement.innerText = 'Your\'re dead!';
        // Function called to announce the destruction of the player
        sendPostMortem(whoKilled);
        this.deadCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 
        1, 0.8, 10, new BABYLON.Vector3(
            this.camera.playerBox.position.x, 
            this.camera.playerBox.position.y, 
            this.camera.playerBox.position.z), 
        this.game.scene);
        
        this.game.scene.activeCamera = this.deadCamera;
        this.deadCamera.attachControl(this.game.scene.getEngine().getRenderingCanvas());
        //Deleting playerBox
        this.camera.playerBox.dispose();
        //Deleting camera
        this.camera.dispose(); 
        //Deleting weapon
        var inventoryWeapons = this.camera.weapons.inventory;
        for (var i = 0; i < inventoryWeapons.length; i++) {
            inventoryWeapons[i].dispose();
        }
        inventoryWeapons = [];
        //We report Weapons thet player is dead
        this.isAlive=false;
        //Respwan
        var newPlayer = this;
        var canvas = this.game.scene.getEngine().getRenderingCanvas();
        setTimeout(function(){ 
            newPlayer._initCamera(newPlayer.game.scene, canvas, newPlayer.spawnPoint);
            // resuscitate the player among other participants
            newPlayer.displayAnnouncement.classList.add("annoucementClose");
            newPlayer.launchRessurection();
        }, 4000);
    },//\playerDead

    //Kill msg management
    newDeadEnnemy : function(nameKilled){
        var _this = this;
        // Si le nombre de kill d'affilé est à 0
        if(this.killStreak === 0){
            // If the number of kill in a row is 0
            this.textDisplayAnnouncement.style.fontSize = '1rem';
            // If no name is given, we say that Bob was killed
            var messageDisplay = "You killed Bob"
            if(nameKilled){
                // If there is a given name, the name is displayed
                var messageDisplay = "You killed " + nameKilled;
            }
        }else{
            // We will look for the kill messages in Armory
            var multiKillAnouncement = this.camera.weapons.Armory.multiKillAnnoucement;
            // If we have already killed more than one person
            // And if we have not reached the limit of 15 messages
            if(this.killStreak<=multiKillAnouncement.length){
                // We display the message associated with the number of kills
                var messageDisplay = multiKillAnouncement[this.killStreak-1];
                // We increase the size of the text in proportion to the rarity of the message
                this.textDisplayAnnouncement.style.fontSize = (1+(this.killStreak/1.2))+'rem';
            }else{
                // If we have reached the limit of available messages
                // We display the last of the list
                var messageDisplay = multiKillAnouncement[multiKillAnouncement.length-1]
            }
            
        }
        // We increase the number of people killed as a result
        this.killStreak++;
        // If the advertiser is closed
        if(this.displayAnnouncement.classList.contains("annoucementClose")){
            // We open it
            this.displayAnnouncement.classList.remove("annoucementClose");
        }
        // We display what is contained in messageDisplay
        this.textDisplayAnnouncement.innerText = messageDisplay;

        // If the counter has been created, it is reset
        if(this.timerKillStreak){
            clearTimeout(this.timerKillStreak);
        }
        // We set the counter at 3 seconds.
        // After this time, the game will reset the kill counter to 0
        // And close the message window
        this.timerKillStreak = setTimeout(function(){ 
            _this.killStreak = 0;
            
            if(!_this.displayAnnouncement.classList.contains("annoucementClose")){
                _this.displayAnnouncement.classList.add("annoucementClose");

            }
        }, 3000);
    },//\newDeadEnnemy

    // Give a bonus to the player
    givePlayerBonus : function(what,howMany) {
        
        var typeBonus = what;
        var amountBonus = howMany;
        if(typeBonus === 'health'){
            if(this.camera.health + amountBonus>100){
                this.camera.health = 100;
            }else{
                this.camera.health += amountBonus;
            }
        }else if (typeBonus === 'armor'){
            if(this.camera.armor + amountBonus>100){
                this.camera.armor = 100;
            }else{
                this.camera.armor += amountBonus;
            }
        } 
        this.textHealth.innerText = this.camera.health;
        this.textArmor.innerText = this.camera.armor;
    },//\givePlayerBonus

    // Multiplayers functions

    sendNewData : function(data){
        updateGhost(data);
    },//\sendNewData

    launchRessurection : function(){
        ressurectMe();
    },//\launchRessurection

    // Send current player data
    sendActualData : function(){
        return {
            actualTypeWeapon : this.camera.weapons.actualWeapon,
            armor : this.camera.armor,
            life : this.camera.health,
            position  : this.camera.playerBox.position,
            rotation : this.camera.playerBox.rotation,
            axisMovement : this.camera.axisMovement
        }
    },//\ sendActualData

    //Process the data received to assign them to the ghosts present on the scene
    updateLocalGhost : function(data){
        ghostPlayers = this.ghostPlayers;
        
        for (var i = 0; i < ghostPlayers.length; i++) {
            if(ghostPlayers[i].idRoom === data.id){
                var boxModified = ghostPlayers[i].playerBox;
                
                if(data.position){
                    boxModified.position = new BABYLON.Vector3(data.position.x,data.position.y,data.position.z);
                    // We apply a fix on Y, which seems to be in the wrong place
                    //boxModified.position = new BABYLON.Vector3(data.position.x,data.position.y-2.76,data.position.z);                    
                }
                if(data.axisMovement){
                    ghostPlayers[i].axisMovement = data.axisMovement;
                }
                if(data.rotation){
                    ghostPlayers[i].head.rotation.y = data.rotation.y;
                }
                if(data.jumpNeed){
                    ghostPlayers[i].jumpNeed = data.jumpNeed;
                }
                if(data.axisMovement){
                    ghostPlayers[i].axisMovement = data.axisMovement;
                }
            }
            
        }
    }//\updateLocalGhost

}//\Player.prototype
