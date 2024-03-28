import * as ast from "../parsing/ast";
import * as c from "../constants/consts";
import * as v from "../constants/variableconsts";
import {
  findBottomCenter,
  findCenter,
  findLeftCenter,
  findRightCenter,
  findTopCenter,
} from "../parsing/coords";
import { quad } from "../constants/types";
import { determineCanvasWidthHeight } from "../parsing/sizes";
import {
  ISO_LINE_WIDTH,
  LINE_WIDTH,
  TEXT_PAD_SIZE,
  boundary,
} from "../constants/variableconsts";

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
ctx.lineWidth = v.LINE_WIDTH;
// // colors
const white = "#FFFFFF";
const black = "#000000";
const red = "#FFA4A4";
const green = "#A4FFA4";
const gray = "#303030";
const white_trans = "rgba(255, 255, 255, 0.5)";
// just for testing
// canvas.width = CANVAS_WIDTH;
// canvas.height = CANVAS_HEIGHT;
// canvas_format();

function drawBoundary(boundary: quad, dash?: [number, number]) {
  if (dash !== undefined) {
    ctx.setLineDash(dash);
  } else {
    ctx.setLineDash([]);
  }
  ctx.lineWidth = v.LINE_WIDTH;
  ctx.strokeStyle = black;
  ctx.beginPath();
  ctx.moveTo(boundary.tl.x, boundary.tl.y);
  ctx.lineTo(boundary.tr.x, boundary.tr.y);
  ctx.lineTo(boundary.br.x, boundary.br.y);
  ctx.lineTo(boundary.bl.x, boundary.bl.y);
  ctx.closePath();
  ctx.stroke();
  return;
}

function drawFuncBoundary(boundary: quad) {
  ctx.setLineDash([]);
  ctx.strokeStyle = black;
  ctx.lineWidth = v.LINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(boundary.tl.x + v.PAD_SIZE, boundary.tl.y);
  ctx.lineTo(boundary.tl.x, boundary.tl.y);
  ctx.lineTo(boundary.bl.x, boundary.bl.y);
  ctx.lineTo(boundary.bl.x + v.PAD_SIZE, boundary.bl.y);
  ctx.stroke();

  // ctx.strokeStyle = black;
  ctx.moveTo(boundary.tr.x - v.PAD_SIZE, boundary.tr.y);
  ctx.lineTo(boundary.tr.x, boundary.tr.y);
  ctx.lineTo(boundary.br.x, boundary.br.y);
  ctx.lineTo(boundary.br.x - v.PAD_SIZE, boundary.br.y);
  ctx.stroke();
  return;
}

// fit text within max width
function wrapText(
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  background: boolean
) {
  let separated = text.split("(");
  let line = "";
  let lc = 0;
  for (let i = 0; i < separated.length; i++) {
    let testLine = line.concat(separated[i]);
    if (i !== separated.length - 1) {
      testLine = testLine.concat("(");
    }
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      lc++;
      line = separated[i];
      if (i !== separated.length - 1) {
        line = line.concat("(");
      }
    } else {
      line = testLine;
    }
  }
  line = "";
  y -= (lc / 2) * lineHeight;
  for (let i = 0; i < separated.length; i++) {
    let testLine = line.concat(separated[i]);
    if (i !== separated.length - 1) {
      testLine = testLine.concat("(");
    }
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      if (background) {
        ctx.fillText(Array(line.length).fill("█").join(""), x, y);
      }
      ctx.fillText(line, x, y);
      line = separated[i];
      if (i !== separated.length - 1) {
        line = line.concat("(");
      }
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (background) {
    ctx.fillText(Array(line.length).fill("█").join(""), x, y);
  }
  ctx.fillText(line, x, y);
}

