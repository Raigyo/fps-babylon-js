//Main game /rendering component

// When page is loaded, the game is launched in the targeted canvas
// document.addEventListener("DOMContentLoaded", function () {
//     new Game('renderCanvas');
// }, false);

//Game engine
Game = function(canvasId,playerConfig,props) {
    // Define canvas and Babylon engine
    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);
    this.engine = engine;
    var _this = this;//Creates a global variable window._this (prototype below)
    _this.actualTime = Date.now();
    //Spawn points
    this.allSpawnPoints = [
        new BABYLON.Vector3(-20, 5, 0),
        new BABYLON.Vector3(0, 5, 0),
        new BABYLON.Vector3(20, 5, 0),
        new BABYLON.Vector3(-40, 5, 0)
    ];
    // Scene init with the var engine
    this.scene = this._initScene(engine);
    var armory = new Armory(this);//Init instance of armory
    _this.armory = armory;// Access Armory from Game
    var _player = new Player(_this, canvas);//Init instance of player    
    this._PlayerData = _player;// Access Player from Game
    var _arena = new Arena(_this,props);//Init instance of arena+send props
    this._ArenaData = _arena;//We need to access Arena
    this._rockets = [];//The rockets generated in Player.js  
    this._explosionRadius = [];//Explosions from rockets        
    this._lasers = [];//lasers shoots
    // Game rendering using graphic engine
    engine.runRenderLoop(function () {
        // FPS and speed adjustement
        _this.fps = Math.round(1000/engine.getDeltaTime());
        // Udpate the player movement according to the FPS ratio provided by his computer
        _player._checkMove((_this.fps)/60);
        // We call our two calculation functions for rockets
        _this.renderRockets();
        _this.renderExplosionRadius();
        // We calculate the decrease in the size of the laser
        _this.renderLaser();
        // We calculate the weapon animations
        _this.renderWeapons();
        // We check props
        _this._ArenaData._checkProps();
        //We render the scene
        _this.scene.render();
        // If launchBullets = true = shoot
        // Has to be after rendering
        if(_player.camera.weapons.launchBullets === true){
            _player.camera.weapons.launchFire();
        }
    });//\runRenderLoop

    //Native fct: Adjust the screen if the window of the browser is resized
    window.addEventListener("resize", function () {
        if (engine) {
            engine.resize();
        }
    },false);//\resize

};//\Game

