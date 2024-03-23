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

import { CatObject, Isomorph, Morph, Prop, ASTNode } from "./ast";
import * as c from "../constants/consts";
import * as lex from "./lexer";
import { lexerPrettyPrinter } from "./lexer";

type Token = psec.Token<lex.TokenKind>;

// ******************* RULES **********************
let Γ: undefined | Map<string, ASTNode> = undefined;

// ********************** OBJECTS **********************

const CAT_OBJECT_L0 = rule<lex.TokenKind, CatObject>();
const CAT_OBJECT_L40 = rule<lex.TokenKind, CatObject>();
const ISOMORPH_L0 = rule<lex.TokenKind, Isomorph>();
const ISOMORPH_L30 = rule<lex.TokenKind, Isomorph>();
const ISOMORPH_L39 = rule<lex.TokenKind, Isomorph>();
const MORPH = rule<lex.TokenKind, Morph>();
const PROP = rule<lex.TokenKind, Prop>();

function applyObjectVar(tok: Token): CatObject {
  return {
    type: "ObjectVar",
    name: tok.text,
  };
}

function applyDual(a: CatObject): CatObject {
  return {
    type: "Dual",
    a,
  };
}

function applyObjTensor(l: CatObject, r: CatObject): CatObject {
  return {
    type: "ObjTensor",
    l,
    r,
  };
}

CAT_OBJECT_L0.setPattern(
  lrec_sc(
    apply(tok(lex.TokenKind.VarToken), applyObjectVar),
    tok(lex.TokenKind.ObjDualToken),
    applyDual
  )
);

CAT_OBJECT_L40.setPattern(
  lrec_sc(
    CAT_OBJECT_L0,
    kright(tok(lex.TokenKind.ObjTensorToken), CAT_OBJECT_L0),
    applyObjTensor
  )
);

// const CATEGORY_VAR = rule<lex.Tokentype, ast.ASTCategory>();
// const MORPHISM_VAR = rule<lex.Tokentype, ast.ASTMorphism>();
// const COMPOSE = rule<lex.Tokentype, ast.ASTMorphism>();
// const IDENTITY_MORPH = rule<lex.Tokentype, ast.ASTMorphism>();
// const INVERSE = rule<lex.Tokentype, ast.ASTMorphism>();
// const MORPH_EQUIV = rule<lex.Tokentype, ast.ASTProp>();

// // change when more TODO
// let CATEGORY = rule<lex.Tokentype, ast.ASTNode>();
// let MORPHISM = rule<lex.Tokentype, ast.ASTNode>();
// let PROP = rule<lex.Tokentype, ast.ASTNode>();

// function applyCategoryVar(
//   Γ: Map<string, ast.ASTNode> | undefined,
//   tok: Token
// ): ast.ASTCategoryVar {
//   let v = tok.text;
//   if (Γ) {
//     let ctx_node = Γ.get(v);
//     if (ctx_node !== undefined && ctx_node.type !== "Category") {
//       // TODO
//       throw new Error("explicitly not a category in ctx!!");
//     }
//   }
//   return {
//     type: "Category",
//     name: v,
//   };
// }

// function applyMorphismVar(
//   Γ: Map<string, ast.ASTNode> | undefined,
//   tok: Token
// ): ast.ASTMorphism {
//   let v = tok.text;
//   if (Γ !== undefined) {
//     let ctx_node = Γ.get(v);
//     if (
//       ctx_node !== undefined &&
//       ctx_node.type !== "Morphism" &&
//       ctx_node.type !== "Isomorphism"
//     ) {
//       // TODO
//       throw new Error("explicitly not a morphism in ctx!!");
//     }
//     if (ctx_node !== undefined) {
//       if (ctx_node.type === "Isomorphism") {
//         return ctx_node as ast.ASTIsomorphism;
//       }
//       return ctx_node as ast.ASTMorphismVar;
//     }
//   }
//   return {
//     type: "Morphism",
//     name: v,
//   } as ast.ASTMorphismVar;
// }

// function applyCompose(
//   left: ast.ASTMorphism,
//   right: ast.ASTMorphism
// ): ast.ASTCompose {
//   let node: ast.ASTCompose = {
//     type: "Compose",
//     left: left,
//     right: right,
//   };
//   if (left.morph_input && right.morph_output) {
//     node.morph_input = left.morph_input;
//     node.morph_output = right.morph_output;
//   }
//   return node;
// }

// function applyIdentityMorphism(
//   args: [Token, ast.ASTCategory]
// ): ast.ASTIdentityMorphism {
//   return {
//     type: "IdentityMorphism",
//     cat: args[1],
//     morph_input: args[1],
//     morph_output: args[1],
//   };
// }

// function applyInverse(fst: ast.ASTMorphism, _: Token): ast.ASTInverse {
//   let node: ast.ASTInverse = {
//     type: "Inverse",
//     morph: fst,
//   };
//   if (fst.morph_input && fst.morph_output) {
//     node.morph_input = fst.morph_output;
//     node.morph_output = fst.morph_input;
//   }
//   return node;
// }

