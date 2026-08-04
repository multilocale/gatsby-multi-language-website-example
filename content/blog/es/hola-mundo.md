---
translationKey: 'hello-world'
language: 'es'
slug: 'hola-mundo'
title: 'Hola mundo'
author: 'Ada Lovelace'
date: 2026-01-15T09:00:00.000Z
---

Este artículo es un archivo markdown, no una frase de Multilocale. Tiene un
hermano en inglés y otro en francés, cada uno con su propio slug, y los tres
están unidos por el `translationKey` del frontmatter.

La separación es deliberada. Las cadenas de la interfaz —la navegación, la
firma que hay sobre este párrafo, el botón de la página de inicio— son cortas,
se reutilizan en todas las páginas y merece la pena gestionarlas de forma
centralizada en multilocale.com. Un artículo de 600 palabras no: necesita quien
lo escriba, quien lo revise y un diff, así que se queda en el repositorio.
