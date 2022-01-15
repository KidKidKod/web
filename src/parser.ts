import * as moo from 'moo'

const lexer = moo.compile({
    WS: /[ \t]+/,
    BOARD: 'board',
    NUM: /0|[1-9][0-9]*/,
    ASSIGN: '=',
    LB: '[',
    RB: ']',
    COMMENT: /\#[^\n]*/,
    NL: { match: /\n/, lineBreaks: true },
})

export interface Program {
    reset(): void;
    assign(i: number, j: number, val: number): void;
}

export function parse(code: string, prog: Program) {

    function assign(tokens: Array<any>, p: number) {
        const msg = `${tokens}, ${p}`
        const i = parseInt(tokens[p + 2])
        const j = parseInt(tokens[p + 5])
        const v = parseInt(tokens[p + 8])
        prog.assign(i, j, v)
    }

    try {
        prog.reset()
        lexer.reset(code)
        const tokens = Array.from(lexer).filter(t => t.type !== 'WS').map(t => t.value);
        console.log(tokens)
        for (const [i, token] of tokens.entries()) {
            if (token === 'board') {
                assign(tokens, i)
            }
        }
    } catch (e) {
        console.debug(e)
    }
}

