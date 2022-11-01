export const lowerCaseToHyphen = string => string.split(/(?=[A-Z])/).map(str => str.toLowerCase()).join('-')

export const hyphenToLowerCase = string => string.split('-').map((str, index) => index !== 0 ? str[0].toUpperCase() + str.slice(1) : str).join('')

export function trimIndent(string) {
  // Get indent
  const splitNewLine = string.split('\n')
  const minIndent = splitNewLine[splitNewLine.length - 1]

  // Remove indent
  let newString = string.replaceAll('\n' + minIndent, '\n')
  // Remove start and end new lines
  newString = newString.slice(1, -1)

  return newString
}
