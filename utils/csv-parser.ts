// CSV parsing utilities for FitTrack Pro data import

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export function parseCSV(content: string): ParsedCSV {
  const lines = content.trim().split(/\r?\n/);
  const errors: string[] = [];

  if (lines.length < 2) {
    return { headers: [], rows: [], errors: ['CSV file must have a header row and at least one data row'] };
  }

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseLine(line);
    if (values.length !== headers.length) {
      errors.push(`Row ${i}: Expected ${headers.length} columns, got ${values.length}`);
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx].trim();
    });
    rows.push(row);
  }

  return { headers, rows, errors };
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function generateCSV(headers: string[], rows: Record<string, string | number>[]): string {
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) =>
    headers.map((h) => {
      const val = String(row[h] ?? '');
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
}

export type ImportDataType = 'activities' | 'workouts' | 'weight' | 'nutrition' | 'blood_pressure';

export function validateImportData(type: ImportDataType, headers: string[]): string | null {
  const requiredHeaders: Record<ImportDataType, string[]> = {
    activities: ['type', 'duration', 'distance', 'calories'],
    workouts: ['name', 'category', 'duration', 'calories'],
    weight: ['date', 'weight'],
    nutrition: ['date', 'meal_name', 'calories'],
    blood_pressure: ['date', 'time_slot', 'systolic', 'diastolic', 'pulse'],
  };

  const required = requiredHeaders[type];
  const missing = required.filter((h) => !headers.includes(h));

  if (missing.length > 0) {
    return `Missing required columns: ${missing.join(', ')}`;
  }
  return null;
}
