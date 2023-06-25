if (typeof window === "undefined") {
    //Compatibility with Node.js
    var prompt = require("prompt-sync")({ sigint: true });
}

const newBoard = function (rows, cols) {
    //INIT
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i].push(" ");
        }
    }
    return board;
};

const game = (function () {
    const board = newBoard(3, 3);
    let freeSpace = board.length ** 2;
    const wincon = 3;
    let state = "play"; // or 'win' or 'tie
    let activePlayer = "x";

    loop = function () {
        while (state === "play") {
            render();
            changeActivePlayer();
            const move = promptActivePlayer();
            if (checkMoveLegality(move, [0, 1, 2, 3])) continue; //if false skips rest of block execution
            makeMove(move);
            updateGameState(move);
        }
        if (state === "win") {
            render();
            console.log(`The WINNER is Player '${activePlayer}'`);
        }
        if (state === "draw") {
            render();
            console.log(`The game ended in a DRAW`);
        }
    };
    promptActivePlayer = function () {
        const string = `Player '${activePlayer}', Enter`;
        const col = prompt(`${string} COLUMN number: `);
        const row = prompt(`${string} ROW number: `);
        return { col, row };
    };
    checkMoveLegality = function ({ col, row }, checks) {
        const move = { col, row };
        let error = false;
        const errorConditions = [
            "isNaN(+move[key]) || move[key] ===''",
            "move[key] >= board.length",
            "move[key] < 0",
            'board[row][col] !== " "',
        ];

        for (const key in move) {
            for (const key1 in errorConditions) {
                if (checks.includes(+key1) && eval(errorConditions[key1])) {
                    //yes, yes, I know. NEVER use eval() right?
                    //...b, but, it's inside a private scope!
                    //it's UNREACHABLE. Like Frusciante's song.
                    error = true;
                    return error;
                }
            }
        }
        return error;
    };
    makeMove = function ({ col, row }) {
        board[row][col] = activePlayer;
        freeSpace -= 1;
        return { col, row };
    };
    changeActivePlayer = function () {
        activePlayer = activePlayer === "x" ? "o" : "x";
    };
    updateGameState = function ({ col, row }) {
        const directions = [
            { col: 1, row: 0 },
            { col: 0, row: 1 },
            { col: 1, row: 1 },
            { col: 1, row: -1 },
        ];
        const move = { col, row };

        for (const key in directions) {
            let count = 0;
            for (let i = -wincon + 1; i < wincon; i++) {
                const check = {
                    col: directions[key].col * i + Number(move.col),
                    row: directions[key].row * i + Number(move.row),
                };
                if (!checkMoveLegality(check, [1, 2])) {
                    if (board[check.row][check.col] === activePlayer) {
                        count += 1;
                    }
                }
                if (count === wincon) {
                    state = "win";
                    return;
                } else if (freeSpace === 0) {
                    state = "draw";
                    return;
                }
            }
        }
    };
    render = function () {
        console.clear();
        console.log("TIC-TAC-TOE!");
        console.log(`State: ${state}`);
        console.table(board);
    };
    return {
        loop,
    };
})();
if (typeof window === "undefined") {
    game.loop();
}
