import esbuild from "esbuild";

const prod = process.argv[2] !== "--watch";

const mainContext = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron", "child_process", "fs", "path", "os"],
  platform: "node",
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js"
});

const manuscriptHtmlContext = await esbuild.context({
  entryPoints: ["src/export/ManuscriptHtml.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: false,
  treeShaking: true,
  outfile: "ManuscriptHtml.js"
});

if (prod) {
  await mainContext.rebuild();
  await manuscriptHtmlContext.rebuild();
  await mainContext.dispose();
  await manuscriptHtmlContext.dispose();
} else {
  await mainContext.watch();
  await manuscriptHtmlContext.watch();
}
