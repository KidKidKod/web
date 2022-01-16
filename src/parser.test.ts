import { parse } from './parser';

test('Test exp', () => {
    expect(parse('a = 1 + 2')[0].eval()).toEqual(3);
    expect(parse('a = 2 - 1')[0].eval()).toEqual(1);
    expect(parse('a = 2 * 3')[0].eval()).toEqual(6);
    expect(parse('a = 4 / 2')[0].eval()).toEqual(2);
    expect(parse('a = 5 % 2')[0].eval()).toEqual(1);
})

test('Test long exp', () => {
    expect(parse('a = 1 + 2 + 3')[0].eval()).toEqual(6);
    expect(parse('a = 1 + 2 * 3')[0].eval()).toEqual(7);
    expect(parse('a = 2 * 2 + 3')[0].eval()).toEqual(7);
    expect(parse('a = 2 * (2 + 3)')[0].eval()).toEqual(10);
    expect(parse('a = (2 + 3) % 3')[0].eval()).toEqual(2);
})

test('Var', () => {
    const host = { vars: {}, funcs: {} };

    parse('x = 1', host)[0].eval()
    parse('y = x', host)[0].eval()
    parse('z = x + y + z + 1', host)[0].eval()

    expect(host.vars).toEqual({ x: 1, y: 1, z: 3 });
})

test('Func', () => {
    const host = { vars: {}, funcs: { three: () => 3 } };
    const res = parse('three()', host)[0].eval()
    expect(res).toEqual(3);
})

test('Func with args', () => {
    const host = { vars: {}, funcs: { add: (a: number, b: number) => a + b } };
    const res = parse('add(1, 2)', host)[0].eval()
    expect(res).toEqual(3);
})

test('Color', () => {
    const res = parse('color(0, 0, 1)')[0].eval()
})

test('Each Loop', () => {
    const host = { vars: {}, funcs: {} };
    const prog = parse('each row from 1 to 10: a = row end', host)
    expect(prog.length).toEqual(1);
    prog.forEach(x => x.eval())
    expect(host.vars).toEqual({ row: 10, a: 10 })
})

test('If true', () => {
    const host = { vars: {}, funcs: {} };
    const prog = parse('if 1: a = 7 end', host)

    prog.forEach(x => x.eval())
    expect(host.vars).toEqual({ a: 7 })
})

test('If false', () => {
    const host = { vars: {}, funcs: {} };
    const prog = parse('if 0: a = 7 end', host)

    prog.forEach(x => x.eval())
    expect(host.vars).toEqual({})
})

