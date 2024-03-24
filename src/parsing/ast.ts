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
  | { type: "ObjectVar"; name: string; as_text: string }
  | { type: "Dual"; a: CatObject; as_text: string }
  | { type: "ObjTensor"; l: CatObject; r: CatObject; as_text: string };

export type Isomorph =
  | {
      type: "IsomorphVar";
      name: string;
      l?: CatObject;
      r?: CatObject;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    }
  | {
      type: "LeftUnitor";
      a: CatObject;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    }
  | {
      type: "RightUnitor";
      a: CatObject;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    }
  | {
      type: "Braiding";
      x: CatObject;
      y: CatObject;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    };

export type Morph =
  | {
      type: "MorphVar";
      name: string;
      inp?: CatObject;
      outp?: CatObject;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    }
  | {
      type: "MorphId";
      cat: CatObject;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    }
  | {
      type: "MorphInv";
      on: Morph;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    }
  | {
      type: "MorphCompose";
      name?: string;
      l: Morph;
      r: Morph;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    }
  | {
      type: "MorphTensor";
      l: Morph;
      r: Morph;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    }
  | {
      type: "MorphDagger";
      f: Morph;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    }
  | {
      type: "Isomorphism";
      i: Isomorph;
      hor_len?: number;
      ver_len?: number;
      boundary?: quad;
    };

export type Prop = {
  type: "MorphEquiv";
  name?: string;
  l: Morph;
  r: Morph;
  hor_len?: number;
  ver_len?: number;
  boundary?: quad;
};

export type ASTNode = Prop | Morph;
