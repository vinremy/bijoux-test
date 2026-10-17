# Mortier — site vitrine

Site vitrine d'une page pour Mortier, joaillerie faite main et entièrement sur mesure.
HTML, CSS et JavaScript simples, sans outil de compilation : ouvrez `index.html` dans un navigateur, ou
publiez le dossier tel quel sur n'importe quel hébergeur statique (GitHub Pages, Netlify, Vercel…).

## Structure

```
index.html        la page
css/styles.css    les styles (couleurs et tailles réglées en haut du fichier, dans :root)
js/main.js        l'ouverture épinglée, les apparitions au défilement, le configurateur
js/pieces.js      les dessins de bijoux du configurateur (SVG générés)
img/              les photos des pièces
fonts/            Bodoni Moda et Jost, hébergées localement (licence SIL OFL)
```

## La page, dans l'ordre

1. **Ouverture** : le nom MORTIER reste épinglé pendant que trois pièces se relaient dessous.
2. **L'idée** : le mortier, ce qui tient la pierre.
3. **Pièces** : le mur de photos.
4. **De l'idée à la pièce** : les étapes d'une commande, présentées comme un bon de commande.
5. **Composez la vôtre** : on choisit le type, le métal, la finition, la pierre et sa taille ;
   le dessin suit, et « Demander cette pièce » ouvre un courriel déjà rempli avec ces choix.
6. **L'atelier**, 7. **Questions**, 8. **Contact**, puis le pied de page.

## Changer une photo

Déposez la photo dans `img/`, puis remplacez le nom du fichier dans `index.html`.
Pour les photos de l'ouverture, utilisez un format portrait 2:3.

## À confirmer avant la mise en ligne

Ces contenus sont des exemples à vérifier ou à remplacer :

- l'adresse courriel `atelier@mortier.ca`, utilisée dans le configurateur, la section Contact et le pied de page ;
- le nom et le métal indiqués sous chaque photo ;
- les durées des étapes (6 à 8 semaines au total) ;
- les réponses de la section Questions : pierres fournies, refonte d'or, travail à distance, entretien ;
- le texte de l'atelier, et la mention « Sur rendez-vous » ;
- les choix du configurateur, à savoir les métaux, les finitions et les pierres proposés.
