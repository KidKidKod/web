import type { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, seq, str, tok } from 'typescript-parsec';

enum K {
    Number,
    Word,
    Assign,
    Comma,
    LB,
    RB,
    WS,
}

const lexer = buildLexer([
    [true, /^\d+/g, K.Number],
    [true, /^[a-z]+/g, K.Word],
    [true, /^=/g, K.Assign],
    [true, /^,/g, K.Comma],
    [true, /^\[/g, K.LB],
    [true, /^\]/g, K.RB],
    [false, /^\s+/g, K.WS]
]);

const COLOR = rule<K, [number, number, number]>();
const INDEX = rule<K, [number, number]>();

function n(value: Token<K.Number>): number {
    return +value.text
}

function index(value: [Token<K.LB>, number, Token<K.Comma>, number, Token<K.RB>]): [number, number] {
    return [value[1], value[3]];
}

function setColor(value: [Token<K>, [number, number], Token<K>, number]): [number, number, number] {
    const [i, j] = value[1];
    return [i, j, value[3]];
}

INDEX.setPattern(
    apply(seq(
        tok(K.LB),
        apply(tok(K.Number), n),
        tok(K.Comma),
        apply(tok(K.Number), n),
        tok(K.RB)
    ), index)
)

COLOR.setPattern(
    apply(
        seq(
            str('board'),
            INDEX,
            tok(K.Assign),
            apply(tok(K.Number), n)
        ), setColor)
)

export function parse(input: string): any {
    return expectSingleResult(COLOR.parse(lexer.parse(input)))
}



