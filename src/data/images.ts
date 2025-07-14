// Preloaded LDS-themed images for bulletin headers
export const LDS_IMAGES = [
  {
    id: 'none',
    name: 'No Image',
    url: '',
    description: 'Plain text header without image'
  },
  {
    id: 'temple-1',
    name: 'Salt Lake Temple',
    url: 'https://images.pexels.com/photos/8828547/pexels-photo-8828547.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Salt Lake Temple silhouette'
  },
  {
    id: 'temple-2',
    name: 'Temple Spires',
    url: 'https://images.pexels.com/photos/8828548/pexels-photo-8828548.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Temple spires against sky'
  },
  {
    id: 'christ-1',
    name: 'Christ Statue',
    url: 'https://images.pexels.com/photos/8828549/pexels-photo-8828549.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Statue of Jesus Christ'
  },
  {
    id: 'nature-1',
    name: 'Mountain Sunrise',
    url: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Peaceful mountain sunrise'
  },
  {
    id: 'nature-2',
    name: 'Peaceful Lake',
    url: 'https://www.churchofjesuschrist.org/imgs/ab8563d6bf71f5fc940b8fc299018d764fed41b6/full/1920%2C/0/default',
    description: 'Serene lake reflection'
  },
  {
    id: 'cross-1',
    name: 'Simple Cross',
    url: 'https://images.pexels.com/photos/8828550/pexels-photo-8828550.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Simple wooden cross'
  },
  {
    id: 'scripture-1',
    name: 'Open Scriptures',
    url: 'https://images.pexels.com/photos/8828551/pexels-photo-8828551.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Open Book of Mormon'
  },
  {
    id: 'light-1',
    name: 'Divine Light',
    url: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Rays of light through clouds'
  }
];

export const getImageById = (id: string) => {
  return LDS_IMAGES.find(img => img.id === id) || LDS_IMAGES[0];
};