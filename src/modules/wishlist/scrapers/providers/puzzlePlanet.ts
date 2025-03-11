import ogs from "open-graph-scraper";
import { fetchAI } from "../../../../utils/fetchAI";
import { JSDOM } from "jsdom";

async function scrapePuzzlePlanet(url: string) {
  try {
    const dom = (await JSDOM.fromURL(url)).window.document;

    const structuredData = JSON.parse(
      dom
        .querySelector('script[type="application/ld+json"]')
        ?.textContent?.trim() || "{}"
    );

    return {
      name: structuredData.name,
      image: structuredData.image,
      price: structuredData.offers.price,
    };
  } catch (error) {
    console.error("Error scraping data", error);
    return null;
  }
}

export default scrapePuzzlePlanet;
