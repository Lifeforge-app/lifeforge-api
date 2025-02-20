import PocketBase from "pocketbase";

import * as achievementsService from "../services/entriesService";
import { IAchievementEntry } from "../../../interfaces/achievements_interfaces";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";

jest.mock("pocketbase");

describe("Achievements Service", () => {
  let pbMock: any;

  const mockEntry: WithoutPBDefault<IAchievementEntry> = {
    difficulty: "hard",
    title: "Achievement Title",
    thoughts: "This was tough!",
  };

  beforeEach(() => {
    pbMock = new PocketBase();
    jest.clearAllMocks(); // Reset mock calls before each test
  });

  test("should fetch all entries by difficulty", async () => {
    (pbMock.collection().getFullList as jest.Mock).mockResolvedValue([
      mockEntry,
    ]);

    const result = await achievementsService.getAllEntriesByDifficulty(
      pbMock,
      "hard"
    );

    expect(pbMock.collection).toHaveBeenCalledWith("achievements_entries");
    expect(pbMock.collection().getFullList).toHaveBeenCalled();
    expect(result).toEqual([mockEntry]);
  });

  test("should create an achievement entry", async () => {
    (pbMock.collection().create as jest.Mock).mockResolvedValue(mockEntry);

    const result = await achievementsService.createEntry(pbMock, {
      difficulty: "hard",
      title: "New Achievement",
      thoughts: "Great job!",
    });

    expect(pbMock.collection).toHaveBeenCalledWith("achievements_entries");
    expect(pbMock.collection().create).toHaveBeenCalledWith({
      difficulty: "hard",
      title: "New Achievement",
      thoughts: "Great job!",
    });
    expect(result).toEqual(mockEntry);
  });

  test("should update an achievement entry", async () => {
    (pbMock.collection().update as jest.Mock).mockResolvedValue(mockEntry);

    const result = await achievementsService.updateEntry(pbMock, "123", {
      difficulty: "hard",
      title: "Updated Achievement",
      thoughts: "Now even harder!",
    });

    expect(pbMock.collection).toHaveBeenCalledWith("achievements_entries");
    expect(pbMock.collection().update).toHaveBeenCalledWith("123", {
      difficulty: "hard",
      title: "Updated Achievement",
      thoughts: "Now even harder!",
    });
    expect(result).toEqual(mockEntry);
  });

  test("should delete an achievement entry", async () => {
    (pbMock.collection().delete as jest.Mock).mockResolvedValue(true);

    const result = await achievementsService.deleteEntry(pbMock, "123");

    expect(pbMock.collection).toHaveBeenCalledWith("achievements_entries");
    expect(pbMock.collection().delete).toHaveBeenCalledWith("123");
    expect(result).toBe(true);
  });
});
