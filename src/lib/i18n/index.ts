import type { LanguageMeta, TranslationDictionary } from './types';
import { DICTIONARIES, SUPPORTED_LANGUAGES, enDictionary } from './dictionaries';

export * from './types';
export * from './dictionaries';

export function getLanguageMeta(code: string): LanguageMeta {
  const normalized = (code || 'EN').toUpperCase();
  return SUPPORTED_LANGUAGES.find((l) => l.code === normalized) || SUPPORTED_LANGUAGES[0];
}

export function getDictionary(lang: string = 'EN'): TranslationDictionary {
  const normalized = (lang || 'EN').toUpperCase();
  return DICTIONARIES[normalized] || enDictionary;
}

export function formatString(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}
