# Proposition — contact-visiteurs

## Why
Permettre à un visiteur de contacter la paroisse ; le backend n'expose pas encore /contact, capacité développée contre un mock MSW en attendant.

## What Changes
- ContactPage, formulaire (nom/email/sujet/message), sendContactMessage (mock MSW), confirmation d'envoi

## Impact
⚠️ Dépendance backend non finalisée. Dépend uniquement de socle-frontend. Fichiers : apps/user-app/src/{pages/ContactPage.tsx,api/endpoints/contact.ts}.

*Référence AI-DLC* : unité U7 — voir `aidlc-docs/inception/application-design/unit-of-work.md`.
