// Ghost Player component

// Create players
GhostPlayer = function(game,ghostData,idRoom) {
    // We say that game is accessible in the object
    this.game = game;
    var fakePlayer = {};

    // We give our ghost a rotation and position sent by the server
    var positionSpawn = new BABYLON.Vector3(ghostData.position.x,
    ghostData.position.y,
    ghostData.position.z);

    var rotationSpawn = new BABYLON.Vector3(ghostData.rotation.x,
    ghostData.rotation.y,
    ghostData.rotation.z);

    //Creation of body/head and hitbox of ghost
    fakePlayer.playerBox = BABYLON.Mesh.CreateBox(ghostData.id, 5, this.game.scene);//id used in SocketIO
    fakePlayer.playerBox.scaling = new BABYLON.Vector3(0.5,1.2,0.5)
    fakePlayer.playerBox.position = positionSpawn;
    fakePlayer.playerBox.isPlayer = true;
    fakePlayer.playerBox.isPickable = true;
    
    fakePlayer.playerBox.material = new BABYLON.StandardMaterial("textureGhost", this.game.scene);
    fakePlayer.playerBox.material.alpha = 0;
    
    fakePlayer.playerBox.checkCollisions = true;
    fakePlayer.playerBox.applyGravity = true;
    fakePlayer.playerBox.ellipsoid = new BABYLON.Vector3(1.5, 1, 1.5);
    
    fakePlayer.head = BABYLON.Mesh.CreateBox('headGhost', 2.2, this.game.scene);
    fakePlayer.head.parent = fakePlayer.playerBox;
    fakePlayer.head.scaling = new BABYLON.Vector3(2,0.8,2)
    fakePlayer.head.position.y+=1.6;
    fakePlayer.head.isPickable = false;
    
    fakePlayer.bodyChar = BABYLON.Mesh.CreateBox('bodyGhost', 2.2, this.game.scene);
    fakePlayer.bodyChar.parent = fakePlayer.playerBox;
    fakePlayer.bodyChar.scaling = new BABYLON.Vector3(2,0.8,2)
    fakePlayer.bodyChar.position.y-=0.6;
    fakePlayer.bodyChar.isPickable = false;

    // Player life and armor data
    fakePlayer.health = ghostData.life;
    fakePlayer.armor  = ghostData.armor;

    // Jump
    fakePlayer.jumpNeed = false;

    // The place of the player in the table of players, managed by the server
    fakePlayer.idRoom = idRoom;

    // The axis of movement. It is he who will receive the information of pressed keys sent by the player
    fakePlayer.axisMovement = ghostData.axisMovement;

    // The real name of the player
    fakePlayer.namePlayer = ghostData.name;

    // Player id
    fakePlayer.uniqueId = ghostData.uniqueId;

    // The rotation. Like movement, it is used to determine the direction of movement
    fakePlayer.rotation = rotationSpawn;

    // The materials that define the player's color
    fakePlayer.head.material = new BABYLON.StandardMaterial("textureGhost", this.game.scene);
    fakePlayer.head.material.diffuseColor = new BABYLON.Color3(0, 1, 1);

    fakePlayer.bodyChar.material = new BABYLON.StandardMaterial("textureGhost", this.game.scene);
    fakePlayer.bodyChar.material.diffuseColor = new BABYLON.Color3(0, 0.6, 0.6);

    return fakePlayer;
}//\GhostPlayer

// Delete players
deleteGameGhost = function(game,deletedIndex){
    ghostPlayers = game._PlayerData.ghostPlayers;
    //Search id player to delete amongs all players
    for (var i = 0; i < ghostPlayers.length; i++) {
        console.log(ghostPlayers[i].idRoom);
        console.log(deletedIndex)
        //We remove all the objects present in ghostPlayer 
        //and we delete the player concerned from the table of players
        if(ghostPlayers[i].idRoom === deletedIndex){
            ghostPlayers[i].playerBox.dispose();
            ghostPlayers[i].head.dispose();
            ghostPlayers[i].bodyChar.dispose();
            ghostPlayers[i] = false;

            ghostPlayers.splice(i,1);
            break;
        }        
    }
}//\deleteGameGhost