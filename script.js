document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const statusText = document.getElementById("status");
    const restartButton = document.getElementById("restart");
    const modeSelect = document.getElementById("mode");

    let boardState = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let gameActive = true;
    let mode = "2player";

    // Generate Board (Only Once)
    board.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        board.appendChild(cell);
    }
    const cells = document.querySelectorAll(".cell");

    // Handle Player Move
    function handleClick(event) {
        const index = event.target.dataset.index;
        if (!gameActive || boardState[index] !== "") return;

        boardState[index] = currentPlayer;
        event.target.textContent = currentPlayer;

        let result = checkWin();
        if (result) {
            statusText.textContent = result === "Draw" ? "It's a Draw!" : `${result} Wins!`;
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.textContent = `Player ${currentPlayer}'s turn`;

        if (currentPlayer === "O" && mode !== "2player") {
            setTimeout(aiMove, 500);
        }
    }

    // AI Moves Based on Difficulty
    function aiMove() {
        if (!gameActive) return;

        let emptyCells = boardState.map((val, idx) => val === "" ? idx : null).filter(v => v !== null);
        let aiIndex;

        switch (mode) {
            case "easy":
                aiIndex = easyMove(emptyCells);
                break;
            case "medium":
                aiIndex = mediumMove(emptyCells);
                break;
            case "hard":
                aiIndex = hardMove(emptyCells);
                break;
            case "insane":
                aiIndex = insaneMove(emptyCells);
                break;
        }

        boardState[aiIndex] = "O";
        cells[aiIndex].textContent = "O";

        let result = checkWin();
        if (result) {
            statusText.textContent = result === "Draw" ? "It's a Draw!" : `${result} Wins!`;
            gameActive = false;
            return;
        }

        currentPlayer = "X";
        statusText.textContent = `Player X's turn`;
    }

    // AI Difficulty Logic
    function easyMove(emptyCells) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)]; // Random move
    }

    function mediumMove(emptyCells) {
        return Math.random() > 0.5 ? hardMove(emptyCells) : easyMove(emptyCells); // 50% smart, 50% random
    }

    function hardMove(emptyCells) {
        return findBestMove() || easyMove(emptyCells); // Try best move, fallback to random
    }

    function insaneMove(emptyCells) {
        return findBestMove() || emptyCells[0]; // Always best move
    }

    // Minimax Algorithm for Smart AI
    function findBestMove() {
        let bestScore = -Infinity;
        let move;
        boardState.forEach((val, idx) => {
            if (val === "") {
                boardState[idx] = "O";
                let score = minimax(boardState, false);
                boardState[idx] = "";
                if (score > bestScore) {
                    bestScore = score;
                    move = idx;
                }
            }
        });
        return move;
    }

    function minimax(newBoard, isMaximizing) {
        let result = checkWin();
        if (result === "O") return 10;
        if (result === "X") return -10;
        if (result === "Draw") return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            newBoard.forEach((val, idx) => {
                if (val === "") {
                    newBoard[idx] = "O";
                    let score = minimax(newBoard, false);
                    newBoard[idx] = "";
                    bestScore = Math.max(score, bestScore);
                }
            });
            return bestScore;
        } else {
            let bestScore = Infinity;
            newBoard.forEach((val, idx) => {
                if (val === "") {
                    newBoard[idx] = "X";
                    let score = minimax(newBoard, true);
                    newBoard[idx] = "";
                    bestScore = Math.min(score, bestScore);
                }
            });
            return bestScore;
        }
    }

    // Check Win Condition
    function checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let pattern of winPatterns) {
            let [a, b, c] = pattern;
            if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
                return boardState[a];
            }
        }

        return boardState.includes("") ? null : "Draw";
    }

    // Restart Game
    function restartGame() {
        boardState.fill("");
        gameActive = true;
        currentPlayer = "X";
        statusText.textContent = "Player X's turn";
        cells.forEach(cell => cell.textContent = "");
    }

    // Event Listeners
    cells.forEach(cell => cell.addEventListener("click", handleClick));
    restartButton.addEventListener("click", restartGame);
    modeSelect.addEventListener("change", () => {
        mode = modeSelect.value;
        restartGame();
    });
});