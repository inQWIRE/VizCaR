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
let errorNode: Morph = {
  type: "MorphVar",
  name: "error",
};

// ********************** OBJECTS **********************

const CAT_OBJECT_L0 = rule<lex.TokenKind, CatObject>();
const CAT_OBJECT_L40 = rule<lex.TokenKind, CatObject>();
const ISOMORPH = rule<lex.TokenKind, Morph>();
const MORPH_L0 = rule<lex.TokenKind, Morph>();
const MORPH_L25 = rule<lex.TokenKind, Morph>();
const MORPH_L40 = rule<lex.TokenKind, Morph>();
const MORPH_L65 = rule<lex.TokenKind, Morph>();
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

function applyIsomorphismVar(
  Γ: Map<string, ASTNode> | undefined,
  tok: Token
): Morph {
  let v = tok.text;
  if (Γ !== undefined) {
    let ctx_node = Γ.get(v);
    if (ctx_node !== undefined && ctx_node.type !== "Isomorphism") {
      // TODO
      return errorNode;
    }
    if (ctx_node !== undefined) {
      return ctx_node;
    }
  }
  return {
    type: "Isomorphism",
    i: {
      type: "IsomorphVar",
      name: v,
    },
  };
}

function applyLeftUnitor(a: CatObject): Morph {
  return {
    type: "Isomorphism",
    i: {
      type: "LeftUnitor",
      a,
    },
  };
}

function applyRightUnitor(a: CatObject): Morph {
  return {
    type: "Isomorphism",
    i: {
      type: "RightUnitor",
      a,
    },
  };
}

function applyBraiding(args: [CatObject, CatObject]): Morph {
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
    apply(tok(lex.TokenKind.VarToken), applyIsomorphismVar.bind(null, Γ)),
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
    )
  )
);

function applyMorphismVar(
  Γ: Map<string, ASTNode> | undefined,
  tok: Token
): Morph {
  let v = tok.text;
  if (Γ !== undefined) {
    let ctx_node = Γ.get(v);
    if (ctx_node !== undefined && ctx_node.type !== "MorphVar") {
      // TODO
      return errorNode;
      // throw new Error("explicitly not a morphism in ctx!!");
    }
    if (ctx_node !== undefined) {
      return ctx_node;
    }
  }
  return {
    type: "MorphVar",
    name: v,
  };
}

function applyMorphismId(cat: CatObject): Morph {
  return {
    type: "MorphId",
    cat,
  };
}

function applyMorphismInv(on: Morph): Morph {
  return {
    type: "MorphInv",
    on,
  };
}

function applyMorphismCompose(l: Morph, r: Morph): Morph {
  return {
    type: "MorphCompose",
    l,
    r,
  };
}

function applyMorphismTensor(l: Morph, r: Morph): Morph {
  return {
    type: "MorphTensor",
    l,
    r,
  };
}

function applyMorphismDagger(f: Morph): Morph {
  return {
    type: "MorphDagger",
    f,
  };
}

MORPH_L0.setPattern(
  alt(
    apply(tok(lex.TokenKind.VarToken), applyMorphismVar.bind(null, Γ)),
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

function applyMorphEquiv(args: [Morph, Morph]): Prop {
  return {
    type: "MorphEquiv",
    l: args[0],
    r: args[1],
  };
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
    let fromObj: CatObject = { type: "ObjectVar", name: from };
    let to = str
      .slice(str.indexOf(c.ISOMORPHISM) + c.ISOMORPHISM.length)
      .replace(" ", "");
    let toObj: CatObject = { type: "ObjectVar", name: to };
    return {
      type: "Isomorphism",
      i: {
        name: "name",
        type: "IsomorphVar",
        l: fromObj,
        r: toObj,
      },
    };
  }

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

export function parseAST(expr: any): ASTNode {
  Γ = context(expr.hyps);
  console.log("ctx: ", Γ);
  try {
    let lexed = lex.lexer.parse(expr.ty);
    lexerPrettyPrinter(expr.ty);
    let parsed = expectEOF(PROP.parse(lexed));
    console.log("parsed:", parsed);
    return expectSingleResult(parsed);
  } catch (e) {
    console.log("error in parse, ", e);
    return errorNode;
  }
  // some way of saying "throw away only the ones that error, but don't throw away the entire thing if it errors."
}
