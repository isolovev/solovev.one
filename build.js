const path = require("path");

const Parcel = require("parcel-bundler");

const isProduction = process.env.NODE_ENV === "production";

const templatePath = path.join(__dirname, "src", "pages");
const templateOptions = {
  watch: !isProduction,
};

const mainBundler = new Parcel(
  [
    path.join(templatePath, "index.pug"),
    path.join(templatePath, "404.pug"),
    path.join(templatePath, "about", "index.pug"),
    path.join(templatePath, "projects", "index.pug"),
  ],
  templateOptions
);

mainBundler.bundle();

if (!isProduction) {
  mainBundler.serve();
}
