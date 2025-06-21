import { JSDOM } from "jsdom";

import { IBooksLibraryLibgenSearchResult } from "../../../typescript/books_library_interfaces";

export const searchBooks = async (queries: {
  view: string;
  req: string;
  open: string;
  res: string;
  column: string;
  page: string;
  sort: string;
  sortmode: string;
}): Promise<IBooksLibraryLibgenSearchResult> => {
  const target = new URL("http://libgen.is/search.php");
  target.searchParams.set("view", queries.view);
  target.searchParams.set("req", queries.req);
  target.searchParams.set("lg_topic", "libgen");
  target.searchParams.set("open", queries.open);
  target.searchParams.set("res", queries.res);
  target.searchParams.set("column", queries.column);
  target.searchParams.set("page", queries.page);
  target.searchParams.set("sort", queries.sort);
  target.searchParams.set("sortmode", queries.sortmode);

  try {
    const data = await fetch(target.href).then((res) => res.text());
    const dom = new JSDOM(data);
    const document = dom.window.document;
    let final = [];

    final = parseDetailedView(document);

    return {
      query: queries.req,
      resultsCount:
        document.querySelector("font[color='grey']")?.textContent || "0",
      data: final,
      page: parseInt(queries.page),
    };
  } catch (error) {
    return {
      query: queries.req,
      resultsCount: "0",
      data: [],
      page: parseInt(queries.page),
    };
  }
};

function parseDetailedView(document: Document) {
  const table = Array.from(
    document.querySelectorAll('body > table[rules="cols"]'),
  );

  return table
    .map(
      (item) =>
        ({
          ...Object.fromEntries(
            (
              Array.from(item.querySelectorAll("tr"))
                .map((e) => e.textContent?.trim())
                .filter((e) => e)
                .map((e) => e?.split("\n"))
                .map((e) => (e!.length % 2 ? e?.concat([""]) : e))
                .map((e) =>
                  e!.reduce((all, one, i) => {
                    const ch = Math.floor(i / 2);
                    // @ts-ignore
                    all[ch] = [].concat(all[ch] || [], one);
                    return all;
                  }, []),
                ) as never as [string, string][]
            )
              .flat()
              .map((e) => [
                e[0].split(":")[0],
                e[1] || e[0].split(":")[1].trim(),
              ]),
          ),
          md5: Array.from(item.querySelectorAll("a"))
            .find((e) => e.href.includes("?md5="))
            ?.href.split("=")?.[1],
          image: item.querySelector("img")?.src,
        }) as never as Record<string, string | undefined>,
    )
    .filter((e) => Object.keys(e).length > 1);
}
