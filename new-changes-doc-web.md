# Nouveaux changements API — App Web

> Ce fichier recense tous les changements API récents qui impactent l'app web.
> Chaque section correspond à une feature ou un correctif. Les plus récents sont en haut.

---

## [2026-06-29] Route home — prestataires de la ville désormais peuplés

### Route concernée

**`GET /api/v1/home?cityId=<uuid>`**

### Ce qui a changé

Le champ `providers` dans la réponse était retourné vide `[]`. Il est maintenant peuplé avec les prestataires approuvés de la ville demandée, triés par rating.

### Structure du champ `providers`

```json
{
  "providers": [
    {
      "id": "uuid",
      "name": "Restaurant Chez Maman",
      "logo": "https://...",
      "rating": 4.5,
      "isVerified": true,
      "city": "Cotonou"
    }
  ]
}
```

---

## [2026-06-29] Page publique d'un prestataire

### Nouvelle route

**`GET /api/v1/providers/:id`** — publique, sans authentification

Utilisée pour afficher la page de profil public d'un prestataire, accessible aussi bien depuis le côté **Consumer** (découverte) que depuis les liens partagés.

### Réponse complète

```json
{
  "id": "uuid",
  "businessName": "Restaurant Chez Maman",
  "description": "Le meilleur du terroir béninois",
  "logo": "https://...",
  "businessAddress": "Rue des Cocotiers, Cotonou",
  "rating": 4.5,
  "reviewCount": 38,
  "acceptsDelivery": true,
  "acceptsPickup": true,
  "deliveryZones": ["Fidjrossè", "Cadjehoun"],
  "memberSince": "2025-01-15T10:00:00Z",
  "city": {
    "id": "uuid",
    "name": "Cotonou",
    "country": {
      "id": "uuid",
      "code": "BJ",
      "translations": { "fr": "Bénin", "en": "Benin" }
    }
  },
  "pickupPoints": [
    { "id": "uuid", "name": "Marché Dantokpa" }
  ],
  "subscriptions": [
    {
      "id": "uuid",
      "name": "Abonnement midi semaine",
      "description": "Un repas chaud chaque midi du lundi au vendredi",
      "price": 25000,
      "type": "LUNCH",
      "category": "AFRICAN",
      "duration": "WORK_WEEK",
      "imageUrl": "https://...",
      "rating": 4.7,
      "reviewCount": 12,
      "preparationHours": 2,
      "meals": [
        {
          "id": "uuid",
          "name": "Riz au gras",
          "description": "Riz bien assaisonné",
          "imageUrl": "https://...",
          "mealType": "LUNCH",
          "priceType": "FIXED",
          "price": 1500,
          "priceMin": null,
          "priceMax": null,
          "priceGuideline": null,
          "pricings": []
        }
      ]
    }
  ],
  "meals": [
    {
      "id": "uuid",
      "name": "Poulet braisé",
      "description": "Poulet mariné grillé au charbon",
      "imageUrl": "https://...",
      "mealType": "LUNCH",
      "priceType": "MULTIPLE",
      "price": 1500,
      "priceMin": null,
      "priceMax": null,
      "priceGuideline": "La différence est la taille de la portion",
      "pricings": [
        { "id": "uuid", "label": "Quart", "price": 1500 },
        { "id": "uuid", "label": "Demi", "price": 2500 },
        { "id": "uuid", "label": "Entier", "price": 4500 }
      ]
    }
  ]
}
```

### Navigation depuis le profil

Chaque abonnement et chaque plat retournés contiennent un `id`. Le frontend peut naviguer vers les pages de détail :

| Cible | Route |
|-------|-------|
| Détail d'un abonnement | `GET /api/v1/subscriptions/:id` |
| Détail d'un plat | `GET /api/v1/meals/:id` |

Ces deux routes sont **publiques** (sans authentification). Le détail d'un plat inclut tous les champs de prix (`priceType`, `price`, `priceMin`, `priceMax`, `priceGuideline`, `pricings`).

### Notes
- Seuls les prestataires avec statut `APPROVED` sont accessibles via cette route.
- `subscriptions` ne contient que les abonnements `isActive: true` et `isPublic: true`, triés par rating.
- `meals` ne contient que les plats `isActive: true`.
- Si le prestataire n'existe pas ou n'est pas approuvé → `404`.

