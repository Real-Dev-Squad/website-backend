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
  if (!object || typeof path !== "string") return;

  const pathList = path.split(".");
  const lastKey = pathList.pop();
  let currentObj = object;

  const forbiddenKeys = new Set(["__proto__", "constructor", "prototype"]);

  for (const rawKey of pathList) {
    if (typeof rawKey !== "string") continue;
    if (forbiddenKeys.has(rawKey)) return;

    const key = rawKey;

    if (key === "*") {
      if (typeof currentObj !== "object" || currentObj === null) continue;

      const nextPath = [...pathList.slice(pathList.indexOf(key) + 1), lastKey].join(".");
      for (const child of Object.values(currentObj)) {
        if (child && typeof child === "object") {
          removeObjectField(nextPath, child);
        }
      }
      return;
    }

    const nextValue = Reflect.get(currentObj, key);
    if (typeof nextValue === "object" && nextValue !== null && Reflect.has(currentObj, key)) {
      currentObj = nextValue;
    } else {
      return;
    }
  }

  if (lastKey === "*") {
    if (typeof currentObj === "object" && currentObj !== null) {
      for (const key of Object.keys(currentObj)) {
        if (!forbiddenKeys.has(key)) Reflect.deleteProperty(currentObj, key);
      }
    }
  } else if (!forbiddenKeys.has(lastKey) && Reflect.has(currentObj, lastKey)) {
    Reflect.deleteProperty(currentObj, lastKey);
  }
}

module.exports = {
  removeObjectField,
  dataAccessMiddleware,
};
