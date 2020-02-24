//Camera component

Player = function(game, canvas) {
    // Game scene
    this.scene = game.scene;
    // Cam init
    this._initCamera(this.scene, canvas);
};

Player.prototype = {
    _initCamera : function(scene, canvas) {
        // Cam creation
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), scene);
        //Other type of camera as exemple: not used
        //this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), scene);

        // Cam 'raycast' to point zero
        this.camera.setTarget(BABYLON.Vector3.Zero());//or new BABYLON.Vector3(0,0,0)          
        // Attach camera moves on canvas (with mouse and keyboard)
        this.camera.attachControl(canvas, true);
    }
};
