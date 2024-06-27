
const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard"); 

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null; 

const renderBoard = ()=> {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex)=> {
            const squaredElement = document.createElement("div");
            squaredElement.classList.add('square', (rowIndex + squareIndex)%2 === 0 ? "light" : "dark");

            squaredElement.dataset.row = rowIndex;
            squaredElement.dataset.col = squareIndex;

            if(square) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', square.color === 'w' ? 'white' : 'black');

                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e)=> {
                    if(pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = {row: rowIndex, col: squareIndex};
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", (e)=> {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squaredElement.appendChild(pieceElement);
            }

            squaredElement.addEventListener("dragover", (e)=> {
                e.preventDefault();
            });

            squaredElement.addEventListener("drop", (e)=> {
                e.preventDefault();
                if(draggedPiece) {
                    const targetSource = {
                        row: parseInt(squaredElement.dataset.row),
                        col: parseInt(squaredElement.dataset.col)
                    };

                    handleMove(sourceSquare, targetSource);
                }
            })
            boardElement.appendChild(squaredElement);
        });
    });

    if(playerRole === 'b'){
        boardElement.classList.add('flipped');
    }
    else{
        boardElement.classList.remove('flipped');
    }
};

const handleMove = (source, target)=> {
    const move = {
        from: `${String.fromCharCode(97+ source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97+ target.col)}${8 - target.row}`,
        promotion: 'q',
    }

    socket.emit("move", move);
};

const getPieceUnicode = (piece)=> {
    const unicodePieces = {
        p: "♙",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
    };

    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", ()=> {
    playerRole = null;
    renderBoard();

});

socket.on("boardState", (fen)=> {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move)=> {
    chess.move(move);
    renderBoard();
})

renderBoard();