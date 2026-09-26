# Règles de validation du contenu

## OBLIGATOIRE : Validation du contenu avant la création de fichiers

**CRITIQUE** : Tout contenu généré DOIT être validé avant d'être écrit dans des fichiers, afin d'éviter les erreurs d'analyse.

## Validation des diagrammes Mermaid

### Étapes de validation requises
1. **Vérification de la syntaxe** : Valider la syntaxe Mermaid avant la création du fichier
2. **Échappement des caractères** : S'assurer que les caractères spéciaux sont correctement échappés
3. **Contenu de repli** : Fournir une alternative textuelle si la validation Mermaid échoue

### Règles de validation Mermaid
```markdown
## AVANT de créer un fichier contenant des diagrammes Mermaid :

1. Vérifier l'absence de caractères invalides dans les identifiants de nœuds (utiliser uniquement alphanumérique + underscore)
2. Échapper les caractères spéciaux dans les labels : " → \" et ' → \'
3. Valider la syntaxe du flowchart : les connexions entre nœuds doivent être valides
4. Tester l'analyse du diagramme avec une validation simple

## REPLI : Si la validation Mermaid échoue, utiliser une représentation textuelle du workflow
```

### Modèle d'implémentation
```markdown
## Visualisation du workflow

### Diagramme Mermaid (si la syntaxe est valide)
```mermaid
[contenu du diagramme validé]
```

### Alternative textuelle (à toujours inclure)
```
Phase 1 : INCEPTION
- Étape 1 : Détection de l'espace de travail (TERMINÉE)
- Étape 2 : Analyse des exigences (TERMINÉE)
[poursuivre avec la représentation textuelle]
```
```

## Validation générale du contenu

### Liste de contrôle avant création
- [ ] Valider les blocs de code intégrés (Mermaid, JSON, YAML)
- [ ] Vérifier l'échappement des caractères spéciaux
- [ ] Vérifier la correction de la syntaxe markdown
- [ ] Tester la compatibilité de l'analyse du contenu
- [ ] Inclure un contenu de repli pour les éléments complexes

### Règles de prévention des erreurs
1. **Toujours valider avant d'écrire** : Ne jamais écrire de contenu non validé dans un fichier
2. **Échapper les caractères spéciaux** : Particulièrement dans les diagrammes et les blocs de code
3. **Fournir des alternatives** : Inclure des versions textuelles du contenu visuel
4. **Tester la syntaxe** : Valider les structures de contenu complexes

## Gestion des échecs de validation

### En cas d'échec de la validation
1. **Consigner l'erreur** : Enregistrer ce qui a échoué à la validation
2. **Utiliser le contenu de repli** : Basculer vers l'alternative textuelle
3. **Poursuivre le workflow** : Ne pas bloquer sur des échecs de validation de contenu
4. **Informer l'utilisateur** : Mentionner qu'un contenu simplifié a été utilisé en raison de contraintes d'analyse
