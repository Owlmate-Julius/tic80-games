// title: Curse of Kildren
// author: (Original) gfcarstensen, (Ported by) Spacebit
// desc:   A Zelda like adventure.
// script: js


/********** GLOBAL VARIABLES **********/
const CW = 240, //ClientSize
    CH = 136,

    startX = (CW / 2) - (16 * 8 / 2);

var i,
    mode = 0,
    cursor = 0,
    moveTop,
    moveBottom,
    moveLeft,
    moveRight,

    //MAP
    chunkX = 0,
    chunkY = 0,
    mapX = 0,
    mapY = 0,

    //CURRENT TIME OBJECT
    cT = {},

    bullets = [],
    dieAnim = [],
    teleporter = [],
    manager = [],
    flags = {},
    solid = [4, 5, 8, 9, 10, 13, 14, 16, 289,
        192, 193, 194, 195, 196, 197
    ];

/*********** API FUNCTIONS ************/

function rnd() {
    return Math.random()
}

function flr(v) {
    return Math.floor(v)
}

function rndF(v) {
    var v = v || 0;
    return Math.floor(Math.random() * v);
}

/************ GAME OBJECTS ************/

//The player class
var p = {
    x: 0,
    y: 0,
    w: 6,
    h: 6,
    maxHp: 2,
    hp: 2,
    dmg: 1,
    moveSpeed: 1,
    shield: 0,
    sword: 0,
    coins: 0,
    keys: 0,
    potions: [1, 0, 0, 0, 0, 0, 0, 0],
    isAttacking: false,
    isMoving: false,
    attackable: true,
    hitable: true,
    dir: "b",

    spritePointer: 0,

    init: function() {
        this.movePx = this.moveSpeed / 2;
        //TIMERS
        cT.p = {};
        cT.p.a = 0;
        cT.p.s = 0;
        cT.p.h = 0;
    },

    collectPotion: function(type) {
        var tmp = 0;
        while (tmp < 8 && (this.potions[tmp] != 0)) {
            tmp++;
        }
        if (tmp < 8) {
            switch (type) {
                case "potionRed":
                    this.potions[tmp] = 1;
                    break;
                case "potionBlue":
                    this.potions[tmp] = 2;
                    break
            }
        }
    },

    hit: function(dir) {
        if (this.hitable)
            if (time() >= cT.p.h) {
                cT.p.h = time() + 1000;
                this.hp--;
                var d = {
                    "t": "b",
                    "b": "t",
                    "l": "r",
                    "r": "l"
                };
                throwback(this, d[dir], 6);
            }
    },

    attack: function() {
        for (i = 0; i < entities[chunkY][chunkX].length; i++) {
            if (entities[chunkY][chunkX][i].alive && entities[chunkY][chunkX][i].hitable) {
                tmp = {
                    x: entities[chunkY][chunkX][i].x + 8,
                    y: entities[chunkY][chunkX][i].y + 8,
                    w: entities[chunkY][chunkX][i].w,
                    h: entities[chunkY][chunkX][i].h
                };
                tmp2 = {
                    w: p.w,
                    h: p.h
                };
                switch (p.dir) {
                    case "b":
                        tmp2.x = p.x;
                        tmp2.y = p.y + 6;
                        break;
                    case "t":
                        tmp2.x = p.x;
                        tmp2.y = p.y - 6;
                        break;
                    case "r":
                        tmp2.x = p.x + 6;
                        tmp2.y = p.y;
                        break;
                    case "l":
                        tmp2.x = p.x - 6;
                        tmp2.y = p.y;
                        break;
                }
                var dir = isCollide(tmp2, tmp);
                if (dir && this.attackable) {
                    entities[chunkY][chunkX][i].hit(this.dmg, p.dir);
                }
            }
        }
    },

    setDirection: function() {
        if (moveTop) p.dir = "t";
        else if (moveBottom) p.dir = "b";
        else if (moveLeft) p.dir = "l";
        else if (moveRight) p.dir = "r"
    },

    move: function() {
        switch (p.dir) {
            case "t":
                this.y -= this.movePx;
                break;
            case "b":
                this.y += this.movePx;
                break;
            case "l":
                this.x -= this.movePx;
                break;
            case "r":
                this.x += this.movePx;
                break;
        }
    },

    update: function() {
        //CHECK IF MOVING
        if (moveTop || moveBottom || moveLeft || moveRight) p.isMoving = true;
        else p.isMoving = false;

        //SET DIRECTION
        if (!p.isAttacking)
            p.setDirection();

        //MOVING
        if (p.isMoving && !p.isAttacking)
            p.move();

        //CHECK COLLISION
        checkChunkCollision(p);

        //ANIMATE
        if (p.isMoving)
            if (time() >= cT.p.s) {
                cT.p.s = time() + 200;
                this.spritePointer ^= 1;
            }

        //UPDATE ATTACKING
        if (time() >= cT.p.a) p.isAttacking = false;
    },

    draw: function() {
        //DRAW SPRITE
        if (!p.isAttacking)
            switch (p.dir) {
                case "t":
                    spr(386 + this.spritePointer, p.x, p.y, 1, 1, 0, 0, 1);
                    break;
                case "b":
                    spr(384 + this.spritePointer, p.x, p.y, 1, 1, 0, 0, 1);
                    break;
                case "l":
                    spr(390 + this.spritePointer, p.x, p.y, 1, 1, 0, 0, 1);
                    break;
                case "r":
                    spr(388 + this.spritePointer, p.x, p.y, 1, 1, 0, 0, 1);
                    break;
            }
        else { //IF ATTACKING
            if (p.isAttacking)
                switch (p.dir) {
                    case "t":
                        spr(398, p.x, p.y, 1, 1, 0, 0, 1);
                        spr(399, p.x, p.y - 8, 1, 1, 0, 0, 1);
                        break;
                    case "b":
                        spr(396, p.x, p.y, 1, 1, 0, 0, 1);
                        spr(397, p.x, p.y + 8, 1, 1, 0, 0, 1);
                        break;
                    case "l":
                        spr(394, p.x, p.y, 1, 1, 0, 0, 1);
                        spr(395, p.x - 8, p.y, 1, 1, 0, 0, 1);
                        break;
                    case "r":
                        spr(392, p.x, p.y, 1, 1, 0, 0, 1);
                        spr(393, p.x + 8, p.y, 1, 1, 0, 0, 1);
                        break;
                }
        }
    }
};

