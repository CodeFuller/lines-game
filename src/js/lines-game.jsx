class Ball {
    constructor(color) {
        this.color = color;
    }
}

class Cell {
    constructor(row, col) {
        this.ball = null;
        this.row = row;
        this.col = col;
    }

    get hasBall() {
        return this.ball !== null;
    }
}

class Board {

    constructor(size, colorsNumber) {
        this.size = size;
        this.cells = this.cellsIndexes().map(i => this.cellsIndexes().map(j => new Cell(i, j)));
        this.colorsNumber = colorsNumber;
    }

    cellsIndexes() {
        return Array.from({length: this.size}, (v, k) => k);
    }

    get rows() {
        return this.cells;
    }

    findPath(srcCell, dstCell) {
        const srcItem = {
            cell: srcCell,
            path: [ srcCell ],
        };
        return this.traverseToCell(dstCell, [ srcItem ], new Set([srcCell]));
    }

    traverseToCell(dstCell, traversalQueue, visitedCells) {
        while (traversalQueue.length > 0) {
            const currItem = traversalQueue.shift();

            for (let neighborCell of this.getPossibleMoves(currItem.cell)) {
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

    getPossibleMoves(cell) {
        const cellIndexIsValid = ind => ind >= 0 && ind < this.size;

        return [
            { row: cell.row - 1, col: cell.col },
            { row: cell.row, col: cell.col + 1 },
            { row: cell.row + 1, col: cell.col },
            { row: cell.row, col: cell.col - 1 },
        ]
        .filter(c => cellIndexIsValid(c.row) && cellIndexIsValid(c.col))
        .map(c => this.cells[c.row][c.col])
        .filter(cell => !cell.hasBall);
    }
}

class LinesGame extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cellWithSelectedBall: null,
        };

        this.board = new Board(props.size, props.colorsNumber);

        for (let row of this.board.rows) {
            for (let cell of row) {
                if (Math.random() > 0.5) {
                    const color = Math.floor(Math.random() * this.board.colorsNumber);
                    cell.ball = new Ball(color);
                }
            }
        }
    }

    render() {
        const tableRows = Array(this.board.rows.length);
        for (let [i, row] of this.board.rows.entries()) {
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
            const path = this.board.findPath(this.state.cellWithSelectedBall, cell);
            if (path == null) {
                return;
            }

            cell.ball = this.state.cellWithSelectedBall.ball;
            this.state.cellWithSelectedBall.ball = null;
            this.state.cellWithSelectedBall = null;
            this.setState(this.state);
        }
    }
}

ReactDOM.render(<LinesGame size="9" colorsNumber="7"></LinesGame>, document.getElementById("play-area"));
