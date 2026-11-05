# QA — Al Volo / Momenti Veri

**PASS — 112/112 verificações estáticas aprovadas.** 05/11/2026.

Cobertura: modelo e cenas, links locais, ARIA, sintaxe JS, carta/seleção, originais, canal alfa, fontes/licenças, hashes e regra de escala. Resultados por verificação em `QA.json`.

## Escala

Base 1024, escala desktop máxima 1. Título 76 px, pessoa 560 px e macro 740 px em 1024/1440/1920. Foram calculadas métricas da fonte para 375, 768, 1024, 1440 e 1920 px. Os valores estão em `scale-measurements.json`. Não são medições de DOM ou screenshots.

## Limites reais

**Navegador NÃO VERIFICADO.** O serviço de prévia retornou ausência do daemon (`/tmp/sites-previewd/requests`). Não houve renderização, inspeção visual, cliques, teste de foco ou responsividade da implementação no navegador. O roteiro 06 contém as verificações pendentes.

DISH e outros serviços usam os destinos originais. HTTP 200, quando registrado em `service-http-checks.json`, comprova somente acesso de rede. Não foi enviada reserva, pedido, avaliação ou mensagem. Promoção e páginas legais permanecem nos links oficiais e suas rotas devem ser conservadas na migração.

A imagem em `references/` é a prancha aprovada, não screenshot do site. Não houve publicação.
