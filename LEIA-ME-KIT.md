# Al Volo — Momenti Veri

Kit do **modelo 1 completo**, aprovado em 05/11/2026: hero 1 + todas as seções do modelo 1. Site em alemão, marca original e mídias reais da Pizzeria Al Volo. Entrega local; nenhuma publicação ou reserva foi realizada.

## Abrir a entrega

1. Extraia o ZIP inteiro, mantendo as pastas.
2. Abra `GUIA-VISUAL.html` para consultar a direção, a escala e os arquivos.
3. Abra `site/index.html` em um navegador atual. Para validar integrações e fontes sem restrições de `file://`, sirva a pasta `site/` em hospedagem estática.
4. Leia os documentos em `roteiros/` e o relatório `docs/QA.md` antes de alterar ou publicar.

O site é HTML/CSS/JavaScript, sem compilação, conta ou instalação. Fontes, fotos, três vídeos e a carta PDF estão incluídos. DISH, GezerView, Maps, Wolt e links oficiais exigem conexão com a internet.

## Correção de escala incorporada

O PNG do board é uma referência visual, **não é esticado como página**. A composição usa uma base virtual de **1024 px** centralizada, com escala desktop máxima de 1. Em janelas de 1440 e 1920 px, o conteúdo principal conserva o mesmo tamanho; fundos e cores continuam até as bordas.

| Elemento | Limite desktop |
| --- | ---: |
| Canvas de conteúdo | 1024 px |
| Título do hero | 76 px |
| Foto principal do hero | 560 px de largura |
| Macro de menu | 740 px de largura, com recorte lateral |

Hero e macro têm largura explícita, altura proporcional e posicionamento próprio. Não usam `cover` para preencher a janela. O movimento decorativo tem deslocamentos pequenos, sem aumentar a escala dos sujeitos. Até 720 px há reflow específico: textos legíveis e novas posições, em vez de encolher a prancha inteira.

A regra reutilizável está em `process/BASE-DE-ESCALA-1024.md`, com instruções para próximos projetos em `process/REGRAS-PARA-PROXIMOS-PROJETOS.md`. `docs/scale-contract.json` e o verificador registram os limites. Essa conferência de código não substitui revisão visual no navegador.

## O que vem no kit

| Local | Conteúdo |
| --- | --- |
| `site/` | Site estático com seis cenas, menus e diálogos funcionais, fontes e mídias locais |
| `brand/` | PNG original transparente, paleta e guia de uso |
| `fonts/` | Fontes TTF, fontes oficiais de origem e licenças OFL |
| `images/originals/` | 14 fotografias originais preservadas |
| `site/photos/` | Versões otimizadas e três posters extraídos dos vídeos originais |
| `site/videos/` | Três MP4 originais, sem geração ou alteração de vídeo |
| `site/Speisekarte-Al-Volo-Original.pdf` | Carta completa original, com comida, bebidas e extras |
| `references/` | A imagem exata do modelo 1 aprovado; não é screenshot da implementação |
| `roteiros/` e `motion/` | Direção de arte, animações, transições, integração e timeline |
| `docs/` | Decisão, fontes, equivalência funcional, contratos, hashes e verificações |
| `tools/` | Exportação de assets e verificação do kit |
| `MANIFEST.sha256` | Integridade dos demais arquivos desta versão |

## As seis cenas

1. **Hier schmeckt das Leben.** Pessoa e mesa reais, tipografia retrô, selo AV e ações principais.
2. **Worauf hast du Lust?** Fotografia de pizza com enquadramento circular, categorias e seleção interativa; PDF completo sempre acessível.
3. **48 Stunden. Für diesen Moment.** Contraste vermelho, foto real do preparo e informações sobre conceito e massa para levar. É a única cena principal inteiramente de cor lisa.
4. **Vom Teig zum Tisch.** Três vídeos originais com reprodução por escolha do visitante; acesso à exibição de almoço/ofertas.
5. **Ein Stück Hamburg. Viel Italien.** Fachada, galeria ampliável, Wolt, Google, redes e promoção existente.
6. **Dein Platz wartet.** Fotografia e entrada real para o DISH, contatos, horário e links oficiais.

## Interações e conteúdo preservado

A seleção de menu reúne 21 itens em oito categorias, com busca e valores conferidos no PDF. É uma seleção, não uma transcrição completa: o PDF original mantém a carta inteira disponível. As fotografias ilustram pratos e o ambiente da casa; não foram inventadas fotos específicas para todos os itens.

A reserva abre o **DISH real** do restaurante. A área de almoço/ofertas abre o display **GezerView existente**. Ambos são carregados quando o visitante solicita; há abertura externa e telefone de alternativa. Não foram criados backend, carrinho, preços de ofertas ou confirmações fictícias de reserva.

