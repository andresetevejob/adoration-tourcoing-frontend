# Plan de génération des récits utilisateur

**Rôle adopté** : Product Owner

Voir l'évaluation de nécessité dans `user-stories-assessment.md` (décision : Oui).

## Checklist d'exécution

- [ ] Définir les personas (`personas.md`) : Anonyme, Adorateur, Veilleur, Administrateur, SuperAdministrateur
- [ ] Découper les exigences fonctionnelles (`requirements.md`, EF-1 à EF-10) en récits organisés **par domaine métier** (approche retenue par défaut, cf. section "Approche de découpage" ci-dessous)
- [ ] Rédiger chaque récit au format « En tant que [persona], je veux [action], afin de [bénéfice] »
- [ ] Rédiger les critères d'acceptation de chaque récit au format Gherkin (Given/When/Then), en réutilisant les règles métier et les écarts déjà arbitrés (requirements.md, section « décisions déjà arbitrées »)
- [ ] Vérifier chaque récit contre les critères INVEST
- [ ] Associer explicitement chaque récit à son/ses persona(s) et à son application (`user-app` / `admin-app`)
- [ ] Marquer les récits dont les critères d'acceptation dépendent d'un contrat API non finalisé (Annonces, Contact) avec une note ⚠️
- [ ] Générer `stories.md` et `personas.md`

## Approche de découpage retenue (par défaut, modifiable via Q3 ci-dessous)

**Basée sur le domaine métier**, alignée sur les capacités déjà esquissées dans `requirements.md` : Authentification & compte, Agenda/Planning (consultation), Réservation, Annulation, Gestion des utilisateurs, Gestion des administrateurs, Annonces, Contact, Garde de routes/accès. Cette approche a été préférée à une approche par parcours ou par persona pure car :
- elle correspond au découpage en capacités qui alimentera directement l'étape suivante (Génération des unités / propositions OpenSpec) — évite un remapping ultérieur ;
- les règles métier (2.1-2.5) sont déjà énoncées par domaine dans la spécification source, pas par persona ;
- plusieurs personas partagent les mêmes récits dans un même domaine (ex. réservation : Veilleur et Administrateur), ce qu'une approche par persona pure aurait dupliqué.

*Alternative écartée* : découpage par parcours utilisateur (ex. « parcours Veilleur de A à Z ») — plus lisible pour une démo mais moins directement exploitable pour le découpage en unités de Construction.

## Questions de clarification

**Note** : chaque question porte une réponse **proposée par défaut** (raisonnement dans le plan ci-dessus), pré-remplie après la balise `[Réponse] :` pour accélérer votre validation. Modifiez directement la lettre (ou choisissez une autre option) si un défaut ne vous convient pas, puis confirmez.

### Question 1 — Granularité des récits
Quel niveau de granularité souhaitez-vous pour les récits ?

A) Un récit par action utilisateur atomique (ex. « réserver un créneau », « annuler un créneau », « filtrer le planning par date » séparément) — plus de récits, plus précis pour les tests
B) Un récit par fonctionnalité regroupée (ex. un seul récit « gérer mes réservations » couvrant réserver + annuler + consulter) — moins de récits, plus larges
C) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : A

### Question 2 — Format des critères d'acceptation
Quel format pour les critères d'acceptation de chaque récit ?

A) Format Gherkin (Given/When/Then) — directement réutilisable par `test-engineer` pour des tests BDD-style
B) Liste à puces de conditions de succès, sans format Gherkin strict
C) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : A

### Question 3 — Approche de découpage
Confirmez-vous l'approche de découpage par domaine métier proposée ci-dessus (Authentification, Agenda/Planning, Réservation, Annulation, Gestion utilisateurs, Gestion administrateurs, Annonces, Contact) ?

A) Oui, garder ce découpage par domaine métier
B) Non, préférer un découpage par parcours utilisateur (par persona, de bout en bout)
C) Non, préférer un découpage par application (`user-app` vs `admin-app`) sans distinction de domaine
D) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : A

### Question 4 — Récits pour les capacités à contrat API non finalisé (Annonces, Contact)
Ces deux capacités n'ont pas d'endpoint dans le swagger fourni et seront développées contre des mocks MSW. Faut-il les inclure dans les récits utilisateur de ce cycle, au même titre que les autres ?

A) Oui, les inclure normalement avec une note ⚠️ sur la dépendance backend
B) Les inclure mais dans une section séparée « récits à faible priorité / dépendants du backend »
C) Les exclure des récits pour l'instant, elles seront traitées dans un cycle ultérieur
D) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : A

### Question 5 — Persona « Anonyme »
Le rôle Anonyme n'a qu'une seule permission (consulter l'agenda en lecture seule, sans compte). Faut-il lui consacrer un persona et des récits dédiés, ou le traiter comme un cas particulier au sein des récits du persona Adorateur/tout-venant ?

A) Persona dédié avec ses propres récits (même minimal)
B) Traité comme cas particulier documenté dans les critères d'acceptation des récits d'agenda, sans persona séparé
C) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : B
