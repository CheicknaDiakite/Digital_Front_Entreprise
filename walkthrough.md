# GestionStock — guide de repérage du projet

> État observé le 8 octobre 2026. Ce document est la carte de référence du projet : le mettre à jour lorsqu'une fonctionnalité, une route, un modèle, une formule d'abonnement ou une variable d'environnement importante change.

## 1. Objectif et périmètre

**GestionStock** est une plateforme intégrée de gestion d'entreprise, d'inventaire et de point de vente. Elle permet de gérer les entreprises, les utilisateurs et leurs rôles, les catalogues de produits, les entrées et sorties de stock (ventes/caisse), les clients, les dépenses, les factures proforma/définitives, les statistiques et le suivi des abonnements.

Le modèle intègre un système d'abonnements hiérarchisé :
- **Mode Découverte (0)** : gratuit, activé automatiquement dès l'inscription (1 entreprise, 1 utilisateur, 50 articles max, sans téléversement d'images).
- **Stock Simple (1)** : 40 000 F/an (1 entreprise, 1 utilisateur, articles illimités, gestion client et facturation).
- **Stock Pro (2)** : 75 000 F/an (jusqu'à 3 entreprises, 5 collaborateurs, articles illimités, imports d'images personnalisées, dépenses, rapports détaillés).
- **Stock Premium (3)** : sur devis (entreprises et utilisateurs illimités, personnalisations avancées).

Le projet est composé de deux dépôts Git indépendants :

| Dossier | Rôle | Technologies principales |
| --- | --- | --- |
| `Front/` | Interface utilisateur et applications desktop/mobile | React 18, TypeScript, Vite, MUI, TailwindCSS, React Router, TanStack Query, Zustand, Framer Motion |
| `Back/` | API et règles métier | Django 5, Django REST Framework, SimpleJWT, MySQL ou SQLite |

Le navigateur, Electron, et l'application Capacitor utilisent la même interface React. Le frontend communique avec le backend exclusivement par l'API REST sous `/api`.

## 2. Vue d'ensemble des flux

```text
Utilisateur
   │
   ▼
Front (React) ── Axios + JWT + X-Entreprise-Id ──► Back /api (Django REST) ──► Base de données (MySQL)
   │                                                         │
   │                                                         └──► médias : images, QR codes, factures
   ├── React Query : données serveur / cache
   ├── Zustand + localStorage : session, compte et entreprise active
   └── usePlanAccess + FeatureGate : contrôle d'accès selon les capabilities du plan
```

### Flux métier central

```text
Entreprise (avec Licence) → Catégorie → Sous-catégorie → Entrée (produit en stock)
                                                                 │
                                ┌────────────────────────────────┴────────────────┐
                                ▼                                                 ▼
                           Sortie / vente                                    QR / code-barres
                                │                                                 │
                                ▼                                                 ▼
                      Facture + historique                              Recherche produit au scan
```

Une `Entrer` représente le lot ou produit actuellement stocké. Une `Sortie` enregistre une vente ou déstockage. Les modèles d'historique conservent les traces d'audit des opérations.

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
| `npm run build` | produit le bundle web de production dans `dist/` |
| `npm run electron:dev` | construit puis ouvre l'application Electron |
| `npm run electron:build` | génère l'installateur Windows Electron |

Le frontend exige la variable `VITE_API_URL`, l'URL du serveur Django **sans** `/api` final. Exemple pour un environnement local :

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Cette variable est consommée par `src/_services/caller.service.ts`, qui configure `Base.baseURL` à `VITE_API_URL/api`.

### Backend

Depuis `Back/` :

