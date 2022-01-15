import { parse } from './parser';

test('', () => {
    expect(parse('board[0, 1] = 2')).toEqual([0, 1, 2]);
})
