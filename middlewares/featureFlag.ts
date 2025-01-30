import { Request, Response, NextFunction } from 'express';
const config = require("config");

const featureFlagMiddleware = (featureFlagId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userCookie = req.cookies[config.get("userToken.cookieName")];

    if (!featureFlagId || !userCookie) {
      return res.status(400).json({ message: 'Feature flag ID and user cookie are required' });
    }

    const featureFlagServiceUrl = config.get('services.featureFlag.baseUrl');
    const cookieName = config.get('userToken.cookieName');

    try {
      const response = await fetch(`${featureFlagServiceUrl}/feature-flags/${featureFlagId}`, {
        headers: {
          'Cookie': `${cookieName}=${userCookie}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'ENABLED') {
        return next();
      } else {
        return res.status(403).json({ message: 'Feature flag is not enabled' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error checking feature flag', error: error.message });
    }
  };
};

export default featureFlagMiddleware;
