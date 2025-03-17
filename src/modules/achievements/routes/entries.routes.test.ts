import express from "express";
import request from "supertest";
import * as EntriesController from "../controllers/entries.controller";
import {
  validateBodyData,
  validateDifficulty,
  validateId,
} from "../middlewares/entriesValidation";
import entriesRoutes from "../routes/entries.routes";

// Mock dependencies
jest.mock("../controllers/entries.controller");
jest.mock("../../../core/middleware/validationMiddleware", () =>
  jest.fn((req, res, next) => next()),
);
jest.mock("../middlewares/entriesValidation", () => ({
  validateDifficulty: jest.fn((req, res, next) => next()),
  validateBodyData: jest.fn((req, res, next) => next()),
  validateId: jest.fn((req, res, next) => next()),
}));

describe("Entries Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/", entriesRoutes);

    // Reset mocks
    jest.clearAllMocks();

    // Setup controller mocks to match actual controller behavior
    (
      EntriesController.getAllEntriesByDifficulty as jest.Mock
    ).mockImplementation((req, res) => {
      res.status(200).json({ data: [], message: "Success" });
    });

    (EntriesController.createEntry as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(201).json({
          data: {
            id: "new-id",
            difficulty: req.body.difficulty,
            title: req.body.title,
            thoughts: req.body.thoughts,
          },
          message: "Created",
        });
      },
    );

    (EntriesController.updateEntry as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({
          data: {
            id: req.params.id,
            difficulty: req.body.difficulty,
            title: req.body.title,
            thoughts: req.body.thoughts,
          },
          message: "Updated",
        });
      },
    );

    (EntriesController.deleteEntry as jest.Mock).mockImplementation(
      (req, res) => {
        // Use 204 status code as per the actual controller implementation
        res.status(204).end();
      },
    );
  });

  describe("GET /:difficulty", () => {
    it("should use validateDifficulty middleware and call getAllEntriesByDifficulty controller", async () => {
      await request(app).get("/medium");

      expect(validateDifficulty).toHaveBeenCalled();
      expect(EntriesController.getAllEntriesByDifficulty).toHaveBeenCalled();
    });

    it("should return 200 status code for a valid request", async () => {
      const response = await request(app).get("/medium");

      expect(response.status).toBe(200);
    });
  });

  describe("POST /", () => {
    it("should use validateBodyData middleware and call createEntry controller", async () => {
      await request(app).post("/").send({
        difficulty: "medium",
        title: "Test Achievement",
        thoughts: "Test thoughts",
      });

      expect(validateBodyData).toHaveBeenCalled();
      expect(EntriesController.createEntry).toHaveBeenCalled();
    });

    it("should return 201 status code for a valid request", async () => {
      const response = await request(app).post("/").send({
        difficulty: "medium",
        title: "Test Achievement",
        thoughts: "Test thoughts",
      });

      expect(response.status).toBe(201);
    });
  });

  describe("PATCH /:id", () => {
    it("should use validateId, validateBodyData middlewares and call updateEntry controller", async () => {
      await request(app).patch("/123").send({
        difficulty: "hard",
        title: "Updated Achievement",
        thoughts: "Updated thoughts",
      });

      expect(validateId).toHaveBeenCalled();
      expect(validateBodyData).toHaveBeenCalled();
      expect(EntriesController.updateEntry).toHaveBeenCalled();
    });

    it("should return 200 status code for a valid request", async () => {
      const response = await request(app).patch("/123").send({
        difficulty: "hard",
        title: "Updated Achievement",
        thoughts: "Updated thoughts",
      });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe("123");
    });
  });

  describe("DELETE /:id", () => {
    it("should use validateId middleware and call deleteEntry controller", async () => {
      await request(app).delete("/123");

      expect(validateId).toHaveBeenCalled();
      expect(EntriesController.deleteEntry).toHaveBeenCalled();
    });

    it("should return 204 status code for a valid request", async () => {
      const response = await request(app).delete("/123");

      expect(response.status).toBe(204);
    });
  });
});
