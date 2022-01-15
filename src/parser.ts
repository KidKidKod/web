import type { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, seq, str, tok } from 'typescript-parsec';

enum K {
    Number,
    Word,
    ASSIGN,
    LB,
    RB,
    WS,
}

const lexer = buildLexer([
    [true, /^\d+/g, K.Number],
    [true, /^[a-z]+/g, K.Word],
    [true, /^=/g, K.ASSIGN],
    [true, /^\[/g, K.LB],
    [true, /^\]/g, K.RB],
    [false, /^\s+/g, K.WS]
]);

const COLOR = rule<K, [number, number]>();
const INDEX = rule<K, number>();

function n(value: Token<K.Number>): number {
    return +value.text
}

function setColor(value: [Token<K.Word>, number, Token<K.ASSIGN>, number]): [number, number] {
    return [value[1], value[3]];
}

INDEX.setPattern(
    apply(kmid(tok(K.LB), tok(K.Number), tok(K.RB)), n)
)

COLOR.setPattern(
    apply(
        seq(
            str('board'),
            INDEX,
            tok(K.ASSIGN),
            apply(tok(K.Number), n)
        ), setColor)
)

export function parse(input: string): any {
    return expectSingleResult(COLOR.parse(lexer.parse(input)))
}



