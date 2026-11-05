# 05 — Assets e marca

As 14 fotografias e os três vídeos vieram do site oficial. Os 14 WebP originais estão em `images/originals/`; as versões para a página ficam em `site/photos/`. A otimização conserva proporção e conteúdo, com lado máximo de 1800 px. Os arquivos originais não são sobrescritos. Mapeamento e hashes constam em `docs/asset-manifest.json`.

Os MP4 em `site/videos/` são os originais, sem recodificação. Seus posters são frames únicos extraídos em 0,4 s, salvos como WebP; não há sequência de frames nem novo vídeo. Os vídeos são 576×1024 e devem permanecer em recortes verticais. Não ampliar um desses vídeos para simular uma filmagem panorâmica de alta resolução.

A composição de hero usa fotos reais em planos independentes. A prancha conceitual gerada não é um registro documental de uma única cena e não é usada como fundo da página. Na produção, as pessoas e os pratos vêm dos arquivos originais. Não mudar rostos ou inventar instalações.

A logo PNG de 1000×1000 px mantém os pixels decodificados do WebP oficial e o canal alfa. Usar a base creme de leitura por CSS, sem gravar fundo branco no PNG. Não substituir pelo selo aproximado desenhado na prancha gerada. Este projeto não entrega uma nova logo nem alega SVG nativo.

Caprasimo e DM Sans foram obtidas no repositório oficial Google Fonts. TTF, WOFF e duas licenças OFL acompanham o kit. O lettering da logo é independente. Os gestos de folhas são SVG decorativo desenhado no código; não representam ingredientes confirmados de cada item.

Hero e macro têm largura medida na base de 1024 px e altura natural. Os enquadramentos ficam no CSS, não em uma ampliação permanente dos arquivos. Não apagar os originais ao otimizar.
