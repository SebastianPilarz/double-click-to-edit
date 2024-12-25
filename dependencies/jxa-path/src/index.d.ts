declare function Library(name: "jxa-path"): {
  join(...paths: string[]): string;
  parentDirectory(path: string): string;
  basename(path: string): string;
  removeExtension(path: string, options?: { recursive?: boolean }): string;
  homeDirectory(): string;
  currentDirectory(): string;
  currentProgramName(): string;
};
