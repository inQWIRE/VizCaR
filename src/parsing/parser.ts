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
import { lexerWithPrettyPrinter } from "./lexer";
import assert = require("assert");

type Token = psec.Token<lex.TokenKind>;

export function parseAST(expr: any): ASTNode {
  Γ = context(expr.hyps);
  console.log("ctx: ", Γ);
  let parsed = PROP.parse(lex.lexer.parse(expr.ty));
  if (parsed.successful) {
    let parsed_candidates_2 = parsed.candidates.filter(
      (x) => x.result !== undefined
    );
    assert(parsed_candidates_2.length === 1);
    return parsed_candidates_2[0].result as Prop;
  }
  console.log(parsed);
  throw new Error(`unsuccessful parse: ${expr.ty}`);
}

// ******************* RULES **********************
let Γ: undefined | Map<string, ASTNode> = undefined;

// ********************** OBJECTS **********************

const CAT_OBJECT_L0 = rule<lex.TokenKind, CatObject>();
const CAT_OBJECT_L40 = rule<lex.TokenKind, CatObject>();
const ISOMORPH = rule<lex.TokenKind, Morph | undefined>();
const MORPH_L0 = rule<lex.TokenKind, Morph | undefined>();
const MORPH_L25 = rule<lex.TokenKind, Morph | undefined>();
const MORPH_L40 = rule<lex.TokenKind, Morph | undefined>();
const MORPH_L65 = rule<lex.TokenKind, Morph | undefined>();
const PROP = rule<lex.TokenKind, Prop | undefined>();

function applyObjectVar(tok: Token): CatObject {
  return {
    type: "ObjectVar",
    name: tok.text,
    as_text: tok.text,
  };
}

function applyDual(a: CatObject): CatObject {
  return {
    type: "Dual",
    a,
    as_text: a.as_text.concat(c.OBJ_DUAL),
  };
}

function applyObjTensor(l: CatObject, r: CatObject): CatObject {
  return {
    type: "ObjTensor",
    l,
    r,
    as_text: l.as_text.concat(c.OBJ_TENSOR.concat(r.as_text)),
  };
}

CAT_OBJECT_L0.setPattern(
  alt(
    kmid(tok(lex.TokenKind.LParen), CAT_OBJECT_L40, tok(lex.TokenKind.RParen)),
    lrec_sc(
      apply(tok(lex.TokenKind.VarToken), applyObjectVar),
      tok(lex.TokenKind.ObjDualToken),
      applyDual
    )
  )
);

CAT_OBJECT_L40.setPattern(
  lrec_sc(
    CAT_OBJECT_L0,
    kright(tok(lex.TokenKind.ObjTensorToken), CAT_OBJECT_L0),
    applyObjTensor
  )
);

function applyIsomorphismVar(tok: Token): Morph | undefined {
  let v = tok.text;
  if (Γ !== undefined) {
    let ctx_node = Γ.get(v);
    if (ctx_node !== undefined && ctx_node.type !== "Isomorphism") {
      // TODO
      // console.log("returning undefined in applyIsomorphismVar for ", v);
      return undefined;
    }
    if (ctx_node !== undefined) {
      return JSON.parse(JSON.stringify(ctx_node)) as Morph;
    }
  }
  // console.log("Gamma undefined in applyIsomorphismVar, ", v);
  return {
    type: "Isomorphism",
    i: {
      type: "IsomorphVar",
      name: v,
    },
  };
}

function applyLeftUnitor(a: CatObject): Morph | undefined {
  return {
    type: "Isomorphism",
    i: {
      type: "LeftUnitor",
      a,
    },
  };
}

function applyRightUnitor(a: CatObject): Morph | undefined {
  return {
    type: "Isomorphism",
    i: {
      type: "RightUnitor",
      a,
    },
  };
}

function applyAssociator(
  args: [CatObject, CatObject, CatObject]
): Morph | undefined {
  return {
    type: "Isomorphism",
    i: {
      type: "Associator",
      a: args[0],
      b: args[1],
      m: args[2],
    },
  };
}

function applyBraiding(args: [CatObject, CatObject]): Morph | undefined {
  return {
    type: "Isomorphism",
    i: {
      type: "Braiding",
      x: args[0],
      y: args[1],
    },
  };
}

ISOMORPH.setPattern(
  alt(
    apply(tok(lex.TokenKind.VarToken), applyIsomorphismVar.bind(Γ)),
    apply(
      kright(tok(lex.TokenKind.LeftUnitorToken), CAT_OBJECT_L40),
      applyLeftUnitor
    ),
    apply(
      kright(tok(lex.TokenKind.RightUnitorToken), CAT_OBJECT_L40),
      applyRightUnitor
    ),
    apply(
      seq(
        kright(tok(lex.TokenKind.BraidToken), CAT_OBJECT_L40),
        kright(tok(lex.TokenKind.Comma), CAT_OBJECT_L40)
      ),
      applyBraiding
    ),
    apply(
      seq(
        kright(tok(lex.TokenKind.AssociatorToken), CAT_OBJECT_L40),
        kright(tok(lex.TokenKind.Comma), CAT_OBJECT_L40),
        kright(tok(lex.TokenKind.Comma), CAT_OBJECT_L40)
      ),
      applyAssociator
    )
  )
);

