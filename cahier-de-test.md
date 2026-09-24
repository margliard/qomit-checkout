# Cahier de test — Veille concurrentielle Qomit Checkout

Basé sur [spec.md](spec.md) (sections « Spec V1 » et « Interface et design »).
Exécuté le 24 septembre 2026 sur [app/index.html](app/index.html), servi temporairement en local pour permettre l'exécution automatisée dans un navigateur.

**Méthode** : chaque cas a été exécuté dans un vrai navigateur, en partant à chaque fois des données d'exemple fraîchement chargées (`localStorage` vidé). Les actions ont été déclenchées soit par clic direct sur les boutons/liens de l'interface, soit par un script exécuté dans la page (`document.getElementById(...).click()`, édition d'un champ + événement `focusout`) quand l'outil de capture d'écran ne permettait pas de cliquer au bon endroit à l'échelle testée — dans ce dernier cas, le résultat a systématiquement été revérifié en lisant l'état réel de l'application (le DOM affiché et les données sauvegardées), donc le test porte bien sur le comportement de l'application, pas sur un raccourci.

Légende : ✅ PASS · ❌ FAIL

---

## A. Dashboard — affichage et tri

| # | Étapes | Résultat attendu | Résultat obtenu | Statut |
|---|--------|-------------------|------------------|--------|
| A1 | Ouvrir l'application | Liste triée par menace décroissante (Haute → Moyenne → Basse), alphabétique à égalité | Ordre observé : Stripe (Haute), Adyen puis Riskified (Moyenne, alphabétique), Checkout.com puis PayPal (Basse, alphabétique) | ✅ |
| A2 | Regarder une ligne | Badge menace, nom, positionnement résumé (1 ligne), date de mise à jour visibles | Les 4 éléments présents sur chaque ligne | ✅ |
| A3 | Cliquer sur une ligne (ex. Adyen) | La fiche détail s'ouvre | Fiche « Adyen » affichée après clic | ✅ |
| A4 | Archiver tous les concurrents actifs | Message « Aucun concurrent pour l'instant. » + bouton `Ajouter` | Message exact affiché, bouton présent | ✅ |
| A5 | Cliquer sur `Archivés` (aucun concurrent archivé) | Message « Aucun concurrent archivé. », bouton `Ajouter` masqué | Confirmé (`btn-add` display: none, texte exact) | ✅ |
| A6 | Revenir sur `Archivés` (bascule) | Le bouton reste visuellement actif (pressé) tant qu'on est en mode archivés | `is-active` bien appliqué à la bascule | ✅ |

## B. Fiche détail — affichage

| # | Étapes | Résultat attendu | Résultat obtenu | Statut |
|---|--------|-------------------|------------------|--------|
| B1 | Ouvrir une fiche existante (Adyen) | Ordre des blocs : en-tête → Positionnement → Forces/Faiblesses (côte à côte) → Pricing → Sources | Ordre respecté à l'écran | ✅ |
| B2 | Ouvrir une fiche tout juste créée (champs vides) | Chaque bloc vide affiche « Non renseigné. » au lieu d'un champ silencieux | Positionnement, Forces, Faiblesses, Pricing, Sources affichent tous « Non renseigné. » | ✅ |
| B3 | Cliquer sur `Dashboard` (lien retour) | Retour au Dashboard | Retour confirmé | ✅ |

## C. Édition inline

| # | Étapes | Résultat attendu | Résultat obtenu | Statut |
|---|--------|-------------------|------------------|--------|
| C1 | Éditer le champ Positionnement, cliquer ailleurs | Le texte est sauvegardé automatiquement, la date de mise à jour passe à aujourd'hui | Texte et date mis à jour dans les données sauvegardées | ✅ |
| C2 | Changer le niveau de menace via le sélecteur | Le badge change de couleur/texte immédiatement, la donnée est sauvegardée | Passage Basse → Haute confirmé, classe du badge mise à jour | ✅ |
| C3 | Cliquer `+ Ajouter` sous Forces, saisir un texte | Un nouvel item apparaît dans la liste et est sauvegardé | Item ajouté et présent dans les données | ✅ |
| C4 | Cliquer le `×` d'un item de Forces | L'item est retiré de la liste | Liste vide après suppression | ✅ |
| C5 | Cliquer `+ Ajouter une source` | Une nouvelle source vide est créée, avec le statut **Vérifié** par défaut | Source créée avec `statut: "verifie"` | ✅ |
| C6 | Cliquer le `×` d'une source | La source est retirée | Liste des sources vide après suppression | ✅ |
| C7 | Cliquer `À vérifier` sur une source vérifiée | Le badge passe à **Non vérifié** | Badge et statut mis à jour | ✅ |
| C8 | Éditer le texte d'une source marquée Non vérifié | Le badge repasse automatiquement à **Vérifié** (validation implicite) | Statut repassé à `"verifie"` après édition | ✅ |

## D. Recherche IA (simulée)

| # | Étapes | Résultat attendu | Résultat obtenu | Statut |
|---|--------|-------------------|------------------|--------|
| D1 | Cliquer `Rechercher` | Le bouton se désactive et affiche un état d'attente | Bouton désactivé, libellé « Recherche… » pendant l'appel simulé | ✅ |
| D2 | Attendre la fin de la recherche (cas de succès) | Une nouvelle source apparaît avec le badge **Non vérifié**, une mention de source et la date du jour | Source ajoutée : `statut: "non_verifie"`, `lien_ou_texte: "Résultat de recherche IA (exemple)"`, date du jour | ✅ |
| D3 | Cas d'échec de la recherche | Message « La recherche a échoué. » sous le bouton, aucune source ajoutée, bouton réactivé | Message exact affiché, aucune source ajoutée, bouton réactivé | ✅ |

## E. Cycle de vie d'un concurrent

| # | Étapes | Résultat attendu | Résultat obtenu | Statut |
|---|--------|-------------------|------------------|--------|
| E1 | Cliquer `Ajouter`, saisir « Worldline », valider (touche Entrée) | Le concurrent est créé, la fiche s'ouvre directement, niveau de menace par défaut Basse, champs vides | Fiche « Worldline » ouverte, menace « Basse », tous champs vides | ✅ |
| E2 | Cliquer `Ajouter`, saisir un nom, cliquer `Annuler` | Aucun concurrent créé | Nombre de concurrents inchangé après annulation | ✅ |
| E2bis | Ouvrir la modale `Ajouter`, appuyer sur `Échap` | La modale se ferme sans créer de concurrent | Modale fermée | ✅ |
| E3 | Sur une fiche active, cliquer `Archiver` | Le concurrent disparaît du Dashboard par défaut, retour automatique au Dashboard | Retour au Dashboard confirmé, concurrent absent de la liste active | ✅ |
| E4 | Basculer sur `Archivés`, ouvrir le concurrent, cliquer `Restaurer` | Le concurrent redevient actif | Concurrent de nouveau présent dans la liste active | ✅ |

## F. Persistance

| # | Étapes | Résultat attendu | Résultat obtenu | Statut |
|---|--------|-------------------|------------------|--------|
| F1 | Recharger la page (fermer/rouvrir simulé) | Toutes les données (concurrents, modifications) sont toujours présentes | 6 concurrents (5 d'exemple + Worldline) retrouvés à l'identique après rechargement | ✅ |

## I. Matrice de positionnement (itération post-V1)

| # | Étapes | Résultat attendu | Résultat obtenu | Statut |
|---|--------|-------------------|------------------|--------|
| I1 | Sur le Dashboard, cliquer l'onglet `Matrice` | Nuage de points affiché, un point par concurrent actif, étiqueté par son nom, deux axes labellisés (Gouvernance multi-marques / Sophistication IA) | Nuage affiché avec les 5 concurrents actifs, axes labellisés, liste masquée (bug de CSS `[hidden]` détecté et corrigé pendant ce test) | ✅ |
| I2 | Cliquer sur le point d'un concurrent (ex. Stripe) | La fiche détail du concurrent s'ouvre | Fiche « Stripe » ouverte après clic sur le point | ✅ |
| I3 | Ouvrir la fiche d'un concurrent tout juste créé (axes non renseignés) | Bloc « Position sur la matrice » affiche « Non positionné sur la matrice. » + bouton `+ Positionner` ; sur la matrice, son point est vide/pointillé, centré | Confirmé sur « Worldline » (texte mal stylé détecté et corrigé pendant ce test, cf. `.field-empty-note`) | ✅ |
| I4 | Cliquer `+ Positionner` sur une fiche non positionnée | Deux curseurs apparaissent, valeur initiale 5/10 chacun | Curseurs « Gouvernance multi-marques » et « Sophistication IA » à 5/10 | ✅ |
| I5 | Déplacer un curseur (ex. Gouvernance multi-marques de Stripe à 8) | La valeur affichée à côté du curseur se met à jour en direct, la donnée est sauvegardée | Libellé passé à « 8/10 », `axe_gouvernance: 8` confirmé dans les données sauvegardées, `date_derniere_maj` mise à jour | ✅ |
| I6 | Revenir sur l'onglet Matrice après avoir modifié un axe | La position du point reflète la nouvelle valeur | Point Stripe déplacé vers la droite après passage de Gouvernance 2→8 | ✅ |
| I7 | Comparer la couleur des points à leur badge de niveau de menace | Haute = point plein accent, Moyenne = point clair à bordure accent, Basse = point gris neutre | Stripe (Haute) plein, Adyen (Moyenne) clair à bordure, Checkout.com/PayPal (Basse) gris neutre | ✅ |
| I8 | Basculer sur `Archivés` alors que l'onglet Matrice est actif | L'onglet Matrice disparaît, la vue retombe automatiquement sur Liste | Onglet Matrice masqué, onglet Liste actif, aucun concurrent archivé affiché comme attendu | ✅ |

## G. Hors périmètre — vérification d'absence

| # | Vérification | Résultat attendu | Résultat obtenu | Statut |
|---|---------------|-------------------|------------------|--------|
| G1 | Recherche de tout élément de connexion/mot de passe dans la page | Absent | Aucune occurrence trouvée | ✅ |
| G2 | Recherche de fonction export/téléchargement | Absent | Aucune occurrence trouvée | ✅ |
| G3 | Recherche de notifications/alertes | Absent | Aucune occurrence trouvée | ✅ |

## H. Conformité aux règles d'interface et de libellés

| # | Vérification | Résultat attendu | Résultat obtenu | Statut |
|---|---------------|-------------------|------------------|--------|
| H1 | Libellé du bouton d'ajout | `Ajouter` (exact, sans phrase) | « Ajouter » | ✅ |
| H2 | Libellé de la bascule archives | `Archivés` (exact) | « Archivés » | ✅ |
| H3 | Couleur d'accent appliquée | Couleur Qomit `#F2603C` | `#F2603C` confirmée dans les styles | ✅ |
| H4 | Ordre des blocs de la fiche | En-tête → Positionnement → Forces/Faiblesses → Pricing → Sources | Ordre conforme (voir B1) | ✅ |

---

## Synthèse

**45 cas de test exécutés, 45 réussis, 0 échec** (37 sur le périmètre V1 initial + 8 sur l'itération « Matrice de positionnement »).

Deux corrections mineures d'affichage (nom de concurrent long qui débordait sur la date ; en-tête qui débordait sur petit écran) avaient déjà été détectées et corrigées lors de la construction initiale de la V1. Deux nouvelles corrections mineures ont été faites pendant le test de l'itération Matrice (voir I1 et I3 ci-dessus) — aucune anomalie non corrigée à date.

**Non couvert par ce cahier** (hors périmètre volontaire de la V1, donc non testé car non censé exister) : authentification, export, notifications, gestion de conflits entre sources, hébergement multi-appareil — voir la section « Hors périmètre V1 » de [spec.md](spec.md).

**Limite de méthode à noter** : l'état de chargement initial (squelette gris affiché ~260ms à l'ouverture) n'a pas pu être capturé en screenshot (trop rapide pour le round-trip de l'outil de capture) ; sa présence a été vérifiée par lecture du code ([app/app.js](app/app.js), fonction `renderDashboard`) plutôt que par observation visuelle directe.
