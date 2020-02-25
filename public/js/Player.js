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
      _this.camera.rotation.y+=evt.movementX * 0.001 * (_this.angularSensibility / 250);//change camera horizontal position
      var nextRotationX = _this.camera.rotation.x + (evt.movementY * 0.001 * (_this.angularSensibility / 250));//change camera vertical position
      //Conditional: detect if it's possible to move verticaly (to avoid '360° view')
      if( nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)){
          _this.camera.rotation.x+=evt.movementY * 0.001 * (_this.angularSensibility / 250);
      }
    }
  }, false);//\mousemove

  // We get scene canvas
  var canvas = this.game.scene.getEngine().getRenderingCanvas();

  // Check if we are on scene then affect the click press to shoot (_this.controlEnabled)
  canvas.addEventListener("mousedown", function(evt) {
      if (_this.controlEnabled && !_this.weaponShoot) {
          _this.weaponShoot = true;
          _this.handleUserMouseDown();
          console.log('fire');
      }
  }, false);//\mousedown

  // Check if we are on scene then affect the click release
  canvas.addEventListener("mouseup", function(evt) {
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
  //Init Camera
  _initCamera : function(scene, canvas) {
      // Cam creation
      this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-20, 5, 0), scene);
      // Axis for movement X and Z (Up, Down, Left, Right)
      this.camera.axisMovement = [false,false,false,false];//False: keys are assigned in Player class
      // To check if the player is alive
      this.isAlive = true;
      // Cam 'raycast' to point zero
      this.camera.setTarget(BABYLON.Vector3.Zero());
      // Instanciate weapon (in _initCamera because the weapon has to follow camera)
      this.camera.weapons = new Weapons(this);
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
      //Forward
      if(this.camera.axisMovement[0]){
          this.camera.position = new BABYLON.Vector3(this.camera.position.x + (Math.sin(this.camera.rotation.y) * relativeSpeed),
              this.camera.position.y,
              this.camera.position.z + (Math.cos(this.camera.rotation.y) * relativeSpeed));
      }
      //Backward
      if(this.camera.axisMovement[1]){
          this.camera.position = new BABYLON.Vector3(this.camera.position.x + (Math.sin(this.camera.rotation.y) * -relativeSpeed),
              this.camera.position.y,
              this.camera.position.z + (Math.cos(this.camera.rotation.y) * -relativeSpeed));
      }
      //Left
      if(this.camera.axisMovement[2]){
          this.camera.position = new BABYLON.Vector3(this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * relativeSpeed,
              this.camera.position.y,
              this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * relativeSpeed);
      }
      //Right
      if(this.camera.axisMovement[3]){
          this.camera.position = new BABYLON.Vector3(this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * - relativeSpeed,
              this.camera.position.y,
              this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * - relativeSpeed);
      }
  },//\_checkMove
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
