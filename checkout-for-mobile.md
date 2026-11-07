# Contrat commun de commande web et mobile

Le parcours actuel et le contrat FeexPay sont décrits dans
[payment-integration-guide.md](./payment-integration-guide.md).

Les clients utilisent exclusivement les endpoints de l’API Juna. Le backend gère
la passerelle, le webhook et la réconciliation. Ne jamais intégrer de secret
marchand dans les applications clientes.

Points communs : choix explicite MTN/Moov/Celtiis au Bénin, modes de réception
pilotés par les indicateurs du prestataire, reprise par l’ID du paiement stocké
sur la commande, attente prolongée distincte d’un échec confirmé et absence de
collecte automatique lors d’une réponse perdue.

Le paiement confirme la commande. L’utilisateur active son abonnement à réception
du premier repas pour démarrer sa durée.
