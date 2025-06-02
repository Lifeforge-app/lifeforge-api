import express, { Request } from "express";
import { query } from "express-validator";

import asyncWrapper from "@utils/asyncWrapper";
import { clientError, successWithBaseResponse } from "@utils/response";

const router = express.Router();

router.get(
  "/lines",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    const lines = await pb.collection("railway_map_lines").getFullList();

    successWithBaseResponse(res, lines);
  }),
);

router.get(
  "/stations",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    const stations = await pb.collection("railway_map_stations").getFullList();

    successWithBaseResponse(res, stations);
  }),
);

function dijkstraWithTransfers(
  graph: Record<string, Record<string, number>>,
  lines: Record<string, string[]>,
  start: string,
  end: string,
) {
  let distances: Record<string, number> = {};
  let prev: Record<string, string | null> = {};
  let unvisited = new Set(Object.keys(graph));

  for (let node of unvisited) {
    distances[node] = Infinity;
    prev[node] = null;
  }
  distances[start] = 0;

  while (unvisited.size > 0) {
    let minNode = [...unvisited].reduce((a, b) =>
      distances[a] < distances[b] ? a : b,
    );

    if (minNode === end) break;
    unvisited.delete(minNode);

    for (let neighbor in graph[minNode]) {
      let newDist = distances[minNode] + graph[minNode][neighbor];

      let prevStation = prev[minNode];
      let nextStation = neighbor;

      if (prevStation && nextStation) {
        let prevLines = lines[prevStation] || [];
        let currLines = lines[minNode] || [];
        let nextLines = lines[nextStation] || [];

        let sameLine = currLines.some(
          (line) => prevLines.includes(line) && nextLines.includes(line),
        );

        if (!sameLine) {
          newDist += ["Newton", "Tampanies"].includes(minNode) ? 10 : 5;
        }
      }

      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        prev[neighbor] = minNode;
      }
    }
  }

  let path = [];
  let temp: string | null = end;
  while (temp) {
    path.unshift(temp);
    temp = prev[temp];
  }
  return path.length > 1 ? path : null;
}

router.get(
  "/shortest",
  [query("start").isString().notEmpty(), query("end").isString().notEmpty()],
  asyncWrapper(async (req: Request, res) => {
    const { pb } = req;
    const { start, end } = req.query as Record<string, string>;

    const allStations = await pb
      .collection("railway_map_stations")
      .getFullList();

    if (
      ![start, end].every((station) =>
        allStations.some((s) => s.id === station),
      )
    ) {
      clientError(res, "Invalid start or end station");
      return;
    }

    const graphWithWeight = allStations.reduce<
      Record<string, Record<string, number>>
    >((acc, station) => {
      if (!station.distances) return acc;
      acc[station.name] = Object.fromEntries(
        Object.entries(station.distances).map(([name, distance]) => [
          name,
          distance,
        ]),
      ) as Record<string, number>;
      return acc;
    }, {});

    const lines = allStations.reduce<Record<string, string[]>>(
      (acc, station) => {
        acc[station.name] = station.lines ?? [];
        return acc;
      },
      {},
    );

    const path = dijkstraWithTransfers(
      graphWithWeight,
      lines,
      allStations.find((s) => s.id === start)?.name ?? "",
      allStations.find((s) => s.id === end)?.name ?? "",
    );

    if (!path) {
      clientError(res, "No path found");
      return;
    }

    successWithBaseResponse(
      res,
      path
        .map((station) => allStations.find((s) => s.name === station))
        .filter((s) => !!s),
    );
  }),
);

export default router;