/************* SECTION ****************/

var section = {
    overworld: {
        row: 0,
        col: 0,
        rows: 5,
        cols: 7,
        spawner: [],
        entities: []
    },
    shop: {
        row: 0,
        col: 7,
        rows: 5,
        cols: 1,
        spawner: [],
        entities: []
    },
    dungeon1: {
        row: 0,
        col: 8,
        rows: 4,
        cols: 6,
        spawner: [],
        entities: []
    }
}

/************ TELEPORTER **************/

//OVERWORLD-SHOP
teleporter.push({
    id: 1,
    mapX: 0,
    mapY: 0,
    dir: "b"
});
teleporter.push({
    id: 1,
    mapX: 7,
    mapY: 0,
    dir: "t"
});
teleporter.push({
    id: 2,
    mapX: 0,
    mapY: 3,
    dir: "l"
});
teleporter.push({
    id: 2,
    mapX: 8,
    mapY: 3,
    dir: "t"
});

/************* ENTITIES ***************/

cT.E = {};
//THE ENTITY CONSTRUCTOR
function Entity(tileId, x, y, w, h, hp, drops) {
    this.id = Entity.prototype.counter++;
    this.tileId = tileId;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.hp = hp;
    this.alive = true;
    this.visible = true;
    this.collideable = true;
    this.hitable = true;
    this.attackable = false;
    this.drops = drops || "coins";
};
Entity.prototype.counter = 0;
Entity.prototype.spritePointer = 0;
Entity.prototype.draw = function() {
    spr(this.tileId + this.spritePointer, this.x, this.y, 1, 1, 0, 0, 1);
}
Entity.prototype.hit = function() {
    this.hp--;
    if (this.hp <= 0) {
        this.alive = false;
        this.visible = false;
        this.drop(this.drops);
    }
}
Entity.prototype.drop = function(type) {
    var _items = items[chunkY][chunkX],
        _x = 0,
        _y = 0;
    switch (type) {
        case "coins":
            var _more = 0;
            if (!(this instanceof Enemy)) _more = 1;
            var _lot = rndF(3) + _more;
            for (i = 0; i < _lot; i++) {

                _x = this.x + (rndF(9) - 4);
                _y = this.y + (rndF(9) - 4);
                if (rndF(4) === 0)
                    _items.push({
                        type: "coin5",
                        x: _x,
                        y: _y
                    });
                else
                    _items.push({
                        type: "coin1",
                        x: _x,
                        y: _y
                    });

            }
            break;
        case "potionRed":
        case "potionBlue":
        case "key":
            this.drop("coins");
            _x = this.x + (rndF(7) - 3);
            _y = this.y + (rndF(7) - 3);
            _items.push({
                type: type,
                x: _x,
                y: _y
            });
            break;
        case "hearth":
            _items.push({
                type: type,
                x: this.x + 3,
                y: this.y + 3
            });
            break;
    }
}
Entity.prototype.update = function() {}

