//Arena / Stage component

Arena = function(game) {
    this.game = game;
    var scene = game.scene;

    //LIGHT - Hemispheric/Directional/Point/Spot
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.diffuse = new BABYLON.Color3(1, 1, 1);//diffuse=light color
    light.specular = new BABYLON.Color3(1, 1, 1);//specular=intensity of brighting received

    light.intensity = 0.8;//intensity of light
    //light.range = 100; // distance - point and spot only

    //MATERIALS
    // Ground
    var materialGround = new BABYLON.StandardMaterial("wallTexture", scene);//create material
    materialGround.diffuseTexture = new BABYLON.Texture("assets/images/brick.jpg", scene);//apply texture
    materialGround.diffuseTexture.uScale = 4.0; //update height (=u for 2D)
    materialGround.diffuseTexture.vScale = 4.0; //update width (=w for 2D)

    // Objects
    var materialWall = new BABYLON.StandardMaterial("groundTexture", scene);
    materialWall.diffuseTexture = new BABYLON.Texture("assets/images/wood.jpg", scene);

    //MESHES

    //Ground
    var ground = BABYLON.Mesh.CreateGround("ground1", 20, 20, 2, scene);
    ground.scaling = new BABYLON.Vector3(2,10,3); //Vector 3 = position x,y,z
    ground.scaling.z = 2; //size
    ground.material = materialGround; //apply material

    // Cube model (=prefab in Unity) -> name, size, subdivision
    var mainBox = BABYLON.Mesh.CreateBox("box1", 3, scene);
    mainBox.scaling.y = 1;
    mainBox.position = new BABYLON.Vector3(5,((3/2)*mainBox.scaling.y),5);//we have to ride up the object in Y (half its original size*its real size, because the gravity point of objects is at the center )
    mainBox.rotation.y = (Math.PI*45)/180;// convert degrees to radians
    mainBox.material = materialWall; //apply material
    // Instanciate cubes
    var mainBox2 = mainBox.clone("box2");
    mainBox2.scaling.y = 2;
    mainBox2.position = new BABYLON.Vector3(5,((3/2)*mainBox2.scaling.y),-5);
    // Instanciate cubes
    var mainBox3 = mainBox.clone("box3");
    mainBox3.scaling.y = 3;
    mainBox3.position = new BABYLON.Vector3(-5,((3/2)*mainBox3.scaling.y),-5);
    // Instanciate cubes
    var mainBox4 = mainBox.clone("box4");
    mainBox4.scaling.y = 4;
    mainBox4.position = new BABYLON.Vector3(-5,((3/2)*mainBox4.scaling.y),5);

    // Cylinder -> name, height, diamTop, diamBottom, tesselation, subdivision
    var cylinder = BABYLON.Mesh.CreateCylinder("cyl1", 20, 5, 5, 20, 4, scene);
    cylinder.position.y = 20/2;
    cylinder.material = materialWall;
};
