import { rep_sc, Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { rep, alt, apply, kmid, lrec, lrec_sc, seq, str, tok } from 'typescript-parsec';

export enum K {
    KW,
    Number,
    Op1,
    Op2,
    Assign,
    Comma,
    Col,
    LP,
    RP,
    WS,
    Name,
}

export function getLexer(keepWs = false) {
    return buildLexer([
        [keepWs, /^\s+/g, K.WS],
        [true, /^(if|each|from|to|end)/g, K.KW],
        [true, /^\d+/g, K.Number],
        [true, /^=/g, K.Assign],
        [true, /^[*/%]/g, K.Op1],
        [true, /^[-+]/g, K.Op2],
        [true, /^,/g, K.Comma],
        [true, /^:/g, K.Col],
        [true, /^\(/g, K.LP],
        [true, /^\)/g, K.RP],
        [true, /^[a-z_]+/g, K.Name],
    ])
}

const lexer = getLexer();


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

export function parse(
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

    function args(args: Exp[], arg: [Token<K>, Exp]): Exp[] {
        args.push(arg[1])
        return args;
    }

    const ARGS = rule<K, Exp[]>();
    const TERM = rule<K, Exp>();
    const FACTOR = rule<K, Exp>();
    const EXP = rule<K, Exp>();
    const FUNC_CALL = rule<K, Exp>();
    const ASSIGN = rule<K, Exp>();
    const EACH = rule<K, Exp>();
    const IF = rule<K, Exp>();
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

    function expEach(value: [
        Token<K.KW>,
        Token<K.Name>,
        Token<K>,
        Exp,
        Token<K>,
        Exp,
        Token<K.Col>,
        Exp[],
        Token<K>,
    ]): Exp {
        const [$1, name, $2, fromExp, $3, toExp, $4, prog, $5] = value
        return {
            eval: () => {
                for (let i = fromExp.eval(); i <= toExp.eval(); i++) {
                    host.vars[name.text] = i
                    prog.forEach(s => s.eval())
                }
                return 0
            }
        }
    }

    EACH.setPattern(
        apply(
            seq(
                str('each'),
                tok(K.Name),
                str('from'),
                EXP,
                str('to'),
                EXP,
                tok(K.Col),
                PROG,
                str('end'),
            ),
            expEach)
    )

    function expIf(value: [Token<K>, Exp, Token<K>, Exp[], Token<K>]): Exp {
        const [$1, cond, $2, prog, $3] = value
        return {
            eval: () => {
                const v = cond.eval()
                if (v) {
                    prog.forEach(s => s.eval())
                }
                return v
            }
        }
    }

    IF.setPattern(
        apply(
            seq(
                str('if'),
                EXP,
                tok(K.Col),
                PROG,
                str('end'),
            ),
            expIf)
    )

    function expAssign(value: [Token<K.Name>, Token<K.Assign>, Exp]) {
        const [name, _, exp] = value;
        return {
            eval: () => {
                return host.vars[name.text] = exp.eval();
            }
        }
    }

    ASSIGN.setPattern(
        apply(
            seq(
                tok(K.Name),
                tok(K.Assign),
                EXP),
            expAssign),
    )

    STMT.setPattern(
        alt(
            ASSIGN,
            FUNC_CALL,
            EACH,
            IF
        )
    )

    PROG.setPattern(
        rep_sc(STMT)
    )

    return expectSingleResult(expectEOF(PROG.parse(lexer.parse(input))));
}