function Enemy(id, x, y, w, h, hp, speed) {
    Entity.call(this, id, x, y, w, h, hp);
    this.speed = speed;
    this.attackable = true;
}
Enemy.prototype = Object.create(Entity.prototype);

cT.E.a = {
    undefined: 0
};
Enemy.prototype.animate = function() {
    if (time() >= cT.E.a[this.id]) {
        cT.E.a[this.id] = time() + 200;
        this.spritePointer ^= 1;
    }
}
Enemy.prototype.hit = function(dmg, dir) {
    this.hp -= dmg;
    throwback(this, dir, 5);
    if (this.hp <= 0) {
        this.alive = false
        this.visible = false;
        dieAnim.push(this);
        this.drop(this.drops);
    }
}

Enemy.prototype.changeDir = function() {
    var dir = rndF(4);
    this.moveDirection = this.dirTable[dir];
}

Enemy.prototype.initShoot = function(mS) {
    this.shootDirection = "b";
    this.shootSpeed = 1;
    this.shootDuration = 60;
    this.multiShoot = mS || false;
}
Enemy.prototype.shoot = function() {
    if (!this.multiShoot) {
        var x, y;
        switch (this.shootDirection) {
            case "t":
                x = 0;
                y = -6;
                break;
            case "b":
                x = 0;
                y = 6;
                break;
            case "l":
                x = -6;
                y = 0;
                break;
            case "r":
                x = 6;
                y = 0;
                break;
        }
        bullets.push({
            shootDirection: this.shootDirection,
            x: this.x + x,
            y: this.y + y,
            shootDuration: this.shootDuration,
            shootSpeed: this.shootSpeed
        });
    } else {
        bullets.push({
            shootDirection: "t",
            x: this.x,
            y: this.y,
            shootDuration: this.shootDuration,
            shootSpeed: this.shootSpeed
        }, {
            shootDirection: "b",
            x: this.x,
            y: this.y,
            shootDuration: this.shootDuration,
            shootSpeed: this.shootSpeed
        }, {
            shootDirection: "l",
            x: this.x,
            y: this.y,
            shootDuration: this.shootDuration,
            shootSpeed: this.shootSpeed
        }, {
            shootDirection: "r",
            x: this.x,
            y: this.y,
            shootDuration: this.shootDuration,
            shootSpeed: this.shootSpeed
        });
    }
}

Enemy.prototype.initMove = function() {
    this.moveSpeed = this.speed;
    this.movePx = this.speed / 2;
    this.moveDirection = "r";
    cT.E.m[this.id] = 0;
}
cT.E.m = {
    undefined: 0
};
Enemy.prototype.dirTable = {
    0: "t",
    1: "b",
    2: "l",
    3: "r"
};
Enemy.prototype.move = function() {
    if (time() >= cT.E.m[this.id]) {
        cT.E.m[this.id] = time() + rndF(400) + 300;
        var dir = rndF(4);
        this.moveDirection = this.dirTable[dir];
    }
    //MOVING OBJECT
    switch (this.moveDirection) {
        case "t":
            this.y -= this.movePx;
            break;
        case "b":
            this.y += this.movePx;
            break;
        case "l":
            this.x -= this.movePx;
            break;
        case "r":
            this.x += this.movePx;
            break;
    }
}
/******** OBJECTS CONSTRUCTOR *********/

function Vase(type, x, y) {
    Entity.call(this, 289, x, y, 6, 6, 2);
    this.collideable = true;
    if (type === 1)
        this.drops = "potionRed";
    else if (type === 2)
        this.drops = "potionBlue";
    else if (type === 3)
        this.drops = "key";
}
Vase.prototype = Object.create(Entity.prototype);

