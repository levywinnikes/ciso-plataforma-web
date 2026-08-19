export const ASSISTANT_SCREEN_HREFS = {
  "tela:inicio": "/admin",
  "tela:atrasados": "/admin?aba=atrasados",
  "tela:bloqueados": "/admin?aba=bloqueados",
  "tela:novo": "/admin/novo",
  "tela:clinicas": "/admin/clinicas",
  "tela:consultorios": "/admin/grupos-profissionais",
  "tela:usuarios": "/admin/usuarios",
  "tela:convenios": "/admin/convenios",
  "tela:nucleos": "/admin/nucleos",
  "tela:servicos": "/admin/servicos",
  "tela:cirurgias": "/admin/cirurgias",
  "tela:financeiro": "/admin/financeiro",
  "tela:relatorios": "/admin/financeiro",
} as const;

export type AssistantScreenCode = keyof typeof ASSISTANT_SCREEN_HREFS;

export function hrefForAssistantScreen(code: string): string | null {
  if (code in ASSISTANT_SCREEN_HREFS) {
    return ASSISTANT_SCREEN_HREFS[code as AssistantScreenCode];
  }
  return null;
}
