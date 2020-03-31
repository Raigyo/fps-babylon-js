//Weapons component

Weapons = function(Player) {

  //Instanciation:
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
  // Create close combat weapon
	var crook = this.newWeapon('Crook')
	this.inventory[0] = crook;
  // // Create rocket weapon
	var ezekiel = this.newWeapon('Ezekiel')
  this.inventory[1] = ezekiel;
  // Create bullet weapon
  var timmy = this.newWeapon('Timmy')
  this.inventory[2] = timmy;
  // Create laser weapon
  var armageddon = this.newWeapon('Armageddon')
	this.inventory[3] = armageddon;
  // Our current weapon is Ezekiel, which is in second position
  // in the weapons table in Armory
  this.actualWeapon = this.inventory.length -1;
  // Weapon in hand is the active weapon
  this.inventory[this.actualWeapon].isActive = true;
  // Create weapon
  //this.rocketLauncher = this.newWeapon(Player);
  // Cadence is the one of the current weapon (thanks to typeWeapon)
  this.fireRate = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon].setup.cadency;
  // Delta used to calculate after which time the shoot will be available again
  this._deltaFireRate = this.fireRate;
  // Variable used to make the shooting available or not (it will depend on weapon used)
  this.canFire = true;
  // Variable used in Player
  this.launchBullets = false;
  // _this is access to the object inside Weapon component
  var _this = this;
  // Used for shooting cadency
  var engine = Player.game.scene.getEngine();

  //Detect if player can shoot or not + define time elapsed between each reload
	this._animationDelta = 0; 
	Player.game.scene.registerBeforeRender(function() {
	    if (!_this.canFire) {
        // We animate the current weapon
        _this.animateMovementWeapon(_this._animationDelta); 
        // We increase animationDelta
        _this._animationDelta += engine.getDeltaTime();
        _this._deltaFireRate -= engine.getDeltaTime();
        if (_this._deltaFireRate <= 0 && _this.Player.isAlive) {
          // When we have finished the animation, we return the weapon to its initial position
          _this.inventory[_this.actualWeapon].position = 
          _this.inventory[_this.actualWeapon].basePosition.clone();
          _this.inventory[_this.actualWeapon].rotation = 
          _this.inventory[_this.actualWeapon].baseRotation.clone();	            
          _this.canFire = true;
          _this._deltaFireRate = _this.fireRate;	            
          // When we can shoot, we return animationDelta to 0
          _this._animationDelta = 0;
        }
	    }
  });//\registerBeforeRender
  
};//\Weapons

