// src/modules/achievements/entries/tests/entriesController.test.ts
import request from "supertest";
import * as EntriesService from "../services/entriesService"; // Mock the Service Layer
import app from "../../../app";

jest.mock("../services/entriesService"); // Use Jest to mock the service layer

describe("Entries Controller", () => {
  let pbMock: any;

  const mockEntry = {
    id: "123",
    difficulty: "hard",
    title: "Achievement Title",
    thoughts: "This was tough!",
  };

  beforeEach(() => {
    pbMock = { collection: jest.fn() }; // Mock PocketBase
    jest.clearAllMocks(); // Reset mock calls before each test
  });

  test("GET /achievements/entries/:difficulty - should return all entries by difficulty", async () => {
    (EntriesService.getAllEntriesByDifficulty as jest.Mock).mockResolvedValue([
      mockEntry,
    ]);

    const res = await request(app).get("/achievements/entries/hard");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toEqual(mockEntry);
    expect(EntriesService.getAllEntriesByDifficulty).toHaveBeenCalledWith(
      expect.anything(),
      "hard"
    );
  });

  test("POST /achievements/entries - should create a new entry", async () => {
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

  test("PATCH /achievements/entries/:id - should update an entry", async () => {
    (EntriesService.updateEntry as jest.Mock).mockResolvedValue(mockEntry);

    const res = await request(app).patch("/achievements/entries/123").send({
      difficulty: "hard",
      title: "Updated Achievement",
      thoughts: "Now even harder!",
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(mockEntry);
    expect(EntriesService.updateEntry).toHaveBeenCalled();
  });

  test("DELETE /achievements/entries/:id - should delete an entry", async () => {
    (EntriesService.deleteEntry as jest.Mock).mockResolvedValue(true);

    const res = await request(app).delete("/achievements/entries/123");

    expect(res.status).toBe(204);
    expect(EntriesService.deleteEntry).toHaveBeenCalledWith(
      expect.anything(),
      "123"
    );
  });

  test("POST /achievements/entries - should return 400 for invalid request", async () => {
    const res = await request(app).post("/achievements/entries").send({});

    expect(res.status).toBe(400);
  });
});
