//Arena component

Arena = function(game,props) {
    this.game = game;
    var scene = game.scene;

    // Import Armory from Game
    this.Armory = game.armory;

    // LIGHTS
    //Main light
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1, 0), scene);
    light2.specular = new BABYLON.Color3(0,0,0);
    light.intensity = 0.2;
    light2.intensity = 0.2;
    //PointLight
    var light3 = new BABYLON.PointLight("Spot0", new BABYLON.Vector3(-40, 10, -100), scene);
    light3.intensity = 0.3;
    light3.specular = new BABYLON.Color3(0,0,0);
    //Shadows
    var shadowGenerator1 = new BABYLON.ShadowGenerator(2048, light3);
    shadowGenerator1.usePoissonSampling = true;
    shadowGenerator1.bias = 0.0005;

    // MATERIALS
    // Ground
    var materialGround = new BABYLON.StandardMaterial("wallTexture", scene);
    materialGround.diffuseTexture = new BABYLON.Texture("assets/images/tile.jpg", scene);
    materialGround.diffuseTexture.uScale = 8.0;
    materialGround.diffuseTexture.vScale = 8.0;
    // Objects
    var materialWall = new BABYLON.StandardMaterial("groundTexture", scene);
    materialWall.diffuseTexture = new BABYLON.Texture("assets/images/tile.jpg", scene);

    // MESHES
    // Ground
    var boxArena = BABYLON.Mesh.CreateBox("box1", 100, scene, false, BABYLON.Mesh.BACKSIDE);
    boxArena.material = materialGround;
    boxArena.position.y = 50 * 0.3;
    boxArena.scaling.y = 0.3;
    boxArena.scaling.z = 0.8;
    boxArena.scaling.x = 3.5;
    boxArena.checkCollisions = true;//activate collision on boxes
    boxArena.receiveShadows = true;//to receive shadows
    //Objects (cylinders)
    var columns = [];
    var numberColumn = 6;
    var sizeArena = 100*boxArena.scaling.x -50;
    var ratio = ((100/numberColumn)/100) * sizeArena;
    for (var i = 0; i <= 1; i++) {
      //Create main object
        if(numberColumn>0){
            columns[i] = [];
            let mainCylinder = BABYLON.Mesh.CreateCylinder("cyl0-"+i, 30, 5, 5, 20, 4, scene);
            mainCylinder.position = new BABYLON.Vector3(-sizeArena/2,30/2,-20 + (40 * i));
            mainCylinder.material = materialWall;
            columns[i].push(mainCylinder);
            mainCylinder.checkCollisions = true;
            // to receive more lights (by default 4)
            mainCylinder.maxSimultaneousLights = 10;
            // generate shadows
            shadowGenerator1.getShadowMap().renderList.push(mainCylinder);
            // receive shadows
            mainCylinder.receiveShadows = true;

      //Clone main object
            if(numberColumn>1){
                for (let y = 1; y <= numberColumn - 1; y++) {
                    let newCylinder = columns[i][0].clone("cyl"+y+"-"+i);
                    newCylinder.position = new BABYLON.Vector3(-(sizeArena/2) + (ratio*y),30/2,columns[i][0].position.z);
                    newCylinder.checkCollisions = true;
                    newCylinder.maxSimultaneousLights = 10;
                    columns[i].push(newCylinder);
                }
            }
        }
    }
    // PROPS DEFINITION ------------------------------------------------
    // List of objects stored in the game
    this.bonusBox=[];
    this.weaponBox=[];
    this.ammosBox=[];

    // The props sent by the server
    this.bonusServer = props[0];
    this.weaponServer = props[1];
    this.ammosServer = props[2];

    //Check if the object exists
    for (var i = 0; i < this.bonusServer.length; i++) {
        // If the object has not been taken by a player
        if(this.bonusServer[i].v === 1){
            var newBonusBox = this.newBonuses(new BABYLON.Vector3(
                this.bonusServer[i].x,
                this.bonusServer[i].y,
                this.bonusServer[i].z),
            this.bonusServer[i].t);
            
            newBonusBox.idServer = i;
            this.bonusBox.push(newBonusBox);
        }
    }

    for (var i = 0; i < this.weaponServer.length; i++) {
        if(this.weaponServer[i].v === 1){
            var newWeaponBox = this.newWeaponSet(new BABYLON.Vector3(
                this.weaponServer[i].x,
                this.weaponServer[i].y,
                this.weaponServer[i].z),
            this.weaponServer[i].t);
            
            newWeaponBox.idServer = i;
            this.weaponBox.push(newWeaponBox);
        }
    }

    for (var i = 0; i < this.ammosServer.length; i++) {
        if(this.ammosServer[i].v === 1){
            var newAmmoBox = this.newAmmo(new BABYLON.Vector3(
                this.ammosServer[i].x,
                this.ammosServer[i].y,
                this.ammosServer[i].z),
            this.ammosServer[i].t);
            
            newAmmoBox.idServer = i;
            this.ammosBox.push(newAmmoBox);
        }
    }
};//\Arena

