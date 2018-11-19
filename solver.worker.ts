/*
Adapted from Pankaj Kumar's javascript translation of Peter Norvig's Solving
Every Sudoku Puzzle, rewritten as a web worker in Typescript.

http://pankaj-k.net/weblog/2007/03/sudoku_solving_program_transla.html
*/

export default () => {
    function cross(A: string[], B: string[]) {
        const C = [];
        for (const a of A) {
            for (const b of B) {
                C.push(a + b);
            }
        }
        return C;
    }

    function member(item: string, list: string[]) {
        return list.indexOf(item) !== -1;
    }

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const cols = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const digits = '123456789';
    const squares = cross(rows, cols);
    let nassigns = 0;
    let neliminations = 0;
    let nsearches = 0;

    const unitlist = [];
    for (const c of cols) {
        unitlist.push(cross(rows, c.split('')));
    }

    for (const r of rows) {
        unitlist.push(cross([r], cols));
    }

    const rrows = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I']];
    const ccols = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']];
    for (const rs of rrows) {
        for (const cs of ccols) {
            unitlist.push(cross(rs, cs));
        }
    }

    const units: { [key: string]: string[][] } = {};
    for (const s of squares) {
        units[s] = [];
        for (const u of unitlist) {
            if (member(s, u)) {
                units[s].push(u);
            }
        }
    }

    const peers: { [key: string]: { [key: string]: boolean } } = {};
    for (const s of squares) {
        peers[s] = {};
        for (const u of units[s]) {
            for (const s2 of u) {
                if (s2 !== s) {
                    peers[s][s2] = true;
                }
            }
        }
    }

    function parse_grid(grid: string) {
        // Given a string of 81 digits (or . or 0 or -), return an object os {cell:values}
        nassigns = 0;
        neliminations = 0;
        nsearches = 0;
        let grid2 = '';
        for (let c = 0; c < grid.length; c++) {
            if ('0.-123456789'.indexOf(grid.charAt(c)) >= 0) {
                grid2 += grid.charAt(c);
            }
        }
        const values: Values = {};
        for (const s of squares) {
            values[s] = digits;
        }
        for (let s = 0; s < squares.length; s++) {
            if (digits.indexOf(grid2.charAt(s)) >= 0 && !assign(values, squares[s], grid2.charAt(s))) {
                return false;
            }
        }
        return values;
    }

    interface Values {
        [key: string]: string;
    }

    // Eliminate all the other values (except dig) from values[sq] and propagate.
    function assign(values: Values, sq: string, dig: string) {
        ++nassigns;
        let result = true;
        const vals = values[sq];
        for (const d of vals) {
            if (d !== dig) {
                result = result && (eliminate(values, sq, d) ? true : false);
            }
        }
        return (result ? values : false);
    }

    function eliminate(values: Values, sq: string, dig: string) {
        ++neliminations;
        if (values[sq].indexOf(dig) === -1) {
            // already eliminated.
            return values;
        }
        values[sq] = values[sq].replace(dig, '');
        if (values[sq].length === 0) { // invalid input?
            return false;
        } else if (values[sq].length === 1) {
            // If there is only one value (values[sq]) left in square, remove it from peers
            let result = true;
            for (const s in peers[sq]) {
                if (peers[sq].hasOwnProperty(s)) {
                    result = result && !!eliminate(values, s, values[sq]);
                }
            }
            if (!result) { return false; }
        }
        for (const u of units[sq]) {
            const dplaces = [];
            for (const s of u) {
                if (values[s].indexOf(dig) !== -1) {
                    dplaces.push(s);
                }
            }
            if (dplaces.length === 0) {
                return false;
            } else if (dplaces.length === 1) {
                if (!assign(values, dplaces[0], dig)) {
                    return false;
                }
            }
        }
        return values;
    }

    // tslint:disable  no-any
    function dup(obj: any) {
        const d: any = {};
        for (const f in obj) {
            if (obj.hasOwnProperty(f)) {
                d[f] = obj[f];
            }
        }
        return d;
    }
    // tslint:enable no-any

    function search(values: Values): Values | boolean {
        ++nsearches;
        if (!values) {
            return false;
        }
        let min = 10;
        let max = 1;
        let sq = null;
        for (const s of squares) {
            if (values[s].length > max) {
                max = values[s].length;
            }
            if (values[s].length > 1 && values[s].length < min) {
                min = values[s].length;
                sq = s;
            }
        }

        if (max === 1) {
            return values;
        }

        for (const d of values[sq as string]) {
            const res = search(assign(dup(values), sq as string, d) as Values);
            if (res) {
                return res;
            }
        }
        return false;
    }

    function boardToMatrix(values: Values) {
        const arr = [];
        for (const r of rows) {
            const row = [];
            for (const c of cols) {
                row.push(values[r + c]);
            }
            arr.push(row);
        }
        return arr;
    }

    // Workaround for using the right postMessage as a worker.
    const ctx: Worker = self as any; // tslint:disable-line no-any

    function solve(event: MessageEvent) {
        const err = {
            error: 'There appear to be no possible solutions to the puzzle ' +
                'you have entered.'
        };

        const puzzle = event.data;
        let values = parse_grid(puzzle);
        if (values) {
            values = search(values);
        } else {
            ctx.postMessage(err);
            return;
        }

        if (values) {
            ctx.postMessage(boardToMatrix(values as Values));
        } else {
            ctx.postMessage(err);
        }
        // console.log({ nsearches, nassigns, neliminations });
    }

    self.onmessage = solve;
};