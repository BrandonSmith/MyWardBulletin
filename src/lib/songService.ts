import { LDS_HYMNS, getHymnTitle, getHymnUrl, isValidHymnNumber, searchHymnByTitle } from '../data/hymns';
import { CHILDRENS_SONGBOOK, getChildrensSongTitle, getChildrensSongUrl, isValidChildrensSongNumber, searchChildrensSongByTitle } from '../data/childrensSongbook';

export type SongType = 'hymn' | 'childrens';

export interface SongResult {
  number: string;
  title: string;
  type: SongType;
  url: string;
}

export interface SongSearchResult {
  number: string;
  title: string;
  type: SongType;
}

// Combined search function that searches both hymn types
export const searchSongsByTitle = (searchTerm: string, songType?: SongType): SongSearchResult[] => {
  if (!searchTerm.trim()) return [];
  
  const results: SongSearchResult[] = [];
  
  // Search hymns if no specific type or if hymns requested
  if (!songType || songType === 'hymn') {
    const hymnResults = searchHymnByTitle(searchTerm);
    results.push(...hymnResults.map(result => ({
      number: result.number.toString(),
      title: result.title,
      type: 'hymn' as SongType
    })));
  }
  
  // Search children's songs if no specific type or if children's songs requested
  if (!songType || songType === 'childrens') {
    const childrensResults = searchChildrensSongByTitle(searchTerm);
    results.push(...childrensResults.map(result => ({
      number: result.number,
      title: result.title,
      type: 'childrens' as SongType
    })));
  }
  
  // Sort by relevance (exact matches first, then by type, then by number)
  return results.sort((a, b) => {
    const term = searchTerm.toLowerCase().trim();
    const aExact = a.title.toLowerCase().startsWith(term);
    const bExact = b.title.toLowerCase().startsWith(term);
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    // If both are exact or both are not exact, sort by type (hymns first), then by number
    if (a.type !== b.type) {
      return a.type === 'hymn' ? -1 : 1;
    }
    
    // For hymns, sort by numeric value
    if (a.type === 'hymn') {
      return parseInt(a.number) - parseInt(b.number);
    }
    
    // For children's songs, sort by numeric part first, then by letter suffix
    const aNum = parseInt(a.number.replace(/[a-z]/g, ''));
    const bNum = parseInt(b.number.replace(/[a-z]/g, ''));
    if (aNum !== bNum) return aNum - bNum;
    
    // If same number, sort by letter (a comes before b)
    return a.number.localeCompare(b.number);
  }).slice(0, 10); // Limit to 10 results
};

// Get song title by number and type
export const getSongTitle = (number: string, type: SongType): string => {
  if (type === 'hymn') {
    return getHymnTitle(parseInt(number));
  } else {
    return getChildrensSongTitle(number);
  }
};

// Get song URL by number and type
export const getSongUrl = (number: string, type: SongType): string => {
  if (type === 'hymn') {
    return getHymnUrl(parseInt(number));
  } else {
    return getChildrensSongUrl(number);
  }
};

// Validate song number by type
export const isValidSongNumber = (number: string, type: SongType): boolean => {
  if (type === 'hymn') {
    return isValidHymnNumber(parseInt(number));
  } else {
    return isValidChildrensSongNumber(number);
  }
};

// Get song info by number and type
export const getSongInfo = (number: string, type: SongType): SongResult | null => {
  const title = getSongTitle(number, type);
  if (!title) return null;
  
  return {
    number,
    title,
    type,
    url: getSongUrl(number, type)
  };
};

// Check if a number exists in both hymn types (for conflict detection)
export const getConflictingSongs = (number: string): SongResult[] => {
  const results: SongResult[] = [];
  
  if (isValidHymnNumber(parseInt(number))) {
    results.push({
      number,
      title: getHymnTitle(parseInt(number)),
      type: 'hymn',
      url: getHymnUrl(parseInt(number))
    });
  }
  
  if (isValidChildrensSongNumber(number)) {
    results.push({
      number,
      title: getChildrensSongTitle(number),
      type: 'childrens',
      url: getChildrensSongUrl(number)
    });
  }
  
  return results;
};

// Get all available song numbers for a specific type
export const getAvailableSongNumbers = (type: SongType): string[] => {
  if (type === 'hymn') {
    return Object.keys(LDS_HYMNS).sort((a, b) => parseInt(a) - parseInt(b));
  } else {
    return Object.keys(CHILDRENS_SONGBOOK).sort((a, b) => {
      const aNum = parseInt(a.replace(/[a-z]/g, ''));
      const bNum = parseInt(b.replace(/[a-z]/g, ''));
      if (aNum !== bNum) return aNum - bNum;
      return a.localeCompare(b);
    });
  }
};

// Get song type display name
export const getSongTypeDisplayName = (type: SongType): string => {
  return type === 'hymn' ? 'Hymn' : 'Children\'s Song';
};

// Get song type short name for UI
export const getSongTypeShortName = (type: SongType): string => {
  return type === 'hymn' ? 'H' : 'CS';
}; 