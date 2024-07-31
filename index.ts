import { getDocument } from "pdfjs-dist";
import { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";
import { Medicine, MedicineDetails, MedicineName } from "./lib/models/medicine";

const extractRegexFromIndex = async(pdfUrl: string) => {
  const pdf = getDocument(pdfUrl).promise;
  const indexContentCollection = [];
  const parsedPdf = await pdf;

  for (let i = 13; i <= 28; i++) {
    const page = await parsedPdf.getPage(i);
    const pageContent = await page.getTextContent();
    indexContentCollection.push(pageContent)
  }
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
      .replace(/APPENDIX,  Ophthalmic Products,  Routes of Administration for Ophthalmic Drugs,  Diagnostic Agents, Fluorescein Sodium, Lissamine Green, Phenol Red Thread,  Rose Bengal/g, '')
      //this gives the index

    const indexRegex = /[^,\s]+(?:\s[^,\s]+)*/g;

    return [...formattedIndex.matchAll(indexRegex)]
} 

const extractText = async(pdfUrl: string, start: number, end: number): Promise<TextContent[]> => {
  const pdf = getDocument(pdfUrl).promise;
  const textContentPromises = [];
  const parsedPdf = await pdf;
  for (let i = start; i <= end; i++) {
    const page = await parsedPdf.getPage(i);
    const pageContent = await page.getTextContent();
    textContentPromises.push(pageContent)
  }
  return textContentPromises;
} 

//will be something to be looped over different indexRegex
//so each index corresponds to a page
//figure out the end of the medicine section via regex (e.g. references section)
//or maybe just find the first few subsection regex

const indexToPage = async(indexRegex: RegExp, startPage: number, endPage: number) => {
  const text = await extractText('vet-handbook.pdf', 1, 200); //this text collection will have the running total of all page content including its page number //find a way to match the indexRegex and output the page number that correspond to the match
  //loop the below expression and compare it with the regex, once found, that would be the starting page -- important

  const regexMedName = /.*\s+\(.+\)+.*(?=  Prescriber)/; //regex to be looped

  const strPages: string[] = [];//running total -- find a way to map the matched regex to the index of this array

  for (let i = (startPage - 1); i <= (endPage - 1); i++) {
    const strPage: string[] = [];

    text[i].items.forEach((x) => {
      const text = x as unknown as TextItem;
      strPage.push(text.str);
    })

    strPages.push(strPage.join(' '));
  }

  // strPages.forEach((pageText) => {

  // })

  console.log(strPages)
  
}


extractRegexFromIndex('vet-handbook.pdf');