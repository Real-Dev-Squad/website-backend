const { MAX_USERNAME_LENGTH } = require("../constants/users");

export const formatUsername = (firstName: string, lastName: string, suffix: number): string => {
    const sanitizeName = (name: string): string => {
        return name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    };

    const sanitizedFirstName = sanitizeName(firstName.trim().split(/\s+/)[0]);
    const sanitizedLastName = sanitizeName(lastName.trim());

    const validFirstName = sanitizedFirstName || "null";
    const validLastName = sanitizedLastName || "null";

    let baseUsername = `${validFirstName}-${validLastName}`;

    const maxBaseLength = MAX_USERNAME_LENGTH - suffix.toString().length - 1;
    if (baseUsername.length > maxBaseLength) {
        const availableLastNameLength = maxBaseLength - validFirstName.length - 1;
        baseUsername = `${validFirstName}-${validLastName.slice(0, availableLastNameLength)}`;
    }

    const finalUsername = `${baseUsername}-${suffix}`;

    return finalUsername;
};