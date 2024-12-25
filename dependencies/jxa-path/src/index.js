"use strict";

/// <reference path="./node_modules/@jxa/global-type/src/index.d.ts" />

function join(...paths) {
  const joined = paths.join("/").replace(/\/+/g, "/");
  if (joined.endsWith("/")) {
    return joined.slice(0, -1);
  }
  return joined;
}

function parentDirectory(path) {
  if (path === "/") {
    return path;
  }
  if (path.endsWith("/")) {
    path = path.substring(0, path.length - 1);
  }
  return path.substring(0, path.lastIndexOf("/"));
}

function basename(path) {
  if (path !== "/") {
    while (path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return path.substring(path.lastIndexOf("/") + 1);
  }
  return path;
}

function removeExtension(path, options = {}) {
  options.recursive = options.recursive ?? false;
  if (path !== "/") {
    while (path.endsWith("/")) {
      path = path.substring(0, path.length - 1);
    }
  } else {
    return path;
  }
  do {
    const lastDotPosition = path.lastIndexOf(".");
    const firstDotPosition = path.indexOf(".");
    if (firstDotPosition !== lastDotPosition) {
      path = path.substring(0, lastDotPosition);
    }
  } while (options.recursive);
  return path;
}

function homeDirectory() {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  return app.pathTo("home folder").toString();
}

function currentDirectory() {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  return parentDirectory(app.pathTo(this).toString());
}

function currentProgramName() {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  return basename(app.pathTo(this).toString());
}

//function isFile(path){}
//function isDir(path){}
//function isLink(path){}
