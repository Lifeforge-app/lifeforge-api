import { it } from "vitest";
import { PBAuthToken } from "../utils/PBClient.js";
import API_HOST from "../constant/API_HOST.js";
import request from "supertest";
import { expect } from "chai";

export default function testInvalidOrMissingQuery({
  name,
  type,
  endpoint,
  method,
  expectedCode = 400,
}: {
  name: string;
  type: "invalid" | "missing";
  endpoint: string | (() => Promise<string>);
  method: "get" | "post" | "patch" | "delete";
  expectedCode?: 400 | 404;
}) {
  it(`should return error ${expectedCode} on ${type} ${name}`, async () => {
    const stuffs = name
      .split("(")[0]
      .trim()
      .split(",")
      .map((e) => e.trim());

    const res = await request(API_HOST)
      [method](typeof endpoint !== "string" ? await endpoint() : endpoint)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(expectedCode);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "error");
    expect(res.body).to.have.property(
      "message",
      stuffs
        .map(
          (stuff) =>
            `${stuff}: ${expectedCode === 404 ? "Not found" : "Invalid value"}`
        )
        .join(", ")
    );
  });
}
