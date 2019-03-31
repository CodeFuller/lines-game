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
}

class LinesGame extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            board: this.cellsIndexes().map(i => this.cellsIndexes().map(j => new Cell(i, j))),
            cellWithSelectedBall: null,
        };

        for (let row of this.state.board) {
            for (let cell of row) {
                if (Math.random() > 0.5) {
                    const color = Math.floor(Math.random() * this.props.colorsNumber);
                    cell.ball = new Ball(color);
                }
            }
        }
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
        return Array.from({length: this.props.size}, (v, k) => k);
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
        this.moveBall(path[0].row, path[0].col, path[1].row, path[1].col);

        if (path.length > 2) {
            setTimeout(() => this.animateBallPath(path.slice(1)), 50);
        }
    }

    moveBall(sourceRow, sourceCol, targetRow, targetCol) {
        this.setState({
            board: this.getUpdatedBoard(cell => {
                if (cell.row === sourceRow && cell.col === sourceCol) {
                    // Removing the ball from the source cell.
                    return new Cell(cell.row, cell.col);
                }

                if (cell.row === targetRow && cell.col === targetCol) {
                    // Adding the ball to the target cell.
                    const newCell = new Cell(cell.row, cell.col);
                    newCell.ball = this.state.board[sourceRow][sourceCol].ball;
                    return newCell;
                }

                return cell;
            })
        });
    }

    getUpdatedBoard(cellTransformer) {
        return this.state.board.map(row => row.map(cell => cellTransformer(cell)));
    }
}

ReactDOM.render(<LinesGame size="9" colorsNumber="7"></LinesGame>, document.getElementById("play-area"));
