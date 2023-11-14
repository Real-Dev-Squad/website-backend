/**
 * Middleware function for removing sensitive fields from the response object
 * based on user roles and predefined rules.
 *
 * @param {Object} options - Options for configuring the middleware.
 * @param {Array<Object>} options.rules - An array of rules specifying which fields
 *   to remove based on allowed roles and key paths.
 *   - `keyPath` {string}: A key path (e.g., 'sensitive.field1') representing the field
 *     or subfield in the response object. You can use a wildcard (*) to match multiple
 *     subfields (e.g., 'sensitive.*' to match all subfields under 'sensitive').
 *   - `allowedRoles` {Array<string>}: An array of user roles that are allowed to access
 *     the field specified by the `keyPath`. If the user has one of these roles, the field
 *     will not be removed.
 * @returns {Function} - Express middleware function.
 *
 * @example
 * // Define rules for removing fields based on user roles
 * const rules = [
 *   {
 *     allowedRoles: [SUPERUSER,MEMBER],
 *     keyPath: 'sensitive.field1',
 *   },
 *   {
 *     allowedRoles: [SUPERUSER],
 *     keyPath: 'sensitive.field2',
 *   },
 *   {
 *     allowedRoles: [SUPERUSER],
 *     keyPath: 'sensitive.*', // Using a wildcard (*) to match all subfields under 'sensitive'
 *   },
 * ];
 * // Use the middleware in your Express app
 * app.use(dataAccessMiddleware({ rules }));
 */
const dataAccessMiddleware = (options = {}) => {
  const rules = options.rules;

  return (req, res, next) => {
    try {
      const { roles = {} } = req.userData;

      const oldSend = res.send;

      res.send = (body) => {
        for (const rule of rules) {
          const userHasPermission = rule?.allowedRoles?.some((role) => roles[`${role}`]);

          if (typeof body === "string") {
            body = JSON.parse(body);
          }
          if (!userHasPermission) {
            removeObjectField(rule.keyPath, body);
          }
        }
        res.send = oldSend;
        return res.send(body);
      };
    } catch (error) {
      logger.error(`Error ocurred while removing sensitive fields: ${error}`);
    } finally {
      next();
    }
  };
};

/**
 * Recursively removes a field or a set of fields from an object based on a given path.
 *
 * @param {string} path - The path specifying the field(s) to remove. You can use dot notation
 *   to traverse nested objects and use a wildcard (*) to match multiple subfields.
 * @param {object} object - The object from which the field(s) will be removed.
 */
function removeObjectField(path, object) {
  if (!object) {
    return;
  }
  const pathString = path;
  const pathList = pathString.split(".");
  const lastKey = pathList.pop();

  let currentObj = object;
  for (let i = 0; i < pathList.length; i++) {
    const key = pathList[i];
    if (key === "*") {
      if (typeof currentObj !== "object") {
        continue;
      }
      let newPath = "";
      for (let j = i + 1; j < pathList.length; j++) {
        newPath += pathList[j] + ".";
      }
      newPath += lastKey;

      for (const childObj of currentObj) {
        removeObjectField(newPath, childObj);
      }
      break;
    } else if (Object.prototype.hasOwnProperty.call(currentObj, key) && typeof currentObj[key] === "object") {
      currentObj = currentObj[key];
    } else {
      break;
    }
  }
  if (lastKey === "*") {
    Object.keys(currentObj).forEach((key) => delete currentObj[key]);
  } else if (Object.prototype.hasOwnProperty.call(currentObj, lastKey)) {
    delete currentObj[lastKey];
  }
}

module.exports = {
  removeObjectField,
  dataAccessMiddleware,
};
