//Weapons component

Weapons = function(Player) {
  //Instanciation:
  // _this is access to the object inside Weapon component
  var _this = this;
  // To access Player component
  this.Player = Player;
  // Positions for not used weapon
  this.bottomPosition = new BABYLON.Vector3(0.5,-2.5,1);
  // Positions for used weapon
  this.topPositionY = -0.5;
  // Create weapon
  this.rocketLauncher = this.newWeapon(Player);
  // Fire rate
  this.fireRate = 800;
  // Delta used to calculate after which time the shoot will be available again
  this._deltaFireRate = this.fireRate;
  // Variable used to make the shooting available or not (it will depend on weapon used)
  this.canFire = true;
  // Variable used in Player
  this.launchBullets = false;
  // Used for shooting cadency
  var engine = Player.game.scene.getEngine();
  //Detect if player can shoot or not
  Player.game.scene.registerBeforeRender(function() {
      if (!_this.canFire) {
          _this._deltaFireRate -= engine.getDeltaTime();//DeltaTime = real elapsed time period
          if (_this._deltaFireRate <= 0  && _this.Player.isAlive) {
              _this.canFire = true;//when 0 => we can shoot again
              _this._deltaFireRate = _this.fireRate;//reinit _deltaFireRate
          }
      }
  });
};

Weapons.prototype = {
  newWeapon : function(Player) {
    var newWeapon;
    newWeapon = BABYLON.Mesh.CreateBox('rocketLauncher', 0.5, Player.game.scene);
    // Weapon dimension
    newWeapon.scaling = new BABYLON.Vector3(1,0.7,2);
    // Associated to the camera (so weapon moves following the camera)
    newWeapon.parent = Player.camera;
    // Then set the weapon position
    newWeapon.position = this.bottomPosition.clone();
    newWeapon.position.y = this.topPositionY;
    // Add red color
    var materialWeapon = new BABYLON.StandardMaterial('rocketLauncherMat', Player.game.scene);
    materialWeapon.diffuseColor=new BABYLON.Color3(1,0,0);
    newWeapon.material = materialWeapon;
    return newWeapon
  },//\newWeapon
  //Shoot available
  fire : function(pickInfo) {
    this.launchBullets = true;
  },//\fire
  //Shoot not available
  stopFire : function(pickInfo) {
    this.launchBullets = false;
  },//\stopFire
  //Let's shoot
  launchFire : function() {
    if (this.canFire) {
        var renderWidth = this.Player.game.engine.getRenderWidth(true);//center of screen
        var renderHeight = this.Player.game.engine.getRenderHeight(true);//center of screen

        var direction = this.Player.game.scene.pick(renderWidth/2,renderHeight/2);//target
        direction = direction.pickedPoint.subtractInPlace(this.Player.camera.position);//target-actual position
        direction = direction.normalize();//direction

        this.createRocket(this.Player.camera,direction)
        this.canFire = false;
    } else {
        // Nothing to do : cannot fire
    }
  },//\launchFire
  createRocket : function(playerPosition, direction) {
    var positionValue = this.rocketLauncher.absolutePosition.clone();
    var rotationValue = playerPosition.rotation;
    var newRocket = BABYLON.Mesh.CreateBox("rocket", 1, this.Player.game.scene);
    newRocket.direction = new BABYLON.Vector3(
        Math.sin(rotationValue.y) * Math.cos(rotationValue.x),
        Math.sin(-rotationValue.x),
        Math.cos(rotationValue.y) * Math.cos(rotationValue.x)
    )
    newRocket.position = new BABYLON.Vector3(
        positionValue.x + (newRocket.direction.x * 1) ,
        positionValue.y + (newRocket.direction.y * 1) ,
        positionValue.z + (newRocket.direction.z * 1));
    newRocket.rotation = new BABYLON.Vector3(rotationValue.x,rotationValue.y,rotationValue.z);
    newRocket.scaling = new BABYLON.Vector3(0.5,0.5,1);
    newRocket.isPickable = false;

    newRocket.material = new BABYLON.StandardMaterial("textureWeapon", this.Player.game.scene);
    newRocket.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

    // Access to player in registerBeforeRender
    var Player = this.Player;

    newRocket.registerAfterRender(function(){
        // We move roquet forward
        newRocket.translate(new BABYLON.Vector3(0,0,1),1,0);

        // Ray to forward
        var rayRocket = new BABYLON.Ray(newRocket.position,newRocket.direction);

        // Check first object hit
        var meshFound = newRocket.getScene().pickWithRay(rayRocket);

        // If the distance to the first object hit is less than 10, we destroy the rocket
        if(!meshFound || meshFound.distance < 10){
          // We check that we have touched something
          if(meshFound.pickedMesh){
              // We create a sphere that will represent the impact area
              var explosionRadius = BABYLON.Mesh.CreateSphere("sphere", 5.0, 20, Player.game.scene);
              // We position the sphere where there was an impact
              explosionRadius.position = meshFound.pickedPoint;
              // We make sure that the explosions are not considered for the Ray of the rocket
              explosionRadius.isPickable = false;
              // We create an orange material
              explosionRadius.material = new BABYLON.StandardMaterial("textureExplosion", Player.game.scene);
              explosionRadius.material.diffuseColor = new BABYLON.Color3(1,0.6,0);
              explosionRadius.material.specularColor = new BABYLON.Color3(0,0,0);
              explosionRadius.material.alpha = 0.8;
              // Each frame, we lower the opacity and we delete the object when the alpha has reached 0
              explosionRadius.registerAfterRender(function(){
                  explosionRadius.material.alpha -= 0.02;
                  if(explosionRadius.material.alpha<=0){
                      explosionRadius.dispose();
                  }
              });
          }
          newRocket.dispose();
        }
    })
  },//\createRocket
};//\Weapons.prototype
