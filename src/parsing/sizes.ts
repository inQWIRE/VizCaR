import * as ast from "./ast";
import {
  HOR_PAD,
  VER_PAD,
  BASE_SIZE,
  CAST_SIZE,
  PAD_SIZE,
  MORPH_EQUIV_SIZE,
  FUNC_ARG_SIZE,
  SCALE,
} from "../constants/variableconsts";
import { basename } from "path";

export function addSizes(node: ast.ASTNode): ast.ASTNode {
  if (!node) {
    throw new Error("undefined node in addSizes");
  }
  node.hor_len = 0;
  node.ver_len = 0;
  switch (node.type) {
    case "MorphEquiv": {
      let l_node: ast.ASTNode = node.l;
      let r_node: ast.ASTNode = node.r;
      l_node = addSizes(l_node);
      r_node = addSizes(r_node);

      if (l_node.ver_len !== undefined && r_node.ver_len !== undefined) {
        node.ver_len += Math.max(l_node.ver_len, r_node.ver_len) + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as propto node: horizontal len`
        );
      }
      if (l_node.hor_len !== undefined && r_node.hor_len !== undefined) {
        node.hor_len +=
          l_node.hor_len + r_node.hor_len + MORPH_EQUIV_SIZE + 4 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as propto node: vertical len`
        );
      }
      break;
    }
    case "MorphVar": {
      node.hor_len = BASE_SIZE;
      node.ver_len = BASE_SIZE;
      break;
    }
    case "MorphId": {
      node.hor_len = BASE_SIZE;
      node.ver_len = BASE_SIZE;
      break;
    }
    case "MorphInv": {
      let on_node: ast.ASTNode = node.on;
      on_node = addSizes(on_node);
      on_node = addSizes(on_node);
      if (on_node.hor_len !== undefined && on_node.ver_len !== undefined) {
        node.hor_len += on_node.hor_len + FUNC_ARG_SIZE;
        +2 * PAD_SIZE;
        node.ver_len += on_node.ver_len + 2 * PAD_SIZE;
      }
      break;
    }
    case "MorphCompose": {
      let l_node: ast.ASTNode = node.l;
      let r_node: ast.ASTNode = node.r;
      l_node = addSizes(l_node);
      r_node = addSizes(r_node);
      if (l_node.ver_len !== undefined && r_node.ver_len !== undefined) {
        node.ver_len += Math.max(l_node.ver_len, r_node.ver_len) + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as compose node: horizontal len`
        );
      }
      if (l_node.hor_len !== undefined && r_node.hor_len !== undefined) {
        node.hor_len +=
          l_node.hor_len + r_node.hor_len + PAD_SIZE + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as compose node: vertical len`
        );
      }
      break;
    }
    case "MorphTensor": {
      let l_node: ast.ASTNode = node.l;
      let r_node: ast.ASTNode = node.r;
      l_node = addSizes(l_node);
      r_node = addSizes(r_node);
      if (l_node.hor_len !== undefined && r_node.hor_len !== undefined) {
        node.hor_len += Math.max(l_node.hor_len, r_node.hor_len) + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as stack node: horizontal len`
        );
      }
      if (l_node.ver_len !== undefined && r_node.ver_len !== undefined) {
        node.ver_len +=
          l_node.ver_len + r_node.ver_len + PAD_SIZE + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as stack node: vertical len`
        );
      }
      break;
    }
    case "MorphDagger": {
      let f_node: ast.ASTNode = node.f;
      f_node = addSizes(f_node);
      if (f_node.hor_len !== undefined && f_node.ver_len !== undefined) {
        node.hor_len += f_node.hor_len + FUNC_ARG_SIZE;
        +2 * PAD_SIZE;
        node.ver_len += f_node.ver_len + 2 * PAD_SIZE;
      }
      break;
    }
    // for isomorphism, we size the outer node itself, and only use typing info from the inner node.
    // switch??
    case "Isomorphism": {
      let node_: ast.Isomorph = node.i;
      switch (node_.type) {
        case "IsomorphVar": {
          node.hor_len = BASE_SIZE;
          node.ver_len = BASE_SIZE;
          break;
        }
        case "LeftUnitor": {
          node.hor_len = BASE_SIZE;
          node.ver_len = BASE_SIZE;
          break;
        }
        case "RightUnitor": {
          node.hor_len = BASE_SIZE;
          node.ver_len = BASE_SIZE;
          break;
        }
        case "Associator": {
          node.hor_len = BASE_SIZE;
          node.ver_len = BASE_SIZE;
          break;
        }
        case "Braiding": {
          node.hor_len = BASE_SIZE;
          node.ver_len = BASE_SIZE;
          break;
        }
        default: {
          throw new Error(
            `addSizes: isomorphism: unknown node type ${node.type}`
          );
        }
      }
      break;
    }
    default: {
    }
  }
  node = addSizesHappyRobot(node);
  return node;
}

