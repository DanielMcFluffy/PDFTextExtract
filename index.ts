import fs from 'fs';
import { getDocument } from "pdfjs-dist";
import { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";
import { Medicine } from "./lib/models/medicine";
import startingPage from "./utils/startingPage";
import pageText from "./utils/pageText";

 export const extractTitleFromIndex = async() => {
  const pdf = getDocument('vet-handbook.pdf').promise;
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

/**
 * 
 * @param start starting page to extract
 * @param end last page to extract text
 * @returns A promise of TextContent[]
 */
export const extractText = async(start: number, end: number): Promise<TextContent[]> => {
  const pdf = getDocument('vet-handbook.pdf').promise;
  const textContentPromises = [];
  const parsedPdf = await pdf;
  for (let i = start; i <= end; i++) {
    const page = await parsedPdf.getPage(i);
    const pageContent = await page.getTextContent();
    textContentPromises.push(pageContent)
  }
  return textContentPromises;
} 


/**
 * @startPage the starting page of extracting the medicine section
 * @endPage the ending page -- make sure it is past the last page of the section (e.g title page of a new medicine)
 * @returns returns an array of string that represents the medicine section
 */
const extractMedicineSection = async(startPage: number, endPage: number) => {

  const startingPages = Array.from(await startingPage(startPage, endPage));
  const textPages = await pageText(startPage, endPage);
  const medicineSections: string[] = [];

  for (let i = 0; i < startingPages.length; i++) {
    const startPage = startingPages[i];
    const endPage = startingPages[i + 1] - 1;
    const section: string[] = [];

    for(let j = startPage - 1; j <= endPage - 1; j++) {
      startPage && endPage && section.push(textPages[j]);
    };
    
    medicineSections.push(section.join(''));
  }

  return medicineSections.filter(x => Boolean(x)); //ignore empty string;
}


const medicineDetails = (medicineSections: string[]): Medicine[] => {

  const medicines: Medicine[] = [];

  const regexMedName = /.*\s+\(.+\)+.*(?=  Prescriber)/; //to be further broken down
  const section1Regex = /(?<=Uses\/Indications).*(?=Pharmacology\/Actions)/;
  const section2Regex = /(?<=Pharmacology\/Actions).*(?=Pharmacokinetics)/;
  const section3Regex = /(?<=Pharmacokinetics).*(?=Contraindications\/Precautions\/Warnings)/;
  const section4Regex = /(?<=Contraindications\/Precautions\/Warnings).*(?=Adverse Effects)/;
  const section5Regex = /(?<=Adverse Effects).*(?=Reproductive\/Nursing Safety)/;
  const section6Regex = /(?<=Reproductive\/Nursing Safety).*(?=Overdosage\/Acute Toxicity)/;
  const section7Regex = /(?<=Overdosage\/Acute Toxicity).*(?=Drug Interactions)/;

  for (const medicineSection of medicineSections) {
    const titleDetail = [...medicineSection.match(regexMedName) ?? []][0] ?? 'No Title';
    const medicineNameRegex = /.*(?=\s\s\()/;
    const pronounciationRegex = /(?<=\().*(?=\))/;
    const medicineTypeRegex = /(?<=\)\s).*/;

    const name = [...titleDetail.match(medicineNameRegex) ?? []][0] ?? 'No information provided';
    const pronounciation = [...titleDetail.match(pronounciationRegex) ?? []][0] ?? 'No information provided';
    const type = [...titleDetail.match(medicineTypeRegex) ?? []][0] ?? 'No information provided';
    const section1 = [...medicineSection.match(section1Regex) ?? []][0] ?? 'No information provided';
    const section2 = [...medicineSection.match(section2Regex) ?? []][0] ?? 'No information provided';
    const section3 = [...medicineSection.match(section3Regex) ?? []][0] ?? 'No information provided';
    const section4 = [...medicineSection.match(section4Regex) ?? []][0] ?? 'No information provided';
    const section5 = [...medicineSection.match(section5Regex) ?? []][0] ?? 'No information provided';
    const section6 = [...medicineSection.match(section6Regex) ?? []][0] ?? 'No information provided';
    const section7 = [...medicineSection.match(section7Regex) ?? []][0] ?? 'No information provided';
    
    const medicineDetail: Medicine = {
      name: {name, pronounciation, type},
      "Uses/Indications": section1,
      "Pharmacology/Actions": section2,
      "Pharmacokinetics": section3,
      "Contraindications/Precautions/Warnings": section4,
      "Adverse Effects": section5,
      "Reproductive/Nursing Safety": section6,
      "Overdosage/Acute Toxicity": section7,
    }

    medicines.push(medicineDetail);
  }
  return medicines;
}

extractMedicineSection(1, 4000).then(
  textSections => {
    const medicines = medicineDetails(textSections);
    const jsonContent = JSON.stringify(medicines, null, 2); // Convert to JSON string with indentation
    fs.writeFileSync('medicines.json', jsonContent, 'utf8'); // Write to file
    console.log('Medicines data has been written to medicines.json');
  }
)