Weapons.prototype = {
  newWeapon : function(typeWeapon) {
    var newWeapon;
    //Loop: search through all of the weapons in Armory for the weapon that has the same id 
    //as the weapon currently in hand.
    for (var i = 0; i < this.Armory.weapons.length; i++) {
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
            // Basic positions
            newWeapon.basePosition = newWeapon.position;
            newWeapon.baseRotation = newWeapon.rotation;
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
    console.log('Rocket');
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
    newRocket.isPickable = false;
    // We need position, rotation and direction
		sendGhostRocket(newRocket.position,newRocket.rotation,newRocket.direction);
    // Access to player in registerBeforeRender
    this.Player.game._rockets.push(newRocket);//Create rocket and send it to Game.js

  },//\createRocket

  shootBullet : function(meshFound) {
    console.log('Bullet');
    // Id of weapon
    var idWeapon = this.inventory[this.actualWeapon].typeWeapon;    
    var setupWeapon = this.Armory.weapons[idWeapon].setup;    
    if(meshFound.hit && meshFound.pickedMesh.isPlayer){
      // We hit a player
      var damages = this.Armory.weapons[idWeapon].setup.damage;
      // We send the damage as well as the enemy found thanks to its name
      sendDamages(damages,meshFound.pickedMesh.name)
    }else{
      //  The weapon does not hit a player
    console.log('Not Hit Bullet');
    }
  },//\shootBullet

  createLaser : function(meshFound) {
    console.log('Laser');
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
          var damages = this.Armory.weapons[idWeapon].setup.damage;
          sendDamages(damages,meshFound.pickedMesh.name)
      }
      // We send the starting point and the ending point
			sendGhostLaser(laserPosition,meshFound.pickedPoint);
      // We push laser in array so the drawing disappear after some time
      this.Player.game._lasers.push(line);
    }
  },//\createLaser

  hitHand : function(meshFound) {
    console.log('Close combat');
    // Id of weapon
	  var idWeapon = this.inventory[this.actualWeapon].typeWeapon;	
    var setupWeapon = this.Armory.weapons[idWeapon].setup;
    //Check the distance between players
    if(meshFound.hit && meshFound.distance < setupWeapon.range*5 && meshFound.pickedMesh.isPlayer){
      // We hit a player
      var damages = this.Armory.weapons[idWeapon].setup.damage;
      sendDamages(damages,meshFound.pickedMesh.name)
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
          console.log('numberWeapon: ', numberWeapon);
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

    //Change weapons + animation
    if(this.actualWeapon != nextPossibleWeapon){
      // The weapon is told to reposition itself to its original location
      this.inventory[this.actualWeapon].position = 
      this.inventory[this.actualWeapon].basePosition.clone();      
      this.inventory[this.actualWeapon].rotation = 
      this.inventory[this.actualWeapon].baseRotation.clone();      
      // We reset _animationDelta
      this._animationDelta = 0;
      this.inventory[this.actualWeapon].isActive = false;
      this.inventory[this.actualWeapon]
      this.actualWeapon = nextPossibleWeapon;
      this.inventory[this.actualWeapon].isActive = true;
      this.fireRate = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon].setup.cadency;
      this._deltaFireRate = this.fireRate;
    }
  },//\nextWeapon

  animateMovementWeapon : function(step){
    if(!this.Player.isAlive){
        return;
    }
    let typeWeapon = this.inventory[this.actualWeapon].typeWeapon;
    
    // We divide step by the timeAnimation value of the weapon
    // We multiply this value by 180
    let result = (step / this.Armory.weapons[typeWeapon].timeAnimation) * 180;
    // If the value exceeds 180, it means that step is greater than timeAnimation
    // In this case, we make sure that result never exceeds 180
    if(result>180){
        result = 180;
    }
    // The value 100 is used to round
    let degSin = Math.round(Math.sin(degToRad(result))*100)/100; 
    // We determine the movement parameters for each type of weapon
    switch(typeWeapon){
      case 0:
          var positionNeeded = new BABYLON.Vector3(0,-0.5,0);
          var rotationNeeded = new BABYLON.Vector3(-0.5,0,0);
          break;
      case 1:
          var positionNeeded = new BABYLON.Vector3(0.05,0.05,0);
          var rotationNeeded = new BABYLON.Vector3(0.1,0.1,0);
          break;
      case 2:
          var positionNeeded = new BABYLON.Vector3(0,0.4,0);
          var rotationNeeded = new BABYLON.Vector3(1.3,0,0);
          break;
      case 3:
          var positionNeeded = new BABYLON.Vector3(0,0,-1);
          var rotationNeeded = new BABYLON.Vector3(0,0,0);
          break;
    }
    // We collect the basic position and rotation
    var baseRotation = this.inventory[this.actualWeapon].baseRotation.clone();
    var basePosition = this.inventory[this.actualWeapon].basePosition.clone();
    // We assign the values we are interested in step by step
    this.inventory[this.actualWeapon].rotation = baseRotation.clone() ;
    this.inventory[this.actualWeapon].rotation.x -= (rotationNeeded.x*degSin);
    this.inventory[this.actualWeapon].position = basePosition.clone() ;
    this.inventory[this.actualWeapon].position.y += (positionNeeded.y*degSin);
    this.inventory[this.actualWeapon].position.z += (positionNeeded.z*degSin);
  }//\animateMovementWeapon

};//\Weapons.prototype