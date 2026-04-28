# SEO — Métadonnées par page

Remplis les valeurs ci-dessous pour chaque page, puis transmets le fichier.
Les champs marqués * sont obligatoires. Les autres sont fortement recommandés.

---

## Éléments SEO à renseigner pour chaque page

| Champ | Rôle | Longueur recommandée |
|---|---|---|
| `title` * | Titre affiché dans l'onglet du navigateur et dans Google | 50–60 caractères |
| `description` * | Texte affiché sous le titre dans les résultats Google | 140–160 caractères |
| `keywords` | Mots-clés séparés par des virgules (moins critiques aujourd'hui mais utiles) | 5–10 mots |
| `og:title` | Titre affiché quand le lien est partagé sur WhatsApp, Facebook, etc. | = title en général |
| `og:description` | Description pour le partage social | = description en général |
| `og:image` | Image affichée lors du partage (URL absolue) | 1200×630px recommandé |

> **Note :** `og:title` et `og:description` peuvent être identiques au `title` et `description` classiques.
> Si tu laisses un champ vide, j'utiliserai les valeurs de `title` / `description` par défaut.

---

## Pages publiques à renseigner

---

### 1. Page d'accueil — `/`

```
title        : 
description  : 
keywords     : 
og:image     : 
```

---

### 2. Explorer — `/explorer`

```
title        : 
description  : 
keywords     : 
og:image     : 
```

---

### 3. Détail abonnement — `/subscriptions/[id]`

> Page dynamique. Le titre et la description seront générés automatiquement
> depuis le nom et la description de l'abonnement retournés par l'API.
> Renseigne uniquement les valeurs de fallback (utilisées si l'API ne répond pas).

```
title fallback       : 
description fallback : 
og:image fallback    : 
```

---

### 4. À propos — `/about`

```
title        : 
description  : 
keywords     : 
og:image     : 
```

---

### 5. Connexion — `/auth/login`

```
title        : 
description  : 
```

---

### 6. Inscription — `/auth/register`

```
title        : 
description  : 
```

---

### 7. Inscription prestataire — `/auth/provider/register`

```
title        : 
description  : 
```

---

## Informations globales (utilisées sur toutes les pages)

```
Nom du site          : 
URL du site          : https://
og:image par défaut  : (URL absolue vers le logo ou une image représentative)
Langue               : fr
Pays cibles          : 
Twitter/X handle     : (ex: @juna_app — laisser vide si pas de compte)
```
