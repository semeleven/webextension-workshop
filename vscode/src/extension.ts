// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as http from "http";
import { URL } from "url";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const server = http
    .createServer(async (req, res) => {
      const url = new URL(`http://${req.headers.host}${req.url}`);
      if (url.pathname === "/copypaste") {
        const buffers = [];

        for await (const chunk of req) {
          buffers.push(chunk);
        }

        const data = Buffer.concat(buffers).toString();

        const parsedData = JSON.parse(data);

        if (typeof parsedData.code !== "string") {
          let err = new Error("no have code");
          // @ts-ignore-next-line
          err.code = 404;
          return;
        }
        insertText(parsedData.code);

        res.writeHead(200, {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        });
        let json = JSON.stringify({ status: "ok" });
        res.end(json);
        return;
      }

      res.end(leavePage());
    })
    .listen(4450, () => {
      console.log(`> Running on localhost:4450`);
    });

  context.subscriptions.push({
    dispose: () => {
      server.close();
    },
  });
}

const insertText = (text: string): void => {
  const activeTextEditor: vscode.TextEditor | undefined =
    vscode.window.activeTextEditor;

  if (!activeTextEditor) {
    return;
  }

  activeTextEditor.edit((edit) =>
    activeTextEditor.selections.map((selection) => {
      const location: vscode.Position = selection.end;

      edit.insert(location, text);
    })
  );
};

// this method is called when your extension is deactivated
export function deactivate() {}

function leavePage() {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      <video style="margin: auto; display: block;" id="video">Video stream not available.</video>
      <script>
        (function () {
          // The width and height of the captured photo. We will set the
          // width to the value defined here, but the height will be
          // calculated based on the aspect ratio of the input stream.
  
          var width = 320; // We will scale the photo width to this
          var height = 0; // This will be computed based on the input stream
  
          // |streaming| indicates whether or not we're currently streaming
          // video from the camera. Obviously, we start at false.
          var streaming = false;
          function startup() {
            const video = document.getElementById("video");
  
            navigator.mediaDevices
              .getUserMedia({ video: true, audio: false })
              .then(function (stream) {
                video.srcObject = stream;
                video.play();
              })
              .catch(function (err) {
                console.log("An error occurred: " + err);
              });
  
            video.addEventListener(
              "canplay",
              function (ev) {
                if (!streaming) {
                  height = video.videoHeight / (video.videoWidth / width);
                  // Firefox currently has a bug where the height can't be read from
                  // the video, so we will make assumptions if this happens.
  
                  if (isNaN(height)) {
                    height = width / (4 / 3);
                  }
  
                  video.setAttribute("width", width * 2);
                  video.setAttribute("height", height * 2);
                  streaming = true;
                }
              },
              false
            );
          }
  
          // Set up our event listener to run the startup process
          // once loading is complete.
          window.addEventListener("load", startup, false);
        })();
      </script>
    </body>
  </html>
  
  `;
}
