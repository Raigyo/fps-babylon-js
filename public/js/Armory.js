//Armory component JSON

Armory = function(game, player) {
    this.weapons=[
        {
            'name':'Crook',
            'model' : {
                // 'meshUrl': '',
                'meshName': 'Crook'
            },
            'type':'closeCombat',
            'setup':{
                // Hitting distance of the weapon during close combat
                'range': 2,
                'damage' : 20,
                'cadency' : 500,
                'colorMesh' : new BABYLON.Color3((59/255), (195/255), (203/255))
            }
        },
        {
            'name':'Timmy',
            'model' : {
                // 'meshUrl': '',
                'meshName': 'Timmy'
            },
            'type':'ranged',
            'setup':{
                'damage' : 2,
                'cadency' : 50,
                'ammos' : {
                    'type' : 'bullet',
                    'baseAmmos' : 200,
                    'maximum' : 400,
                    'refuel' : 50
                },
                'colorMesh' : new BABYLON.Color3((27/255), (235/255), (37/255))
            }
        },
        {
            'name':'Ezekiel',
            'model' : {
                // 'meshUrl': '',
                'meshName': 'Ezekiel'
            },
            'type':'ranged',
            'setup':{
                'damage' : 30,
                'cadency' : 800,
                'ammos' : {
                    'type' : 'rocket',
                    'baseAmmos' : 15,
                    'refuel' : 10,
                    'maximum' : 40,
                    // 'meshAmmosUrl' : '',
                    'meshAmmosName' : 'Rockets',
                    // Speed of movement of the rocket
                    'rocketSpeed' : 10,
                    // Size of the rocket
                    'rocketSize' : 1,
                    // Explosion radius
                    'explosionRadius' : 40
                },
                // Default mesh color
                'colorMesh' : new BABYLON.Color3((209/255), (7/255), (26/255))
            }
        },
        {
            'name':'Armageddon',
            'model' : {
                // 'meshUrl': '',
                'meshName': 'Armageddon'
            },
            'type':'ranged',
            'setup':{
                'damage' : 1000,
                'cadency' : 2000,
                'ammos' : {
                    'type' : 'laser',
                    'spread' : 1,
                    'baseAmmos' : 5,
                    'maximum' : 15,
                    'refuel' : 5
                },
                'colorMesh' : new BABYLON.Color3((133/255), (39/255), (139/255))
            }
        }
    ];
    return 1
};