```powershell
..\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Les variables utiles sont documentées dans `Back/.env.example`. Vérifier `Back/root/settings.py` : la configuration MySQL y est activée par défaut, avec fallback SQLite si configuré.

## 4. Frontend : où chercher quoi

| Zone | Responsabilité |
| --- | --- |
| `src/main.tsx` | point d'entrée ; providers React Query, Google OAuth, toast et PWA |
| `src/App.tsx` | providers de thème et routeur applicatif |
| `src/routes/AppRouter.tsx` | séparation entre routes protégées et routes d'authentification |
| `src/routes/Public/PublicRouter.tsx` | **source de vérité des routes métier** (avec alias modernes `/stock/*`, `/ventes/*`, `/finances/*`, `/admin/*`) |
| `src/routes/ProtectedRoute.tsx` | garde de rôle utilisateur (avec compatibilité pour les comptes en Mode Découverte) |
| `src/layout/` | structure visuelle : tableau de bord, en-tête, tiroir latéral (`NavSide.tsx`), layout minimal |
| `src/hooks/usePlanAccess.ts` | **hook central de gestion des capacités** (`isDecouverte`, `canUploadMedia`, `canManageExpenses`, `canAddCollaborators`, etc.) |
| `src/components/FeatureGate.tsx` | composant barrière visuel bloquant les fonctionnalités hors-plan avec contact d'upgrade |
| `src/boutique/categorie/CatalogueUnifie.tsx` | **catalogue unifié** (catégories, sous-catégories, articles) avec modales d'ajout modernes et verrouillage d'image Découverte |
| `src/boutique/` | écrans métier : inventaire, sorties/caisse, clients, dépenses, personnel, administration |
| `src/_services/` | appels API Axios groupés par domaine (`caller.service.ts` injecte le token JWT et `X-Entreprise-Id`) |
| `src/usePerso/fonction.*.ts` | hooks React Query : requêtes, mutations asynchrones fiabilisées et invalidation de cache |
| `src/usePerso/store.ts` | état Zustand persistant de la session, de l'utilisateur et de l'entreprise sélectionnée |
| `src/typescript/` | contrats TypeScript (`UserType.ts`, `DataType.ts`, etc.) |
| `src/layout/Dashboard/Header/HeaderContent/Notification.tsx` | centre d'alertes compact pour ruptures de stock, avis et licences |
| `src/boutique/Ct.tsx` | modale de sélection et renouvellement d'abonnement |

### Convention pour une nouvelle fonctionnalité

1. Définir ou mettre à jour le contrat dans `src/typescript/`.
2. Déclarer l'appel HTTP dans le service approprié de `src/_services/`.
3. Créer ou ajuster le hook React Query dans `src/usePerso/fonction.*.ts` ; invalider les requêtes affectées après mutation.
4. Si la fonctionnalité dépend de la formule d'abonnement, utiliser le hook `usePlanAccess` et le composant `FeatureGate`.
5. Créer l'écran dans `src/boutique/` (ou `src/pages/`).
6. Enregistrer la route dans `src/routes/Public/PublicRouter.tsx` et mettre à jour la navigation dans `NavSide.tsx`.
7. Protéger l'accès avec `ProtectedRoute` et synchroniser les permissions côté backend (DRF).

### Authentification, session et en-tête d'entreprise

- `AuthGuard` bloque l'accès aux écrans métier en l'absence de `token` dans `localStorage`.
- `caller.service.ts` :
  - Injecte `token_1` comme Bearer Token Authorization à chaque requête.
  - Injecte l'en-tête HTTP `X-Entreprise-Id` avec l'UUID de l'entreprise courante pour permettre au backend de résoudre instantanément l'entreprise et sa licence.
  - En cas de 401, rafraîchit automatiquement le token d'accès via `/api/utilisateur/token/refresh`.
  - En cas de 403 avec `code: "plan_insuffisant"` ou `"quota_atteint"`, déclenche l'événement global `plan_restriction_error` intercepté par l'UI (`NavSide.tsx`) pour ouvrir la modale d'aide ou d'abonnement.
- `useStoreUuid` sauvegarde l'entreprise active sous la clé `entreprise-uuid` et `current_entreprise_uuid`.
- `useAccountStore` sauvegarde le compte sous la clé `account`.

### Rôles utilisateurs

Les rôles proviennent de `Back/utilisateur/models.py` :

| Valeur | Rôle | Responsabilité et accès |
| --- | --- | --- |
| `1` | Admin / Propriétaire | gestion complète de l'entreprise, personnel, utilisateurs, stock et finances |
| `2` | Editor / Gérant | gestion du stock, des entrées, sorties, inventaires et factures |
| `3` | Author / Vendeur | saisie des sorties, encaissements et consultation produit |
| `4` | Visitor | consultation de base selon permissions |
| `0` ou non défini | Nouveau propriétaire (Découverte) | accès complet aux opérations fondamentales de son entreprise, bridé par les quotas de licence |

## 5. Routes métier principales

Toutes les routes métier nécessitent une session authentifiée, sauf `/auth/*`.

| URL | Écran / intention | Rôles requis / Accès |
| --- | --- | --- |
| `/` | sélection et accueil multi-entreprises | Tous |
| `/entreprise` | tableau de bord analytique et actions rapides | Tous |
| `/categorie` | **Catalogue unifié** (catégories, sous-catégories, produits) | Rôles 1, 2 ou Découverte |
| `/entre` | gestion et consultation des entrées de stock | Rôles 1, 2 ou Découverte |
| `/sortie` | terminal de vente et enregistrement des sorties | Rôles 1, 2, 3 ou Découverte |
| `/entreprise/produit/entre` | consultation des factures d'achat / approvisionnements | Rôles 1, 2 ou Découverte |
| `/entreprise/produit/sortie` | factures de vente et déstockages | Rôles 1, 2, 3 ou Découverte |
| `/entreprise/client` | fiches clients, fournisseurs et historique | Inclus à partir de Stock Simple |
| `/entreprise/depense` | registre des dépenses d'entreprise | Inclus à partir de Stock Pro |
| `/entreprise/personnel` | gestion de l'équipe et collaborateurs | Inclus à partir de Stock Pro (Rôle 1) |
| `/user/admin` | administration des comptes utilisateurs | Rôle 1 |
| `/entreprise/historique` | journal d'audit et historiques des mouvements | Rôles 1, 2 ou Découverte |
| `/entreprise/PreFacture` | devis et factures proforma | Tous |
| `/entreprise/EtaDeVente` | rapports et états financiers de vente | Tous |
| `/user/avis` | retours d'expérience et support client | Tous |
| `/auth/login`, `/auth/register` | connexion et inscription (crée auto l'entreprise Découverte) | Public |

### Alias d'architecture moderne déclarés dans `PublicRouter.tsx`

| Alias | Redirection cible |
| --- | --- |
| `/stock/catalogue` | `/categorie` |
| `/stock/appro` | `/entre` |
| `/stock/factures` | `/entreprise/produit/entre` |
| `/stock/mouvements` | `/entreprise/historique` |
| `/ventes/caisse` | `/sortie` |
| `/ventes/factures` | `/entreprise/produit/sortie` |
| `/ventes/proforma` | `/entreprise/PreFacture` |
| `/ventes/clients` | `/entreprise/client` |
| `/finances/depenses` | `/entreprise/depense` |
| `/finances/rapports` | `/entreprise/EtaDeVente` |
| `/admin/entreprise` | `/entreprise/detail` |
| `/admin/personnel` | `/entreprise/personnel` |
| `/admin/utilisateurs` | `/user/admin` |
| `/admin/journal` | `/entreprise/historique` |

## 6. Backend : architecture et règles métier

| App / fichier | Responsabilité |
| --- | --- |
| `root/` | configuration Django, URLs racines, permissions, emails, stockage média |
| `utilisateur/` | modèle `Utilisateur`, modèle `Licence`, rôles, JWT, Google OAuth |
| `entreprise/` | entreprises, catalogue, stock, ventes, clients, dépenses, factures, statistiques |
| `entreprise/permissions.py` | **permissions DRF par formule de licence** (`HasFeature`, `CanUploadMediaPermission`, etc.) |
| `entreprise/quotas.py` | **contrôle des quotas** (`verifier_quota`, `MediaGuardMixin`) |
| `entreprise/utils.py` | extraction de l'entreprise via en-tête `X-Entreprise-Id` |
| `entreprise/models.py` | modèle de données métier |
| `entreprise/views.py` et `entreprise/voirs.py` | endpoints API REST |
| `*/serializers.py` | validation DRF, sérialisation et exposition des `capabilities` |

### Modèles métier principaux

| Modèle | Rôle et relations essentielles |
| --- | --- |
| `Utilisateur` | compte utilisateur personnalisé ; identifiants `id` et `uuid`, rôles (1 à 4), liaison multi-entreprises |
| `Entreprise` | unité d'exploitation ; relie un `proprietaire` (Utilisateur) et une `licence` (Licence) |
| `Licence` | formule d'abonnement (0=Découverte, 1=Simple, 2=Pro, 3=Premium), validité, date d'expiration et méthode `capabilities()` |
| `Categorie` | catégorie parente rattachée à une entreprise |
| `SousCategorie` | sous-catégorie ou article type avec génération automatique de slug unique |
| `Entrer` | lot ou produit en stock : sous-catégorie, quantité, prix d'achat/vente, seuil critique, code-barres |
| `Sortie` | mouvement de vente ou sortie lié à une entrée, calcul des marges |
| `Client` | fiche tiers (client ou fournisseur) rattachée à l'entreprise |
| `Depense` | dépense d'exploitation avec montant et justificatif éventuel |
| `Facture`, `FactEntre`, `FactSortie` | facturation d'achat et de vente avec gestion des remises et acomptes |
| `PaiementEntreprise` | historique des transactions et règlements d'abonnement |
| `Notification` | alertes persistantes (rupture de stock, expiration de licence, réponses aux avis) |
| `Avi` | retour utilisateur avec suivi de statut (`nouveau`, `en_cours`, `repondu`, `ferme`) |

## 7. Système de licences et contrôle d'accès

### Matrice des fonctionnalités par plan (`Licence.PLAN_MINIMUM`)

| Fonctionnalité | Plan minimal requis | Impact en cas de non-éligibilité |
| --- | --- | --- |
| **upload_media** | Stock Pro (2) | Blocage upload images/logos ; icônes système imposées en Mode Découverte |
| **depenses** | Stock Pro (2) | Module dépenses verrouillé (consultation seule si déclassement) |
| **collaborateurs** | Stock Pro (2) | Ajout de membres d'équipe bloqué ; écran protégé par FeatureGate |
| **clients** | Stock Simple (1) | Gestion du carnet clients et fournisseurs |
| **stats_basiques** | Stock Simple (1) | Indicateurs de marge et statistiques générales |
| **stats_detaillees** | Stock Pro (2) | Analyse approfondie par période et agent |
| **stats_personnalisees** | Stock Premium (3) | Tableaux de bord sur mesure et exports personnalisés |

### Quotas appliqués (`Licence.LIMITES`)

| Plan | Entreprises | Collaborateurs | Articles max |
| --- | --- | --- | --- |
| **Mode Découverte (0)** | 1 | 1 | 50 articles |
| **Stock Simple (1)** | 1 | 1 | Illimité |
| **Stock Pro (2)** | 3 | 5 | Illimité |
| **Stock Premium (3)** | Illimité | Illimité | Illimité |

### Mécanique de bridage côté client et serveur

1. **Génération automatique à l'inscription** : chaque nouvelle entreprise créée reçoit automatiquement une `Licence` en Mode Découverte permanente ou avec période d'essai.
2. **Transmission des `capabilities`** : `EntrepriseDetailSerializer` injecte dans l'objet entreprise le dictionnaire `capabilities` (`plan`, `features`, `limits`, `is_valid`, `date_expiration`).
3. **Consommation frontend via `usePlanAccess`** : les composants interrogent `planAccess.isDecouverte`, `planAccess.canUploadMedia`, `planAccess.canManageExpenses`, etc.
4. **Verrouillage ergonomique UI** :
   - Modales du catalogue ([CatalogueUnifie.tsx](file:///c:/Users/DELL/Documents/Projet/GestionStock/Front/src/boutique/categorie/CatalogueUnifie.tsx)) : en Mode Découverte, le sélecteur d'image est désactivé (`pointerEvents: 'none'`) et un bandeau avec cadenas explique que les images personnalisées nécessitent la formule Pro.
   - Modules avancés (Personnel, Dépenses) : affichage du composant `<FeatureGate>` invitant au contact pour mise à niveau.
   - Barre latérale (`NavSide.tsx`) : affichage de badges « Pro » et cadenas sur les rubriques restreintes.
5. **Garde-fous backend stricts** :
   - `MediaGuardMixin` et `CanUploadMediaPermission` rejettent tout fichier téléversé si la licence ne dispose pas de la permission.
   - `AddSousCategorieAPIView` vérifie le quota de 50 articles et résout les catégories de manière sécurisée (UUID, slug ou ID numérique).
   - Les rejets renvoient un code HTTP 403 avec un payload structuré (`code: "plan_insuffisant"` ou `"quota_atteint"`).

## 8. QR code et code-barres

- À la création d'une entrée de stock, `Entrer.barcode_value` prend le code saisi ou reprend automatiquement la référence `ref`.
- Le backend génère une image QR PNG dans `Entrer.barcode` lors de la persistance.
- L'endpoint de scan `GET /api/entreprise/entre/scan/<code>` recherche par `barcode_value` ou `ref`.
- `BarcodeScanner.tsx` assure la lecture via la caméra de l'appareil. Les douchettes USB fonctionnent directement par saisie clavier.
- Les formulaires de sortie et de caisse préremplissent automatiquement l'article scanné.

## 9. Notifications, abonnement et avis

### Notifications de stock et licence

- Le composant `Notification.tsx` récupère les notifications de l'entreprise via l'API.
- Alerte de stock critique : déclenchée si la quantité est inférieure ou égale au seuil critique (ou `<= 20` par défaut).
- Rupture totale de stock : déclenchée dès que la quantité atteint `0`.
- Notification d'abonnement : avertit des expirations imminentes à J-15 et J-0.

### Gestion des abonnements

- La modale `Ct.tsx` détaille les formules Stock Simple, Stock Pro et Stock Premium.
- Les boutons d'action déclenchent l'assistance commerciale ou la commande directe via lien WhatsApp pré-rempli (`wa.me/22391154834`).
- Le renouvellement met à jour le champ `type`, `active` et `date_expiration` de la `Licence` associée à l'entreprise.

### Avis et satisfaction client

- Les utilisateurs peuvent déposer des avis et suggestions rattachés à leur entreprise via `/user/avis`.
- Le superadministrateur peut traiter chaque avis et faire évoluer son statut (`nouveau` → `en_cours` → `repondu` → `ferme`).
- Toute réponse crée une notification persistante pour l'auteur de l'avis.

## 10. Points d'attention pour les évolutions futures

- **Double routage historique.** `AppRouter.tsx` s'appuie sur `PublicRouter`/`AuthRouter`. Les fichiers `MainRoutes.tsx` et `LoginRoutes.tsx` correspondent à un ancien découpage non monté. Toutes les nouvelles routes métier doivent être ajoutées dans `PublicRouter.tsx`.
- **Règles de permissions double niveau.** Tout blocage visuel par `FeatureGate` ou `usePlanAccess` dans le frontend doit impérativement avoir son équivalent DRF côté Django (`permissions.py`, `quotas.py`).
- **En-tête `X-Entreprise-Id`.** Toujours s'assurer que l'UUID de l'entreprise est renseigné dans `localStorage` afin que l'intercepteur Axios l'injecte dans les en-têtes API.
- **Cache TanStack Query.** Après toute mutation (ajout d'article, encaissement, modification de catégorie), toujours invalider les clés de cache correspondantes via `queryClient.invalidateQueries`.
- **Sécurisation des identifiants.** Favoriser l'usage des `uuid` plutôt que des identifiants numériques directs dans les URLs et les paramètres d'API.

## 11. Procédure de vérification avant livraison

### Frontend

```powershell
cd Front
npx tsc --noEmit
npm run build
```

Vérifications manuelles :
1. Connexion et bascule entre entreprises.
2. Inscription d'un nouveau compte : vérification du Mode Découverte automatique et du blocage d'image dans le catalogue.
3. Test de création d'article et absence de double toast en cas d'erreur ou succès.
4. Affichage responsive sur mobile et tablette.

### Backend

```powershell
cd Back
python manage.py makemigrations
python manage.py check
python manage.py test
```

Vérifications manuelles :
1. Test de l'endpoint `POST /api/entreprise/sous_categorie/add` avec et sans image.
2. Vérification du respect des quotas (limite de 50 articles en Mode Découverte).
3. Contrôle des réponses HTTP 403 avec code d'erreur structuré.
