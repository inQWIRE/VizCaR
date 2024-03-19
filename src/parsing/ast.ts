import { quad } from "../constants/types";

export interface ASTNode {
  kind: string;
  hor_len?: number;
  ver_len?: number;
  boundary?: quad;
}

export interface Variable {
  name: string;
  value?: string;
}

export interface ASTCategory extends ASTNode, Variable {
  kind: "Category";
}

export interface ASTMorphism extends ASTNode, Variable {
  kind: "Morphism";
  input?: ASTCategory;
  output?: ASTCategory;
}

export interface ASTMorphismEquivalence extends ASTNode {
  kind: "MorphismEquivalence";
  left: ASTMorphism;
  right: ASTMorphism;
}

export interface ASTCompose extends ASTNode {
  kind: "Compose";
  left: ASTMorphism;
  right: ASTMorphism;
}

export interface ASTIdentityMorphism extends ASTNode {
  kind: "IdentityMorphism";
  morph: ASTMorphism;
}

export interface ASTInverse extends ASTNode {
  kind: "Inverse";
  morph: ASTMorphism;
}

// export enum ZXConst {
//   Swap,
//   Empty,
//   Wire,
//   Box,
//   Cap,
//   Cup,
// }

// export enum MTransform {
//   Transpose,
//   Adjoint,
//   Conjugate,
//   ColorSwap,
//   Flip,
// }

// // numbers are just strings because we don't want to actually evaluate them and we want "1 + 2 * 3" to be a valid number
// // but we still have the ast for a specific expression, it's just that the kind of the ast is a number.
// export interface Num {
//   kind: string;
//   val: string;
//   expr: string;
// }

// export interface Number extends Num {
//   kind: "num";
//   val: string;
// }

// // variables are also just numbers
// export interface NumVar extends Num {
//   kind: "numvar";
//   val: string;
// }

// export interface ArithOp extends Num {
//   kind: "num";
//   val: "+" | "-" | "*" | "/" | "^";
//   left: Num;
//   right: Num;
// }

// export interface NumFunc extends Num {
//   kind: "numfunc";
//   fname: string;
//   args: [Num];
// }

// export interface Real01 extends Num {
//   kind: "numreal01";
//   n: "R0" | "R1";
// }

// export interface ASTConst extends ASTNode {
//   kind: "const";
//   val: ZXConst;
// }

// export interface ASTSpider extends ASTNode {
//   kind: "spider";
//   val: "Z" | "X";
//   in: Num;
//   out: Num;
//   alpha: Num;
// }

// export interface ASTStack extends ASTNode {
//   kind: "stack";
//   left: ASTNode;
//   right: ASTNode;
// }

// export interface ASTCompose extends ASTNode {
//   kind: "compose";
//   left: ASTNode;
//   right: ASTNode;
// }

// export interface ASTNStack extends ASTNode {
//   kind: "nstack";
//   n: Num;
//   // stores n copies of node for simplicity
//   node: ASTNode;
// }

// export interface ASTNStack1 extends ASTNode {
//   kind: "nstack1";
//   n: Num;
//   // stores n copies of node for simplicity
//   node: ASTNode;
// }

// export interface ASTCast extends ASTNode {
//   kind: "cast";
//   m: Num;
//   n: Num;
//   node: ASTNode;
// }
// export interface ASTFunc extends ASTNode {
//   kind: "function";
//   fname: string;
//   args: [Num | ASTNode];
//   val: string;
// }

// export interface ASTVar extends ASTNode {
//   kind: "var";
//   val: string;
// }

// export interface ASTPropTo extends ASTNode {
//   kind: "propto";
//   l: ASTNode;
//   r: ASTNode;
// }

// export interface ASTNWire extends ASTNode {
//   kind: "nwire";
//   n: Num;
// }

// export interface ASTTransform extends ASTNode {
//   kind: "transform";
//   transform: MTransform;
//   node: ASTNode;
// }
