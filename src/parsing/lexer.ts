import { buildLexer } from "typescript-parsec";
import * as c from "../constants/consts";

export enum TokenKind {
  VarToken,

  ArrowToken,
  ArrowEquivToken,
  ComposeToken,
  InverseToken,
  IdentityMorphismToken,

  LParen,
  RParen,

  Space,
}

export const lexer = buildLexer([
  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],

  [true, /^[A-WYa-zΑ-Ωα-ω][A-Za-zΑ-Ωα-ω0-9'_]*/g, TokenKind.VarToken],

  [true, new RegExp(`\^[${c.MORPHISM}]`, "g"), TokenKind.ArrowToken],
  [true, new RegExp(`\^[${c.MORPH_EQUIV}]`, "g"), TokenKind.ArrowEquivToken],
  [true, new RegExp(`\^[${c.COMPOSE}]`, "g"), TokenKind.ComposeToken],
  [true, new RegExp(`\^[${c.INVERSE}]`, "g"), TokenKind.InverseToken],
  [
    true,
    new RegExp(`\^[${c.IDENTITY_MORPHISM}]`, "g"),
    TokenKind.IdentityMorphismToken,
  ],
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
