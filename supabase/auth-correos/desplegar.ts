/**
 * Despliega las plantillas de correo de Supabase Auth (Management API).
 *
 *   node --experimental-strip-types supabase/auth-correos/desplegar.ts            # solo comprueba y genera vistas previas
 *   node --experimental-strip-types supabase/auth-correos/desplegar.ts --aplicar  # además las sube
 *
 * Necesita SUPABASE_ACCESS_TOKEN (token personal: Dashboard → Account → Access Tokens).
 * Sin token solo genera las vistas previas en supabase/auth-correos/vista-previa/.
 *
 * Antes de subir guarda los asuntos y plantillas actuales en
 * supabase/auth-correos/copia-anterior.json (solo claves mailer_*, ningún secreto).
 * Solo modifica mailer_subjects_* y mailer_templates_*_content.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TIPOS, documento, plantillaSupabase } from './plantillas.ts';

const PROYECTO = 'zleqsdfpjepdangitcxv';
const API = `https://api.supabase.com/v1/projects/${PROYECTO}/config/auth`;
const DIR = dirname(fileURLToPath(import.meta.url));
const aplicar = process.argv.includes('--aplicar');

// 1. Vistas previas con valores de ejemplo (para revisar el diseño en el navegador)
const PREVIA = join(DIR, 'vista-previa');
mkdirSync(PREVIA, { recursive: true });
const ejemplo = (html: string) =>
  html
    .replace(/\{\{ if \.Data\.nombre \}\}(.*?)\{\{ else \}\}.*?\{\{ end \}\}/g, (_m, si: string) =>
      si.replace('{{ .Data.nombre }}', 'Ana'),
    )
    .replaceAll('{{ .ConfirmationURL }}', 'https://www.spanishnook.com/')
    .replaceAll('{{ .Token }}', '123456')
    .replaceAll('{{ .Email }}', 'ana@ejemplo.com')
    .replaceAll('{{ .NewEmail }}', 'ana.nueva@ejemplo.com');
for (const tipo of TIPOS) {
  for (const idioma of ['es', 'en'] as const) {
    writeFileSync(join(PREVIA, `${tipo}-${idioma}.html`), ejemplo(documento(tipo, idioma)));
  }
}
console.log(`Vistas previas en ${PREVIA}`);

// 2. Configuración nueva
const nueva: Record<string, string> = {};
for (const tipo of TIPOS) {
  const { asunto, html } = plantillaSupabase(tipo);
  nueva[`mailer_subjects_${tipo}`] = asunto;
  nueva[`mailer_templates_${tipo}_content`] = html;
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.log('Sin SUPABASE_ACCESS_TOKEN: no se consulta ni se sube nada.');
  process.exit(0);
}
const cabeceras = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

// 3. Copia de lo actual y comprobación de que los enlaces usan las variables estándar
const r = await fetch(API, { headers: cabeceras });
if (!r.ok) throw new Error(`GET config/auth: ${r.status} ${await r.text()}`);
const actual = (await r.json()) as Record<string, unknown>;
const copia = Object.fromEntries(Object.entries(actual).filter(([k]) => k.startsWith('mailer_')));
writeFileSync(join(DIR, 'copia-anterior.json'), JSON.stringify(copia, null, 2) + '\n');
console.log('Copia de las plantillas actuales en copia-anterior.json');

let avisos = 0;
for (const tipo of TIPOS) {
  const html = String(actual[`mailer_templates_${tipo}_content`] ?? '');
  const variable = tipo === 'reauthentication' ? '.Token' : '.ConfirmationURL';
  const estado = !html ? 'vacía (por defecto de Supabase)' : html.includes(variable) ? `usa {{ ${variable} }}` : `NO usa {{ ${variable} }}`;
  if (html && !html.includes(variable)) avisos++;
  console.log(`  ${tipo}: ${estado}; asunto actual: ${JSON.stringify(actual[`mailer_subjects_${tipo}`] ?? '')}`);
}
if (avisos) {
  console.log('\nAlguna plantilla actual construye el enlace a mano: revisar antes de sustituirla. No se sube nada.');
  process.exit(1);
}

if (!aplicar) {
  console.log('\nTodo correcto. Para subir las plantillas, repetir con --aplicar.');
  process.exit(0);
}

// 4. Subida
const p = await fetch(API, { method: 'PATCH', headers: cabeceras, body: JSON.stringify(nueva) });
if (!p.ok) throw new Error(`PATCH config/auth: ${p.status} ${await p.text()}`);
const despues = (await p.json()) as Record<string, unknown>;
const distintas = Object.keys(nueva).filter((k) => despues[k] !== nueva[k]);
if (distintas.length) throw new Error(`No coinciden tras subir: ${distintas.join(', ')}`);
console.log(`\nSubidas ${TIPOS.length} plantillas y asuntos. Comprobado: coinciden con las del repositorio.`);
