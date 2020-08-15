/**
 * Returns the boolean config data amongst the passed envValue and defaultValue.
 * This is required as adding any logical expression in the config files like `process.env.ENABLE_LOGS || true`
 * will always result in true due to the OR condition
 *
 * @param {boolean} envValue - Value passed from the environment
 * @param {boolean} defaultValue - default Value for the config
 * @return {boolean} - Returns
 */
const setBooleanConfig = (envValue, defaultValue) => {
  if (['true', 'false'].includes(envValue)) {
    return envValue.toLowerCase() === 'true' // return the boolean value for the provided stringified env value
  }

  return defaultValue
}

module.exports = {
  setBooleanConfig
}
