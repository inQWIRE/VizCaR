# VizCAR: A Visualizer for ViCAR

`VizCAR` is a visualizer developed for the Coq library [ViCAR](https://github.com/inQWIRE/ViCaR) (Visualizing Categories with Automated Rewriting). 

## Running VizCAR

- Download [Visual Studio Code (vscode)](https://code.visualstudio.com/Download).
- Install [opam](https://opam.ocaml.org/doc/Install.html).
- Install [coq](https://coq.inria.fr/download).
- Install `coq-lsp` on opam, by running `opam install coq-lsp`.
- Install the vscode extension for coq-lsp, [ejgallego.coq-lsp](https://marketplace.visualstudio.com/items?itemName=ejgallego.coq-lsp) at v0.1.10. Follow all setup instructions for coq-lsp as detailed [here](https://github.com/ejgallego/coq-lsp?tab=readme-ov-file#%EF%B8%8F-installation).
- Either clone the [ViCAR](https://github.com/inQWIRE/ViCaR) repository, or install it through opam via `opam pin -y coq-vicar https://github.com/inQWIRE/ViCAR.git`. Detailed instructions for ViCAR can be found on the [github homepage](https://github.com/inQWIRE/ViCaR).
- Install the vscode extension [inqwire.vizcar](https://marketplace.visualstudio.com/items?itemName=inQWIRE.vizcar) at the latest version (currently v0.0.6).
- After instantiating the appropriate typeclasses through ViCAR, run the command `vizcar.activate` to activate automatic rendering of proof terms in Coq. This command can be found via opening the command palette in your vscode instance (shortcut `Ctrl (Win, etc) / Cmd (Mac) + Shift + P`) and searching for `vizcar.activate` or `vizcar: activate: Start rendering expressions with vizcar automatically.`. To stop automatic rendering, run the command `vizcar.deactivate` or search for `vizcar: deactivate: Stop rendering expressions with vizcar automatically`. 

## Paper

The paper for ViCAR and VizCAR can be found on [arxiv](https://arxiv.org/abs/2404.08163).