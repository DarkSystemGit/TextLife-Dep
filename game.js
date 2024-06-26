function rand(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
function load(phaser, assets) {
    assets.forEach(asset => {
        switch (asset[1]) {
            case 'ss':
                phaser.load.spritesheet(asset[0], `assets/${asset[0]}.png`, {
                    frameWidth: 16,
                    frameHeight: 16
                })
            case 'img':
                //console.log(`assets/${asset[0]}.png`)
                phaser.load.image(asset[0], `assets/${asset[0]}.png`)
            case 'map':
                phaser.load.tilemapTiledJSON(asset[0], `assets/maps/${asset[0]}.json`)
            case 'audio':
                phaser.load.audio(asset[0], `assets/audio/${asset[0]}.mp3`)
        }

    });
}



function loadScene(scene) {
    return {
        type: Phaser.WEBGL,
        width: window.innerWidth,
        height: window.innerHeight,
        pixelArt: true,
        parent: "game",
        scene: {
            preload: scene.onStart,
            create: scene.onCreate,
            update: scene.onFrame
        },
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 0 } // Top down game, so no gravity
            }
        }
    }
}
var hiding = false
var attack = false
var preattack=false
var chldcol=false
var win = 0
var children = 0
var fadeTime=0
var pointer = [0, 0]
var hour = [12, 0]
var hattack = rand(50, 10)
var emo = rand(5000, 1000)
var player;
var hKey;
var map;

