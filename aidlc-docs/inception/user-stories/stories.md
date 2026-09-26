# Récits utilisateur

Organisation : par domaine métier (approche retenue, cf. `story-generation-plan.md`, Q3). Granularité atomique (Q1). Critères d'acceptation en Gherkin (Q2). Chaque récit référence son/ses persona(s) et son application. Toutes les règles métier citées renvoient à `aidlc-docs/inception/requirements/requirements.md`.

---

## Domaine 1 — Authentification & compte

### US-AUTH-01 — Créer un compte
**Persona** : Adorateur, Veilleur (`user-app`)
En tant que visiteur non connecté, je veux créer un compte Adorateur ou Veilleur, afin d'accéder aux fonctionnalités réservées aux membres.

```gherkin
Étant donné que je suis sur /inscription
Quand je remplis email, mot de passe (≥8 car., 1 chiffre, 1 caractère spécial), confirmation, nom, prénoms, téléphone (optionnel) et que je choisis le rôle "Adorateur"
Et que je soumets le formulaire
Alors mon compte est créé avec le statut VALIDE
Et je suis redirigé vers /inscription/confirmation avec le message "Votre compte est créé, vous pouvez vous connecter"

Étant donné le même formulaire avec le rôle "Veilleur"
Quand je soumets le formulaire
Alors mon compte est créé avec le statut EN_ATTENTE
Et le message affiché est "Votre compte est en attente de validation par un administrateur"
```

### US-AUTH-02 — Refuser une inscription avec mots de passe non identiques
**Persona** : Adorateur, Veilleur (`user-app`)
En tant que visiteur, je veux être averti si la confirmation de mot de passe ne correspond pas, afin de corriger avant soumission.

```gherkin
Étant donné que j'ai saisi un mot de passe et une confirmation différente
Quand je quitte le champ ou tente de soumettre
Alors un message d'erreur "Les mots de passe ne correspondent pas" s'affiche
Et le formulaire n'est pas soumis (contrôle frontend uniquement, champ non envoyé à l'API)
```

### US-AUTH-03 — Se connecter
**Persona** : Adorateur, Veilleur (`user-app`) ; Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'utilisateur possédant un compte, je veux me connecter avec mon email et mon mot de passe, afin d'accéder à mon espace.

```gherkin
Étant donné un compte VALIDE avec des identifiants corrects
Quand je soumets le formulaire de connexion
Alors je suis authentifié (cookie de session posé par le backend)
Et je suis redirigé vers "/" (user-app) ou "/" (admin-app) selon l'application
```

### US-AUTH-04 — Rejet de connexion générique (identifiants invalides ou compte non validé)
**Persona** : Adorateur, Veilleur (`user-app`) ; Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'utilisateur, je veux un message clair en cas d'échec de connexion, même si je ne peux pas savoir si c'est mon mot de passe ou mon statut de compte qui pose problème.

```gherkin
Étant donné des identifiants invalides, OU un compte au statut EN_ATTENTE, OU un compte au statut REJETE
Quand je soumets le formulaire de connexion et que l'API répond 401
Alors le message "Identifiants invalides ou compte non encore validé." s'affiche dans le formulaire
Et aucune tentative de rafraîchissement de session ni redirection n'est déclenchée (exclusion de la logique refresh/retry pour /auth/login)
```

### US-AUTH-05 — Refus de connexion pour rôle inapproprié à l'application
**Persona** : Administrateur, SuperAdministrateur (sur `user-app`) ; Adorateur, Veilleur (sur `admin-app`)
En tant qu'utilisateur avec un rôle non prévu pour l'application que j'utilise, je veux être clairement redirigé, afin de comprendre que je dois utiliser l'autre application.

```gherkin
Étant donné un compte Administrateur ou SuperAdministrateur authentifié avec succès sur user-app
Alors je suis redirigé vers /non-autorise

Étant donné un compte Adorateur ou Veilleur authentifié avec succès sur admin-app
Alors je suis redirigé vers /non-autorise
```

