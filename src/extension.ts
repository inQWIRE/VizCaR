// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as parser from "./parsing/parser";
import * as sizer from "./parsing/sizes";
import * as coord from "./parsing/coords";
import * as lex from "./parsing/lexer";
import { boundary, setCanvasWidthHeight } from "./constants/variableconsts";
import * as vconsts from "./constants/variableconsts";
import * as ast from "./parsing/ast";
import { getCanvasHtml } from "./webview/webview";
// import { getCanvasHtml } from "./webview/webview";

let openWebview: vscode.WebviewPanel | undefined = undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "VizCaR" is now active!');
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand("vizx.render", () => {
  //   const inputBox = vscode.window
  //     .showInputBox()
  //     .then((expr) => renderCallback(context, expr));
  // });
  // context.subscriptions.push(disposable);
  let disposable = vscode.commands.registerCommand(
    "vizcar.lspRender",
    (expr) => {
      renderCallback(context, expr);
      vscode.window.showInformationMessage(
        "Automatic rendering is now turned on."
      );
    }
  );
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand(
    "vizcar.deactivateRendering",
    () => {
      deactivate();
      vscode.window.showInformationMessage(
        "Automatic rendering is now turned off."
      );
    }
  );
  context.subscriptions.push(disposable);
}

function renderCallback(context: vscode.ExtensionContext, expr: any) {
  if (expr === undefined) {
    console.log("no expression to be rendered");
    return;
  }
  console.log("expr whole: ", expr);
  // extract correct field from lsp information
  // let goal = expr.goals.goals[0].ty.toString();
  // let hyps = expr.goals.goals[0].hyps;
  // console.log("goal: ", goal);
  // console.log("hyps: ", hyps.toString());
  // let var_ctx = parser.context(hyps);
  // console.log("var ctx: ", var_ctx);
  expr = expr.goals.goals[0];
  // console.log("---------LEXED------------");
  // lex.lexerPrettyPrinter(expr);
  // console.log("---------LEXED------------");
  console.log("expr.goals.goals[0]: ", expr);
  let node: ast.ASTNode;
  try {
    node = parser.parseAST(expr);
    node = sizer.addSizes(node);
    console.log("sized node: ", node);
    const size = sizer.determineCanvasWidthHeight(node);
    setCanvasWidthHeight(size);
    node = coord.addCoords(node, boundary);
  } catch (e) {
    // if (e instanceof Error) {
    //   console.log(e.stack);
    // }
    vscode.window.showErrorMessage(
      `Error rendering your expression (${expr}): ${e}`
    );
    return;
  }
  if (openWebview !== undefined) {
    openWebview.dispose();
  }
  const panel = vscode.window.createWebviewPanel(
    "VizCaR",
    `VizCaR: ${expr.ty}`,
    {
      viewColumn: vscode.ViewColumn.Two,
      preserveFocus: true,
    },
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );
  panel.onDidDispose(
    async () => {
      console.log("openWebview before: ", openWebview);
      openWebview = undefined;
    },
    null,
    context.subscriptions
  );
  openWebview = panel;
  panel.webview.html = getCanvasHtml(panel, context);
  panel.webview.onDidReceiveMessage((msg) => console.log(msg));
  panel.webview.postMessage({ command: JSON.stringify(node) });
}

// this method is called when your extension is deactivated
export function deactivate() {}
