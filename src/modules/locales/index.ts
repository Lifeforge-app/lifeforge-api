import asyncWrapper from "@utils/asyncWrapper";
import hasError from "@utils/checkError";
import { fetchAI } from "@utils/fetchAI";
import { getAPIKey } from "@utils/getAPIKey";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "@utils/response";
import express from "express";
import { body, param } from "express-validator";
import fs from "fs";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { z } from "zod";
import { ALLOWED_LANG, ALLOWED_NAMESPACE } from "../../core/constants/locales";

const router = express.Router();

router.get(
  "/list/:namespace",
  [param("namespace").isString().isIn(ALLOWED_NAMESPACE)],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { namespace } = req.params;

    if (namespace === "modules") {
      const data = fs
        .readdirSync(`${process.cwd()}/src/modules`)
        .filter((module) =>
          fs.existsSync(
            `${process.cwd()}/src/modules/${module}/locales/en.json`,
          ),
        )
        .map((module) => module.replace(".json", ""));

      successWithBaseResponse(res, data);
      return;
    }

    const data = fs
      .readdirSync(`${process.cwd()}/src/core/locales/en/${namespace}`)
      .map((file) => file.replace(".json", ""));

    successWithBaseResponse(res, data);
  }),
);

router.get(
  "/list/:namespace/:subnamespace",
  [
    param("namespace").isString().isIn(ALLOWED_NAMESPACE),
    param("subnamespace").isString(),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;
    const { namespace, subnamespace } = req.params;

    const final: Record<string, any> = {};

    if (namespace === "modules") {
      if (
        !fs.existsSync(`${process.cwd()}/src/modules/${subnamespace}/locales`)
      ) {
        clientError(res, "Locale file not found", 404);
        return;
      }

      for (const lang of ["en", "ms", "zh-CN", "zh-TW"]) {
        final[lang] = JSON.parse(
          fs.readFileSync(
            `${process.cwd()}/src/modules/${subnamespace}/locales/${lang}.json`,
            "utf-8",
          ),
        );
      }
    } else {·
      for (const lng of ["en", "ms", "zh-CN", "zh-TW"]) {
        if (
          !fs.existsSync(
            `${process.cwd()}/src/core/locales/${lng}/${namespace}/${subnamespace}.json`,
          )
        ) {
          clientError(res, "Subnamespace data file not found", 404);
          return;
        }

        final[lng] = JSON.parse(
          fs.readFileSync(
            `${process.cwd()}/src/core/locales/${lng}/${namespace}/${subnamespace}.json`,
            "utf-8",
          ),
        );
      }
    }

    successWithBaseResponse(res, final);
  }),
);

router.get(
  "/:lang/:namespace",
  [
    param("namespace")
      .isString()
      .custom((value) => {
        const splitted = value.split(".");
        if (splitted.length !== 2) {
          throw new Error("Invalid namespace");
        }
        if (!ALLOWED_NAMESPACE.includes(splitted[0])) {
          throw new Error("Invalid namespace");
        }
        return true;
      }),
    param("lang").isString().isIn(ALLOWED_LANG),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { lang, namespace } = req.params;
    const [type, id] = namespace.split(".");
    const finalLang = lang === "zh" ? "zh-CN" : lang;

    let data;

    if (type === "modules") {
      if (!fs.existsSync(`${process.cwd()}/src/modules/${id}/locales`)) {
        clientError(res, "Locale file not found", 404);
        return;
      }

      data = JSON.parse(
        fs.readFileSync(
          `${process.cwd()}/src/modules/${id}/locales/${finalLang}.json`,
          "utf-8",
        ),
      );
    } else {
      data = JSON.parse(
        fs.readFileSync(
          `${process.cwd()}/src/core/locales/${finalLang}/${type}/${id}.json`,
          "utf-8",
        ),
      );
    }

    if (type === "common" && id === "sidebar") {
      const moduleLocales = Object.fromEntries(
        fs
          .readdirSync(`${process.cwd()}/src/modules`)
          .filter((module) =>
            fs.existsSync(
              `${process.cwd()}/src/modules/${module}/locales/${finalLang}.json`,
            ),
          )
          .map((module) => {
            const data = JSON.parse(
              fs.readFileSync(
                `${process.cwd()}/src/modules/${module}/locales/${finalLang}.json`,
                "utf-8",
              ),
            );

            return [
              module.replace(".json", ""),
              {
                title: data.title ?? "",
                subsections: data.subsections ?? {},
              },
            ];
          }),
      );

      const coreLocales = Object.fromEntries(
        fs
          .readdirSync(`${process.cwd()}/src/core/locales/${finalLang}/core`)
          .map((file) => {
            const data = JSON.parse(
              fs.readFileSync(
                `${process.cwd()}/src/core/locales/${finalLang}/core/${file}`,
                "utf-8",
              ),
            );

            return [
              file.replace(".json", ""),
              {
                title: data.title ?? "",
                subsections: data.subsections ?? {},
              },
            ];
          }),
      );

      data.modules = {
        ...moduleLocales,
        ...coreLocales,
      };
    }

    res.json(data);
  }),
);

