---
translationKey: 'hello-world'
language: 'fr'
slug: 'bonjour-le-monde'
title: 'Bonjour le monde'
author: 'Ada Lovelace'
date: 2026-01-15T09:00:00.000Z
---

Cet article est un fichier markdown, pas une phrase Multilocale. Il a un frère
en anglais et un autre en espagnol, chacun avec son propre slug, et les trois
sont reliés par le `translationKey` du frontmatter.

Cette séparation est voulue. Les chaînes de l'interface — la navigation, la
signature au-dessus de ce paragraphe, le bouton de la page d'accueil — sont
courtes, réutilisées sur toutes les pages, et méritent d'être gérées de manière
centralisée sur multilocale.com. Un article de 600 mots, non : il lui faut un
auteur, un relecteur et un diff, donc il reste dans le dépôt.
