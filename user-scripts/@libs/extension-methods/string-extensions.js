export const trimIndent = Symbol('String.trimIndent')

String.prototype[trimIndent] = function trimIndex() {
  // Get indent
  const splitNewLine = this.split('\n')
  const minIndent = splitNewLine[splitNewLine.length - 1]

  // Remove indent
  let newString = this.replaceAll('\n' + minIndent, '\n')
  // Remove start and end new lines
  newString = newString.slice(1, -1)

  return newString
}
