interface TemplateVariable {
  name: string;
  defaultValue?: string;
}

export function extractVariables(template: string): TemplateVariable[] {
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const vars: TemplateVariable[] = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    vars.push({ name: match[1].toLowerCase() });
  }
  return vars;
}

export function renderTemplate(template: string, data: Record<string, string | number | undefined>): string {
  // Strip HTML tags to prevent basic injection
  const sanitize = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '';
    return String(val).replace(/<[^>]*>?/gm, '');
  };

  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/gi;
  return template.replace(regex, (match, varName) => {
    const lowerName = varName.toLowerCase();
    const value = data[lowerName] ?? data[varName];
    if (value === undefined) {
      return match;
    }
    return sanitize(value);
  });
}

export function validateTemplate(template: string, data: Record<string, string | number | undefined>): { isValid: boolean; errors: string[]; missingVars: string[] } {
  const vars = extractVariables(template);
  const missingVars: string[] = [];
  const errors: string[] = [];
  
  vars.forEach(v => {
    if (data[v.name] === undefined && data[v.name.toUpperCase()] === undefined && data[v.name.toLowerCase()] === undefined) {
      if (!missingVars.includes(v.name)) {
        missingVars.push(v.name);
      }
    }
  });

  if (missingVars.length > 0) {
    errors.push(`Missing values for variables: ${missingVars.join(', ')}`);
  }

  return {
    isValid: missingVars.length === 0,
    errors,
    missingVars,
  };
}

export function previewTemplate(template: string, sampleData?: Record<string, string>): string {
  const data = sampleData || {
    first_name: 'John',
    last_name: 'Doe',
    balance: '100.00',
    company: 'Acme Corp',
    date: new Date().toISOString().split('T')[0],
    custom_field: 'SampleData',
  };
  return renderTemplate(template, data);
}
