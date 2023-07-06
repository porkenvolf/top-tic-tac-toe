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
▀█▀ █ █▄ ▄█ ██▀ █▀▄ 
 █  █ █ ▀ █ █▄▄ █▀▄  */
var timer = {
    timers: {},
    timeFunction: (func) => {
        console.log(func.name);
        return func;
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
function ai_random() {
    const col = Math.floor(Math.random() * game.getBoard()[0].length);
    const row = Math.floor(Math.random() * game.getBoard().length);
    return { col, row };
}
function ai_unbeatable(board) {
    let bestScore = -Infinity;
    let bestMove;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === " ") {
                board[row][col] = "O";
                const score = minimax(board, 0, false, row, col);
                board[row][col] = " "; // Undo the move

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { row, col };
                }
            }
        }
    }

    return bestMove;
}
function minimax(board, depth, maximizingPlayer, row, col) {
    const scores = {
        X: -10 + depth,
        O: 10 - depth,
        draw: 0,
    };

    const result = game.checkWinner(board, { col, row });

    if (result.state === "win") {
        return scores[result.player];
    } else if (result.state === "draw") {
        return scores[result.state];
    }

    if (maximizingPlayer) {
        let bestScore = -Infinity;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === " ") {
                    board[row][col] = "O";
                    const score = minimax(board, depth + 1, false, row, col);
                    board[row][col] = " "; // Undo the move
                    bestScore = Math.max(score, bestScore);
                }
            }
        }

        return bestScore;
    } else {
        let bestScore = Infinity;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === " ") {
                    board[row][col] = "X";
                    const score = minimax(board, depth + 1, true, row, col);
                    board[row][col] = " "; // Undo the move
                    bestScore = Math.min(score, bestScore);
                }
            }
        }

        return bestScore;
    }
}