### US-AUTH-06 — Se déconnecter
**Persona** : tous les rôles authentifiés (les deux applications)
En tant qu'utilisateur connecté, je veux me déconnecter, afin de fermer ma session en toute sécurité.

```gherkin
Étant donné que je suis connecté
Quand je clique sur "Déconnexion"
Alors POST /auth/logout est appelé, mon cookie de session est invalidé, et je suis redirigé vers la page de connexion
```

### US-AUTH-07 — Consulter et modifier mon profil
**Persona** : Adorateur, Veilleur, Administrateur, SuperAdministrateur
En tant qu'utilisateur connecté, je veux consulter et modifier mes informations personnelles, afin de les garder à jour.

```gherkin
Étant donné que je suis sur /mon-compte
Alors je vois mes informations (email, nom, prénoms, téléphone, rôle, statut)
Et je peux modifier nom/prénoms/téléphone via PUT /users/{id}, quel que soit mon rôle (Adorateur inclus)
Et je ne vois aucune option de changement de mot de passe (non supporté par l'API)
```

### US-AUTH-08 — Consulter mon historique de réservations
**Persona** : Veilleur (`user-app`)
En tant que Veilleur, je veux voir la liste de mes réservations passées et à venir sur "Mon compte", afin de suivre mon engagement.

```gherkin
Étant donné que je suis un Veilleur connecté sur /mon-compte
Alors je vois la liste de mes réservations (dateDebut, dateFin, statut) triée par date
```

---

## Domaine 2 — Agenda / Planning (consultation)

### US-AGENDA-01 — Consulter l'agenda sans compte
**Persona** : Anonyme (`user-app`)
En tant que visiteur non connecté, je veux consulter l'agenda d'adoration, afin de voir les créneaux occupés et libres sans avoir à créer de compte.

```gherkin
Étant donné que je ne suis pas connecté et que je visite /agenda
Alors je vois le calendrier des réservations du jour/de la période, alimenté par GET /planning
Et toutes les entrées avec estAnonymise=true s'affichent "Créneau réservé" sans identité
Et aucune action de réservation n'est proposée
```

### US-AGENDA-02 — Consulter le planning avec anonymisation conditionnelle (Veilleur)
**Persona** : Veilleur (`user-app`)
En tant que Veilleur connecté, je veux voir l'identité sur mes propres réservations et une mention neutre sur les autres, afin de respecter la confidentialité des autres adorateurs.

```gherkin
Étant donné que je suis un Veilleur connecté sur /agenda
Alors les entrées dont je suis le créateur (estAnonymise=false) affichent mon nom et sont mises en évidence "Ma réservation" avec une action d'annulation
Et les autres entrées (estAnonymise=true) affichent "Créneau réservé" sans identité
```

### US-AGENDA-03 — Consulter le planning complet (Administrateur/SuperAdministrateur)
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux voir toutes les réservations avec leur identité sur /planning, afin de superviser l'ensemble du planning.

```gherkin
Étant donné que je suis Administrateur ou SuperAdministrateur connecté sur /planning
Alors je vois toutes les réservations du jour/de la période avec l'identité du bénéficiaire (comportement à confirmer en recette selon la valeur réelle d'estAnonymise renvoyée à ce rôle, cf. requirements.md — risques)
```

### US-AGENDA-04 — Filtrer le planning par date
**Persona** : tous rôles (les deux applications)
En tant qu'utilisateur consultant le planning, je veux filtrer par date, afin de me concentrer sur une période précise.

```gherkin
Étant donné que je suis sur /agenda ou /planning
Quand je sélectionne une date dans le sélecteur de période
Alors GET /planning?date=... est appelé et le calendrier se met à jour en conséquence
```

