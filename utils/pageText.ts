import { TextItem } from "pdfjs-dist/types/src/display/api";
import { extractText} from "..";

/**
 * 
 * @param startPage starting page of extracting string
 * @param endPage ending page of extracting string
 * @returns a promise of of an array of string, where each string represents the text for that page
 */
const pageText = async(startPage: number, endPage: number) => {
  const text = await extractText(startPage, endPage); 

  const strPages: string[] = [];

  for (let i = (startPage - 1); i <= (endPage - 1); i++) {
    const strPage: string[] = [];

    text[i].items.forEach((x) => {
      const text = x as unknown as TextItem;
      strPage.push(text.str);
    })
    strPages.push(strPage.join(' '));
  }
  return strPages;
}

export default pageText;
