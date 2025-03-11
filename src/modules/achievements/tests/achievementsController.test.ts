import request from "supertest";
import app from "../../../app";
import * as EntriesService from "../services/entriesService";
import { checkExistence } from "../../../utils/PBRecordValidator";

jest.mock("../services/entriesService");
jest.mock("../../../utils/PBRecordValidator", () => ({
  checkExistence: jest.fn(),
}));

describe("Entries Controller", () => {
  const mockEntry = {
    id: "123",
    difficulty: "hard",
    title: "Achievement Title",
    thoughts: "This was tough!",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /achievements/entries/:difficulty", () => {
    test("should return all entries by difficulty", async () => {
      (EntriesService.getAllEntriesByDifficulty as jest.Mock).mockResolvedValue(
        [mockEntry]
      );

      const res = await request(app).get("/achievements/entries/hard");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toEqual(mockEntry);
      expect(EntriesService.getAllEntriesByDifficulty).toHaveBeenCalledWith(
        expect.anything(),
        "hard"
      );
    });

    test("should return 400 for invalid difficulty", async () => {
      const res = await request(app).get("/achievements/entries/invalid");

      expect(res.status).toBe(400);
    });
  });

  describe("POST /achievements/entries", () => {
    test("should create a new entry", async () => {
      (EntriesService.createEntry as jest.Mock).mockResolvedValue(mockEntry);

      const res = await request(app).post("/achievements/entries").send({
        difficulty: "hard",
        title: "New Achievement",
        thoughts: "Great job!",
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toEqual(mockEntry);
      expect(EntriesService.createEntry).toHaveBeenCalled();
    });

    test("should return 400 for invalid request", async () => {
      const res = await request(app).post("/achievements/entries").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /achievements/entries/:id", () => {
    test("should update an entry if entry exists", async () => {
      (EntriesService.updateEntry as jest.Mock).mockResolvedValue(mockEntry);
      (checkExistence as jest.Mock).mockResolvedValue(true);

      const res = await request(app).patch("/achievements/entries/123").send({
        difficulty: "hard",
        title: "Updated Achievement",
        thoughts: "Now even harder!",
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockEntry);
      expect(EntriesService.updateEntry).toHaveBeenCalled();
    });

    test("should return 400 if entry does not exist", async () => {
      (checkExistence as jest.Mock).mockImplementation(async (req, res) => {
        res.status(400).json({
          state: "error",
          message: "Related record not found in database",
        });
        return false;
      });

      const res = await request(app).patch("/achievements/entries/999").send({
        difficulty: "hard",
        title: "Updated Title",
        thoughts: "Updated Thoughts",
      });

      expect(res.status).toBe(400);
      expect(EntriesService.updateEntry).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /achievements/entries/:id", () => {
    test("should delete an entry if entry exists", async () => {
      (EntriesService.deleteEntry as jest.Mock).mockResolvedValue(true);
      (checkExistence as jest.Mock).mockResolvedValue(true);

      const res = await request(app).delete("/achievements/entries/123");

      expect(res.status).toBe(204);
      expect(EntriesService.deleteEntry).toHaveBeenCalledWith(
        expect.anything(),
        "123"
      );
    });

    test("should return 400 if entry does not exist", async () => {
      (checkExistence as jest.Mock).mockImplementation(async (req, res) => {
        res.status(400).json({
          state: "error",
          message: "Related record not found in database",
        });
        return false;
      });

      const res = await request(app).delete("/achievements/entries/999");

      expect(res.status).toBe(400);
      expect(EntriesService.deleteEntry).not.toHaveBeenCalled();
    });
  });
});
