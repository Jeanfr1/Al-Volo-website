# Base de escala 1024 — regra reutilizável

Adotada em 05/11/2026 após orientação expressa do usuário. Vale como padrão de execução para os próximos projetos, sem impor a mesma linguagem visual aos clientes.

## Causa que deve ser evitada

Uma prancha de aproximadamente 760 px, multiplicada por `larguraDaJanela / 760`, fica cerca de 1,9× maior em 1440 px. Fontes, pessoas e pratos passam a dominar uma tela inteira. Um `cover` aplicado a uma caixa de altura arbitrária ainda pode ampliar o recorte além do esperado.

## Implementação de referência

```css
:root {
  --design-width: 1024px;
  --u: min(1px, calc(100vw / 1024));
}
.canvas {
  width: min(100%, var(--design-width));
  margin-inline: auto;
}
.foreground {
  width: calc(560 * var(--u));
  height: auto;
}
```

Os números dos elementos vêm da composição aprovada e de sua adaptação para a base virtual. Não transformar a imagem completa do board em uma página esticada. Não aplicar `transform:scale()` no documento inteiro. Em telas acima de 1024 px, a escala do conteúdo não cresce. O fundo pode continuar até as bordas em camada independente.

Hero e macro precisam de posição e tamanho explícitos. A fotografia mantém a proporção natural, com o recorte necessário desenhado de propósito. `object-fit:cover` continua sendo apropriado para miniaturas ou fundos panorâmicos secundários quando o recorte for intencional; não deve controlar o tamanho do sujeito principal do hero ou da macro.

## Mobile

Abaixo do ponto de reflow do projeto, trocar a composição por layout legível, com tamanhos mínimos de fonte, controles e posições específicas. Não reduzir todos os elementos proporcionalmente até gerar texto de 6–10 px. Alturas de cenas podem adaptar-se ao fluxo para evitar cortes.

## Conferência obrigatória

Em 375, 768, 1024, 1440 e 1920 px: verificar limite do título, largura da pessoa/produto, corte das fotografias, margens, leitura, diálogos e ausência de overflow. Comparar 1024 com 1440/1920: os elementos principais devem manter o tamanho desktop, com expansão dos fundos. Testar movimento reduzido e pausa sem alterar a escala.

Verificações estáticas provam presença da regra e coerência numérica. A aparência e as interações precisam de revisão em navegador. Registrar a distinção; não declarar revisão visual concluída quando a infraestrutura não permitir executá-la.
