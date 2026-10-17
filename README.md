# Mortier — site vitrine

Site vitrine d'une page pour Mortier, joaillerie faite main et entièrement sur mesure.
HTML, CSS et JavaScript simples, sans outil de compilation : ouvrez `index.html` dans un navigateur, ou
publiez le dossier tel quel sur n'importe quel hébergeur statique (GitHub Pages, Netlify, Vercel…).

## Structure

```
index.html        la page
css/styles.css    les styles (couleurs et tailles réglées en haut du fichier, dans :root)
js/main.js        l'ouverture épinglée, les filtres, la visionneuse, les animations
img/              les photos des pièces
fonts/            Bodoni Moda et Jost, hébergées localement (licence SIL OFL)
```

## La page, dans l'ordre

1. **Ouverture** : le nom MORTIER reste épinglé pendant que trois pièces se relaient dessous.
2. **Matières** : une ligne qui défile (argent martelé, grenat, opale…).
3. **Cinq pièces** : un chapitre par pièce, avec une photo qui se dévoile et bouge au défilement.
4. **Collection** : toutes les pièces, avec des filtres par type et une visionneuse plein écran
   (flèches du clavier, balayage sur téléphone).
5. **L'atelier**, puis le pied de page.

## Changer une photo

Déposez la photo dans `img/`, puis remplacez le nom du fichier dans `index.html`.
Pour les photos de l'ouverture, utilisez un format portrait 2:3.

## À confirmer avant la mise en ligne

Ces contenus sont des exemples à vérifier ou à remplacer :

- l'adresse courriel `atelier@mortier.ca`, dans le pied de page ;
- le nom et le métal indiqués sous chaque photo ;
- les descriptions, matières et finitions des cinq pièces mises en avant ;
- le classement des pièces dans les filtres (bagues, joncs, chevalières, colliers et pendentifs).
