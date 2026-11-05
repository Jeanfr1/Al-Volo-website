# 03 — Seções e transições

| Cena | Composição e conexão |
| --- | --- |
| Hero | Pessoa real à direita, mesa em primeiro plano, selo e chamada à esquerda; abertura circular |
| Menu | Painel creme e macro fotográfica com recorte elíptico; categorias trocam a seleção e a foto de ambientação |
| 48 horas | Vermelho de contraste, tipografia grande porém limitada, janela circular com preparo real |
| Vídeos | Fotografia de pasta ao fundo, três recortes verticais dos vídeos reais e acesso a almoço/ofertas |
| Hamburg/Itália | Fachada real, galeria, redes, Wolt, avaliações e promoção oficial |
| Reserva | Fundo real, card de entrada do DISH, telefone, endereço, horário e links oficiais |

As junções curvas derivam da geometria do selo e dos pratos. Não usar a sequência de três cortes diagonais do projeto anterior. As bordas arredondadas têm alturas explícitas na base normalizada; não devem aumentar conforme uma janela larga.

No menu, a macro varia cerca de ±7/±4 unidades e ±1°; o gesto de folha gira discretamente. A troca de categoria dissolve a foto em 450 ms, sem zoom de prato. A foto ilustra a cozinha/mesa e não precisa corresponder a cada item escolhido. O PDF completo fica sempre disponível.

A janela do preparo varia até ±6 unidades. Os recortes dos vídeos deslocam-se até ±6. Na fachada, fundo varia até ±4 e o prato lateral até ±6. Reduzir esses movimentos no mobile. Não deformar as fotos nem estender queijo ou ingredientes entre imagens distintas.

Revelações de texto: 12 px, 650 ms, uma vez por bloco. O navegador só agenda atualização em eventos de scroll, resize ou apontador; não renderiza um loop em repouso. A aba oculta interrompe entradas e pausa vídeo em reprodução. Textos, ações e reserva não dependem dos efeitos.
