export const lowerCaseToHyphen = string => string.split(/(?=[A-Z])/).map(str => str.toLowerCase()).join('-')

export const hyphenToLowerCase = string => string.split('-').map((str, index) => index !== 0 ? str[0].toUpperCase() + str.slice(1) : str).join('')