### US-AGENDA-05 — Filtrer "mes réservations"
**Persona** : Veilleur (`user-app`)
En tant que Veilleur, je veux filtrer le planning pour ne voir que mes propres réservations, afin de vérifier rapidement mon planning personnel.

```gherkin
Étant donné que je suis un Veilleur connecté sur /agenda
Quand j'active le filtre "Mes réservations"
Alors seules les entrées dont je suis le créateur sont affichées
```

---

## Domaine 3 — Réservation

### US-RESA-01 — Réserver un créneau pour moi-même (Veilleur)
**Persona** : Veilleur (`user-app`)
En tant que Veilleur, je veux réserver un créneau libre pour moi-même, afin de m'engager sur une plage d'adoration.

```gherkin
Étant donné que je clique sur une plage libre du calendrier
Quand je confirme la réservation (dateDebut, dateFin, description optionnelle) dans la modal de confirmation
Alors POST /bookings est appelé sans idUtilisateur (réservation pour moi-même)
Et la réservation apparaît immédiatement sur le calendrier comme "Ma réservation"
```

### US-RESA-02 — Réserver un créneau pour un Veilleur (Administrateur/SuperAdministrateur)
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux réserver un créneau pour un Veilleur qui ne peut pas le faire lui-même, afin de garantir la continuité du planning.

```gherkin
Étant donné que je suis sur /planning et que je clique sur une plage libre
Quand je choisis un Veilleur bénéficiaire dans le formulaire et confirme
Alors POST /bookings est appelé avec idUtilisateur renseigné
Et la réservation apparaît sur le planning avec l'identité du Veilleur bénéficiaire
```

### US-RESA-03 — Empêcher la réservation d'une plage déjà occupée
**Persona** : Veilleur, Administrateur, SuperAdministrateur
En tant qu'utilisateur habilité à réserver, je veux être empêché de réserver une plage déjà prise, afin d'éviter les doublons.

```gherkin
Étant donné une plage horaire déjà réservée par un autre utilisateur
Quand je tente de la réserver
Alors le calendrier ne me propose pas cette plage comme disponible
Et si la requête POST /bookings est malgré tout envoyée (concurrence), l'erreur API est affichée via toast et la réservation n'est pas créée
```

### US-RESA-04 — Empêcher la réservation dans le passé
**Persona** : Veilleur, Administrateur, SuperAdministrateur
En tant qu'utilisateur, je veux être empêché de réserver une date passée, afin de respecter la cohérence du planning.

```gherkin
Étant donné une date antérieure à aujourd'hui
Quand je tente de sélectionner cette date pour une réservation
Alors le sélecteur de date désactive les dates passées
Et si la requête est malgré tout envoyée, le message d'erreur API est affiché via toast
```

### US-RESA-05 — Confirmation avant réservation
**Persona** : Veilleur, Administrateur, SuperAdministrateur
En tant qu'utilisateur, je veux confirmer explicitement avant qu'une réservation soit créée, afin d'éviter les erreurs de clic.

```gherkin
Étant donné que j'ai rempli le formulaire de réservation
Quand je clique sur "Réserver"
Alors une modal de confirmation récapitule dateDebut/dateFin/bénéficiaire
Et la réservation n'est envoyée à l'API qu'après confirmation explicite dans la modal
```

---

## Domaine 4 — Annulation

### US-ANNUL-01 — Annuler ma propre réservation (≥24h avant)
**Persona** : Veilleur (`user-app`)
En tant que Veilleur, je veux annuler ma réservation si je m'y prends au moins 24h à l'avance, afin de libérer le créneau pour un autre.

```gherkin
Étant donné une réservation dont je suis le créateur et dont dateDebut est à plus de 24h
Quand je clique sur "Annuler" puis confirme dans la modal
Alors DELETE /bookings/{id} est appelé et la réservation disparaît du planning (ou passe au statut ANNULEE)
```

