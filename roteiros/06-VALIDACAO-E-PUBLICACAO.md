# 06 — Validação e passagem

## Escala

Executar `python3 tools/verificar-kit.py`. Conferir o teto de 1024 px do canvas, título máximo 76 px, foto principal 560 px e macro 740 px. A comparação em 1024, 1440 e 1920 deve manter esses tamanhos. Fundos continuam até as bordas. Em 375/768 px, revisar o reflow e os mínimos de leitura.

No navegador, comparar a composição à prancha sem esticá-la até preencher a janela. Não usar `cover` no hero ou macro, `transform:scale()` no documento ou fator `viewport/760`. Pausa, movimento reduzido e economia de dados não devem mudar a escala nem deixar espaço vazio.

## Interações

Testar categorias, seleção, busca, PDF de duas páginas, três vídeos com controles/áudio, galeria e setas, foco por teclado, Escape, menu móvel, telefone, email e links externos. Carregar DISH, GezerView e Maps apenas ao escolher o serviço. Conferir configurações e alternativas externas. Não criar reserva ou pedido real como teste sem autorização específica.

## Limite desta entrega

O serviço de prévia retornou ausência de daemon no ambiente de trabalho. Não houve renderização nem clique em navegador da implementação. Verificações estáticas, métricas tipográficas e acesso HTTP não comprovam enquadramento visual, responsividade ou funcionamento integral de sistemas externos. `docs/QA.md` registra o resultado efetivo.

## Publicação futura

Servir a pasta `site/` com caminhos relativos preservados. Confirmar a carta vigente, dados operacionais e disponibilidade dos serviços no dia da publicação. Conservar as páginas oficiais de promoção e legais ou integrar suas versões aprovadas antes de substituir a hospedagem original. A entrega não foi publicada e não contém identidade de hospedagem de outro cliente.

## ZIP

O arquivo final deve ter uma pasta principal e conter todos os assets, não apenas PDF ou guia. Testar CRC e comparar os hashes do manifesto com a extração. Depois de editar, regenerar `MANIFEST.sha256` e o ZIP. A cópia disponibilizada deve manter o mesmo hash do ZIP conferido.
