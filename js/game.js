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
    let board = newBoard(3, 3);
    let state = "play"; // or 'win' or 'tie
    let activePlayer = "x";

    loop = function () {
        while (state === "play") {
            render();
            const move = promptActivePlayer();
            if (checkMoveLegality(move)) continue;
            makeMove(move);
            updateGameState(move);
            changeActivePlayer();
        }
    };
    promptActivePlayer = function () {
        const string = `Player '${activePlayer}', Enter`;
        const col = prompt(`${string} COLUMN number: `);
        const row = prompt(`${string} ROW number: `);
        return { col, row };
    };
    checkMoveLegality = function ({ col, row }) {
        const move = { col, row };
        let error = false;
        for (const key in move) {
            if (
                move[key] > board.length || //move is out of bounds
                move[key] < 0 || //move is out of bounds
                isNaN(+move[key]) || //move is not a number
                board[row][col] !== " " //move is trying to overwrite another move
            ) {
                error = true;
            }
        }
        return error;
    };
    makeMove = function ({ col, row }) {
        board[row][col] = activePlayer;
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
        // const dsa = board[4][4];
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
