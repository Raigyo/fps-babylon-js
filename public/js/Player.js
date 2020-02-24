//Camera component

Player = function(game, canvas) {
  //Instanciation:
  // Game loaded in the Player object
  this.game = game;
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

  //Event listener: mouse
  window.addEventListener("mousemove", function(evt) {
    // if(_this.rotEngaged === true){
      _this.camera.rotation.y+=evt.movementX * 0.001 * (_this.angularSensibility / 250);//change camera horizontal position
      var nextRotationX = _this.camera.rotation.x + (evt.movementY * 0.001 * (_this.angularSensibility / 250));//change camera vertical position
      //Conditional: detect if it's possible to move verticaly (to avoid '360° view')
      if( nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)){
          _this.camera.rotation.x+=evt.movementY * 0.001 * (_this.angularSensibility / 250);
      }
    // }
  }, false);

  // Cam init
  this._initCamera(this.scene, canvas);
};

Player.prototype = {
  _initCamera : function(scene, canvas) {
      // Cam creation
      this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-20, 5, 0), scene);
      // Axis for movement X and Z (Up, Down, Left, Right)
      this.camera.axisMovement = [false,false,false,false];//False: keys are assigned in Player class
      // To check if the player is alive
      this.isAlive = true;
      // Cam 'raycast' to point zero
      this.camera.setTarget(BABYLON.Vector3.Zero());
  }
};