router.post(
  "/sync/:namespace/:subnamespace",
  [
    param("namespace").isString().isIn(ALLOWED_NAMESPACE),
    param("subnamespace").isString(),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { data } = req.body;
    const { namespace, subnamespace } = req.params;

    let fileContent;

    if (namespace === "modules") {
      fileContent = ["en", "ms", "zh-CN", "zh-TW"].reduce<Record<string, any>>(
        (acc, lang) => {
          const path = `${process.cwd()}/src/modules/${subnamespace}/locales/${lang}.json`;
          if (fs.existsSync(path)) {
            acc[lang] = JSON.parse(fs.readFileSync(path, "utf-8"));
          } else {
            acc[lang] = {};
          }

          return acc;
        },
        {},
      );
    } else {
      fileContent = ["en", "ms", "zh-CN", "zh-TW"].reduce<Record<string, any>>(
        (acc, lang) => {
          const path = `${process.cwd()}/src/core/locales/${lang}/${namespace}/${subnamespace}.json`;
          if (fs.existsSync(path)) {
            acc[lang] = JSON.parse(fs.readFileSync(path, "utf-8"));
          } else {
            acc[lang] = {};
          }

          return acc;
        },
        {},
      );
    }

    for (const key in data as Record<string, any>) {
      for (const lang in data[key]) {
        const target = key
          .split(".")
          .slice(0, -1)
          .reduce((acc, cur) => {
            if (!acc[cur]) {
              acc[cur] = {};
            }
            return acc[cur];
          }, fileContent[lang]);

        target[key.split(".").pop() as keyof typeof target] = data[key][lang];
      }
    }

    if (namespace === "modules") {
      for (const lang in fileContent) {
        fs.writeFileSync(
          `${process.cwd()}/src/modules/${subnamespace}/locales/${lang}.json`,
          JSON.stringify(fileContent[lang], null, 2),
        );
      }
    } else {
      for (const lang in fileContent) {
        fs.writeFileSync(
          `${process.cwd()}/src/core/locales/${lang}/${namespace}/${subnamespace}.json`,
          JSON.stringify(fileContent[lang], null, 2),
        );
      }
    }

    successWithBaseResponse(res, true);
  }),
);

