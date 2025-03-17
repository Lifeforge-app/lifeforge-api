import PocketBase from "pocketbase";
import {
  IIdeaBoxEntry,
  IIdeaBoxFolder,
  IIdeaBoxTag,
} from "../../../interfaces/ideabox_interfaces";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";

export const getIdeas = async (
  pb: PocketBase,
  container: string,
  folder: string,
  archived: string,
) => {
  const filter = `container = "${container}" && archived = ${archived || "false"} ${
    folder ? `&& folder = "${folder}"` : "&& folder=''"
  }`;

  const ideas = await pb
    .collection("idea_box_entries")
    .getList<IIdeaBoxEntry>(1, 50, {
      filter,
      sort: "-pinned,-created",
    });

  return ideas.items;
};

export const validateFolderPath = async (
  pb: PocketBase,
  container: string,
  path: string[],
) => {
  let folderExists = true;
  let lastFolder = "";

  for (const folder of path) {
    try {
      const folderEntry = await pb
        .collection("idea_box_folders")
        .getOne<IIdeaBoxFolder>(folder);

      if (
        folderEntry.parent !== lastFolder ||
        folderEntry.container !== container
      ) {
        folderExists = false;
        break;
      }

      lastFolder = folder;
    } catch (error) {
      folderExists = false;
      break;
    }
  }

  return { folderExists, lastFolder };
};

export const createIdea = async (
  pb: PocketBase,
  data: WithoutPBDefault<
    Omit<IIdeaBoxEntry, "image" | "pinned" | "archived">
  > & {
    image?: File;
  },
) => {
  try {
    const idea: IIdeaBoxEntry = await pb
      .collection("idea_box_entries")
      .create(data);

    await pb.collection("idea_box_containers").update(data.container, {
      [`${data.type}_count+`]: 1,
    });

    return idea;
  } catch (error) {
    throw error;
  }
};

export const updateIdeaTags = async (
  pb: PocketBase,
  idea: IIdeaBoxEntry,
  oldTags: string[] = [],
) => {
  try {
    // Remove tags that are no longer present
    for (const tag of oldTags || []) {
      if (idea.tags?.includes(tag)) continue;

      const tagEntry = await pb
        .collection("idea_box_tags")
        .getFirstListItem<IIdeaBoxTag>(
          `name = "${tag}" && container = "${idea.container}"`,
        );

      if (tagEntry) {
        if (tagEntry.count === 1) {
          await pb.collection("idea_box_tags").delete(tagEntry.id);
        } else {
          await pb.collection("idea_box_tags").update(tagEntry.id, {
            "count-": 1,
          });
        }
      }
    }

    // Add new tags
    for (const tag of idea.tags || []) {
      if (oldTags?.includes(tag)) continue;

      try {
        const tagEntry = await pb
          .collection("idea_box_tags")
          .getFirstListItem(
            `name = "${tag}" && container = "${idea.container}"`,
          );

        await pb.collection("idea_box_tags").update(tagEntry.id, {
          "count+": 1,
        });
      } catch (error) {
        await pb.collection("idea_box_tags").create({
          name: tag,
          container: idea.container,
          count: 1,
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

export const updateIdea = async (
  pb: PocketBase,
  id: string,
  data: Partial<IIdeaBoxEntry>,
) => {
  try {
    const oldEntry = await pb
      .collection("idea_box_entries")
      .getOne<IIdeaBoxEntry>(id);
    const entry: IIdeaBoxEntry = await pb
      .collection("idea_box_entries")
      .update(id, data);

    if (oldEntry.type !== entry.type) {
      await pb.collection("idea_box_containers").update(entry.container, {
        [`${oldEntry.type}_count-`]: 1,
        [`${entry.type}_count+`]: 1,
      });
    }

    return { entry, oldEntry };
  } catch (error) {
    throw error;
  }
};

export const deleteIdea = async (pb: PocketBase, id: string) => {
  try {
    const idea = await pb
      .collection("idea_box_entries")
      .getOne<IIdeaBoxEntry>(id);
    await pb.collection("idea_box_entries").delete(id);

    await pb.collection("idea_box_containers").update(idea.container, {
      [`${idea.type}_count-`]: 1,
    });

    return idea;
  } catch (error) {
    throw error;
  }
};

export const updatePinStatus = async (pb: PocketBase, id: string) => {
  try {
    const idea = await pb
      .collection("idea_box_entries")
      .getOne<IIdeaBoxEntry>(id);
    const entry: IIdeaBoxEntry = await pb
      .collection("idea_box_entries")
      .update(id, {
        pinned: !idea.pinned,
      });

    return entry;
  } catch (error) {
    throw error;
  }
};

export const updateArchiveStatus = async (pb: PocketBase, id: string) => {
  try {
    const idea = await pb
      .collection("idea_box_entries")
      .getOne<IIdeaBoxEntry>(id);
    const entry: IIdeaBoxEntry = await pb
      .collection("idea_box_entries")
      .update(id, {
        archived: !idea.archived,
        pinned: false,
      });

    return entry;
  } catch (error) {
    throw error;
  }
};

export const moveIdea = async (pb: PocketBase, id: string, target: string) => {
  try {
    const entry: IIdeaBoxEntry = await pb
      .collection("idea_box_entries")
      .update(id, {
        folder: target,
      });

    return entry;
  } catch (error) {
    throw error;
  }
};

export const removeFromFolder = async (pb: PocketBase, id: string) => {
  try {
    const entry = await pb
      .collection("idea_box_entries")
      .update<IIdeaBoxEntry>(id, {
        folder: "",
      });

    return entry;
  } catch (error) {
    throw error;
  }
};