function Chest(x, y) {
    Entity.call(this, 288, x, y, 6, 6, 1);
    this.collideable = true;
    this.drops = "hearth";
}
Chest.prototype = Object.create(Entity.prototype);
Chest.prototype.hit = function() {
    if (p.keys > 0) {
        p.keys--;
        this.alive = false;
        this.tileId = 290;
        this.drop(this.drops);
    }
}

function Teleporter(x, y) {
    Entity.call(this, 55, x, y, 6, 6);
    this.hitable = false;
    this.collideable = false;
}
Teleporter.prototype = Object.create(Entity.prototype);
Teleporter.prototype.update = function() {
    var dir = isCollide(p, {
        x: this.x + 8,
        y: this.y + 8,
        w: 6,
        h: 6
    });
    if (dir) {
        teleport();
    }
}

/************ SHOP ITEMS **************/

function PotionRed(x, y) {
    Entity.call(this, 320, x, y, 6, 6);
    this.hitable = false;
    this.collideable = false;
}
PotionRed.prototype = Object.create(Entity.prototype);
PotionRed.prototype.update = function() {
    var dir = isCollide(p, {
        x: this.x + 8,
        y: this.y + 8,
        w: 6,
        h: 6
    });
    if (dir) {
        if (p.coins >= 30) {
            p.coins -= 30;
            this.alive = false;
            this.visible = false;
            p.collectPotion("potionRed");
        }
    }
}
PotionRed.prototype.draw = function() {
    spr(this.tileId + this.spritePointer, this.x, this.y, 1, 1, 0, 0, 1);
    print("30 Coins", this.x - 16, this.y - 30, 15);
}


/******** ENEMIES CONSTRUCTOR *********/

function Spider(x, y, hp, speed) {
    Enemy.call(this, 274, x, y, 6, 6, hp, speed);
    this.initMove();
    cT.E.a[this.id] = 0;
}
Spider.prototype = Object.create(Enemy.prototype);
Spider.prototype.update = function() {
    this.move();
    checkChunkCollision(this);
    checkBoundsCollision(this);
}

function Digger(spawner, type, hp, speed) {
    Enemy.call(this, 272, spawner.x, spawner.y, 6, 6, hp, speed);
    if (type == 1)
        this.initShoot(true);
    else if (type == 2)
        this.initShoot(false);
    this.spawner = spawner;
    this.state = 0;
    this.stateCounter = 0;
}
Digger.prototype = Object.create(Enemy.prototype);
Digger.prototype.animate = function() {}
Digger.prototype.update = function() {
    switch (this.state) {
        case 0:
            if (this.stateCounter <= 0) {
                this.stateCounter = 20 * (1 / this.speed);
                this.attackable = false;
                this.hitable = false;
                this.visible = false;
            } else {
                this.stateCounter--;
                if (this.stateCounter <= 0)
                    this.state++;
            }
            break;
        case 1:
            if (this.stateCounter <= 0) {
                this.stateCounter = (rndF(60) + 60) * (1 / this.speed);
                this.hitable = true;
                this.visible = true;
                this.spritePointer = 0;
            } else {
                this.stateCounter--;
                if (this.stateCounter <= 0)
                    this.state++;
            }
            break;
        case 2:
            if (this.stateCounter <= 0) {
                this.stateCounter = (rndF(120) + 60) * (1 / this.speed);
                this.attackable = true;
                if (this.hasOwnProperty("multiShoot"))
                    this.shoot();
                this.spritePointer = 1;
            } else {
                this.stateCounter--;
                if (this.stateCounter <= 0)
                    this.state = 0;
            }
            break;
    }
}

//bird,slime,ghost,diver

/******** GAME WORLD OBJECTS **********/

var chunk;
var spawner;
var entities;
var items;

/************ MAP FUNCTIONS ***********/

function loadChunk(x, y) {
    chunk = [];
    for (var row = 0; row < 12; row++) {
        chunk[row] = [];
        for (var col = 0; col < 16; col++) {
            var tileId = mget(16 * x + col, 12 * y + row);
            if (tileId < 48)
                chunk[row][col] = tileId;
            else if (tileId === 69)
                chunk[row][col] = 16;
            else if (tileId >= 192)
                chunk[row][col] = tileId;
            else if (tileId >= 112)
                chunk[row][col] = 198;
            else if (tileId >= 48)
                chunk[row][col] = 12;
        }
    }
    return 0;
}

