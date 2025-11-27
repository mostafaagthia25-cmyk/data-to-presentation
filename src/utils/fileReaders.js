import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export async function readFileContent(file) {
  const fileType = file.name.split('.').pop().toLowerCase();
  
  switch(fileType) {
    case 'xlsx':
    case 'xls':
      return await readExcel(file);
    
    case 'csv':
      return await readCSV(file);
    
    case 'docx':
    case 'doc':
      return await readWord(file);
    
    case 'txt':
      return await readText(file);
    
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function readExcel(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
  
  // Convert to structured format
  const headers = jsonData[0];
  const rows = jsonData.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return {
    type: 'table',
    headers,
    rows,
    sheetName: workbook.SheetNames[0],
    fileName: file.name
  };
}

async function readCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          type: 'table',
          headers: results.meta.fields,
          rows: results.data,
          fileName: file.name
        });
      },
      error: (error) => reject(error)
    });
  });
}

async function readWord(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  return {
    type: 'document',
    text: result.value,
    fileName: file.name
  };
}

async function readText(file) {
  const text = await file.text();
  return {
    type: 'document',
    text,
    fileName: file.name
  };
}