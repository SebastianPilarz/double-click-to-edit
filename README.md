# Double Click To Edit

**Motivation**
I came from Linux where to open a file in your favorite editor you just create a `.desktop` file. On macOS you usually have to write a script using AppleScript or JXA. It requires some knowledge of the system API. To save time to others & myself and make it more normalized I created this general purpose template that will make the process simple and straightforward.

**At the moment tested with:**

- [x] kitty
- [ ] iTerm2
- [ ] Terminal.app
- [ ] Alacritty
- [x] Neovim
- [x] Vim
- [ ] Emacs
- [ ] Nano

By default it opens the editor in a new terminal window, and multiple files are handled by the editor itself.

These behaviors can be customized by editing the configuration file.
The following things can be customized:

- the way it opens the editor:
  - new terminal window
  - new terminal tab
- the way it handles multiple files:
  - editor tabs
  - terminal tabs
  - new terminal windows

If the terminal supports the launcher controls it via the terminal API, otherwise it uses the fallback method which is just using keyboard shortcuts as if the user typed them. They can be customized.

> [!NOTE]
> The fallback method is not that reliable, but it works in most cases.

## Configuration

> [!NOTE]
> There are plans to add a configuration script that will help with the configuration, but for now, you have to do it manually.

1. Install

- [jxa-builder](https://github.com/seb0xff/jxa-builder) _(my other project that will help compiling and installing the launcher)_
- (optional) [duti](https://github.com/moretension/duti) make the output app the default editor for most of text files

2. Clone the repository
3. cd into the repository
4. Open the [src/index.js](src/index.js) file. You'll see the following code snippet:

```javascript
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
```

5. Here you can modify launched editor, defaults, and where to store the configuration file.

> [!TIP]
> Generally, the only things you need to change here are `terminal` and `editor`
> But if you're interested the other options are explained below:

**Properties:**

- The `options` object contains the default configuration that you can customized via config file.
  - The `howToOpenEditor` is the way the editor will be opened.
  - The `howToHandleMultipleFiles` is the way the launcher will handle multiple files.
  - The `terminal` is the terminal that will be used to open the editor.
  - The `actionRecipe` is the way the launcher will control the terminal. The terminal API or the default fallback method.
  - The `defaultActionRecipeKeystrokes` are the keystrokes that the launcher will use to control the terminal.
- The constants below won't be available in the config file, so if you want to change them do it now.
- The `editor` is the editor that will be used to open the file (it's the command that you would use in the terminal).
- The `configPath` is the path to the configuration folder. Other popular locations on macOS are `~/Library/Preferences` and `~/Library/Application Support`.
- The `configFolderName` is the name of the configuration folder.
- The `optionsFileName` is the name of the configuration file.

6. Save and close the file
7. To add custom icon you will need it in `icns` format. Place it in the root of the repository and name it `icon.icns` If you have a pn
8. Now before compilation open the [package.json](package.json) file and in the `jxa` object change the `appName` to the name you want to give to the app.

```json
  "jxa":{
    "appName": "Double Click to Edit",
    "compMode": "app",
    "depsInstallMode": "app"
  }
```

9. Save and close the file
10. Now you can compile and install

```bash
jxa-builder build && jxa-builder install
```

11. (optional) Make the app the default one for text files

```bash
./src/set_default_text_editor.sh <app_name>
```

## Notes

**`kitty`**

if you're using kitty you'll need to enable the remote control in the configuration file. Add the following line to the `~/.config/kitty/kitty.conf` file:

```bash
allow_remote_control yes
```

And in the same directory create a file named `macos-launch-services-cmdline` with the following content:

```bash
--listen-on=unix:/tmp/mykitty --single-instance
```
