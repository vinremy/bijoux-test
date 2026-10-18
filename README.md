# Mortier — site vitrine

Site vitrine d'une page pour Mortier, joaillerie faite main et entièrement sur mesure.
HTML, CSS et JavaScript simples, sans outil de compilation : ouvrez `index.html` dans un navigateur, ou
publiez le dossier tel quel sur n'importe quel hébergeur statique (GitHub Pages, Netlify, Vercel…).

## Structure

```
index.html        la page d'accueil : l'artiste et sa démarche, avec un aperçu des pièces
work.html         la page des pièces : Constellations, pièces choisies, toutes les pièces
css/styles.css    les styles (couleurs et tailles réglées en haut du fichier, dans :root)
js/main.js        les animations et interactions des deux pages
img/              les photos
fonts/            Bodoni Moda et Jost, hébergées localement (licence SIL OFL)
```

Le site est en anglais.

## Accueil (index.html)

1. **Hero** : le nom MORTIER et les quatre anneaux facettés, sur fond papier.
2. **About me** : présentation, compétences, formation.
3. **From observation to form** : les croquis à la gouache, en rangée qu'on fait glisser.
4. **Technical drawings** : un dessin technique qui se trace au défilement ; les cotes s'allument au survol.
5. **Materials and techniques** : quatre gestes d'établi.
6. **Workshop** : l'atelier.
7. **Selected work** : quatre pièces, avec un lien vers la page des pièces.
8. **Amsterdam** : la ville et les objectifs.
9. **Get in touch** : le formulaire de contact.

## Pièces (work.html)

1. **Constellations** : la collection de fin d'études, Couronne Boréale et Collision Stellaire en détail.
2. **Selected pieces** : cinq pièces avec leur description. Un lien comme `work.html#pearl-ring` ouvre directement la pièce.
3. **Every piece** : les 28 pièces, avec filtres et visionneuse plein écran.

## Recevoir les messages du formulaire

Par défaut, « Send » ouvre le logiciel de courriel du visiteur avec le message déjà rédigé.
Pour recevoir les messages directement, sans que le visiteur ait à passer par son logiciel :

1. Créez un formulaire gratuit sur un service comme [Formspree](https://formspree.io).
2. Copiez l'adresse qu'il vous donne (du type `https://formspree.io/f/xxxxxxx`).
3. Dans `index.html`, collez-la dans `data-endpoint=""` du formulaire `id="mail"`.

## Changer une photo

Déposez la photo dans `img/`, puis remplacez le nom du fichier dans `index.html`.
Pour le hero, une photo sur fond blanc fonctionne le mieux : le blanc se fond dans le papier de la page.

## À confirmer avant la mise en ligne

Ces contenus sont des exemples à vérifier ou à remplacer :

- l'adresse courriel `atelier@mortier.ca`, dans la section Get in touch (`data-to`) et le pied de page ;
- les cotes du dessin technique (22 mm, 18 mm, 5 mm), reprises du portfolio ;
- les noms des pièces : seuls Collier Couronne Boréale et Bracelet Collision Stellaire viennent de vous, les autres sont descriptifs ;
- les descriptions, matières et finitions des pièces ;
- le classement des pièces dans les filtres.
