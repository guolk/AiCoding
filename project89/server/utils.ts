export function parseJsonField<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue
  try {
    return JSON.parse(value) as T
  } catch {
    return defaultValue
  }
}

export function stringifyJsonField(value: any): string {
  return JSON.stringify(value)
}

export function transformWine(wine: any): any {
  return {
    ...wine,
    grapeVarieties: parseJsonField(wine.grapeVarieties, [])
  }
}

export function transformTastingNote(note: any): any {
  return {
    ...note,
    aromaDescriptors: parseJsonField(note.aromaDescriptors, []),
    tasteDescriptors: parseJsonField(note.tasteDescriptors, [])
  }
}

export function transformUserPreference(prefs: any): any {
  return {
    ...prefs,
    favoriteTypes: parseJsonField(prefs.favoriteTypes, []),
    favoriteRegions: parseJsonField(prefs.favoriteRegions, []),
    favoriteGrapes: parseJsonField(prefs.favoriteGrapes, [])
  }
}
