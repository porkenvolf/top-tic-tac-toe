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
            makeMove(promptActivePlayer());
            changeActivePlayer();
        }
    };
    promptActivePlayer = function () {
        const string = `Player '${activePlayer}', Enter`;
        const col = prompt(`${string} COLUMN number: `);
        const row = prompt(`${string} ROW number: `);
        return { col, row };
    };
    makeMove = function ({ col, row }) {
        board[row][col] = activePlayer;
    };
    changeActivePlayer = function () {
        activePlayer = activePlayer === "x" ? "o" : "x";
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
game.loop();
