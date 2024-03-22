import * as psec from "typescript-parsec";
import {
  rule,
  alt,
  tok,
  seq,
  lrec_sc,
  apply,
  kmid,
  expectEOF,
  expectSingleResult,
  kright,
  rep_sc,
} from "typescript-parsec";
let _ = require("lodash");
// https://github.com/microsoft/ts-parsec/blob/master/doc/ParserCombinators.md

import * as ast from "./ast";
import * as c from "../constants/consts";
import * as lex from "./lexer";
import { lexerPrettyPrinter } from "./lexer";

type Token = psec.Token<lex.TokenKind>;

// /*********************** NUMBERS ******************************/

// function applyNumber(value: Token): ast.Num {
//   return { val: value.text, kind: "num", expr: value.text } as ast.Number;
// }

// function applyPi(value: Token): ast.Num {
//   return { val: "π", kind: "num", expr: "π" } as ast.Number;
// }

// function applyNumVar(value: Token): ast.Num {
//   return { val: value.text, kind: "numvar", expr: value.text } as ast.NumVar;
// }

// function applyBinOp(fst: ast.Num, snd: [Token, ast.Num]): ast.Num {
//   switch (snd[0].kind) {
//     case lex.TokenKind.Add: {
//       return {
//         val: "+",
//         left: fst,
//         right: snd[1],
//         kind: "num",
//         expr: fst.expr.concat("+").concat(snd[1].expr),
//       } as ast.ArithOp;
//     }
//     case lex.TokenKind.Sub: {
//       return {
//         val: "-",
//         left: fst,
//         right: snd[1],
//         kind: "num",
//         expr: fst.expr.concat("-").concat(snd[1].expr),
//       } as ast.ArithOp;
//     }
//     case lex.TokenKind.Mul: {
//       return {
//         val: "*",
//         left: fst,
//         right: snd[1],
//         kind: "num",
//         expr: fst.expr.concat("*").concat(snd[1].expr),
//       } as ast.ArithOp;
//     }
//     case lex.TokenKind.Div: {
//       return {
//         val: "/",
//         left: fst,
//         right: snd[1],
//         kind: "num",
//         expr: fst.expr.concat("/").concat(snd[1].expr),
//       } as ast.ArithOp;
//     }
//     case lex.TokenKind.Exp: {
//       return {
//         val: "^",
//         left: fst,
//         right: snd[1],
//         kind: "num",
//         expr: fst.expr.concat("^").concat(snd[1].expr),
//       } as ast.ArithOp;
//     }
//     default: {
//       throw new Error(`Unknown binary operator: ${snd[0].text}`);
//     }
//   }
// }

// function applyNumFunc(args: [Token, ast.Num, ast.Num[]]): ast.Num {
//   args[2].unshift(args[1]);
//   return {
//     kind: "numfunc",
//     fname: args[0].text,
//     args: args[2],
//     val: args[0].text,
//     expr: args[0].text.concat(" ").concat(args[2].map((x) => x.expr).join(" ")),
//   } as ast.NumFunc;
// }

// function applyNumberSucc(value: [Token, ast.Num]): ast.Num {
//   return { expr: "1+".concat(value[1].expr), kind: "num" } as ast.Number;
// }

// function applyRConst(val: Token): ast.Num {
//   switch (val.kind) {
//     case lex.TokenKind.R0: {
//       return { kind: "numreal01", n: "R0", expr: "R0" } as ast.Real01;
//     }
//     case lex.TokenKind.R1: {
//       return { kind: "numreal01", n: "R1", expr: "R1" } as ast.Real01;
//     }
//     default: {
//       throw new Error(`Unknown real: ${val.text}`);
//     }
//   }
// }

// // numbers
// const NUML0 = rule<lex.TokenKind, ast.Num>();
// const NUML10 = rule<lex.TokenKind, ast.Num>();
// const NUML20 = rule<lex.TokenKind, ast.Num>();
// const NUML30 = rule<lex.TokenKind, ast.Num>();
// const NUML40 = rule<lex.TokenKind, ast.Num>();

