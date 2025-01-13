import express, { Request, Response } from "express";
import fs from "fs";
import asyncWrapper from "../../utils/asyncWrapper.js";
import { clientError, successWithBaseResponse } from "../../utils/response.js";
import { body, validationResult } from "express-validator";
import Groq from "groq-sdk";
import hasError from "../../utils/checkError.js";
import { getAPIKey } from "../../utils/getAPIKey.js";
import { fetchAI } from "../../utils/fetchAI.js";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const router = express.Router();

router.get(
  "/:language",
  asyncWrapper(async (req, res) => {
    const { language } = req.params;
    if (!["en", "ms", "zh-CN", "zh-TW"].includes(language)) {
      res.status(404).json({
        state: "error",
        message: "Language not found",
      });
      return;
    }

    const data = JSON.parse(
      fs.readFileSync(
        `${process.cwd()}/public/locales/${language}.json`,
        "utf-8"
      )
    );

    res.json(data);
  })
);

router.post(
  "/ai-generate/module-name",
  [body("name").isString()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

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
  })
);

router.post(
  "/ai-generate/module-description",
  [body("name").isString()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

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
          raw.replace(/`/g, "").trim().replace(/^json/, "")
        );

        successWithBaseResponse(res, text);

        break;
      } catch {
        tries++;
      }
    }
  })
);

router.post(
  "/ai-generate",
  [body("key").isString()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const apiKey = await getAPIKey("groq", req.pb);

    if (!apiKey) {
      clientError(res, "API key not found");
      return;
    }

    const { key } = req.body;

    if (!key.trim()) {
      clientError(res, "key is required");
      return;
    }

    const prompt = `Translate the text "${key}" into natural language suitable for user interface display, considering the target context of a user interface element (button, label, descriptions, etc.). 
    
    Provide translations in English (en), Bahasa Malaysia (ms), Simplified Chinese (zh-CN), and Traditional Chinese (zh-TW). 
    
    Prioritize conciseness and clarity for the user interface. 
    
    If the text is a programming term, avoid overly technical language and consider the specific function the term represents within the user interface. If the text is ambiguous, request clarification on the intended meaning or context; if clarification is unavailable, provide a translation that is reasonable based on the general context. If the text is not directly translatable, provide a functionally equivalent translation that aligns with the user interface's purpose. If the text is just a piece of general text, provide a translation as is.

    If the text is a key in a JSON object, eg. "object.key", translate the "key" part only, while taking into account the context of the object. For example, if the text is a module name, eg. "modules.xxx", translate the "xxx" part only. 
    
    Return the results as a JSON string with language codes as keys and the respective translations as values. Ensure the JSON string is valid and can be directly parsed by JavaScript's JSON.parse function. Do not wrap the result in any code environment. Below is an example of the expected format: \`\`\`json { "en": "Hello", "ms": "Halo", "zh-CN": "你好", "zh-TW": "你好" } \`\`\`
        `;

    const MAX_RETRY = 5;
    let tries = 0;

    while (tries < MAX_RETRY) {
      try {
        const raw = await fetchAI({
          provider: "groq",
          apiKey,
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        if (!raw) throw new Error("No response");

        const text = JSON.parse(
          raw.replace(/`/g, "").trim().replace(/^json/, "")
        );

        successWithBaseResponse(res, text);

        break;
      } catch {
        tries++;
      }
    }
  })
);

router.post(
  "/",
  asyncWrapper(
    async (
      req: Request<
        {},
        {},
        {
          key: string;
          translations: {
            [key: string]: string;
          };
        }
      >,
      res: Response
    ) => {
      const { key, translations } = req.body;
      for (const language in translations) {
        if (!["en", "ms", "zh-CN", "zh-TW"].includes(language)) {
          res.status(404).json({
            state: "error",
            message: "Language not found",
          });
        }

        const translation = translations[language];

        const data = JSON.parse(
          fs.readFileSync(
            `${process.cwd()}/public/locales/${language}.json`,
            "utf-8"
          )
        );

        const keyPath = key.split(".");
        const lastKey = keyPath.pop() ?? "";
        let current = data;
        keyPath.forEach((key) => {
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        });
        current[lastKey] = translation;

        fs.writeFileSync(
          `${process.cwd()}/public/locales/${language}.json`,
          JSON.stringify(data, null, 2)
        );
      }

      res.json({
        state: "success",
      });
    }
  )
);

router.put(
  "/:language",
  asyncWrapper(async (req, res) => {
    const { language } = req.params;
    if (!["en", "ms", "zh-CN", "zh-TW"].includes(language)) {
      res.status(404).json({
        state: "error",
        message: "Language not found",
      });
    }
    const { data } = req.body;

    fs.writeFileSync(
      `${process.cwd()}/public/locales/${language}.json`,
      JSON.stringify(data, null, 2)
    );

    res.json({
      state: "success",
    });
  })
);

router.patch(
  "/",
  asyncWrapper(
    async (
      req: Request<{}, {}, { oldKey: string; newKey: string }>,
      res: Response
    ) => {
      const { oldKey, newKey } = req.body;
      for (const language of ["en", "ms", "zh-CN", "zh-TW"]) {
        const data = JSON.parse(
          fs.readFileSync(
            `${process.cwd()}/public/locales/${language}.json`,
            "utf-8"
          )
        );

        const oldKeyPath = oldKey.split(".");
        const oldLastKey = oldKeyPath.pop() || "";
        let oldCurrent = data;
        oldKeyPath.forEach((key) => {
          if (!oldCurrent[key]) {
            oldCurrent[key] = {};
          }
          oldCurrent = oldCurrent[key];
        });
        const oldContent = oldCurrent[oldLastKey];
        delete oldCurrent[oldLastKey];

        const newKeyPath = newKey.split(".");
        const newLastKey = newKeyPath.pop() ?? "";
        let newCurrent = data;
        newKeyPath.forEach((key) => {
          if (!newCurrent[key]) {
            newCurrent[key] = {};
          }
          newCurrent = newCurrent[key];
        });

        if (newCurrent[newLastKey]) {
          res.status(400).json({
            state: "error",
            message: "Key already exists",
          });
          return;
        }

        newCurrent[newLastKey] = oldContent;

        fs.writeFileSync(
          `${process.cwd()}/public/locales/${language}.json`,
          JSON.stringify(data, null, 2)
        );
      }

      res.json({
        state: "success",
      });
    }
  )
);

export default router;
