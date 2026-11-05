# 02 — Hero e animação

## Ideia

O selo AV funciona como uma abertura de câmera. Revela um momento real à mesa, seguido pela seleção de comida. A fotografia permanece na escala definida; o movimento está na abertura, no recorte e na diferença entre os planos.

## Abertura implementada

No topo e uma vez por carregamento, após a fonte e a foto principal decodificarem: a janela da pessoa abre de círculo 0% para 110% em 1,25 s, easing `cubic-bezier(.22,.7,.2,1)`. A posição do círculo é 42%/40% do plano da fotografia. As três linhas do título entram com deslocamento de 12 px e opacidade .3→1 em 750 ms; atrasos de 100, 190 e 280 ms. Nenhuma escala é aplicada à pessoa ou ao título.

Ao rolar cedo, cancelar as entradas para devolver o controle à leitura. Não repetir a abertura a cada entrada de seção. O título não pode desaparecer enquanto o visitante escolhe uma ação.

## Scroll e apontador

No hero, deslocamento da pessoa até 8 unidades, título até −4, comida até −10/−4 e selo até −3°. As unidades são limitadas pela base 1024; não crescem em 1440 ou 1920 px. Apontador fino acrescenta no máximo ±3 px ao primeiro plano; não usar em telas de toque. Não há captura do scroll, palco de 100vh obrigatório, loop infinito ou câmera 3D.

## Escala e acessibilidade

Hero: largura explícita da foto, altura proporcional, sem `cover`. O movimento não muda o tamanho máximo dos elementos. Mobile usa outra composição, não uma redução da prancha toda. Preferência de movimento reduzido ou economia de dados desliga os efeitos. O botão de pausa registra a escolha no navegador. O conteúdo permanece visível sem JavaScript.

Nenhum vídeo novo é gerado para esse efeito. Os três vídeos existentes ficam na cena de experiências e só são reproduzidos por ação do visitante.
