# Pages légales — Contenu à rédiger

Remplis les informations entre crochets [ ], puis transmets le fichier.
J'implémenterai toutes les pages d'un coup.

---

## Informations sur la société (utilisées sur toutes les pages)

```
Nom de la société / entité légale : 
Forme juridique                   : (ex: SARL, SAS, entreprise individuelle...)
Numéro d'immatriculation          : 
Adresse du siège social           : 
Pays                              : 
Email de contact légal            : 
Nom du responsable légal          : 
Hébergeur                         : Railway (railway.app)
Date de lancement                 : 
```

---

## 1. Politique de confidentialité

**URL suggérée :** `/privacy`

### Ce qu'elle doit contenir

#### 1.1 Introduction
- Qui sommes-nous (JUNA, coordonnées)
- Engagement envers la vie privée des utilisateurs

#### 1.2 Données collectées
- **Données d'inscription :** nom, email, numéro de téléphone, mot de passe (hashé)
- **Données de commande :** adresse de livraison, ville, historique de commandes
- **Données de localisation :** ville choisie par l'utilisateur pour personnaliser l'affichage
- **Données de paiement :** numéro Mobile Money (transmis à PawaPay — JUNA ne stocke pas les numéros de carte)
- **Données techniques :** adresse IP, type de navigateur/appareil, logs de connexion

#### 1.3 Pourquoi ces données sont collectées
- Création et gestion du compte
- Traitement des commandes et paiements
- Mise en relation avec les prestataires
- Amélioration du service
- Communication (notifications, emails transactionnels)

#### 1.4 Partage avec des tiers
- **PawaPay :** traitement des paiements Mobile Money (MTN, Moov, Orange, Wave)
- **Prestataires de repas :** nom, adresse de livraison partagés pour exécuter la commande
- **Railway :** hébergement de l'infrastructure backend
- Aucune vente de données à des tiers à des fins publicitaires

#### 1.5 Conservation des données
- Données de compte : conservées tant que le compte est actif
- Données de commande : [durée à définir — ex: 3 ans]
- Suppression sur demande dans un délai de [délai à définir — ex: 30 jours]

#### 1.6 Droits des utilisateurs
- Droit d'accès à ses données
- Droit de rectification
- Droit à la suppression ("droit à l'oubli")
- Droit à la portabilité
- Comment exercer ces droits : [email de contact]

#### 1.7 Sécurité
- Chiffrement des données en transit (HTTPS)
- Mots de passe hashés, tokens JWT sécurisés
- Accès limité aux données en interne

#### 1.8 Modifications
- JUNA se réserve le droit de modifier cette politique
- Les utilisateurs seront notifiés en cas de changement majeur

---

## 2. Conditions Générales d'Utilisation (CGU)

**URL suggérée :** `/terms`

### Ce qu'elle doit contenir

#### 2.1 Objet
- Description de JUNA : plateforme de mise en relation entre abonnés et prestataires de repas
- Ce que JUNA est (intermédiaire) et ce qu'elle n'est pas (restaurateur)

#### 2.2 Accès au service
- Âge minimum requis : [ex: 18 ans]
- Inscription obligatoire pour commander
- Un compte par personne
- L'utilisateur est responsable de la confidentialité de ses identifiants

#### 2.3 Comptes prestataires
- Processus de validation par JUNA avant activation
- Obligations du prestataire (qualité, respect des commandes, disponibilité)
- JUNA se réserve le droit de suspendre un prestataire en cas de manquement

#### 2.4 Responsabilités
- **JUNA est responsable de :** la plateforme technique, le traitement des paiements, la mise en relation
- **JUNA n'est pas responsable de :** la qualité des repas, les retards de livraison, les litiges entre utilisateur et prestataire
- Le prestataire est seul responsable des repas qu'il prépare et livre

#### 2.5 Propriété intellectuelle
- Le nom JUNA, le logo et le contenu de la plateforme sont la propriété de [société]
- Interdiction de copier, reproduire ou utiliser sans autorisation

#### 2.6 Comportement interdit
- Faux avis, fausses commandes
- Utilisation frauduleuse du système de paiement
- Tentative de contournement de la plateforme (contact direct prestataire pour éviter les frais)

#### 2.7 Suspension et résiliation
- JUNA peut suspendre ou supprimer un compte sans préavis en cas de fraude ou violation des CGU
- L'utilisateur peut supprimer son compte à tout moment depuis les paramètres

#### 2.8 Modifications des CGU
- JUNA peut modifier les CGU
- Utilisation continue du service = acceptation des nouvelles CGU

#### 2.9 Droit applicable
- Droit applicable : [pays — ex: droit béninois]
- Juridiction compétente : [ex: Tribunaux de Cotonou]

---

## 3. Conditions Générales de Vente (CGV)

**URL suggérée :** `/sales-terms`

### Ce qu'elle doit contenir

#### 3.1 Objet
- Encadrement des transactions entre utilisateurs et prestataires via JUNA

#### 3.2 Processus de commande
1. Sélection d'un abonnement
2. Choix du mode de réception (livraison ou retrait)
3. Paiement en ligne (Mobile Money) ou en espèces
4. Confirmation de commande
5. Activation par l'utilisateur une fois satisfait
6. Démarrage de l'abonnement

#### 3.3 Prix et paiement
- Prix affichés en Francs CFA (XOF), toutes taxes comprises
- Paiement sécurisé via PawaPay (MTN MoMo, Moov Money, Orange Money, Wave)
- Paiement en espèces possible selon le prestataire
- Frais de livraison : négociés directement avec le prestataire (non inclus dans le prix affiché)
- La commande n'est confirmée qu'après validation du paiement

#### 3.4 Activation de la commande
- Après confirmation du paiement, l'utilisateur doit activer sa commande
- L'activation signifie que l'utilisateur confirme avoir reçu ou être prêt à démarrer le service
- Le paiement est versé au prestataire après activation

#### 3.5 Annulation et remboursement
- Annulation possible avant activation de la commande
- Après activation : [politique à définir — ex: pas de remboursement sauf défaut du prestataire]
- En cas de non-livraison avérée : remboursement possible sur demande à [email]
- Délai de traitement des remboursements : [délai — ex: 5 à 10 jours ouvrés]

#### 3.6 Litiges
- En cas de litige avec un prestataire, contacter JUNA à [email]
- JUNA joue un rôle de médiateur mais ne peut être tenu responsable des manquements du prestataire

#### 3.7 Force majeure
- JUNA ne peut être tenu responsable en cas d'événement imprévisible (coupure réseau, indisponibilité opérateur Mobile Money, etc.)

---

## 4. Mentions légales

**URL suggérée :** `/legal`

### Ce qu'elle doit contenir

#### 4.1 Éditeur du site
- Nom de la société : [à remplir]
- Forme juridique : [à remplir]
- Capital social : [à remplir si applicable]
- Adresse du siège : [à remplir]
- Numéro d'immatriculation / RCCM : [à remplir]
- Email : [à remplir]
- Directeur de la publication : [à remplir]

#### 4.2 Hébergement
- Hébergeur : Railway (Railsware Products, Inc.)
- Site : https://railway.app
- Adresse : 548 Market St, San Francisco, CA 94104, USA

#### 4.3 Propriété intellectuelle
- L'ensemble du contenu (logo, textes, design) est protégé
- Reproduction interdite sans autorisation écrite préalable

#### 4.4 Contact
- Pour toute question : [email de contact]
