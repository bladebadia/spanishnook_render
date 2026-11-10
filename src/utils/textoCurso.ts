/**
 * Textos de un curso en el idioma de la web.
 *
 * Los cursos se escriben en español; la administradora puede añadir la traducción en
 * `textos_en` (columna jsonb). En inglés se usa la traducción si existe; si no, el español.
 */

export const CAMPOS_TRADUCIBLES = [
  'nombre_curso',
  'descripcion',
  'titulo_tarjeta',
  'texto_tarjeta',
  'boton_tarjeta',
  'texto_promo',
] as const;

export type CampoTraducible = (typeof CAMPOS_TRADUCIBLES)[number];
export type TextosEn = Partial<Record<CampoTraducible, string>>;

type CursoConTextos = Partial<Record<CampoTraducible, string | null>> & {
  textos_en?: TextosEn | null;
};

/** Texto del curso para el idioma (`locale` de vue-i18n: 'es-ES' | 'en-US'). */
export function textoCurso(curso: CursoConTextos, campo: CampoTraducible, locale: string): string {
  if (locale.startsWith('en')) {
    const en = curso.textos_en?.[campo];
    if (typeof en === 'string' && en.trim()) return en;
  }
  return curso[campo] ?? '';
}

/** Deja solo los campos con texto (para guardar en la BD). */
export function limpiarTextosEn(textos: TextosEn | null | undefined): TextosEn {
  const limpio: TextosEn = {};
  for (const campo of CAMPOS_TRADUCIBLES) {
    const valor = textos?.[campo]?.trim();
    if (valor) limpio[campo] = valor;
  }
  return limpio;
}
