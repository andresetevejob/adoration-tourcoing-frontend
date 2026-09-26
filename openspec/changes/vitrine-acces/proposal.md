# Proposition — vitrine-acces

## Why
Pages vitrine publiques reprises du template et garde de routes transverses (403/404) nécessaires dans les deux applications.

## What Changes
- user-app : HomePage, QuiSommesNousPage, Navbar (adaptée à l'auth), Footer, ScrollToTop, AdorationLive, Lightbox
- Les deux apps : Page403 (/non-autorise), Page404 (*)
- admin-app : Header, Sidebar (layout final)

## Impact
Dépend de socle-frontend, authentification-comptes (Navbar/Sidebar dépendent de l'état d'authentification). Fichiers : apps/user-app/src/{components/{layout,vitrine},pages}, apps/admin-app/src/components/layout.

*Référence AI-DLC* : unité U8 — voir `aidlc-docs/inception/application-design/unit-of-work.md`.
