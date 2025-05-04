import { SOMETHING_WENT_WRONG } from "../constants/errorMessages.js";
import { getOrCreateGoalUser } from "../services/goalService.js";

export const getGoalSiteToken = async (req, res) => {
  try {
    const { roles, id: userId } = req.userData;

    const goalApiResponse = await getOrCreateGoalUser({ userId, roles });

    if (goalApiResponse.status === 201) {
      let goalApiData = await goalApiResponse.json();
      goalApiData = goalApiData.data;
      const userData = goalApiData.attributes;
      return res.status(200).json({ message: "success", user: { ...userData, id: goalApiData.id } });
    }
    return res.status(goalApiResponse.status).json({ message: "error" });
  } catch {
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};
