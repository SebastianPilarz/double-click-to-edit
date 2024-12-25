"use strict";

/// <reference path="./node_modules/@jxa/global-type/src/index.d.ts" />
/// <reference path="./node_modules/jxa-path/src/index.d.ts" />

const ph = Library("jxa-path");

function exists(path) {
  const finderApp = Application("Finder");
  return finderApp.exists(Path(path));
}

function makeDirectory(path, options = {}) {
  const finderApp = Application("Finder");
  options.recursive = options.recursive ?? false;
  if (options.recursive) {
    for (let dir = path; !exists(dir); dir = ph.parentDirectory(dir)) {
      dirsToCreate.push(dir);
    }
  } else {
    if (!exists(path)) {
      dirsToCreate.push(path);
    }
  }
  for (const dir of dirsToCreate.reverse()) {
    finderApp.make({
      new: "folder",
      at: Path(ph.parentDirectory(dir)),
      withProperties: { name: ph.basename(dir) },
    });
  }
}

function makeFile(path, options = {}) {
  try {
    if (!exists(path)) {
      options.recursive = options.recursive ?? false;
      const finderApp = Application("Finder");
      if (options.recursive) {
        makeDirectory(ph.parentDirectory(path), { recursive: true });
      }
      finderApp.make({
        new: "file",
        at: Path(ph.parentDirectory(path)),
        withProperties: { name: ph.basename(path) },
      });
    }
  } catch (e) {
    throw new Error(`Error creating file: ${path}`);
  }
}

function readFile(path) {
  if (!exists(path)) {
    throw new Error(`File does not exist: ${path}`);
  }
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  return app.read(Path(path));
}

function writeFile(path, content, options = {}) {
  options.recursiveCreate = options.recursiveCreate ?? false;
  if (options.recursiveCreate) {
    makeFile(path, { recursive: true });
  } else {
    if (!exists(path)) {
      throw new Error(`File does not exist: ${path}`);
    }
  }
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  const openedFile = app.openForAccess(Path(path), { writePermission: true });
  options.mode = options.mode ?? "overwrite";
  let writingPosition;
  if (options.mode === "append") {
    writingPosition = app.getEof(openedFile) + 1;
  } else if (options.mode === "overwrite") {
    writingPosition = 0;
  } else {
    throw new Error(`Unknown mode: ${options.mode}`);
  }
  app.setEof(openedFile, { to: writingPosition });
  app.write(content, {
    to: openedFile,
    startingAt: app.getEof(openedFile),
  });
  app.closeAccess(openedFile);
}

function listDirectory(path) {
  if (!exists(path)) {
    throw new Error(`Directory does not exist: ${path}`);
  }
  return Application("System Events")
    .folders.byName(path)
    .diskItems.posixPath();
}

//function deleteFile(path) {}

//function renameFile(path, newPath) {}

//function copyFile(path, newPath) {}

//function moveFile(path, newPath) {
//copyFile(path, newPath);
//deleteFile(path);
//}
