import { JSDOM } from "jsdom";
import express, { Response } from "express";
import axios from "axios";
import { spawn } from "child_process";
import {
  clientError,
  successWithBaseResponse,
} from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import fs from "fs";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces.js";
import {
  IBooksLibraryDownloadProcess,
  IBooksLibraryEntry,
} from "../../../interfaces/books_library_interfaces.js";
import { BaseResponse } from "../../../interfaces/base_response.js";

const router = express.Router();

const downloadProcesses = new Map<string, IBooksLibraryDownloadProcess>();

const cleanupTitle = (title: Element | null) => {
  if (title === null) return "";
  const el = title.querySelectorAll("font");
  let edition = "";
  if (el) {
    edition =
      Array.from(el)
        .find((e) => e.textContent?.trim().match(/^\[.*?\]$/))
        ?.textContent?.trim() || "";
    el.forEach((e) => e.remove());
  }
  return {
    title: title.textContent?.trim(),
    edition,
  };
};

const zip = (a: Array<string>, b: Array<any> | null) => {
  if (b)
    return Object.fromEntries(a.map((k, i) => [k, b[i]]).filter((e) => e[0]));
  return a;
};

router.get(
  "/search",
  asyncWrapper(async (req, res) => {
    const queries = req.query as Record<string, string>;

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
      const { data } = await axios({
        method: "GET",
        url: target.href,
      });
      const dom = new JSDOM(data);
      const document = dom.window.document;
      let final = [];

      if (queries.view !== "detailed") {
        const table = document.querySelector("table.c");

        final = Array.from(table!.querySelectorAll("tr"))
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
                e.href.includes("&column=series")
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
      } else {
        const table = Array.from(
          document.querySelectorAll('body > table[rules="cols"]')
        );
        final = table
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
                        }, [])
                      ) as never as [string, string][]
                  )
                    .flat()
                    .map((e) => [
                      e[0].split(":")[0],
                      e[1] || e[0].split(":")[1].trim(),
                    ])
                ),
                md5: Array.from(item.querySelectorAll("a"))
                  .find((e) => e.href.includes("?md5="))
                  ?.href.split("=")?.[1],
                image: item.querySelector("img")?.src,
              }) as never as Record<string, string | undefined>
          )
          .filter((e) => Object.keys(e).length > 1);
      }

      successWithBaseResponse(res, {
        query: ["last", "modified"].includes(queries.mode)
          ? {
              last: "Last added",
              modified: "Last modified",
            }[queries.mode as "last" | "modified"]
          : queries.req,
        resultsCount: document.querySelector("font[color='grey']")?.textContent,
        data: final,
        page: parseInt(queries.page),
      });
    } catch {
      successWithBaseResponse(res, {
        query: ["last", "modified"].includes(queries.mode)
          ? {
              last: "Last added",
              modified: "Last modified",
            }[queries.mode as "last" | "modified"]
          : queries.req,
        resultsCount: "0",
        data: [],
        page: parseInt(queries.page),
      });
    }
  })
);