router.post(
  "/create/:type/:namespace/:subnamespace",
  [
    param("type").isString().isIn(["entry", "folder"]),
    param("namespace").isString().isIn(ALLOWED_NAMESPACE),
    param("subnamespace").isString(),
    body("path").isString(),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { type, namespace, subnamespace } = req.params;
    const path = req.body.path || "";

    for (const lang of ["en", "ms", "zh-CN", "zh-TW"]) {
      const filePath =
        namespace === "modules"
          ? `${process.cwd()}/src/modules/${subnamespace}/locales/${lang}.json`
          : `${process.cwd()}/src/core/locales/${lang}/${namespace}/${subnamespace}.json`;

      const data: Record<string, any> = JSON.parse(
        fs.readFileSync(filePath, "utf-8"),
      );
      const splitted: string[] = path.split(".");
      const key = splitted.pop();
      const target = splitted.reduce((acc, cur) => {
        if (!acc[cur]) {
          acc[cur] = {};
        }
        return acc[cur];
      }, data);

      if (target[key as string] !== undefined) {
        clientError(res, "Path already exists");
        return;
      }

      target[key as string] = type === "entry" ? "" : {};

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    successWithBaseResponse(res, true);
  }),
);

router.post(
  "/rename/:namespace/:subnamespace",
  [
    param("namespace").isString().isIn(ALLOWED_NAMESPACE),
    param("subnamespace").isString(),
    body("path").isString(),
    body("newName").isString(),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { namespace, subnamespace } = req.params;
    const path = req.body.path || "";
    const newName = req.body.newName || "";

    for (const lang of ["en", "ms", "zh-CN", "zh-TW"]) {
      const filePath =
        namespace === "modules"
          ? `${process.cwd()}/src/modules/${subnamespace}/locales/${lang}.json`
          : `${process.cwd()}/src/core/locales/${lang}/${namespace}/${subnamespace}.json`;

      const data: Record<string, any> = JSON.parse(
        fs.readFileSync(filePath, "utf-8"),
      );
      const splitted: string[] = path.split(".");
      const key = splitted.pop();
      const target = splitted.reduce((acc, cur) => {
        if (!acc[cur]) {
          acc[cur] = {};
        }
        return acc[cur];
      }, data);

      if (target[key as string] === undefined) {
        clientError(res, "Path not found");
        return;
      }

      if (target[newName] !== undefined) {
        clientError(res, "New name already exists");
        return;
      }

      target[newName] = target[key as string];
      delete target[key as string];

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    successWithBaseResponse(res, true);
  }),
);

router.post(
  "/delete/:namespace/:subnamespace",
  [
    param("namespace").isString().isIn(ALLOWED_NAMESPACE),
    param("subnamespace").isString(),
    body("path").isString(),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { namespace, subnamespace } = req.params;
    const path = req.body.path || "";

    ["en", "ms", "zh-CN", "zh-TW"].forEach((lang) => {
      const filePath =
        namespace === "modules"
          ? `${process.cwd()}/src/modules/${subnamespace}/locales/${lang}.json`
          : `${process.cwd()}/src/core/locales/${lang}/${namespace}/${subnamespace}.json`;
      const data: Record<string, any> = JSON.parse(
        fs.readFileSync(filePath, "utf-8"),
      );
      const splitted: string[] = path.split(".");
      const key = splitted.pop();
      const target = splitted.reduce((acc, cur) => {
        if (!acc[cur]) {
          acc[cur] = {};
        }
        return acc[cur];
      }, data);

      delete target[key as string];

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    });

    successWithBaseResponse(res, true);
  }),
);

router.post(
  "/ai-generate/module-name",
  [body("name").isString()],
  asyncWrapper(async (req, res) => {
    const apiKey = await getAPIKey("openai", req.pb);

    if (!apiKey) {
      clientError(res, "API key not found");
      return;
    }

    const { name } = req.body;

    if (!name.trim()) {
      clientError(res, "name is required");
      return;
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          'Translate given module names into Simplified Chinese (zh-CN), Traditional Chinese (zh-TW), and Malay (ms). Return the result as: {"zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese", "ms": "Malay" }.',
      },
      {
        role: "user",
        content: name,
      },
    ];

    const MAX_RETRY = 5;
    let tries = 0;

    while (tries < MAX_RETRY) {
      try {
        const raw = await fetchAI({
          provider: "openai",
          apiKey,
          model: "gpt-4o-mini",
          messages,
        });
        if (!raw) throw new Error("No response");

        const text = JSON.parse(raw);

        successWithBaseResponse(res, text);
        return;
      } catch {
        tries++;
      }
    }

    clientError(res, "Failed to generate module name");
  }),
);