//TODO SPAWNER
function initEntities() {
    for (var _s in section) {
        var s = section[_s];
        //LOOP CHUNKS && INIT CONTAINER
        for (var y = 0; y < s.rows; y++) {
            s.entities[y] = [];
            s.spawner[y] = [];
            for (var x = 0; x < s.cols; x++) {
                s.entities[y][x] = [];
                s.spawner[y][x] = {
                    digger: []
                };

                //LOOP TILES
                for (var row = 0; row < 12; row++) {
                    for (var col = 0; col < 16; col++) {

                        //CHECK IF NEEDED
                        var tileId = mget((s.col * 16) + x * 16 + col, (s.row * 12) + y * 12 + row);
                        switch (tileId) {
                            case 64:
                            case 65:
                            case 66: //DIGGER
                                s.spawner[y][x]["digger"].push({
                                    x: col * 8 + startX,
                                    y: row * 8 + 32,
                                    occupied: true
                                });
                                s.entities[y][x].push(new Digger(s.spawner[y][x]["digger"][s.spawner[y][x]["digger"].length - 1], tileId - 64, 2, 1));
                                break;
                            case 67: //SPIDER
                                s.entities[y][x].push(new Spider(col * 8 + startX, row * 8 + 32, 2, 1));
                                break;

                                //VASE
                            case 48:
                            case 49:
                            case 50:
                            case 51:
                                s.entities[y][x].push(new Vase(tileId - 48, col * 8 + startX, row * 8 + 32));
                                break;
                            case 52:
                                s.entities[y][x].push(new Chest(col * 8 + startX, row * 8 + 32));
                                break;
                                //TELEPORTER
                            case 55:
                                s.entities[y][x].push(new Teleporter(col * 8 + startX, row * 8 + 32));
                                break;
                                //RED POTION
                            case 112:
                                s.entities[y][x].push(new PotionRed(col * 8 + startX, row * 8 + 32));
                                break;
                        }
                    }
                }
            }
        }
    }
    spawner = section.overworld.spawner;
    entities = section.overworld.entities;
}

function initItems() {
    items = [];
    for (var row = 0; row < 8; row++) {
        items[row] = [];
        for (var col = 0; col < 8; col++) {
            items[row][col] = [];
        }
    }
}

/********* COLLISION DETECTION ********/

function isCollide(r1, r2) {
    var collisionSide = "";
    var vx = r1.x + 4 - r2.x + 4;
    var vy = r1.y + 4 - r2.y + 4;
    var combinedHalfWidths = r1.w / 2 + r2.w / 2;
    var combinedHalfHeights = r1.h / 2 + r2.h / 2;
    if (Math.abs(vx) < combinedHalfWidths) {
        if (Math.abs(vy) < combinedHalfHeights) {
            var overlapX = combinedHalfWidths - Math.abs(vx);
            var overlapY = combinedHalfHeights - Math.abs(vy);
            if (overlapX >= overlapY) {
                if (vy > 0) {
                    collisionSide = "t";
                } else {
                    collisionSide = "b";
                }
            } else {
                if (vx > 0) {
                    collisionSide = "l";
                } else {
                    collisionSide = "r";
                }
            }
        } else {
            collisionSide = 0;
        }
    } else {
        collisionSide = 0;
    }
    return collisionSide;
}

var solids = {
    undefined: false
}
for (i = 0; i < solid.length; i++) {
    solids[solid[i]] = true;
}

//TODO
function checkChunkCollision(e1) {
    var _table = {
        "t": "b",
        "b": "t",
        "l": "r",
        "r": "l"
    };
    for (var row = 0; row < 12; row++) {
        for (var col = 0; col < 16; col++) {
            if (solids[chunk[row][col]]) {
                var dir = isCollide(e1, {
                    x: col * 8 + startX + 8,
                    y: row * 8 + 40,
                    w: 6,
                    h: 6
                })
                throwback(e1, _table[dir], e1.movePx);
                if (dir && e1 instanceof Enemy)
                    e1.changeDir();
            }
        }
    }
}

function throwback(e1, dir, val) {
    if (dir)
        switch (dir) {
            case "t":
                e1.y -= val;
                break;
            case "b":
                e1.y += val;
                break;
            case "r":
                e1.x += val;
                break;
            case "l":
                e1.x -= val;
                break;
        }
}