export function addSizesHappyRobot(node_: ast.ASTNode): ast.ASTNode {
  switch (node_.type) {
    case "MorphCompose": {
      if (node_.ver_len === undefined || node_.hor_len === undefined) {
        throw new Error(`length undefined in second sizing\n`);
      }
      let desired_hor = node_.hor_len - 3 * PAD_SIZE;
      let desired_ver = node_.ver_len - 2 * PAD_SIZE;
      let sleft = JSON.parse(JSON.stringify(node_.l));
      let sright = JSON.parse(JSON.stringify(node_.r));
      node_.l.hor_len = Number(
        (
          (sleft.hor_len! /
            Number((sleft.hor_len! + sright.hor_len!).toFixed(0))) *
          desired_hor
        ).toFixed(0)
      );
      node_.r.hor_len = Number(
        (
          (sright.hor_len! /
            Number((sleft.hor_len! + sright.hor_len!).toFixed(0))) *
          desired_hor
        ).toFixed(0)
      );
      node_.l.ver_len = desired_ver;
      node_.r.ver_len = desired_ver;
      node_.l = addSizesHappyRobot(node_.l) as ast.Morph;
      node_.r = addSizesHappyRobot(node_.r) as ast.Morph;
      node_ = node_;
      break;
    }
    case "MorphTensor": {
      if (node_.ver_len === undefined || node_.hor_len === undefined) {
        throw new Error(`length undefined in second sizing\n`);
      }
      let desired_hor = node_.hor_len - 2 * PAD_SIZE;
      let desired_ver = node_.ver_len - 3 * PAD_SIZE;
      let sleft = JSON.parse(JSON.stringify(node_.l));
      let sright = JSON.parse(JSON.stringify(node_.r));
      node_.l.hor_len = desired_hor;
      node_.r.hor_len = desired_hor;
      node_.l.ver_len = Number(
        (
          (sleft.ver_len! /
            Number((sleft.ver_len! + sright.ver_len!).toFixed(0))) *
          desired_ver
        ).toFixed(0)
      );
      node_.r.ver_len = Number(
        (
          (sright.ver_len! /
            Number((sleft.ver_len! + sright.ver_len!).toFixed(0))) *
          desired_ver
        ).toFixed(0)
      );
      node_.l = addSizesHappyRobot(node_.l) as ast.Morph;
      node_.r = addSizesHappyRobot(node_.r) as ast.Morph;
      break;
    }
    default: {
      break;
    }
  }
  return node_;
}

export function determineCanvasWidthHeight(
  node: ast.ASTNode
): [number, number] {
  const max_width = node.hor_len!;
  const max_height = node.ver_len!;
  console.log("max width; ", max_width, "max_height; ", max_height);
  let ver = max_height + 2 * HOR_PAD;
  let hor = max_width + 2 * VER_PAD;
  console.log("hor; ", hor, "ver; ", ver);
  return [hor, ver];
}