---

## [2026-06-29] Prix flexibles sur les plats

### Contexte
Le modèle `Meal` supporte désormais trois types de prix.
Sur l'app web, ce changement concerne le **Dashboard Provider** (création/gestion des plats) et la **vue Consumer** (affichage des plats dans les abonnements).

### Routes impactées

| Méthode | Route | Contexte |
|--------|-------|----------|
| `POST` | `/api/v1/meals` | Dashboard Provider — créer un plat |
| `PUT` | `/api/v1/meals/:id` | Dashboard Provider — modifier un plat |
| `GET` | `/api/v1/meals/me` | Dashboard Provider — liste de mes plats |
| `GET` | `/api/v1/meals/:id` | Public — détail d'un plat |
| `GET` | `/api/v1/meals` | Public — liste avec filtres |
| `GET` | `/api/v1/subscriptions/:id` | Public — détail abonnement (plats avec prix) |

### Formulaire création/édition de plat (Dashboard Provider)

Ajouter un sélecteur `priceType` avec affichage conditionnel :

**FIXED** → afficher un champ `price`
**MULTIPLE** → afficher une liste dynamique de variantes `{ label, price }` (min 2)
**RANGE** → afficher deux champs `priceMin` et `priceMax`
**Tous les types** → champ `priceGuideline` optionnel

### Payloads — `POST /api/v1/meals`

**FIXED**
```json
{
  "name": "Riz au gras",
  "description": "Riz bien assaisonné avec poulet",
  "mealType": "LUNCH",
  "imageUrl": "https://...",
  "priceType": "FIXED",
  "price": 1500,
  "priceGuideline": "Inclut une boisson"
}
```

**MULTIPLE**
```json
{
  "name": "Poulet braisé",
  "description": "Poulet mariné grillé au charbon",
  "mealType": "LUNCH",
  "imageUrl": "https://...",
  "priceType": "MULTIPLE",
  "pricings": [
    { "label": "Quart", "price": 1500 },
    { "label": "Demi", "price": 2500 },
    { "label": "Entier", "price": 4500 }
  ],
  "priceGuideline": "La différence est la taille de la portion"
}
```

**RANGE**
```json
{
  "name": "Plat du jour",
  "description": "Varie selon les arrivages",
  "mealType": "LUNCH",
  "imageUrl": "https://...",
  "priceType": "RANGE",
  "priceMin": 1000,
  "priceMax": 6000,
  "priceGuideline": "Le prix dépend des ingrédients du jour"
}
```

### Réponse d'un plat

```json
{
  "id": "uuid",
  "name": "Poulet braisé",
  "priceType": "MULTIPLE",
  "price": 1500,
  "priceMin": null,
  "priceMax": null,
  "priceGuideline": "La différence est la taille de la portion",
  "pricings": [
    { "id": "uuid", "label": "Quart", "price": 1500 },
    { "id": "uuid", "label": "Demi", "price": 2500 },
    { "id": "uuid", "label": "Entier", "price": 4500 }
  ]
}
```

### Affichage recommandé (vue Consumer)

| `priceType` | Affichage carte |
|-------------|----------------|
| `FIXED` | `1 500 FCFA` |
| `MULTIPLE` | `À partir de 1 500 FCFA` + badge variantes |
| `RANGE` | `1 000 – 6 000 FCFA` |

Si `priceGuideline` est renseigné, afficher un tooltip ou une note sous le prix.

### Comportement lors de la modification (`PUT /api/v1/meals/:id`)

- Changer de `MULTIPLE` vers `FIXED` ou `RANGE` → variantes supprimées automatiquement
- Changer vers `MULTIPLE` → nouvelles variantes remplacent les anciennes
- Modifier uniquement `priceGuideline` sans changer `priceType` → fonctionne normalement

### Règles de validation

| Condition | Erreur |
|-----------|--------|
| `FIXED` sans `price` | `"Le prix est requis"` |
| `MULTIPLE` avec moins de 2 variantes | `"Au moins 2 variantes de prix requises"` |
| `RANGE` sans `priceMin` ou `priceMax` | `"Prix minimum/maximum requis"` |
| `priceMax <= priceMin` | `"Le prix maximum doit être supérieur au prix minimum"` |