//TODO
function checkBulletsCollision(e1) {
    for (i = 0; i < bullets.length; i++) {
        var dir = isCollide(e1, {
            x: bullets[i].x + 8,
            y: bullets[i].y + 8,
            w: 4,
            h: 4
        });
        if (dir)
            e1.hit(dir);
    }
}

function checkBoundsCollision(e1) {
    //LEFT BOUND
    if (e1.x < startX) {
        e1.x += e1.movePx;
    }
    //RIGHT BOUND
    else if (e1.x > startX + 15 * 8) {
        e1.x -= e1.movePx;
    }
    //TOP BOUND
    else if (e1.y < 38) {
        e1.y += e1.movePx;
    }
    //BOTTOM BOUND
    else if (e1.y > 34 + 8 * 11) {
        e1.y -= e1.movePx;
    }
}

function checkEntitiesCollision(e1) {
    var _table = {
        "t": "b",
        "b": "t",
        "l": "r",
        "r": "l"
    };
    for (i = 0; i < entities[chunkY][chunkX].length; i++) {
        if (entities[chunkY][chunkX][i].alive && entities[chunkY][chunkX][i].collideable) {
            var tmp = {
                x: entities[chunkY][chunkX][i].x + 8,
                y: entities[chunkY][chunkX][i].y + 8,
                w: entities[chunkY][chunkX][i].w,
                h: entities[chunkY][chunkX][i].h
            };
            var dir = isCollide(e1, tmp)
            if (dir) {
                if (entities[chunkY][chunkX][i].attackable)
                    e1.hit(dir);
                else
                    throwback(e1, _table[dir], e1.movePx);
            }
        }
    }
}

cT.i = 0

function checkItemsCollision() {
    if (time() >= cT.i) {
        cT.i = time() + 100;

        var _items = items[chunkY][chunkX];

        for (i = 0; i < _items.length; i++) {
            var dir = isCollide(p, {
                x: _items[i].x + 8,
                y: _items[i].y + 7,
                w: 4,
                h: 4
            });
            if (dir) {

                switch (_items[i].type) {
                    case "coin1":
                        p.coins++;
                        break;
                    case "coin5":
                        p.coins += 5;
                        break;
                    case "potionRed":
                    case "potionBlue":
                        p.collectPotion(_items[i].type);
                        break;
                    case "key":
                        p.keys++;
                        break;
                    case "hearth":
                        p.maxHp++;
                        p.hp++;
                        break;
                }

                _items.splice(i, 1);
                i--;
            }
        }
    }
}

/********** UPDATE ENTITIES ***********/

function updateEntities() {
    var _entities = entities[chunkY][chunkX];
    for (i = 0; i < _entities.length; i++) {
        if (_entities[i].alive) {

            //update
            if (_entities[i].update)
                _entities[i].update();

            //CHANGE SPRITE
            if (_entities[i] instanceof Enemy) {
                _entities[i].animate();
            }
        }
    }
}

/*********** UPDATE BULLETS ***********/

var bulletSprPtr = 0;

function updateBullets() {
    if (time() >= cT.b) {
        cT.b = time() + 20;
        bulletSprPtr ^= 1;
    }
    var tmp = [];
    for (i = 0; i < bullets.length; i++) {
        if (bullets[i].shootDuration != 0) {
            bullets[i].shootDuration--;
            switch (bullets[i].shootDirection) {
                case "t":
                    bullets[i].y -= bullets[i].shootSpeed;
                    break;
                case "b":
                    bullets[i].y += bullets[i].shootSpeed;
                    break;
                case "l":
                    bullets[i].x -= bullets[i].shootSpeed;
                    break;
                case "r":
                    bullets[i].x += bullets[i].shootSpeed;
                    break;
            }
            tmp.push(bullets[i]);
        }
    }
    bullets = tmp;
}

dieAnim = [];

function drawDieAnim() {
    for (i = 0; i < dieAnim.length; i++) {
        if (!cT.dA[i]) {
            cT.dA[i] = time() + 300
        }

        if (cT.dA[i] <= time() + 50)
            spr(405, dieAnim[i].x, dieAnim[i].y, 1, 1, 0, 0, 1);
        else if (cT.dA[i] <= time() + 100)
            spr(404, dieAnim[i].x, dieAnim[i].y, 1, 1, 0, 0, 1);
        else if (cT.dA[i] <= time() + 200)
            spr(403, dieAnim[i].x, dieAnim[i].y, 1, 1, 0, 0, 1);
        else
            spr(402, dieAnim[i].x, dieAnim[i].y, 1, 1, 0, 0, 1);



        if (time() >= cT.dA[i]) {
            cT.dA.shift();
            dieAnim.shift();
            if (i > 0)
                i--;
        }
    }
}

