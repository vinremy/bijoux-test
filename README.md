# Mortier — site de Mathis Mortier d'Aumont

Site en anglais, construit avec [Eleventy](https://www.11ty.dev) et publié sur GitHub Pages.
Le contenu se modifie dans [Pages CMS](https://app.pagescms.org), sans toucher au code.

## Où est quoi

```
content/pieces/*.md     une pièce par fichier (nom, catégorie, photos, matière, pierre, description…)
src/_data/home.json     tous les textes et photos de l'accueil, section par section
src/_data/work.json     les textes de la page Work
src/img/                les photos (celles téléversées dans Pages CMS arrivent ici)
src/index.njk           gabarit de l'accueil
src/work.njk            gabarit de la page Work
src/css, src/js, src/fonts   design, animations, polices
.pages.yml              ce que Pages CMS affiche comme formulaires
eleventy.config.js      la construction du site, dont le redimensionnement des photos
.github/workflows/      reconstruit et publie le site après chaque modification
```

## Comment le site se met à jour

1. Mathis modifie un contenu dans Pages CMS et clique sur **Save**.
2. Pages CMS enregistre la modification dans ce dépôt.
3. GitHub reconstruit le site (onglet **Actions**) et le publie, en une à deux minutes.

Les photos sont redimensionnées automatiquement (800 et 1600 px de large) : on peut téléverser
des photos de téléphone telles quelles, elles sont aussi remises à l'endroit si besoin.

## Travailler sur le code

```
npm install
npm start        # aperçu local sur http://localhost:8080
npm run build    # construit le site dans _site/
```

## Réglage GitHub nécessaire

Dans **Settings → Pages**, la source doit être **GitHub Actions** (et non « Deploy from a branch »).

## Formulaire de contact

Par défaut, « Send » ouvre le logiciel de courriel du visiteur avec le message déjà rédigé.
Pour recevoir les messages directement : créer un formulaire gratuit sur [Formspree](https://formspree.io),
puis coller son adresse dans Pages CMS → Homepage → Get in touch → *Form service address*.
