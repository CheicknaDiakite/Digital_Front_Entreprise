# GestionStock — guide de repérage du projet

> État observé le 23 septembre 2026. Ce document est la carte de référence du projet : le mettre à jour lorsqu'une fonctionnalité, une route, un modèle ou une variable d'environnement importante change.

## 1. Objectif et périmètre

**GestionStock** est une application de gestion d'entreprise et de stock. Elle permet notamment de gérer les entreprises, les utilisateurs et leurs rôles, les catégories de produits, les entrées et sorties de stock, les clients, les dépenses, les factures et les statistiques.

Le projet est composé de deux dépôts Git indépendants :

| Dossier | Rôle | Technologies principales |
| --- | --- | --- |
| `Front/` | Interface utilisateur et applications desktop/mobile | React 18, TypeScript, Vite, MUI, React Router, TanStack Query, Zustand |
| `Back/` | API et règles métier | Django 5, Django REST Framework, SimpleJWT, MySQL ou SQLite |

Le navigateur, Electron, et l'application Capacitor utilisent la même interface React. Le frontend parle au backend exclusivement par l'API HTTP sous `/api`.

## 2. Vue d'ensemble des flux

```text
Utilisateur
   │
   ▼
Front (React) ── Axios + JWT ──► Back /api (Django REST) ──► Base de données
   │                                      │
   │                                      └──► médias : images, QR codes, factures
   ├── React Query : données serveur / cache
   └── Zustand + localStorage : session et entreprise active
```

### Flux métier central

```text
Entreprise → Catégorie → Sous-catégorie → Entrée (produit en stock)
                                                │
                              ┌─────────────────┴────────────────┐
                              ▼                                  ▼
                         Sortie / vente                     QR / code-barres
                              │                                  │
                              ▼                                  ▼
                    Facture + historique               Recherche produit au scan
```

Une `Entrer` représente le produit actuellement stocké. Une `Sortie` enregistre un mouvement de vente/sortie. Les modèles d'historique conservent les traces des opérations.

## 3. Démarrer localement

### Frontend

Depuis `Front/` :

```powershell
npm install
npm run dev
```

| Commande | Effet |
| --- | --- |
| `npm run dev` | lance Vite en développement |
| `npm run build` | produit le build web dans `dist/` |
| `npm run electron:dev` | construit puis ouvre l'application Electron |
| `npm run electron:build` | génère l'installateur Windows Electron |

Le frontend exige `VITE_API_URL`, l'URL du serveur Django **sans** `/api` final. Exemple pour un backend local :

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Cette valeur est lue par `src/_services/caller.service.ts`, qui construit ensuite l'URL `VITE_API_URL/api`.

### Backend

Depuis `Back/` :