const main = {
    onStart: function () {

        load(this, [['ambeince', 'audio'],['bully','audio'],['child','audio'], ['main', 'map'], ['citytiles', 'img'], ['ground', 'img'], ['mask', 'img'], ['heartEmote', 'img'], ['chars', 'img'], ['schoolassets', 'img'], ['player', 'ss']])
    },
    onCreate: function () {
        var mus=this.sound.add('ambeince',{volume:.5})
        mus.loop=true
        mus.play()
        map = this.make.tilemap({ key: "main" });
        const sp = map.findObject("data", obj => obj.name === "Spawn Point");
        player = this.player = this.physics.add.sprite(sp.x, sp.y, 'player')
        //player.frame=6
        this.anims.create({
            key: 'walkF',
            frames: this.anims.generateFrameNumbers('player', { frames: [6, 7, 8] }),
            frameRate: 8,
            repeat: -1
        })
        this.anims.create({
            key: 'walkB',
            frames: this.anims.generateFrameNumbers('player', { frames: [3, 4, 5] }),
            frameRate: 8,
            repeat: -1
        })
        this.anims.create({
            key: 'walkL',
            frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 2] }),
            frameRate: 8,
            repeat: -1
        })
        this.anims.create({
            key: 'walkR',
            frames: this.anims.generateFrameNumbers('player', { frames: [9, 10, 11] }),
            frameRate: 8,
            repeat: -1
        })

        map.addTilesetImage("schoolassets", "schoolassets");
        map.addTilesetImage("citytiles", "citytiles");
        map.addTilesetImage("ground", "ground");
        map.addTilesetImage("chars", "chars");
        var grnd = map.createLayer("Ground", ['citytiles', 'schoolassets', 'ground', 'chars'], 0, 0);
        var objs = map.createLayer("Objects", ['citytiles', 'schoolassets', 'ground', 'chars'], 0, 0);
        var coll = map.createLayer("Collision", ['citytiles', 'schoolassets', 'ground', 'chars'], 0, 0);
        var cl = map.createLayer("cleanup", ['citytiles', 'schoolassets', 'ground', 'chars'], 0, 0);
        var cl2 = this.cl2 = map.createLayer("cleanup2", ['citytiles', 'schoolassets', 'ground', 'chars'], 0, 0);

        coll.setCollisionByExclusion([-1])
        cl.setCollisionByProperty({ col: true })
        //cl2.setCollisionByExclusion([-1])
        cl2.setDepth(14)
        coll.setDepth(12)
        objs.setDepth(11)
        grnd.setDepth(9)
        cl.setDepth(10)
        this.physics.add.collider(player, coll);
        this.physics.add.collider(player, cl2);
        //this.physics.add.collider(player, cl);
        const cursors = this.cursors = this.input.keyboard.createCursorKeys();
        const camera = this.cameras.main;
        camera.zoom = 10
        camera.startFollow(player);

        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        const width = this.scale.width
        const height = this.scale.height
        const rt = this.rt = this.make.renderTexture({
            width,
            height
        }, true)
       /* const emotes = this.emotes = this.add.particles('heartEmote').createEmitter( {

            gravityY: 100,
            scale: 1,
            emitting: false
        })
        //emotes.setDepth(14)*/
        // fill it with black
        hKey = this.input.keyboard.addKey('H')
        sKey = this.input.keyboard.addKey(32)
        rt.setDepth(14)
        player.setDepth(13)
        console.log(map)
    },
    onFrame: function (t, delta) {
        var pointer = this.input.mousePointer.positionToCamera(this.cameras.main)
        if (win != 0) { return }
        if (hKey.isDown) hiding = !hiding

        if (sKey.getDuration() > emo) {
            //console.log(sKey)
            var tile = this.cl2.getTileAt(...[map.worldToTileX(pointer.x), map.worldToTileY(pointer.y)])
            console.log(tile)
            if (tile != null) {
                this.sound.add('child').play()
                emo = rand(5000, 1000)
                map.removeTile(tile)
                children++
                var wrd='Children';
                if(7-children==1)wrd='Child'
                document.getElementById('hr').innerText = `${7-children} ${wrd} Left`
                document.getElementById('rtime').innerText=``
                chldcol=true
            }

        }
        document.getElementsByClassName('text')[0].innerText = getTime()

        const speed = 175;
        const prevVelocity = player.body.velocity.clone();

        // Stop any previous movement from the last frame
        player.body.setVelocity(0);

        // Horizontal movement
        if (this.cursors.left.isDown) {
            player.body.setVelocityX(-speed);
            player.anims.play("walkL", true);
        } else if (this.cursors.right.isDown) {
            player.body.setVelocityX(speed);
            player.anims.play("walkR", true);
        } else if (this.cursors.up.isDown) {
            player.body.setVelocityY(-speed);
            player.anims.play("walkF", true);
        } else if (this.cursors.down.isDown) {
            player.body.setVelocityY(speed);
            player.anims.play("walkB", true);
        } else {
            player.anims.stop()
        }

        // Normalize and scale the velocity so that player can't move faster along a diagonal
        player.body.velocity.normalize().scale(speed);
        this.rt.clear();
        this.rt.fill(0x000000, 1)
        this.rt.setTint(0x0a2948)
        if(preattack){
            preattack=false
            this.sound.add('bully',{volume:.5}).play()
        }
        if (!hiding) this.rt.erase('mask', this.player.x - 53, this.player.y - 53)
        if (!hiding && attack) { win = -1; loss() }
        if (hour[0] == 6 && children == 7) { win = 1; winGame() }
        if (hour[0] == 6 && hour[1] == 5 && win == 0) { win = -1; loss() }
        if(hour[1]>55||hour[1]<6){
        document.getElementById('hr').innerText = `${getTime().split(':')[0]} AM`
        document.getElementById('rtime').innerText = `${Math.abs(6 - hour[0])} hours remaining`
        }



    }
}
function getTime() {
    var res = `${hour[0]}:`
    if (hour[0] == 13) {
        hour[0] = 1
    }
    if (hour[1] < 10) {
        res = res + '0'
    }

    if (hour[1] == 0||chldcol) { document.getElementsByClassName('center')[0].style.display = 'block';chldcol=false;fadeTime=hour[1]+5 }
    if (hour[1] == fadeTime) { document.getElementsByClassName('center')[0].style.display = 'none' }
    return res + hour[1]
}
function getDistance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1)
}
setInterval(() => {
    if ((hour[0] >= 6 && hour[1] >= 9 && hour[0] < 12) || (hour[1] > hattack + 3 && win == -1)) {
        document.getElementsByTagName('canvas')[0].remove()
        document.getElementsByClassName('game')[0].remove()
        return
    }
    if (hour[1] == 60) {
        hour[0]++
        hour[1] = 0
        hattack = rand(50, 10)
    } else {
        hour[1]++
    }
    if (hour[1] == hattack-5) {
        preattack=true
    }
    if (hour[1] == hattack) {
        attack = true
    }
    if (hour[1] == hattack + 2) {
        attack = false
    }
    console.log(attack)
}, 1000)

function loss() {

    document.getElementsByTagName('canvas')[0].classList.add('fadeOut')
    document.getElementsByClassName('game')[0].classList.add('fadeOut')
    var txt = document.getElementsByClassName('endGame')[0]
    txt.innerHTML = '  <p>You Failed To Save Them.</p><p>You Shall Now Pay.</p>'
    txt.style.top = '40%'
    txt.style.display = 'block'
    document.getElementsByClassName('restart')[0].style.display = 'block'
}
function winGame() {
    document.getElementsByTagName('canvas')[0].classList.add('fadeOut')
    document.getElementsByClassName('game')[0].classList.add('fadeOut')
    var txt = document.getElementsByClassName('endGame')[0]
    txt.innerHTML = '  <p>You Saved Them.</p><p>He Fled.</p><p>They now may live in peace, due to you.</p><p>Thank You!</p>'
    txt.style.top = '20%'
    txt.style.display = 'block'
    document.getElementsByClassName('restart')[0].style.display = 'block'
}
const game = new Phaser.Game(loadScene(main));