# Code Guide SmartEstate

Ce guide resume les grandes parties du projet et indique a quoi sert chaque bloc.

## Frontend

- `frontend/src/main.tsx`: point d'entree React, montage de l'application.
- `frontend/src/App.tsx`: routeur principal et separation des espaces public, utilisateur, agent et administrateur.
- `frontend/src/auth/AuthContext.tsx`: gestion de la session, du token, de la connexion, de l'inscription et du profil courant.
- `frontend/src/lib/api.ts`: client HTTP unique pour appeler l'API, gerer le cache et normaliser les erreurs.
- `frontend/src/lib/roles.ts`: roles applicatifs, labels, routes d'accueil et navigation selon le profil.
- `frontend/src/lib/smartestateApp.ts`: catalogue central des routes de l'application.
- `frontend/src/lib/routePrefetch.ts`: prechargement des routes et des donnees pour accelerer la navigation.
- `frontend/src/lib/documentActions.ts`: actions de navigation et comportements relies aux pages importees.
- `frontend/src/components/ImportedPageDocument.tsx`: wrapper commun des pages importees.
- `frontend/src/components/ProtectedRoute.tsx`: garde d'acces pour les pages reservees.
- `frontend/src/components/GuestRoute.tsx`: redirection des utilisateurs deja connectes.
- `frontend/src/components/DashboardSidebar.tsx`: navigation latérale adaptee au role.
- `frontend/src/components/UserAvatar.tsx`: avatar reutilisable pour le profil et la sidebar.
- `frontend/src/components/MarketListingsMap.tsx`: carte des annonces avec regroupement par zone.

## Parcours utilisateur

- `frontend/src/pages/HomePage.tsx`: page d'accueil publique.
- `frontend/src/pages/LoginPage.tsx`: connexion et comptes de demonstration.
- `frontend/src/pages/SignupPage.tsx`: inscription publique avec choix de role autorise.
- `frontend/src/pages/ProfilePage.tsx`: modification du profil, avatar et informations du compte.
- `frontend/src/pages/AiEstimationPage.tsx`: estimation IA d'un bien.
- `frontend/src/pages/UserInvestmentSimulationPage.tsx`: simulation d'investissement et de financement.
- `frontend/src/pages/MarketListingsPage.tsx`: annonces ETL, filtres et carte.
- `frontend/src/pages/AiRecommendationsPage.tsx`: recommandations de biens et d'actions.
- `frontend/src/pages/UserHistoryPage.tsx`: historique des actions et estimations.

## Parcours agent

- `frontend/src/pages/ExecutiveDashboardPage.tsx`: tableau de bord partage pour l'agent et l'administration.
- `frontend/src/pages/AgentListingsPage.tsx`: liste des annonces de l'agent.
- `frontend/src/pages/AgentListingCreatePage.tsx`: creation d'une nouvelle annonce.
- `frontend/src/pages/AgentClientRequestsPage.tsx`: suivi des demandes clients.
- `frontend/src/pages/AgentStatisticsPage.tsx`: statistiques dediees a l'agent.

## Parcours administrateur

- `frontend/src/pages/AdminUsersPage.tsx`: gestion des utilisateurs.
- `frontend/src/pages/AdminAgentsPage.tsx`: validation et gestion des agents.
- `frontend/src/pages/AdminListingsPage.tsx`: moderation des annonces.
- `frontend/src/pages/AdminDataPage.tsx`: supervision des donnees immobilieres.
- `frontend/src/pages/AdminLocationsPage.tsx`: gestion des villes et quartiers.
- `frontend/src/pages/AdminMlModelPage.tsx`: administration du modele ML.
- `frontend/src/pages/AdminStatisticsPage.tsx`: statistiques globales de la plateforme.
- `frontend/src/pages/AdminSettingsPage.tsx`: configuration de la maquette admin.
- `frontend/src/pages/ReportsPage.tsx`: rapports et syntheses.
- `frontend/src/pages/TeamManagementPage.tsx`: gestion des equipes et des roles.

## Backend - Accounts

- `backend/apps/accounts/models.py`: modele utilisateur personnalise et roles.
- `backend/apps/accounts/serializers.py`: serialisation de l'auth, du profil et de l'inscription.
- `backend/apps/accounts/views.py`: API d'inscription, de connexion, de profil courant et de gestion des utilisateurs.
- `backend/apps/accounts/permissions.py`: permissions basees sur les roles.
- `backend/apps/accounts/management/commands/seed_smartestate_demo.py`: donnees de demonstration.

## Backend - Properties

- `backend/apps/properties/models.py`: annonces et donnees de marche.
- `backend/apps/properties/serializers.py`: exposition API des biens et des filtres.
- `backend/apps/properties/views.py`: endpoints de consultation et de synchronisation.
- `backend/apps/properties/etl/pipeline.py`: normalisation et ingestion des donnees scrapees.
- `backend/apps/properties/etl/scrapers.py`: collecte des annonces brutes.
- `backend/apps/properties/management/commands/scrape_market_listings.py`: lancement manuel du scraping.

## Backend - Intelligence

- `backend/apps/intelligence/models.py`: objets metier IA et resultats stockes.
- `backend/apps/intelligence/serializers.py`: exposition API des estimations, rapports et recommandations.
- `backend/apps/intelligence/views.py`: dashboards, estimation, recommandations et rapports.
- `backend/apps/intelligence/ml/algorithms.py`: logique de calcul et prediction.

## Backend - Organizations

- `backend/apps/organizations/models.py`: organisations, equipes et appartenances.
- `backend/apps/organizations/serializers.py`: exposition API des organisations.
- `backend/apps/organizations/views.py`: endpoints de gestion d'equipe.

## Notes

- Les fichiers de migration servent a faire evoluer la base de donnees et ne contiennent pas de logique fonctionnelle.
- Les tests couvrent les parcours critiques, surtout l'authentification, le profil et les API principales.
