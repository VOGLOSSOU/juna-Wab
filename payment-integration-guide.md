# Paiement web Juna Eats avec FeexPay

Le navigateur contacte uniquement l’API Juna. Les identifiants marchand, la collecte
FeexPay et le webhook sont gérés exclusivement par le backend.

## Parcours

1. `/checkout?subscriptionId=...` charge les capacités actuelles du prestataire.
2. Livraison/retrait sont déterminés uniquement par `acceptsDelivery` et `acceptsPickup`.
   Un mode unique est imposé ; aucun mode disponible bloque la commande. Les zones
   conservées dans les données ne peuvent pas activer un mode désactivé.
3. Avant de créer la commande, le web recharge les capacités et vérifie le choix.
4. La commande créée est inscrite dans l’URL : `/checkout?orderId=...`. Cela permet
   de reprendre après rechargement ou depuis « Mes commandes ».
5. Le client choisit explicitement MTN, Moov ou Celtiis, au Bénin, puis son numéro
   à dix chiffres commençant par 01 (préfixe 229 accepté).
6. Le web vérifie la commande avant de lancer la collecte. Un paiement existant
   non échoué est repris sans nouvel appel de collecte.
7. `SUCCESS` ouvre la confirmation, `FAILED` permet une nouvelle tentative sur la
   même commande. Tout autre statut reste en vérification.
8. Après trois minutes, afficher « Confirmation en attente ». Une durée dépassée
   ou une erreur réseau ne prouve pas un échec. Aucune nouvelle collecte automatique.
9. Le polling est séquentiel. Retour au premier plan : vérification immédiate.
   Un changement de compte ou de page rend les anciennes réponses sans effet.
10. Le webhook et la réconciliation du backend peuvent confirmer après fermeture
    du navigateur. Les commandes sont rechargées au retour sur la page.

## Contrat API

`POST /payments/initiate` (JWT utilisateur) :

```json
{"orderId":"uuid","phoneNumber":"2290166000000","provider":"CELTIIS"}
```

Réponse : `paymentId`, `reference` (nullable), `status`, `message`.
Les statuts Juna sont `PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`, `REFUNDED`.
Le résultat peut être final dès le lancement. Le navigateur suit uniquement le
`paymentId`, jamais la référence marchand.

`GET /payments/:paymentId/status` renvoie notamment `id`, `orderId`, `status` et
`amount`. `GET /orders/:id` et `/orders/me` exposent `payment.id`, `payment.status`
et `payment.method`, utilisés pour la reprise.

Délais HTTP : 90 secondes pour le lancement, 45 secondes pour une vérification,
15 secondes pour les autres appels. Une réponse perdue conduit à vérifier la
commande existante, sans relancer automatiquement une collecte.

Le règlement de l’abonnement passe par la plateforme en livraison comme en retrait.
Aucun parcours de paiement hors plateforme ne confirme une commande.
Les frais de livraison restent à confirmer auprès du prestataire ; le montant
collecté correspond au montant de la commande renvoyé par le backend.

## Authentification

Les endpoints publics de connexion/inscription ne reçoivent pas d’ancien JWT et
ne déclenchent pas de refresh sur un refus de connexion. Un `401` de login affiche
« Email ou mot de passe incorrect. » dans le formulaire.

Un appel protégé peut rafraîchir sa session une seule fois, avec un refresh partagé
pour les appels simultanés. Seul un refus explicite de refresh (`401`/`403`) invalide
la session existante. Un incident réseau/serveur conserve les tokens.
Le motif d’expiration n’est pas persisté : une nouvelle visite anonyme ne l’affiche pas.
Les réponses d’un ancien compte ne peuvent pas modifier les tokens du compte actuel.

## Validation

`npm run test:checkout`, `npm run test:auth`, `npm run test:favorites`, TypeScript et
ESLint ciblé. Les tests simulent les réponses API, sans collecter de fonds.
Les essais réels d’opérateurs et le webhook se vérifient avec le backend déployé.


## Réponse de lancement perdue et absence de paiement

La fenêtre de 90 secondes part du lancement de `POST /payments/initiate`.
Après cette fenêtre, une nouvelle lecture réussie de la commande doit explicitement
renvoyer `payment: null` avant de proposer « Relancer le paiement ». Une propriété
absente, une erreur réseau ou un statut encore en cours ne sont pas une preuve
qu'aucun paiement n'a été enregistré.

Le bouton relit la commande avant d'ouvrir à nouveau le formulaire pour le même
`orderId`. Si le premier paiement est arrivé entre-temps, le suivi existant reprend.
Il n'y a aucune collecte automatique ni nouvelle commande créée par ce bouton.

Un paiement enregistré en `PENDING`/`PROCESSING` ne devient pas un échec à partir
d'un délai client. Le backend actuel suit FeexPay sans forcer d'expiration. Son
traitement des expirations opérateur ou d'une annulation garantie doit être confirmé
avant d'autoriser une seconde collecte pour une tentative encore en cours.
