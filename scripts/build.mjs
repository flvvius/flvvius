import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';
import MarkdownIt from 'markdown-it';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const assets = join(root, 'assets');
const fontBytes = readFileSync(join(assets, 'fonts/Schoolbell-Regular.ttf'));
const font = opentype.parse(fontBytes.buffer.slice(fontBytes.byteOffset, fontBytes.byteOffset + fontBytes.byteLength));
const { colors: { paper: p } } = JSON.parse(readFileSync(join(assets, 'personal-room.tokens.json')));
const ink = p.foreground, paper = p.background, warm = p.material, accent = p.accent;
const pen = `fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"`;
function word(s, x, y, size, fill = ink, rotation = 0) {
  const path = font.getPath(s, x, y, size).toPathData(2);
  return `<g${rotation ? ` transform="rotate(${rotation} ${x} ${y})"` : ''}><path fill="${fill}" stroke="none" d="${path}"/></g>`;
}
function canvas(w, h, title, content) {
  let grain = '';
  for (let i = 0; i < 330; i++) {
    const x = (i * 733 + 31) % w, y = (i * 193 + 7) % h;
    grain += `<path d="M${x} ${y}h${i % 3 + 1}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${title}</title><rect width="${w}" height="${h}" fill="${paper}"/><g stroke="${ink}" opacity=".07">${grain}</g>${content}</svg>\n`;
}
function vinyl(x, y, r) {
  return `<g ${pen}><circle cx="${x}" cy="${y}" r="${r}" fill="${ink}"/>${[.88,.76,.64].map(f=>`<circle cx="${x}" cy="${y}" r="${r*f}" stroke="${warm}" opacity=".35" stroke-width="1.3"/>`).join('')}<circle cx="${x}" cy="${y}" r="${r*.29}" fill="${accent}" stroke="${accent}"/><circle cx="${x}" cy="${y}" r="3" fill="${paper}" stroke="none"/></g>`;
}
const turntable = `<g transform="translate(775 133) rotate(5 145 128)" ${pen}>
  <path d="M10 17Q8 10 18 9L274 12Q286 12 286 22L283 239Q283 248 273 248L18 244Q9 244 10 233Z" fill="${warm}"/>
  <circle cx="116" cy="119" r="92"/>
  ${vinyl(116,119,85)}
  <path d="M234 67L183 150l-9-6 51-83Z" fill="${paper}"/>
  <circle cx="235" cy="58" r="14" fill="${warm}"/>
  <circle cx="235" cy="58" r="5" fill="${ink}"/>
  <path d="M181 141l-12 19 11 7 12-19Z" fill="${warm}"/>
  <path d="M170 158l-3 9M239 46l12-14"/>
  <circle cx="255" cy="28" r="8" fill="${warm}"/>
  <path d="M220 214h42v15h-42Z M241 214v15M24 221l12-12M28 228l12-12M255 189l10-10M258 196l10-10"/>
</g>`;
const newspaper = `<g transform="translate(668 59) rotate(-9 80 92)" ${pen}>
  <path d="M10 13L164 8l4 169-157 5Z" fill="${paper}"/>
  <path d="M10 27L-2 32l6 155 154-5M24 71l123-3M25 76l123-2"/>
  ${word('miez.news',24,58,33)}
  <path d="M25 88l54-2 2 38-54 3Z" fill="${warm}"/>
  <path d="M90 88l58-2M90 98l54-1M90 108l57-2M90 119l49-1M26 140l122-4M26 149l114-3M26 158l119-3" opacity=".55"/>
</g>`;
const coffee = `<g transform="translate(1051 327) rotate(-4 40 40)" ${pen}>
  <path d="M8 12l68 1-7 51Q65 74 52 74H29Q17 73 15 61Z" fill="${paper}"/>
  <path d="M76 22Q106 15 106 38Q106 57 73 56M3 78Q41 90 88 80M30-1Q17-13 28-23M48-2Q36-15 48-30"/>
</g>`;
writeFileSync(join(assets,'desk.svg'),canvas(1200,280,'hi, i\'m flavius. My corner of the internet.',
  word('flavius cojocaru / bucharest',62,44,24,p['muted-foreground'])+
  word("hi, i'm flavius.",55,162,112)+
  `<path d="M63 181Q247 191 655 182" stroke="${accent}" stroke-width="4" stroke-linecap="round" fill="none"/>`+
  word('software, AI & business.',62,241,36)+
  `<g transform="translate(270 -35) scale(.68)">`+newspaper+turntable+coffee+
  `<g ${pen}><path d="M649 409Q851 405 1100 411M750 415l38 1M943 416l22 1" opacity=".55"/></g>`+
  word('pull up a chair.',884,89,27,p['accent-text'],-5)+
  `<path d="M999 104Q1036 112 1049 145m-10-8 10 8 2-14" fill="none" stroke="${p['accent-text']}" stroke-width="2" stroke-linecap="round"/>`+
  `</g>`
));

const plant = `<g transform="translate(835 33)" ${pen}>
  <path d="M26 174l96 1-13 68-70-1Z" fill="${warm}"/>
  <path d="M21 174l107 1 1 12-111-2Z" fill="${paper}"/>
  <path d="M75 173Q81 105 69 51M74 126Q25 126 17 84Q59 82 74 126ZM76 103Q125 100 134 58Q93 59 76 103Z"/>
  <path d="M70 75Q32 61 39 22Q76 34 70 75ZM78 151Q106 151 122 130M44 215l12-13M50 226l15-17M60 228l13-15"/>
</g>`;
const phone = `<g transform="translate(694 47) rotate(-5 65 106)" ${pen}>
  <path d="M17 4l105-2Q135 2 135 16l2 205Q137 233 124 234l-104 2Q7 236 7 222L5 17Q5 4 17 4Z" fill="${paper}"/>
  <path d="M41 17h58M15 31l111-1 2 168-112 1ZM59 220h26"/>
  <path d="M33 63l74-1 1 44-56 1-15 10 1-10h-5Z" fill="${warm}"/>
  <path d="M45 78h50M45 88h36" opacity=".6"/>
  <path d="M32 140l47-1M32 152l62-1M32 164h55M95 140l11-12 13 12M109 129v26"/>
</g>`;
writeFileSync(join(assets,'agrobot.svg'),canvas(1200,320,'Agro-Bot. Useful answers, already on WhatsApp.',
  word('already on WhatsApp.',61,109,57)+word('out in the field.',61,182,64)+
  word('a photo of a plant. a place to start.',64,256,29,p['muted-foreground'])+
  plant+phone+
  `<path d="M847 279Q932 284 1070 277" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`+
  `<path d="M537 157Q615 142 665 155m-12-9 12 9-13 7" fill="none" stroke="${p['accent-text']}" stroke-width="2" stroke-linecap="round"/>`
));

const notebook = `<g transform="translate(780 40) rotate(5 140 120)" ${pen}>
  <path d="M7 13l267-4 3 239-267 2Z" fill="${warm}"/>
  <path d="M3 5l132-5 134 4 2 236-133 3L5 237Z" fill="${paper}"/>
  <path d="M135 0l3 243M17 32l105-3M18 40l97-3M18 168l106 2M18 181l87 2M18 194l97 2" opacity=".55"/>
  ${word('one pen.',21,105,35)}${word('your taste.',21,140,31)}
  <path d="M168 37l69 1-2 29-69-1Z" fill="${warm}"/>
  <path d="M168 88l69 1-2 29-69-1Z" fill="#0b2851"/>
  <path d="M168 138l69 1-2 29-69-1Z" fill="${accent}"/>
  <path d="M190 211q18-11 37-7" stroke="${accent}" stroke-width="3"/>
  <path d="M283 219l37-184 10 2-36 184-9 15Z" fill="${warm}"/>
  <path d="M321 35l4-17 8 1-3 18M285 236l1 5"/>
</g>`;
writeFileSync(join(assets,'design-taste.svg'),canvas(1200,320,'Flavius design taste. For agents with a brief and a point of view.',
  word('yes, the details matter.',61,113,57)+word('i wrote mine down.',61,186,61)+
  word('two design skills, made to be used.',64,257,29,p['muted-foreground'])+notebook
));

const miezFrame = canvas(1200,618,'miez.news. Many sources, one place to read.',
  word('on my desk lately',49,53,28,p['muted-foreground'])+
  word('miez.news',895,54,34)+
  `<rect x="50" y="90" width="1100" height="434" fill="${warm}"/><path d="M49 89L1150 91l-1 433-1100 1Z" ${pen}/>`+
  word('many sources. one place to read.',50,581,37)+
  `<path d="M977 568q54-11 116-3m-13-7 13 7-13 9" fill="none" stroke="${p['accent-text']}" stroke-width="2.1" stroke-linecap="round"/>`
);
const miezShot = await sharp(join(assets,'sources/miez-live.png')).extract({left:0,top:0,width:1280,height:505}).resize(1100,434).toBuffer();
await sharp(Buffer.from(miezFrame)).composite([{input:miezShot,left:50,top:90}]).webp({quality:92}).toFile(join(assets,'miez.webp'));

const priceleFrame = canvas(1200,425,'Pricele. How much could it cost?',
  word('how much',49,133,67)+word('could it cost?',49,212,67)+
  word('a little daily reality check.',53,292,28,p['muted-foreground'])+
  `<path d="M51 231Q173 240 362 232" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>`
);
const priceleShot = await sharp(join(assets,'sources/pricele-og.jpg')).resize(710,373).toBuffer();
await sharp(Buffer.from(priceleFrame)).composite([{input:priceleShot,left:462,top:26}]).webp({quality:93}).toFile(join(assets,'pricele.webp'));

const md = new MarkdownIt({html:true});
const html = md.render(readFileSync(join(root,'README.md'),'utf8'));
const css = readFileSync(join(root,'node_modules/github-markdown-css/github-markdown.css'),'utf8');
mkdirSync(join(root,'.preview'),{recursive:true});
writeFileSync(join(root,'.preview/index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Flavius · GitHub profile preview</title><base href="../"><style>${css}\nbody{margin:0;background:var(--bgColor-default,#fff);color:var(--fgColor-default,#1f2328)}.markdown-body{box-sizing:border-box;max-width:896px;margin:32px auto;padding:32px;border:1px solid var(--borderColor-default,#d1d9e0);border-radius:6px}@media(max-width:600px){.markdown-body{margin:0;padding:20px 16px;border:0}}.markdown-body img{max-width:100%;height:auto}.markdown-body a:focus-visible{outline:2px solid #0969da;outline-offset:3px}</style></head><body><article class="markdown-body">${html}</article></body></html>`);
for (const name of ['desk','agrobot','design-taste']) {
  await sharp(join(assets,`${name}.svg`)).png().toFile(join(root,'.preview',`${name}.png`));
}
console.log('Built three original vector illustrations, two product previews and a GitHub-style HTML preview.');