router.get(
  "/details/:md5",
  asyncWrapper(async (req, res) => {
    const target = new URL("http://libgen.is/book/index.php");
    target.searchParams.set("md5", req.params.md5);
    if (req.params.tlm) target.searchParams.set("tlm", req.params.tlm);

    try {
      const { data } = await axios({
        method: "GET",
        url: target.href,
      });
      const dom = new JSDOM(data);
      const document = dom.window.document;

      const final = Object.fromEntries(
        Array.from(
          document.querySelectorAll('body > table[rules="cols"] > tbody > tr')
        )
          .slice(2)
          .map((e) =>
            !e.querySelector("table")
              ? Array.from(e.querySelectorAll("td"))
                  .reduce((all: HTMLTableCellElement[][], one, i) => {
                    const ch = Math.floor(i / 2);
                    all[ch] = ([] as HTMLTableCellElement[]).concat(
                      all[ch] || [],
                      one as HTMLTableCellElement
                    );
                    return all;
                  }, [])
                  .map((e) => {
                    const key =
                      e[0]?.textContent?.trim().replace(/:$/, "") || "";
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
                                  return href.replace(
                                    "../book/index.php",
                                    "/book"
                                  );
                                default:
                                  return href;
                              }
                            })(),
                          ])
                        ),
                      ];
                    }
                    return [key, e[1]?.textContent?.trim() || ""];
                  })
              : [
                  [
                    e.querySelector("td")?.textContent?.trim(),
                    zip(
                      ...(Array.from(
                        e?.querySelectorAll("table > tbody > tr")
                      ).map((e) =>
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
                        })
                      ) as [Array<string>, Array<any> | null])
                    ),
                  ],
                ]
          )
          .flat()
          .filter(
            (e) => e?.length === 2 && e[0] !== "Table of contents" && e[1]
          )
          .map((e) => [e[0] as string, e[1]]) as [string, any][]
      );

      final.image = document.querySelector("img")?.src ?? "";

      final.title =
        document
          .querySelector(
            'body > table[rules="cols"] > tbody > tr:nth-child(2) > td:nth-child(3)'
          )
          ?.textContent?.trim() ?? "";

      final.hashes = Object.fromEntries(
        Array.from(document.querySelectorAll("table.hashes > tbody > tr"))
          .map((e) => [
            e.querySelector("th")?.textContent,
            e.querySelector("td")?.textContent,
          ])
          .filter((e) => e[0])
      );

      final.descriptions = document.querySelector(
        'body > table[rules="cols"] > tbody > tr:nth-last-child(4) > td'
      )?.innerHTML;

      final.toc = document
        .querySelector(
          'body > table[rules="cols"] > tbody > tr:nth-last-child(3) > td'
        )
        ?.innerHTML.replace(
          '<hr><font color="gray">Table of contents : <br></font>',
          ""
        );

      successWithBaseResponse(res, final);
    } catch (e: any) {
      clientError(res, e.message);
    }
  })
);

router.get(
  "/local-library-data/:md5",
  asyncWrapper(async (req, res) => {
    const target = new URL("http://libgen.is/book/index.php");
    target.searchParams.set("md5", req.params.md5);
    if (req.params.tlm) target.searchParams.set("tlm", req.params.tlm);

    try {
      const { data } = await axios({
        method: "GET",
        url: target.href,
      });
      const dom = new JSDOM(data);
      const document = dom.window.document;

      const everything = Object.fromEntries(
        Array.from(
          document.querySelectorAll('body > table[rules="cols"] > tbody > tr')
        )
          .slice(2)
          .map((e) =>
            !e.querySelector("table")
              ? Array.from(e.querySelectorAll("td"))
                  .reduce((all: HTMLTableCellElement[][], one, i) => {
                    const ch = Math.floor(i / 2);
                    all[ch] = ([] as HTMLTableCellElement[]).concat(
                      all[ch] || [],
                      one as HTMLTableCellElement
                    );
                    return all;
                  }, [])
                  .map((e) => {
                    const key =
                      e[0]?.textContent?.trim().replace(/:$/, "") || "";
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
                                  return href.replace(
                                    "../book/index.php",
                                    "/book"
                                  );
                                default:
                                  return href;
                              }
                            })(),
                          ])
                        ),
                      ];
                    }
                    return [key, e[1]?.textContent?.trim() || ""];
                  })
              : [
                  [
                    e.querySelector("td")?.textContent?.trim(),
                    zip(
                      ...(Array.from(
                        e?.querySelectorAll("table > tbody > tr")
                      ).map((e) =>
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
                        })
                      ) as [Array<string>, Array<any> | null])
                    ),
                  ],
                ]
          )
          .flat()
          .filter(
            (e) => e?.length === 2 && e[0] !== "Table of contents" && e[1]
          )
          .map((e) => [e[0] as string, e[1]]) as [string, any][]
      );

      const final: Omit<
        WithoutPBDefault<IBooksLibraryEntry>,
        "category" | "file" | "is_favourite"
      > = {
        md5: req.params.md5,
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
        languages: everything["Language"]
          ?.split(",")
          .map((e: string) => e.trim()),
        publisher: everything["Publisher"],
        size: everything["Size"].match(/.*?\((\d+) bytes\)/)?.[1],
        title:
          document
            .querySelector(
              'body > table[rules="cols"] > tbody > tr:nth-child(2) > td:nth-child(3)'
            )
            ?.textContent?.trim() ?? "",
        year_published: everything["Year"],
      };

      successWithBaseResponse(res, final);
    } catch (e: any) {
      clientError(res, e.message);
    }
  })
);

