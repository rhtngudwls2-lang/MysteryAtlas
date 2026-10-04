// Temporary candidate-only exclusions for documented pixel meaning errors.
// Original assets, catalog IDs and rights metadata remain intact.
const excludedFiles = new Set<string>([
  "dorabella-cipher__v02__ko.png",
  "dorabella-cipher__v02__en.png",
  "pentagon-papers__v01__ko.png",
  "pentagon-papers__v01__en.png",
  "tehran-1976__v01__ko.png",
  "tehran-1976__v01__en.png",
  "roswell__v01__ko.png",
  "roswell__v01__en.png",
  "roswell__v02__ko.png",
  "roswell__v02__en.png",
  "ball-lightning__v01__ko.png",
  "ball-lightning__v01__en.png",
  "ball-lightning__v02__ko.png",
  "ball-lightning__v02__en.png",
  "bloop__v02__ko.png",
  "bloop__v02__en.png",
  "somerton-man__v02__ko.png",
  "somerton-man__v02__en.png",
]);

export function isLaunchVisualExcluded(path: string): boolean {
  return excludedFiles.has(path.split("/").pop() ?? "");
}
