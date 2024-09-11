const { MAX_USERNAME_LENGTH } = require("../constants/users");

export const formatUsername = (firstName: string, lastName: string, suffix: number): string => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    const firstNamePart = trimmedFirstName.split(/[\s-]/)[0];
    const validFirstName = /^[a-zA-Z]+$/.test(firstNamePart)
        ? firstNamePart.toLowerCase()
        : "null";

    const lastNameParts = trimmedLastName.split(/[\s-]/);
    const lastNamePart = lastNameParts[lastNameParts.length - 1];
    const validLastName = /^[a-zA-Z]+$/.test(lastNamePart)
        ? lastNamePart.toLowerCase()
        : "null";

    const baseUsername = `${validFirstName}-${validLastName}`;
    let finalUsername = `${baseUsername}-${suffix}`;

    if (finalUsername.length > MAX_USERNAME_LENGTH) {
        const availableLength = MAX_USERNAME_LENGTH - validFirstName.length - suffix.toString().length - 2;
        const truncatedLastName = validLastName.slice(0, Math.max(1, availableLength));
        const truncatedBaseUsername = `${validFirstName}-${truncatedLastName}`;
        finalUsername = `${truncatedBaseUsername}-${suffix}`;
    }

    return finalUsername;
};