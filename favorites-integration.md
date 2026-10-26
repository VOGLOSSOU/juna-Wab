# Cartes et favoris web

Les cartes de l'accueil et d'Explorer reprennent la présentation mobile : durée sur la photo, titre et prestataire sur deux lignes, prix total et mention « pour toute la durée ». Le cœur est un bouton distinct du lien de navigation.

Les favoris utilisent POST `/favorites`, DELETE `/favorites/:subscriptionId` et GET `/favorites?page=1&limit=20` via le client Axios existant. Ils sont accessibles depuis le profil dans « Mes favoris » et depuis le détail d'abonnement. Les visiteurs sont invités à se connecter.

Les mutations attendent la confirmation du serveur et bloquent les doubles clics. Les erreurs conservent l'état précédent. L'état partagé est effacé à chaque changement de compte et n'est pas enregistré dans localStorage. Les réponses de découverte sont associées au compte et à la révision de la requête pour éviter les anciens états de cœur. Le catalogue et les détails se rafraîchissent après une mutation.

La liste des favoris est paginée et conserve les abonnements indisponibles avec leur indication, tout en permettant leur retrait.

Vérifications : `npm run test:favorites`, `npx tsc --noEmit --incremental false` et ESLint sur les fichiers modifiés. Les tests des API utilisent un client HTTP simulé ; la validation avec un compte réel demande le backend déployé et la migration `20261026000000_add_favorites` appliquée.
