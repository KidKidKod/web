import { run } from './parser';

test('Test exp', () => {
    expect(run('1 + 2').eval()).toEqual(3);
    expect(run('2 - 1').eval()).toEqual(1);
    expect(run('2 * 3').eval()).toEqual(6);
    expect(run('4 / 2').eval()).toEqual(2);
    expect(run('5 % 2').eval()).toEqual(1);
})

test('Test long exp', () => {
    expect(run('1 + 2 + 3').eval()).toEqual(6);
    expect(run('1 + 2 * 3').eval()).toEqual(7);
    expect(run('2 * 2 + 3').eval()).toEqual(7);
    expect(run('2 * (2 + 3)').eval()).toEqual(10);
})

test('Var', () => {
    const vars = {}
    run('x = 1', vars).eval()
    run('y = x', vars).eval()
    run('z = x + y + z + 1', vars).eval()
    expect(vars).toEqual({ x: 1, y: 1, z: 3 });
})

