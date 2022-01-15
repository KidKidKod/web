import { parse } from './parser';

test('', () => {
    expect(parse('board[0] = 1')).toEqual([0, 1]);
})
