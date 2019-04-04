class Ball {
    constructor(color) {
        this.color = color;
    }
}

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.ball = null;
    }

    get hasBall() {
        return this.ball !== null;
    }
}

class BoardHelper {

    static setInitalBalls(board, startingBallsNumber, colorsNumber) {
        this.dropNewBalls(board, startingBallsNumber, colorsNumber);
    }

    static dropNewBalls(board, newBallsNumber, colorsNumber) {
        for (let i = 0; i < newBallsNumber; ++i) {
            const cell = BoardHelper.getRandomFreeCell(board);
            cell.ball = BoardHelper.getRandomBall(colorsNumber);
        }
    }
    
    static getRandomFreeCell(board) {
        const freeCells = Array.from(BoardHelper.getBoardCells(board)).filter(c => !c.hasBall);
        if (freeCells.length == 0) {
            throw "The board is full";
        }

        return freeCells[Math.floor(freeCells.length * Math.random())];
    }

    static getRandomBall(colorsNumber) {
        const color = Math.floor(Math.random() * colorsNumber);
        return new Ball(color);
    }

    static *getBoardCells(board) {
        for (let row of board) {
            for (let cell of row) {
                yield cell;
            }
        }
    }

    static findPath(board, srcCell, dstCell) {
        const srcItem = {
            cell: srcCell,
            path: [ srcCell ],
        };
        return BoardHelper.traverseToCell(board, dstCell, [ srcItem ], new Set([srcCell]));
    }

    static traverseToCell(board, dstCell, traversalQueue, visitedCells) {
        while (traversalQueue.length > 0) {
            const currItem = traversalQueue.shift();

            for (let neighborCell of BoardHelper.getPossibleMoves(board, currItem.cell)) {
                if (visitedCells.has(neighborCell)) {
                    continue;
                }
    
                const pathToNeighbor = [...currItem.path, neighborCell];
                if (neighborCell === dstCell) {
                    // We found the shortest path!
                    return pathToNeighbor;
                }

                const newItem = {
                    cell: neighborCell,
                    path: pathToNeighbor
                }

                visitedCells.add(neighborCell);
                traversalQueue.push(newItem);
            }
        }

        // The path does not exist.
        return null;
    }

    static getPossibleMoves(board, cell) {
        return [
            { row: cell.row - 1, col: cell.col },
            { row: cell.row, col: cell.col + 1 },
            { row: cell.row + 1, col: cell.col },
            { row: cell.row, col: cell.col - 1 },
        ]
        .filter(c => c.row >= 0 && c.row < board.length && c.col >= 0 && c.col < board[c.row].length)
        .map(c => board[c.row][c.col])
        .filter(cell => !cell.hasBall);
    }

    static *getCollapsingLines(board, minCollapsingLine) {
        for (let fullLine of BoardHelper.getFullLines(board, minCollapsingLine)) {
            for (let collapseStart = 0; collapseStart + minCollapsingLine <= fullLine.length; ) {
                const startCell = fullLine[collapseStart];
                if (!startCell.hasBall) {
                    ++collapseStart;
                    continue;
                }

                let collapseEnd;
                for (collapseEnd = collapseStart + 1; collapseEnd < fullLine.length; ++collapseEnd) {
                    if (!fullLine[collapseEnd].hasBall || fullLine[collapseEnd].ball.color !== startCell.ball.color) {
                        break;
                    }
                }

                // Now collapseEnd points to the next cell after lines with same colors.

                if (collapseEnd - collapseStart >= minCollapsingLine) {
                    yield fullLine.slice(collapseStart, collapseEnd);
                }

                collapseStart = collapseEnd;
            }
        }
    }

    static *getFullLines(board, minCollapsingLine) {

        // Rows
        for (let row of board) {
            yield row;
        }

        // Columns
        for (let col = 0; col < board[0].length; ++col) {
            yield board.map(row => row[col]);
        }

        // Diagonal, above \
        for (let startingCol = 0; startingCol <= board[0].length - minCollapsingLine; ++startingCol) {
            const currLine = [];
            for (let i = 0; startingCol + i < board[0].length; ++i) {
                currLine.push(board[i][startingCol + i]);
            }
            yield currLine;
        }

        // Diagonal, below \
        for (let startingRow = 1; startingRow <= board.length - minCollapsingLine; ++startingRow) {
            const currLine = [];
            for (let i = 0; startingRow + i < board.length; ++i) {
                currLine.push(board[startingRow + i][i]);
            }
            yield currLine;
        }

        // Diagonal, above /
        for (let startingRow = board.length - 1; startingRow + 1 >= minCollapsingLine; --startingRow) {
            const currLine = [];
            for (let i = 0; i <= startingRow; ++i) {
                currLine.push(board[startingRow - i][i]);
            }
            yield currLine;
        }

        // Diagonal, below /
        for (let startingCol = 1; startingCol <= board[0].length - minCollapsingLine; ++startingCol) {
            const currLine = [];
            for (let i = 0; startingCol + i < board[0].length; ++i) {
                currLine.push(board[board.length - 1 - i][startingCol + i]);
            }
            yield currLine;
        }
    }
}