```powershell
..\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Les variables utiles sont documentées dans `Back/.env.example`. Vérifier `Back/root/settings.py` avant de lancer le projet : la branche MySQL y est actuellement activée (`if True`), même si un fichier `db.sqlite3` est présent.

## 4. Frontend : où chercher quoi

| Zone | Responsabilité |
| --- | --- |
| `src/main.tsx` | point d'entrée ; providers React Query, Google OAuth, toast et PWA |
| `src/App.tsx` | providers de thème et routeur applicatif |
| `src/routes/AppRouter.tsx` | séparation entre routes authentifiées et routes d'authentification |
| `src/routes/Public/PublicRouter.tsx` | **source de vérité des routes métier** |
| `src/layout/` | structure visuelle : tableau de bord, en-tête, tiroir, layout minimal |
| `src/boutique/` | écrans métier : inventaire, sorties, catégories, clients, personnel, administration |
| `src/_services/` | appels API Axios regroupés par domaine |
| `src/usePerso/fonction.*.ts` | hooks React Query : lecture, mutations et invalidation de cache |
| `src/usePerso/store.ts` | état persistant Zustand de l'utilisateur et de l'entreprise sélectionnée |
| `src/typescript/` | contrats TypeScript des données API et formulaires |
| `src/_components/` et `src/components/` | composants réutilisables |
| `src/themes/` | palette, composants MUI et préférences d'affichage |
| `src/layout/Dashboard/Header/HeaderContent/Notification.tsx` | cloche et centre compact des alertes stock, abonnement et avis |
| `src/boutique/proprietaire/users/Avis.tsx` | formulaire d'avis, suivi, filtres, réponse et gestion de statut |
| `src/boutique/Ct.tsx` | contenu de la modale d'abonnement ouverte depuis la navigation |

### Convention pour une nouvelle fonctionnalité

1. Définir ou compléter le type dans `src/typescript/`.
2. Ajouter l'appel HTTP dans le service concerné de `src/_services/`.
3. Créer ou adapter le hook React Query dans `src/usePerso/fonction.*.ts` ; invalider les clés de cache affectées après une mutation.
4. Créer l'écran dans `src/boutique/` (ou `src/pages/` si ce n'est pas une fonction métier).
5. Déclarer sa route dans `src/routes/Public/PublicRouter.tsx` et ajuster la navigation si nécessaire.
6. Contrôler l'accès avec `ProtectedRoute` lorsque le rôle le requiert.

### Authentification et état local

- `AuthGuard` bloque les routes métier sans `token` dans `localStorage`.
- `caller.service.ts` ajoute `token_1` comme bearer token à chaque requête API.
- En cas de réponse 401, Axios tente un renouvellement avec `token` sur `/api/utilisateur/token/refresh`, puis rejoue la requête.
- `useStoreUuid` conserve l'entreprise active sous la clé `entreprise-uuid` ; de nombreux écrans en dépendent.
- `useAccountStore` conserve le compte sous la clé `account`.

Ne pas changer les clés `token`, `token_1`, `entreprise-uuid` ou `account` sans migration : elles sont persistées dans les navigateurs déjà utilisés.

### Rôles utilisateurs

Les valeurs viennent de `Back/utilisateur/models.py` :

| Valeur | Rôle | Usage observé côté interface |
| --- | --- | --- |
| `1` | Admin | gestion des utilisateurs, personnel et fonctions sensibles |
| `2` | Editor | accès à certaines données d'entreprise et entrées produit |
| `3` | Author | accès aux sorties produit |
| `4` | Visitor | rôle défini côté backend ; accès UI à vérifier écran par écran |

Les restrictions frontales améliorent l'expérience, mais les vérifications d'autorisation doivent aussi rester présentes côté Django.

## 5. Routes métier principales

Toutes les routes ci-dessous nécessitent une session, sauf `/auth/*` et la réinitialisation de mot de passe.

| URL | Écran / intention |
| --- | --- |
| `/` | sélection/accueil de l'entreprise |
| `/entreprise` | tableau de bord de l'entreprise active |
| `/entre` | ajouter et consulter des entrées de stock |
| `/sortie` | enregistrer une sortie ou une vente |
| `/categorie` | catégories ; accès rôles 1 ou 2 |
| `/categorie/:slug` | sortie depuis une catégorie |
| `/entreprise/client` | clients et leur historique |
| `/entreprise/depense` | dépenses |
| `/entreprise/produit/entre` | factures/produits entrés ; rôles 1 ou 2 |
| `/entreprise/produit/sortie` | factures/produits sortis ; rôles 1, 2 ou 3 |
| `/entreprise/personnel` | personnel ; rôle 1 |
| `/entreprise/utilisateur/admin` et `/user/admin` | gestion des utilisateurs ; rôle 1 |
| `/entreprise/historique` | historique des opérations ; rôles 1 ou 2 |
| `/user/avis` | envoi et suivi des avis ; réponses et statuts côté superutilisateur |
| `/auth/login`, `/auth/register` | connexion et inscription |
| `/auth/mot_de_passe_oublier` | demande de réinitialisation du mot de passe |

Avant de modifier une URL, rechercher ses liens et navigations : certaines routes sont imbriquées et certains composants construisent des URL dynamiques avec un `uuid` ou un `slug`.

## 6. Backend : architecture et données

| App / fichier | Responsabilité |
| --- | --- |
| `root/` | configuration Django, URLs racines, permissions, email, stockage |
| `utilisateur/` | utilisateur personnalisé, rôles, JWT, Google OAuth, mots de passe et restrictions horaires |
| `entreprise/` | entreprises, stock, ventes, clients, dépenses, factures, statistiques et historique |
| `entreprise/models.py` | modèle de données métier principal |
| `entreprise/views.py` et `entreprise/voirs.py` | endpoints métier, anciens et plus récents |
| `*/serializers.py` | sérialisation et validation DRF |
| `*/urls.py` | mapping URL → vue |

Les préfixes API sont déclarés dans `Back/root/urls.py` :

```text
/api/utilisateur/...
/api/entreprise/...
/media/...
/static/...
```

### Modèles métier principaux

| Modèle | Rôle et relations essentielles |
| --- | --- |
| `Utilisateur` | compte personnalisé Django ; possède un rôle, peut appartenir à plusieurs entreprises |
| `Entreprise` | unité de gestion ; relie des utilisateurs et possède catégories, clients et dépenses |
| `Categorie` | appartient à une entreprise |
| `SousCategorie` | appartient à une catégorie |
| `Entrer` | produit/stock : sous-catégorie, quantité, unités, prix, client optionnel, code à scanner |
| `Sortie` | mouvement de sortie lié à une entrée/produit selon le modèle métier |
| `Client` | client, fournisseur ou autre, rattaché à une entreprise |
| `Depense` | dépense avec montant et pièce jointe possible |
| `Facture`, `FactEntre`, `FactSortie` | facturation et pièces associées aux entrées/sorties |
| `HistoriqueEntrer` et historiques associés | audit des modifications et suppressions |
| `Avi` | avis lié à une entreprise, avec réponse et statut (`nouveau`, `en_cours`, `repondu`, `ferme`) |
| `Notification` | alerte persistante par entreprise/utilisateur, avec niveau, lien, lecture et résolution |

Les champs `uuid` sont les identifiants exposés dans la plupart des URLs. Les `slug` servent surtout à des parcours de catégories et à certaines pages. Préférer les `uuid` pour identifier une ressource de manière fiable.

## 7. API : points d'entrée à connaître

Les services du frontend constituent la liste pratique des endpoints utilisés :

| Domaine | Front | API Django |
| --- | --- | --- |
| Authentification/utilisateur | `account.service.ts` | `/api/utilisateur/login`, `token/refresh`, `user/profil`, `google-login` |
| Entreprises/statistiques | `entreprise.service.ts` | `/api/entreprise/get/...`, `statistiques/...`, `sous-categories-sorties/...` |
| Catégories/sous-catégories | `categorie.service.ts` | `/api/entreprise/categorie/...`, `/sous_categorie/...` |
| Entrées, sorties, dépenses | `categorie.service.ts` | `/api/entreprise/entre/...`, `/sortie/...`, `/depense/...` |
| Factures | `facture.service.ts`, `categorie.service.ts` | `/api/entreprise/facture/...` |
| Avis et notifications | `account.service.ts`, `notification.service.ts` | `/api/entreprise/avis/...`, `/notifications/<entreprise_uuid>` |

Pour ajouter un endpoint : modèle/migration → serializer/validation → vue → URL Django → service frontend → hook frontend → composant.

## 8. QR code et code-barres

- À la création d'une entrée, `Entrer.barcode_value` reçoit le code fourni ; s'il est vide, la référence `ref` est utilisée.
- Le backend crée une image QR PNG dans `Entrer.barcode` si aucune image n'existe encore.
- Le scan utilise `GET /api/entreprise/entre/scan/<code>` et cherche par `barcode_value` ou `ref`.
- `BarcodeScanner.tsx` fournit la lecture par caméra. Une douchette USB est également compatible puisqu'elle saisit le code comme un clavier.
- Les écrans de sortie préremplissent le produit trouvé ; `CardInvent.tsx` permet de consulter et télécharger le QR.

Lors d'une évolution, maintenir ensemble le modèle Django, le serializer, la vue de scan, le type TypeScript, le service `scanBarcode` et les écrans de saisie/vente.

## 9. Notifications, abonnement et avis

### Notifications

- La cloche de `Notification.tsx` lit les notifications persistantes de l'API et donne priorité aux alertes de stock.
- Une alerte est produite lorsque la quantité est inférieure ou égale à `20`, ou au seuil `qte_critique` lorsque celui-ci est supérieur à `20`.
- Une quantité nulle est signalée comme une **rupture** ; les autres cas sont des alertes de stock critique.
- Une notification peut être marquée comme lue individuellement ou globalement. Les réponses aux avis et les expirations d'abonnement sont également prises en charge.

### Abonnement

- Le menu Support ouvre la modale `Ct.tsx` via « Abonnement ? » ; il ne redirige pas vers une page distincte.
- Les offres affichées sont : `Stock Simple` à **40 000 F/an**, `Stock Pro` à **75 000 F/an**, et `Stock Premium` sur devis.
- La licence reste contrôlée côté backend. Le paiement en ligne et le prolongement automatique de licence restent à finaliser après la définition de l'offre Premium et du fournisseur retenu.

### Avis

- Un utilisateur peut envoyer un avis lié à une entreprise et suivre les réponses dans `/user/avis`.
- Le superutilisateur peut répondre et gérer le statut : nouveau, en cours, répondu ou fermé.
- Chaque réponse ou changement de statut crée une notification à destination de l'auteur de l'avis.

Le détail de la feuille de route se trouve dans `plan-amelioration-notifications-abonnement-avis.md`.

## 10. Points d'attention avant une évolution

- **Deux systèmes de routes coexistent.** `AppRouter.tsx` utilise `PublicRouter`/`AuthRouter`. `MainRoutes.tsx`, `LoginRoutes.tsx` et `routes/index.tsx` utilisent une autre configuration `createBrowserRouter` qui n'est pas montée par `App.tsx`. Modifier en priorité `PublicRouter.tsx`.
- **Deux styles de vues backend coexistent.** `views.py` et `voirs.py` exposent des endpoints dont certains se recouvrent. Identifier la route réellement appelée par le service frontend avant un changement.
- **Configuration d'environnement.** Ne jamais committer les secrets, identifiants de base de données ou clés OAuth. Fournir un `.env.example` pour toute nouvelle variable requise.
- **Médias.** Les images, QR et pièces jointes sont servis par `/media/`. Vérifier la stratégie de stockage avant un déploiement et ne pas versionner les fichiers utilisateurs.
- **Cache React Query.** Après toute mutation, invalider les clés de requête concernées, sinon l'interface peut afficher des données périmées.
- **PWA.** Le service worker peut conserver un ancien build. Après une évolution qui semble invisible, tester une fenêtre privée ou vider les données du site.
- **Sorties de build.** `node_modules/`, `dist/`, caches Python, médias locaux et artefacts Electron ne doivent pas devenir des modifications fonctionnelles accidentelles.

## 11. Vérification avant livraison

### Frontend

```powershell
cd Front
npm run build
```

Vérifier aussi, selon la fonctionnalité : connexion, sélection d'entreprise, accès par rôle, création/modification/suppression et affichage mobile.

### Backend

```powershell
cd Back
python manage.py makemigrations
python manage.py migrate
python manage.py check
python manage.py test
```

Ne créer une migration que si le modèle a effectivement changé. Tester l'endpoint modifié avec un compte disposant du rôle approprié.

## 12. Checklist de mise à jour de ce guide

- [ ] modèle ou relation de données ;
- [ ] endpoint, route frontend ou règle de rôle ;
- [ ] variable d'environnement ou procédure de démarrage ;
- [ ] nouveau module fonctionnel ;
- [ ] choix de stockage, d'authentification ou de plateforme (web, Electron, mobile) ;
- [ ] risque connu, dette technique ou décision d'architecture importante.

Cette documentation doit décrire l'état réel du code ; si une décision change, modifier le code et ce guide dans la même livraison.