/********** CALL TELEPORTER ***********/

function teleport() {
    var _t = teleporter,
        _id = 0,
        _index = 0;
    for (i = 0; i < _t.length; i++) {
        if (_t[i].mapX === mapX && _t[i].mapY === mapY)
            _index = i;
    }
    _id = _t[_index].id;
    for (i = 0; i < _t.length; i++) {
        if (_t[i].id == _id) {
            if (i !== _index) {
                changeArea(teleporter[i]);
                var pos = getTelPos();
                p.x = pos.x;
                p.y = pos.y;
                throwback(p, _t[i].dir, 8);
            }
        }
    }
}

//TODO
function getTelPos() {
    var _e = entities[chunkY][chunkX];
    for (i = 0; i < _e.length; i++) {
        if (_e[i] instanceof Teleporter) {
            return {
                x: _e[i].x,
                y: _e[i].y
            };
        }
    }
    return {
        x: p.x,
        y: p.y
    };
}

function changeArea(telObj) {
    var toMapY = telObj.mapY,
        toMapX = telObj.mapX;

    //DETECT RIGHT AREA TO LOAD
    for (var k in section) {
        var area = section[k];
        //DETECT SECTION
        if (toMapY >= area.row &&
            toMapY <= (area.row + area.rows) &&
            toMapX >= area.col &&
            toMapX <= (area.col + area.cols)) {
            //CHANGE VALUES
            mapY = toMapY;
            mapX = toMapX;
            spawner = area.spawner;
            entities = area.entities;
            //CALCULATE CHUNK VALUES
            chunkY = mapY - area.row;
            chunkX = mapX - area.col;
            //LOAD CHUNK
            loadChunk(mapX, mapY);
        }
    }
}

/*********** DRAW FUNCTIONS ***********/

function drawGUI() {
    //Worldname
    print("Overworld", startX + 8, 0);
    print("-LIFE-", startX + 80, 0, 6);
    //Potions
    for (i = 0; i < p.potions.length; i++) {
        if (p.potions[i] > 0)
            spr(319 + p.potions[i], i * 6 + startX, 8, 1, 1, 0, 0, 1);
    }
    if (mode === 1)
        rectb(startX + cursor * 6, 8, 7, 8, 15);
    //HP
    for (i = 0; i < p.maxHp; i++) {
        spr(369, i * 6 + startX + 68, 8, 1, 1, 0, 0, 1);
    }
    for (i = 0; i < p.hp; i++) {
        spr(368, i * 6 + startX + 68, 8, 1, 1, 0, 0, 1);
    }
    //Money
    spr(354, startX, 16, 1, 1, 0, 0, 1);
    print(p.coins, startX + 8, 17, 7);
    //Keys
    spr(322, startX + 40, 16, 1, 1, 0, 0, 1);
    print(p.keys, startX + 48, 17, 7);
    //Shield
    if (p.shield === 0)
        spr(265, startX + 80, 16, 1, 1, 0, 0, 1);
    else if (p.shield === 1)
        spr(266, startX + 80, 16, 1, 1, 0, 0, 1);
    //Sword
    if (p.sword === 0)
        spr(267, startX + 86, 16, 1, 1, 0, 0, 1);
    else if (p.sword === 1)
        spr(268, startX + 86, 16, 1, 1, 0, 0, 1);
    else if (p.sword === 2)
        spr(269, startX + 86, 16, 1, 1, 0, 0, 1);
}

function drawChunk() {
    for (var row = 0; row < 12; row++) {
        for (var col = 0; col < 16; col++) {
            spr(chunk[row][col], col * 8 + startX, row * 8 + 8 * 4, 0, 1, 0, 0, 1);
        }
    }
}

function drawEntities() {
    for (i = 0; i < entities[chunkY][chunkX].length; i++) {
        if (entities[chunkY][chunkX][i].visible)
            entities[chunkY][chunkX][i].draw();
    }
}

function drawBullets() {
    for (i = 0; i < bullets.length; i++) {
        spr(400 + bulletSprPtr, bullets[i].x, bullets[i].y, 1, 1, 0, 0, 1);
    }
}

