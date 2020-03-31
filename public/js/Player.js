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
    // Axis movement X et Z
    this.axisMovement = [false,false,false,false];//Movement axis X & Z
  
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
        // Main player?
        this.camera.isMain = true;
        // Player health
        this.camera.health = 100;
        // Armor health
        this.camera.armor = 0;
        // We create weapons
        this.camera.weapons = new Weapons(this);
        // Axis for movement X and Z (Up, Down, Left, Right)
        this.camera.axisMovement = [false,false,false,false];   
        // Cam reinit after respawn
        //this.camera.setTarget(BABYLON.Vector3.Zero());
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
        playerSelected.playerBox.moveWithCollisions(new BABYLON.Vector3(0,(-1.5) * relativeSpeed ,0));
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
        }else{
            //Otherwise he's dead
            console.log('You\'re dead...');
            this.playerDead(whoDamage)
        }       
    },//\_getDamage

    playerDead : function(whoKilled) {
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
            newPlayer.launchRessurection();
        }, 4000);
    },//\playerDead

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
                // On applique un correctif sur Y, qui semble être au mauvais endroit
                if(data.position){
                    boxModified.position = new BABYLON.Vector3(data.position.x,data.position.y-2.76,data.position.z);
                }
                if(data.axisMovement){
                    ghostPlayers[i].axisMovement = data.axisMovement;
                }
                if(data.rotation){
                    ghostPlayers[i].head.rotation.y = data.rotation.y;
                }
                if(data.axisMovement){
                    ghostPlayers[i].axisMovement = data.axisMovement;
                }
            }
            
        }
    }//\updateLocalGhost

}//\Player.prototype
