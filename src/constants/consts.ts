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
export const ISOMORPHISM = "<~>"; // level 38 // TYPE // changed
export const MORPHISM = "~>"; // level 38 // TYPE // changed
export const MORPH_EQUIV = "≃"; // at level 70
export const COMPOSE = "∘"; // f ∘ g, at level 40, left assoc // changed
export const INVERSE = "⁻¹"; // f ^-1, at level 25
export const IDENTITY_MORPHISM = "id_"; // id_ A, at level 15

// Monoidal
export const OBJ_TENSOR = "×"; //  x × y, at level 34, left assoc // changed
export const OBJ_TENSOR_2 = "∗"; // ∗ also
export const MORPH_TENSOR = "⊗"; // x ⊗ y, at level 40, left assoc // changed
export const MORPH_TENSOR_2 = "⧆"; // x ⧆ y, at level 40, left assoc // changed

export const LEFT_UNITOR = "λ_"; // λ_ A, at level 20 // changed
export const RIGHT_UNITOR = "ρ_"; // ρ_ A, at level 20 // changed
export const ASSOCIATOR = "α_"; //  α_ A , B , M // at level 20

// Braided Monoidal
export const BRAID = "β_"; // B_ x , y, at level 39

// Compact Closed
export const OBJ_DUAL = "⋆"; // A ⋆, at level 0

// Dagger
export const DAGGER = "†"; // f †, at level 0

// Render Util
export const WIRE = "—";
export const LEFT_UNITOR_RENDER = "λ";
export const RIGHT_UNITOR_RENDER = "ρ";
export const BRAID_RENDER = "×";
export const ASSOCIATOR_RENDER = "α";
