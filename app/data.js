// Données d'exemple — pré-remplissage de démonstration, librement générées
// à partir du résumé exécutif Qomit (executive-summary-qomit.md).
// Ce ne sont pas des données vérifiées en direct : elles servent à peupler
// l'outil pour la démo, exactement comme n'importe quelle fiche ajoutée à la main.

const SEED_COMPETITORS = [
  {
    id: "seed-stripe",
    nom: "Stripe",
    niveau_menace: "Haute",
    positionnement: "Leader dev-friendly du payment processing, très forte vélocité d'intégration, mais peu de gouvernance checkout multi-marques native.",
    forces: [
      "Time-to-market très rapide (SDKs, documentation)",
      "Marque forte auprès des développeurs",
      "Croissance TPV +34% YoY"
    ],
    faiblesses: [
      "Checkout largement standardisé, peu de personnalisation par marque",
      "Pas de couche de gouvernance multi-marques propriétaire"
    ],
    pricing: "Usage-based, environ 1,5% + 0,25€ par transaction (zone EU), pas de palier gouvernance dédié.",
    sources: [
      { info: "Croissance TPV Stripe +34% YoY d'après les données marché 2026.", lien_ou_texte: "Résumé exécutif Qomit", date: "2026-09-23", statut: "verifie" },
      { info: "Aucune annonce publique d'une offre de gouvernance multi-marques à ce jour.", lien_ou_texte: "", date: "2026-09-20", statut: "non_verifie" }
    ],
    axe_gouvernance: 2,
    axe_sophistication: 5,
    statut_fiche: "actif",
    date_derniere_maj: "2026-09-23"
  },
  {
    id: "seed-adyen",
    nom: "Adyen",
    niveau_menace: "Moyenne",
    positionnement: "Plateforme omnicanale enterprise, robuste, mais sans vision de gouvernance IA propriétaire et un déploiement long.",
    forces: [
      "Couverture omnicanale large (in-store + online)",
      "Réputation enterprise solide"
    ],
    faiblesses: [
      "Intégration longue (6 à 12 mois)",
      "Coût élevé pour des groupes multi-marques",
      "Pas d'IA de gouvernance propriétaire"
    ],
    pricing: "Tarification enterprise sur devis, frais d'intégration significatifs.",
    sources: [
      { info: "Délai d'intégration estimé entre 6 et 12 mois pour des comptes enterprise.", lien_ou_texte: "Résumé exécutif Qomit", date: "2026-09-15", statut: "verifie" }
    ],
    axe_gouvernance: 3,
    axe_sophistication: 3,
    statut_fiche: "actif",
    date_derniere_maj: "2026-09-15"
  },
  {
    id: "seed-checkout",
    nom: "Checkout.com",
    niveau_menace: "Basse",
    positionnement: "Offre feature-rich orientée ISV/Enterprise, mais sans narratif de gouvernance multi-marques affiché.",
    forces: [
      "Catalogue de fonctionnalités de paiement large",
      "Bonne réputation sur le segment enterprise/ISV"
    ],
    faiblesses: [
      "Pas de vision gouvernance affichée",
      "Positionnement plus niche que Stripe ou Adyen"
    ],
    pricing: "Tarification négociée par volume, non publique.",
    sources: [
      { info: "Positionnement principalement ISV/Enterprise, pas de segment multi-marques dédié identifié.", lien_ou_texte: "Résumé exécutif Qomit", date: "2026-09-10", statut: "verifie" }
    ],
    axe_gouvernance: 2,
    axe_sophistication: 4,
    statut_fiche: "actif",
    date_derniere_maj: "2026-09-10"
  },
  {
    id: "seed-riskified",
    nom: "Riskified",
    niveau_menace: "Moyenne",
    positionnement: "Spécialiste IA fraude pur player, excellent sur son périmètre mais incomplet face à une approche de gouvernance checkout complète.",
    forces: [
      "IA fraude reconnue et mature",
      "Focus produit clair, exécution forte sur son périmètre"
    ],
    faiblesses: [
      "Fraude uniquement — pas de couche conversion ni gouvernance multi-marques",
      "Dépendance à l'intégration avec la plateforme checkout existante"
    ],
    pricing: "Modèle basé sur la performance (% de transactions protégées), non public.",
    sources: [
      { info: "Aucune offre de gouvernance multi-marques identifiée à date, focus fraude confirmé.", lien_ou_texte: "Résumé exécutif Qomit", date: "2026-09-20", statut: "verifie" }
    ],
    axe_gouvernance: 2,
    axe_sophistication: 8,
    statut_fiche: "actif",
    date_derniere_maj: "2026-09-20"
  },
  {
    id: "seed-paypal",
    nom: "PayPal",
    niveau_menace: "Basse",
    positionnement: "Acteur legacy grand public, marque forte côté acheteurs mais peu différenciant pour des marques enterprise multi-marchés.",
    forces: [
      "Reconnaissance de marque très élevée côté acheteurs",
      "Présence installée sur de nombreux checkouts"
    ],
    faiblesses: [
      "Perçu comme legacy sur le segment enterprise",
      "Pas de narratif gouvernance ou multi-marques"
    ],
    pricing: "Frais standards par transaction, grand public.",
    sources: [
      { info: "Positionné comme « Legacy » dans la matrice concurrentielle interne.", lien_ou_texte: "Résumé exécutif Qomit", date: "2026-08-30", statut: "verifie" }
    ],
    axe_gouvernance: 1,
    axe_sophistication: 2,
    statut_fiche: "actif",
    date_derniere_maj: "2026-08-30"
  }
];
