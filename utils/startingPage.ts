import { extractText, extractTitleFromIndex } from "..";
import pageText from "./pageText";

/**
 * 
 * @param startPage starting from which page to search the medicine subsections -- just use 1
 * @param endPage where to end the search 
 * @returns a set of starting pages for the medicine subsections
 */
const startingPage = async(startPage: number, endPage: number) => {
  const text = await extractText(startPage, endPage); //this text collection will have the running total of all page content including its page number //find a way to match the indexRegex and output the page number that correspond to the match
  //loop the below expression and compare it with the regex, once found, that would be the starting page -- important
  const strPages = await pageText(startPage, endPage);

  const indexCollection = await extractTitleFromIndex();

  let startingPages = new Set<number>(); //using set to avoid duplicates

  for (const index of indexCollection) {
    for (const page of strPages) {
      if (
        page.includes(index[0]) && 
        page.includes('Prescriber') ||
        page.includes('Highlights') 
      ) {
        startingPages.add(strPages.indexOf(page) + 1);
      }
    }
  }
  return startingPages
}

export default startingPage;