Arena.prototype = {

    newBonuses : function(position,type) {
        var typeBonus = type;
        var positionBonus = position;
        
        // We create a cube
        var newBonus = BABYLON.Mesh.CreateBox("bonusItem",  2, this.game.scene);
        newBonus.scaling = new BABYLON.Vector3(1,1,1);
        
        // We give it the color orange
        newBonus.material = new BABYLON.StandardMaterial("textureItem", this.game.scene);
        newBonus.material.diffuseColor = new BABYLON.Color3((255/255), (138/255), (51/255));
    
        // We position the object according to the position sent
        newBonus.position = positionBonus;
        
        // We make it impossible to be selected by raycast
        newBonus.isPickable = false;
        
         // We assign to the object its type
        newBonus.typeBonus = typeBonus;
    
        return newBonus;
    },//\newBonuses

    newWeaponSet : function(position,type) {
        var typeWeapons = type;
        var positionWeapon = position;
    
        var newSetWeapon = BABYLON.Mesh.CreateBox(this.Armory.weapons[typeWeapons].name, 1, this.game.scene);
        newSetWeapon.scaling = new BABYLON.Vector3(1,0.7,2);
    
    
        newSetWeapon.material = new BABYLON.StandardMaterial("weaponMat", this.game.scene);
        newSetWeapon.material.diffuseColor = this.Armory.weapons[typeWeapons].setup.colorMesh;
        newSetWeapon.position = positionWeapon;
        newSetWeapon.isPickable = false;
        newSetWeapon.typeWeapon = type;
    
        return newSetWeapon;
    },//\newWeaponSet

    newAmmo : function(position,type) {
        var typeAmmos = type;
        var positionAmmo = position;
        var newAmmo = BABYLON.Mesh.CreateBox(this.game.armory.weapons[typeAmmos].name, 1.0, this.game.scene);
        newAmmo.position = positionAmmo;
        newAmmo.isPickable = false;
        newAmmo.material = new BABYLON.StandardMaterial("ammoMat", this.game.scene);
        newAmmo.material.diffuseColor = this.game.armory.weapons[typeAmmos].setup.colorMesh;
        newAmmo.typeAmmo = type;
    
        return newAmmo;
    },//\newAmmo 

    _checkProps : function(){
        // For bonuses
        for (var i = 0; i < this.bonusBox.length; i++) {
            // We check if the distance is less than 6
            if(BABYLON.Vector3.Distance(
                this.game._PlayerData.camera.playerBox.position,
                this.bonusBox[i].position)<6){
                var paramsBonus = this.Armory.bonuses[this.bonusBox[i].typeBonus];
                this.game._PlayerData.givePlayerBonus(paramsBonus.type,paramsBonus.value);
                
                //If the player has recovered an object, we must notify the server.
                // For the bonusBox loop
                this.displayNewPicks(paramsBonus.message);
                // For bonusBox
                this.pickableDestroyed(this.bonusBox[i].idServer,'bonus');

                // We delete the object
                this.bonusBox[i].dispose();
                this.bonusBox.splice(i,1)
            }
            
        }
        for (var i = 0; i < this.weaponBox.length; i++) {
            // For weapons
            if(BABYLON.Vector3.Distance(
                this.game._PlayerData.camera.playerBox.position,
                this.weaponBox[i].position)<6){
                var Weapons = this.game._PlayerData.camera.weapons;
                var paramsWeapon = this.Armory.weapons[this.weaponBox[i].typeWeapon];
                var notPiked = true;
                //Check if weapon is already in inventory
                for (var y = 0; y < Weapons.inventory.length; y++) {
                    if(Weapons.inventory[y].typeWeapon == this.weaponBox[i].typeWeapon){
                        notPiked = false;
                        break;
                    }
                }
                if(notPiked){//If weapon is not in inventory yet

                    var actualInventoryWeapon = Weapons.inventory[Weapons.actualWeapon];
                    
                    var newWeapon = Weapons.newWeapon(paramsWeapon.name);
                    Weapons.inventory.push(newWeapon);

                    // We reset the position of the previous animated weapon
                    actualInventoryWeapon.position = actualInventoryWeapon.basePosition.clone();
                    actualInventoryWeapon.rotation = actualInventoryWeapon.baseRotation.clone();
                    Weapons._animationDelta = 0;

                    actualInventoryWeapon.isActive = false;

                    Weapons.actualWeapon = Weapons.inventory.length -1;
                    actualInventoryWeapon = Weapons.inventory[Weapons.actualWeapon];
                    
                    actualInventoryWeapon.isActive = true;

                    Weapons.fireRate = Weapons.Armory.weapons[actualInventoryWeapon.typeWeapon].setup.cadency;
                    Weapons._deltaFireRate = Weapons.fireRate;

                    Weapons.textAmmos.innerText = actualInventoryWeapon.ammos;
                    Weapons.totalTextAmmos.innerText = 
                    Weapons.Armory.weapons[actualInventoryWeapon.typeWeapon].setup.ammos.maximum;
                    Weapons.typeTextWeapon.innerText = 
                    Weapons.Armory.weapons[actualInventoryWeapon.typeWeapon].name;

                    //If the player has recovered an object, we must notify the server.
                    // For the weaponBox loop
                    this.displayNewPicks(paramsWeapon.name);
                    // For weaponBox
                    this.pickableDestroyed(this.weaponBox[i].idServer, 'weapon');

                    //We destroy the objects
                    this.weaponBox[i].dispose();
                    this.weaponBox.splice(i,1);
                }                
            }
        }
        for (var i = 0; i < this.ammosBox.length; i++) {
            // For ammunition
            if(BABYLON.Vector3.Distance(
                this.game._PlayerData.camera.playerBox.position,
                this.ammosBox[i].position)<6){
                
                var paramsAmmos = this.Armory.weapons[this.ammosBox[i].typeAmmo].setup.ammos;
                var Weapons = this.game._PlayerData.camera.weapons;

                Weapons.reloadWeapon(this.ammosBox[i].typeAmmo, paramsAmmos.refuel);

                //If the player has recovered an object, we must notify the server.
                // For the ammosBox loop
                this.displayNewPicks(paramsAmmos.meshAmmosName);
                // For ammosBox
                this.pickableDestroyed(this.ammosBox[i].idServer, 'ammos');

                //We destroy the objects    
                this.ammosBox[i].dispose();
                this.ammosBox.splice(i,1);
            }            
        }
    },//\_checkProps

    /* if the server receives the order to delete an object, 
    we must indicate the id of the object to delete, then restart the appropriate function */
    deletePropFromServer : function(deletedProp){
        // idServer is the weapon id
        var idServer = deletedProp[0];
        
        // type allows us to determine what the object is
        var type = deletedProp[1];
        switch (type){
            case 'ammos' :
                for (var i = 0; i < this.ammosBox.length; i++) {
                    if(this.ammosBox[i].idServer === idServer){
                        this.ammosBox[i].dispose();
                        this.ammosBox.splice(i,1);
                        break;
                    }
                }                
            break;
            case 'bonus' :
                for (var i = 0; i < this.bonusBox.length; i++) {
                    if(this.bonusBox[i].idServer === idServer){
                        this.bonusBox[i].dispose();
                        this.bonusBox.splice(i,1);
                        break;
                    }
                }
            break;
            case 'weapon' :
                for (var i = 0; i < this.bonusBox.length; i++) {
                    if(this.weaponBox[i].idServer === idServer){
                        this.weaponBox[i].dispose();
                        this.weaponBox.splice(i,1);
                        break;
                    }
                }
            break;
        }
    },//\deletePropFromServer

    // To avoid cheating, the server manages the re-creation of the props
    recreatePropFromServer : function(recreatedProp){
        var idServer = recreatedProp[0];
        var type = recreatedProp[1];
        switch (type){
            case 'ammos' :
                var newAmmoBox = this.newAmmo(new BABYLON.Vector3(
                    this.ammosServer[idServer].x,
                    this.ammosServer[idServer].y,
                    this.ammosServer[idServer].z),
                    this.ammosServer[idServer].t);
                
                newAmmoBox.idServer = idServer;
                this.ammosBox.push(newAmmoBox);
            break;
            case 'bonus' :
                var newBonusBox = this.newBonuses(new BABYLON.Vector3(
                    this.bonusServer[idServer].x,
                    this.bonusServer[idServer].y,
                    this.bonusServer[idServer].z),
                    this.bonusServer[idServer].t);
                    
                newBonusBox.idServer = idServer;
                this.bonusBox.push(newBonusBox);
            break;
            case 'weapon' :
                var newWeaponBox = this.newWeaponSet(new BABYLON.Vector3(
                    this.weaponServer[idServer].x,
                    this.weaponServer[idServer].y,
                    this.weaponServer[idServer].z),
                    this.weaponServer[idServer].t);
                    
                newWeaponBox.idServer = idServer;
                this.weaponBox.push(newWeaponBox);
            break;
        }
    },//\recreatePropFromServer

    // Server part
    pickableDestroyed : function(idServer,type) {
        destroyPropsToServer(idServer,type);
    },//\pickableDestroyed

    // We use the class to make the window appear and disappear
    displayNewPicks : function(typeBonus) {
        // Retrieves the properties of the announcement window
        var displayAnnouncement = document.getElementById('announcementKill');
        var textDisplayAnnouncement = document.getElementById('textAnouncement');
        
        // If the window has announcementClose (and is closed)
        if(displayAnnouncement.classList.contains("annoucementClose")){
            displayAnnouncement.classList.remove("annoucementClose");
        }
        // We check that the police are at 1 
        textDisplayAnnouncement.style.fontSize = '1rem';
        
        // We give textDisplayAnnouncement the value sent to displayNewPicks
        textDisplayAnnouncement.innerText = typeBonus;
        
        // After 4 seconds, if the window is open, it will disappear
        setTimeout(function(){ 
            if(!displayAnnouncement.classList.contains("annoucementClose")){
                displayAnnouncement.classList.add("annoucementClose");
            }
        }, 4000);
    },

}//\Arena.prototype