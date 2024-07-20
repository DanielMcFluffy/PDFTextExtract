import { getDocument } from "pdfjs-dist";
import { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";
import { Medicine, MedicineDetails, MedicineName } from "./lib/models/medicine";

const extractText = async(pdfUrl: string): Promise<TextContent[]> => {
  const pdf = getDocument(pdfUrl).promise;
  const textContentPromises = [];
  const parsedPdf = await pdf;
  for (let i = 36; i <= 1000; i++) {
    const page = await parsedPdf.getPage(i);
    const pageContent = await page.getTextContent();
    textContentPromises.push(pageContent)
    // console.log(pageContent);
  }
  return textContentPromises;
} 

const scanPdf = async() => {
  const now = Date.now();
  console.log(now);
  try {
    const textContentCollection = await extractText('vet-handbook.pdf');
    // console.log(textContentCollection);
      const totalStr: (string[])[] = []; 
    for (const textContent of textContentCollection) {
      const strInner: string[] = [];
      for (const textItem of textContent.items) {
        const item = textItem as TextItem;
        strInner.push(item.str)
      }
      totalStr.push(strInner)
    }

    const formattedStr = totalStr.join('')

    const regexName = /([A-Z\s]+),,\(([^)]+-[^)]+)\).*?([A-Z\s\/]+),,Prescriber/g;

    const regexDetail = /,,Uses\/Indications,,(.*?)(?=,,Pharmacology\/Actions,,),,Pharmacology\/Actions,,(.*?)(?=,,Pharmacokinetics,,),,Pharmacokinetics,,(.*?)(?=,,Contraindications\/Precautions\/Warnings,,),,Contraindications\/Precautions\/Warnings,,(.*?)(?=,,Adverse Effects,,),,Adverse Effects,,(.*?)(?=,,Reproductive\/Nursing Safety,,),,Reproductive\/Nursing Safety,,(.*?)(?=,,Overdosage\/Acute Toxicity,,)/g;

    const regexDetail_1 = /,,Uses\/Indications,,(.*?)(?=,,Pharmacology\/Actions,,)/g;
    const regexDetail_2 = /,,Pharmacology\/Actions,,(.*?)(?=,,Pharmacokinetics,,)/g;
    const regexDetail_3 = /,,Pharmacokinetics,,(.*?)(?=,,Contraindications\/Precautions\/Warnings,,)/g;
    const regexDetail_4 = /,,Contraindications\/Precautions\/Warnings,,(.*?)(?=,,Adverse Effects,,)/g;
    const regexDetail_5 = /,,Adverse Effects,,(.*?)(?=,,Reproductive\/Nursing Safety,,)/g;
    const regexDetail_6 = /Reproductive\/Nursing Safety,,(.*?)(?=,,Overdosage\/Acute Toxicity,,)/g
    
    const nameMatches = [...formattedStr.matchAll(regexName)];
    const detailMatches = [...formattedStr.matchAll(regexDetail)];

    const rd_1 = [...formattedStr.matchAll(regexDetail_1)]; const detailList_1: Partial<Record<MedicineDetails, string>>[] = [];
    const rd_2 = [...formattedStr.matchAll(regexDetail_2)]; const detailList_2: Partial<Record<MedicineDetails, string>>[] = [];
    const rd_3 = [...formattedStr.matchAll(regexDetail_3)]; const detailList_3: Partial<Record<MedicineDetails, string>>[] = [];
    const rd_4 = [...formattedStr.matchAll(regexDetail_4)]; const detailList_4: Partial<Record<MedicineDetails, string>>[] = [];
    const rd_5 = [...formattedStr.matchAll(regexDetail_5)]; const detailList_5: Partial<Record<MedicineDetails, string>>[] = [];
    const rd_6 = [...formattedStr.matchAll(regexDetail_6)]; const detailList_6: Partial<Record<MedicineDetails, string>>[] = [];
    
    const medicineNameList: MedicineName[] = [];
    const medicineDetailList: Partial<Record<MedicineDetails, string>>[] = [];

    for (const match of nameMatches) {

      const medicineNameObj: MedicineName = {
        name:  match[1],
        pronounciation: match[2].replace(',', '').replace(',-', '-'),
        type: match[3].trim(),
      };

      medicineNameList.push(medicineNameObj);
    }
    
    for (const match of rd_1) {

      const detail: Partial<Record<MedicineDetails, string>> = {
        "Uses/Indications":  match[1],
      } as const;

      detailList_1.push(detail);
    }
    
    for (const match of rd_2) {

      const detail: Partial<Record<MedicineDetails, string>> = {
        "Pharmacology/Actions":  match[1],
      } as const;

      detailList_2.push(detail);
    }

    for (const match of rd_3) {

      const detail: Partial<Record<MedicineDetails, string>> = {
        "Pharmacokinetics":  match[1],
      } as const;

      detailList_3.push(detail);
    }

    for (const match of rd_4) {

      const detail: Partial<Record<MedicineDetails, string>> = {
        "Contraindications/Precautions/Warnings":  match[1],
      } as const;

      detailList_4.push(detail);
    }


    for (const match of rd_5) {

      const detail: Partial<Record<MedicineDetails, string>> = {
        "Adverse Effects":  match[1],
      } as const;

      detailList_5.push(detail);
    }

    for (const match of rd_6) {

      const detail: Partial<Record<MedicineDetails, string>> = {
        "Reproductive/Nursing Safety":  match[1],
      } as const;

      detailList_6.push(detail);
    }



    for (const match of detailMatches) {

        const medicineDetail: Partial<Record<MedicineDetails, string>> = {
        "Uses/Indications": match[1],
        "Pharmacology/Actions": match[2],
        "Pharmacokinetics": match[3],
        "Contraindications/Precautions/Warnings": match[4],
        "Adverse Effects": match[5],
      } as const;

      medicineDetailList.push(medicineDetail);
    }


    // for (let i = 0; i < Math.max(medicineDetailList.length, medicineNameList. length); i++) {
    //   console.log( medicineNameList[i], medicineDetailList[i] || 'NONE')
    // }

    console.log(medicineNameList.length, medicineDetailList.length);
    console.log(detailList_1.length);
    console.log(detailList_2.length);
    // console.log(detailList_3.length);
    // console.log(detailList_4.length);
    // console.log(detailList_5.length);
    // console.log(detailList_6.length);
    // console.log(formattedStr);
    console.log(Date.now());
  } catch (error) {
    console.error(error);
  }
}

scanPdf();

