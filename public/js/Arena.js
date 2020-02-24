//Arena component

Arena = function(game) {
    this.game = game;
    var scene = game.scene;

    // LIGHTS
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1, 0), scene);
    light2.intensity = 0.8;

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
      //Clone main object
            if(numberColumn>1){
                for (let y = 1; y <= numberColumn - 1; y++) {
                    let newCylinder = columns[i][0].clone("cyl"+y+"-"+i);
                    newCylinder.position = new BABYLON.Vector3(-(sizeArena/2) + (ratio*y),30/2,columns[i][0].position.z);
                    columns[i].push(newCylinder);
                }
            }
        }
    }
};
