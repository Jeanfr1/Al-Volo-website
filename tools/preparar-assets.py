#!/usr/bin/env python3
"""Exporta fotos e fontes incluídas; nunca altera os originais."""
from pathlib import Path
from io import BytesIO
import shutil,subprocess
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
ROOT=Path(__file__).resolve().parents[1]
def atomic_bytes(destination,data):
    if not data:raise ValueError('Empty export: '+str(destination))
    temp=destination.with_suffix(destination.suffix+'.tmp');temp.write_bytes(data);temp.replace(destination)
for source in (ROOT/'images/originals').glob('*.webp'):
    with Image.open(source) as image:
        image.load();image.thumbnail((1800,1800));buffer=BytesIO();image.save(buffer,format='WEBP',quality=89,method=6)
    data=buffer.getvalue()
    with Image.open(BytesIO(data)) as verified:verified.load()
    atomic_bytes(ROOT/'site/photos'/source.name,data)
for family in ('Caprasimo','DMSans'):
    shutil.copyfile(ROOT/'fonts/originals'/f'{family}-OFL.txt',ROOT/'site/fonts'/f'{family}-OFL.txt')
font=TTFont(ROOT/'fonts/originals/Caprasimo-Regular.ttf');font.flavor='woff';font.save(ROOT/'site/fonts/Caprasimo-Regular.woff')
shutil.copyfile(ROOT/'fonts/originals/Caprasimo-Regular.ttf',ROOT/'fonts/Caprasimo-Regular.ttf')
for weight,name in ((400,'Regular'),(600,'SemiBold'),(700,'Bold')):
    font=instantiateVariableFont(TTFont(ROOT/'fonts/originals/DMSans-Variable.ttf'),{'wght':weight,'opsz':16},inplace=False)
    font.save(ROOT/'fonts'/f'DMSans-{name}.ttf');font.flavor='woff';font.save(ROOT/'site/fonts'/f'DMSans-{name}.woff')
for n in (1,2,3):
    source=ROOT/'site/videos'/f'video-{n}-alvolo.mp4'
    result=subprocess.run(['ffmpeg','-v','error','-ss','0.4','-i',str(source),'-frames:v','1','-f','image2pipe','-vcodec','png','-'],check=True,capture_output=True)
    with Image.open(BytesIO(result.stdout)) as image:
        output=BytesIO();image.save(output,format='WEBP',quality=92,method=6)
    atomic_bytes(ROOT/'site/photos'/f'reel-{n}.webp',output.getvalue())
print('Fotos, quatro WOFF, licenças e três posters exportados com verificação de bytes.')
