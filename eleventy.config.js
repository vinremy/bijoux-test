// Mortier — build du site.
// Le contenu vit dans src/_data/*.json (textes) et content/pieces/*.md (une pièce par fichier).
// Ces fichiers sont modifiés par Mathis dans Pages CMS (voir .pages.yml).
import Image from "@11ty/eleventy-img";
import path from "node:path";

const WIDTHS = [800, 1600];

// "/img/photo.jpg" (chemin enregistré par Pages CMS) → fichier source dans src/img/
function sourcePath(src) {
  return path.join("src", src.replace(/^\//, ""));
}

// Redimensionne une photo (même une photo de téléphone de plusieurs Mo) et renvoie ses versions.
async function resize(src) {
  return Image(sourcePath(src), {
    widths: WIDTHS,
    formats: ["jpeg"],
    outputDir: "_site/img/r/",
    urlPath: "img/r/",
    sharpJpegOptions: { quality: 82, progressive: true, mozjpeg: true },
    filenameFormat: (id, file, width, format) => `${path.parse(file).name}-${id.slice(0, 6)}-${width}.${format}`,
  });
}

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/js": "js", "src/fonts": "fonts" });
  eleventyConfig.addWatchTarget("content/");

  // {% image "/img/photo.jpg", "alt", "classe", "sizes", "attributs en plus" %}
  eleventyConfig.addAsyncShortcode("image", async (src, alt = "", cls = "", sizes = "100vw", extra = 'loading="lazy" decoding="async"') => {
    if (!src) return "";
    const meta = await resize(src);
    const jpg = meta.jpeg;
    const big = jpg[jpg.length - 1];
    const srcset = jpg.map((m) => `${m.url} ${m.width}w`).join(", ");
    const c = cls ? ` class="${esc(cls)}"` : "";
    return `<img${c} src="${big.url}" srcset="${srcset}" sizes="${esc(sizes)}" width="${big.width}" height="${big.height}" alt="${esc(alt)}" ${extra}>`;
  });

  // URLs des grandes versions de toutes les photos d'une pièce, pour la visionneuse.
  eleventyConfig.addAsyncShortcode("photoUrls", async (photos = []) => {
    const urls = [];
    for (const src of photos.filter(Boolean)) {
      const meta = await resize(src);
      urls.push(meta.jpeg[meta.jpeg.length - 1].url);
    }
    return esc(JSON.stringify(urls));
  });

  eleventyConfig.addGlobalData("year", () => new Date().getFullYear());

  eleventyConfig.addFilter("nl2br", (s) => esc(s).replace(/\n/g, "<br>"));
  eleventyConfig.addFilter("letters", (s) => [...String(s)].map((ch) => `<span>${esc(ch)}</span>`).join(""));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
