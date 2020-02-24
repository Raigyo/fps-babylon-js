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
    //Creates a global variable window._this (prototype below)
    var _this = this;

    // Scene init with the var engine
    this.scene = this._initScene(engine);

    // Game rendering using graphic engine
    var _player = new Player(_this, canvas); //call Player component
    var _arena = new Arena(_this); //call Arena component
    engine.runRenderLoop(function () {
        _this.scene.render();
    });

    //Native fct: Adjust the screen if the window of the browser is resized
    window.addEventListener("resize", function () {
        if (engine) {
            engine.resize();
        }
    },false);

};

Game.prototype = {
    // Prototype scene init
    _initScene : function(engine) {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor=new BABYLON.Color3(0,0,0);
        //return on each frame
        return scene;
    }
};

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