function applyMorphismVar(tok: Token): Morph | undefined {
  let v = tok.text;
  if (Γ !== undefined) {
    let ctx_node = Γ.get(v);
    if (ctx_node !== undefined && ctx_node.type !== "MorphVar") {
      // TODO
      // console.log("returning undefined in applyMorphismVar for ", v);
      return undefined;
      // throw new Error("explicitly not a morphism in ctx!!");
    }
    if (ctx_node !== undefined) {
      return JSON.parse(JSON.stringify(ctx_node)) as Morph;
    }
  }
  // console.log("Gamma undefined in applyMorphismVar, ", v);
  return {
    type: "MorphVar",
    name: v,
  };
}

function applyMorphismId(cat: CatObject): Morph | undefined {
  return {
    type: "MorphId",
    cat,
  };
}

function applyMorphismInv(on: Morph | undefined): Morph | undefined {
  if (on) {
    return {
      type: "MorphInv",
      on,
    };
  }
  return undefined;
}

function applyMorphismCompose(
  l: Morph | undefined,
  r: Morph | undefined
): Morph | undefined {
  if (l && r) {
    return {
      type: "MorphCompose",
      l,
      r,
    };
  }
  return undefined;
}

function applyMorphismTensor(
  l: Morph | undefined,
  r: Morph | undefined
): Morph | undefined {
  if (l && r) {
    return {
      type: "MorphTensor",
      l,
      r,
    };
  }
  return undefined;
}

function applyMorphismDagger(f: Morph | undefined): Morph | undefined {
  if (f) {
    return {
      type: "MorphDagger",
      f,
    };
  }
  return undefined;
}

MORPH_L0.setPattern(
  alt(
    kmid(tok(lex.TokenKind.LParen), MORPH_L65, tok(lex.TokenKind.RParen)),
    apply(tok(lex.TokenKind.VarToken), applyMorphismVar.bind(Γ)),
    ISOMORPH,
    apply(
      kright(tok(lex.TokenKind.IdentityMorphismToken), CAT_OBJECT_L40),
      applyMorphismId
    )
  )
);

MORPH_L25.setPattern(
  lrec_sc(
    MORPH_L0,
    kright(tok(lex.TokenKind.InverseToken), MORPH_L0),
    applyMorphismInv
  )
);

MORPH_L40.setPattern(
  lrec_sc(
    MORPH_L25,
    kright(tok(lex.TokenKind.MorphismTensorToken), MORPH_L25),
    applyMorphismTensor
  )
);

MORPH_L65.setPattern(
  lrec_sc(
    MORPH_L40,
    kright(tok(lex.TokenKind.ComposeToken), MORPH_L40),
    applyMorphismCompose
  )
);

function applyMorphEquiv(
  args: [Morph | undefined, Morph | undefined]
): Prop | undefined {
  if (args[0] && args[1]) {
    return {
      type: "MorphEquiv",
      l: args[0],
      r: args[1],
    };
  }
  return undefined;
}

PROP.setPattern(
  apply(
    seq(MORPH_L65, kright(tok(lex.TokenKind.MorphismEquivToken), MORPH_L65)),
    applyMorphEquiv
  )
);

export function nodeFromContext(
  name: string,
  str: string
): ASTNode | undefined {
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
    // TODO parse as obj not just str
    let fromObj: CatObject = { type: "ObjectVar", name: from, as_text: from };
    let to = str
      .slice(str.indexOf(c.ISOMORPHISM) + c.ISOMORPHISM.length)
      .replace(" ", "");
    let toObj: CatObject = { type: "ObjectVar", name: to, as_text: to };
    return {
      type: "Isomorphism",
      i: {
        name: name,
        type: "IsomorphVar",
        l: fromObj,
        r: toObj,
      },
    };
  }

  if (str.includes(c.MORPHISM)) {
    let from = str.slice(0, str.indexOf(c.MORPHISM)).replace(" ", "");
    let fromObj: CatObject = { type: "ObjectVar", name: from, as_text: from };
    let to = str
      .slice(str.indexOf(c.MORPHISM) + c.MORPHISM.length)
      .replace(" ", "");
    let toObj: CatObject = { type: "ObjectVar", name: to, as_text: to };
    return {
      type: "MorphVar",
      inp: fromObj,
      outp: toObj,
      name: name,
    } as Morph;
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
