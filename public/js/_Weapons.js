Weapons = function(Player) {
    // On permet d'accéder à Player n'importe ou dans Weapons
    this.Player = Player;
    
    // Positions selon l'arme non utilisé
    this.bottomPosition = new BABYLON.Vector3(0.5,-2.5,1);

    // Changement de Y quand l'arme est séléctionné
    this.topPositionY = -0.5;

    // Créons notre arme
    this.rocketLauncher = this.newWeapon(Player);

    // Cadence de tir
	this.fireRate = 800;

	// Delta de calcul pour savoir quand le tir est a nouveau disponible
	this._deltaFireRate = this.fireRate;

	// Variable qui va changer selon le temps
	this.canFire = true;

	// Variable qui changera à l'appel du tir depuis le Player
	this.launchBullets = false;

	// _this va nous permettre d'acceder à l'objet depuis des fonctions que nous utiliserons plus tard
	var _this = this;

	// Engine va nous être utile pour la cadence de tir
	var engine = Player.game.scene.getEngine();

	Player.game.scene.registerBeforeRender(function() {
	    if (!_this.canFire) {
	        _this._deltaFireRate -= engine.getDeltaTime();
	        if (_this._deltaFireRate <= 0  && _this.Player.isAlive) {
	            _this.canFire = true;
	            _this._deltaFireRate = _this.fireRate;
	        }
	    }
	});

};

Weapons.prototype = {
    newWeapon : function(Player) {
        var newWeapon;
        newWeapon = BABYLON.Mesh.CreateBox('rocketLauncher', 0.5, Player.game.scene);

        // Nous faisons en sorte d'avoir une arme d'apparence plus longue que large
        newWeapon.scaling = new BABYLON.Vector3(1,0.7,2);

        // On l'associe à la caméra pour qu'il bouge de la même facon
        newWeapon.parent = Player.camera;

        // On positionne le mesh APRES l'avoir attaché à la caméra
        newWeapon.position = this.bottomPosition.clone();
        newWeapon.position.y = this.topPositionY;

        // Ajoutons un material Rouge pour le rendre plus visible
        var materialWeapon = new BABYLON.StandardMaterial('rocketLauncherMat', Player.game.scene);
        materialWeapon.diffuseColor=new BABYLON.Color3(1,0,0);

        newWeapon.material = materialWeapon;

        return newWeapon
    },
    fire : function(pickInfo) {
	    this.launchBullets = true;
	},
	stopFire : function(pickInfo) {
	    this.launchBullets = false;
	},
	launchFire : function() {
	    if (this.canFire) {
	        // console.log('Pew !');
	        
	        this.createRocket(this.Player.camera.playerBox)
	        this.canFire = false; 
	    } else {
	        // Nothing to do : cannot fire
	    }
	},
	createRocket : function(playerPosition) {
	    var positionValue = this.rocketLauncher.absolutePosition.clone();
	    var rotationValue = playerPosition.rotation; 
	    var Player = this.Player;
	    var newRocket = BABYLON.Mesh.CreateBox("rocket", 1, Player.game.scene);
	    
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

	    newRocket.material = new BABYLON.StandardMaterial("textureWeapon", this.Player.game.scene);
	    newRocket.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

	    newRocket.isPickable = false;

	    this.Player.game._rockets.push(newRocket);
	},
};