// NUML0.setPattern(
//   alt(
//     apply(alt(tok(lex.TokenKind.R0), tok(lex.TokenKind.R1)), applyRConst),
//     apply(tok(lex.TokenKind.NumberToken), applyNumber),
//     apply(tok(lex.TokenKind.PI), applyPi),
//     apply(
//       seq(tok(lex.TokenKind.Sub), tok(lex.TokenKind.NumberToken)),
//       applySign
//     ),
//     apply(
//       seq(tok(lex.TokenKind.LParen), NUML40, tok(lex.TokenKind.RParen)),
//       applyParens
//     ),
//     apply(tok(lex.TokenKind.Str), applyNumVar)
//   )
// );

// NUML10.setPattern(
//   alt(
//     apply(
//       seq(
//         alt(
//           tok(lex.TokenKind.Sub),
//           tok(lex.TokenKind.Div),
//           tok(lex.TokenKind.Root)
//         ),
//         rep_sc(
//           alt(
//             tok(lex.TokenKind.Sub),
//             tok(lex.TokenKind.Div),
//             tok(lex.TokenKind.Root)
//           )
//         ),
//         NUML0
//       ),
//       applyUnaryOp
//     ),
//     apply(seq(tok(lex.TokenKind.Succ), NUML0), applyNumberSucc),
//     apply(
//       seq(
//         tok(lex.TokenKind.Str),
//         // hack so functions have at least one parameter
//         NUML0,
//         rep_sc(NUML0)
//       ),
//       applyNumFunc
//     )
//   )
// );

// NUML20.setPattern(
//   lrec_sc(
//     alt(NUML10, NUML0),
//     seq(alt(tok(lex.TokenKind.Mul), tok(lex.TokenKind.Div)), NUML0),
//     applyBinOp
//   )
// );

// NUML30.setPattern(
//   lrec_sc(
//     NUML20,
//     seq(alt(tok(lex.TokenKind.Add), tok(lex.TokenKind.Sub)), NUML20),
//     applyBinOp
//   )
// );

// NUML40.setPattern(
//   lrec_sc(NUML30, seq(tok(lex.TokenKind.Exp), NUML30), applyBinOp)
// );

// function applyUnaryOp(args: [Token, Token[], ast.Num]): ast.Num {
//   args[1].unshift(args[0]);
//   return {
//     val: args[1]
//       .map((x) => x.text)
//       .join(" ")
//       .concat(args[2].expr),
//     kind: "num",
//     expr: args[1]
//       .map((x) => x.text)
//       .join(" ")
//       .concat(args[2].expr),
//   } as ast.Num;
// }

// function applyParens(args: [Token, ast.Num, Token]): ast.Num {
//   return {
//     val: "(".concat(args[1].expr).concat(")"),
//     kind: "num",
//     expr: "(".concat(args[1].expr).concat(")"),
//   } as ast.Num;
// }

// function applySign(args: [Token, Token]): ast.Num {
//   return {
//     val: args[0].text.concat(args[1].text),
//     kind: "num",
//     expr: args[0].text.concat(args[1].text),
//   } as ast.Number;
// }

// /*********************** ZXTERMS ******************************/

// const ZXBASETERM = rule<lex.TokenKind, ast.ASTNode>();
// const ZXBASETRANSFORMED = rule<lex.TokenKind, ast.ASTNode>();
// const ZXNSTACK = rule<lex.TokenKind, ast.ASTNode>();
// const ZXNSTACKTRANSFORMED = rule<lex.TokenKind, ast.ASTNode>();
// const ZXCAST = rule<lex.TokenKind, ast.ASTNode>();
// const ZXCASTTRANSFORMED = rule<lex.TokenKind, ast.ASTNode>();
// const ZXPROPTO = rule<lex.TokenKind, ast.ASTNode>();
// const ZXSTACKCOMPOSE = rule<lex.TokenKind, ast.ASTNode>();
// const ASTNODE = rule<lex.TokenKind, ast.ASTNode>();

