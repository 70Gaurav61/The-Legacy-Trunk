import Story from "../models/Story.js";
import tagger from "../utils/tagger.js";

export const createStory = async (req, res, next) => {
  try {
    const { title, content, circle, collaborators } = req.body;
    const story = await Story.create({
      title,
      content,
      author: req.user._id,
      circle,
      collaborators,
    });

    if (content) {
      const tags = tagger.extractTags(content);
      story.tags = tags;
      await story.save();
    }

    res.status(201).json(story);
  } catch (err) {
    next(err);
  }
};

export const listStories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    const query = tag ? { tags: tag } : {};
    const stories = await Story.find(query)
      .populate("author", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ page, limit, data: stories });
  } catch (err) {
    next(err);
  }
};
