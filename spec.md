# Spec — Veille concurrentielle Qomit Checkout

## Cadre produit

### Problème
L'équipe Qomit produit et met à jour manuellement son analyse concurrentielle (voir [executive-summary-qomit.md](executive-summary-qomit.md) et le one-pager existants) via des documents statiques. Il n'existe pas d'endroit central, vivant, où consulter rapidement "où en est-on face à Stripe, Adyen, Checkout.com, Riskified..." sans rouvrir et relire un rapport entier.

### Pour qui
Usage interne à Qomit, équipe Produit/Marketing/Sales. Première version pensée pour un usage **solo** (une seule personne consulte et alimente l'outil) — pas de gestion de rôles ou de comptes multiples dans le MVP.

### Pourquoi
Le besoin n'est pas de gagner du temps sur une tâche répétitive, mais d'avoir une **meilleure visibilité / aide à la décision** : pouvoir se faire une image claire et à jour du paysage concurrentiel en quelques secondes, typiquement avant un call, une réunion de positionnement, ou un arbitrage GTM.

### Grand principe directeur
**Simple et rapide à consulter.** La priorité absolue est un usage en ~30 secondes avant un call ou une réunion — pas l'exhaustivité, pas la sophistication. Toute fonctionnalité qui alourdit la consultation rapide doit être questionnée.

### Ambition (MVP)
Un MVP fonctionnel, pas un simple prototype cliquable avec données fictives : l'outil doit contenir et gérer de vraies données concurrentielles, réutilisables au quotidien.

- **Alimentation des données** : mix des trois approches —
  1. import initial des documents déjà rédigés (résumé exécutif, one-pager) pour amorcer le contenu,
  2. saisie manuelle continue par l'utilisateur au fil des découvertes,
  3. enrichissement assisté par IA (recherche/synthèse), à valider avant intégration.
- **Périmètre concurrents** : pas de liste figée — n'importe quel concurrent peut être ajouté librement, à tout moment (au-delà des 4 déjà identifiés : Stripe, Adyen, Checkout.com, Riskified).
- **Contraintes techniques** : aucune imposée — stack et hébergement à choisir pour rester le plus simple et rapide à livrer possible, cohérent avec un usage solo (pas besoin d'hébergement multi-utilisateurs).

### Vision (1-2 ans)
Reste volontairement un **outil interne léger**. Pas d'ambition de devenir une plateforme exposée à l'externe, ni un système de référence formel pour toute décision GTM — juste un support de veille personnel qui doit rester utile et à jour sans devenir un projet lourd à maintenir.

---

## Spec V1

### Objectifs
- Pouvoir se faire une image claire de l'état de la veille concurrentielle en moins de 30 secondes, avant un call ou une réunion.
- Centraliser dans un seul outil ce qui est aujourd'hui dispersé dans des documents statiques ([executive-summary-qomit.md](executive-summary-qomit.md), one-pager).
- Pouvoir ajouter, compléter et archiver librement des concurrents, sans liste prédéfinie.
- Pouvoir déclencher, à la demande, une recherche IA pour enrichir la fiche d'un concurrent.

### Parcours utilisateur

**Parcours principal — consulter avant un call**
1. J'ouvre l'outil → j'atterris sur le **Dashboard**.
2. Je vois d'un coup d'œil tous les concurrents actifs : nom, niveau de menace, positionnement résumé.
3. Je clique sur un concurrent qui m'intéresse → j'arrive sur sa **fiche détail**.
4. Je lis positionnement, forces/faiblesses, pricing, sources — je suis prêt pour le call.

**Parcours secondaire — enrichir une fiche**
1. Sur une fiche détail, je clique « Rechercher les dernières infos ».
2. L'IA propose des informations, intégrées automatiquement dans la fiche avec un badge **non vérifié**.
3. Je relis, je corrige ou complète un champ → le badge disparaît sur ce champ (je l'ai validé implicitement en l'éditant).

**Parcours secondaire — gérer la liste**
1. Sur le Dashboard, je clique « + Ajouter un concurrent », je saisis un nom → il apparaît dans la liste avec une fiche vide.
2. Sur une fiche, je peux marquer manuellement une info comme « à vérifier / non fiable », qu'elle vienne de l'IA ou non.
3. Sur une fiche, je peux l'archiver → elle disparaît du Dashboard par défaut mais reste accessible (ses données ne sont pas perdues).

### Écrans et actions

**1. Dashboard (écran d'accueil)**
- Liste/tableau des concurrents **actifs** (non archivés) : Nom · Niveau de menace (badge Basse/Moyenne/Haute) · Positionnement résumé (1 ligne) · Date de dernière mise à jour.
- Action : `+ Ajouter un concurrent`.
- Action : clic sur une ligne → ouvre la fiche détail.
- Action : filtre/bascule pour afficher les concurrents archivés.

**2. Fiche détail concurrent**
- Champs affichés et éditables inline : Nom, Niveau de menace, Positionnement, Forces, Faiblesses, Pricing / modèle commercial, Sources (liste d'entrées avec texte, lien optionnel, date).
- Chaque information peut porter un badge **non vérifié**.
- Action : `Rechercher les dernières infos` (déclenche la recherche IA).
- Action : éditer un champ (et donc lever le badge non vérifié sur ce champ).
- Action : marquer une info comme « à vérifier / non fiable ».
- Action : `Archiver ce concurrent`.

### Données

Un concurrent est composé de :
- `nom`
- `niveau_menace` : Basse / Moyenne / Haute
- `positionnement` : texte libre
- `forces` : liste de texte
- `faiblesses` : liste de texte
- `pricing` : texte libre
- `sources` : liste d'entrées `{ info, lien_ou_texte, date, statut }`, `statut` = vérifié / non vérifié
- `statut_fiche` : actif / archivé
- `date_derniere_maj`

### Résultat attendu (étapes à dérouler pour vérifier)

1. Ouvrir l'application → le Dashboard s'affiche avec au moins les 4 concurrents déjà identifiés (Stripe, Adyen, Checkout.com, Riskified), chacun avec un niveau de menace visible sans clic supplémentaire.
2. Cliquer sur `+ Ajouter un concurrent`, saisir « PayPal », valider → « PayPal » apparaît dans la liste du Dashboard.
3. Cliquer sur « PayPal » → la fiche détail s'ouvre, vide à part le nom.
4. Remplir positionnement, forces, faiblesses, pricing, niveau de menace, sauvegarder → revenir au Dashboard → vérifier que le niveau de menace et le résumé affichés sont à jour.
5. Rouvrir la fiche « PayPal », cliquer `Rechercher les dernières infos` → vérifier qu'au moins une information apparaît avec un badge **non vérifié** et une source/date associée.
6. Éditer cette information → vérifier que le badge **non vérifié** disparaît sur ce champ.
7. Sur une fiche, marquer manuellement une information comme « à vérifier » (sans passer par l'IA) → vérifier qu'elle est visuellement distincte des informations validées.
8. Archiver le concurrent « PayPal » → vérifier qu'il disparaît du Dashboard par défaut, et qu'il reste consultable via le filtre « afficher les archivés » avec toutes ses données intactes.
9. Fermer et rouvrir l'application (nouvelle session) → vérifier que tous les concurrents et leurs données sont toujours présents.

### Hypothèses prises
- L'import des documents existants ([executive-summary-qomit.md](executive-summary-qomit.md), one-pager) se fait en pré-remplissant manuellement les 4 concurrents déjà identifiés — pas d'import automatique de fichier `.docx`/`.md` en V1.
- « Rechercher les dernières infos » déclenche une vraie recherche web au moment du clic (pas une simple reformulation de texte existant) ; l'outil doit donc avoir un accès réseau au moment de l'usage.
- « Archiver » masque un concurrent de la vue par défaut mais ne supprime jamais ses données.
- Le badge « non vérifié » s'applique au niveau de chaque information individuelle (ex. une ligne de sources), pas à la fiche entière.
- Usage solo : aucune authentification, aucun compte utilisateur en V1.
- Les données sont stockées localement (pas de serveur distant), cohérent avec un usage solo et un outil interne léger.

### Hors périmètre V1
- Gestion multi-utilisateurs et droits d'accès (lecture seule vs édition).
- Authentification / connexion.
- Automatisation périodique de la recherche IA — uniquement du déclenchement manuel.
- Historique / versioning des changements dans le temps sur une fiche.
- Gestion explicite des conflits entre sources contradictoires.
- Hébergement web accessible à distance ou multi-device.
- Export (PDF, slide, battle card) ou intégration avec d'autres outils (CRM, Notion, Slack).
- Notifications ou alertes sur les mouvements concurrentiels.
- Vue « actualités / flux » séparée du Dashboard comparatif.

---

## Interface et design

### Règles générales
- **Contexte d'usage** : sur laptop, juste avant un call, consultation de quelques dizaines de secondes — chaque écran doit être lisible sans interaction complémentaire.
- **Registre** : produit soigné, cohérent avec l'identité Qomit (sérieux, B2B, premium), même si l'outil reste interne — pas un outil « brut » façon script.
- **Références** : Linear / Notion — épuré, beaucoup de blanc, typographie soignée.
- **Couleur** : palette monochrome (blancs / gris / noir) + une seule couleur d'accent. L'accent sert aux actions (boutons) et, en variantes d'intensité, aux badges de niveau de menace (plein = Haute, clair = Moyenne, gris neutre = Basse) — pas de code couleur multi-teintes type feu tricolore, pour garder une palette monochrome + accent tout en rendant la menace immédiatement lisible par contraste.
- **Typographie** : police système par défaut (-apple-system / Segoe UI / Roboto selon OS), rien à charger.
- **Formes, espace et densité** : aéré, façon fiche — espace blanc généreux, sections bien séparées, priorité à la lisibilité sur la densité d'info.
- **Images et icônes** : icônes fonctionnelles uniquement (loupe pour rechercher, archive pour archiver...), toujours accompagnées d'un libellé texte — jamais d'icône seule, aucun logo ni illustration.
- **Composant récurrent** : le badge de statut est LE composant réutilisé partout (niveau de menace sur le Dashboard et la fiche, vérifié / non vérifié sur chaque information sourcée).
- **Libellés d'action** (registre direct et court, un mot, jamais une phrase) :
  - `Ajouter` — créer un concurrent
  - `Rechercher` — lancer la recherche IA
  - `Archiver`
  - `Archivés` — afficher/masquer les concurrents archivés
  - `À vérifier` — marquer une information comme non fiable
- **États** : minimalistes et silencieux sur tout l'outil — un message texte simple, sans illustration ni ton particulier, cohérent avec un MVP interne.

### Écran — Dashboard
- **Premier plan** : le niveau de menace de chaque concurrent — badge bien visible sur chaque ligne.
- **Second plan** : nom, positionnement résumé (1 ligne), date de dernière mise à jour — texte neutre, plus petit, à côté ou sous le badge.
- **Volume et ordre** : liste courte attendue (5 à 15 concurrents) ; tri par défaut = niveau de menace décroissant (Haute → Moyenne → Basse), puis alphabétique à menace égale.
- **États** :
  - *Rien à afficher* : aucun concurrent → « Aucun concurrent pour l'instant. » + bouton `Ajouter`.
  - *Attente* : chargement de la liste → indicateur discret (spinner/skeleton simple), sans texte additionnel.
  - *Échec* : liste non chargée → « Impossible de charger les concurrents. », sans détail technique.
- **Actions et libellés exacts** : `Ajouter` (bouton principal, avec icône +) ; `Archivés` (bascule d'affichage) ; clic sur une ligne = ouvre la fiche (toute la ligne est cliquable, pas de libellé dédié).

### Écran — Fiche détail concurrent
- **Premier plan / second plan** : pas de hiérarchie forte — positionnement, forces/faiblesses, pricing affichés en blocs égaux et aérés, dans cet ordre de haut en bas : en-tête (nom + niveau de menace) → Positionnement → Forces/Faiblesses → Pricing → Sources. Seul le badge « Non vérifié » garde une priorité visuelle constante, quel que soit le bloc où il apparaît.
- **Volume** : pas de limite stricte ; en pratique les listes (forces, faiblesses, sources) restent courtes (quelques items).
- **États** :
  - *Rien à afficher* : fiche tout juste créée (seul le nom est renseigné) → chaque bloc vide affiche « Non renseigné. » plutôt qu'un champ vide silencieux.
  - *Attente* : recherche IA en cours → bouton `Rechercher` désactivé avec spinner, le reste de la fiche reste consultable.
  - *Échec* : recherche IA échouée → « La recherche a échoué. » sous le bouton, sans détail technique ; le reste de la fiche n'est pas affecté.
- **Actions et libellés exacts** : `Rechercher` (recherche IA) ; `Archiver` ; `À vérifier` (bascule individuelle sur chaque information) ; édition inline des champs, sans bouton dédié (clic sur le champ = édition directe).
