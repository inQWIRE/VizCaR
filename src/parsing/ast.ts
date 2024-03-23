import { quad } from "../constants/types";

// ASTNode = | MorphEquiv (l : Morph) (r : Morph)

// Morph = | MorphVar (name : string) (inp? : Object) (outp? : Object)
//         | MorphId (cat : Object)
//         | MorphInv (on: Morph)
//         | MorphCompose (l : Morph) (r : Morph)
//         | MorphTensor (l : Morph) (r : Morph)
//         | MorphDagger (f : Morph)
//         | Isomorphism (i : Isomorphism)

// Isomorphism = | IsomorphVar (name : string) (l? : Object) (r? : Object)
//               | LeftUnitor (a : Object)
//               | RightUnitor (a : Object)
//               | Braiding (x : Object) (y : Object)

// Object = | ObjectVar (name : string)
//          | Dual (a : Object)
//          | ObjTensor (l : Object) (r : Object)

export type CatObject =
  | { type: "ObjectVar"; name: string }
  | { type: "Dual"; a: CatObject }
  | { type: "ObjTensor"; l: CatObject; r: CatObject };

export type Isomorph =
  | { type: "IsomorphVar"; name: string; l?: CatObject; r?: CatObject }
  | { type: "LeftUnitor"; a: CatObject }
  | { type: "RightUnitor"; a: CatObject }
  | { type: "Braiding"; x: CatObject; y: CatObject };

export type Morph =
  | { type: "MorphVar"; name: string; inp?: CatObject; outp?: CatObject }
  | { type: "MorphId"; cat: CatObject }
  | { type: "MorphInv"; on: Morph }
  | { type: "MorphCompose"; name?: string; l: Morph; r: Morph }
  | { type: "MorphTensor"; l: Morph; r: Morph }
  | { type: "MorphDagger"; f: Morph }
  | { type: "Isomorphism"; i: Isomorph };

export type Prop = { type: "MorphEquiv"; name?: string; l: Morph; r: Morph };

export type ASTNode = Prop | Morph | CatObject;
