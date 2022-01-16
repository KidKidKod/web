import { rep_sc, Token } from 'typescript-parsec';
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

interface Host {
    vars: { [name: string]: number },
    funcs: { [name: string]: (...args) => any }
}

export function run(
    input: string, host: Host = { vars: {}, funcs: {} }): any {

    function n(num: Token<K.Number>): number {
        return +num.text
    }

    function expVar(name: Token<K.Name>): Exp {
        const v = name.text
        if (!(v in host.vars)) {
            host.vars[v] = 0
        }

        return {
            eval: () => host.vars[v]
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


    function expFuncCall(value: [Token<K.Name>, Exp[]]) {
        const [name, args] = value;
        if (!(name.text in host.funcs)) {
            host.funcs[name.text] = (...args) => 0
        }

        return {
            eval: () => {
                const vals = args.map(x => x.eval())
                return host.funcs[name.text](...vals);
            }
        }
    }

    function expAssign(value: [Token<K.Name>, Token<K.Assign>, Exp]) {
        const [name, _, exp] = value;
        const val = exp.eval()
        return {
            eval: () => {
                return host.vars[name.text] = val;
            }
        }
    }

    function args(args: Exp[], arg: [Token<K>, Exp]): Exp[] {
        args.push(arg[1])
        return args;
    }

    const ARGS = rule<K, Exp[]>();
    const TERM = rule<K, Exp>();
    const FACTOR = rule<K, Exp>();
    const EXP = rule<K, Exp>();
    const FUNC_CALL = rule<K, Exp>();
    const STMT = rule<K, Exp>();
    const PROG = rule<K, Exp[]>();

    ARGS.setPattern(
        alt(
            apply(seq(
                tok(K.LP),
                tok(K.RP)
            ), () => []),

            kmid(
                tok(K.LP),
                lrec_sc(
                    apply(TERM, e => [e]),
                    seq(
                        tok(K.Comma),
                        TERM),
                    args),
                tok(K.RP)
            )
        )
    )

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
            FUNC_CALL
        )
    )

    FUNC_CALL.setPattern(
        apply(
            seq(
                tok(K.Name),
                ARGS
            ),
            expFuncCall),
    )

    STMT.setPattern(
        alt(
            apply(
                seq(
                    tok(K.Name),
                    tok(K.Assign),
                    EXP),
                expAssign),
            FUNC_CALL
        )
    )

    PROG.setPattern(
        rep_sc(STMT)
    )

    return expectSingleResult(expectEOF(PROG.parse(lexer.parse(input))));
}