function text_format(loc: string, text: string) {
  let small_text = v.SMALL_TEXT;
  if (text.length > 15) {
    small_text = v.REALLY_SMALL_TEXT;
  }
  switch (loc) {
    case "in_out": {
      ctx.font = small_text.concat(" ").concat(v.MONOSPACE_FONT);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = gray;
      break;
    }
    case "braid_middle": {
      ctx.font = v.X_LARGE_TEXT.concat(" ").concat(v.ARIAL_FONT);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = gray;
      break;
    }
    case "label": {
      if (text.length > 9) {
        ctx.font = v.SMALL_TEXT.concat(" ").concat(v.ARIAL_FONT);
      } else {
        ctx.font = v.MEDIUM_TEXT.concat(" ").concat(v.ARIAL_FONT);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "iso_label": {
      if (text.length > 9) {
        ctx.font = "italic bold"
          .concat(v.SMALL_TEXT)
          .concat(" ")
          .concat(v.ARIAL_FONT);
      } else {
        ctx.font = v.MEDIUM_TEXT.concat(" ").concat(v.ARIAL_FONT);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "equiv": {
      ctx.font = v.LARGE_TEXT.concat(" ").concat(v.ARIAL_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "func": {
      ctx.font = v.MEDIUM_TEXT.concat(" ").concat(v.ARIAL_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }

    default: {
      if (text.length > 15) {
        ctx.font = v.REALLY_SMALL_TEXT.concat(" ").concat(v.ARIAL_FONT);
      } else if (text.length > 10) {
        ctx.font = v.SMALL_TEXT.concat(" ").concat(v.ARIAL_FONT);
      } else {
        ctx.font = v.MEDIUM_TEXT.concat(" ").concat(v.ARIAL_FONT);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
  }
}

function drawBraidNode(node: ast.ASTNode) {
  if (node.type === "Isomorphism") {
    if (node.i.type === "Braiding") {
      let node_ = node.i;
      ctx.fillStyle = white;
      ctx.setLineDash([]);
      ctx.lineWidth = ISO_LINE_WIDTH;
      ctx.strokeStyle = black;
      let inp = node_.x.as_text;
      let outp = node_.y.as_text;
      ctx.beginPath();
      ctx.moveTo(node.boundary!.tl.x, node.boundary!.tl.y);
      ctx.lineTo(node.boundary!.tr.x, node.boundary!.tr.y);
      ctx.lineTo(node.boundary!.br.x, node.boundary!.br.y);
      ctx.lineTo(node.boundary!.bl.x, node.boundary!.bl.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      let center = findCenter(node.boundary!);
      let left = findLeftCenter(node.boundary!);
      let right = findRightCenter(node.boundary!);
      let top = findTopCenter(node.boundary!);
      let bottom = findBottomCenter(node.boundary!);
      let max_width: number | undefined = undefined;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(left.x + 2*v.PAD_SIZE, top.y + 2*v.PAD_SIZE);
      ctx.lineTo(right.x - 2*v.PAD_SIZE, bottom.y - 2*v.PAD_SIZE);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(right.x - 2*v.PAD_SIZE, top.y + 2*v.PAD_SIZE);
      ctx.lineTo(left.x + 2*v.PAD_SIZE, bottom.y - 2*v.PAD_SIZE);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      
      // top right output
      ctx.save();
      ctx.translate(right.x - TEXT_PAD_SIZE, top.y + TEXT_PAD_SIZE);
      max_width = undefined;
      if (outp.length > 2) {
        ctx.translate(-2 * TEXT_PAD_SIZE, 0);
        //   ctx.rotate(-Math.PI / 2);
        //   max_width = node.ver_len! - 2 * TEXT_PAD_SIZE;
      }
      text_format("in_out", outp);
      wrapText(
        outp,
        0,
        0,
        max_width!,
        ctx.measureText(outp).actualBoundingBoxAscent +
          ctx.measureText(outp).actualBoundingBoxDescent,
        false
      );
      ctx.fillText(outp, 0, 0, max_width);
      ctx.restore();
      ctx.save();
      // bottom left output
      ctx.translate(left.x + TEXT_PAD_SIZE, bottom.y - TEXT_PAD_SIZE);
      max_width = undefined;
      if (outp.length > 2) {
        // ctx.rotate(Math.PI / 2);
        ctx.translate(2 * TEXT_PAD_SIZE, 0);
        // max_width = node.ver_len! - 2 * TEXT_PAD_SIZE;
      }
      text_format("in_out", outp);
      wrapText(
        outp,
        0,
        0,
        max_width!,
        ctx.measureText(outp).actualBoundingBoxAscent +
          ctx.measureText(outp).actualBoundingBoxDescent,
        false
      );
      ctx.fillText(outp, 0, 0, max_width);
      ctx.restore();
      // bottom right input
      ctx.save();
      max_width = undefined;
      ctx.translate(right.x - TEXT_PAD_SIZE, bottom.y - TEXT_PAD_SIZE);
      if (inp.length > 2) {
        // max_width = node.ver_len! - 2 * TEXT_PAD_SIZE;
        ctx.translate(-2 * TEXT_PAD_SIZE, 0);
        // ctx.rotate(-Math.PI / 2);
      }
      text_format("in_out", inp);
      wrapText(
        inp,
        0,
        0,
        max_width!,
        ctx.measureText(inp).actualBoundingBoxAscent +
          ctx.measureText(inp).actualBoundingBoxDescent,
        false
      );
      ctx.fillText(inp, 0, 0, max_width);
      ctx.restore();
      // top left input
      ctx.save();
      max_width = undefined;
      ctx.translate(left.x + TEXT_PAD_SIZE, top.y + TEXT_PAD_SIZE);
      if (inp.length > 2) {
        ctx.translate(2 * TEXT_PAD_SIZE, 0);
        // max_width = node.ver_len! - 2 * TEXT_PAD_SIZE;
        // ctx.rotate(Math.PI / 2);
      }
      text_format("in_out", inp);
      wrapText(
        inp,
        0,
        0,
        max_width!,
        ctx.measureText(inp).actualBoundingBoxAscent +
          ctx.measureText(inp).actualBoundingBoxDescent,
        false
      );
      ctx.fillText(inp, 0, 0, max_width);
      ctx.restore();
    }
  }
}

function drawComposeNode(node: ast.ASTNode) {
  if (node.type === "MorphCompose") {
    draw(node.l);
    draw(node.r);
    drawBoundary(node.boundary!, v.COMPOSE_DASH);
  }
}

function drawTensorNode(node: ast.ASTNode) {
  if (node.type === "MorphTensor") {
    draw(node.l);
    draw(node.r);
    drawBoundary(node.boundary!, v.TENSOR_DASH);
  }
}

function drawEquivNode(node: ast.ASTNode) {
  if (node.type === "MorphEquiv") {
    draw(node.l);
    draw(node.r);
    text_format("equiv", c.MORPH_EQUIV);
    ctx.fillText(
      c.MORPH_EQUIV,
      node.l.boundary!.tr.x + v.PAD_SIZE + 0.5 * v.MORPH_EQUIV_SIZE,
      findCenter(boundary).y
    );
  }
}

function drawUnaryFuncNode(node: ast.ASTNode) {
  let label_bound = JSON.parse(JSON.stringify(node.boundary!));
  label_bound.tr.x = label_bound.tl.x + v.FUNC_ARG_SIZE;
  label_bound.br.x = label_bound.bl.x + v.FUNC_ARG_SIZE;
  drawBoundary(label_bound, v.FUNCTION_DASH);
  let bound = JSON.parse(JSON.stringify(node.boundary!));
  bound.tl.x += v.FUNC_ARG_SIZE;
  bound.bl.x += v.FUNC_ARG_SIZE;
  drawFuncBoundary(bound);
  let cent = findCenter(label_bound);
  switch (node.type) {
    case "MorphInv": {
      draw(node.on);
      text_format("func", c.INVERSE);
      ctx.fillText(c.INVERSE_RENDER, cent.x, cent.y);
      break;
    }
    case "MorphDagger": {
      draw(node.f);
      text_format("func", c.DAGGER);
      ctx.fillText(c.DAGGER, cent.x, cent.y);
      break;
    }

    default: {
      throw new Error(`could not match unary func type ${node}`);
    }
  }
}

function drawBaseNodeMorph(node: ast.ASTNode) {
  ctx.fillStyle = white;
  ctx.setLineDash([]);
  ctx.lineWidth = LINE_WIDTH;
  if (node.type === "Isomorphism") {
    ctx.lineWidth = ISO_LINE_WIDTH;
  }
  ctx.strokeStyle = black;
  let inp: string | undefined = undefined;
  let outp: string | undefined = undefined;
  let label: string;
  switch (node.type) {
    case "MorphVar": {
      console.log("drawing MorphVar ", node.name);
      if (node.inp) {
        inp = node.inp.as_text;
      }
      if (node.outp) {
        outp = node.outp.as_text;
      }
      label = node.name;
      break;
    }
    case "MorphId": {
      inp = node.cat.as_text;
      outp = node.cat.as_text;
      label = c.WIRE;
      break;
    }
    case "Isomorphism": {
      let node_ = node.i;
      switch (node_.type) {
        case "IsomorphVar": {
          if (node_.l) {
            inp = node_.l.as_text;
          }
          if (node_.r) {
            outp = node_.r.as_text;
          }
          label = node_.name;
          break;
        }
        case "LeftUnitor": {
          inp = "I ".concat(c.COMPOSE).concat(" ").concat(node_.a.as_text);
          outp = node_.a.as_text;
          label = c.LEFT_UNITOR_RENDER.concat(" ").concat(node_.a.as_text);
          break;
        }
        case "RightUnitor": {
          inp = node_.a.as_text.concat(" ").concat(c.COMPOSE).concat(" I");
          outp = node_.a.as_text;
          label = c.RIGHT_UNITOR_RENDER.concat(" ").concat(node_.a.as_text);
          break;
        }
        case "Associator": {
          inp = "("
            .concat(node_.a.as_text)
            .concat(" ")
            .concat(c.COMPOSE)
            .concat(node_.b.as_text)
            .concat(") ")
            .concat(c.COMPOSE)
            .concat(" ")
            .concat(node_.m.as_text);
          outp = node_.a.as_text
            .concat(" ")
            .concat(c.COMPOSE)
            .concat(" (")
            .concat(node_.b.as_text)
            .concat(c.COMPOSE)
            .concat(" ")
            .concat(node_.m.as_text)
            .concat(") ");
          label = c.ASSOCIATOR.concat(" ")
            .concat(node_.a.as_text)
            .concat(", ")
            .concat(node_.b.as_text)
            .concat(", ")
            .concat(node_.m.as_text);
          break;
        }
        default: {
          throw new Error(`unknown isomorph`);
        }
      }
      break;
    }
    default: {
      throw new Error(`unknown base node ${node} in drawBaseNode`);
    }
  }
  ctx.beginPath();
  ctx.moveTo(node.boundary!.tl.x, node.boundary!.tl.y);
  ctx.lineTo(node.boundary!.tr.x, node.boundary!.tr.y);
  ctx.lineTo(node.boundary!.br.x, node.boundary!.br.y);
  ctx.lineTo(node.boundary!.bl.x, node.boundary!.bl.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  let center = findCenter(node.boundary!);
  let left = findLeftCenter(node.boundary!);
  let right = findRightCenter(node.boundary!);
  let max_width: number | undefined = undefined;
  text_format("label", label);
  if (node.type === "Isomorphism") {
    text_format("iso_label", label);
  }
  max_width = node.hor_len! / 2;
  if (ctx.measureText(label).width > max_width) {
    wrapText(
      label,
      center.x,
      center.y,
      max_width,
      ctx.measureText(label).actualBoundingBoxAscent +
        ctx.measureText(label).actualBoundingBoxDescent,
      false
    );
  } else {
    ctx.fillText(label, center.x, center.y, max_width);
  }
  if (outp) {
    ctx.save();
    ctx.translate(right.x - TEXT_PAD_SIZE, right.y);
    max_width = undefined;
    if (outp.length > 2) {
      ctx.rotate(-Math.PI / 2);
      max_width = node.ver_len! - 2 * TEXT_PAD_SIZE;
    }
    text_format("in_out", outp);
    wrapText(
      outp,
      0,
      0,
      max_width!,
      ctx.measureText(outp).actualBoundingBoxAscent +
        ctx.measureText(outp).actualBoundingBoxDescent,
      false
    );
    ctx.fillText(outp, 0, 0, max_width);
    ctx.restore();
  }
  if (inp) {
    ctx.save();
    max_width = undefined;
    ctx.translate(left.x + TEXT_PAD_SIZE, left.y);
    if (inp.length > 2) {
      max_width = node.ver_len! - 2 * TEXT_PAD_SIZE;
      ctx.rotate(Math.PI / 2);
    }
    text_format("in_out", inp);
    wrapText(
      inp,
      0,
      0,
      max_width!,
      ctx.measureText(inp).actualBoundingBoxAscent +
        ctx.measureText(inp).actualBoundingBoxDescent,
      false
    );
    ctx.fillText(inp, 0, 0, max_width);
    ctx.restore();
  }
}

function draw(node: ast.ASTNode) {
  console.log("drawing ", node.type);
  switch (node.type) {
    case "MorphEquiv": {
      drawEquivNode(node);
      break;
    }
    case "MorphVar": {
      drawBaseNodeMorph(node);
      break;
    }
    case "MorphId": {
      drawBaseNodeMorph(node);
      break;
    }
    case "MorphInv": {
      drawUnaryFuncNode(node);
      break;
    }
    case "MorphCompose": {
      drawComposeNode(node);
      break;
    }
    case "MorphTensor": {
      drawTensorNode(node);
      break;
    }
    case "MorphDagger": {
      drawUnaryFuncNode(node);
      break;
    }
    case "Isomorphism": {
      let node_ = node.i as ast.Isomorph;
      switch (node_.type) {
        case "IsomorphVar": {
          drawBaseNodeMorph(node);
          break;
        }
        case "LeftUnitor": {
          drawBaseNodeMorph(node);
          break;
        }
        case "RightUnitor": {
          drawBaseNodeMorph(node);
          break;
        }
        case "Associator": {
          drawBaseNodeMorph(node);
          break;
        }
        case "Braiding": {
          drawBraidNode(node);
          break;
        }
        default: {
          throw new Error("unknown type in draw, isomorph");
        }
      }
      break;
    }

    default: {
      throw new Error("Unknown type in draw");
    }
  }
}

function render(this: Window, msg: MessageEvent<any>) {
  let command = msg.data.command;
  let node: ast.ASTNode = JSON.parse(command);
  v.setCanvasWidthHeight(determineCanvasWidthHeight(node));
  formatCanvas();
  draw(node);
}

function formatCanvas() {
  console.log(
    "setting width, height in render: ",
    v.CANVAS_WIDTH,
    v.CANVAS_HEIGHT
  );
  canvas.width = v.CANVAS_WIDTH;
  canvas.height = v.CANVAS_HEIGHT;
  ctx.fillStyle = white;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = black;
}

// // // function downloadSVG() {
// // //   const svgData = `
// // //     <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${
// // //     canvas.height
// // //   }">
// // //       <foreignObject width="100%" height="100%">
// // //         <div xmlns="http://www.w3.org/1999/xhtml">
// // //           <img src="${canvas.toDataURL("image/png")}" width="${
// // //     canvas.width
// // //   }" height="${canvas.height}"></img>
// // //         </div>
// // //       </foreignObject>
// // //     </svg>
// // //   `;

// // //   const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
// // //   const svgUrl = URL.createObjectURL(svgBlob);

// // //   const link = document.createElement("a");
// // //   link.download = "canvas.svg";
// // //   link.href = svgUrl;
// // //   link.click();

// // //   URL.revokeObjectURL(svgUrl);
// // // }

function downloadPNG() {
  canvas.toBlob(function (blob) {
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob!);
    downloadLink.download = "canvas.png";
    downloadLink.click();
  }, "image/png");
}

// // // const downloadButtonSvg = document.getElementById("download-button-svg");
// // // downloadButtonSvg!.addEventListener("click", downloadSVG);

const downloadButtonPng = document.getElementById("download-button-png");
downloadButtonPng!.addEventListener("click", downloadPNG);

window.addEventListener("message", render);

// esbuild auto reload
new EventSource("/esbuild").addEventListener("change", () => location.reload());