/* 
▄▀  ▄▀▄ █▄ ▄█ ██▀ 
▀▄█ █▀█ █ ▀ █ █▄▄  */
const game = (function () {
    let board;
    let freeSpace;
    let wincon;
    let state;
    let endGameMsg;
    let amountPlayers;
    let player1;
    let player2;
    let activePlayer;
    reset();
    function reset() {
        board = newBoard(3, 3);
        freeSpace = board.length * board[0].length;
        wincon = 3;
        state = "play"; // or 'win' or 'tie
        amountPlayers = 2;
        player1 = newPlayer("wako", "X");
        player2 = newPlayer("ai", "O", ai_unbeatable);
        activePlayer = player1;
    }
    const play = function (_move, _fromUI) {
        while (state === "play") {
            render();
            const player = activePlayer;
            let move = { col: "", row: "" };
            if (player.ai) {
                const ai_output = player.ai(board);
                move.col = ai_output.col;
                move.row = ai_output.row;
            } else {
                move = _move ? _move : promptActivePlayer();
            }

            const legal = !checkMoveLegality(move, [0, 1, 2, 3, 4]);
            if (legal) {
                placeToken(move);
                const newState = checkWinner(board, move);
                if (newState.state === "win" || newState.state === "draw") {
                    events.emit(newState.state);
                }
                if (state === "play") changeActivePlayer();
            }
            if (activePlayer === player1 && _fromUI)
                return legal ? player : legal;
        }
    };
    const win = function () {
        state = "win";
        render();
        endGameMsg = `The WINNER is Player '${activePlayer.token}'`;
        console.log(endGameMsg);
    };
    const draw = function () {
        state = "draw";
        render();
        endGameMsg = `The game ended in a DRAW`;
        console.log(endGameMsg);
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
            "move.row >= board.length || move.col >= board[0].length",
            "move[key] < 0",
            'board[row][col] !== " "',
            'state==="win"',
        ];

        for (const key in move) {
            for (const key1 in errorConditions) {
                if (checks.includes(+key1) && eval(errorConditions[key1])) {
                    //console.log(errorConditions[key1]);
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

        events.emit("boardChanged");
        return { col, row };
    };
    const changeActivePlayer = function () {
        activePlayer = activePlayer === player1 ? player2 : player1;
    };
    const checkWinner = function (board, { col, row }) {
        if (board.length === 3) {
            return checkWinner3x3(board);
        }

        //This was meant for not having to check the whole board in bigger boards.
        //Slower in 3x3
        const directions = [
            { col: 1, row: 0 },
            { col: 0, row: 1 },
            { col: 1, row: 1 },
            { col: 1, row: -1 },
        ];
        const move = { col, row };
        const playerToken = board[move.row][move.col];
        let fullBoard = true;
        for (const key in board) {
            if (board[key].includes(" ")) {
                fullBoard = false;
            }
        }

        for (const key in directions) {
            let count = 0;
            for (let i = -wincon + 1; i < wincon; i++) {
                const check = {
                    col: directions[key].col * i + Number(move.col),
                    row: directions[key].row * i + Number(move.row),
                };
                if (!checkMoveLegality(check, [1, 2])) {
                    if (
                        board[check.row][check.col] ===
                        board[move.row][move.col]
                    ) {
                        count += 1;
                    }
                }
                if (count === wincon) {
                    return { state: "win", player: playerToken };
                }
            }
        }
        if (fullBoard) {
            return { state: "draw", player: playerToken };
        }

        return { state: "play" };
    };
    const checkWinner3x3 = function (board) {
        /*https://editor.p5js.org/codingtrain/sketches/0zyUhZdJD*/
        function equals3(a, b, c) {
            return a == b && b == c && a != " ";
        }
        let winner = null;
        //rows
        for (let i = 0; i < board.length; i++) {
            if (equals3(board[i][0], board[i][1], board[i][2])) {
                winner = { state: "win", player: board[i][0] };
            }
        }
        //cols
        for (let i = 0; i < board.length; i++) {
            if (equals3(board[0][i], board[1][i], board[2][i])) {
                winner = { state: "win", player: board[0][i] };
            }
        }
        //diags
        if (equals3(board[0][0], board[1][1], board[2][2])) {
            winner = { state: "win", player: board[0][0] };
        }
        if (equals3(board[2][0], board[1][1], board[0][2])) {
            winner = { state: "win", player: board[2][0] };
        }

        //return
        let openSpots = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] == " ") {
                    openSpots++;
                }
            }
        }

        if (winner == null && openSpots == 0) {
            return { state: "draw" };
        } else if (winner == null && openSpots != 0) {
            return { state: "play" };
        } else {
            return winner;
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
    const getState = function () {
        return state;
    };
    const getActivePlayer = function () {
        return activePlayer;
    };
    function getEndGameMsg() {
        return endGameMsg;
    }
    events.on("win", win);
    events.on("draw", draw);

    return {
        play,
        checkWinner,
        getBoard,
        getState,
        getActivePlayer,
        getEndGameMsg,
        render,
        reset,
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
        const btnReset = document.querySelector("#reset");
        const divMsg = document.querySelector("#msg");
        const divPanel = document.querySelector("#panel");
        let cells = [];

        const init = function () {
            const board = game.getBoard();
            const rows = board.length;
            const cols = board[0].length;

            cells.forEach((element) => {
                element.remove();
            });

            for (let i = 1; i <= cols * rows; i++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.setAttribute("data-col", (i + cols - 1) % cols);
                cell.setAttribute("data-row", Math.floor((i - 1) / cols));
                cell.style.fontSize = `${70 / cols}em`;
                divGame.appendChild(cell);
            }
            cells = document.querySelectorAll(".cell");
            divGame.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            divGame.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

            //CELLS
            cells.forEach((element) => {
                element.addEventListener("click", (event) => {
                    const col = event.target.getAttribute("data-col");
                    const row = event.target.getAttribute("data-row");
                    player = game.play({ col, row }, true);
                });
            });
        };
        const bindEvents = function () {
            //PUBSUB
            events.on("boardChanged", render);
            events.on("win", endGameMsg);
            events.on("draw", endGameMsg);
            function endGameMsg() {
                const msg = document.createElement("div");
                msg.classList.add("msg");
                msg.innerText = game.getEndGameMsg();
                msg.style.cssText = `background-color: var(--${game.getState()})`;
                divPanel.appendChild(msg);
            }

            //RESET
            btnReset.addEventListener("click", () => {
                reset();
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
        function reset() {
            game.reset();
            const msgs = document.querySelectorAll(".msg");
            msgs.forEach((element) => {
                element.remove();
            });
            init();
        }
        init();
        bindEvents();
        return {};
    })();
}
