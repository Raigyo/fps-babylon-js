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
            'timeAnimation' : 400,
            'setup':{
                // Distance de frappe de l'arme de CaC
                'range': 4,
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
            'timeAnimation' : 50,
            'setup':{
                'damage' : 3,
                'cadency' : 50,
                'ammos' : {
                    'type' : 'bullet',
                    'meshAmmosName' : 'Balles',
                    'baseAmmos' : 200,
                    'maximum' : 400,
                    'refuel' : 50
                },
                'colorMesh' : new BABYLON.Color3((27/255), (235/255), (37/255))
            }
        },
        {
            'name':'Ezekiel',
            'timeAnimation' : 400,
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
                    'meshAmmosName' : 'Roquettes',
                    // Rapidité de déplacement de la roquette
                    'rocketSpeed' : 2,
                    // Taille de la roquette
                    'rocketSize' : 1,
                    // Rayon de l'explosion
                    'explosionRadius' : 60
                },
                // Couleur du mesh par défault
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
            'timeAnimation' : 1000,
            'setup':{
                'damage' : 80,
                'cadency' : 2000,
                'ammos' : {
                    'type' : 'laser',
                    'meshAmmosName' : 'Energie',
                    'spread' : 1,
                    'baseAmmos' : 5,
                    'maximum' : 15,
                    'refuel' : 5
                },
                'colorMesh' : new BABYLON.Color3((133/255), (39/255), (139/255))
            }
        }
    ];
    this.bonuses=[
        {
            'name': 'mHealth', 
            'message' : 'Gros pack de santé',
            'type':'health',
            'value': 75
        },
        {
            'name':'lHealth',
            'message' : 'Petit pack de santé',
            'type':'health',
            'value': 20
        },
        {
            'name' : 'lArmor',
            'message' : 'Petit pack d\'armure',
            'type':'armor',
            'value': 20
        }
    ];
    
    this.multiKillAnnoucement=["Double Kill", "Multi Kill", "Mega Kill", "ULTRA KILL", "LUDICROUS", "TEETH SHOWER", "INSANE", "DEMONIC", "HAIL THE HELIX", "ASS CRUSHER", "DIVINE", "GENOCIDE","OMFWTFBBQ", "42" , "HOLY SHIT"];
    return 1
};