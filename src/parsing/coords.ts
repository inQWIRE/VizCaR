import * as ast from "./ast";
import {
  FUNC_ARG_SIZE,
  CAST_SIZE,
  PAD_SIZE,
} from "../constants/variableconsts";
import { quad, coord } from "../constants/types";

export function findCenter(q: quad): coord {
  return {
    x: q.tl.x + (q.tr.x - q.tl.x) / 2,
    y: q.tl.y + (q.bl.y - q.tl.y) / 2,
  } as coord;
}

export function findTopCenter(q: quad): coord {
  return {
    x: q.tl.x + (q.tr.x - q.tl.x) / 2,
    y: q.tl.y,
  } as coord;
}

export function findBottomCenter(q: quad): coord {
  return {
    x: q.bl.x + (q.br.x - q.bl.x) / 2,
    y: q.bl.y,
  } as coord;
}

export function findLeftCenter(q: quad): coord {
  return {
    x: q.tl.x,
    y: q.tl.y + (q.bl.y - q.tl.y) / 2,
  } as coord;
}

export function findRightCenter(q: quad): coord {
  return {
    x: q.tr.x,
    y: q.tr.y + (q.br.y - q.tr.y) / 2,
  } as coord;
}

export function makeAtCenter(
  center: coord,
  hor_len: number,
  ver_len: number
): quad {
  return {
    tl: {
      x: center.x - hor_len / 2,
      y: center.y - ver_len / 2,
    },
    tr: {
      x: center.x + hor_len / 2,
      y: center.y - ver_len / 2,
    },
    bl: {
      x: center.x - hor_len / 2,
      y: center.y + ver_len / 2,
    },
    br: {
      x: center.x + hor_len / 2,
      y: center.y + ver_len / 2,
    },
  };
}

