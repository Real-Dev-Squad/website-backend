import { MAX_USERNAME_LENGTH } from "../constants/users.js";

/**
 * Formats a username by sanitizing the first and last names (removing non-alphabetical characters),
 * ensuring that it fits within a 32-character limit, and appending a suffix to guarantee uniqueness.
 * If the last name contains two words, they are joined by a hyphen and counted towards the limit.
 * 
 * @param {string} firstName - The user's first name, which will be sanitized and truncated if necessary.
 * @param {string} lastName - The user's last name, which will be sanitized and potentially hyphenated if it contains two words.
 * @param {number} suffix - A unique numeric suffix appended to the username to ensure it is unique.
 * @returns {string} - The formatted username with the suffix, within the 32-character limit.
 */
export const formatUsername = (firstName: string, lastName: string, suffix: number): string => {
    const sanitizeName = (name: string): string => {
        return name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    };

    const sanitizedFirstName = sanitizeName(firstName.trim().split(/\s+/)[0]);

    const lastNameParts = lastName.trim().split(/\s+/);
    const sanitizedLastName = lastNameParts.map(sanitizeName).join('-');

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