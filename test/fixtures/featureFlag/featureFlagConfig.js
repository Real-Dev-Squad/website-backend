const percentageConfig = {
  config: {
    roleBased: {
      roles: [],
      active: false
    },
    percentage: {
      value: 75,
      active: true
    },
    enabled: false
  }
}

const roleBasedConfig = {
  config: {
    roleBased: {
      roles: ['app_owner'],
      active: true
    },
    percentage: {
      value: 0,
      active: false
    },
    enabled: false
  }
}

const toggleConfig = {
  config: {
    roleBased: {
      roles: [],
      active: false
    },
    percentage: {
      value: 0,
      active: false
    },
    enabled: true
  }
}

module.exports = {
  percentageConfig,
  roleBasedConfig,
  toggleConfig
}
