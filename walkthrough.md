# GestionStock — guide de repérage du projet

> État observé le 14 octobre 2026. Ce document est la carte de référence du projet : le mettre à jour lorsqu'une fonctionnalité, une route, un modèle, une formule d'abonnement ou une variable d'environnement importante change.

## 1. Objectif et périmètre

**GestionStock** est une plateforme intégrée de gestion d'entreprise, d'inventaire et de point de vente. Elle permet de gérer les entreprises, les utilisateurs et leurs rôles, les catalogues de produits, les entrées et sorties de stock (ventes/caisse), les clients, les dépenses, les factures proforma/définitives, les statistiques et le suivi des abonnements.

Le modèle intègre un système d'abonnements hiérarchisé :
- **Mode Découverte (0)** : gratuit, activé automatiquement dès l'inscription (1 entreprise, 0 collaborateur supplémentaire / propriétaire seul, 50 articles max, 50 ventes max, sans téléversement d'images).
- **Stock Simple (1)** : 40 000 F/an (jusqu'à 2 entreprises, 1 collaborateur, articles illimités, gestion client et facturation, statistiques de vente basiques).
- **Stock Pro (2)** : 75 000 F/an (jusqu'à 5 entreprises, jusqu'à 5 collaborateurs, articles illimités, imports d'images personnalisées, dépenses et pertes, rapports détaillés et support prioritaire).
- **Stock Premium (3)** : sur devis (entreprises, collaborateurs et articles illimités, personnalisations avancées et support dédié).

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
Front (React) ── Axios + JWT + X-Entreprise-Id ──► Back /api (Django REST) ──► Base de données (MySQL / SQLite)
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
| `src/hooks/usePlanAccess.ts` | **hook central de gestion des capacités** (`isDecouverte`, `canUploadMedia`, `canManageExpenses`, `canAddCollaborators`, quotas `limits`, etc.) |
| `src/components/FeatureGate.tsx` | composant barrière visuel bloquant les fonctionnalités hors-plan avec contact d'upgrade |
| `src/components/common/KpiCard.tsx` | cartes métriques KPI avec typographie fluide (`fontSize` réactif) et adaptation aux grilles mobiles |
| `src/boutique/categorie/CatalogueUnifie.tsx` | **catalogue unifié** (catégories, sous-catégories, lots en stock) avec filtrage réactif en cascade, compteurs de stock en temps réel (`scStockRefs`), modales d'ajout et verrouillage d'image Découverte |
| `src/boutique/sortie/FactureListe.tsx` | historique des factures de vente avec défilement fluide garanti (`overflowX`/`overflowY`, sticky header opaque) |
| `src/boutique/proprietaire/Admin/InfoEntreprise/ModifEntreprise/ModifEntreprise.tsx` | configuration de l'entreprise, affichage de l'état de licence et dialogue de prolongation par code d'activation |
| `src/boutique/proprietaire/Personnel/Personnel.tsx` | gestion d'équipe avec barrière `FeatureGate` (`Stock Simple` requis), mutations asynchrones fiabilisées (toasts actifs, `isPending`), attribution par défaut du rôle Vendeur et rattachement des invités avec `peut_creer_entreprise = False` |
| `src/boutique/proprietaire/Admin/Entreprise.tsx` | gestion multi-entreprises avec calcul dynamique du quota selon le meilleur plan, contrôle de `peut_creer_entreprise` avec masquage des bannières Découverte/quotas pour les collaborateurs invités, et cartes sécurisées avec toast préventif et badge ambre « Rôle en attente » si le rôle n'a pas encore été configuré |
| `src/boutique/proprietaire/Admin/InfoEntreprise/InfoUsers/InfoUsers.tsx` | écran super user d'administration des utilisateurs avec interrupteur « Peut créer une entreprise » et retrait immédiat de collaborateur avec mise à jour instantanée du tableau sans rechargement de page |
| `src/pages/authentication/auth-forms/AuthLogin.tsx` | formulaire de connexion unifié acceptant indifféremment identifiant, email ou numéro de téléphone |
| `src/pages/authentication/auth-forms/AuthRegister.tsx` | parcours d'inscription publique sans saisie manuelle d'identifiant (génération automatique de `username` côté serveur) |
| `src/boutique/` | écrans métier : inventaire, sorties/caisse, clients, dépenses, personnel, administration |
| `src/_services/` | appels API Axios groupés par domaine (`caller.service.ts` injecte le token JWT et `X-Entreprise-Id`) |
| `src/usePerso/fonction.*.ts` | hooks React Query : requêtes, mutations asynchrones fiabilisées, notifications toast et invalidation ciblée des caches (ex. `useRemoveUserEntreprise` invalidant `entrepriseUsers`, `UserGet`, `UserEntreprises`, `EntreModif`) |
| `src/usePerso/store.ts` | état Zustand persistant de la session, de l'utilisateur et de l'entreprise sélectionnée |
| `src/typescript/` | contrats TypeScript (`UserType.ts`, `DataType.ts`, `FormType.ts` incluant le champ optionnel `role`, etc.) |
| `src/layout/Dashboard/Header/HeaderContent/Notification.tsx` | centre d'alertes compact pour ruptures de stock, avis et licences avec rafraîchissement périodique (60s) et purge d'ID orphelin sur 404 |
| `src/boutique/Ct.tsx` | modale / page de sélection et présentation des formules d'abonnement avec redirection WhatsApp |

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
- **Connexion multi-critères :** Le champ unique de connexion accepte au choix :
  - L'identifiant utilisateur (`username`)
  - L'adresse email (`email` ou `email_user`)
  - Le numéro de téléphone (`numero`)
- **Génération automatique des identifiants :** Lors d'une inscription ou de la création d'un personnel, le backend génère automatiquement un `username` unique basé sur le prénom et le nom (ex. `moussa.traore` ou `moussa.traore2`). L'identifiant est transmis par email au collaborateur.
- **Synchronisation automatique des emails :** Le modèle `Utilisateur` maintient automatiquement la synchronisation entre `email` et `email_user` à chaque sauvegarde (`save()`).
- **Droit de création d'entreprise (`peut_creer_entreprise`) :**
  - Les utilisateurs auto-inscrits disposent de `peut_creer_entreprise = True` dès l'inscription (Mode Découverte).
  - Les collaborateurs invités via l'écran Personnel sont créés avec `peut_creer_entreprise = False`. Ils peuvent se connecter et travailler dans l'entreprise hôte, mais ne peuvent pas créer d'entreprise personnelle sans activation préalable par le super-administrateur.
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
| `/entreprise/personnel` | gestion de l'équipe et collaborateurs | Inclus à partir de Stock Simple (Rôle 1 - jusqu'à 1 collaborateur en Simple, 5 en Pro, illimité en Premium) |
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
| `utilisateur/` | modèle `Utilisateur` (avec `peut_creer_entreprise` et synchro auto `email`/`email_user`), modèle `Licence`, `LicenceHistorique`, rôles, JWT, Google OAuth |
| `utilisateur/views.py` | connexion multi-critères (identifiant, email, téléphone), génération auto de `username`, création de collaborateurs avec contrôle `has_feature("collaborateurs")`, quota `limite("utilisateurs")`, affectation par défaut du rôle `Utilisateur.AUTHOR` (3) et `peut_creer_entreprise=False`, endpoint super user `ActiverCreationEntrepriseView` |
| `utilisateur/admin.py` | gestion des licences avec inlines `LicenceHistorique` et gestion des droits utilisateurs (`peut_creer_entreprise` modifiable en ligne) |
| `entreprise/` | entreprises, catalogue, stock, ventes, clients, dépenses, factures, statistiques |
| `entreprise/permissions.py` | **permissions DRF par formule de licence** (`HasFeature`, `CanUploadMediaPermission`, etc.) |
| `entreprise/quotas.py` | **contrôle des quotas** (`verifier_quota`, `MediaGuardMixin`) |
| `entreprise/utils.py` | extraction de l'entreprise via en-tête `X-Entreprise-Id` |
| `entreprise/models.py` | modèle de données métier avec intégrité référentielle et protection d'audit (`on_delete=models.SET_NULL`, libellés textuels immuables) |
| `entreprise/views.py` et `entreprise/voirs.py` | endpoints API REST (dont `set_entreprise`, et `remove_user_from_entreprise` qui détache le lien ManyToMany sans supprimer le compte ni l'historique) |
| `entreprise/serializers.py` | sérialiseurs d'entreprise (`EntrepriseSerializer` appliquant le quota d'entreprises selon le meilleur plan et bloquant les invités non activés avec `peut_creer_entreprise`, `EntrepriseDetailSerializer` exposant les `capabilities`) |
| `utilisateur/test_registration.py` | tests unitaires de l'auto-inscription, de la création de personnel, du blocage d'entreprise pour invités et de l'activation super user |

### Endpoints clés et résolutions optimisées

- **`EntresEntrepriseAPIView` (`entreprise/voirs.py`)** : retourne la liste des lots en stock pour l'entreprise active. Requête optimisée avec `select_related('souscategorie', 'souscategorie__categorie', 'client')` et exposition directe des clés parentes (`categorie_uuid`, `categorie_slug`, `parent_categorie_libelle`, `sous_categorie_uuid`, `sous_categorie_id`, `sous_categorie_slug`, `sous_categorie_libelle`) pour permettre au frontend d'effectuer des filtrages instantanés et fiables sans surcoût réseau.
- **`InfoSousCatView` (`entreprise/views.py`)** : agrège l'état des sous-catégories et garantit que les articles ayant du stock enregistré (même sans historique de vente préliminaire) remontent correctement avec leurs indicateurs d'inventaire.
- **`AddSousCategorieAPIView` (`entreprise/views.py`)** : sécurise l'ajout de sous-catégories par vérification des quotas Découverte (50 articles max) et résolution tolérante de la catégorie parente par UUID, slug ou ID numérique.
- **`set_entreprise` (`entreprise/views.py`)** : assure la mise à jour des paramètres de l'entreprise et active une licence lorsqu'un champ `code` ou `licence_code` est transmis (nettoyage casse/espaces, contrôle de validité et vérification qu'aucune autre entreprise n'utilise ce code, accessible au propriétaire, membres, admins et éditeurs avec rafraîchissement automatique du cache frontend).
- **`remove_user_from_entreprise` (`entreprise/views.py`)** : révoque l'accès d'un collaborateur à l'entreprise (`entreprise.utilisateurs.remove(user)`). Le compte utilisateur et l'intégralité de ses actions historiques (entrées, sorties, ventes, factures) restent préservés en base de données.
- **`ActiverCreationEntrepriseView` (`utilisateur/views.py`)** : endpoint sécurisé réservé au superadministrateur (`POST /api/utilisateur/<uuid>/activer-creation-entreprise`) permettant de basculer le drapeau `peut_creer_entreprise`.
- **`RechercherUtilisateurView` (`utilisateur/views.py`)** : endpoint sécurisé (`POST /api/utilisateur/admin/rechercher`) permettant à un propriétaire de retrouver un compte utilisateur existant par email, téléphone ou nom d'utilisateur avec calcul dynamique des statuts (`deja_membre`, `est_proprietaire`, `est_soi_meme`).
- **`RattacherPersonnelView` (`utilisateur/views.py`)** : endpoint sécurisé (`POST /api/utilisateur/admin/rattacher`) permettant de rattacher un utilisateur existant comme Gérant (rôle 2) ou Caissier (rôle 3) dans son entreprise, sous contrôle strict des quotas de la licence hôte et notification par e-mail en arrière-plan.

### Traçabilité et conservation des données lors du retrait d'un collaborateur

Lorsqu'un employé ou collaborateur est retiré d'une entreprise via l'interface (`remove_user_from_entreprise`), aucune donnée historique n'est altérée ni perdue. Le système repose sur une triple garantie d'intégrité :
1. **Détachement Many-to-Many strict** : L'appel backend exécute `entreprise.utilisateurs.remove(user)`. Le compte `Utilisateur` continue d'exister dans la table utilisateur et ne subit aucune suppression.
2. **Empreinte textuelle figée (`libelle`)** : Chaque opération de stock ([HistoriqueSortie](file:///c:/Users/DELL/Documents/Projet/GestionStock/Back/entreprise/models.py#L579), [HistoriqueEntrer](file:///c:/Users/DELL/Documents/Projet/GestionStock/Back/entreprise/models.py#L421)) enregistre en dur l'identité de l'opérateur au moment de l'action (`libelle=f"Produit sorti par {admin.first_name} {admin.last_name}"`).
3. **Protection contre la suppression en cascade (`SET_NULL`)** : Les relations d'audit (`HistoriqueSortie`, `HistoriqueEntrer`, `Sortie`, `Facture`) utilisent la clause `on_delete=models.SET_NULL`. Même en cas de suppression ultérieure du compte au niveau système, la trace de l'opération subsiste indéfiniment.
4. **Visibilité préservée pour l'entreprise** : Le journal d'audit de l'entreprise filtre sur les articles et mouvements appartenant à l'entreprise (`sortie__entrer__souscategorie__categorie__entreprise=entreprise`). Les propriétaires et superviseurs continuent ainsi de visualiser 100% des actions passées du membre retiré.

### Modèles métier principaux

| Modèle | Rôle et relations essentielles |
| --- | --- |
| `Utilisateur` | compte utilisateur personnalisé ; identifiants `id` et `uuid`, rôles (1 à 4), liaison multi-entreprises, champ `peut_creer_entreprise` et synchro automatique `email`/`email_user` |
| `Entreprise` | unité d'exploitation ; relie un `proprietaire` (Utilisateur) et une `licence` (Licence) |
| `Licence` | formule d'abonnement (0=Découverte, 1=Simple, 2=Pro, 3=Premium), validité, date d'expiration, code unique 14 caractères et méthode `capabilities()` |
| `LicenceHistorique` | traçabilité des modifications de licence (ancien/nouveau plan, expiration, modificateur, référence de paiement, date) |
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
| **upload_media** | Stock Pro (2) | Blocage upload images/logos ; icônes système imposées en Mode Découverte et Stock Simple |
| **depenses** | Stock Pro (2) | Module dépenses verrouillé (consultation seule si déclassement) |
| **collaborateurs** | Stock Simple (1) | Ajout de membres d'équipe bloqué en Découverte ; écran protégé par FeatureGate |
| **clients** | Stock Simple (1) | Gestion du carnet clients et fournisseurs |
| **stats_basiques** | Stock Simple (1) | Indicateurs de marge et statistiques générales de vente |
| **stats_detaillees** | Stock Pro (2) | Analyse approfondie par période et agent |
| **stats_personnalisees** | Stock Premium (3) | Tableaux de bord sur mesure et exports personnalisés |

### Quotas appliqués (`Licence.LIMITES`)

| Plan | Entreprises | Collaborateurs (hors propriétaire) | Articles max | Ventes max |
| --- | --- | --- | --- | --- |
| **Mode Découverte (0)** | 1 | 0 | 50 articles | 50 ventes |
| **Stock Simple (1)** | 2 | 1 | Illimité | Illimité |
| **Stock Pro (2)** | 5 | 5 | Illimité | Illimité |
| **Stock Premium (3)** | Illimité | Illimité | Illimité | Illimité |

### Mécanique de bridage côté client et serveur

1. **Génération automatique à l'inscription** : chaque nouvelle entreprise créée reçoit automatiquement une `Licence` en Mode Découverte permanente (`date_expiration = None`).
2. **Transmission des `capabilities`** : `EntrepriseDetailSerializer` injecte dans l'objet entreprise le dictionnaire `capabilities` (`plan`, `features`, `limits`, `is_valid`, `date_expiration`).
3. **Consommation frontend via `usePlanAccess`** : les composants interrogent `planAccess.isDecouverte`, `planAccess.canUploadMedia`, `planAccess.canManageExpenses`, `planAccess.canAddCollaborators`, `planAccess.limits`, etc.
4. **Verrouillage ergonomique UI** :
   - Modales du catalogue ([CatalogueUnifie.tsx](file:///c:/Users/DELL/Documents/Projet/GestionStock/Front/src/boutique/categorie/CatalogueUnifie.tsx)) : en Mode Découverte et Simple, le sélecteur d'image est désactivé (`pointerEvents: 'none'`) et un bandeau avec cadenas explique que les images personnalisées nécessitent la formule Pro.
   - Module Collaborateurs ([Personnel.tsx](file:///c:/Users/DELL/Documents/Projet/GestionStock/Front/src/boutique/proprietaire/Personnel/Personnel.tsx)) : protégé par `<FeatureGate>` requérant au minimum Stock Simple ; le bouton d'ajout est désactivé si `staffMembers.length >= staffLimit`.
   - Multi-entreprises ([Entreprise.tsx](file:///c:/Users/DELL/Documents/Projet/GestionStock/Front/src/boutique/proprietaire/Admin/Entreprise.tsx)) : le bouton de création d'entreprise est désactivé lorsque l'utilisateur a atteint le quota de son meilleur plan actif (1 en Découverte, 2 en Simple, 5 en Pro), ou masqué si l'utilisateur est un invité non activé (`peut_creer_entreprise === false`).
   - Caisse POS et terminal de vente ([Sortie.tsx](file:///c:/Users/DELL/Documents/Projet/GestionStock/Front/src/boutique/sortie/Sortie.tsx), [CaissePOS.tsx](file:///c:/Users/DELL/Documents/Projet/GestionStock/Front/src/boutique/sortie/CaissePOS.tsx)) : affichage du compteur de ventes restantes en Mode Découverte (`X / 50 ventes`). Dès que 50 sorties sont enregistrées, un bandeau d'alerte s'affiche et le bouton de validation de vente est désactivé avec un bouton d'action vers WhatsApp pour passer à Stock Simple.
   - Barre latérale (`NavSide.tsx`) : affichage de badges « Pro » et cadenas sur les rubriques restreintes.
5. **Garde-fous backend stricts** :
   - `MediaGuardMixin` et `CanUploadMediaPermission` rejettent tout fichier téléversé si la licence ne dispose pas de la permission.
   - `AddSousCategorieAPIView` vérifie le quota de 50 articles en Découverte et résout les catégories de manière sécurisée (UUID, slug ou ID numérique).
   - `SortieCreateView` vérifie le quota de 50 ventes (`Sortie.objects.filter(...) >= limite_ventes`) et renvoie une réponse HTTP 403 (`code: "quota_atteint"`, `quota: "ventes"`), déclenchant l'événement `plan_restriction_error` côté frontend.
   - `utilisateur/views.py` rejette la création de collaborateurs si `has_feature("collaborateurs")` est faux ou si le nombre de collaborateurs actuels atteint `limite_collaborateurs`.
   - `EntrepriseSerializer` vérifie que le nombre d'entreprises possédées ne dépasse pas le quota du meilleur plan du propriétaire ET bloque la création d'entreprise pour les comptes invités ayant `peut_creer_entreprise = False` (hors superusers).
   - Les rejets renvoient un code HTTP 403 avec un payload structuré (`code: "plan_insuffisant"` ou `"quota_atteint"`).

### Règle d'activation des invités pour la création d'entreprise

Le plan de sécurité des comptes invités applique la séparation suivante :

| Type d'utilisateur | `peut_creer_entreprise` | Accès entreprise | Création de nouvelle entreprise |
| --- | --- | --- | --- |
| **Auto-inscrit** (page `/auth/register`) | `True` | Propriétaire de son entreprise Découverte | Immédiate |
| **Invité** (créé via `/entreprise/personnel`) | `False` | Collaborateur de l'entreprise qui l'a invité | Bloquée tant que non activé |
| **Invité activé** (par le super user) | `True` | Collaborateur + propriétaire potentiel | Autorisée dès l'activation |

- **Non-interférence avec le travail quotidien :** Un invité non activé conserve tous ses droits opérationnels dans l'entreprise hôte (ventes, caisse, stock, factures selon son rôle).
- **Double verrouillage :** Le contrôle est assuré côté backend dans `EntrepriseSerializer.create` (erreur 400 inviolable) et reflété côté frontend dans `Entreprise.tsx` (masquage ergonomique et encart d'avertissement).
- **Gestion Super User :** Le superadministrateur peut basculer ce statut à tout moment depuis l'interface Django Admin ou via l'interrupteur interactif de l'écran `InfoUsers.tsx` (`POST /api/utilisateur/<uuid>/activer-creation-entreprise`).

### Cycle de vie des collaborateurs et attribution des rôles

1. **Création & Affectation par défaut** : Lorsqu'un collaborateur est créé via l'écran Personnel (`/entreprise/personnel`), l'endpoint backend `api_user_admin_register` lui attribue par défaut le rôle `Author / Vendeur` (valeur `3`) s'il n'est pas spécifié, garantissant qu'aucun compte ne se retrouve sans rôle opérationnel.
2. **Contrôle d'accès et ergonomie sur l'accueil (`Entreprise.tsx`)** :
   - Si un utilisateur est membre d'une entreprise mais ne possède aucun rôle configuré, la carte d'entreprise affiche un badge ambre « Rôle en attente ».
   - Tout clic sur cette entreprise bloque la navigation et déclenche un toast préventif explicite (« Votre compte n'a pas encore de rôle configuré pour cette entreprise. Veuillez contacter l'administrateur. ») au lieu de laisser survenir une erreur d'autorisation générique.
   - Les collaborateurs invités (`peut_creer_entreprise === false`) bénéficient d'un en-tête adapté : les puces de quota d'entreprises personnelles ainsi que le bandeau commercial WhatsApp « Mode Découverte » sont masqués pour ne pas surcharger leur espace de travail.
3. **Retrait d'un collaborateur (`InfoUsers.tsx`)** :
   - Lorsqu'un administrateur retire un membre, le tableau local d'utilisateurs est immédiatement mis à jour (`setEntrepriseUsers((prev) => prev.filter(...))`) en synchronisation avec l'invalidation du cache React Query, supprimant instantanément la ligne à l'écran sans nécessiter d'actualisation manuelle de la page.

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

### Gestion et cycle de vie des abonnements

Le parcours d'abonnement et de renouvellement suit le protocole suivant :
1. **Consultation des formules** : la page/modale `Ct.tsx` détaille les formules Stock Simple (40 000 F/an), Stock Pro (75 000 F/an) et Stock Premium (sur devis).
2. **Contact & Commande** : les boutons d'action redirigent vers WhatsApp (`wa.me/22391154834`) avec un message contextualisé vers le service commercial.
3. **Paiement & Génération** : l'administrateur crée ou met à jour la `Licence` dans l'espace Django Admin (`/admin/utilisateur/licence/`), définit la durée de validité et enregistre l'historique de paiement (`LicenceHistorique`).
4. **Activation dans l'application** : l'utilisateur se rend dans les Paramètres de l'entreprise (`ModifEntreprise.tsx`), clique sur le bouton **« Prolonger l'abonnement »** et saisit le code d'activation fourni.
5. **Validation backend** : l'endpoint `POST /api/entreprise/set` vérifie l'existence et l'unicité du code, puis affecte la licence à l'entreprise. Les `capabilities` sont recalculées immédiatement.

### Avis et satisfaction client

- Les utilisateurs peuvent déposer des avis et suggestions rattachés à leur entreprise via `/user/avis`.
- Le superadministrateur peut traiter chaque avis et faire évoluer son statut (`nouveau` → `en_cours` → `repondu` → `ferme`).
- Toute réponse crée une notification persistante pour l'auteur de l'avis.

## 10. Points d'attention pour les évolutions futures

- **Double routage historique.** `AppRouter.tsx` s'appuie sur `PublicRouter`/`AuthRouter`. Les fichiers `MainRoutes.tsx` et `LoginRoutes.tsx` correspondent à un ancien découpage non monté. Toutes les nouvelles routes métier doivent être ajoutées dans `PublicRouter.tsx`.
- **Règles de permissions double niveau.** Tout blocage visuel par `FeatureGate` ou `usePlanAccess` dans le frontend doit impérativement avoir son équivalent DRF côté Django (`permissions.py`, `quotas.py`, `views.py`).
- **En-tête `X-Entreprise-Id`.** Toujours s'assurer que l'UUID de l'entreprise est renseigné dans `localStorage` afin que l'intercepteur Axios l'injecte dans les en-têtes API.
- **Cache TanStack Query.** Après toute mutation (ajout d'article, encaissement, modification de catégorie, prolongation d'abonnement), toujours invalider les clés de cache correspondantes via `queryClient.invalidateQueries`.
- **Synchronisation locale immédiate lors des retraits/suppressions :** En complément de l'invalidation TanStack Query (`queryClient.invalidateQueries`), toujours coupler les mutations de suppression avec une mise à jour d'état local réactive (`set...((prev) => prev.filter(...))`). Cela garantit une réactivité visuelle instantanée et élimine le besoin d'actualiser manuellement la page.
- **Préservation immuable des historiques d'audit :** Ne jamais employer de clause `CASCADE` sur les modèles liés à la traçabilité des opérations (`HistoriqueEntrer`, `HistoriqueSortie`, `Sortie`, `Facture`). Toujours privilégier `on_delete=models.SET_NULL` et consigner un libellé textuel figeant l'auteur au moment de l'action (`libelle=f"Produit sorti par {first_name} {last_name}"`), assurant une traçabilité permanente pour l'entreprise même après le retrait d'un employé.
- **Sécurisation des identifiants.** Favoriser l'usage des `uuid` plutôt que des identifiants numériques directs dans les URLs et les paramètres d'API.
- **Ergonomie mobile et typographie réactive :**
  - Dans les en-têtes d'écrans (`PageHeader`) et barres d'outils, prévoir un empilement adaptatif (`flexWrap: 'wrap'` ou `flexDirection: { xs: 'column', sm: 'row' }`) avec des libellés de boutons concis sur mobile (ex. `+ Multi-Lignes` au lieu de `+ Approvisionnement Multi-Lignes`).
  - Pour les grilles de cartes KPI (`KpiCard`), privilégier `xs={6} sm={6} md={3}` pour un affichage 2x2 propre sur smartphone, et employer une typographie fluide (`fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' }`) afin d'éviter tout chevauchement ou rognage de chiffres longs.
  - Dans les listes de sélection latérale (comme la liste des catégories dans `CatalogueUnifie`), borner la hauteur maximale (`maxHeight: { xs: 260, md: 'none' }` avec `overflowY: 'auto'`) pour ne pas repousser le contenu principal hors de la vue sur mobile.
- **Défilement et robustesse des tableaux (`TableContainer`) :**
  - Ne **jamais** appliquer `overflow: 'hidden'` sur un `TableContainer` ou sur son conteneur `Paper` parent lorsqu'un tableau comprend de nombreuses colonnes ou nécessite un en-tête fixe.
  - Toujours autoriser le défilement horizontal (`overflowX: 'auto'` avec `minWidth: 900` ou `920` sur la `Table`) et vertical (`overflowY: 'auto'` avec `maxHeight` calculé, ex. `calc(100vh - 280px)`), avec `stickyHeader` et des cellules d'en-tête dotées d'un `backgroundColor` opaque et d'un `zIndex` adapté.
- **Filtrage hiérarchique Catalogue / Stock en cascade :**
  - L'arborescence repose sur Entreprise → Catégorie → Sous-catégorie → Entrée (lot stocké). Les requêtes API sur les entrées doivent toujours joindre la sous-catégorie et la catégorie parente pour permettre le filtrage croisé instantané dans le frontend sans requête réseau supplémentaire. Côté UI, garantir une réinitialisation claire ("Toutes les catégories", "Toutes les sous-catégories") avec des états vides explicites et actionnables.

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
3. Contrôle des quotas collaborateurs : blocage en Découverte, limite de 1 en Simple, 5 en Pro.
4. Contrôle du quota d'entreprises : limite calculée sur le meilleur abonnement du propriétaire.
5. Dialogue d'activation de licence dans les paramètres de l'entreprise.
6. Test de création d'article et absence de double toast en cas d'erreur ou succès.
7. Affichage responsive sur mobile et tablette (en-têtes empilés, KPIs 2x2, listes bornées).
8. Filtrage fluide dans le catalogue (sélection Catégorie -> Sous-catégories -> Produits/lots en stock).
9. Défilement horizontal et vertical fonctionnel sur les grands tableaux (ex. factures de vente).
10. Retrait d'un collaborateur dans `InfoUsers.tsx` : disparition immédiate de la ligne sans rechargement de page.
11. Carte d'entreprise sans rôle dans `Entreprise.tsx` : affichage du badge « Rôle en attente » et toast informatif au clic.

### Backend

```powershell
cd Back
python manage.py makemigrations
python manage.py check
python manage.py test utilisateur.test_registration
python manage.py test
```

Vérifications manuelles :
1. Test de l'endpoint `POST /api/entreprise/sous_categorie/add` avec et sans image.
2. Vérification du respect des quotas (limite de 50 articles en Mode Découverte).
3. Test de création de collaborateur (`POST /api/utilisateur/admin/inscription`) : vérification de l'attribution `peut_creer_entreprise=False`, rôle par défaut Vendeur (`Utilisateur.AUTHOR`), rattachement à l'entreprise et envoi d'email avec `username` généré.
4. Test d'activation de création d'entreprise via l'endpoint super user `POST /api/utilisateur/<uuid>/activer-creation-entreprise`.
5. Vérification du blocage DRF (HTTP 400) lors d'une tentative de création d'entreprise par un collaborateur invité non activé.
6. Test de connexion multi-identifiants (via identifiant, email ou numéro de téléphone).
7. Test d'activation de licence via `POST /api/entreprise/set` avec code valide / invalide.
8. Contrôle des réponses HTTP 403 avec code d'erreur structuré (`plan_insuffisant`, `quota_atteint`).
9. Retrait d'un collaborateur (`POST /api/entreprise/user/remove`) : vérification du détachement Many-to-Many et maintien intégral des historiques (`HistoriqueSortie`, `HistoriqueEntrer`, factures).
10. Contrôle du quota de ventes Découverte : vérification du blocage à 50 sorties max (`POST /api/entreprise/sortie/add`) et déblocage lors du passage au plan supérieur.
