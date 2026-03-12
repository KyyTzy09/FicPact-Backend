export function getNextFolderName(baseName: string, names: string[]) {
  let max = 0

  for (const name of names) {
    if (name === baseName) {
      max = Math.max(max, 0)
      continue
    }

    const match = name.match(new RegExp(`^${baseName} (\\d+)$`))
    if (match) {
      const num = parseInt(match[1])
      max = Math.max(max, num)
    }
  }

  return max === 0 && !names.includes(baseName)
    ? baseName
    : `${baseName} ${max + 1}`
}
