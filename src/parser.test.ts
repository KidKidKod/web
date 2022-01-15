import { parse } from './parser';

class TestProg {
    vals = []

    reset() {
        this.vals = []
    }

    assign(i: number, j: number, val: number) {
        console.log(i, j, val)
        this.vals.push([i, j, val]);
    }
}

const assign = 'board[0][0] = 1'
test(assign, () => {
    const testBoard = new TestProg();
    const res = parse(assign, testBoard);
    expect(testBoard.vals).toEqual([[0, 0, 1]]);
})

const comment = '# this is a comment'
test(comment, () => {
    const testBoard = new TestProg();
    const res = parse(comment, testBoard);
    expect(testBoard.vals).toEqual([]);
})

const comments = `# board[0][0] = 1
# board[1][1] = 2
`
test(comment, () => {
    const testBoard = new TestProg();
    const res = parse(comments, testBoard);
    expect(testBoard.vals).toEqual([]);
})