export interface Template {
  id: string;
  name: string;
  data: import('../types/bulletin').BulletinData;
}

const STORAGE_KEY = 'mywardbulletin_templates';

function loadTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Template[] : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates: Template[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // ignore
  }
}

export const templateService = {
  listTemplates(): Template[] {
    return loadTemplates();
  },
  getTemplate(id: string): Template | undefined {
    return loadTemplates().find(t => t.id === id);
  },
  saveTemplate(name: string, data: import('../types/bulletin').BulletinData): Template {
    const templates = loadTemplates();
    const template = { id: `tmpl-${Date.now()}`, name, data } as Template;
    templates.push(template);
    saveTemplates(templates);
    return template;
  },
  deleteTemplate(id: string) {
    const templates = loadTemplates().filter(t => t.id !== id);
    saveTemplates(templates);
  },
  renameTemplate(id: string, name: string) {
    const templates = loadTemplates().map(t => t.id === id ? { ...t, name } : t);
    saveTemplates(templates);
  }
};

export default templateService;
