import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const html = readFileSync(join(root, 'index.html'), 'utf8')
  .replaceAll('./public/favicon.svg', '/favicon.svg')
  .replaceAll('./public/Anurag_Singh_Resume.pdf', '/Anurag_Singh_Resume.pdf')
  .replaceAll('./public/resume.json', '/resume.json');

const script = readFileSync(join(root, 'script.js'), 'utf8')
  .replaceAll('./public/Anurag_Singh_Resume.pdf', '/Anurag_Singh_Resume.pdf')
  .replaceAll('./public/resume.json', '/resume.json');

writeFileSync(join(dist, 'index.html'), html);
copyFileSync(join(root, 'style.css'), join(dist, 'style.css'));
writeFileSync(join(dist, 'script.js'), script);

const publicDir = join(root, 'public');
for (const fileName of ['favicon.svg', 'resume.json', 'Anurag_Singh_Resume.pdf']) {
  const source = join(publicDir, fileName);
  const target = join(dist, fileName);
  if (existsSync(source)) {
    copyFileSync(source, target);
  }
}
