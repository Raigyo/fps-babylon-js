//Movements + Camera component

Player = function(game, canvas) {
    //Instanciation:
    // _this is access to the object inside Player component
    var _this = this;
    //To Test if shoot is activated
    this.weaponShoot = false;
    // Game component imported in the Player component
    this.game = game;
    //Speed of the player
    this.speed = 1;
    // Mouse movement speed
    this.angularSensibility = 200;
    // Axis movement X et Z
    this.axisMovement = [false,false,false,false];//Movement axis X & Z
  
    //Event listener: keys released
    window.addEventListener("keyup", function(evt) {
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
    }, false);
  
    //Event listener: keys pressed
    window.addEventListener("keydown", function(evt) {
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
  
    // Cam init
    this._initCamera(this.game.scene, canvas);
    // If user clics on the scene controlEnabled = true
    this.controlEnabled = false;
    // Event to check click on scene
    this._initPointerLock();
  };//\Player = function(game, canvas)
  
  Player.prototype = {
    //Notes:
    //_ prefixed variable names are considered private by convention but are still public in JS
    //Javascript Vanilla uses Prototypes instead of Classes in POO
    //Init Player movement/Camera
    _initCamera : function(scene, canvas) {
      // Player movement (followed by camera: same principle than FPS conroller in Unity)
      var playerBox = BABYLON.Mesh.CreateBox("headMainPlayer", 3, scene);
      playerBox.position = new BABYLON.Vector3(-20, 5, 0);
      playerBox.ellipsoid = new BABYLON.Vector3(2, 5, 2);//height of eyes
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
      //this.game.scene.activeCamera = this.camera;
      //Activate collision/hitbox on player
      var hitBoxPlayer = BABYLON.Mesh.CreateBox("hitBoxPlayer", 3, scene);
      hitBoxPlayer.parent = this.camera.playerBox;
      hitBoxPlayer.scaling.y = 2;
      hitBoxPlayer.isPickable = true;
      hitBoxPlayer.isMain = true;
    },//\_initCamera
  
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
    _checkMove : function(ratioFps) {
        let relativeSpeed = this.speed / ratioFps;
        if(this.camera.axisMovement[0]){
            forward = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
                0,
                parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(forward);
        }
        if(this.camera.axisMovement[1]){
            backward = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
                0,
                parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(backward);
        }
        if(this.camera.axisMovement[2]){
            left = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
                0,
                parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(left);
        }
        if(this.camera.axisMovement[3]){
            right = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
                0,
                parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(right);
        }
        this.camera.playerBox.moveWithCollisions(new BABYLON.Vector3(0,(-1.5) * relativeSpeed ,0));
    },//\_checkMove
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
          console.log('Vous êtes mort...');
          this.playerDead();
      }       
    },//\_getDamage
    playerDead : function(i) {
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
        this.camera.weapons.rocketLauncher.dispose();
        //We report Weapons thet player is dead
        this.isAlive=false;
            //Respwan
        var newPlayer = this;
        var canvas = this.game.scene.getEngine().getRenderingCanvas();
        setTimeout(function(){ 
            newPlayer._initCamera(newPlayer.game.scene, canvas);
        }, 4000);
    },//\playerDead
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
  }//\Player.prototype