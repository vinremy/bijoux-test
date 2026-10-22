// Lit les pièces dans content/pieces/*.md (un fichier par pièce, modifiés dans Pages CMS).
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CATEGORIES = [
  { value: "ring", label: "Rings" },
  { value: "band", label: "Bands" },
  { value: "neck", label: "Necklaces, pendants, bracelets" },
  { value: "ear", label: "Earrings" },
];

export default function () {
  const dir = path.join(process.cwd(), "content", "pieces");
  const all = fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const d = matter(fs.readFileSync(path.join(dir, f), "utf8")).data || {};
      const photos = (Array.isArray(d.photos) ? d.photos : [d.photos]).filter(Boolean);
      const stone = (d.stone || "").trim();
      const material = (d.material || "").trim();
      return {
        slug: f.replace(/\.md$/, ""),
        name: d.name || f.replace(/\.md$/, ""),
        category: d.category || "ring",
        material,
        stone,
        // "Sterling silver, citrine"
        materials: [material, stone && stone.toLowerCase()].filter(Boolean).join(", "),
        description: d.description || "",
        details: Array.isArray(d.details) ? d.details.filter((x) => x && x.label && x.value) : [],
        photos,
        photo: photos[0] || "",
        home: d.home === true,
        selected: d.selected === true,
        order: Number(d.order) || 999,
      };
    })
    .filter((p) => p.photo)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  return {
    all,
    home: all.filter((p) => p.home).slice(0, 4),
    selected: all.filter((p) => p.selected),
    categories: CATEGORIES.map((c) => ({ ...c, count: all.filter((p) => p.category === c.value).length })).filter((c) => c.count > 0),
  };
}
