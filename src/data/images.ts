// Preloaded LDS-themed images for bulletin headers
export const LDS_IMAGES = [
  {
    id: 'none',
    name: 'No Image',
    url: '',
    description: 'Plain text header without image'
  },
  {
    id: 'resurrected-christ',
    name: 'Resurrected Christ',
    url: '/resurrected_christ.jpeg',
    description: 'The Resurrected Christ'
  },
  {
    id: 'jesus-raising-lazarus',
    name: 'Jesus Raising Lazarus',
    url: '/jesus_raising_lazarus.jpeg',
    description: 'Jesus raising Lazarus from the dead'
  },
  {
    id: 'crucifixion-christ',
    name: 'Crucifixion of Christ',
    url: '/crucifixion_christ_anderson.jpeg',
    description: 'The crucifixion of Jesus Christ'
  },
  {
    id: 'living-water',
    name: 'Living Water',
    url: '/living_water_jesus_christ.jpeg',
    description: 'Jesus Christ, the Living Water'
  },
  {
    id: 'triumphant-entry',
    name: 'Triumphant Entry',
    url: '/triumphant_entry.jpeg',
    description: 'Jesus Christ\'s triumphant entry'
  },
  {
    id: 'second-coming',
    name: 'The Second Coming',
    url: '/the_second_coming.jpeg',
    description: 'The Second Coming of Jesus Christ'
  },
  {
    id: 'lost-lamb',
    name: 'Lost Lamb',
    url: '/lost_lamb_art_lds.jpeg',
    description: 'The Good Shepherd and the lost lamb'
  },
  {
    id: 'john-baptizes-christ',
    name: 'John Baptizes Christ',
    url: '/john_baptizes_christ.jpeg',
    description: 'John the Baptist baptizing Jesus Christ'
  },
  {
    id: 'jesus-at-door',
    name: 'Jesus at the Door',
    url: '/jesus_at_the_door.jpeg',
    description: 'Jesus Christ knocking at the door'
  },
  {
    id: 'jesus-praying-gethsemane',
    name: 'Jesus Praying in Gethsemane',
    url: '/jesus_praying_in_gethsemane.jpeg',
    description: 'Jesus Christ praying in the Garden of Gethsemane'
  },
  {
    id: 'jesus-raising-jairus-daughter',
    name: 'Jesus Raising Jairus\' Daughter',
    url: '/jesus_raising_jairus_daughter_olsen.jpeg',
    description: 'Jesus raising Jairus\' daughter from the dead'
  },
  {
    id: 'jesus-blessing-children',
    name: 'Jesus Blessing the Children',
    url: '/jesus_blessing_the_children.jpeg',
    description: 'Jesus Christ blessing the children'
  },
  {
    id: 'go-ye-therefore',
    name: 'Go Ye Therefore',
    url: '/go_ye_therefore_and_teach_all_nations.jpeg',
    description: 'Go ye therefore and teach all nations'
  },
  {
    id: 'christ-rich-young-ruler',
    name: 'Christ and the Rich Young Ruler',
    url: '/christ_rich_young_ruler_hofmann.jpeg',
    description: 'Jesus Christ and the rich young ruler'
  },
  {
    id: 'christ-ordaining-apostles',
    name: 'Christ Ordaining the Apostles',
    url: '/christ_ordaining_the_apostles.jpeg',
    description: 'Jesus Christ ordaining the apostles'
  },
  {
    id: 'jesus-burial-tomb',
    name: 'Jesus Burial Tomb',
    url: '/jesus_burial_tomb.jpeg',
    description: 'The burial tomb of Jesus Christ'
  },
  {
    id: 'pool-of-bethesda',
    name: 'Pool of Bethesda',
    url: '/pool_of_bethesda_carl_bloch.jpeg',
    description: 'The Pool of Bethesda'
  },
  {
    id: 'calling-the-fishermen',
    name: 'Calling the Fishermen',
    url: '/calling_the_fishermen.jpeg',
    description: 'Jesus calling the fishermen to be fishers of men'
  }
];

// Custom image interface
export interface CustomImage {
  id: string;
  name: string;
  url: string;
  description?: string;
  isCustom: true;
  uploadDate: string;
}

// Combined image type
export type ImageData = typeof LDS_IMAGES[0] | CustomImage;

// Storage key for custom images
const CUSTOM_IMAGES_KEY = 'custom_bulletin_images';

// Get custom images from localStorage
export const getCustomImages = (): CustomImage[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_IMAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom images:', error);
    return [];
  }
};

// Save custom image to localStorage
export const saveCustomImage = (image: CustomImage): void => {
  try {
    const existing = getCustomImages();
    const updated = [...existing, image];
    localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving custom image:', error);
    throw new Error('Failed to save custom image. File may be too large.');
  }
};

// Delete custom image from localStorage
export const deleteCustomImage = (imageId: string): void => {
  try {
    const existing = getCustomImages();
    const updated = existing.filter(img => img.id !== imageId);
    localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting custom image:', error);
  }
};

// Get all images (preset + custom)
export const getAllImages = (): ImageData[] => {
  const customImages = getCustomImages();
  return [...LDS_IMAGES, ...customImages];
};

export const getImageById = (id: string): ImageData => {
  const allImages = getAllImages();
  return allImages.find(img => img.id === id) || LDS_IMAGES[0];
};