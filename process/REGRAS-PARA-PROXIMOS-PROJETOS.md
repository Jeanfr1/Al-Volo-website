# Sites — regras de produção aprovadas

Este workspace reúne projetos de sites premium. Cada cliente exige linguagem visual própria; não reciclar automaticamente a estrutura ou as animações de outro cliente.

## Escala de boards — regra de 05/11/2026

- Boards raster de aproximadamente 760 px não são a largura de implementação. Normalizar a composição para uma base virtual de **1024 px**, centralizada.
- Texto, selo, pratos e sujeitos têm dimensões explícitas nessa base. A escala desktop não continua crescendo acima de 1024 px; fundos fotográficos e cores podem continuar até as bordas.
- Não usar `100vw / largura_real_do_png` como multiplicador global. Isso amplia uma prancha de 760 px em cerca de 1,9× numa janela de 1440 px.
- Hero e macro de produto não usam `cover` para preencher arbitrariamente a janela. Controlar largura, altura, posição e enquadramento conforme a composição medida. Não usar uma seção por tela por padrão.
- Mobile exige reflow legível; não reduzir uma prancha inteira até tornar o texto minúsculo.
- Verificar 375, 768, 1024, 1440 e 1920 px. Em 1440/1920, os elementos principais devem conservar a escala desktop aprovada; só os fundos se expandem. Registrar limites de verificação se o navegador não estiver disponível.
- Incluir a regra, tokens e verificações de escala nos kits futuros. Não declarar que um teste visual passou sem executá-lo.

## Pipeline

Apresentar três modelos, aguardar escolha e então criar o kit ZIP completo. Preservar com exatidão a escolha de hero e corpo. Entregar README, roteiros, marca transparente, fontes/licenças, imagens e código quando previsto. Sem geração de vídeo por padrão; aproveitar vídeos originais quando solicitados. Não publicar quando a entrega pedida é um kit local.
