import { getLexer, KW_HEBREW, parse } from './parser';

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

    parse('x = 1', { host })[0].eval()
    parse('y = x', { host })[0].eval()
    parse('z = x + y + z + 1', { host })[0].eval()

    expect(host.vars).toEqual({ x: 1, y: 1, z: 3 });
})

test('Func', () => {
    const host = { vars: {}, funcs: { three: () => 3 } };
    const res = parse('three()', { host })[0].eval()
    expect(res).toEqual(3);
})

test('Func with args', () => {
    const host = { vars: {}, funcs: { inc: a => a + 1, add: (a: number, b: number) => a + b } };
    expect(parse('inc(1)', { host })[0].eval()).toEqual(2);
    expect(parse('add(1, 2)', { host })[0].eval()).toEqual(3);
})

test('Func with expression', () => {
    const host = { vars: {}, funcs: { add: (a: number) => a + 1 } };
    const res = parse('add((3 + 7) % 4)', { host })[0].eval()
    expect(res).toEqual(3);
})

test('Color', () => {
    const res = parse('color(0, 0, 1)')[0].eval()
})

test('Each Loop', () => {
    const host = { vars: {}, funcs: {} };
    const prog = parse('each row from 1 to 10: a = row end', { host })
    expect(prog.length).toEqual(1);
    prog.forEach(x => x.eval())
    expect(host.vars).toEqual({ row: 10, a: 10 })
})

test('If true', () => {
    const host = { vars: {}, funcs: {} };
    const prog = parse('if 1 + 1 < 3: a = 7 end', { host })

    prog.forEach(x => x.eval())
    expect(host.vars).toEqual({ a: 7 })
})

test('If lazy', () => {
    let i = 0
    const host = { vars: {}, funcs: { a: () => i += 1, b: () => i += 2 } };
    const prog = parse('if a() or b(): c = 7 end', { host })

    prog.forEach(x => x.eval())
    expect(host.vars).toEqual({ c: 7 })
    expect(i).toEqual(1)
})

test('If false', () => {
    const host = { vars: {}, funcs: {} };
    const prog = parse('if 0: a = 7 end', { host })

    prog.forEach(x => x.eval())
    expect(host.vars).toEqual({})
})

test('Hebrew', () => {
    parse('???????? = 3', { lexer: getLexer(false, KW_HEBREW) })
    parse('??????(1,1,1)', { lexer: getLexer(false, KW_HEBREW) })
    const prog = '?????? ???????? ?? 0 ???? 10: ??????(????????, 0, 1) ??????'
    parse(prog, { lexer: getLexer(false, KW_HEBREW) })
})