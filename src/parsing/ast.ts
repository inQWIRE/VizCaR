import { quad } from "../constants/types";

export enum ASTMorphismTransform {
  Inverse,
}

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
// probably want to change this because we always want the name for a category or at least the text ???
export interface ASTCategory extends ASTNode {}

export interface ASTMorphism extends ASTNode {
  morph_input?: ASTCategory;
  morph_output?: ASTCategory;
  transforms?: ASTMorphismTransform[];
}

export interface ASTProp extends ASTNode {}

export interface ASTCategoryVar extends ASTCategory, Variable {
  kind: "Category";
}

export interface ASTMorphismVar extends ASTMorphism, Variable {
  kind: "Morphism";
}

export interface ASTIsomorphism extends ASTMorphism {
  kind: "Isomorphism";
}

export interface ASTMorphismEquivalence extends ASTProp {
  kind: "MorphismEquivalence";
  left: ASTMorphism;
  right: ASTMorphism;
}

export interface ASTCompose extends ASTMorphism {
  kind: "Compose";
  left: ASTMorphism;
  right: ASTMorphism;
}

export interface ASTIdentityMorphism extends ASTMorphism {
  kind: "IdentityMorphism";
  cat: ASTCategory;
}

export interface ASTInverse extends ASTMorphism {
  kind: "Inverse";
  morph: ASTMorphism;
}
