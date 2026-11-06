#!/usr/bin/env python3
"""Valida arquivos, dados e a regra de escala. Não simula um navegador."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from fontTools.ttLib import TTFont
from PIL import Image
import json,re,hashlib,subprocess,sys
ROOT=Path(__file__).resolve().parents[1];checks=[]
def check(name,condition,detail=''):checks.append({'name':name,'pass':bool(condition),'detail':detail})
def sha(f):return hashlib.sha256(f.read_bytes()).hexdigest()
class HTML(HTMLParser):
    def __init__(self,text):super().__init__();self.nodes=[];self.feed(text)
    def handle_starttag(self,tag,attrs):self.nodes.append((tag,dict(attrs)))
html=(ROOT/'site/index.html').read_text();css=(ROOT/'site/styles.css').read_text();js=(ROOT/'site/app.js').read_text();mjs=(ROOT/'site/motion.js').read_text();doc=HTML(html)
ids=[a['id']for _,a in doc.nodes if'id'in a];known=set(ids)
arch=json.loads((ROOT/'docs/architecture-lock.json').read_text());contract=json.loads((ROOT/'docs/scale-contract.json').read_text())
sel=json.loads((ROOT/'docs/selection.json').read_text());scenes=[{'id':a.get('id'),'scene':a.get('data-scene'),'background':a.get('data-background')}for t,a in doc.nodes if t=='section']
check('Modelo 1 no hero e corpo',sel['selected_model']==sel['hero_model']==sel['body_model']==1)
board_ids=[s['id']for s in arch['board_scenes']]
check('Seis cenas do board na ordem aprovada',[s for s in scenes if s['id']in board_ids]==arch['board_scenes']and len(board_ids)==6)
check('Cenas de paridade com o alvolo.de registradas',scenes==arch['scenes'])
check('Um contraste principal de cor lisa',sum(s['background']=='solid'for s in scenes)==1 and scenes[2]['id']=='konzept')
check('Idioma alemão e H1 único',any(t=='html'and a.get('lang')=='de'for t,a in doc.nodes)and sum(t=='h1'for t,_ in doc.nodes)==1)
check('IDs únicos',len(ids)==len(known))
check('Site estático sem identidade de outro cliente',json.loads((ROOT/'site/.openai/hosting.json').read_text())=={'static':{'directory':'.'}})
check('Sem vídeo gerado ou publicação',not sel['generated_new_video']and not sel['published'])
check('Prancha não é usada como fundo do site','references/'not in html+css+js+mjs and not re.search(r'exec-[a-f0-9-]+\.png',html+css+js+mjs))
bad_paths=[];bad_aria=[];bad_dims=[];bad_links=[]
for tag,a in doc.nodes:
    for key in ('src','href','srcset'):
        value=a.get(key)
        if not value:continue
        u=urlsplit(value)
        if not u.scheme and not u.netloc:
            if u.path and not(ROOT/'site'/unquote(u.path)).is_file():bad_paths.append(value)
            elif not u.path and u.fragment and u.fragment not in known:bad_paths.append(value)
        if a.get('target')=='_blank'and not{'noopener','noreferrer'}.issubset(set(a.get('rel','').split())):bad_links.append(value)
    for key in ('aria-labelledby','aria-controls'):
        bad_aria.extend(x for x in a.get(key,'').split()if x not in known)
    if tag=='img':
        if'alt'not in a:bad_aria.append('img sem alt')
        f=ROOT/'site'/a['src']
        if f.is_file()and f.suffix!='.svg':
            with Image.open(f) as im:
                if (int(a.get('width',0)),int(a.get('height',0)))!=im.size:bad_dims.append(a['src'])
check('Caminhos HTML resolvem',not bad_paths,str(bad_paths));check('ARIA e alt resolvem',not bad_aria,str(bad_aria))
check('Dimensões de imagens declaradas corretas',not bad_dims,str(bad_dims));check('Novas abas protegidas',not bad_links,str(bad_links))
refs=re.findall(r'url\([\'\"]?([^\)\'\"]+)',css);check('Recursos CSS locais',all((ROOT/'site'/x).is_file()for x in refs),str(refs))
check('CSS com delimitadores equilibrados',css.count('{')==css.count('}')and css.count('(')==css.count(')'))
check('Fontes e scripts de renderização locais',not any(a.get('src','').startswith('http')for t,a in doc.nodes if t in('script','img'))and'https://'not in css)
for filename in ('app.js','motion.js','content.js','menu-data.js'):
    try:r=subprocess.run(['node','--check',str(ROOT/'site'/filename)],capture_output=True,text=True);check('Sintaxe '+filename,r.returncode==0,r.stderr.strip())
    except OSError as e:check('Sintaxe '+filename,False,str(e))
program="const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);for(const f of ['content.js','menu-data.js'])vm.runInContext(fs.readFileSync(process.argv[1]+'/'+f,'utf8'),c);process.stdout.write(JSON.stringify({data:c.window.ALVOLO,menu:c.window.ALVOLO_MENU}));"
runtime=subprocess.run(['node','-e',program,str(ROOT/'site')],check=True,capture_output=True,text=True);data=json.loads(runtime.stdout);C=data['data'];M=data['menu']
check('Dados Hamburg corretos',C['phone']=='+494043275924'and C['address']=='Eppendorfer Weg 211, 20253 Hamburg')
check('Sem dados de outros clientes',not re.search(r'Ciao Mamma|Pontchâteau|Townsville|Karim|Aymen',html+js+(ROOT/'site/content.js').read_text()))
phone_values=[a['href']for _,a in doc.nodes if a.get('href','').startswith('tel:')];check('Todos os links de chamada corretos',bool(phone_values)and set(phone_values)=={'tel:'+C['phone']})
jsonld=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',html,re.S)[1]);check('JSON-LD consistente',jsonld['telephone']==C['phone']and jsonld['address']['postalCode']=='20253'and'aggregateRating'not in jsonld)
check('DISH original e link real',C['dish']['eid']=='hydra-7ba734db-67cb-4e91-8fdb-57aabc92fa4b'and C['dish']['base']=='https://reservation.dish.co/widget/'and'new URLSearchParams'in js)
check('Display original preservado',C['deals'].startswith('https://gezerview.gezermedia.de/play/')and'deals:t=>service'in js)
check('Carregamento externo por escolha','preferences[type]'in js and'load()'in js and'<iframe'not in html)
check('Alternativas externas e telefone','Extern öffnen ↗'in js and'Telefonisch:'in js)
check('Sem formulário/confirmador fictício','<form'not in html and not re.search(r'Buchung bestätigt|Reservierung bestätigt',html+js))
check('Páginas oficiais legais e promoção',C['gift']=='https://alvolo.de/belohnung'and C['impressum']=='https://alvolo.de/impressum'and C['privacy']=='https://alvolo.de/datenschutz')
check('Menu identificado como seleção',M['scope']=='selection_with_complete_pdf'and'Eine Auswahl'in html)
check('Oito categorias e 21 itens',len(M['categories'])==8 and sum(len(c['items'])for c in M['categories'])==21)
check('Ortolana/Margherita com preços da carta',[(i['name'],i['price'])for c in M['categories']if c['id']=='pizza'for i in c['items']]==[('Ortolana',17),('Margherita',12)])
check('Carta original preservada',sha(ROOT/'site/Speisekarte-Al-Volo-Original.pdf')=='108038f168ed097307cc37d82782b35ff3c2d5e0e7277eba56f18321d26d99ed')
check('Categorias apontam para fotos locais',all((ROOT/'site'/c['image']).is_file()for c in M['categories']))
check('Busca e abas com teclado','toLocaleLowerCase'in js and'ArrowRight'in js and"e.key==='Home'"in js and"e.key==='End'"in js)
check('Retorno de foco e fechamento nativo','returnFocus?.focus()'in js and"dialog.addEventListener('close'"in js)
inline=[a for t,a in doc.nodes if t=='video']
check('Vídeos com som só por ação; inline mudos e sob demanda','data-video='in html and'video.controls=true'in js and'video.pause()'in js and inline and all('muted'in a and'playsinline'in a and a.get('preload')=='none'and a.get('data-src')and not a.get('src')for a in inline),str(len(inline)))
check('Galeria com 12 fotos e teclado',len(C['gallery'])==12 and'gallery-viewer'in js and'ArrowLeft'in js)
check('Preferências externas e movimento separadas','alvolo.preferences.v1'in js and'alvolo.motion.paused'in js)
check('Movimento reduzido e economia de dados','prefers-reduced-motion: reduce'in js and'connection?.saveData'in js)
check('Scroll nativo e sem loop contínuo',not re.search(r'addEventListener\([\'\"](?:wheel|touchmove)|setInterval\(|scrollerProxy|ScrollSmoother',js+mjs)and'requestAnimationFrame(update)'in js)
check('Interrupção em aba oculta','document.hidden'in js and'cancelAnimationFrame(raf)'in js and'document.hidden'in mjs)
check('Movimento montado e revertido por inteiro','alvolo:motion'in js and'alvolo:motion'in mjs and'ctx.revert()'in mjs and'unsplit()'in mjs)
check('GSAP local com licença',all((ROOT/'site/vendor'/f).is_file()and'GreenSock'in(ROOT/'site/vendor'/f).read_text()[:600]for f in('gsap.min.js','ScrollTrigger.min.js')))

# A regra de escala é um contrato independente da resolução raster do board.
check('Base 1024 e teto 1',contract['baseline_px']==1024 and contract['max_desktop_scale']==1)
# Implementação 06/11/2026: o canvas mede 1024 unidades (= min(100%,1024px) enquanto u segue a largura)
# e, em janelas baixas, u também respeita a altura (100svh/760) para o hero caber em uma tela.
check('Canvas limitado e centralizado','--design-width:1024px'in css and('width:min(100%,var(--design-width))'in css or('width:calc(1024 * var(--u));max-width:100%'in css))and'margin-inline:auto'in css)
check('Unidade CSS com teto','--u:min(1px,calc(100vw / 1024))'in css and('100svh'not in css or'--u:min(1px,calc(100vw / 1024),calc(100svh / 760))'in css))
check('Nenhum multiplicador pelo board de 760 px',not re.search(r'100vw\s*/\s*(?:760|752)|innerWidth\s*/\s*(?:760|752)',css+js))
check('Teto do título fixado','font-size:calc(76 * var(--u))'in css)
check('Larguras de foto e macro explícitas','width:calc(560 * var(--u))'in css and'width:calc(740 * var(--u))'in css)
hero_rules=re.findall(r'\.hero-portrait(?: img)?\{([^}]*)\}',css);macro_rules=re.findall(r'\.menu-macro\{([^}]*)\}|\.macro-viewport\{([^}]*)\}',css)
check('Hero e macro sem cover',all('cover'not in x for x in hero_rules)and all('cover'not in ''.join(x)for x in macro_rules))
check('Fotos principais com altura natural',any('height:auto'in x for x in hero_rules)and'height:auto'in ''.join(''.join(x)for x in macro_rules))
check('Sem palco hero de uma tela','100vh'not in ''.join(re.findall(r'\.hero-canvas\{([^}]*)\}',css)))
check('Mobile com reflow próprio','@media(max-width:720px)'in css and'grid-template-columns:1fr'in css and'font-size:clamp(36px,9.4vw,58px)'in css)
font=TTFont(ROOT/'fonts/Caprasimo-Regular.ttf');cm=font.getBestCmap();em=font['head'].unitsPerEm;scale_rows=[]
for w in (375,768,1024,1440,1920):
    mobile=w<=720;s=min(1,w/1024);size=max(36,min(w*.094,58))if mobile else 76*s;portrait=430 if mobile else 560*s;macro_width=610 if mobile else 740*s
    available=w-44 if mobile else 560*s
    widths=[sum(font['hmtx'][cm[ord(c)]][0]for c in text)/em*size-.025*size*(len(text)-1)for text in ('HIER','SCHMECKT','DAS LEBEN.')]
    check('Métrica do título em '+str(w),max(widths)<=available,f'{max(widths):.1f}px estimados / {available:.1f}px; não é navegador')
    if w>=1024:check('Tamanho desktop estável em '+str(w),(size,portrait,macro_width)==(76,560,740))
    scale_rows.append({'viewport':w,'canvas':min(w,1024),'hero_title':size,'hero_portrait':portrait,'menu_macro':macro_width,'max_title_line_estimated':round(max(widths),2)})
(ROOT/'docs/scale-measurements.json').write_text(json.dumps({'kind':'static font and CSS-contract calculations, not browser DOM measurement','rows':scale_rows},indent=2)+'\n')

for e in json.loads((ROOT/'docs/source-photo-inventory.json').read_text()):check('Original preservado: '+e['name'],sha(ROOT/'images/originals'/e['name'])==e['sha256'])
for e in json.loads((ROOT/'docs/source-video-inventory.json').read_text()):check('Vídeo original preservado: '+Path(e['file']).name,sha(ROOT/'site/videos'/Path(e['file']).name)==e['sha256'])
for f in (ROOT/'site/photos').glob('*.webp'):
    try:
        with Image.open(f) as im:im.load();valid=im.width>300 and im.height>300
        check('Foto/poster decodifica: '+f.name,valid)
    except Exception as e:check('Foto/poster decodifica: '+f.name,False,str(e))
with Image.open(ROOT/'brand/Al-Volo-Logo-Original-Transparente.png') as im:
    im.load();check('Logo PNG RGBA transparente',im.mode=='RGBA'and im.size==(1000,1000)and im.getchannel('A').getextrema()==(0,255))
check('Logo original sem redesenho',sha(ROOT/'brand/Al-Volo-Logo-Original-Transparente.png')=='029830a4a547536bae1882a13f94da39f57b37cbf117b8747568e51c32bc8cc5')
check('Logo pública igual à de marca',sha(ROOT/'brand/Al-Volo-Logo-Original-Transparente.png')==sha(ROOT/'site/brand/logo-original.png'))
for entry in json.loads((ROOT/'docs/font-sources.json').read_text()):check('Fonte oficial: '+entry['name'],sha(ROOT/'fonts/originals'/entry['name'])==entry['sha256'])
check('Quatro WOFF locais',len(list((ROOT/'site/fonts').glob('*.woff')))==4)
for f in (ROOT/'site/fonts').glob('*.woff'):
    font=TTFont(f);check('Glifos alemães: '+f.name,all(ord(c)in font.getBestCmap()for c in'äöüÄÖÜß–’'))
for family in ('Caprasimo','DMSans'):check('Licença OFL: '+family,'SIL OPEN FONT LICENSE'in(ROOT/'site/fonts'/f'{family}-OFL.txt').read_text())
asset_errors=[e['path']for e in json.loads((ROOT/'docs/asset-manifest.json').read_text())if sha(ROOT/e['path'])!=e['sha256']];check('Hashes dos assets correspondem',not asset_errors,str(asset_errors))
check('Nenhum arquivo vazio',all(f.stat().st_size>0 for f in ROOT.rglob('*')if f.is_file()))
check('Seis roteiros incluídos',len(list((ROOT/'roteiros').glob('*.md')))==6)
check('Regra reutilizável incluída',(ROOT/'process/BASE-DE-ESCALA-1024.md').is_file()and(ROOT/'process/REGRAS-PARA-PROXIMOS-PROJETOS.md').is_file())
guide=HTML((ROOT/'GUIA-VISUAL.html').read_text());missing=[]
for _,a in guide.nodes:
    for key in ('src','href'):
        value=a.get(key,'');u=urlsplit(value)
        if value and not u.scheme and u.path and not(ROOT/unquote(u.path)).is_file():missing.append(value)
check('Links do guia resolvem',not missing,str(missing))
fail=[x for x in checks if not x['pass']]
# Resultado do QA de navegador (scripts/qa.mjs, Playwright), quando existir.
bqa_file=ROOT/'docs/browser-qa.json';bqa=json.loads(bqa_file.read_text())if bqa_file.is_file()else None
browser_qa=('PASS'if bqa and not bqa['failed']else'FAIL')+f" {bqa['passed']}/{bqa['checks']} ({bqa['date']})"if bqa else'UNVERIFIED'
result={'date':'2026-11-06','status':'PASS'if not fail else'FAIL','checks':len(checks),'passed':len(checks)-len(fail),'failed':len(fail),'browser_qa':browser_qa,'browser_reason':'scripts/qa.mjs in Chromium (Playwright): density gates at '+', '.join(bqa['windows'])+', overflow, console errors, every dialog and link, motion on/off, visible copy scan. External services blocked during QA; only their URLs were checked.'if bqa else'No browser QA file (docs/browser-qa.json).','scale_verification':'CSS contract, font metrics and DOM measurement in the browser QA'if bqa else'CSS contract and font metrics only','external_services':'Configured original destinations. No reservation/order submitted.','results':checks}
(ROOT/'docs/QA.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
browser_lines=['## Navegador','',f"**{browser_qa}.** `scripts/qa.mjs` (Playwright/Chromium) mede no DOM as cenas em telas reais ({', '.join(bqa['windows'])}), overflow, erros de console, tamanhos mínimos de texto, fotos acima dos próprios pixels, todos os diálogos (carta e busca, DISH, GezerView, mapa, vídeos, galeria, configurações), links oficiais, movimento ligado/pausado e textos visíveis. Serviços externos ficam bloqueados no teste: só os destinos são conferidos. Resultados em `browser-qa.json`.",'']if bqa else[]
summary=['# QA — Al Volo / Momenti Veri','',f"**{result['status']} — {result['passed']}/{len(checks)} verificações estáticas aprovadas.** 06/11/2026.",'']+browser_lines+['','Cobertura: modelo e cenas, links locais, ARIA, sintaxe JS, carta/seleção, originais, canal alfa, fontes/licenças, hashes e regra de escala. Resultados por verificação em `QA.json`.','','## Escala','', 'Base 1024, escala desktop máxima 1. Título 76 px, pessoa 560 px e macro 740 px em 1024/1440/1920. Foram calculadas métricas da fonte para 375, 768, 1024, 1440 e 1920 px. Os valores estão em `scale-measurements.json`. As medições de DOM em navegador ficam no QA de navegador.','','## Limites reais','', ('O QA de navegador não envia reservas, pedidos nem mensagens e não carrega DISH, GezerView ou Maps de verdade: confere que cada um abre atrás do aviso de consentimento e aponta para o destino original.'if bqa else'**Navegador NÃO VERIFICADO.** Rode `npm run dev` e `npm run qa` para gerar `browser-qa.json`. O roteiro 06 contém as verificações pendentes.'),'','DISH e outros serviços usam os destinos originais. HTTP 200, quando registrado em `service-http-checks.json`, comprova somente acesso de rede. Não foi enviada reserva, pedido, avaliação ou mensagem. Promoção e páginas legais permanecem nos links oficiais e suas rotas devem ser conservadas na migração.','','A imagem em `references/` é a prancha aprovada, não screenshot do site. Não houve publicação.']
if fail:summary+=['','## Falhas']+['- '+x['name']+': '+x['detail']for x in fail]
(ROOT/'docs/QA.md').write_text('\n'.join(summary)+'\n')
print(json.dumps({k:result[k]for k in('status','checks','passed','failed','browser_qa')},ensure_ascii=False))
for e in fail:print(e['name'],e['detail'])
sys.exit(bool(fail))
