import { run } from './parser';

test('Test exp', () => {
    expect(run('a = 1 + 2')[0].eval()).toEqual(3);
    expect(run('a = 2 - 1')[0].eval()).toEqual(1);
    expect(run('a = 2 * 3')[0].eval()).toEqual(6);
    expect(run('a = 4 / 2')[0].eval()).toEqual(2);
    expect(run('a = 5 % 2')[0].eval()).toEqual(1);
})

test('Test long exp', () => {
    expect(run('a = 1 + 2 + 3')[0].eval()).toEqual(6);
    expect(run('a = 1 + 2 * 3')[0].eval()).toEqual(7);
    expect(run('a = 2 * 2 + 3')[0].eval()).toEqual(7);
    expect(run('a = 2 * (2 + 3)')[0].eval()).toEqual(10);
})

test('Var', () => {
    const host = { vars: {}, funcs: {} };

    run('x = 1', host)[0].eval()
    run('y = x', host)[0].eval()
    run('z = x + y + z + 1', host)[0].eval()

    expect(host.vars).toEqual({ x: 1, y: 1, z: 3 });
})

test('Func', () => {
    const host = { vars: {}, funcs: { three: () => 3 } };
    const res = run('three()', host)[0].eval()
    expect(res).toEqual(3);
})

test('Func with args', () => {
    const host = { vars: {}, funcs: { add: (a: number, b: number) => a + b } };
    const res = run('add(1, 2)', host)[0].eval()
    expect(res).toEqual(3);
})

test('Color', () => {
    const res = run('color(0, 0, 1)')[0].eval()
})

