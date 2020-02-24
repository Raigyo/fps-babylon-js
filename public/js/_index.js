window.addEventListener('DOMContentLoaded', function() {
     var canvas = document.getElementById('canvas');
     var engine = new BABYLON.Engine(canvas, true);

     var createScene = function() {
          // Create the scene space
          var scene = new BABYLON.Scene(engine);

          // add a camera to the scene and attach it to the canvas
          var camera = new BABYLON.ArcRotateCamera(
               'Camera',
               Math.PI / 2,
               Math.PI / 2,
               2,
               BABYLON.Vector3.Zero(),
               scene
          );
          camera.attachControl(canvas, true);

          //Add lights to scene
          var light1 = new BABYLON.HemisphericLight(
               'light1',
               new BABYLON.Vector3(1, 1, 0),
               scene
          );
          var light2 = new BABYLON.PointLight(
               'light2',
               new BABYLON.Vector3(0, -1, -1),
               scene
          );

          //this is where you create and manipulate meshes
          // var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {}, scene);

          var redMat = new BABYLON.StandardMaterial('redMat', scene);
          redMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
          redMat.alpha = 0.25;

          var greenMat = new BABYLON.StandardMaterial('greenMat', scene);
          greenMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
          greenMat.alpha = 0.5;

          //Red
          var sphere1 = BABYLON.MeshBuilder.CreateSphere('sphere1', {}, scene);
          sphere1.material = redMat;
          sphere1.position.z = 1.5;

          //Green Transparent
          var sphere2 = BABYLON.MeshBuilder.CreateSphere('sphere2', {}, scene);
          sphere2.material = greenMat;

          return scene;
     };

     var scene = createScene();
     engine.runRenderLoop(function() {
          scene.render();
     });
});
