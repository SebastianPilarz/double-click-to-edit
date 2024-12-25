"use strict";

/// <reference types="../../t.d.ts" />
function run() {
  main([]);
}

function openDocuments(inputFiles) {
  main(inputFiles);
}

function main(inputFiles) {
  const fs = Library("jxa-filesystem");
  const ph = Library("jxa-path");
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;

  /////////////////////////////////////////////////////////////

  const options = {
    // "newTab" | "newWindow"
    howToOpenEditor: "newWindow",
    // "terminalTab" | "terminalWindow" | "editorTab"
    howToHandleMultipleFiles: "editorTab",
    // e.g. kitty | iTerm | Terminal | Hyper | Alacritty
    terminal: "kitty",
    // terminal | default
    actionRecipe: "terminal",
    // actionRecipe: "default",
    defaultActionRecipeKeystrokes: {
      // e.g. "control+shift+t" | "option+n" | null | undefined
      openNewTerminalWindow: "command+n",
      openNewTerminalTab: "command+t",
    },
  };
  // e.g. "nvim" | "vim" | "vi" | "nano" | "emacs"
  const editor = "nvim";
  const homePath = ph.homeDirectory();
  const configPath = homePath + "/.config";
  const configFolderName = editor.toLowerCase() + "-launcher";
  const optionsFileName = "options.json";

  /////////////////////////////////////////////////////////////

  const terminateWithError = (message) => {
    // TODO: make sure this works
    Application("System Events").displayDialog(message);
    // app.displayDialog(message, { buttons: ["OK"], defaultButton: "OK" });
    app.quit();
  };

  const parseKeyboardShortcut = (setting) => {
    const parts = setting.split("+");

    let key = null;
    const modifiers = [];

    for (const part of parts) {
      const trimmedPart = part.trim();
      if (["control", "command", "option", "shift"].includes(trimmedPart)) {
        modifiers.push(trimmedPart);
      } else {
        key = trimmedPart;
      }
    }
    return { key, modifiers };
  };

  const actionRecipes = new Map([
    [
      "default",
      {
        openNewTerminalWindow: () => {
          const { key, modifiers } = parseKeyboardShortcut(
            options.defaultActionRecipeKeystrokes.openNewTerminalWindow
          );
          const se = Application("System Events");
          se.keystroke(key, { using: `${modifiers[0]} down` });
        },
        openNewTerminalTab: () => {
          const { key, modifiers } = parseKeyboardShortcut(
            options.defaultActionRecipeKeystrokes.openNewTerminalTab
          );
          const se = Application("System Events");
          se.keystroke(key, { using: `${modifiers[0]} down` });
        },
        openEditor: (filePath) => {
          const se = Application("System Events");
          app.setTheClipboardTo(`${editor} ${filePath};exit`);
          se.keystroke("v", { using: "command down" });
          se.keyCode(36);
          delay(0.1);
          // delay(0.5);
          // app.setTheClipboardTo(clipboard);
        },
      },
    ],
    [
      "kitty",
      {
        openNewTerminalWindow: () => {
          app.doShellScript(
            "/Applications/kitty.app/Contents/MacOS/kitty @ --to=unix:/tmp/mykitty launch --type os-window"
          );
        },
        openNewTerminalTab: () => {
          app.doShellScript(
            "/Applications/kitty.app/Contents/MacOS/kitty @ --to=unix:/tmp/mykitty launch --type tab"
          );
        },
        openEditor: (filePath) => {
          app.doShellScript(
            // `/Applications/kitty.app/Contents/MacOS/kitty @ --to=unix:/tmp/mykitty launch --type overlay ${editor} ${filePath}`
            `/Applications/kitty.app/Contents/MacOS/kitty @ --to=unix:/tmp/mykitty send-text '${editor} ${filePath};exit\n'`
          );
        },
      },
    ],
    // [
    //   "iTerm",
    //   {
    //     openNewTerminalWindow: () => {
    //       const itermApp = Application("iTerm");
    //       itermApp.createWindowWithDefaultProfile();
    //     },
    //     openNewTerminalTab: () => {
    //       const itermApp = Application("iTerm");
    //       itermApp.createTabWithDefaultProfile();
    //     },
    //     openEditor: (filePath) => {
    //       const itermApp = Application("iTerm");
    //       // itermApp.write({ text: `${editor} ${filePath};exit` });
    //       app.displayDialog("we're here", {
    //         buttons: ["OK"],
    //         defaultButton: "OK",
    //       });
    //       // app.quit();
    //     },
    //   },
    // ],
  ]);

  const prepareTerminal = () => {
    let terminalApp;
    try {
      terminalApp = Application(options.terminal);
    } catch (e) {
      terminateWithError(
        `Could not find terminal: "${options.terminal}". Make sure it is installed and in your PATH.`
      );
    }
    if (terminalApp.running()) {
      terminalApp.activate();
      if (actions.onFocus) {
        actions.onFocus();
      }
      if (options.howToHandleMultipleFiles === "terminalWindow") {
        actions.openNewTerminalWindow();
      } else {
        if (options.howToOpenEditor === "newTab") {
          actions.openNewTerminalTab();
        } else if (options.howToOpenEditor === "newWindow") {
          actions.openNewTerminalWindow();
        } else {
          terminateWithError(
            `Invalid option "howToOpenEditor": "${options.howToOpenEditor}"`
          );
        }
      }
    } else {
      terminalApp.launch();
      terminalApp.activate();
    }
  };

  const loadOptions = () => {
    if (!fs.exists(ph.join(configPath, configFolderName, optionsFileName))) {
      try {
        fs.writeFile(
          ph.join(configPath, configFolderName, optionsFileName),
          JSON.stringify(options, null, 2),
          { recursiveCreate: true }
        );
      } catch (e) {
        terminateWithError(
          "Could not write options file. Make sure permissions are set correctly."
        );
      }
    } else {
      let loadedOptions = {};
      let fileContent;
      try {
        fileContent = fs.readFile(
          Path(ph.join(configPath, configFolderName, optionsFileName))
        );
      } catch (e) {
        terminateWithError(
          "Could not read options file. Make sure permissions are set correctly."
        );
      }

      try {
        loadedOptions = JSON.parse(fileContent);
      } catch (e) {
        terminateWithError(
          "Could not parse options file. There are propably errors in syntax. Note comments are not allowed in standard JSON."
        );
      }

      options.howToOpenEditor =
        loadedOptions.howToOpenEditor ?? options.howToOpenEditor;
      options.howToHandleMultipleFiles =
        loadedOptions.howToHandleMultipleFiles ??
        options.howToHandleMultipleFiles;
      options.terminal = loadedOptions.terminal ?? options.terminal;
      options.actionRecipe = loadedOptions.actionRecipe ?? options.actionRecipe;
      options.defaultActionRecipeKeystrokes =
        loadedOptions.defaultActionRecipeKeystrokes ??
        options.defaultActionRecipeKeystrokes;
    }
  };
  /////////////////////////////////////////////////////////////

  const clipboard = app.theClipboard();
  // convert Path[] to string[] and quote them
  const quotedFilePaths = inputFiles.map((path) => `"${path}"`);

  loadOptions();
  // app.displayDialog(
  //   fs.readFile(`${configPath}/${configFolderName}/${optionsFileName}`),
  //   {
  //     buttons: ["OK"],
  //     defaultButton: "OK",
  //   }
  // );
  let actions = actionRecipes.get("default");
  if (options.actionRecipe === "terminal") {
    actions = actionRecipes.get(options.terminal) ?? actions;
  } else if (options.actionRecipe !== "default") {
    terminateWithError(
      `Invalid option "actionRecipe": "${options.actionRecipe}"`
    );
  }

  prepareTerminal();

  if (quotedFilePaths.length === 0) {
    actions.openEditor("");
  } else {
    for (let i = 0; i < quotedFilePaths.length; i++) {
      if (options.howToHandleMultipleFiles === "terminalTab") {
        actions.openEditor(quotedFilePaths[i]);
        if (i < quotedFilePaths.length - 1) {
          actions.openNewTerminalTab();
        }
      } else if (options.howToHandleMultipleFiles === "terminalWindow") {
        actions.openEditor(quotedFilePaths[i]);
        if (i < quotedFilePaths.length - 1) {
          actions.openNewTerminalWindow();
        }
      } else if (options.howToHandleMultipleFiles === "editorTab") {
        actions.openEditor(quotedFilePaths.join(" "));
        break;
      } else {
        terminateWithError(
          `Invalid option "howToHandleMultipleFiles": "${options.howToHandleMultipleFiles}"`
        );
      }
    }
  }
  if (options.terminal === "default") {
    delay(0.5);
    app.setTheClipboardTo(clipboard);
  }
}