function drawItems() {
    var _items = items[chunkY][chunkX],
        _len = _items.length,
        _id = 0,
        _table = {
            undefined: 0,
            coin1: 352,
            coin5: 353,
            potionRed: 320,
            potionBlue: 321,
            key: 322,
            hearth: 368
        };

    for (i = 0; i < _len; i++) {
        _id = _table[_items[i].type];
        spr(_id, _items[i].x, _items[i].y, 1, 1, 0, 0, 1);
    }
}

/*************** INIT *****************/

init();

function init() {
    p.init();
    p.x = startX + 8 * 3;
    p.y = 32 + 8 * 3;

    //TIMER
    cT.b = 0;
    cT.dA = [];
    cT.m = 0;

    loadChunk(mapX, mapY);

    //INITS
    initEntities();
    initItems();
}

/**************************************/

function TIC() {
    if (mode === 0) {
        //KEY HANDLER
        if (btn(0)) {
            moveTop = true
        }
        if (btn(1)) {
            moveBottom = true
        }
        if (btn(2)) {
            moveLeft = true
        }
        if (btn(3)) {
            moveRight = true
        }

        //ATTACKING
        if (btn(5)) {
            if (time() >= cT.p.a + 100) {
                cT.p.a = time() + 200;
                p.attack();
                p.isAttacking = true;
            }
        }
        //MENU
        if (btn(4) && time() >= cT.m) {
            mode = 1;
            cT.m = time() + 200;
            moveTop = false;
            moveBottom = false;
            moveLeft = false;
            moveRight = false;
        }

        if (!btn(0)) {
            moveTop = false
        }
        if (!btn(1)) {
            moveBottom = false
        }
        if (!btn(2)) {
            moveLeft = false
        }
        if (!btn(3)) {
            moveRight = false
        }
    } else if (mode === 1) {
        if (time() >= cT.m) {
            if (btn(2) && cursor > 0) {
                cT.m = time() + 100;
                cursor--;
            }
            if (btn(3) && cursor < 7) {
                cT.m = time() + 100;
                cursor++;
            }
        }
        //DRINK POTION
        if (btn(5)) {
            if (p.potions[cursor] && p.hp < p.maxHp) {
                if (p.potions[cursor] === 1)
                    p.hp += 2;
                else
                    p.hp += 8;
                if (p.hp > p.maxHp) p.hp = p.maxHp;
                p.potions[cursor] = 0;
            }

            cT.p.a = time() + 100;
            cT.m = time() + 200;
            mode = 0;
            cursor = 0;
        }

        //BACK TO GAME
        if (btn(4) && time() >= cT.m) {
            cT.m = time() + 200;
            mode = 0;
            cursor = 0;
        }
    }

    //TODO SCROLL CHUNK
    if (p.y >= 120) {
        chunkY++;
        mapY++;
        loadChunk(mapX, mapY);
        bullets = [];
        p.y = 32;
    } else if (p.y <= 30) {
        chunkY--;
        mapY--;
        loadChunk(mapX, mapY);
        bullets = [];
        p.y = 119;
    } else if (p.x + 8 >= startX + 8 * 16) {
        chunkX++;
        mapX++;
        loadChunk(mapX, mapY);
        bullets = [];
        p.x = startX;
    } else if (p.x <= startX - 1) {
        chunkX--;
        mapX--;
        loadChunk(mapX, mapY);
        bullets = [];
        p.x = startX + 8 * 15 - 2;
    }

    //UPDATE
    if (p.hp <= 0) {
        p.hp = p.maxHp;
        p.x = startX + 8 * 3;
        p.y = 32 + 8 * 3;
        if (p.coins > 10) p.coins = flr(p.coins * 0.7);
        chunkX = 0;
        chunkY = 0;
        mapX = 0;
        mapY = 0;
        loadChunk(mapX, mapY);
        bullets = [];
        enemies = section.overworld.enemies;
        spawner = section.overworld.spawner;
    }
    p.update();
    updateBullets(); //CHECK BULLET COLLISION
    updateEntities();
    checkEntitiesCollision(p);
    checkBulletsCollision(p);
    checkItemsCollision();

    //DRAW
    cls();
    drawGUI();
    drawChunk();
    drawEntities();
    p.draw();
    drawBullets();
    drawDieAnim();
    drawItems();

    print(manager.join(","), 0, 0, 3);
}