### US-ANNUL-02 — Empêcher l'annulation tardive
**Persona** : Veilleur (`user-app`)
En tant que Veilleur, je veux être informé si je ne peux plus annuler ma réservation, afin de comprendre pourquoi l'action est indisponible.

```gherkin
Étant donné une réservation dont je suis le créateur et dont dateDebut est à moins de 24h
Alors l'action "Annuler" est désactivée ou déclenche un message explicite
Et si la requête est malgré tout envoyée, l'erreur API de délai dépassé est affichée via toast
```

### US-ANNUL-03 — Annuler n'importe quelle réservation (Administrateur/SuperAdministrateur)
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux pouvoir annuler la réservation d'un autre utilisateur, afin de gérer les imprévus du planning.

```gherkin
Étant donné une réservation appartenant à un autre utilisateur, visible sur /planning
Quand je clique sur "Annuler" puis confirme dans la modal
Alors DELETE /bookings/{id} est appelé sans restriction de délai spécifique au rôle Administrateur/SuperAdministrateur
```

### US-ANNUL-04 — Confirmation avant annulation
**Persona** : Veilleur, Administrateur, SuperAdministrateur
En tant qu'utilisateur, je veux confirmer explicitement avant qu'une annulation soit effectuée, afin d'éviter une perte accidentelle de créneau.

```gherkin
Étant donné que je clique sur "Annuler" pour une réservation
Alors une modal de confirmation s'affiche avant tout appel à DELETE /bookings/{id}
```

---

## Domaine 5 — Gestion des utilisateurs (admin-app)

### US-USERS-01 — Lister et filtrer les utilisateurs
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux lister et filtrer les comptes Adorateur/Veilleur, afin de retrouver rapidement un compte.

```gherkin
Étant donné que je suis sur /
Alors je vois un tableau paginé (20/page) des utilisateurs avec email, nom, prénoms, rôle, statut de validation, date de création
Quand je renseigne un filtre (email, téléphone, nom, prénoms, statutValidation)
Alors GET /users?...&page=&size= est appelé avec les filtres correspondants
```

### US-USERS-02 — Accéder rapidement aux comptes en attente
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux un raccourci vers les comptes en attente de validation, afin de traiter les inscriptions Veilleur en priorité.

```gherkin
Étant donné que je suis sur la liste des utilisateurs
Quand je clique sur le raccourci "Comptes en attente"
Alors la liste est filtrée sur statutValidation=EN_ATTENTE
```

### US-USERS-03 — Valider un compte Veilleur
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux valider un compte Veilleur en attente, afin qu'il puisse se connecter et réserver.

```gherkin
Étant donné un utilisateur au statut EN_ATTENTE
Quand je clique sur "Valider" et confirme dans la modal
Alors POST /users/{id}/valider est appelé, le statut passe à VALIDE dans la ligne du tableau
Et le cache TanStack Query de la liste est invalidé/mis à jour
```

### US-USERS-04 — Rejeter un compte Veilleur
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux rejeter un compte Veilleur en attente, afin d'empêcher un accès non souhaité.

```gherkin
Étant donné un utilisateur au statut EN_ATTENTE
Quand je clique sur "Rejeter" et confirme dans la modal
Alors POST /users/{id}/rejeter est appelé, le statut passe à REJETE dans la ligne du tableau
```

### US-USERS-05 — Créer un utilisateur
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux créer directement un compte Adorateur ou Veilleur, afin d'inscrire un utilisateur qui n'a pas pu le faire lui-même.

```gherkin
Étant donné que je clique sur "Ajouter un utilisateur"
Quand je remplis le formulaire (email, mot de passe, nom, prénoms, téléphone, rôle) et soumets
Alors POST /users est appelé et le compte créé apparaît avec le statut VALIDE (automatique quel que soit le rôle)
```

### US-USERS-06 — Modifier un utilisateur
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux modifier les informations ou le rôle d'un utilisateur, afin de corriger ou faire évoluer son compte.