router.post(
  "/ai-generate/module-description",
  [body("name").isString()],
  asyncWrapper(async (req, res) => {
    const apiKey = await getAPIKey("openai", req.pb);

    if (!apiKey) {
      clientError(res, "API key not found");
      return;
    }

    const { name } = req.body;

    if (!name.trim()) {
      clientError(res, "name is required");
      return;
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an assistant that creates concise, gerund-based module descriptions and translates them into Simplified Chinese (zh-CN), Traditional Chinese (zh-TW), and Malay (ms). Return the result as: {"en": "English", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese", "ms": "Malay" }.`,
      },
      {
        role: "user",
        content: name,
      },
    ];

    const MAX_RETRY = 5;
    let tries = 0;

    while (tries < MAX_RETRY) {
      try {
        const raw = await fetchAI({
          provider: "openai",
          apiKey,
          model: "gpt-4o-mini",
          messages,
        });

        if (!raw) throw new Error("No response");

        const text = JSON.parse(
          raw.replace(/`/g, "").trim().replace(/^json/, ""),
        );

        successWithBaseResponse(res, text);

        break;
      } catch {
        tries++;
      }
    }
  }),
);

router.post(
  "/suggestions/:namespace/:subnamespace",
  [
    param("namespace").isString().isIn(ALLOWED_NAMESPACE),
    param("subnamespace").isString(),
    body("path").isString(),
    body("hint").isString(),
  ],
  asyncWrapper(async (req, res) => {
    const apiKey = await getAPIKey("openai", req.pb);

    if (!apiKey) {
      clientError(res, "API key not found");
      return;
    }

    const { namespace, subnamespace } = req.params;
    const { path, hint } = req.body;

    if (!path.trim()) {
      clientError(res, "key is required");
      return;
    }

    const LocaleSuggestions = z.object({
      en: z.string(),
      ms: z.string(),
      "zh-CN": z.string(),
      "zh-TW": z.string(),
    });

    const prompt = `Translate i18n locale keys into natural language suitable for user interface elements such as buttons, labels, and descriptions. The input will be an array of two elements: the first is a locale key in the format {namespace}.{subnamespace}:{key}, and the second is an optional user-provided hint for reference.

When translating, focus on {key}, but also consider {namespace} and {subnamespace} to understand the broader context. If the hint is appropriate, follow it to produce the translation without removing any words. If the hint is unclear, ambiguous, or inconsistent with the key’s context, use reasonable judgment based on the namespaces and key structure.

Provide concise and clear translations in English (en), Bahasa Malaysia (ms), Simplified Chinese (zh-CN), and Traditional Chinese (zh-TW), ensuring they are user-friendly and contextually appropriate. Avoid overly technical language; adapt programming terms based on their role in the user interface.

If the key remains ambiguous despite the hint and namespace context, seek clarification. If clarification is unavailable, provide a reasonable translation based on general UI patterns. For non-translatable texts, offer a functionally equivalent alternative that aligns with the UI’s purpose. Preserve the meaning of general text while ensuring it reads naturally.`;

    const client = new OpenAI({
      apiKey,
    });

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: JSON.stringify([
            `${namespace}.${subnamespace}:${path}`,
            hint,
          ]),
        },
      ],
      response_format: zodResponseFormat(LocaleSuggestions, "transaction"),
    });

    const suggestions = completion.choices[0].message.parsed;

    if (!suggestions) {
      serverError(res, "Failed to generate suggestions");
      return;
    }

    successWithBaseResponse(res, suggestions);
  }),
);

export default router;