Vídeos são os MP4 originais: verticais, com som e legendas/marcas já presentes nas fontes. Só iniciam após ação do visitante. A galeria contém as 12 fotos da galeria original; as outras duas fotos são usadas na apresentação. Contatos, Maps, Instagram, TikTok e Wolt estão ligados.

Os links de promoção, Impressum e Datenschutz continuam nas **páginas oficiais existentes**. Isso preserva termos e informações do responsável. Ao substituir a hospedagem de `alvolo.de`, mantenha essas rotas ou integre suas versões atuais aprovadas; não remova os destinos. O detalhamento de cada função está em `docs/PARIDADE-FUNCIONAL.md`.

## Marca, tipografia e imagens

A logo PNG tem 1000×1000 px, RGBA e transparência real. Os pixels decodificados são idênticos ao WebP oficial; não houve redesenho da marca. O selo é aplicado sobre base creme para leitura. Títulos usam **Caprasimo**, textos e interfaces usam **DM Sans**. Fontes locais e licenças estão incluídas; não foi criado um alfabeto exclusivo.

As 14 fotos e os três vídeos vieram do site oficial. Os originais e seus hashes foram preservados. A página combina fotografias por CSS e recortes; a composição não deve ser descrita como uma única fotografia documental. O board aprovado é uma prancha conceitual gerada, usada apenas como referência, nunca como fundo único da página.

## Alterar e validar

- Conteúdo geral e serviços: `site/content.js`; contatos visíveis e JSON-LD também aparecem em `site/index.html`.
- Seleção de pratos: `site/menu-data.js`. Use a carta oficial vigente, preservando o PDF completo.
- Escala/layout: `site/styles.css`. Não remover o teto de 1024 px nem aplicar multiplicadores por 760 px.
- Movimento e diálogos: `site/app.js`. Preferência de movimento reduzido e economia de dados prevalecem; o botão de pausa conserva a escolha local.
- Dados externos: confirmar disponibilidade, termos, URLs e conteúdo atual no momento da publicação.

Validação: `python3 tools/verificar-kit.py`. Para reexportar assets, instale as dependências de `tools/requirements.txt` e execute `python3 tools/preparar-assets.py`; FFmpeg é necessário apenas para recriar os posters. O site não depende de Python ou FFmpeg para funcionar.

**Limite de verificação:** a infraestrutura de prévia gerenciada não estava disponível. A escala foi conferida por regras, métricas e verificações estáticas; renderização e interações no navegador permanecem não verificadas. Não interpretar `QA.md` como um teste de reservas reais. Antes de publicar, executar a revisão visual e funcional descrita no roteiro 06. Após qualquer alteração, gerar novo manifesto e ZIP.

## Implementação (06/11/2026)

O site em `site/` foi conferido no navegador contra a prancha aprovada. O `README.md` (em inglês) apresenta o projeto no GitHub. As mudanças em relação ao kit:

- **Escala**: `--u` continua com teto de 1 px e base de 1024. Em janelas baixas, também respeita a altura (`100svh / 760`), apenas para **reduzir**, para o hero caber em uma tela. Não há multiplicador `viewport / 760`.
- **Fundos**: cada foto de cena se funde a uma placa desfocada dela mesma (`site/photos/plates/`), gerada por `scripts/prepare-plates.py`. Ondas e costuras usam a mesma grade de 1024 unidades (`site/shapes/`).
- **Posters**: quadros dos três MP4 originais, escolhidos pelo assunto (`site/photos/posters/`). Nenhum vídeo novo.
- **Logo**: `site/brand/logo-original.png` continua idêntico ao da marca. O selo e os favicons usam cópias reduzidas do mesmo arquivo (`seal-320.webp`, `icon-64.png`, `icon-180.png`), sem redesenho.
- **Animações**: abertura e parallax do roteiro, mais uma entrada por cena (íris do macro, manjericão, pincel, janela do chef, 48 contando, rama de tomate, cartões de vídeo, fachada, pizza, sublinhado). Movimento reduzido, pausa e economia de dados mostram o estado final.
- **Validação**: `npm run qa` (126 verificações em 8 tamanhos de janela, em `docs/browser-qa.json`) e `npm run manifest` (hashes, verificador do kit e `MANIFEST.sha256`).
- **Publicação**: https://al-volo-hamburg.vercel.app (Vercel, projeto `al-volo-hamburg`, ligado ao GitHub: cada push no `main` publica). Fica com `noindex` até o domínio próprio.
- **Pendências do cliente**: marcadas como `TODO(alvolo)` no código e listadas no `README.md`.