Game.prototype = {
    // Prototype scene init
    _initScene : function(engine) {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor=new BABYLON.Color3(0,0,0);
        scene.gravity = new BABYLON.Vector3(0, -9.81, 0);//add gravity (value -9.81: earth value)
        scene.collisionsEnabled = true;//add collisions
        //return on each frame
        return scene;
    },//\_initScene 

    //Move all the rockets
    renderRockets : function() {
        for (var i = 0; i < this._rockets.length; i++) {
            //Parameters of the rocket
            var paramsRocket = this._rockets[i].paramsRocket;
            //We create a radius which goes from the base of the rocket towards the front
            var rayRocket = new BABYLON.Ray(this._rockets[i].position,this._rockets[i].direction);
            //We look at what is the first object we touch
            var meshFound = this._rockets[i].getScene().pickWithRay(rayRocket);
            //If the distance to the first object hit is less than 10, we destroy the rocket
            if(!meshFound || meshFound.distance < 10){
                //We check that we have touched something
                if(meshFound.pickedMesh && !meshFound.pickedMesh.isMain){
                    //We create a sphere that will represent the impact area
                    var explosionRadius = BABYLON.Mesh.CreateSphere("sphere", 5.0, 20, this.scene);
                    //We position the sphere where there was an impact
                    explosionRadius.position = meshFound.pickedPoint;
                    //We make sure that the explosions are not considered for the Ray of the rocket
                    explosionRadius.isPickable = false;
                    //We create a little orange material
                    explosionRadius.material = new BABYLON.StandardMaterial("textureExplosion", this.scene);
                    explosionRadius.material.diffuseColor = new BABYLON.Color3(1,0.6,0);
                    explosionRadius.material.specularColor = new BABYLON.Color3(0,0,0);
                    explosionRadius.material.alpha = 0.8;
                    //Calculates the object matrix for collisions
                    explosionRadius.computeWorldMatrix(true);
                    //We do a round of mouth for each player of the scene
                    if (this._PlayerData.isAlive && this._PlayerData.camera.playerBox && explosionRadius.intersectsMesh(this._PlayerData.camera.playerBox)) {
                        //Sends to the damage allocation functions
                        if(this._rockets[i].owner){
                            var whoDamage = this._rockets[i].owner;
                        }else{
                            var whoDamage = false;
                        }
                        this._PlayerData.getDamage(paramsRocket.damage,whoDamage);
                    }                    
                    this._explosionRadius.push(explosionRadius);
                }
                this._rockets[i].dispose();
                // Remove from array _rockets the mesh number i (defined by the loop)
                this._rockets.splice(i,1);
            }else{
                //Update the sepped according the FPS
                let relativeSpeed = paramsRocket.ammos.rocketSpeed / ((this.fps)/60);
                //The rocket will always move from the center
                this._rockets[i].position.addInPlace(this._rockets[i].direction.scale(relativeSpeed));
            }
        };
    },//\renderRockets

    //Move all the explosions
    renderExplosionRadius : function(){
        if(this._explosionRadius.length > 0){
            for (var i = 0; i < this._explosionRadius.length; i++) {
                this._explosionRadius[i].material.alpha -= 0.02;
                if(this._explosionRadius[i].material.alpha<=0){
                    this._explosionRadius[i].dispose();
                    this._explosionRadius.splice(i, 1);
                }
            }
        }
    },//\renderExplosionRadius

    //Render laser shoots
    renderLaser : function(){
        if(this._lasers.length > 0){
            //Decrease laser stroke
            for (var i = 0; i < this._lasers.length; i++) {
                this._lasers[i].edgesWidth -= 0.5;
                if(this._lasers[i].edgesWidth<=0){
                    this._lasers[i].dispose();
                    this._lasers.splice(i, 1);
                }
            }
        }
    },//\renderLaser

    //Weapon animation
    renderWeapons : function(){
        if(this._PlayerData && this._PlayerData.camera.weapons.inventory){
            // We look at all the weapons in inventory
            var inventoryWeapons = this._PlayerData.camera.weapons.inventory;            
            for (var i = 0; i < inventoryWeapons.length; i++) {
                // If the weapon is active and not in the high position (topPositionY)
                if(inventoryWeapons[i].isActive && inventoryWeapons[i].position.y < this._PlayerData.camera.weapons.topPositionY){
                    inventoryWeapons[i].position.y += 0.1;
                }else if(!inventoryWeapons[i].isActive && inventoryWeapons[i].position.y != this._PlayerData.camera.weapons.bottomPosition.y){
                    // Otherwise, if the weapon is inactive and not yet in the low position
                    inventoryWeapons[i].position.y -= 0.1;
                }
            }
        }
    },//\renderWeapons

    createGhostRocket : function(dataRocket) {
        var positionRocket = dataRocket[0];
        var rotationRocket = dataRocket[1];
        var directionRocket = dataRocket[2];
        var idPlayer = dataRocket[3];
    
        newRocket = BABYLON.Mesh.CreateBox('rocket', 0.5, this.scene);
        
        newRocket.scaling = new BABYLON.Vector3(1,0.7,2);
    
        newRocket.direction = new BABYLON.Vector3(directionRocket.x,directionRocket.y,directionRocket.z);
    
        newRocket.position = new BABYLON.Vector3(
            positionRocket.x + (newRocket.direction.x * 1) , 
            positionRocket.y + (newRocket.direction.y * 1) ,
            positionRocket.z + (newRocket.direction.z * 1));
        newRocket.rotation = new BABYLON.Vector3(rotationRocket.x,rotationRocket.y,rotationRocket.z);
    
        newRocket.scaling = new BABYLON.Vector3(0.5,0.5,1);
        newRocket.isPickable = false;
        newRocket.owner = idPlayer;
    
        newRocket.material = new BABYLON.StandardMaterial("textureWeapon", this.scene, false, BABYLON.Mesh.DOUBLESIDE);
        newRocket.material.diffuseColor = this.armory.weapons[2].setup.colorMesh;
        newRocket.paramsRocket = this.armory.weapons[2].setup;
        
        game._rockets.push(newRocket);
    },//\createGhostRocket

    createGhostLaser : function(dataRocket){
        var position1 = dataRocket[0];
        var position2 = dataRocket[1];
        var idPlayer = dataRocket[2];
    
        let line = BABYLON.Mesh.CreateLines("lines", [
                    position1,
                    position2
                ], this.scene);
        var colorLine = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        line.color = colorLine;
        line.enableEdgesRendering();
        line.isPickable = false;
        line.edgesWidth = 40.0;
        line.edgesColor = new BABYLON.Color4(colorLine.r, colorLine.g, colorLine.b, 1);
        this._lasers.push(line);
    },//\createGhostLaser

    displayScore(room){
        if(room.length>=5){
            var limitLoop = 4;
        }else{
            var limitLoop = room.length-1;
        }
        var indexName = 0;
        for (var i = 0; i <= limitLoop ; i++) {
            document.getElementById('player'+indexName).innerText = room[i].name;
            document.getElementById('scorePlayer'+indexName).innerText = room[i].score;
            indexName++;
        }
    }//\displayScore

};//\Game.prototype

// ------------------------- DEGRES to RADIANS
function degToRad(deg)
{
   return (Math.PI*deg)/180
}
// ----------------------------------------------------

// -------------------------- RADIANS to DEGRES
function radToDeg(rad)
{
   return (rad*180)/Math.PI
}
// ----------------------------------------------------
