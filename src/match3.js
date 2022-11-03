// title:  Match3
// author: SpaceBit
// desc:   Still in dev
// script: js
const clientW = 240,
    clientH = 136,
    dias = 5; //Amount of the Diamonds

var cursorX = 3,
    cursorY = 3,
    mode = 0,
    pause = 0,
    scoore = 0;

var console = {
    data: [],
    log: function(txt) {
        if (typeof txt === "number")
            txt = txt.toString();
        this.data.push(txt);
    },
    out: function(y) {
        var output = this.data.toString();
        print(output, 0, y);
    }
}

function createField(len, val) {
    var field = [];
    var row, col, tmp = 0;
    for (row = 0; row < len; row++) {
        field[row] = [];
        for (col = 0; col < len; col++) {
            tmp = Math.floor(Math.random() * val);
            field[row][col] = tmp;
        }
    }
    return field;
}

function checkField() {}

function swap(fieldC, row, col, dir) {
    var row2, col2,
        fieldCopy = JSON.parse(JSON.stringify(fieldC));
    //get second position
    switch (dir) {
        case 't':
            row2 = row - 1;
            col2 = col;
            break;
        case 'b':
            row2 = row + 1;
            col2 = col;
            break;
        case 'l':
            row2 = row;
            col2 = col - 1;
            break;
        case 'r':
            row2 = row;
            col2 = col + 1;
    }
    //swap
    var tmp = fieldCopy[row][col];
    fieldCopy[row][col] = fieldCopy[row2][col2];
    fieldCopy[row2][col2] = tmp;

    //if checkSection -> true
    var marked = [];
    tmp = 0;
    tmp = checkSection(fieldCopy, row, col);
    if (tmp)
        marked = marked.concat(tmp);
    tmp = checkSection(fieldCopy, row2, col2);
    if (tmp)
        marked = marked.concat(tmp);

    //if marked == 0 -> swap back & return
    if (!marked[0]) {
        return;
    }
    //if marked
    else {
        //shift
        fieldCopy = replace(fieldCopy, marked, -1);
        fieldCopy = shift(fieldCopy, -1, dias);

        //sum scoore
        switch (marked.length) {
            case 3:
                scoore += 3;
                break;
            case 4:
                scoore += 4;
                break;
            case 5:
                scoore += 6;
                break;
            case 6:
            case 7:
            case 8:
            case 9:
                scoore += 9;
        }

        return fieldCopy;
    }
}

//TODO !sometimes not working
function checkSection(fieldC, row, col) {
    var tmp = [],
        marked = [],
        counter = 0;
    var fieldCopy = JSON.parse(JSON.stringify(fieldC)),
        num = fieldCopy[row][col];
    //checkRows
    for (var i = 0; i < 5; i++) {
        //avoid 'Out of Bounds' error
        if ((row > 1) || (i > 1))
            if ((row < fieldCopy.length - 2) || (i < 3))

                if (fieldCopy[row + i - 2][col] === num) {
                    counter++;
                    if (counter < 4) tmp.push([row + i - 2, col]);
                    switch (counter) {
                        case 3:
                            marked = tmp;
                            break;
                        case 4:
                            marked.push([row + i - 2, col]);
                            break;
                        case 5:
                            marked.push([row + i - 2, col]);
                    }
                }
        else {
            counter = 0;
            tmp = [];
        }
    }
    counter = 0;
    tmp = []; //reset 
    //checkCols
    for (var i = 0; i < 5; i++) {
        if (fieldCopy[row][col + i - 2] === num) {
            counter++;
            if (counter < 4) tmp.push([row, col + i - 2]);
            switch (counter) {
                case 3:
                    if (marked[0]) {
                        if (i === 2) {
                            marked.push([row, col - 2]);
                            marked.push([row, col - 1]);
                        }
                        if (i === 3) {
                            marked.push([row, -1]);
                            marked.push([row, col + 1]);
                        }
                        if (i === 4) {
                            marked.push([row, col + 1]);
                            marked.push([row, col + 2]);
                        }
                    } else marked = tmp;
                    break;
                case 4:
                case 5:
                    marked.push([row, col + i - 2]);
            }
        } else {
            counter = 0;
            tmp = [];
        }
    }
    //retrun
    if (marked[0]) {
        return marked;
    } else
        return;
}

function replace(fieldC, markedC, val) {
    fieldCopy = JSON.parse(JSON.stringify(fieldC));
    markedCopy = JSON.parse(JSON.stringify(markedC));

    for (var i = 0; i < markedCopy.length; i++) {
        fieldCopy[markedCopy[i][0]][markedCopy[i][1]] = val;
    }
    return fieldCopy;
}

function shift(fieldC, val, range) {
    var f = JSON.parse(JSON.stringify(fieldC));
    //loop though every col and row
    for (var col = 0; col < f[0].length; col++) {
        for (var row = 0; row < f.length; row++) {
            if (f[row][col] === val) {
                //shift col
                for (var i = 0; i < row; i++) {
                    f[row - i][col] = f[row - 1 - i][col];
                }
                //replace top
                f[0][col] = Math.floor(Math.random() * range);
            }
        }
    }
    //return
    return f;
}

function drawField(fieldC) {
    var row, col, num = 0,
        startX = 30,
        startY = 3,
        fieldCopy = JSON.parse(JSON.stringify(fieldC));
    //drawField
    for (row = 0; row < fieldCopy.length; row++) {
        for (col = 0; col < fieldCopy[0].length; col++) {
            num = fieldCopy[row][col];
            spr(num * 2, startX + col * 17, startY + row * 16, 1, 1, 0, 0, 2, 2);
        }
    }
    //drawCursor
    var c = 6;
    if (mode) c = 8;
    rectb(startX - 2 + cursorX * 17, startY - 3 + cursorY * 16, 18, 18, c)
    //drawText
    print("Scoore: " + scoore, clientW - 70, 5);
}

// ****** Here start ******
cls();
var x = 0,
    y = 0;
var field = createField(8, dias);
drawField(field);
console.out(clientH - 8);

function TIC() {
    //if interrupt
    for (var i = 0; i < 6; i++)
        if (btn(i) && !pause) {
            pause += 8;
            //update
            switch (i) {
                case 0: //top
                    if (!mode)
                        if (cursorY > 0) cursorY--;
                        else;
                    else { //if mode
                        var tmp = swap(field, cursorY, cursorX, 't');
                        if (tmp) {
                            field = tmp;
                            cursorY--;
                        }
                        mode = 0;
                    }
                    break;
                case 1: //bottom
                    if (!mode)
                        if (cursorY < 7) cursorY++;
                        else;
                    else { //if mode
                        var tmp = swap(field, cursorY, cursorX, 'b');
                        if (tmp) {
                            field = tmp;
                            cursorY++;
                        }
                        mode = 0;
                    }
                    break;
                case 2: //left
                    if (!mode)
                        if (cursorX > 0) cursorX--;
                        else;
                    else { //if mode
                        var tmp = swap(field, cursorY, cursorX, 'l');
                        if (tmp) {
                            field = tmp;
                            cursorX--;
                        }
                        mode = 0;
                    }
                    break;
                case 3: //right
                    if (!mode)
                        if (cursorX < 7) cursorX++;
                        else;
                    else { //if mode
                        var tmp = swap(field, cursorY, cursorX, 'r');
                        if (tmp) {
                            field = tmp;
                            cursorX++;
                        }
                        mode = 0;
                    }
                    break;
                case 5: //change mode
                    if (!mode) mode = 1;
                    else mode = 0;
            }
            //draw
            cls();
            drawField(field);
            //console.out();;
        }
    if (pause > 0) pause--;