router.post(
  "/add-to-library/:md5",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { metadata } = req.body as {
      metadata: Omit<IBooksLibraryEntry, "thumbnail" | "file"> & {
        thumbnail: File;
        file: File;
      };
    };
    const md5 = req.params.md5;
    const target = `http://libgen.li/ads.php?md5=${md5}`;

    downloadProcesses.set(req.params.md5, {
      kill: () => {},
      downloaded: "0B",
      total: "0B",
      percentage: "0%",
      speed: "0B/s",
      ETA: "0",
      metadata,
    });

    try {
      const { data } = await axios({
        method: "GET",
        url: target,
      });
      const link = data.match(
        /<a href="(get\.php\?md5=.*?&key=.*?)"><h2>GET<\/h2><\/a>/
      )?.[1];

      if (!link) throw new Error("Failed to add to library");

      const downloadLink = `http://libgen.li/${link}`;

      const downloadProcess = spawn("aria2c", [
        "--dir=./uploads",
        `--out=${md5}.${metadata.extension}`,
        "--log-level=info",
        "-l-",
        "-x8",
        downloadLink,
      ]);

      downloadProcess.stdout.on("data", (data) => {
        try {
          successWithBaseResponse(res, {}, 202);
        } catch {}

        data = data.toString();
        if (/ETA:/.test(data)) {
          const matches =
            /\[#\w{6} (?<downloaded>.*?)\/(?<total>.*?)\((?<percentage>.*?%)\).*?DL:(?<speed>.*?) ETA:(?<ETA>.*?)s\]/g.exec(
              data
            );

          if (matches) {
            const { downloaded, total, percentage, speed, ETA } =
              matches.groups!;

            downloadProcesses.set(req.params.md5, {
              kill: downloadProcess.kill,
              downloaded,
              total,
              percentage,
              speed,
              ETA,
              metadata,
            });
          }
        }
      });

      downloadProcess.stderr.on("data", (data) => {
        console.log(data);
        downloadProcesses.delete(req.params.md5);
        clientError(res, "Failed to download file");
      });

      downloadProcess.on("error", (err) => {
        console.log(err);
        downloadProcesses.delete(req.params.md5);
        clientError(res, "Failed to download file");
      });

      downloadProcess.on("close", async () => {
        if (!fs.existsSync(`./uploads/${md5}.${metadata.extension}`)) {
          downloadProcesses.delete(req.params.md5);
          clientError(res, "Failed to download file");
          return;
        }

        console.log(metadata.category);
        //TODO
        metadata.languages = [];
        metadata.category = "";

        await fetch(`http://libgen.is/${metadata.thumbnail}`).then(
          async (response) => {
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              metadata.thumbnail = new File([buffer], "image.jpg", {
                type: "image/jpeg",
              });
            }
          }
        );

        const file = fs.readFileSync(
          "./uploads/" + md5 + "." + metadata.extension
        );
        if (!file) throw new Error("Failed to read file");
        metadata.file = new File([file], `${md5}.${metadata.extension}`);

        await pb.collection("books_library_entries").create(metadata);

        downloadProcesses.delete(req.params.md5);

        fs.unlinkSync(`./uploads/${md5}.${metadata.extension}`);
        console.log("Download process closed");
      });
    } catch (e: any) {
      downloadProcesses.delete(req.params.md5);
      clientError(res, e.message);
    }
  })
);

router.get(
  "/download-progresses",
  asyncWrapper(
    async (
      _,
      res: Response<
        BaseResponse<Record<string, Omit<IBooksLibraryDownloadProcess, "kill">>>
      >
    ) => {
      successWithBaseResponse(
        res,
        Object.fromEntries(
          Array.from(downloadProcesses.entries()).map(([k, v]) => [
            k,
            { ...v, kill: undefined },
          ])
        )
      );
    }
  )
);

router.delete(
  "/download-progresses/:md5",
  asyncWrapper(async (req, res) => {
    const process = downloadProcesses.get(req.params.md5);
    if (!process) {
      clientError(res, "No such download process", 404);
      return;
    }

    process.kill();

    downloadProcesses.delete(req.params.md5);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
