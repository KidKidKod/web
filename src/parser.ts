import type { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { rep, alt, apply, kmid, lrec, lrec_sc, seq, str, tok } from 'typescript-parsec';

enum K {
    Number,
    Name,
    Op1,
    Op2,
    Assign,
    Comma,
    LP,
    RP,
    WS,
}

const lexer = buildLexer([
    [true, /^\d+/g, K.Number],
    [true, /^[a-z]+/g, K.Name],
    [true, /^=/g, K.Assign],
    [true, /^[*/%]/g, K.Op1],
    [true, /^[-+]/g, K.Op2],
    [true, /^,/g, K.Comma],
    [true, /^\(/g, K.LP],
    [true, /^\)/g, K.RP],
    [false, /^\s+/g, K.WS]
]);


interface Exp {
    eval(): number
}

const ops = {
    '-': (a: number, b: number) => a - b,
    '+': (a: number, b: number) => a + b,
    '*': (a: number, b: number) => a * b,
    '/': (a: number, b: number) => a / b,
    '%': (a: number, b: number) => a % b,
}


export function run(input: string, vars: { [name: string]: number } = {}): any {
    function n(num: Token<K.Number>): number {
        return +num.text
    }

    function expVar(name: Token<K.Name>): Exp {
        const v = name.text
        if (!(v in vars)) {
            vars[v] = 0
        }

        return {
            eval: () => vars[v]
        };
    }

    function expNum(num: Token<K.Number>): Exp {
        return {
            eval: () => n(num)
        };
    }

    function expOp(first: Exp, tail: [Token<K>, Exp]): Exp {
        return {
            eval: () => ops[tail[0].text](
                first.eval(),
                tail[1].eval())
        };
    }


    function expAssign(value: [Token<K.Name>, Token<K.Assign>, Exp]) {
        const [name, _, exp] = value;
        const val = exp.eval()
        return {
            eval: () => {
                return vars[name.text] = val;
            }
        }
    }

    const TERM = rule<K, Exp>();
    const FACTOR = rule<K, Exp>();
    const EXP = rule<K, Exp>();


    TERM.setPattern(
        alt(
            apply(tok(K.Name), expVar),
            apply(tok(K.Number), expNum),
            kmid(tok(K.LP), EXP, tok(K.RP))
        )
    )

    FACTOR.setPattern(
        lrec_sc(TERM, seq(tok(K.Op1), TERM), expOp)
    )

    EXP.setPattern(
        alt(
            lrec_sc(FACTOR, seq(tok(K.Op2), FACTOR), expOp),
            apply(
                seq(
                    tok(K.Name),
                    tok(K.Assign),
                    EXP),
                expAssign)
        )
    )

    return expectSingleResult(expectEOF(EXP.parse(lexer.parse(input))));
}


/*
while i < 10
    j = 0
    i = i + 1
    while j < 10
        j = j + 1
        board[i][j] = 1
    end
end
*/