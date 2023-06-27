if (typeof window === "undefined") {
    //Compatibility with Node.js
    var prompt = require("prompt-sync")({ sigint: true });
}

/* 
█▀▄ █ █ ██▄ ▄▀▀ █ █ ██▄ 
█▀  ▀▄█ █▄█ ▄█▀ ▀▄█ █▄█  */
/* https://gist.github.com/learncodeacademy/777349747d8382bfb722 */
var events = {
    events: {},
    on: function (eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },
    off: function (eventName, fn) {
        if (this.events[eventName]) {
            for (var i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            }
        }
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (fn) {
                fn(data);
            });
        }
    },
};

/* 
██▄ ▄▀▄ ▄▀▄ █▀▄ █▀▄ 
█▄█ ▀▄▀ █▀█ █▀▄ █▄▀  */
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

/* 
▄▀  ▄▀▄ █▄ ▄█ ██▀ 
▀▄█ █▀█ █ ▀ █ █▄▄  */
const game = (function () {
    const board = newBoard(3, 3);
    let freeSpace = board.length ** 2;
    const wincon = 3;
    let state = "play"; // or 'win' or 'tie
    let activePlayer = "X";

    const play = function () {
        render();
        const move = promptActivePlayer();
        if (checkMoveLegality(move, [0, 1, 2, 3, 4])) return; //if false skips rest of block execution
        placeToken(move);
        updateGameState(move);
        changeActivePlayer();
    };
    const win = function () {
        state = "win";
        render();
        console.log(`The WINNER is Player '${activePlayer}'`);
    };
    const draw = function () {
        state = "draw";
        render();
        console.log(`The game ended in a DRAW`);
    };

    const promptActivePlayer = function () {
        const string = `Player '${activePlayer}', Enter`;
        const col = prompt(`${string} COLUMN number: `);
        const row = prompt(`${string} ROW number: `);
        return { col, row };
    };
    const checkMoveLegality = function ({ col, row }, checks) {
        const move = { col, row };
        let error = false;
        const errorConditions = [
            "isNaN(+move[key]) || move[key] ===''",
            "move[key] >= board.length",
            "move[key] < 0",
            'board[row][col] !== " "',
            'state==="win"',
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
    const placeToken = function ({ col, row }) {
        board[row][col] = activePlayer;
        freeSpace -= 1;

        events.emit("boardChanged", board);
        return { col, row };
    };
    const UI_play = function ({ col, row }) {
        if (!checkMoveLegality({ col, row }, [0, 1, 2, 3, 4])) {
            placeToken({ col, row });
            updateGameState({ col, row });
            if (state === "play") changeActivePlayer();
        }
    };
    const changeActivePlayer = function () {
        activePlayer = activePlayer === "X" ? "O" : "X";
    };
    const updateGameState = function ({ col, row }) {
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
                    //state = "win";
                    events.emit("stateWin");
                    return;
                } else if (freeSpace === 0) {
                    //state = "draw";
                    events.emit("stateDraw");
                    return;
                }
            }
        }
    };
    const render = function () {
        console.clear();
        console.log("TIC-TAC-TOE!");
        console.log(`State: ${state}`);
        console.table(board);
    };
    const getBoard = function () {
        return board;
    };

    events.on("statePlay", play);
    events.on("stateWin", win);
    events.on("stateDraw", draw);

    return {
        play,
        getBoard,
        UI_play,
        render,
    };
})();

/* 
█▄ █ ▄▀▄ █▀▄ ██▀   █ ▄▀▀    █ █ ▄▀▀    ██▄ █▀▄ ▄▀▄ █   █ ▄▀▀ ██▀ █▀▄ 
█ ▀█ ▀▄▀ █▄▀ █▄▄ ▀▄█ ▄█▀    ▀▄▀ ▄█▀    █▄█ █▀▄ ▀▄▀ ▀▄▀▄▀ ▄█▀ █▄▄ █▀▄  */
if (typeof window === "undefined") {
    game.run();
} else {
    /* 
█▀▄ █ ▄▀▀ █▀▄ █   ▄▀▄ ▀▄▀    ▄▀▀ ▄▀▄ █▄ █ ▀█▀ █▀▄ ▄▀▄ █   █   ██▀ █▀▄ 
█▄▀ █ ▄█▀ █▀  █▄▄ █▀█  █     ▀▄▄ ▀▄▀ █ ▀█  █  █▀▄ ▀▄▀ █▄▄ █▄▄ █▄▄ █▀▄  */
    const displayController = (function () {
        const divGame = document.querySelector("#game");
        let cells = [];

        const init = function () {
            const board = game.getBoard();
            const rows = board.length;
            const cols = board[0].length;
            for (let i = 1; i <= cols * rows; i++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.setAttribute("data-col", (i + cols - 1) % cols);
                cell.setAttribute("data-row", Math.floor((i - 1) / cols));
                divGame.appendChild(cell);
            }
            cells = document.querySelectorAll(".cell");
            divGame.style.display = "grid";
            divGame.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            divGame.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        };
        const bindEvents = function () {
            //PUBSUB
            events.on("boardChanged", render);

            //CELLS
            cells.forEach((element) => {
                element.addEventListener("click", (event) => {
                    const col = event.target.getAttribute("data-col");
                    const row = event.target.getAttribute("data-row");
                    game.UI_play({ col, row });
                });
            });
        };
        const render = function () {
            game.render();
            const board = game.getBoard().flat();
            for (let i = 0; i < board.length; i++) {
                cells[i].innerText = board[i];
            }
        };
        init();
        bindEvents();
        return {};
    })();
}
