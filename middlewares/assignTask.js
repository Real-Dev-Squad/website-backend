const { fetchSkillLevelTask } = require("../models/tasks");
const db = require("../utils/firestore");

const assignTask = async function (req, res) {
  try {
    const { task } = await fetchSkillLevelTask("frontend", 1);
    if (task) {
      const docId = task.id;
      const userId = req.userData.id;
      db.collection("tasks").doc(docId).set({ assignee: userId, status: "ASSIGNED" }, { merge: true });
      return res.json({ message: "task updated and another task got assigned" });
    } else {
      return res.json({ message: "Task updated but another task not found" });
    }
  } catch {
    return res.boom.badImplementation("Something went wrong!");
  }
};

module.exports = assignTask;
