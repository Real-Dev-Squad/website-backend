const { fetchSkillLevelTask } = require("../models/tasks");
const firestore = require("../utils/firestore");
const tasks = firestore.collection("tasks");

const assignTask = async function (req, res) {
  try {
    // this hardcoded value will be removed once we have user skill
    const { task } = await fetchSkillLevelTask("FRONTEND", 1);
    if (!task) return res.json({ message: "Task updated but another task not found" });

    const docId = task.id;
    const userId = req.userData.id;
    await tasks.doc(docId).set({ assignee: userId, status: "ASSIGNED" }, { merge: true });
    return res.json({ message: "task updated and another task got assigned" });
  } catch {
    return res.boom.badImplementation("Something went wrong!");
  }
};

module.exports = assignTask;