```gherkin
Étant donné que je suis sur /utilisateurs/{id}
Quand je modifie email/nom/prénoms/téléphone/rôle et soumets
Alors PUT /users/{id} est appelé (sans champ mot de passe) et les changements sont reflétés dans la liste
```

### US-USERS-07 — Supprimer un utilisateur
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux supprimer un compte, afin de retirer un utilisateur du système.

```gherkin
Étant donné un utilisateur sur /utilisateurs/{id}
Quand je clique sur "Supprimer" et confirme dans la modal
Alors DELETE /users/{id} est appelé et l'utilisateur disparaît de la liste
```

### US-USERS-08 — Restriction : pas d'action sur les comptes Administrateur
**Persona** : Administrateur (`admin-app`)
En tant qu'Administrateur (non Super), je ne dois pas pouvoir créer/modifier un compte Administrateur ou SuperAdministrateur, afin de respecter la séparation des privilèges.

```gherkin
Étant donné que je suis connecté en tant qu'Administrateur (non Super)
Alors le rôle "Administrateur"/"SuperAdministrateur" n'apparaît pas comme option dans le formulaire de création/modification d'utilisateur
Et la liste des utilisateurs ne présente que les comptes Adorateur/Veilleur
```

---

## Domaine 6 — Gestion des administrateurs (SuperAdministrateur uniquement)

### US-ADMINS-01 — Lister les comptes Administrateur
**Persona** : SuperAdministrateur (`admin-app`)
En tant que SuperAdministrateur, je veux lister les comptes Administrateur, afin de superviser l'équipe d'administration.

```gherkin
Étant donné que je suis SuperAdministrateur connecté sur /administrateurs
Alors je vois un tableau des comptes de rôle ADMINISTRATEUR
```

### US-ADMINS-02 — Créer un compte Administrateur
**Persona** : SuperAdministrateur (`admin-app`)
En tant que SuperAdministrateur, je veux créer un compte Administrateur, afin d'étendre l'équipe d'administration.

```gherkin
Étant donné que je suis sur /administrateurs/nouveau
Quand je remplis le formulaire et soumets
Alors POST /users est appelé avec role=ADMINISTRATEUR et le compte apparaît VALIDE
```

### US-ADMINS-03 — Modifier / supprimer un compte Administrateur
**Persona** : SuperAdministrateur (`admin-app`)
En tant que SuperAdministrateur, je veux modifier ou supprimer un compte Administrateur, afin de corriger ou retirer un accès.

```gherkin
Étant donné un compte Administrateur existant
Quand je le modifie (PUT /users/{id}) ou le supprime (DELETE /users/{id})
Alors les changements sont reflétés dans la liste
Et aucune action "désactiver" n'est proposée (endpoint inexistant)
```

### US-ADMINS-04 — Section masquée pour un simple Administrateur
**Persona** : Administrateur (`admin-app`)
En tant qu'Administrateur (non Super), je ne dois pas voir ni accéder à la gestion des administrateurs, afin de respecter la séparation des privilèges.

```gherkin
Étant donné que je suis connecté en tant qu'Administrateur (non Super)
Alors le lien vers /administrateurs n'apparaît pas dans la navigation
Et un accès direct à /administrateurs ou /administrateurs/nouveau redirige vers /non-autorise
```

---

## Domaine 7 — Annonces ⚠️ *(backend non exposé — mocks MSW)*

### US-ANNONCES-01 — Consulter les annonces publiées
**Persona** : Anonyme, Adorateur, Veilleur (`user-app`)
En tant que visiteur, je veux consulter les annonces publiées de la paroisse, afin de rester informé.

```gherkin
Étant donné que je suis sur /actualites
Alors je vois la liste des annonces au statut PUBLIE (titre, date de publication, contenu), issues du hook useAnnonces (mock MSW)
```

### US-ANNONCES-02 — Créer une annonce
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux créer une annonce, afin de communiquer une information à la communauté.

