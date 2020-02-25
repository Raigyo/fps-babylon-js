//Main game /rendering component

// When page is loaded, the game is launched in the targeted canvas
document.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas');
}, false);

//Game engine
Game = function(canvasId) {
    // Define canvas and Babylon engine
    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);
    this.engine = engine;
    var _this = this;//Creates a global variable window._this (prototype below)
    _this.actualTime = Date.now();
    // Scene init with the var engine
    this.scene = this._initScene(engine);
    var _player = new Player(_this, canvas);//Init instance of player
    var _arena = new Arena(_this);//Init instance of arena

    // Game rendering using graphic engine
    engine.runRenderLoop(function () {
      // FPS and spped adjustement
      _this.fps = Math.round(1000/engine.getDeltaTime());
      // Udpate the player movement according to the FPS ratio provided by his computer
      _player._checkMove((_this.fps)/60);
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
        //return on each frame
        return scene;
    }
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
