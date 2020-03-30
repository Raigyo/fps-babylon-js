//Weapons component

Weapons = function(Player) {
  //Instanciation:
  // _this is access to the object inside Weapon component
  var _this = this;
  // To access Player component
  this.Player = Player;
  // To access Armory component from game
  this.Armory = Player.game.armory;
  // Positions for not used weapon
  this.bottomPosition = new BABYLON.Vector3(0.5,-2.5,1);
  // Positions for used weapon
  this.topPositionY = -0.5;
  // We add the inventory
  this.inventory = [];
  // Créons notre lance roquette
	var crook = this.newWeapon('Crook')
	this.inventory[0] = crook;
  // NewWeapon called to create the weapon called Ezekiel
  var ezekiel = this.newWeapon('Ezekiel')
  this.inventory[0] = ezekiel;
  // Our current weapon is Ezekiel, which is in second position
  // in the weapons table in Armory
  this.actualWeapon = this.inventory.length -1;
  // Weapon in hand is the active weapon
  this.inventory[this.actualWeapon].isActive = true;
  // Create weapon
  //this.rocketLauncher = this.newWeapon(Player);
  // Cadence is the one of the current weapon (thanks to typeWeapon)
  this.fireRate = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon].setup.cadency;
  // Fire rate
  //this.fireRate = 1000;
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
  newWeapon : function(typeWeapon) {
    var newWeapon;
    //Loop: search through all of the weapons in Armory for the weapon that has the same id 
    //as the weapon currently in hand.
    for (var i = 0; i < this.Armory.weapons.length; i++) {
      console.log("i:", i);
        //typeWeapon = weapon parameter from Armory
        if(this.Armory.weapons[i].name === typeWeapon){
            newWeapon = BABYLON.Mesh.CreateBox('rocketLauncher', 0.5, this.Player.game.scene);
            // Weapon dimension
            newWeapon.scaling = new BABYLON.Vector3(1,0.7,2);
             // Associated to the camera (so weapon moves following the camera)
            newWeapon.parent = this.Player.camera;
            // Then set the weapon position (after attaching it to the camera)
            newWeapon.position = this.bottomPosition.clone();
            newWeapon.isPickable = false;
            // Add material to weapon
            var materialWeapon = new BABYLON.StandardMaterial('rocketLauncherMat', this.Player.game.scene);
            materialWeapon.diffuseColor=this.Armory.weapons[i].setup.colorMesh;
            newWeapon.material = materialWeapon;            
            newWeapon.typeWeapon = i;
            newWeapon.isActive = false;
            break;
        }else if(i === this.Armory.weapons.length -1){
            console.log('UNKNOWN WEAPON');
        }
    };
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
      // Id of weapon in hand
      var idWeapon = this.inventory[this.actualWeapon].typeWeapon;
      // Determines the screen size
      var renderWidth = this.Player.game.engine.getRenderWidth(true);
      var renderHeight = this.Player.game.engine.getRenderHeight(true);
      // Raycast (center of the screen)
      var direction = this.Player.game.scene.pick(renderWidth/2,renderHeight/2,function (item) {
          if (item.name == "playerBox" || item.name == "weapon" || item.id == "headMainPlayer")
              return false;
          else
              return true;
      });
      // If the weapon is a ranged weapon
      if(this.Armory.weapons[idWeapon].type === 'ranged'){
        if(this.Armory.weapons[idWeapon].setup.ammos.type === 'rocket'){
            // We have to fire a rocket
            direction = direction.pickedPoint.subtractInPlace(this.Player.camera.playerBox.position);
            direction = direction.normalize();
            this.createRocket(this.Player.camera.playerBox,direction);
        }else if(this.Armory.weapons[idWeapon].setup.ammos.type === 'bullet'){
            // We have to shoot single bullets
            this.shootBullet(direction);
        }else{
          // We have to shoot laser
          this.createLaser(direction);
        }
      }else{
        // If it is not a ranged weapon, you must attack in close combat
        this.hitHand(direction);
      }
      this.canFire = false; 
    } else {
        // Nothing to do : cannot fire
    }
  },//\launchFire

  createRocket : function(playerPosition, direction) {
    var positionValue = this.inventory[this.actualWeapon].absolutePosition.clone();
    var rotationValue = playerPosition.rotation;
    var Player = this.Player;
    var newRocket = BABYLON.Mesh.CreateBox("rocket", 1, this.Player.game.scene);
    // Id of weapon
    var idWeapon = this.inventory[this.actualWeapon].typeWeapon;
    // Weapon parameters
    var setupRocket = this.Armory.weapons[idWeapon].setup.ammos;
    newRocket.direction = direction;
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
    //newRocket.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    newRocket.material.diffuseColor = this.Armory.weapons[idWeapon].setup.colorMesh;
    newRocket.paramsRocket = this.Armory.weapons[idWeapon].setup;
    // Access to player in registerBeforeRender
    var Player = this.Player;
    this.Player.game._rockets.push(newRocket);//Create rocket and send it to Game.js
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
    })//\newRocket
  },//\createRocket

  shootBullet : function(meshFound) {
    // Id of weapon
    var idWeapon = this.inventory[this.actualWeapon].typeWeapon;    
    var setupWeapon = this.Armory.weapons[idWeapon].setup;    
    if(meshFound.hit && meshFound.pickedMesh.isPlayer){
      // We hit a player
    }else{
      //  The weapon does not hit a player
    console.log('Not Hit Bullet')
    }
  },//\shootBullet

  createLaser : function(meshFound) {
   // Id of weapon
    var idWeapon = this.inventory[this.actualWeapon].typeWeapon;
    var setupLaser = this.Armory.weapons[idWeapon].setup.ammos;
    var positionValue = this.inventory[this.actualWeapon].absolutePosition.clone();
    if(meshFound.hit){
      var laserPosition = positionValue;
      // We create a line drawn between the pickedPoint and the barrel of the weapon
      let line = BABYLON.Mesh.CreateLines("lines", [
        laserPosition,
        meshFound.pickedPoint
      ], this.Player.game.scene);
      // We give a random color
      var colorLine = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
      line.color = colorLine;      
      // We widen the line to make it visible
      line.enableEdgesRendering();
      line.isPickable = false;
      line.edgesWidth = 40.0;
      line.edgesColor = new BABYLON.Color4(colorLine.r, colorLine.g, colorLine.b, 1);
      if(meshFound.pickedMesh.isPlayer){
          // We inflict damage on the player
      }
      //We push laser in array so the drawing disappear after some time
      this.Player.game._lasers.push(line);
    }
  },//\createLaser

  hitHand : function(meshFound) {
    // Id of weapon
	  var idWeapon = this.inventory[this.actualWeapon].typeWeapon;	
    var setupWeapon = this.Armory.weapons[idWeapon].setup;
    //Check the distance between players
    if(meshFound.hit 
    && meshFound.distance < setupWeapon.range*5 
    && meshFound.pickedMesh.isPlayer){
      // We hit a player
    }else{
      // The weapon does not hit a player
      console.log('Not Hit CaC')
    }
  },//\hitHand

  nextWeapon : function(way) {
    // We define armoryWeapons for easier access to Armory
    var armoryWeapons = this.Armory.weapons;    
    // We say that the next weapon is logically the weapon plus the way given
    var nextWeapon = this.inventory[this.actualWeapon].typeWeapon + way;    
    // we currently define the possible weapon usable at null for the moment
    var nextPossibleWeapon = null;
    // If the way is positive
    if(way>0){
      // The loop starts from nextWeapon
      for (var i = nextWeapon; i < nextWeapon + this.Armory.weapons.length; i++) {
          // The weapon we will test will be a modulo of i and the length of Weapon
          var numberWeapon = i % this.Armory.weapons.length;
          // We compare this number to the weapons we have in the inventory
          //Ex: 4 modulo 4 gives us 0, 5 modulo 4 gives us 1
          for (var y = 0; y < this.inventory.length; y++) {
              if(this.inventory[y].typeWeapon === numberWeapon){
                  // If we find something, it's a weapon that comes after ours
                  nextPossibleWeapon = y;
                  break;
              }
          }
          // If we found a matching weapon, we no longer need the loop
          if(nextPossibleWeapon != null){
              break;
          }   
      }
    }else{// If the way is negative
      for (var i = nextWeapon; ; i--) {
        if(i<0){
            i = this.Armory.weapons.length;
        }
        var numberWeapon = i;
        for (var y = 0; y < this.inventory.length; y++) {
            if(this.inventory[y].typeWeapon === numberWeapon){
                nextPossibleWeapon = y;
                break;
            }
        }
        if(nextPossibleWeapon != null){
            break;
        }   
      }
    }

    //Change weapons
    if(this.actualWeapon != nextPossibleWeapon){
      // We say to our current weapon that it is no longer active
      this.inventory[this.actualWeapon].isActive = false;
      // We change the current weapon with the one we found
      this.actualWeapon = nextPossibleWeapon;
      // We tell our chosen weapon that it is the active weapon
      this.inventory[this.actualWeapon].isActive = true;  
      // We update the cadence of the weapon
      this.fireRate = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon].setup.cadency;
      this._deltaFireRate = this.fireRate;
    }
  }//\nextWeapon

};//\Weapons.prototype