// function applyConst(args: Token): ast.ASTNode {
//   let zxconst: ast.ASTConst;
//   switch (args.kind) {
//     case lex.TokenKind.Box: {
//       zxconst = {
//         kind: "const",
//         val: ast.ZXConst.Box,
//       } as ast.ASTConst;
//       break;
//     }
//     case lex.TokenKind.Cap: {
//       zxconst = {
//         kind: "const",
//         val: ast.ZXConst.Cap,
//       } as ast.ASTConst;
//       break;
//     }
//     case lex.TokenKind.Cup: {
//       zxconst = {
//         kind: "const",
//         val: ast.ZXConst.Cup,
//       } as ast.ASTConst;
//       break;
//     }
//     case lex.TokenKind.Empty: {
//       zxconst = {
//         kind: "const",
//         val: ast.ZXConst.Empty,
//       } as ast.ASTConst;
//       break;
//     }
//     case lex.TokenKind.Wire: {
//       zxconst = {
//         kind: "const",
//         val: ast.ZXConst.Wire,
//       } as ast.ASTConst;
//       break;
//     }
//     case lex.TokenKind.Swap: {
//       zxconst = {
//         kind: "const",
//         val: ast.ZXConst.Swap,
//       } as ast.ASTConst;
//       break;
//     }
//     default: {
//       throw new Error(`Unknown const: ${args.kind}`);
//     }
//   }
//   return zxconst;
// }

// function applyVar(val: Token): ast.ASTNode {
//   return { kind: "var", val: val.text } as ast.ASTVar;
// }

// function applyFunc(
//   args: [Token, ast.Num | ast.ASTNode, (ast.Num | ast.ASTNode)[]]
// ): ast.ASTNode {
//   args[2].unshift(args[1]);
//   const new_args = <[ast.Num | ast.ASTNode]>args[2];
//   return {
//     kind: "function",
//     fname: args[0].text,
//     args: new_args,
//     val: `${args[0].text}(${new_args.join(", ")})`,
//   } as ast.ASTFunc;
// }

// function applyNWire(arg: ast.Num): ast.ASTNode {
//   return { kind: "nwire", n: arg } as ast.ASTNWire;
// }

// // ZX base term =
// // | const [box, cup, cap, empty, wire swap]
// // | var
// // | fname ?( num/astnode ?, + ?)
// // | nwire number
// // | cswap? flip?
// ZXBASETERM.setPattern(
//   alt(
//     apply(
//       alt(
//         tok(lex.TokenKind.Box),
//         tok(lex.TokenKind.Cup),
//         tok(lex.TokenKind.Cap),
//         tok(lex.TokenKind.Empty),
//         tok(lex.TokenKind.Wire),
//         tok(lex.TokenKind.Swap)
//       ),
//       applyConst
//     ),
//     apply(tok(lex.TokenKind.Str), applyVar),
//     apply(
//       seq(
//         tok(lex.TokenKind.Str),
//         alt(NUML40, ASTNODE),
//         rep_sc(alt(NUML40, ASTNODE))
//       ),
//       applyFunc
//     ),
//     apply(kright(tok(lex.TokenKind.NWire), NUML40), applyNWire),
//     apply(
//       seq(
//         alt(tok(lex.TokenKind.XToken), tok(lex.TokenKind.ZToken)),
//         NUML40,
//         NUML40,
//         NUML40
//       ),
//       applySpider
//     ),
//     apply(
//       seq(
//         alt(
//           kmid(
//             tok(lex.TokenKind.LParen),
//             tok(lex.TokenKind.XToken),
//             tok(lex.TokenKind.RParen)
//           ),
//           kmid(
//             tok(lex.TokenKind.LParen),
//             tok(lex.TokenKind.ZToken),
//             tok(lex.TokenKind.RParen)
//           )
//         ),
//         NUML40,
//         NUML40,
//         NUML40
//       ),
//       applySpider
//     ),
//     kmid(tok(lex.TokenKind.LParen), ASTNODE, tok(lex.TokenKind.RParen))
//   )
// );

