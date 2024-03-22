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

// ******************* RULES **********************
let Γ: undefined | Map<string, ast.ASTNode> = undefined;
const CATEGORY_VAR = rule<lex.TokenKind, ast.ASTCategory>();
const MORPHISM_VAR = rule<lex.TokenKind, ast.ASTMorphism>();
const COMPOSE = rule<lex.TokenKind, ast.ASTMorphism>();
const IDENTITY_MORPH = rule<lex.TokenKind, ast.ASTMorphism>();
const INVERSE = rule<lex.TokenKind, ast.ASTMorphism>();
const MORPH_EQUIV = rule<lex.TokenKind, ast.ASTProp>();

// change when more TODO
let CATEGORY = rule<lex.TokenKind, ast.ASTNode>();
let MORPHISM = rule<lex.TokenKind, ast.ASTNode>();
let PROP = rule<lex.TokenKind, ast.ASTNode>();

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
): ast.ASTMorphism {
  let v = tok.text;
  if (Γ !== undefined) {
    let ctx_node = Γ.get(v);
    if (
      ctx_node !== undefined &&
      ctx_node.kind !== "Morphism" &&
      ctx_node.kind !== "Isomorphism"
    ) {
      // TODO
      throw new Error("explicitly not a morphism in ctx!!");
    }
    if (ctx_node !== undefined) {
      if (ctx_node.kind === "Isomorphism") {
        return ctx_node as ast.ASTIsomorphism;
      }
      return ctx_node as ast.ASTMorphismVar;
    }
  }
  return {
    kind: "Morphism",
    name: v,
  } as ast.ASTMorphismVar;
}

function applyCompose(
  left: ast.ASTMorphism,
  right: ast.ASTMorphism
): ast.ASTCompose {
  let node: ast.ASTCompose = {
    kind: "Compose",
    left: left,
    right: right,
  };
  if (left.morph_input && right.morph_output) {
    node.morph_input = left.morph_input;
    node.morph_output = right.morph_output;
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

function applyInverse(fst: ast.ASTMorphism, _: Token): ast.ASTInverse {
  let node: ast.ASTInverse = {
    kind: "Inverse",
    morph: fst,
  };
  if (fst.morph_input && fst.morph_output) {
    node.morph_input = fst.morph_output;
    node.morph_output = fst.morph_input;
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
  alt(
    apply(tok(lex.TokenKind.VarToken), applyCategoryVar.bind(null, Γ)),
    CATEGORY
  )
);

CATEGORY = CATEGORY_VAR;

MORPHISM_VAR.setPattern(
  alt(
    apply(tok(lex.TokenKind.VarToken), applyMorphismVar.bind(null, Γ)),
    MORPHISM
  )
);

IDENTITY_MORPH.setPattern(
  apply(
    seq(tok(lex.TokenKind.IdentityMorphismToken), CATEGORY),
    applyIdentityMorphism
  )
);

INVERSE.setPattern(
  lrec_sc(
    alt(IDENTITY_MORPH, MORPHISM_VAR),
    tok(lex.TokenKind.InverseToken),
    applyInverse
  )
);

COMPOSE.setPattern(
  lrec_sc(
    INVERSE,
    kright(tok(lex.TokenKind.ComposeToken), INVERSE),
    applyCompose
  )
);

MORPHISM = COMPOSE;

MORPH_EQUIV.setPattern(
  apply(
    seq(MORPHISM, tok(lex.TokenKind.ArrowEquivToken), MORPHISM),
    applyMorphEquiv
  )
);

PROP = MORPH_EQUIV;

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

  if (str.includes(c.ISOMORPHISM)) {
    let from = str.slice(0, str.indexOf(c.ISOMORPHISM)).replace(" ", "");
    let fromcat: ast.ASTCategoryVar = { kind: "Category", name: from };
    let to = str
      .slice(str.indexOf(c.ISOMORPHISM) + c.ISOMORPHISM.length)
      .replace(" ", "");
    let tocat: ast.ASTCategoryVar = { kind: "Category", name: to };
    return {
      kind: "Isomorphism",
      morph_input: fromcat,
      morph_output: tocat,
    } as ast.ASTIsomorphism;
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