// function applyMorphEquiv(
//   args: [ast.ASTNode, Token, ast.ASTNode]
// ): ast.ASTMorphismEquivalence {
//   return {
//     type: "MorphismEquivalence",
//     left: args[0],
//     right: args[2],
//   };
// }

// // HOW TO HANDLE ERRORS? where do i catch 'em?? need some sort of "run"

// CATEGORY_VAR.setPattern(
//   alt(
//     apply(tok(lex.Tokentype.VarToken), applyCategoryVar.bind(null, Γ)),
//     CATEGORY
//   )
// );

// CATEGORY = CATEGORY_VAR;

// MORPHISM_VAR.setPattern(
//   alt(
//     apply(tok(lex.Tokentype.VarToken), applyMorphismVar.bind(null, Γ)),
//     MORPHISM
//   )
// );

// IDENTITY_MORPH.setPattern(
//   apply(
//     seq(tok(lex.Tokentype.IdentityMorphismToken), CATEGORY),
//     applyIdentityMorphism
//   )
// );

// INVERSE.setPattern(
//   lrec_sc(
//     alt(IDENTITY_MORPH, MORPHISM_VAR),
//     tok(lex.Tokentype.InverseToken),
//     applyInverse
//   )
// );

// COMPOSE.setPattern(
//   lrec_sc(
//     INVERSE,
//     kright(tok(lex.Tokentype.ComposeToken), INVERSE),
//     applyCompose
//   )
// );

// MORPHISM = COMPOSE;

// MORPH_EQUIV.setPattern(
//   apply(
//     seq(MORPHISM, tok(lex.Tokentype.MorphismEquivToken), MORPHISM),
//     applyMorphEquiv
//   )
// );

// PROP = MORPH_EQUIV;

// *********************** HYPOTHESIS PARSING ***********************

export function nodeFromContext(
  name: string,
  str: string
): ASTNode | undefined {
  if (str.includes(c.MORPHISM)) {
    let from = str.slice(0, str.indexOf(c.MORPHISM)).replace(" ", "");
    let fromObj: CatObject = { type: "ObjectVar", name: from };
    let to = str
      .slice(str.indexOf(c.MORPHISM) + c.MORPHISM.length)
      .replace(" ", "");
    let toObj: CatObject = { type: "ObjectVar", name: to };
    return {
      type: "MorphVar",
      inp: fromObj,
      outp: toObj,
      name: name,
    } as Morph;
  }

  if (str.includes(c.MORPH_EQUIV)) {
    let from = str.slice(0, str.indexOf(c.MORPHISM)).replace(" ", "");
    let fromMorph: Morph = { type: "MorphVar", name: from };
    let to = str
      .slice(str.indexOf(c.MORPH_EQUIV) + c.MORPH_EQUIV.length)
      .replace(" ", "");
    let toMorph: Morph = { type: "MorphVar", name: to };
    return {
      name: name,
      type: "MorphEquiv",
      l: fromMorph,
      r: toMorph,
    } as Prop;
  }

  if (str.includes(c.COMPOSE)) {
    let from = str.slice(0, str.indexOf(c.COMPOSE)).replace(" ", "");
    let fromMorph: Morph = { type: "MorphVar", name: from };
    let to = str
      .slice(str.indexOf(c.COMPOSE) + c.COMPOSE.length)
      .replace(" ", "");
    let toMorph: Morph = { type: "MorphVar", name: to };
    return {
      name: name,
      type: "MorphCompose",
      l: fromMorph,
      r: toMorph,
    } as Morph;
  }

  if (str.includes(c.ISOMORPHISM)) {
    let from = str.slice(0, str.indexOf(c.ISOMORPHISM)).replace(" ", "");
    let fromObj: CatObject = { type: "ObjectVar", name: from };
    let to = str
      .slice(str.indexOf(c.ISOMORPHISM) + c.ISOMORPHISM.length)
      .replace(" ", "");
    let toObj: CatObject = { type: "ObjectVar", name: to };
    return {
      name: "name",
      type: "IsomorphVar",
      l: fromObj,
      r: toObj,
    } as Isomorph;
  }
  return undefined;
}

export function context(expr: any): Map<string, ASTNode> {
  let Γ = new Map<string, ASTNode>();
  expr.map((hyp: { names: any[]; ty: string }) =>
    hyp.names.map((name: string) => {
      let node = nodeFromContext(name, hyp.ty);
      if (node !== undefined) {
        Γ.set(name, node);
      }
    })
  );
  return Γ;
}

export function parseAST(expr: string): ASTNode {
  Γ = context(expr);
  let parsed = expectEOF(PROP.parse(lex.lexer.parse(expr)));
  // some way of saying "throw away only the ones that error, but don't throw away the entire thing if it errors."
  return expectSingleResult(parsed);
}