// ZXBASETRANSFORMED.setPattern(
//   apply(
//     seq(
//       rep_sc(tok(lex.TokenKind.ColorSwap)),
//       lrec_sc(
//         ZXBASETERM,
//         alt(
//           tok(lex.TokenKind.Adjoint),
//           tok(lex.TokenKind.Transpose),
//           tok(lex.TokenKind.Conjugate)
//         ),
//         applyTransformPost
//       )
//     ),
//     applyTransformPre
//   )
// );

// function applySpider(args: [Token, ast.Num, ast.Num, ast.Num]): ast.ASTNode {
//   // console.log("applyspider");
//   let spider: ast.ASTSpider;
//   switch (args[0].kind) {
//     case lex.TokenKind.XToken: {
//       spider = {
//         kind: "spider",
//         val: "X",
//         in: args[1],
//         out: args[2],
//         alpha: args[3],
//       };
//       break;
//     }
//     case lex.TokenKind.ZToken: {
//       spider = {
//         kind: "spider",
//         val: "Z",
//         in: args[1],
//         out: args[2],
//         alpha: args[3],
//       };
//       break;
//     }
//     default: {
//       console.log("nooo spider type?");
//       throw new Error(`Unknown spider: ${args[0].kind}`);
//     }
//   }
//   // console.log("returning in applyspider");
//   return spider;
// }

// ZXSTACKCOMPOSE.setPattern(
//   lrec_sc(
//     alt(ZXBASETRANSFORMED, ZXNSTACKTRANSFORMED, ZXCASTTRANSFORMED),
//     seq(
//       alt(tok(lex.TokenKind.Stack), tok(lex.TokenKind.Compose)),
//       alt(ZXBASETRANSFORMED, ZXNSTACKTRANSFORMED, ZXCASTTRANSFORMED)
//     ),
//     applyStackCompose
//   )
// );

// function applyStackCompose(
//   l: ast.ASTNode,
//   args: [Token, ast.ASTNode]
// ): ast.ASTNode {
//   // console.log('calling applyStackCompose');
//   switch (args[0].kind) {
//     case lex.TokenKind.Compose: {
//       return { kind: "compose", left: l, right: args[1] } as ast.ASTCompose;
//     }
//     case lex.TokenKind.Stack: {
//       return { kind: "stack", left: l, right: args[1] } as ast.ASTStack;
//     }
//     default: {
//       // throw new Error(`Unknown compose: ${args[0].text}`);
//       return l;
//     }
//   }
// }

// function applyNStack(args: [ast.Num, Token, ast.ASTNode]): ast.ASTNode {
//   switch (args[1].kind) {
//     case lex.TokenKind.NStack: {
//       let n = parseInt(args[0].val);
//       // loop faster than map performance wise

//       return { kind: "nstack", n: args[0], node: args[2] } as ast.ASTNStack;
//     }
//     case lex.TokenKind.NStack1: {
//       let n = parseInt(args[0].val);

//       return { kind: "nstack1", n: args[0], node: args[2] } as ast.ASTNStack1;
//     }
//     default: {
//       throw new Error(`Unknown nstack???: ${args[1].kind}`);
//     }
//   }
// }

// function applyCast(args: [ast.Num, ast.Num, ast.ASTNode]): ast.ASTNode {
//   return { kind: "cast", n: args[0], m: args[1], node: args[2] } as ast.ASTCast;
// }

// ZXNSTACK.setPattern(
//   apply(
//     seq(
//       NUML40,
//       alt(tok(lex.TokenKind.NStack), tok(lex.TokenKind.NStack1)),
//       ZXBASETRANSFORMED
//     ),
//     applyNStack
//   )
// );

