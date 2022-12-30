// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "directory-summary" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "directory-summary.generateDirectorySummary",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Creating a directory summary for your workspace"
      );

      const workspaceFolders = vscode.workspace.workspaceFolders || [];

      async function recursiveExtractDirectory(
        name: string,
        uri: vscode.Uri,
        isFirst: boolean
      ) {
        const _directoryObject: any = {};

        _directoryObject[name] = {
          title: name,
          path: uri,
          description: "", // TODO: Get from directory.json
          childrens: [],
        };

        const directory = await vscode.workspace.fs.readDirectory(uri);
        let index = 0;

        for (const [fileName, fileType] of directory) {
          if (index === 0) {
            try {
              const file = await vscode.workspace.fs.readFile(
                vscode.Uri.joinPath(uri, ".summary")
              );

              _directoryObject[name]["description"] =
                Buffer.from(file).toString("utf8");
            } catch (error) {}
          }

          const isCheckInsideDirectory = isFirst ? fileName === "src" : true;

          if (isCheckInsideDirectory && fileType === 2) {
            const obj = await recursiveExtractDirectory(
              fileName,
              vscode.Uri.joinPath(uri, fileName),
              false
            );

            _directoryObject[name]["childrens"].push(obj);
          }

          index++;
        }

        return _directoryObject;
      }

      const directoryObjects = [];
      for (const workspaceFolder of workspaceFolders) {
        const _directoryObject = await recursiveExtractDirectory(
          workspaceFolder.name,
          workspaceFolder.uri,
          true
        );

        directoryObjects.push(_directoryObject);
      }

      console.log("directoryObject", directoryObjects);

      vscode.window.showInformationMessage(
        "Thank you for using Directory Summary extension!"
      );
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
