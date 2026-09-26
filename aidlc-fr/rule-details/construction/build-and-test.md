# Build et Tests

**Objectif** : Construire (build) toutes les unités et exécuter une stratégie de tests complète

## Prérequis
- La Génération de code doit être terminée pour toutes les unités
- Tous les artefacts de code doivent être générés
- Le projet est prêt pour le build et les tests

---

## Étape 1 : Analyser les exigences de test

Analyser le projet pour déterminer la stratégie de test appropriée :
- **Tests unitaires** : Déjà générés par unité pendant la génération de code
- **Tests d'intégration** : Tester les interactions entre unités/services
- **Tests de performance** : Tests de charge, de stress et de scalabilité
- **Tests de bout en bout** : Workflows utilisateur complets
- **Tests de contrat** : Validation des contrats d'API entre services
- **Tests de sécurité** : Analyse des vulnérabilités, tests d'intrusion

---

## Étape 2 : Générer les instructions de build

Créer `aidlc-docs/construction/build-and-test/build-instructions.md` :

```markdown
# Instructions de build

## Prérequis
- **Outil de build** : [Nom et version de l'outil]
- **Dépendances** : [Lister toutes les dépendances requises]
- **Variables d'environnement** : [Lister les variables d'environnement requises]
- **Exigences système** : [OS, mémoire, espace disque]

## Étapes de build

### 1. Installer les dépendances
\`\`\`bash
[Commande pour installer les dépendances]
# Exemple : npm install, mvn dependency:resolve, pip install -r requirements.txt
\`\`\`

### 2. Configurer l'environnement
\`\`\`bash
[Commandes pour configurer l'environnement]
# Exemple : exporter des variables, configurer les identifiants
\`\`\`

### 3. Construire toutes les unités
\`\`\`bash
[Commande pour construire toutes les unités]
# Exemple : mvn clean install, npm run build, brazil-build
\`\`\`

### 4. Vérifier la réussite du build
- **Résultat attendu** : [Décrire la sortie d'un build réussi]
- **Artefacts de build** : [Lister les artefacts générés et leurs emplacements]
- **Avertissements courants** : [Noter les avertissements acceptables]

## Dépannage

### Le build échoue avec des erreurs de dépendances
- **Cause** : [Causes courantes]
- **Solution** : [Correction étape par étape]

### Le build échoue avec des erreurs de compilation
- **Cause** : [Causes courantes]
- **Solution** : [Correction étape par étape]
```

---

## Étape 3 : Générer les instructions d'exécution des tests unitaires

Créer `aidlc-docs/construction/build-and-test/unit-test-instructions.md` :

```markdown
# Exécution des tests unitaires

## Exécuter les tests unitaires

### 1. Exécuter tous les tests unitaires
\`\`\`bash
[Commande pour exécuter tous les tests unitaires]
# Exemple : mvn test, npm test, pytest tests/unit
\`\`\`

### 2. Examiner les résultats des tests
- **Attendu** : [X] tests réussis, 0 échec
- **Couverture de test** : [Pourcentage de couverture attendu]
- **Emplacement du rapport de test** : [Chemin vers les rapports de test]

### 3. Corriger les tests en échec
Si des tests échouent :
1. Examiner la sortie des tests dans [emplacement]
2. Identifier les cas de test en échec
3. Corriger les problèmes de code
4. Relancer les tests jusqu'à ce qu'ils réussissent tous
```

---

## Étape 4 : Générer les instructions de tests d'intégration

Créer `aidlc-docs/construction/build-and-test/integration-test-instructions.md` :

```markdown
# Instructions de tests d'intégration

## Objectif
Tester les interactions entre unités/services pour s'assurer qu'ils fonctionnent correctement ensemble.

## Scénarios de test

### Scénario 1 : Intégration [Unité A] → [Unité B]
- **Description** : [Ce qui est testé]
- **Préparation** : [Configuration de l'environnement de test requise]
- **Étapes du test** : [Exécution du test étape par étape]
- **Résultats attendus** : [Ce qui devrait se produire]
- **Nettoyage** : [Comment nettoyer après le test]

### Scénario 2 : Intégration [Unité B] → [Unité C]
[Structure similaire]

## Préparer l'environnement de test d'intégration

### 1. Démarrer les services requis
\`\`\`bash
[Commandes pour démarrer les services]
# Exemple : docker-compose up, démarrer la base de données de test
\`\`\`

### 2. Configurer les points de terminaison des services
\`\`\`bash
[Commandes pour configurer les points de terminaison]
# Exemple : export API_URL=http://localhost:8080
\`\`\`

## Exécuter les tests d'intégration

### 1. Exécuter la suite de tests d'intégration
\`\`\`bash
[Commande pour exécuter les tests d'intégration]
# Exemple : mvn integration-test, npm run test:integration
\`\`\`

### 2. Vérifier les interactions entre services
- **Scénarios de test** : [Lister les principaux scénarios de test d'intégration]
- **Résultats attendus** : [Décrire les résultats attendus]
- **Emplacement des logs** : [Où consulter les logs]

### 3. Nettoyage
\`\`\`bash
[Commandes pour nettoyer l'environnement de test]
# Exemple : docker-compose down, arrêter les services de test
\`\`\`
```

---

## Étape 5 : Générer les instructions de tests de performance (le cas échéant)

Créer `aidlc-docs/construction/build-and-test/performance-test-instructions.md` :