// ZXNSTACKTRANSFORMED.setPattern(
//   apply(
//     seq(
//       rep_sc(tok(lex.TokenKind.ColorSwap)),
//       lrec_sc(
//         ZXNSTACK,
//         alt(
//           tok(lex.TokenKind.Adjoint),
//           tok(lex.TokenKind.Transpose),
//           tok(lex.TokenKind.Conjugate)
//         ),
//         applyTransformPost
//       )
//     ),
//     applyTransformPre
//   )
// );

// ZXCAST.setPattern(
//   apply(
//     seq(
//       kright(tok(lex.TokenKind.Cast$), NUML40),
//       kright(tok(lex.TokenKind.Comma), NUML40),
//       kmid(
//         tok(lex.TokenKind.Cast3Colon),
//         alt(ZXBASETRANSFORMED, ZXNSTACKTRANSFORMED, ZXSTACKCOMPOSE, ZXCAST),
//         tok(lex.TokenKind.Cast$)
//       )
//     ),
//     applyCast
//   )
// );

// ZXCASTTRANSFORMED.setPattern(
//   apply(
//     seq(
//       rep_sc(tok(lex.TokenKind.ColorSwap)),
//       lrec_sc(
//         ZXCAST,
//         alt(
//           tok(lex.TokenKind.Adjoint),
//           tok(lex.TokenKind.Transpose),
//           tok(lex.TokenKind.Conjugate)
//         ),
//         applyTransformPost
//       )
//     ),
//     applyTransformPre
//   )
// );

// ZXPROPTO.setPattern(
//   apply(
//     seq(
//       alt(
//         ZXBASETRANSFORMED,
//         ZXNSTACKTRANSFORMED,
//         ZXSTACKCOMPOSE,
//         ZXCASTTRANSFORMED
//       ),
//       tok(lex.TokenKind.PropTo),
//       alt(
//         ZXBASETRANSFORMED,
//         ZXNSTACKTRANSFORMED,
//         ZXSTACKCOMPOSE,
//         ZXCASTTRANSFORMED
//       )
//     ),
//     applyPropTo
//   )
// );

// function applyTransformPre(args: [Token[], ast.ASTNode]): ast.ASTNode {
//   let cur_node = args[1];
//   for (let i of args[0]) {
//     cur_node = nestColorSwap(cur_node);
//   }
//   return cur_node;
// }

// function nestColorSwap(node: ast.ASTNode): ast.ASTTransform {
//   return {
//     kind: "transform",
//     transform: ast.MTransform.ColorSwap,
//     node: node,
//   } as ast.ASTTransform;
// }

// function applyTransformPost(node: ast.ASTNode, transform: Token): ast.ASTNode {
//   let t;
//   if (transform.kind === lex.TokenKind.Transpose) {
//     t = ast.MTransform.Transpose;
//   } else if (transform.kind === lex.TokenKind.Conjugate) {
//     t = ast.MTransform.Conjugate;
//   } else if (transform.kind === lex.TokenKind.Adjoint) {
//     t = ast.MTransform.Adjoint;
//   } else {
//     throw new Error(`unknown kind ${transform.kind} in applyTransformPost`);
//   }
//   return {
//     kind: "transform",
//     transform: t,
//     node: node,
//   } as ast.ASTTransform;
// }

// function applyPropTo(args: [ast.ASTNode, Token, ast.ASTNode]): ast.ASTNode {
//   return { kind: "propto", l: args[0], r: args[2] } as ast.ASTPropTo;
// }

// ASTNODE.setPattern(
//   alt(
//     ZXPROPTO,
//     ZXBASETRANSFORMED,
//     ZXNSTACKTRANSFORMED,
//     ZXSTACKCOMPOSE,
//     ZXCASTTRANSFORMED
//   )
// );

// // all tokens that are not symbols must be variables
// // for any variable that is parsed as a morphism,
// // look up its type in the context. if type exists populate info. if not then it is a black box.

// // export function getNonSymbolicTokens(expr : string) : string [] {
// //   let lx = lex.lexer.parse(expr);
// //   let list_tokens : string [] = [];
// //   while (lx) {
// //     list_tokens.push(lx.text);
// //     lx = lx?.next;
// //   }
// //   return list_tokens;
// // }

