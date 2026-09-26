# Personas

*Le rôle Anonyme n'a pas de persona dédié (décision Q5 du plan de récits) : il est traité comme cas particulier dans les critères d'acceptation des récits d'Agenda (accès en lecture seule, sans compte).*

## Persona 1 — Adorateur
- **Rôle** : Adorateur (compte requis, `statutValidation = VALIDE` dès l'inscription)
- **Objectif** : Suivre les créneaux d'adoration de la chapelle, sans engagement de présence
- **Motivations** : Rester informé du rythme de l'adoration perpétuelle, se tenir au courant des annonces de la paroisse
- **Frustrations potentielles** : Ne pas pouvoir réserver un créneau lui-même s'il souhaite devenir Veilleur (doit passer par une inscription Veilleur distincte)
- **Application** : `user-app`

## Persona 2 — Veilleur
- **Rôle** : Veilleur (compte requis, `statutValidation = EN_ATTENTE` jusqu'à validation par un Administrateur)
- **Objectif** : Réserver et honorer des créneaux d'adoration, gérer ses propres engagements
- **Motivations** : S'engager régulièrement dans l'adoration eucharistique sur des créneaux choisis
- **Frustrations potentielles** : Ne pas pouvoir se connecter tant que son compte n'est pas validé, sans message explicite distinguant ce cas d'un mot de passe erroné (contrainte backend confirmée, cf. requirements.md §6.1) ; devoir anticiper le délai de 24h pour annuler
- **Application** : `user-app`

## Persona 3 — Administrateur
- **Rôle** : Administrateur (compte créé par un SuperAdministrateur, `statutValidation = VALIDE` automatique)
- **Objectif** : Superviser le planning d'adoration, valider les nouveaux Veilleurs, réserver des créneaux pour des Veilleurs qui ne peuvent pas le faire eux-mêmes
- **Motivations** : Assurer la continuité de la présence sur les créneaux, garder le planning à jour
- **Frustrations potentielles** : Ne pas pouvoir gérer les comptes Administrateur/SuperAdministrateur (restriction volontaire) ; devoir traiter manuellement chaque demande de validation
- **Application** : `admin-app`

## Persona 4 — SuperAdministrateur
- **Rôle** : SuperAdministrateur (toutes les permissions Administrateur + gestion des comptes Administrateur)
- **Objectif** : Superviser l'ensemble du système, y compris l'équipe d'administrateurs
- **Motivations** : Garantir la gouvernance globale de l'application (qui a accès à quoi)
- **Frustrations potentielles** : Aucune limitation fonctionnelle particulière — persona de supervision complète
- **Application** : `admin-app`
