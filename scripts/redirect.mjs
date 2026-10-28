import { writeFileSync } from 'node:fs';
// корень сайта ведёт на актуальную версию
writeFileSync('dist/index.html', '<!doctype html><meta charset=utf-8><meta http-equiv="refresh" content="0;url=/potok-site/v2/"><title>Поток</title>');
