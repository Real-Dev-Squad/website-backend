const progressUpdates = require("../models/progressUpdates");
const tasks = require("../models/tasks");

const logger = require("../utils/logger");

const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

const markTaskMonitored = async (req, res) => {
  const taskId = req.params.taskId;
  const { taskData } = await tasks.fetchTask(taskId);
  let message = "task marked for Progress Updates";
  if (!taskData) {
    return res.boom.notFound("task id not found");
  }
  const { monitored, frequency } = req.body;
  if (monitored === false) {
    message = "task unmarked for Progress Updates";
  }
  const storedTask = await tasks.updateTask({ monitored, frequency }, taskId);
  if (storedTask.taskId) {
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  } else {
    return res.status(200).json({
      id: taskId,
      message,
    });
  }
};

const saveProgressUpdates = async (req, res) => {
  const taskId = req.params.taskId;
  const { taskData } = await tasks.fetchTask(taskId);
  if (!taskData) {
    return res.boom.notFound("task id not found");
  }
  const userId = req.userData.id;
  const { timestamp, progress, plan, blockers } = req.body;
  const progressData = {
    task_id: taskId,
    user_id: userId,
    timestamp,
    progress,
    plan,
    blockers,
  };
  try {
    const result = await progressUpdates.addProgressUpdates(progressData);
    if (result.id) {
      return res.status(200).json({
        message: "task update added successfully",
        taskId,
      });
    } else {
      return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
    }
  } catch (err) {
    logger.error(`Could not save the progress data`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

const getLatestProgress = async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.params.userId;
  let taskData;
  if (taskId) {
    taskData = await progressUpdates.getLatestProgress("TASK", taskId);
  } else {
    taskData = await progressUpdates.getLatestProgress("USER", userId);
  }
  if (!taskData.id) {
    return res.status(200).json({
      ...taskData.data,
    });
  } else {
    return res.boom.notFound("task progress not found");
  }
};

module.exports = {
  saveProgressUpdates,
  getLatestProgress,
  markTaskMonitored,
};
