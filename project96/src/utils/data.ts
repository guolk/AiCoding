
export const csvToJson = (csv: string): any[] => {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() || '';
    });
    result.push(obj);
  }
  
  return result;
};

export const jsonToCsv = (json: any[]): string => {
  if (json.length === 0) return '';
  
  const headers = Object.keys(json[0]);
  const csvLines = [headers.join(',')];
  
  for (const item of json) {
    const values = headers.map(header => {
      const val = item[header];
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    });
    csvLines.push(values.join(','));
  }
  
  return csvLines.join('\n');
};

export const filterData = (data: any[], key: string, value: string): any[] => {
  if (!value) return data;
  return data.filter(item => 
    String(item[key]).toLowerCase().includes(value.toLowerCase())
  );
};

export const sortData = (data: any[], key: string, ascending: boolean = true): any[] => {
  return [...data].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    
    if (valA < valB) return ascending ? -1 : 1;
    if (valA > valB) return ascending ? 1 : -1;
    return 0;
  });
};

