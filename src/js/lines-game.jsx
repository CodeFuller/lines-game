class Ball {
    constructor(color) {
        this.color = color;
    }
}

class Cell {
    constructor() {
        this.ball = null;
    }

    get hasBall() {
        return this.ball !== null;
    }
}

class Board {

    constructor(size, colorsNumber) {
        this.size = size;
        this.cells = this.cellsIndexes().map(i => this.cellsIndexes().map(j => new Cell()));
        this.colorsNumber = colorsNumber;
    }

    cellsIndexes() {
        return Array.from({length: this.size}, (v, k) => k);
    }

    get rows() {
        return this.cells;
    }
}

class LinesGame extends React.Component {

    constructor(props) {
        super(props);

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
                const tableCell = <td key={`cell${i}${j}`} className="lines-cell">{cell.hasBall && <span className={`lines-ball lines-ball-color-${cell.ball.color}`}></span>}</td>;
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

    cellsNumbers() {
        return Array.from({length: this.boardSize}, (v, k) => k + 1);
    }
}

ReactDOM.render(<LinesGame size="9" colorsNumber="7"></LinesGame>, document.getElementById("play-area"));
