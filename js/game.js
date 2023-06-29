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
█▀▄ █   ▄▀▄ ▀▄▀ ██▀ █▀▄ 
█▀  █▄▄ █▀█  █  █▄▄ █▀▄  */
const newPlayer = function (_name, _token, _ai) {
    const name = _name;
    const token = _token;
    const ai = _ai ? _ai : false;
    return { name, token, ai };
};
/* 
▄▀▄ █ 
█▀█ █  */
const ai = (function () {
    const random = function () {
        const col = Math.floor(Math.random() * 3);
        const row = Math.floor(Math.random() * 3);
        return { col, row };
    };
    return { random };
})();
/* 
▄▀  ▄▀▄ █▄ ▄█ ██▀ 
▀▄█ █▀█ █ ▀ █ █▄▄  */
const game = (function () {
    const board = newBoard(3, 3);
    let freeSpace = board.length ** 2;
    const wincon = 3;
    let state = "play"; // or 'win' or 'tie
    const amountPlayers = 2;
    const player1 = newPlayer("wako", "X");
    const player2 = newPlayer("ai", "O", ai.random);

    let activePlayer = player1;

    const play = function (_move, _fromUI) {
        while (state === "play") {
            render();
            const player = activePlayer;
            let move;
            if (player.ai) {
                move = player.ai();
            } else {
                move = _move ? _move : promptActivePlayer();
            }

            console.log(move);
            const legal = !checkMoveLegality(move, [0, 1, 2, 3, 4]);
            if (legal) {
                placeToken(move);
                updateGameState(move);
                if (state === "play") changeActivePlayer();
            }
            if (activePlayer === player1 && _fromUI)
                return legal ? player : legal;
        }
    };
    const win = function () {
        state = "win";
        render();
        console.log(`The WINNER is Player '${activePlayer.token}'`);
    };
    const draw = function () {
        state = "draw";
        render();
        console.log(`The game ended in a DRAW`);
    };

    const promptActivePlayer = function () {
        const string = `Player '${activePlayer.token}', Enter`;
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
        board[row][col] = activePlayer.token;
        freeSpace -= 1;

        events.emit("boardChanged", board);
        return { col, row };
    };
    const changeActivePlayer = function () {
        activePlayer = activePlayer === player1 ? player2 : player1;
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
                    if (board[check.row][check.col] === activePlayer.token) {
                        count += 1;
                    }
                }
                if (count === wincon) {
                    events.emit("stateWin");
                    return;
                } else if (freeSpace === 0) {
                    events.emit("stateDraw");
                    return;
                }
            }
        }
    };
    const render = function () {
        //console.clear();
        console.log("TIC-TAC-TOE!");
        console.log(`State: ${state}`);
        console.table(board);
    };
    const getBoard = function () {
        return board;
    };
    const getActivePlayer = function () {
        return activePlayer;
    };
    events.on("stateWin", win);
    events.on("stateDraw", draw);

    return {
        play,
        getBoard,
        getActivePlayer,
        render,
    };
})();

/* 
█▄ █ ▄▀▄ █▀▄ ██▀   █ ▄▀▀    █ █ ▄▀▀    ██▄ █▀▄ ▄▀▄ █   █ ▄▀▀ ██▀ █▀▄ 
█ ▀█ ▀▄▀ █▄▀ █▄▄ ▀▄█ ▄█▀    ▀▄▀ ▄█▀    █▄█ █▀▄ ▀▄▀ ▀▄▀▄▀ ▄█▀ █▄▄ █▀▄  */
if (typeof window === "undefined") {
    game.play();
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
                cell.style.fontSize = `${40 / cols}em`;
                divGame.appendChild(cell);
            }
            cells = document.querySelectorAll(".cell");
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
                    player = game.play({ col, row }, true);
                });
            });
        };
        const render = function () {
            game.render();
            const board = game.getBoard().flat();
            for (let i = 0; i < board.length; i++) {
                cells[i].innerText = board[i];
                if (cells[i].innerText)
                    cells[i].classList.add(cells[i].innerText);
            }
        };
        init();
        bindEvents();
        return {};
    })();
}
