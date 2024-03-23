import { buildLexer } from "typescript-parsec";
import * as c from "../constants/consts";

export enum TokenKind {
  VarToken,

  MorphismToken,
  MorphismEquivToken,
  ComposeToken,
  InverseToken,
  IdentityMorphismToken,

  ObjTensorToken,
  MorphismTensorToken,
  LeftUnitorToken,
  RightUnitorToken,

  BraidToken,

  ObjDualToken,

  DaggerToken,

  LParen,
  RParen,
  Comma,

  Space,
}

export const lexer = buildLexer([
  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],
  [true, /^\,/g, TokenKind.Comma],

  [true, /^[A-WYa-zΑ-Ωα-ω][A-Za-zΑ-Ωα-ω0-9'_]*/g, TokenKind.VarToken],

  [true, new RegExp(`\^[${c.MORPHISM}]`, "g"), TokenKind.MorphismToken],
  [true, new RegExp(`\^[${c.MORPH_EQUIV}]`, "g"), TokenKind.MorphismEquivToken],
  [true, new RegExp(`\^[${c.COMPOSE}]`, "g"), TokenKind.ComposeToken],
  [true, new RegExp(`\^[${c.INVERSE}]`, "g"), TokenKind.InverseToken],
  [
    true,
    new RegExp(`\^[${c.IDENTITY_MORPHISM}]`, "g"),
    TokenKind.IdentityMorphismToken,
  ],

  [true, new RegExp(`\^[${c.OBJ_TENSOR}]`, "g"), TokenKind.ObjTensorToken],
  [
    true,
    new RegExp(`\^[${c.MORPH_TENSOR}]`, "g"),
    TokenKind.MorphismTensorToken,
  ],
  [true, new RegExp(`\^[${c.LEFT_UNITOR}]`, "g"), TokenKind.LeftUnitorToken],
  [true, new RegExp(`\^[${c.RIGHT_UNITOR}]`, "g"), TokenKind.RightUnitorToken],

  [true, new RegExp(`\^[${c.BRAID}]`, "g"), TokenKind.BraidToken],

  [true, new RegExp(`\^[${c.DAGGER}]`, "g"), TokenKind.DaggerToken],

  [false, /^\s+/g, TokenKind.Space],
]);

export function lexerPrettyPrinter(expr: string) {
  let lx = lexer.parse(expr);
  let printlx = "";
  while (lx) {
    printlx += TokenKind[lx.kind] + ", ";
    lx = lx?.next;
  }
  console.log(printlx.substring(0, printlx.length - 1));
}
