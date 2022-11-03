// title:  2048 (TIC-80 Version)
// author: Spacebit
// desc: I made a game like 2048 with Javascript, have fun
// script: js
var msg = "";
var dir = null;

var field = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

function addNum() {
    var temp = 0;
    var temp2 = 0;
    for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 4; col++) {
            if (field[row][col] === 0)
                temp++;
        }
    }

    var temp = Math.floor(Math.random() * temp);
    for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 4; col++) {
            if (field[row][col] === 0) {
                if (temp === temp2)
                    field[row][col] = 2;
                temp2++;
            }
        }
    }
    if (temp === 0) {
        msg = "Game Over";
    }
}

function shift() {
    var ptr, temp;
    switch (dir) {
        case 'l':
            for (var row = 0; row < 4; row++) {
                ptr = 0;
                temp = 0;
                while (1) {
                    if (temp < 3) {
                        if (field[row][ptr] === 0) {
                            field[row][ptr] = field[row][ptr + 1];
                            field[row][ptr + 1] = 0;
                        }
                        ptr++;
                    } else if (temp < 5) {
                        if (temp === 3) ptr = 0;
                        if (field[row][ptr] === 0) {
                            field[row][ptr] = field[row][ptr + 1];
                            field[row][ptr + 1] = 0;
                        }
                        ptr++;
                    } else {
                        if (field[row][0] === 0) {
                            field[row][0] = field[row][1];
                            field[row][1] = 0;
                        }
                        break;
                    }
                    temp++;
                }
            }
            break;

            //NEXT

        case 'r':
            for (var row = 0; row < 4; row++) {
                ptr = 3;
                temp = 0;
                while (1) {
                    if (temp < 3) {
                        if (field[row][ptr] === 0) {
                            field[row][ptr] = field[row][ptr - 1];
                            field[row][ptr - 1] = 0;
                        }
                        ptr--;
                    } else if (temp < 5) {
                        if (temp === 3) ptr = 3;
                        if (field[row][ptr] === 0) {
                            field[row][ptr] = field[row][ptr - 1];
                            field[row][ptr - 1] = 0;
                        }
                        ptr--;
                    } else {
                        if (field[row][3] === 0) {
                            field[row][3] = field[row][2];
                            field[row][2] = 0;
                        }
                        break;
                    }
                    temp++;
                }
            }
            break;

            //NEXT

        case 'o':
            for (var col = 0; col < 4; col++) {
                ptr = 0;
                temp = 0;
                while (1) {
                    if (temp < 3) {
                        if (field[ptr][col] === 0) {
                            field[ptr][col] = field[ptr + 1][col];
                            field[ptr + 1][col] = 0;
                        }
                        ptr++;
                    } else if (temp < 5) {
                        if (temp === 3) ptr = 0;
                        if (field[ptr][col] === 0) {
                            field[ptr][col] = field[ptr + 1][col];
                            field[ptr + 1][col] = 0;
                        }
                        ptr++;
                    } else {
                        if (field[0][col] === 0) {
                            field[0][col] = field[1][col];
                            field[1][col] = 0;
                        }
                        break;
                    }
                    temp++;
                }
            }
            break;

            //NEXT

        case 'u':
            for (var col = 0; col < 4; col++) {
                ptr = 3;
                temp = 0;
                while (1) {
                    if (temp < 3) {
                        if (field[ptr][col] === 0) {
                            field[ptr][col] = field[ptr - 1][col];
                            field[ptr - 1][col] = 0;
                        }
                        ptr--;
                    } else if (temp < 5) {
                        if (temp === 3) ptr = 3;
                        if (field[ptr][col] === 0) {
                            field[ptr][col] = field[ptr - 1][col];
                            field[ptr - 1][col] = 0;
                        }
                        ptr--;
                    } else {
                        if (field[3][col] === 0) {
                            field[3][col] = field[2][col];
                            field[2][col] = 0;
                        }
                        break;
                    }
                    temp++;
                }
            }
            break;
    }
}

function compare() {
    var ptr, temp;
    switch (dir) {
        case 'l':
            for (var row = 0; row < 4; row++) {
                ptr = 0;
                while (ptr < 3) {
                    if (field[row][ptr] === field[row][ptr + 1]) {
                        field[row][ptr] += field[row][ptr + 1];
                        field[row][ptr + 1] = 0;
                    }
                    ptr++;
                }
            }

            break;
        case 'r':
            for (var row = 0; row < 4; row++) {
                ptr = 3;
                while (ptr > 0) {
                    if (field[row][ptr] === field[row][ptr - 1]) {
                        field[row][ptr] += field[row][ptr - 1];
                        field[row][ptr - 1] = 0;
                    }
                    ptr--;
                }
            }
            break;

        case 'o':
            for (var col = 0; col < 4; col++) {
                ptr = 0;
                while (ptr < 3) {
                    if (field[ptr][col] === field[ptr + 1][col]) {
                        field[ptr][col] += field[ptr + 1][col];
                        field[ptr + 1][col] = 0;
                    }
                    ptr++;
                }
            }

            break;
        case 'u':
            for (var col = 0; col < 4; col++) {
                ptr = 3;
                while (ptr > 0) {
                    if (field[ptr][col] === field[ptr - 1][col]) {
                        field[ptr][col] += field[ptr - 1][col];
                        field[ptr - 1][col] = 0;
                    }
                    ptr--;
                }
            }
            break;
    }
}

function clearField() {
    for (var row = 0; row < 4; row++) {
        for (col = 0; col < 4; col++) {
            field[row][col] = 0;
        }
    }
}

function update() {
    if (dir == null) return;

    shift();
    compare();
    shift();

    addNum();
    draw();
}

function draw() {
    cls();
    //print("Scoore: "+scoore,70,10);
    //print(msg,1,1);
    print("Aim: 2048", 70, 10, 6);
    print("1.0", 1, 130);

    rectb(70, 20, 86, 86, 15);
    var temp = 64;
    for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 4; col++) {
            switch (field[row][col]) {
                case 2:
                    temp = 0;
                    break;
                case 4:
                    temp = 2;
                    break;
                case 8:
                    temp = 4;
                    break;
                case 16:
                    temp = 6;
                    break;
                case 32:
                    temp = 8;
                    break;
                case 64:
                    temp = 10;
                    break;
                case 128:
                    temp = 12;
                    break;
                case 256:
                    temp = 14;
                    break;
                case 512:
                    temp = 32;
                    break;
                case 1024:
                    temp = 34;
                    break;
                case 2048:
                    temp = 36;
                    break;
                case 4096:
                    temp = 38;
                    break;
                case 0:
                    temp = 64;
                    break;
            }
            spr(temp, (col + 1) * 18 + 60, (row + 1) * 18 + 10, 0, 1, 0, 0, 2, 2);
        }
    }
    print("Made by Spacebit", 120, 130);
    spr(256, 220, 120, 0, 1, 0, 0, 2, 2);
}

addNum();
draw();

var counter = 0;

function TIC() {
    dir = null;
    if (counter === 0) {
        if (btn(2)) dir = "l";
        else if (btn(0)) dir = "o";
        else if (btn(3)) dir = "r";
        else if (btn(1)) dir = "u";
        else dir = null;

        if (btn(0) || btn(1) || btn(2) || btn(3))
            counter = 10
    }
    if (counter > 0)
        counter--;
    update();
}