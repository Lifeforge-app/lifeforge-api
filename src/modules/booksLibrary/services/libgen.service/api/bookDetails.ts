import { JSDOM } from "jsdom";
import { WithoutPBDefault } from "../../../../../core/typescript/pocketbase_interfaces";
import { IBooksLibraryEntry } from "../../../typescript/books_library_interfaces";
import { zip } from "../utils/parsing";

export const getBookDetails = async (md5: string, tlm?: string) => {
  const target = new URL("http://libgen.is/book/index.php");
  target.searchParams.set("md5", md5);
  if (tlm) target.searchParams.set("tlm", tlm);

  const data = await fetch(target.href).then((res) => res.text());
  const dom = new JSDOM(data);
  const document = dom.window.document;

  const final = parseBookDetailsPage(document);

  return final;
};

export const getLocalLibraryData = async (md5: string, tlm?: string) => {
  const target = new URL("http://libgen.is/book/index.php");
  target.searchParams.set("md5", md5);
  if (tlm) target.searchParams.set("tlm", tlm);

  const data = await fetch(target.href).then((res) => res.text());
  const dom = new JSDOM(data);
  const document = dom.window.document;

  const everything = parseBookDetailsPage(document);

  const final: Omit<
    WithoutPBDefault<IBooksLibraryEntry>,
    "category" | "file" | "is_favourite"
  > = {
    md5: md5,
    thumbnail: document.querySelector("img")?.src ?? "",
    authors: everything["Author(s)"]
      ?.split(",")
      .map((e: string) => e.trim())
      .join(", "),
    edition: everything["Edition"],
    extension: everything["Extension"],
    isbn: everything["ISBN"]
      ?.split(",")
      .map((e: string) => e.trim())
      .join(", "),
    languages: everything["Language"]?.split(",").map((e: string) => e.trim()),
    publisher: everything["Publisher"],
    size: everything["Size"].match(/.*?\((\d+) bytes\)/)?.[1],
    title:
      document
        .querySelector(
          'body > table[rules="cols"] > tbody > tr:nth-child(2) > td:nth-child(3)',
        )
        ?.textContent?.trim() ?? "",
    year_published: everything["Year"],
  };

  return final;
};

function parseBookDetailsPage(document: Document) {
  const final = Object.fromEntries(
    Array.from(
      document.querySelectorAll('body > table[rules="cols"] > tbody > tr'),
    )
      .slice(2)
      .map((e) =>
        !e.querySelector("table")
          ? Array.from(e.querySelectorAll("td"))
              .reduce((all: HTMLTableCellElement[][], one, i) => {
                const ch = Math.floor(i / 2);
                all[ch] = ([] as HTMLTableCellElement[]).concat(
                  all[ch] || [],
                  one as HTMLTableCellElement,
                );
                return all;
              }, [])
              .map((e) => {
                const key = e[0]?.textContent?.trim().replace(/:$/, "") || "";
                if (e[1]?.querySelector("a")) {
                  return [
                    "islink|" + key,
                    Object.fromEntries(
                      Array.from(e[1].querySelectorAll("a")).map((e) => [
                        e.textContent?.trim() || "",
                        (() => {
                          const href = e.href;
                          switch (key) {
                            case "BibTeX":
                              return href.replace("bibtex.php", "/bibtex");
                            case "Desr. old vers.":
                              return href.replace("../book/index.php", "/book");
                            default:
                              return href;
                          }
                        })(),
                      ]),
                    ),
                  ];
                }
                return [key, e[1]?.textContent?.trim() || ""];
              })
          : [
              [
                e.querySelector("td")?.textContent?.trim(),
                zip(
                  ...(Array.from(e?.querySelectorAll("table > tbody > tr")).map(
                    (e) =>
                      Array.from(e.querySelectorAll("td")).map((e) => {
                        if (e.querySelector("a")) {
                          return [
                            e.querySelector("a")?.textContent?.trim(),
                            e
                              .querySelector("a")
                              ?.href.replace("../", "http://libgen.is/"),
                          ];
                        }
                        return e.textContent?.trim();
                      }),
                  ) as [Array<string>, Array<any> | null]),
                ),
              ],
            ],
      )
      .flat()
      .filter((e) => e?.length === 2 && e[0] !== "Table of contents" && e[1])
      .map((e) => [e[0] as string, e[1]]) as [string, any][],
  );

  final.image = document.querySelector("img")?.src ?? "";

  final.title =
    document
      .querySelector(
        'body > table[rules="cols"] > tbody > tr:nth-child(2) > td:nth-child(3)',
      )
      ?.textContent?.trim() ?? "";

  final.hashes = Object.fromEntries(
    Array.from(document.querySelectorAll("table.hashes > tbody > tr"))
      .map((e) => [
        e.querySelector("th")?.textContent,
        e.querySelector("td")?.textContent,
      ])
      .filter((e) => e[0]),
  );

  final.descriptions = document.querySelector(
    'body > table[rules="cols"] > tbody > tr:nth-last-child(4) > td',
  )?.innerHTML;

  final.toc = document
    .querySelector(
      'body > table[rules="cols"] > tbody > tr:nth-last-child(3) > td',
    )
    ?.innerHTML.replace(
      '<hr><font color="gray">Table of contents : <br></font>',
      "",
    );

  return final;
}