// ******************* RULES **********************
let Γ: undefined | Map<string, ast.ASTNode> = undefined;
const CATEGORY_VAR = rule<lex.TokenKind, ast.ASTCategoryVar>();
const MORPHISM_VAR = rule<lex.TokenKind, ast.ASTMorphismVar>();
const COMPOSE = rule<lex.TokenKind, ast.ASTCompose>();
const IDENTITY_MORPH = rule<lex.TokenKind, ast.ASTIdentityMorphism>();
const INVERSE = rule<lex.TokenKind, ast.ASTInverse>();

const MORPH_EQUIV = rule<lex.TokenKind, ast.ASTMorphismEquivalence>();

// change when more TODO
let CATEGORY = rule<lex.TokenKind, ast.ASTCategory>();
const MORPHISM = rule<lex.TokenKind, ast.ASTMorphism>();
const PROP = rule<lex.TokenKind, ast.ASTProp>();

function applyCategoryVar(
  Γ: Map<string, ast.ASTNode> | undefined,
  tok: Token
): ast.ASTCategoryVar {
  let v = tok.text;
  if (Γ !== undefined) {
    let ctx_node = Γ.get(v);
    if (ctx_node !== undefined && ctx_node.kind !== "Category") {
      // TODO
      throw new Error("explicitly not a category in ctx!!");
    }
  }
  return {
    kind: "Category",
    name: v,
  };
}

function applyMorphismVar(
  Γ: Map<string, ast.ASTNode> | undefined,
  tok: Token
): ast.ASTMorphismVar {
  let v = tok.text;
  if (Γ !== undefined) {
    let ctx_node = Γ.get(v);
    if (ctx_node !== undefined && ctx_node.kind !== "Morphism") {
      // TODO
      throw new Error("explicitly not a morphism in ctx!!");
    }
    if (ctx_node !== undefined) {
      return ctx_node as ast.ASTMorphismVar;
    }
  }
  return {
    kind: "Morphism",
    name: v,
  };
}

function applyCompose(
  args: [ast.ASTMorphism, Token, ast.ASTMorphism]
): ast.ASTCompose {
  let node: ast.ASTCompose = {
    kind: "Compose",
    left: args[0],
    right: args[2],
  };
  if (args[0].morph_input && args[2].morph_output) {
    node.morph_input = args[0].morph_input;
    node.morph_output = args[2].morph_output;
  }
  return node;
}

function applyIdentityMorphism(
  args: [Token, ast.ASTCategory]
): ast.ASTIdentityMorphism {
  return {
    kind: "IdentityMorphism",
    cat: args[1],
    morph_input: args[1],
    morph_output: args[1],
  };
}

function applyInverse(args: [ast.ASTMorphism, Token]): ast.ASTInverse {
  let node: ast.ASTInverse = {
    kind: "Inverse",
    morph: args[0],
  };
  if (args[0].morph_input && args[0].morph_output) {
    node.morph_input = args[0].morph_output;
    node.morph_output = args[0].morph_input;
  }
  return node;
}

function applyMorphEquiv(
  args: [ast.ASTNode, Token, ast.ASTNode]
): ast.ASTMorphismEquivalence {
  return {
    kind: "MorphismEquivalence",
    left: args[0],
    right: args[2],
  };
}

// HOW TO HANDLE ERRORS? where do i catch 'em?? need some sort of "run"

CATEGORY_VAR.setPattern(
  apply(tok(lex.TokenKind.VarToken), applyCategoryVar.bind(null, Γ))
);

CATEGORY = CATEGORY_VAR;

MORPHISM_VAR.setPattern(
  apply(tok(lex.TokenKind.VarToken), applyMorphismVar.bind(null, Γ))
);

IDENTITY_MORPH.setPattern(
  apply(
    seq(tok(lex.TokenKind.IdentityMorphismToken), CATEGORY),
    applyIdentityMorphism
  )
);

