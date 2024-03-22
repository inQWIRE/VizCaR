// f †
// f ∘ g (compose)
// id_ A (identity)
// x × y (object product)
// x ⊗ y (morphism product aka stack)
// λ_ A (this should just be the morphism part of left_unitor, it seems like it's been wrapped into the isomorphism stuff, for now just parse this.)
// ρ_ A (similar to above)
// α_ A B C (Should be the associator, doesn't have notation currently)
// Β_ x , y (braiding)
// _ ^-1 (inverse of an arrow)
// A ⋆ (Object dual)
// unit
// counit

// Category
export const ISOMORPHISM = "<~>"; // level 70 // type level
export const MORPHISM = "~>"; // level 60 // type level
export const MORPH_EQUIV = "≃"; // at level 70
export const CAT_EQUIV = "≅"; // level 70
export const COMPOSE = "∘"; // level 65
export const INVERSE = "^-1"; // level 25
export const IDENTITY_MORPHISM = "id_"; // level 15

// Monoidal
export const CAT_TENSOR = "×";
export const MORPH_TENSOR = "⊗";
