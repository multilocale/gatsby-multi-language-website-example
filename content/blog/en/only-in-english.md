---
translationKey: 'only-in-english'
language: 'en'
slug: 'only-in-english'
title: 'A post that exists only in English'
author: 'Grace Hopper'
date: 2026-02-02T09:00:00.000Z
---

This one has no Spanish or French sibling, on purpose. It is what a real site
looks like halfway through a translation.

Because `translationKey` groups the files that do exist rather than assuming
one file per language, the alternates map for this page contains only `en`.
The language switcher above therefore offers no Spanish or French link here,
and the page emits no `hreflang="es"` pointing at a URL that was never built.
Announcing a translation that 404s is worse for search than having no
translation at all.
