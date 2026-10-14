# Cahier de tests — Application frontend utilisateur (user-app)

Chapelle du Vœux — Tourcoing

**Périmètre** : application publique `user-app` (visiteurs, Adorateurs, Veilleurs).
**Date de rédaction** : 2026-10-14.

## Comment utiliser ce document

Chaque cas de test a un identifiant (`TC-XXX-NN`), des préconditions, des étapes et un résultat
attendu. Notez le **statut** (OK / KO / Bloqué) et toute remarque dans une copie de ce document ou
dans l'outil de suivi utilisé par l'équipe.

### Comptes de test nécessaires

| Compte | Rôle | Statut | Usage |
|---|---|---|---|
| Compte A | Adorateur | VALIDE | Parcours Adorateur (pas de réservation) |
| Compte V1 | Veilleur | VALIDE | Parcours Veilleur (réservation/annulation) |
| Compte V2 | Veilleur | VALIDE | Second compte pour vérifier l'anonymisation/les droits croisés |
| Compte V-attente | Veilleur | EN_ATTENTE | Vérifier le blocage de connexion |
| Compte Admin | Administrateur | VALIDE | Vérifier le rejet sur `user-app` (rôle non prévu ici) |

### Environnements à couvrir

- **Desktop** : largeur ≥ 1280px (navigateur standard).
- **Mobile** : largeur < 768px (seuil responsive de l'application) — soit un vrai mobile, soit les
  outils de simulation d'appareil du navigateur.
- Tester dans au moins deux navigateurs (ex. Chrome + Safari ou Firefox) si possible.

---

## 1. Navigation générale

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-NAV-01 | Barre desktop | Ouvrir le site en largeur ≥768px | Logo + liens "Accueil, Agenda, Actualités, Qui sommes-nous ?, Contact" + zone de connexion visibles sur une seule ligne, pas de bouton hamburger |
| TC-NAV-02 | Bascule mobile | Réduire la largeur sous 768px | Les liens et la zone de connexion disparaissent de la barre, remplacés par un bouton hamburger (cible tactile confortable) |
| TC-NAV-03 | Ouverture du drawer mobile | En largeur <768px, cliquer le bouton hamburger | Un panneau glisse depuis la droite avec un fond sombre semi-transparent derrière ; il contient les mêmes liens + la zone de connexion, empilés verticalement ; le bouton affiche maintenant "Fermer le menu" |
| TC-NAV-04 | Fermeture par l'overlay | Drawer ouvert, cliquer en dehors du panneau (zone sombre) | Le drawer se ferme, le focus clavier revient sur le bouton hamburger |
| TC-NAV-05 | Fermeture par Échap | Drawer ouvert, appuyer sur la touche Échap | Le drawer se ferme |
| TC-NAV-06 | Fermeture par un lien | Drawer ouvert, cliquer un lien (ex. "Agenda") | Le drawer se ferme ET la navigation vers la page cliquée s'effectue |
| TC-NAV-07 | Fermeture après déconnexion | Connecté, drawer ouvert, cliquer "Déconnexion" dans le drawer | Le drawer se ferme (pas d'overlay bloquant restant) et l'utilisateur est déconnecté |
| TC-NAV-08 | Rotation d'écran / redimensionnement | Passer d'une largeur <768px à ≥768px (ou inversement) pendant la navigation | L'affichage (barre complète vs. hamburger) se met à jour immédiatement sans recharger la page |
| TC-NAV-09 | Page 404 | Aller sur une URL inexistante (ex. `/n-importe-quoi`) | Une page "non trouvée" s'affiche, pas d'erreur technique visible |
| TC-NAV-10 | Page 403 | Accéder à `/non-autorise` directement (ou via un parcours de redirection, cf. section Authentification) | Une page "accès non autorisé" s'affiche |

---

## 2. Page d'accueil (vitrine)

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-ACC-01 | Chargement de la page | Ouvrir `/` | La page d'accueil se charge (contenu vitrine, pas d'erreur), sans connexion requise |
| TC-ACC-02 | Horloge en direct | Observer le bloc "Adoration en direct" | L'heure affichée (hh:mm:ss) avance chaque seconde |
| TC-ACC-03 | Statut "en cours" | Pendant un créneau d'adoration réellement en cours (ou via une donnée de test simulée côté backend) | Le badge affiche "En ce moment" et le texte "Un veilleur prie en cet instant" |
| TC-ACC-04 | Statut "en attente" | Hors créneau d'adoration en cours | Le badge affiche "En attente" et le texte "Aucun veilleur n'est présent à l'instant" |
| TC-ACC-05 | Mise à jour automatique du statut | Laisser la page ouverte pendant qu'un créneau démarre ou se termine (ou au moins 30s sans action) | Le statut "en cours"/"en attente" se met à jour automatiquement sans rechargement manuel de la page |
| TC-ACC-06 | Résilience si l'API est indisponible | Simuler une erreur réseau/API (ou couper la connexion) puis recharger `/` | La page reste utilisable, le bloc affiche simplement l'état "en attente" (pas de message d'erreur visible, pas de page cassée) |
| TC-ACC-07 | Galerie — ouverture | Cliquer sur une image de la galerie (si présente sur la page) | Une visionneuse plein écran (lightbox) s'ouvre sur l'image cliquée |
| TC-ACC-08 | Galerie — navigation clavier | Lightbox ouverte, utiliser les flèches ← / → | L'image précédente/suivante s'affiche (boucle au début/à la fin) |
| TC-ACC-09 | Galerie — navigation souris | Lightbox ouverte, cliquer les boutons flèche gauche/droite | Navigation identique au clavier |
| TC-ACC-10 | Galerie — fermeture | Lightbox ouverte, appuyer sur Échap, ou cliquer la croix, ou cliquer en dehors de l'image | La visionneuse se ferme dans les trois cas |

---

## 3. Page "Qui sommes-nous ?"

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-QSN-01 | Chargement | Ouvrir `/qui-sommes-nous` | Le contenu se charge correctement, sans connexion requise |

---

## 4. Actualités

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-ACT-01 | Liste des actualités | Ouvrir `/actualites` avec au moins une actualité publiée en base | Les actualités publiées s'affichent (titre, date, extrait), triées de façon cohérente |
| TC-ACT-02 | Aucune actualité | Ouvrir `/actualites` sans aucune actualité publiée | Le message "Aucune actualité pour le moment." s'affiche, pas d'erreur |
| TC-ACT-03 | Pagination | Avec plus de 4 actualités publiées | Une pagination apparaît (4 par page) ; changer de page affiche les actualités suivantes |
| TC-ACT-04 | Détail d'une actualité | Cliquer sur une carte d'actualité | Une fenêtre modale s'ouvre avec le titre, la date complète et le contenu entier (non tronqué) |
| TC-ACT-05 | Fermeture du détail | Modale ouverte, cliquer la croix/fermer | La modale se ferme, retour à la liste |
| TC-ACT-06 | Erreur de chargement | Simuler une panne de l'API actualités | Un message "Impossible de charger les actualités. Veuillez réessayer plus tard." s'affiche |
| TC-ACT-07 | Actualités non publiées exclues | Créer (côté admin) une actualité en brouillon/non publiée | Elle n'apparaît pas dans la liste de `/actualites` |

---

## 5. Contact

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-CTC-01 | Chargement | Ouvrir `/contact` | Formulaire + informations pratiques (adresse, téléphone, email, horaires) + réseaux sociaux + carte affichés |
| TC-CTC-02 | Champs obligatoires vides | Soumettre le formulaire sans rien remplir | Des messages d'erreur apparaissent sous chaque champ obligatoire (nom, email, sujet, message), aucun envoi réseau |
| TC-CTC-03 | Email invalide | Saisir un email mal formé (ex. "abc") | Message "Email invalide." |
| TC-CTC-04 | Nom composé uniquement d'espaces | Saisir uniquement des espaces dans "Nom" | Le champ est rejeté comme vide ("Le nom est requis.") |
| TC-CTC-05 | Message trop court | Saisir un message de moins de 10 caractères (après suppression des espaces de bord) | Message "Minimum 10 caractères." |
| TC-CTC-06 | Sujet non choisi | Laisser le sujet sur "Choisissez un sujet" et soumettre | Message "Veuillez choisir un sujet." |
| TC-CTC-07 | Envoi réussi | Remplir correctement tous les champs puis soumettre | Le formulaire disparaît, remplacé par un message de confirmation "Message envoyé !" personnalisé avec le nom saisi |
| TC-CTC-08 | Nouveau message après succès | Sur l'écran de confirmation, cliquer "Nouveau message" | Le formulaire réapparaît vide (aucun champ pré-rempli) |
| TC-CTC-09 | Échec technique d'envoi | Simuler une panne de l'API contact lors de la soumission | Un message d'erreur générique est signalé à l'utilisateur (toast), le formulaire reste rempli (pas de perte de saisie), pas de faux écran de succès |
| TC-CTC-10 | Liens réseaux sociaux visibles | Observer le bloc "Réseaux sociaux" | Facebook, Instagram, YouTube sont affichés avec une icône |

---

## 6. Inscription

Routes : `/inscription`, puis `/inscription/confirmation`.

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-INS-01 | Accès à la page | Ouvrir `/inscription` sans être connecté | Le formulaire d'inscription s'affiche |
| TC-INS-02 | Garde invité | Être connecté (compte A ou V1), puis naviguer vers `/inscription` | Redirection immédiate vers `/` (pas d'affichage du formulaire), sans flash visible du formulaire |
| TC-INS-03 | Rôle par défaut | Ouvrir le formulaire | "Adorateur" est sélectionné par défaut, le champ "Photo" n'est pas visible |
| TC-INS-04 | Bascule vers Veilleur | Sélectionner "Veilleur" dans "Je m'inscris comme" | Un champ "Photo" apparaît |
| TC-INS-05 | Email invalide | Saisir un email mal formé | Message d'erreur sous le champ Email, pas de soumission |
| TC-INS-06 | Mot de passe trop court | Saisir un mot de passe de moins de 8 caractères | Erreur de validation, pas de soumission |
| TC-INS-07 | Mot de passe sans chiffre ni caractère spécial | Saisir ex. "abcdefgh" (8 lettres, aucun chiffre/symbole) | Erreur de validation (règle : au moins 1 chiffre **et** 1 caractère spécial) |
| TC-INS-08 | Mot de passe valide | Saisir ex. "Motdepasse1!" | Aucune erreur sur ce champ |
| TC-INS-09 | Confirmation différente | Saisir un mot de passe et une confirmation différente | Message "Les mots de passe ne correspondent pas" sous "Confirmation" |
| TC-INS-10 | Téléphone mal formé | Saisir un téléphone avec des lettres ou trop court (ex. "0123") | Erreur de validation sur le champ téléphone |
| TC-INS-11 | Téléphone vide (facultatif) | Laisser le champ téléphone vide et soumettre le reste correctement | Aucune erreur sur ce champ (téléphone facultatif) |
| TC-INS-12 | Afficher/masquer le mot de passe | Cliquer l'icône "œil" sur le champ Mot de passe | Le texte saisi devient visible en clair ; cliquer à nouveau le masque ; la saisie n'est jamais perdue pendant la bascule |
| TC-INS-13 | Inscription Adorateur réussie | Remplir tous les champs valides (rôle Adorateur), soumettre | Redirection vers `/inscription/confirmation` avec le message adapté (validé immédiatement ou en attente, selon la règle métier backend pour ce rôle) |
| TC-INS-14 | Inscription Veilleur — photo obligatoire | Rôle Veilleur, ne pas joindre de photo, soumettre | Message "La photo est obligatoire pour un compte Veilleur", pas de soumission |
| TC-INS-15 | Inscription Veilleur — format de photo invalide | Joindre un fichier qui n'est ni JPEG ni PNG (ex. PDF) | Message "Format de photo non supporté (jpeg ou png uniquement)" |
| TC-INS-16 | Inscription Veilleur — photo trop lourde | Joindre une image de plus de 5 Mo | Message "La photo ne doit pas dépasser 5 Mo" |
| TC-INS-17 | Inscription Veilleur réussie | Rôle Veilleur, photo JPEG/PNG < 5 Mo valide, reste du formulaire valide, soumettre | Redirection vers `/inscription/confirmation` avec le message "Votre compte est en attente de validation par un administrateur." |
| TC-INS-18 | Email déjà utilisé | S'inscrire avec un email déjà existant en base | Un bandeau rouge dismissible (pas une notification discrète) apparaît au-dessus du formulaire avec le message exact renvoyé par le serveur ; les champs restent remplis |
| TC-INS-19 | Téléphone déjà utilisé | S'inscrire avec un téléphone déjà existant en base | Même comportement que TC-INS-18 (bandeau rouge dismissible) |
| TC-INS-20 | Fermeture du bandeau d'erreur | Bandeau d'erreur affiché (TC-INS-18), cliquer la croix | Le bandeau disparaît |
| TC-INS-21 | Le bandeau disparaît à une nouvelle tentative | Bandeau d'erreur affiché, corriger et resoumettre le formulaire | L'ancien bandeau disparaît avant le nouvel envoi (pas de doublon, pas de bandeau obsolète affiché pendant le nouvel appel) |
| TC-INS-22 | Repasser de Veilleur à Adorateur avant soumission | Sélectionner Veilleur, joindre une photo, puis revenir à Adorateur, puis soumettre | La soumission réussit sans exiger de photo (le champ photo est bien ignoré une fois le rôle repassé à Adorateur) |
| TC-INS-23 | Accès direct à la confirmation sans contexte | Ouvrir directement l'URL `/inscription/confirmation` sans être passé par le formulaire | Redirection automatique vers `/inscription` (pas d'affichage d'un écran de confirmation vide) |

---

## 7. Connexion

Route : `/connexion`.

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-CNX-01 | Accès à la page | Ouvrir `/connexion` sans être connecté | Le formulaire de connexion s'affiche, avec un lien "Mot de passe oublié ?" |
| TC-CNX-02 | Garde invité | Être connecté, naviguer vers `/connexion` | Redirection immédiate vers `/` (Adorateur/Veilleur) |
| TC-CNX-03 | Garde invité — pendant l'hydratation | Recharger une page (F5) alors qu'une session existe, en observant le tout premier instant du chargement | Un indicateur de chargement s'affiche brièvement, jamais le formulaire de connexion en flash avant la redirection |
| TC-CNX-04 | Champs vides | Soumettre sans rien saisir | Erreurs de validation sous les champs, aucun appel réseau |
| TC-CNX-05 | Email invalide | Saisir un email mal formé | Erreur de validation sous le champ Email |
| TC-CNX-06 | Identifiants incorrects | Saisir un email/mot de passe erronés pour un compte existant | Message "Identifiants invalides ou compte non encore validé." affiché sous le formulaire |
| TC-CNX-07 | Compte Veilleur en attente de validation | Se connecter avec le compte V-attente (statut EN_ATTENTE) | Connexion refusée, même message que TC-CNX-06 (pas d'information distinguant la cause) |
| TC-CNX-08 | Connexion Adorateur réussie | Se connecter avec le compte A | Redirection vers `/`, la barre de navigation affiche l'état connecté (nom, "Mon compte", "Déconnexion") |
| TC-CNX-09 | Connexion Veilleur réussie | Se connecter avec le compte V1 | Redirection vers `/`, accès aux fonctionnalités Veilleur (cf. section Agenda) |
| TC-CNX-10 | Connexion avec un rôle non prévu sur cette app | Se connecter avec le compte Admin | Redirection vers `/non-autorise` (pas d'accès silencieux, pas d'erreur technique) |
| TC-CNX-11 | Redirection après connexion depuis une page protégée | Sans être connecté, essayer d'aller sur `/mon-compte`, se faire rediriger vers `/connexion`, puis se connecter avec le compte A ou V1 | Après connexion, retour automatique sur `/mon-compte` (la page initialement demandée), pas sur `/` |
| TC-CNX-12 | Panne technique du serveur | Simuler une erreur serveur (5xx) pendant la connexion | Une notification d'erreur générique s'affiche (pas le message "Identifiants invalides") |
| TC-CNX-13 | Afficher/masquer le mot de passe | Cliquer l'icône œil sur le champ mot de passe | Comportement identique à TC-INS-12 |

---

## 8. Mot de passe oublié / Réinitialisation

Routes : `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe?token=...`.

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-MDP-01 | Accès à la demande | Depuis `/connexion`, cliquer "Mot de passe oublié ?" | Arrivée sur `/mot-de-passe-oublie`, formulaire avec un champ Email |
| TC-MDP-02 | Garde invité | Être connecté, naviguer vers `/mot-de-passe-oublie` | Redirection vers `/`, comme TC-CNX-02 |
| TC-MDP-03 | Demande pour un email existant et validé | Saisir l'email du compte A ou V1, soumettre | Message générique « Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé. » |
| TC-MDP-04 | Demande pour un email inconnu | Saisir un email qui n'existe pas en base, soumettre | **Exactement le même message générique** que TC-MDP-03 (aucune différence visible) |
| TC-MDP-05 | Demande pour un compte Veilleur en attente/rejeté | Saisir l'email d'un compte EN_ATTENTE ou REJETE, soumettre | Même message générique, toujours (aucune fuite d'information sur le statut du compte) |
| TC-MDP-06 | Panne technique | Simuler une erreur réseau/serveur pendant la demande | Une notification d'erreur générique s'affiche **à la place** du message de confirmation |
| TC-MDP-07 | Lien de réinitialisation reçu (email réel, si testable) | Suivre le lien reçu par email | Arrivée sur `/reinitialiser-mot-de-passe?token=...`, formulaire "Nouveau mot de passe" + "Confirmation" |
| TC-MDP-08 | Accès sans token | Ouvrir `/reinitialiser-mot-de-passe` sans paramètre `token` dans l'URL | Pas de formulaire affiché : message générique d'erreur avec un lien vers `/mot-de-passe-oublie` |
| TC-MDP-09 | Token invalide/expiré | Ouvrir l'URL avec un `token` invalide, expiré ou déjà utilisé, puis soumettre un nouveau mot de passe | Le formulaire est remplacé par le même message d'erreur générique que TC-MDP-08 (pas de formulaire resoumissible) |
| TC-MDP-10 | Nouveau mot de passe — mêmes règles que l'inscription | Avec un token valide, tester un mot de passe trop court / sans chiffre / sans caractère spécial | Mêmes règles et messages de validation que TC-INS-06/07 |
| TC-MDP-11 | Confirmation différente | Token valide, mot de passe et confirmation différents | Message "Les mots de passe ne correspondent pas" |
| TC-MDP-12 | Réinitialisation réussie | Token valide, nouveau mot de passe conforme, confirmation identique, soumettre | Notification de succès puis redirection vers `/connexion` ; **pas de connexion automatique** |
| TC-MDP-13 | Connexion avec le nouveau mot de passe | Après TC-MDP-12, se connecter avec le nouveau mot de passe | Connexion réussie |
| TC-MDP-14 | Ancien mot de passe désormais invalide | Après TC-MDP-12, essayer de se connecter avec l'**ancien** mot de passe | Connexion refusée |
| TC-MDP-15 | Réutilisation du même lien après succès | Après TC-MDP-12, recharger la même URL de réinitialisation (même token) et soumettre à nouveau | Le token est désormais invalide : message d'erreur générique (TC-MDP-09), pas de nouvelle réinitialisation possible |

---

## 9. Déconnexion

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-DEC-01 | Déconnexion simple | Connecté, cliquer "Déconnexion" | Retour à l'état visiteur (liens Connexion/Inscription réapparaissent), redirection ou maintien sur une page publique |
| TC-DEC-02 | Données sensibles effacées après déconnexion | Connecté avec le compte V1, aller sur `/agenda`, repérer sa propre réservation (surlignée "Ma réservation"), se déconnecter **sans changer de page**, observer à nouveau le calendrier | Après déconnexion, le surlignage/l'identité propre au compte V1 ne doit plus apparaître — le calendrier ne doit plus afficher d'information jusqu'alors réservée à l'utilisateur connecté |
| TC-DEC-03 | Déconnexion forcée (session expirée) | Simuler l'expiration de session côté serveur puis effectuer une action nécessitant l'API (ex. ouvrir "Mon compte" ou créer une réservation) | L'utilisateur est automatiquement déconnecté et ramené à un état cohérent (pas d'écran bloqué sur une erreur technique) |
| TC-DEC-04 | Accès à une page protégée après déconnexion | Juste après déconnexion, essayer d'ouvrir `/mon-compte` (navigation directe ou bouton retour du navigateur) | Redirection vers `/connexion`, pas d'affichage furtif des anciennes données du compte |

---

## 10. Agenda / Planning (consultation)

Route : `/agenda`, accessible **sans connexion**.

### 10.1 Modes d'affichage

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-AGD-01 | Accès public | Ouvrir `/agenda` sans être connecté | Le calendrier s'affiche (lecture seule), aucune action de réservation visible |
| TC-AGD-02 | Mode Jour par défaut | Ouvrir `/agenda` | Le mode "Jour" est sélectionné par défaut, sur la date du jour |
| TC-AGD-03 | Bouton "Aujourd'hui" | Changer de date en mode Jour, puis cliquer "Aujourd'hui" | Retour instantané sur la date du jour |
| TC-AGD-04 | Mode Semaine | Sélectionner "Semaine" dans le menu "Vue" | Le calendrier affiche une semaine complète (lundi à dimanche) contenant la date précédemment sélectionnée |
| TC-AGD-05 | Normalisation au lundi (Semaine) | En mode Semaine, saisir une date qui est un mercredi dans le sélecteur | La semaine affichée commence bien le lundi de cette semaine-là, pas le mercredi |
| TC-AGD-06 | Bouton "Cette semaine" | En mode Semaine, après avoir navigué sur une autre semaine, cliquer "Cette semaine" | Retour sur la semaine courante |
| TC-AGD-07 | Mode Mois | Sélectionner "Mois" dans le menu "Vue" | Le calendrier affiche une grille mensuelle complète |
| TC-AGD-08 | Sélecteur mois/année | En mode Mois, ouvrir le sélecteur de mois (icône calendrier) et choisir un autre mois/année | Le calendrier se met à jour sur le mois choisi ; **le popup du sélecteur s'affiche bien au-dessus de la grille** (jamais caché derrière) |
| TC-AGD-09 | Bouton "Ce mois-ci" | En mode Mois, après navigation sur un autre mois, cliquer "Ce mois-ci" | Retour sur le mois courant |
| TC-AGD-10 | Changement de mode sans état incohérent | Alterner rapidement entre Jour / Semaine / Mois plusieurs fois | Chaque bascule affiche immédiatement une période cohérente (jamais un calendrier vide ou une erreur visible) |
| TC-AGD-11 | Mode "Intervalle" absent | Ouvrir le menu déroulant "Vue" | Seules les options "Jour", "Semaine", "Mois" sont proposées — pas d'option "Intervalle" (retirée temporairement) |
| TC-AGD-12 | Chargement d'une longue période | En mode Mois, sur un mois contenant de nombreuses réservations | Tous les créneaux du mois sont visibles (pas de troncature visible pour un volume normal) |
| TC-AGD-13 | Erreur de chargement du planning | Simuler une panne de l'API planning | Un message "Impossible de charger le planning. Veuillez réessayer plus tard." s'affiche à la place du calendrier |

### 10.2 Affichage des créneaux

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-AGD-14 | Heure affichée — mode Jour/Semaine | Observer un créneau en mode Jour ou Semaine (desktop) | Seule l'heure de **début** est affichée sur le créneau |
| TC-AGD-15 | Heure affichée — mode Mois | Observer un créneau en mode Mois | La plage complète "HH:mm – HH:mm" (début et fin) est affichée |
| TC-AGD-16 | Surlignage de densité en mode Mois | Observer le mois avec des créneaux réservés par d'autres utilisateurs | Chaque créneau réservé, peu importe son propriétaire, est visuellement encadré (fond/bordure dorés), pour le distinguer des jours vides |
| TC-AGD-17 | Surlignage absent en Jour/Semaine | Observer un créneau non personnel en mode Jour ou Semaine | Le fond doré "densité" n'apparaît pas dans ces modes (réservé au mode Mois) |
| TC-AGD-18 | Anonymisation des identités | Se connecter avec le compte V1, consulter un créneau réservé par un autre Veilleur (compte V2) | Le créneau affiche "Créneau réservé" (pas le nom de V2), selon la règle d'anonymisation en vigueur |
| TC-AGD-19 | "Ma réservation" mise en évidence | Compte V1 connecté, consulter un créneau qu'il a lui-même réservé | Badge texte « Ma réservation » **et** surlignage visuel doré distinct présents sur ce créneau, dans n'importe quel mode |

### 10.3 Adaptation mobile (<768px, user-app uniquement)

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-AGD-20 | Mode Semaine mobile | Réduire la largeur <768px, sélectionner "Semaine" | Affichage sous forme de liste chronologique (par jour), pas de grille horaire multi-colonnes |
| TC-AGD-21 | Pas de doublon d'heure (Semaine mobile) | Observer un créneau dans cette liste | L'heure de début apparaît une seule fois (pas de doublon visuel) |
| TC-AGD-22 | Mode Mois mobile — ouverture du panneau jour | Largeur <768px, mode Mois, taper sur un jour contenant des créneaux | Une liste des créneaux de ce jour s'affiche sous la grille |
| TC-AGD-23 | Mode Mois mobile — fermeture du panneau | Taper à nouveau sur le même jour | Le panneau se referme |
| TC-AGD-24 | Mode Mois mobile — jour vide | Taper sur un jour sans créneau | Le panneau s'ouvre avec une liste vide (ou message adapté), pas d'erreur |
| TC-AGD-25 | Mode Mois mobile — pas de création par glissement | Veilleur connecté, mode Mois, largeur <768px, tenter de faire un cliquer-glisser sur la grille pour créer une réservation | Aucun formulaire de réservation ne s'ouvre par ce geste dans cette combinaison précise (le panneau du jour prend le dessus) |
| TC-AGD-26 | Retour desktop | Repasser à une largeur ≥768px pendant que le panneau mobile du jour est ouvert | L'affichage redevient celui du desktop (grille complète, plus de panneau jour) |

---

## 11. Réservation d'un créneau (Veilleur uniquement)

Les actions ci-dessous nécessitent une connexion avec le compte V1 (Veilleur, VALIDE).

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-RES-01 | Action absente pour un visiteur non connecté | Sans connexion, cliquer/glisser sur une plage libre du calendrier | Aucun formulaire de réservation ne s'ouvre |
| TC-RES-02 | Action absente pour un Adorateur | Connecté avec le compte A, cliquer/glisser sur une plage libre | Aucun formulaire de réservation ne s'ouvre (réservation réservée aux Veilleurs) |
| TC-RES-03 | Sélection d'un créneau (Veilleur) | Connecté V1, en mode Jour ou Semaine, glisser-sélectionner une plage libre future | Le formulaire "Réserver ce créneau" s'ouvre avec les dates début/fin affichées correctement |
| TC-RES-04 | Description facultative | Dans le formulaire, laisser "Description" vide et valider | Passe à l'étape de confirmation sans erreur |
| TC-RES-05 | Annulation du formulaire | Dans le formulaire, cliquer "Annuler" | Le formulaire se ferme sans créer de réservation |
| TC-RES-06 | Confirmation de création | Valider le formulaire, puis cliquer "Confirmer" dans la fenêtre de confirmation | La réservation est créée, le calendrier se mettant à jour pour la montrer comme "Ma réservation" |
| TC-RES-07 | Sélection d'une plage dans le passé | Tenter de glisser-sélectionner une plage déjà passée | La sélection est rejetée, aucun formulaire ne s'ouvre |
| TC-RES-08 | Sélection d'une plage de plus de 24h (vue Mois, glisser sur plusieurs jours) | En mode Mois, tenter un glisser-déposer sur plusieurs jours consécutifs (>24h) | La sélection est rejetée, aucun formulaire ne s'ouvre |
| TC-RES-09 | Filet de sécurité si une plage >24h atteint quand même la confirmation | (Cas limite technique, à tester si reproductible) | Le bouton "Confirmer" est désactivé et un message "Un créneau ne peut pas dépasser 24h." est affiché |
| TC-RES-10 | Chevauchement avec un créneau existant | Tenter de sélectionner une plage qui chevauche un créneau déjà réservé (par soi-même ou un autre) | Le backend doit rejeter la réservation ; un message d'erreur clair doit s'afficher (pas de double réservation silencieuse) |
| TC-RES-11 | Panne réseau pendant la confirmation | Simuler une erreur serveur au moment de cliquer "Confirmer" | Une erreur est signalée à l'utilisateur, la réservation n'est pas créée, le formulaire reste accessible pour réessayer |
| TC-RES-12 | Filtre "Mes réservations uniquement" visible uniquement pour Veilleur | Se connecter en Adorateur puis en Veilleur, observer la zone de filtres au-dessus du calendrier | La case "Mes réservations uniquement" n'apparaît que pour le compte Veilleur |
| TC-RES-13 | Filtre "Mes réservations uniquement" actif | Connecté V1, avec plusieurs réservations d'autres utilisateurs visibles, cocher le filtre | Seules les réservations de V1 restent affichées sur le calendrier |
| TC-RES-14 | Décocher le filtre | Décocher la case | Toutes les réservations (anonymisées ou non) réapparaissent |
| TC-RES-15 | Pas de sélection possible avec le filtre actif | Filtre "Mes réservations" actif, tenter de glisser-sélectionner une plage | Aucun formulaire ne s'ouvre (création désactivée tant que le filtre masque une partie du planning réel) |

---

## 12. Annulation d'une réservation (Veilleur uniquement)

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-ANN-01 | Clic sur sa propre réservation | Connecté V1, cliquer sur un créneau marqué "Ma réservation", dont le début est à plus de 24h | La fenêtre "Confirmer l'annulation" s'ouvre, bouton "Confirmer" actif |
| TC-ANN-02 | Clic sur la réservation d'un autre utilisateur | Connecté V1, cliquer sur un créneau réservé par un autre (compte V2) | Rien ne se passe (pas de fenêtre d'annulation, pas d'erreur) |
| TC-ANN-03 | Annuler via le bouton "Annuler" de la fenêtre | Fenêtre d'annulation ouverte, cliquer "Annuler" (bouton outline) | La fenêtre se ferme, la réservation n'est pas annulée |
| TC-ANN-04 | Confirmer l'annulation (délai respecté) | Fenêtre d'annulation ouverte sur une réservation à >24h du début, cliquer "Confirmer" | La réservation est annulée, disparaît ou change de statut sur le calendrier/dans "Mes réservations" |
| TC-ANN-05 | Annulation refusée — délai dépassé | Cliquer sur une réservation personnelle dont le début est à moins de 24h | Le bouton "Confirmer" est désactivé et le message "Le délai d'annulation (24h) est dépassé." est affiché |
| TC-ANN-06 | Panne réseau pendant l'annulation | Simuler une erreur serveur lors du clic "Confirmer" | Un message d'erreur est signalé, la réservation reste active si l'annulation a échoué côté serveur |
| TC-ANN-07 | Annulation depuis "Mon compte" | Vérifier si l'annulation est proposée depuis la liste "Mes réservations" de la page Mon compte | Confirmer le comportement réel attendu avec l'équipe (annulation uniquement via le calendrier, pas depuis cette liste, selon la conception actuelle) |

---

## 13. Mon compte

Route : `/mon-compte`, protégée (Adorateur ou Veilleur connecté).

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-CPT-01 | Accès sans connexion | Sans être connecté, ouvrir `/mon-compte` | Redirection vers `/connexion` |
| TC-CPT-02 | Accès avec un rôle non prévu | (Si applicable) accéder avec un rôle autre qu'Adorateur/Veilleur | Redirection vers `/non-autorise` |
| TC-CPT-03 | Affichage du profil | Connecté (A ou V1), ouvrir `/mon-compte` | Les informations du compte (nom, prénoms, email, téléphone, rôle) sont affichées correctement |
| TC-CPT-04 | Email non modifiable | Observer le champ Email du formulaire d'édition | Le champ est présent mais **désactivé** (lecture seule) |
| TC-CPT-05 | Modification du nom/prénoms/téléphone | Modifier ces champs, enregistrer | Une confirmation de succès s'affiche, les nouvelles valeurs sont conservées après rechargement de la page |
| TC-CPT-06 | Téléphone invalide à la modification | Saisir un téléphone mal formé, enregistrer | Message d'erreur de validation, pas d'enregistrement |
| TC-CPT-07 | Nom/prénoms trop longs | Saisir plus de 255 caractères dans Nom ou Prénoms | Erreur de validation |
| TC-CPT-08 | Panne réseau à l'enregistrement | Simuler une erreur serveur lors de l'enregistrement | Message d'erreur signalé, les champs restent tels que saisis (pas de perte) |
| TC-CPT-09 | Bloc "Mes réservations" — Veilleur | Connecté V1 | Un bloc "Mes réservations" liste les réservations passées/à venir avec dates et statut ("Effectuée"/"Annulée") |
| TC-CPT-10 | Bloc "Mes réservations" absent — Adorateur | Connecté A | Le bloc "Mes réservations" n'apparaît pas du tout sur la page |
| TC-CPT-11 | Liste de réservations vide | Connecté avec un Veilleur n'ayant jamais réservé | Message "Aucune réservation pour le moment." |
| TC-CPT-12 | Chargement en cours | Observer brièvement l'affichage juste après l'ouverture de la page | Un indicateur de chargement s'affiche pendant la récupération des données, pas de tableau vide figé |

---

## 14. Accessibilité (contrôles transverses rapides)

| ID | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| TC-ACS-01 | Navigation au clavier uniquement | Parcourir le site uniquement avec Tab/Shift+Tab/Entrée (sans souris) | Tous les éléments interactifs (liens, boutons, champs) sont atteignables et un anneau de focus visible apparaît |
| TC-ACS-02 | Focus visible sur les boutons du kit UI | Tabuler jusqu'à un bouton quelconque (ex. "Se connecter", icône œil d'un mot de passe) | Un contour de focus clairement visible apparaît |
| TC-ACS-03 | Lecteur d'écran — bouton œil mot de passe | Avec un lecteur d'écran (ou en observant l'attribut `aria-label`), activer le bouton "œil" | L'intitulé annoncé change entre "Afficher le mot de passe" et "Masquer le mot de passe" selon l'état |
| TC-ACS-04 | Alerte de formulaire annoncée | Provoquer une erreur de connexion (TC-CNX-06) avec un lecteur d'écran actif | Le message d'erreur est annoncé automatiquement (rôle "alert") |

---

## Synthèse pour le suivi des testeurs

| Domaine | Nombre de cas |
|---|---|
| Navigation générale | 10 |
| Page d'accueil | 10 |
| Qui sommes-nous | 1 |
| Actualités | 7 |
| Contact | 10 |
| Inscription | 23 |
| Connexion | 13 |
| Mot de passe oublié / Réinitialisation | 15 |
| Déconnexion | 4 |
| Agenda (consultation) | 26 |
| Réservation | 15 |
| Annulation | 7 |
| Mon compte | 12 |
| Accessibilité | 4 |
| **Total** | **157** |
