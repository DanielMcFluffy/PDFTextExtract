import { getDocument } from "pdfjs-dist";
import { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";
import { Medicine, MedicineDetails, MedicineName } from "./lib/models/medicine";

const extractIndex = async(pdfUrl: string): Promise<TextContent[]> => {
  const pdf = getDocument(pdfUrl).promise;
  const textContentPromises = [];
  const parsedPdf = await pdf;
  for (let i = 13; i <= 28; i++) {
    const page = await parsedPdf.getPage(i);
    const pageContent = await page.getTextContent();
    textContentPromises.push(pageContent)
  }
  return textContentPromises;
} 

const extractText = async(pdfUrl: string): Promise<TextContent[]> => {
  const pdf = getDocument(pdfUrl).promise;
  const textContentPromises = [];
  const parsedPdf = await pdf;
  for (let i = 36; i <= 1000; i++) {
    const page = await parsedPdf.getPage(i);
    const pageContent = await page.getTextContent();
    textContentPromises.push(pageContent)
  }
  return textContentPromises;
} 

const scanPdf = async() => {
  const now = Date.now();
  console.log(now);
  try {
    const indexContentCollection = await extractIndex('vet-handbook.pdf');
    // console.log(indexContentCollection);
      const totalIndex: (string[])[] = []; 
    for (const indexContent of indexContentCollection) {
      const strInner: string[] = [];
      for (const textItem of indexContent.items) {
        const item = textItem as TextItem;
        strInner.push(item.str)
      }
      totalIndex.push(strInner)
    }

    const formattedIndex = totalIndex.join('')
      .replace(/Contents,SYSTEMIC MONOGRAPHS,,/g, '')
      .replace(/,,/g, ', ')
      .replace(/,/g, ', ')
    //this gives the index
    const regexIndex = /\b[A-Z][a-z]*([-'\s][A-Z][a-z]*)*\b/g;

    const regexName = /([A-Z\s]+),,\(([^)]+-[^)]+)\).*?([A-Z\s\/]+)(?=((\)*),,)(Prescriber)*)/g;

    const nameMatches = [...formattedIndex.matchAll(regexName)];
    const indexMatches = [...formattedIndex.matchAll(regexIndex)];

    const medicineNameList: MedicineName[] = [];
    const medicineDetailList: Partial<Record<MedicineDetails, string>>[] = [];

    const medicineList: Medicine[] = []; 

    const textContentCollection = await extractText('vet-handbook.pdf');
    const totalText: (string[])[] = []; 
    for (const textContent of textContentCollection) {
      const strInner: string[] = [];
      for (const textItem of textContent.items) {
        const item = textItem as TextItem;
        strInner.push(item.str)
      }
      totalText.push(strInner)
    }  
    //format this to be used in the indexmatch loop
    const formattedText = totalText.join(''); //raw text 
      

    for(const indexMatch of indexMatches) {

    }
    
    console.log(formattedIndex);
    console.log(Date.now());
  } catch (error) {
    console.error(error);
  }
}

scanPdf();