// todo lrec
INVERSE.setPattern(
  apply(
    seq(alt(IDENTITY_MORPH, MORPHISM_VAR), tok(lex.TokenKind.InverseToken)),
    applyInverse
  )
);

// *********************** HYPOTHESIS PARSING ***********************

// we don't care about type "Type" etc bc too much work and also not useful
export function astNodeFromCatString(str: string): ast.ASTNode | undefined {
  if (str.startsWith("Category")) {
    let cat = str.slice("Category ".length);
    return { kind: "Category", name: cat } as ast.ASTCategoryVar;
  }

  if (str.includes(c.MORPHISM)) {
    let from = str.slice(0, str.indexOf(c.MORPHISM)).replace(" ", "");
    let fromcat: ast.ASTCategoryVar = { kind: "Category", name: from };
    let to = str
      .slice(str.indexOf(c.MORPHISM) + c.MORPHISM.length)
      .replace(" ", "");
    let tocat: ast.ASTCategoryVar = { kind: "Category", name: to };
    return {
      kind: "Morphism",
      morph_input: fromcat,
      morph_output: tocat,
    } as ast.ASTMorphism;
  }

  if (str.includes(c.MORPH_EQUIV)) {
    let from = str.slice(0, str.indexOf(c.MORPHISM)).replace(" ", "");
    let fromMorph: ast.ASTMorphismVar = { kind: "Morphism", name: from };
    let to = str
      .slice(str.indexOf(c.MORPH_EQUIV) + c.MORPH_EQUIV.length)
      .replace(" ", "");
    let toMorph: ast.ASTMorphismVar = { kind: "Morphism", name: to };
    return {
      kind: "MorphismEquivalence",
      left: fromMorph,
      right: toMorph,
    } as ast.ASTMorphismEquivalence;
  }

  if (str.includes(c.COMPOSE)) {
    let from = str.slice(0, str.indexOf(c.COMPOSE)).replace(" ", "");
    let fromMorph: ast.ASTMorphismVar = { kind: "Morphism", name: from };
    let to = str
      .slice(str.indexOf(c.COMPOSE) + c.COMPOSE.length)
      .replace(" ", "");
    let toMorph: ast.ASTMorphismVar = { kind: "Morphism", name: to };
    return {
      kind: "Compose",
      left: fromMorph,
      right: toMorph,
    } as ast.ASTCompose;
  }

  return undefined;
}

export function context(expr: any): Map<string, ast.ASTNode> {
  let Γ = new Map<string, ast.ASTNode>();
  expr.map((hyp: { names: any[]; ty: string }) =>
    hyp.names.map((name: string) => {
      let node = astNodeFromCatString(hyp.ty);
      if (node !== undefined) {
        Γ.set(name, node);
      }
    })
  );
  return Γ;
}

export function parseAST(expr: string): ast.ASTNode {
  Γ = context(expr);
  let parsed = expectEOF(PROP.parse(lex.lexer.parse(expr)));
  // some way of saying "throw away only the ones that error, but don't throw away the entire thing if it errors."
  return expectSingleResult(parsed);
}

// export function parseAST(expr: string): ast.ASTNode {
//   let parsed = expectEOF(ASTNODE.parse(lex.lexer.parse(expr)));
//   // if (parsed.successful) {
//   //   for (let i = 0; i < parsed.candidates.length; i++) {
//   //     console.log(parsed.candidates[i].result);
//   //   }
//   // }
//   if (parsed.successful && parsed.candidates.length > 1) {
//     console.log(`${parsed.candidates.length} results parsed.`);
//     // let i = 0;
//     // let flag = true;
//     // while (i < parsed.candidates.length - 1) {
//     //   if (
//     //     !_.isEqual(parsed.candidates[i].result, parsed.candidates[i + 1].result)
//     //   ) {
//     //     flag = false;
//     //     break;
//     //   }
//     //   i++;
//     // }
//     // if (flag) {
//     return parsed.candidates[0].result;
//     // }
//   }
//   // console.log("candidate length = ", parsed.candidates.length);
//   return expectSingleResult(parsed);
// }
