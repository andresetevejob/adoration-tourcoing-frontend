# AI-DLC (Cycle de vie de développement piloté par IA) — Version française

Ceci est la traduction française complète du workflow AI-DLC défini dans [`../aidlc/`](../aidlc). Le contenu, la structure et le comportement sont identiques à la version anglaise ; seul le texte a été traduit.

## Contenu

```
aidlc-fr/
├── core-workflow.md          # Fichier de règle principal — à charger dans votre agent
└── rule-details/             # Règles détaillées par étape, chargées par core-workflow.md
    ├── common/
    ├── inception/
    ├── construction/
    └── operations/
```

`core-workflow.md` est le point d'entrée. Il demande à l'agent de lire les fichiers complémentaires dans un répertoire `rule-details/` **situé à côté de lui** — tant que les deux restent ensemble (même disposition relative), leur emplacement exact dans votre projet importe peu.

## Démarrage rapide

### 1. Copier le workflow dans votre projet

```bash
git clone https://github.com/aws-samples/sample-aidlc-workflows.git
cd mon-projet
cp -R ../sample-aidlc-workflows/aidlc-fr ./aidlc-fr   # garder core-workflow.md et rule-details/ ensemble
```

### 2. Pointer votre agent IA vers `aidlc-fr/core-workflow.md`

La méthode dépend de votre agent, chacun ayant sa propre convention pour charger des instructions personnalisées :

- **Amazon Q Developer** (extension IDE ou Q CLI) : Q charge automatiquement les fichiers de règles Markdown depuis `.amazonq/rules/`. Copiez-y le workflow au lieu de la racine du projet :
  ```bash
  mkdir -p .amazonq/rules
  cp -R ../sample-aidlc-workflows/aidlc-fr/core-workflow.md .amazonq/rules/
  cp -R ../sample-aidlc-workflows/aidlc-fr/rule-details .amazonq/rules/
  ```

- **Claude Code** : gardez `aidlc-fr/` à la racine du projet (comme ci-dessus), puis ajoutez une ligne dans votre `CLAUDE.md` pour indiquer à Claude de le charger, par ex. `@aidlc-fr/core-workflow.md`, ou demandez-lui simplement en début de session de « lire et suivre aidlc-fr/core-workflow.md ».

- **Cursor** : copiez `aidlc-fr/core-workflow.md` et `aidlc-fr/rule-details/` dans `.cursor/rules/aidlc-fr/` pour que Cursor charge automatiquement le fichier de règles.

- **Windsurf / Cline / autres agents basés sur des fichiers** : copiez `aidlc-fr/` dans le répertoire de règles de projet que votre agent scanne (ex. `.windsurf/rules/`, `.clinerules/`), en gardant `core-workflow.md` et `rule-details/` comme frères.

- **Tout autre agent (uniquement conversationnel, sans dossier de règles projet)** : collez le contenu de `aidlc-fr/core-workflow.md` directement comme prompt système ou instructions personnalisées, et assurez-vous que l'agent a accès aux fichiers de `aidlc-fr/rule-details/` dans votre répertoire de travail pour qu'il puisse charger les fichiers de détail référencés pendant le workflow.

### 3. Utilisation

1. Démarrez toute demande de développement logiciel en exprimant votre intention à l'agent. AI-DLC s'active automatiquement et vous guide à partir de là.
2. Répondez aux questions structurées posées par AI-DLC.
3. Examinez attentivement chaque plan généré par l'agent — assurez votre supervision et votre validation.
4. Passez en revue le plan d'exécution pour voir quelles étapes vont s'exécuter.
5. Examinez attentivement les artefacts et approuvez chaque étape pour garder le contrôle.
6. Tous les artefacts sont générés dans le répertoire `aidlc-docs/` de votre projet (noms de fichiers conservés en anglais pour rester cohérents avec la structure de référence).

Pour la description complète des trois phases, des fonctionnalités clés et de la licence, voir le [README principal](../README.md) (en anglais) — le contenu est identique, seule la langue des règles change.
