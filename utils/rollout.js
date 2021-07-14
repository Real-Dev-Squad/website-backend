const crypto = require('crypto')

const generateUUID = () => {
  return crypto.randomBytes(8).toString('hex')
}

/**
 * Calculate a numerical hash for a string.
 * Refer:
 *   - https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 *   - https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * @param {String} str: String for which hash number should be generated.
 * @returns {Int}: A hash number for the input string.
 */
const hashCode = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0
  }
  return Math.abs(hash)
}

/**
 * Check if the user has any one of the roles that are allowed for this feature.
 * @param {Array} allowedRoles: Array of roles for whom the feature should be enabled.
 * @param {Object} userRoles: roles assigned to a user.
 */
const roleBasedRollout = (allowedRoles, userRoles) => {
  return allowedRoles.some((role) => {
    return Boolean(userRoles[`${role}`])
  })
}

/**
 * Rollout the feature to a percentage of users. We use bucket based percentage rollout.
 * The logic:
 *   - Take modulus of an identifier with 100
 *   - Check whether the modulus is greater than the percentage rollout value.
 * Note:
 *   - The identifier should be evenly distributed.
 *   - userId is used as identifier if present in order to make rollout monotonic.
 *
 * @param {int} percentValue: Percentage value between 0 to 100
 * @param {String} userId: Id of the logged in user if present
 */
const percentageRollout = (percentValue, userId) => {
  if (percentValue > 100) {
    throw Error('Invalid percentage rollout value')
  }

  const indentifier = userId || generateUUID()
  const hash = hashCode(indentifier)
  return (hash % 100) < percentValue
}

/**
 * Check the featureFlag and determine whether this flag is enabled for this request.
 * Use user details if the data is available.
 *
 * 3 types of rollout configs are supported (in priority order):
 *   a. Role based rollout:
 *     - A list of roles is provided. If the user belongs to any of the roles, then feature is enabled.
 *       Note: If userData is provided but doesn't match role, we don't fallback to other rollout but disable the feature.
 *     - If userData is missing, it will fallback to the next type of rollout config.
 *   b. Percentage rollout:
 *     - Rollout to a certain percentage of users.
 *     - User details are used to make this rollout monotonic.
 *     - If usrData is missing, then the rollout is done randomly.
 *   c. Toggle rollout:
 *     - A boolean toggle to either disable or enable the feature.
 *     - This will the be the value considered when the above rollout are not configured.
 *
 * The schema for featureFlag config:
 * config = {
 *   roleBased: {
 *     roles: [Array[String]]<An array of allowed roles - role based rollout>
 *     active: [Boolean]<whether this rollout method is active>
 *   },
 *   percentage: {
 *     value: [Integer]<percentage of users for which rollout this feature - percentage rollout>
 *     active: [Boolean]<whether this rollout method is active>
 *   },
 *   enabled: [Boolean]<whether the featureFlag is enabled - toggle rollout>
 * }
 * @param {Object} featureFlag: Featureflag object from the database.
 * @param {Object} userData: Details of the user if request is authenticated. Else null.
 * @return {Boolean}: Whether this feature should be enabled or disabled for this request.
 */
const featureFlagRollout = (featureFlag, userData) => {
  if (!featureFlag.config) {
    throw Error('Feature flag config is absent')
  }

  const { roleBased, percentage, enabled } = featureFlag.config

  // Check if roleBased rollout can be used
  if (roleBased && roleBased.active && userData) {
    return roleBasedRollout(roleBased.roles || [], userData.roles || {})
  }

  // Check if percentage rollout can be used
  if (percentage && percentage.active) {
    return percentageRollout(percentage.value, userData && userData.id)
  }

  return enabled
}

module.exports = {
  featureFlagRollout
}