export function addCoords(node: ast.ASTNode, boundary: quad): ast.ASTNode {
  if (!node) {
    throw new Error("addCoords: node undefined");
  }
  switch (node.type) {
    case "MorphCompose": {
      let l_hor = node.l.hor_len!;
      let r_hor = node.r.hor_len!;
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let l_bound = {
        tl: {
          x: node.boundary.tl.x + PAD_SIZE,
          y: node.boundary.tl.y + PAD_SIZE,
        },
        tr: {
          x: node.boundary.tl.x + l_hor + PAD_SIZE,
          y: node.boundary.tl.y + PAD_SIZE,
        },
        bl: {
          x: node.boundary.bl.x + PAD_SIZE,
          y: node.boundary.bl.y - PAD_SIZE,
        },
        br: {
          x: node.boundary.tl.x + l_hor + PAD_SIZE,
          y: node.boundary.bl.y - PAD_SIZE,
        },
      } as quad;
      // console.log("l_bound: ", l_bound);
      let r_bound = {
        tl: {
          x: node.boundary.tr.x - r_hor - PAD_SIZE,
          y: node.boundary.tr.y + PAD_SIZE,
        },
        tr: {
          x: node.boundary.tr.x - PAD_SIZE,
          y: node.boundary.tr.y + PAD_SIZE,
        },
        bl: {
          x: node.boundary.br.x - r_hor - PAD_SIZE,
          y: node.boundary.bl.y - PAD_SIZE,
        },
        br: {
          x: node.boundary.br.x - PAD_SIZE,
          y: node.boundary.br.y - PAD_SIZE,
        },
      } as quad;
      // console.log("r_bound: ", r_bound);
      node.l = addCoords(node.l, l_bound) as ast.Morph;
      node.r = addCoords(node.r, r_bound) as ast.Morph;
      return node;
    }
    case "MorphEquiv": {
      let l_hor = node.l.hor_len!;
      let r_hor = node.r.hor_len!;
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let l_bound = {
        tl: {
          x: node.boundary.tl.x + PAD_SIZE,
          y: node.boundary.tl.y + PAD_SIZE,
        },
        tr: {
          x: node.boundary.tl.x + l_hor + PAD_SIZE,
          y: node.boundary.tl.y + PAD_SIZE,
        },
        bl: {
          x: node.boundary.bl.x + PAD_SIZE,
          y: node.boundary.bl.y - PAD_SIZE,
        },
        br: {
          x: node.boundary.tl.x + l_hor + PAD_SIZE,
          y: node.boundary.bl.y - PAD_SIZE,
        },
      } as quad;
      // console.log("l_bound: ", l_bound);
      let r_bound = {
        tl: {
          x: node.boundary.tr.x - r_hor - PAD_SIZE,
          y: node.boundary.tr.y + PAD_SIZE,
        },
        tr: {
          x: node.boundary.tr.x - PAD_SIZE,
          y: node.boundary.tr.y + PAD_SIZE,
        },
        bl: {
          x: node.boundary.br.x - r_hor - PAD_SIZE,
          y: node.boundary.bl.y - PAD_SIZE,
        },
        br: {
          x: node.boundary.br.x - PAD_SIZE,
          y: node.boundary.br.y - PAD_SIZE,
        },
      } as quad;
      node.l = addCoords(node.l, l_bound) as ast.Morph;
      node.r = addCoords(node.r, r_bound) as ast.Morph;
      return node;

      break;
    }
    case "MorphVar": {
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      return node;
    }
    case "MorphId": {
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      return node;
    }
    case "MorphInv": {
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let bound: quad = JSON.parse(JSON.stringify(boundary));
      bound.tl.x += PAD_SIZE + FUNC_ARG_SIZE;
      bound.tl.y += PAD_SIZE;
      bound.tr.x -= PAD_SIZE;
      bound.tr.y += PAD_SIZE;
      bound.bl.x += PAD_SIZE + FUNC_ARG_SIZE;
      bound.bl.y -= PAD_SIZE;
      bound.br.x -= PAD_SIZE;
      bound.br.y -= PAD_SIZE;
      node.on = addCoords(node.on, bound) as ast.Morph;
      return node;
    }
    case "MorphTensor": {
      let l_ver = node.l.ver_len!;
      let r_ver = node.l.ver_len!;
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      // console.log("stack node bound: ", node_.boundary);
      let l_bound = {
        tl: {
          x: node.boundary.tl.x + PAD_SIZE,
          y: node.boundary.tl.y + PAD_SIZE,
        },
        tr: {
          x: node.boundary.tr.x - PAD_SIZE,
          y: node.boundary.tr.y + PAD_SIZE,
        },
        bl: {
          x: node.boundary.tl.x + PAD_SIZE,
          y: node.boundary.tl.y + l_ver + PAD_SIZE,
        },
        br: {
          x: node.boundary.tr.x - PAD_SIZE,
          y: node.boundary.tr.y + l_ver + PAD_SIZE,
        },
      } as quad;
      // console.log("l_bound: ", l_bound);
      let r_bound = {
        bl: {
          x: node.boundary.bl.x + PAD_SIZE,
          y: node.boundary.bl.y - PAD_SIZE,
        },
        br: {
          x: node.boundary.br.x - PAD_SIZE,
          y: node.boundary.br.y - PAD_SIZE,
        },
        tl: {
          x: node.boundary.tl.x + PAD_SIZE,
          y: node.boundary.bl.y - r_ver - PAD_SIZE,
        },
        tr: {
          x: node.boundary.tr.x - PAD_SIZE,
          y: node.boundary.br.y - r_ver - PAD_SIZE,
        },
      } as quad;
      // console.log("r_bound: ", r_bound);
      node.l = addCoords(node.l, l_bound) as ast.Morph;
      node.r = addCoords(node.r, r_bound) as ast.Morph;
      return node;
    }
    case "MorphDagger": {
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let bound: quad = JSON.parse(JSON.stringify(boundary));
      bound.tl.x += PAD_SIZE + FUNC_ARG_SIZE;
      bound.tl.y += PAD_SIZE;
      bound.tr.x -= PAD_SIZE;
      bound.tr.y += PAD_SIZE;
      bound.bl.x += PAD_SIZE + FUNC_ARG_SIZE;
      bound.bl.y -= PAD_SIZE;
      bound.br.x -= PAD_SIZE;
      bound.br.y -= PAD_SIZE;
      node.f = addCoords(node.f, bound) as ast.Morph;
      return node;
    }
    case "Isomorphism": {
      let node_: ast.Isomorph = node.i;
      switch (node_.type) {
        case "IsomorphVar": {
          node.boundary = makeAtCenter(
            findCenter(boundary),
            node.hor_len!,
            node.ver_len!
          );
          return node;
        }
        case "LeftUnitor": {
          node.boundary = makeAtCenter(
            findCenter(boundary),
            node.hor_len!,
            node.ver_len!
          );
          return node;
        }
        case "RightUnitor": {
          node.boundary = makeAtCenter(
            findCenter(boundary),
            node.hor_len!,
            node.ver_len!
          );
          return node;
        }
        case "Braiding": {
          node.boundary = makeAtCenter(
            findCenter(boundary),
            node.hor_len!,
            node.ver_len!
          );
          return node;
        }
        default: {
          throw new Error(
            `addCoords: isomorphism: unknown node type ${node.type}`
          );
        }
      }
      break;
    }
    default: {
      throw new Error(`addCoords: unknown node type ${node}`);
    }
  }
}
