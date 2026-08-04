---
translationKey: 'hello-world'
language: 'en'
slug: 'hello-world'
title: 'Hello world'
author: 'Ada Lovelace'
date: 2026-01-15T09:00:00.000Z
---

This article is a markdown file, not a Multilocale phrase. It has a sibling in
Spanish and one in French, each with its own slug, and the three are tied
together by the `translationKey` in the frontmatter.

That split is deliberate. The interface strings — the navigation, the byline
above this paragraph, the button on the home page — are short, reused on every
page, and worth managing centrally on multilocale.com. A 600-word article is
not: it wants a writer, a reviewer and a diff, so it stays in the repository.