```gherkin
Étant donné que je suis sur /annonces/nouveau
Quand je remplis titre, contenu, date de publication et soumets
Alors l'annonce est créée au statut BROUILLON (mock MSW), visible dans la liste admin
```

### US-ANNONCES-03 — Publier / dépublier une annonce
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux publier ou dépublier une annonce, afin de contrôler sa visibilité publique.

```gherkin
Étant donné une annonce existante
Quand je clique sur "Publier" (ou "Dépublier")
Alors son statut passe à PUBLIE (ou DEPUBLIE) et sa visibilité sur /actualites change en conséquence
```

### US-ANNONCES-04 — Modifier / supprimer une annonce
**Persona** : Administrateur, SuperAdministrateur (`admin-app`)
En tant qu'Administrateur, je veux modifier ou supprimer une annonce, afin de corriger ou retirer une communication obsolète.

```gherkin
Étant donné une annonce existante sur /annonces/{id}
Quand je la modifie ou la supprime
Alors les changements sont reflétés dans la liste et sur /actualites si elle était publiée
```

---

## Domaine 8 — Contact ⚠️ *(backend non exposé — mock MSW)*

### US-CONTACT-01 — Envoyer un message de contact
**Persona** : Anonyme, Adorateur, Veilleur (`user-app`)
En tant que visiteur, je veux envoyer un message via le formulaire de contact, afin de poser une question à la paroisse.

```gherkin
Étant donné que je suis sur /contact
Quand je remplis nom, email, sujet, message et soumets
Alors le message est envoyé (mock MSW) et une confirmation d'envoi s'affiche
```

---

## Domaine 9 — Garde de routes / accès

### US-ACCESS-01 — Redirection si non connecté sur une route protégée
**Persona** : tous rôles (les deux applications)
En tant que visiteur non connecté, si j'accède à une route protégée, je veux être redirigé vers la connexion, afin de m'authentifier avant de continuer.

```gherkin
Étant donné que je ne suis pas connecté
Quand j'accède directement à une route protégée (ex. /mon-compte, /planning)
Alors je suis redirigé vers /connexion
Et après connexion réussie, je suis renvoyé vers la route initialement demandée
```

### US-ACCESS-02 — Page 403 pour rôle insuffisant ou inapproprié
**Persona** : tous rôles (les deux applications)
En tant qu'utilisateur connecté avec un rôle insuffisant, je veux voir une page claire, afin de comprendre que l'accès m'est refusé.

```gherkin
Étant donné que je suis connecté avec un rôle non autorisé pour la route demandée
Alors je suis redirigé vers /non-autorise avec un message explicite
```

### US-ACCESS-03 — Page 404
**Persona** : tous rôles (les deux applications)
En tant qu'utilisateur, je veux une page claire si l'URL demandée n'existe pas, afin de revenir facilement à l'application.

```gherkin
Étant donné une route inconnue
Alors une page 404 s'affiche avec un lien de retour vers l'accueil de l'application
```

---

## Récapitulatif

| Domaine | Nb récits | Applications |
|---|---|---|
| Authentification & compte | 8 | user-app, admin-app |
| Agenda/Planning | 5 | user-app, admin-app |
| Réservation | 5 | user-app, admin-app |
| Annulation | 4 | user-app, admin-app |
| Gestion des utilisateurs | 8 | admin-app |
| Gestion des administrateurs | 4 | admin-app |
| Annonces ⚠️ | 4 | user-app (lecture), admin-app (CRUD) |
| Contact ⚠️ | 1 | user-app |
| Garde de routes/accès | 3 | user-app, admin-app |
| **Total** | **42** | |

Tous les récits respectent les critères INVEST (indépendants au sein de leur domaine, négociables dans le détail d'implémentation, valorisables pour un persona identifié, estimables, suffisamment petits pour une unité de code, testables via leurs critères Gherkin).
