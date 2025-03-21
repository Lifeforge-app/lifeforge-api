import { JSDOM } from "jsdom";
import { cleanupTitle } from "../utils/parsing";

export const searchBooks = async (queries: Record<string, string>) => {
  const target = new URL("http://libgen.is/search.php");
  target.searchParams.set("mode", queries.mode);
  target.searchParams.set("req", queries.req);
  target.searchParams.set("lg_topic", "libgen");
  target.searchParams.set("open", queries.open);
  target.searchParams.set("view", queries.view);
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

    if (queries.view !== "detailed") {
      final = parseSimpleView(document);
    } else {
      final = parseDetailedView(document);
    }

    return {
      query: ["last", "modified"].includes(queries.mode)
        ? {
            last: "Last added",
            modified: "Last modified",
          }[queries.mode as "last" | "modified"]
        : queries.req,
      resultsCount: document.querySelector("font[color='grey']")?.textContent,
      data: final,
      page: parseInt(queries.page),
    };
  } catch (error) {
    return {
      query: ["last", "modified"].includes(queries.mode)
        ? {
            last: "Last added",
            modified: "Last modified",
          }[queries.mode as "last" | "modified"]
        : queries.req,
      resultsCount: "0",
      data: [],
      page: parseInt(queries.page),
    };
  }
};

function parseSimpleView(document: Document) {
  const table = document.querySelector("table.c");

  return Array.from(table!.querySelectorAll("tr"))
    .slice(1)
    .map((row) => {
      const cells = row.querySelectorAll("td");
      return {
        md5: Array.from(row.querySelectorAll("a"))
          .find((e) => e.href.includes("?md5="))
          ?.href.split("=")?.[1],
        id: cells[0].textContent,
        author: cells[1].textContent,
        series: Array.from(cells[2].querySelectorAll("a")).filter((e) =>
          e.href.includes("&column=series"),
        )?.[0]?.textContent,
        title: cleanupTitle(cells[2].querySelector("[title]")),
        publisher: cells[3].textContent,
        year: cells[4].textContent,
        pages: cells[5].textContent,
        language: cells[6].textContent,
        size: cells[7].textContent,
        extension: cells[8].textContent,
        mirror1: cells[9].querySelector("a")?.href,
        mirror2: cells[10].querySelector("a")?.href,
      };
    });
}

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