class LinesGame extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            board: this.cellsIndexes().map(i => this.cellsIndexes().map(j => new Cell(i, j))),
            cellWithSelectedBall: null,
        };

        BoardHelper.setInitalBalls(this.state.board, this.props.startingBallsNumber, this.props.colorsNumber);
    }

    render() {
        const tableRows = Array(this.state.board.length);
        for (let [i, row] of this.state.board.entries()) {
            const tableRow = Array(row.length);
            for (let [j, cell] of row.entries()) {
                const ballElement = cell.hasBall ? <span className={`lines-ball lines-ball-color-${cell.ball.color}`}></span> : null;
                const tableCell = <td key={`cell${i}${j}`} className={`lines-cell${cell === this.state.cellWithSelectedBall ? " lines-selected-cell" : ""}`}
                                        onClick={event => this.handleCellClick(cell)}>{ballElement}</td>;
                tableRow.push(tableCell);
            }
            tableRows.push(<tr key={`row${i}`}>{tableRow}</tr>);
        }

        return (
            <table>
                <tbody>
                    {tableRows}
                </tbody>
            </table>
        );
    }

    cellsIndexes() {
        return Array.from({length: this.props.boardSize}, (v, k) => k);
    }

    handleCellClick(cell) {
        // New ball was clicked?
        if (cell.hasBall) {
            this.setState({ cellWithSelectedBall: cell.hasBall ? cell : null });
            return;
        }

        // Same ball was clicked?
        if (this.state.cellWithSelectedBall === cell) {
            return;
        }

        // No ball was previously selected and empty cell is now clicked?
        if (this.state.cellWithSelectedBall === null) {
            return;
        }

        // A ball was previously selected and empty cell is now clicked.
        if (this.state.cellWithSelectedBall !== null) {
            const path = BoardHelper.findPath(this.state.board, this.state.cellWithSelectedBall, cell);
            if (path == null) {
                return;
            }

            this.setState({ cellWithSelectedBall: null });
            this.animateBallPath(path);
        }
    }

    animateBallPath(path) {
        if (path.length < 2) {
            if (!this.collapseLines()) {
                const newBoard = this.duplicateBoard();
                BoardHelper.dropNewBalls(newBoard, this.props.newDropBallsNumber, this.props.colorsNumber);
                this.replaceBoard(newBoard);

                // After drop of new balls, we should collapse lines again, because new balls could complete some lines.
                this.collapseLines();
            }

            return;
        }

        this.moveBall(path[0], path[1]);
        setTimeout(() => this.animateBallPath(path.slice(1)), 50);
    }
    
    moveBall(sourceCell, targetCell) {
        const newBoard = this.duplicateBoard();
        targetCell.ball = sourceCell.ball;
        sourceCell.ball = null;
        this.replaceBoard(newBoard);
    }

    collapseLines() {
        const collapsingLines = BoardHelper.getCollapsingLines(this.state.board, this.props.minCollapsingLine);
        if (collapsingLines.length == 0) {
            return false;
        }

        const newBoard = this.duplicateBoard(this.state.board);
        for (let line of collapsingLines) {
            for (let cell of line) {
                cell.ball = null;
            }
        }

        this.setState({ board: newBoard });
        return false;
    }

    duplicateBoard() {
        return this.state.board.slice();
    }

    replaceBoard(newBoard) {
        this.setState({ board: newBoard });
    }
}

LinesGame.defaultProps = {
    boardSize: 9,
    colorsNumber: 7,
    startingBallsNumber: 5,
    newDropBallsNumber: 3,
    minCollapsingLine: 5
};

LinesGame.propTypes = {
    boardSize: PropTypes.number,
    colorsNumber: PropTypes.number,
};

ReactDOM.render(<LinesGame></LinesGame>, document.getElementById("play-area"));
