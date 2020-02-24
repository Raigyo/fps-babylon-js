//Weapons component

Weapons = function(Player) {
    // To access Player component
    this.Player = Player;
    // Positions for not used weapon
    this.bottomPosition = new BABYLON.Vector3(0.5,-2.5,1);
    // Positions for used weapon
    this.topPositionY = -0.5;
    // Create weapon
    this.rocketLauncher = this.newWeapon(Player);

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
    }
};
