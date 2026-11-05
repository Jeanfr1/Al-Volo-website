# QA — Al Volo / Momenti Veri

**PASS — 112/112 verificações estáticas aprovadas.** 06/11/2026.

## Navegador

**PASS 126/126 (2026-11-05).** `scripts/qa.mjs` (Playwright/Chromium) mede no DOM as cenas em telas reais (1440x790, 1280x650, 1536x730, 1920x950, 1024x768, 768x1024, 390x844, 375x667), overflow, erros de console, tamanhos mínimos de texto, fotos acima dos próprios pixels, todos os diálogos (carta e busca, DISH, GezerView, mapa, vídeos, galeria, configurações), links oficiais, movimento ligado/pausado e textos visíveis. Serviços externos ficam bloqueados no teste: só os destinos são conferidos. Resultados em `browser-qa.json`.


Cobertura: modelo e cenas, links locais, ARIA, sintaxe JS, carta/seleção, originais, canal alfa, fontes/licenças, hashes e regra de escala. Resultados por verificação em `QA.json`.

## Escala

Base 1024, escala desktop máxima 1. Título 76 px, pessoa 560 px e macro 740 px em 1024/1440/1920. Foram calculadas métricas da fonte para 375, 768, 1024, 1440 e 1920 px. Os valores estão em `scale-measurements.json`. As medições de DOM em navegador ficam no QA de navegador.

## Limites reais

O QA de navegador não envia reservas, pedidos nem mensagens e não carrega DISH, GezerView ou Maps de verdade: confere que cada um abre atrás do aviso de consentimento e aponta para o destino original.

DISH e outros serviços usam os destinos originais. HTTP 200, quando registrado em `service-http-checks.json`, comprova somente acesso de rede. Não foi enviada reserva, pedido, avaliação ou mensagem. Promoção e páginas legais permanecem nos links oficiais e suas rotas devem ser conservadas na migração.

A imagem em `references/` é a prancha aprovada, não screenshot do site. Não houve publicação.
