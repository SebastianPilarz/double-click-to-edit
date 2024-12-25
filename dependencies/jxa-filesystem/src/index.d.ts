declare function Library(name: "jxa-filesystem"): {
  exists(path: string): boolean;
  makeDirectory(path: string, options?: { recursive?: boolean }): void;
  makeFile(path: string, options?: { recursive?: boolean }): void;
  readFile(path: string): string;
  writeFile(
    path: string,
    content: string,
    options?: {
      mode?: "append" | "overwrite";
      recursiveCreate?: boolean;
    }
  ): void;
  listDirectory(path: string): string[];
  // deleteFile(path: string): void;
  // renameFile(path: string, newPath: string): void;
  // copyFile(path: string, newPath: string): void;
  // moveFile(path: string, newPath: string): void;
};
