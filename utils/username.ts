const { MAX_USERNAME_LENGTH } = require("../constants/users");

export const formatUsername = (firstName: string, lastName: string, suffix: number) => {
    const trimmedFirstName = firstName ? firstName.trim() : "";
    const trimmedLastName = lastName ? lastName.trim() : "";
  
    const actualFirstName = /^[a-zA-Z]+$/.test(trimmedFirstName) ? trimmedFirstName.split(" ")[0].toLowerCase() : "null";
    const actualLastName = /^[a-zA-Z]+$/.test(trimmedLastName) ? trimmedLastName.toLowerCase() : "null";
  
    let baseUsername = `${actualFirstName}-${actualLastName}`;
  
    let finalUsername = `${baseUsername}-${suffix}`;
  
    if (finalUsername.length > MAX_USERNAME_LENGTH) {
      const excessLength = finalUsername.length - MAX_USERNAME_LENGTH;
      baseUsername = `${actualFirstName}-${actualLastName.slice(0, actualLastName.length - excessLength)}`;
      finalUsername = `${baseUsername}-${suffix}`;
    }
  
    return finalUsername;
  };