const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);

const Parcel = require("parcel-bundler");

const PostHTML = require("posthtml");
const PostHTMLMinifyCSS = require("posthtml-minify-classnames");
const MQPacker = require("css-mqpacker");
const PostCSS = require("postcss");

const sourcePath = path.join(process.cwd(), "src");

const mainBundler = new Parcel(
  [path.join(sourcePath, "index.pug"), path.join(sourcePath, "404.pug")],
  {
    sourceMaps: false,
    scopeHoist: true,
  }
);

async function build() {
  const bundlePages = await mainBundler.bundle();
  const assets = findAssets(bundlePages);
  const cssFiles = assets.filter((item) => item.type === "css");

  for (const cssFile of cssFiles) {
    const cssData = (await readFile(cssFile.name)).toString();

    /**
     * @type {postcss.Result}
     */
    const styles = await PostCSS([MQPacker]).process(cssData, {
      from: cssFile.name,
    });

    /**
     * @type {string}
     */
    cssFile.css = styles.css;
  }

  for (const item of assets.filter((i) => i.type === "html")) {
    const html = await readFile(item.name);

    await writeFile(
      item.name,
      PostHTML()
        .use(htmlPlugin(cssFiles))
        .use(PostHTMLMinifyCSS())
        .process(html, { sync: true }).html
    );
  }

  await copyFile("./src/icons/favicon.ico", "./dist/favicon.ico");

  for (const cssFile of cssFiles) {
    await unlink(cssFile.name);
  }
}

build().catch((error) => {
  process.stderr.write(error.stack + "\n");
  process.exit(1);
});

/**
 * @param bundle {Bundle}
 * @returns {{ name: string, type: string }[]}
 */
function findAssets(bundle) {
  return Array.from(bundle.childBundles).reduce(
    (all, item) => all.concat(findAssets(item)),
    [
      {
        name: bundle.name,
        type: bundle.type,
      },
    ]
  );
}

function htmlPlugin(cssFiles) {
  return (tree) => {
    tree.match({ tag: "link", attrs: { rel: "stylesheet" } }, (link) => {
      const cssFile = cssFiles.find(
        (item) => item.name.indexOf(link.attrs.href) >= 0
      );

      return {
        tag: "style",
        content: cssFile.css,
      };
    });
  };
}