```markdown
# Instructions de tests de performance

## Objectif
Valider la performance du système sous charge pour s'assurer qu'il respecte les exigences.

## Exigences de performance
- **Temps de réponse** : < [X]ms pour [Y]% des requêtes
- **Débit** : [X] requêtes/seconde
- **Utilisateurs simultanés** : Prendre en charge [X] utilisateurs simultanés
- **Taux d'erreur** : < [X]%

## Préparer l'environnement de test de performance

### 1. Préparer l'environnement de test
\`\`\`bash
[Commandes pour préparer les tests de performance]
# Exemple : mettre à l'échelle les services, configurer les répartiteurs de charge
\`\`\`

### 2. Configurer les paramètres de test
- **Durée du test** : [X] minutes
- **Temps de montée en charge** : [X] secondes
- **Utilisateurs virtuels** : [X] utilisateurs

## Exécuter les tests de performance

### 1. Exécuter les tests de charge
\`\`\`bash
[Commande pour exécuter les tests de charge]
# Exemple : jmeter -n -t test.jmx, k6 run script.js
\`\`\`

### 2. Exécuter les tests de stress
\`\`\`bash
[Commande pour exécuter les tests de stress]
# Exemple : augmenter progressivement la charge jusqu'à l'échec
\`\`\`

### 3. Analyser les résultats de performance
- **Temps de réponse** : [Réel vs Attendu]
- **Débit** : [Réel vs Attendu]
- **Taux d'erreur** : [Réel vs Attendu]
- **Goulots d'étranglement** : [Goulots d'étranglement identifiés]
- **Emplacement des résultats** : [Chemin vers les rapports de performance]

## Optimisation des performances

Si la performance ne respecte pas les exigences :
1. Identifier les goulots d'étranglement à partir des résultats de test
2. Optimiser le code/les requêtes/les configurations
3. Relancer les tests pour valider les améliorations
```

---

## Étape 6 : Générer des instructions de test supplémentaires (si nécessaire)

Selon les exigences du projet, générer des fichiers d'instructions de test supplémentaires :

### Tests de contrat (pour les microservices)
Créer `aidlc-docs/construction/build-and-test/contract-test-instructions.md` :
- Validation des contrats d'API entre services
- Tests de contrat pilotés par le consommateur (consumer-driven)
- Validation de schéma

### Tests de sécurité
Créer `aidlc-docs/construction/build-and-test/security-test-instructions.md` :
- Analyse des vulnérabilités
- Vérifications de sécurité des dépendances
- Tests d'authentification/autorisation
- Tests de validation des entrées

### Tests de bout en bout
Créer `aidlc-docs/construction/build-and-test/e2e-test-instructions.md` :
- Tests de workflow utilisateur complets
- Scénarios inter-services
- Tests d'interface utilisateur (le cas échéant)

---

## Étape 7 : Générer le résumé des tests

Créer `aidlc-docs/construction/build-and-test/build-and-test-summary.md` :

```markdown
# Résumé du build et des tests

## Statut du build
- **Outil de build** : [Nom de l'outil]
- **Statut du build** : [Réussi/Échoué]
- **Artefacts de build** : [Lister les artefacts]
- **Durée du build** : [Durée]

## Résumé de l'exécution des tests

### Tests unitaires
- **Total des tests** : [X]
- **Réussis** : [X]
- **Échoués** : [X]
- **Couverture** : [X]%
- **Statut** : [Réussi/Échoué]

### Tests d'intégration
- **Scénarios de test** : [X]
- **Réussis** : [X]
- **Échoués** : [X]
- **Statut** : [Réussi/Échoué]

### Tests de performance
- **Temps de réponse** : [Réel] (Cible : [Attendu])
- **Débit** : [Réel] (Cible : [Attendu])
- **Taux d'erreur** : [Réel] (Cible : [Attendu])
- **Statut** : [Réussi/Échoué]

### Tests supplémentaires
- **Tests de contrat** : [Réussi/Échoué/N.A.]
- **Tests de sécurité** : [Réussi/Échoué/N.A.]
- **Tests E2E** : [Réussi/Échoué/N.A.]

## Statut global
- **Build** : [Réussi/Échoué]
- **Tous les tests** : [Réussi/Échoué]
- **Prêt pour l'Exploitation** : [Oui/Non]

## Prochaines étapes
[Si tout réussit] : Prêt à passer à la phase Exploitation pour la planification du déploiement
[En cas d'échecs] : Corriger les tests en échec et reconstruire
```

---

## Étape 8 : Mettre à jour le suivi d'état

Mettre à jour `aidlc-docs/aidlc-state.md` :
- Marquer l'étape Build et Tests comme terminée
- Mettre à jour le statut actuel

---

## Étape 9 : Présenter les résultats à l'utilisateur

Présenter un message complet :

```
"🔨 Build et Tests terminés !

**Statut du build** : [Réussi/Échoué]

**Résultats des tests** :
✅ Tests unitaires : [X] réussis
✅ Tests d'intégration : [X] scénarios réussis
✅ Tests de performance : [Statut]
✅ Tests supplémentaires : [Statut]

**Fichiers générés** :
1. ✅ build-instructions.md
2. ✅ unit-test-instructions.md
3. ✅ integration-test-instructions.md
4. ✅ performance-test-instructions.md (le cas échéant)
5. ✅ [fichiers de test supplémentaires si nécessaire]
6. ✅ build-and-test-summary.md

Consultez le résumé dans aidlc-docs/construction/build-and-test/build-and-test-summary.md

**Prêt à passer à l'étape Exploitation pour la planification du déploiement ?""
```

---

## Étape 10 : Consigner l'interaction

**OBLIGATOIRE** : Consigner la fin de la phase dans `aidlc-docs/audit.md` :

```markdown
## Étape Build et Tests
**Horodatage** : [horodatage ISO]
**Statut du build** : [Réussi/Échoué]
**Statut des tests** : [Réussi/Échoué]
**Fichiers générés** :
- build-instructions.md
- unit-test-instructions.md
- integration-test-instructions.md
- performance-test-instructions.md
- build-and-test-summary.md

---
```
