export interface PlatformSize {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
  icon: string;
}

export const platforms: PlatformSize[] = [
  // Instagram
  { id: 'instagram_post', name: 'Instagram Post', width: 1080, height: 1080, category: 'Instagram', icon: 'instagram' },
  { id: 'instagram_story', name: 'Instagram Story', width: 1080, height: 1920, category: 'Instagram', icon: 'instagram' },
  { id: 'instagram_portrait', name: 'Instagram Portrait', width: 1080, height: 1350, category: 'Instagram', icon: 'instagram' },
  { id: 'instagram_reel', name: 'Instagram Reel', width: 1080, height: 1920, category: 'Instagram', icon: 'instagram' },

  // Twitter/X
  { id: 'twitter_post', name: 'Twitter Post', width: 1200, height: 675, category: 'Twitter/X', icon: 'twitter' },
  { id: 'twitter_header', name: 'Twitter Header', width: 1500, height: 500, category: 'Twitter/X', icon: 'twitter' },

  // LinkedIn
  { id: 'linkedin_post', name: 'LinkedIn Post', width: 1200, height: 1200, category: 'LinkedIn', icon: 'linkedin' },
  { id: 'linkedin_banner', name: 'LinkedIn Banner', width: 1584, height: 396, category: 'LinkedIn', icon: 'linkedin' },

  // YouTube
  { id: 'youtube_thumbnail', name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'YouTube', icon: 'youtube' },

  // TikTok
  { id: 'tiktok_video', name: 'TikTok Video', width: 1080, height: 1920, category: 'TikTok', icon: 'video' },

  // Facebook
  { id: 'facebook_post', name: 'Facebook Post', width: 1200, height: 630, category: 'Facebook', icon: 'facebook' },
  { id: 'facebook_cover', name: 'Facebook Cover', width: 820, height: 312, category: 'Facebook', icon: 'facebook' },

  // Pinterest
  { id: 'pinterest_pin', name: 'Pinterest Pin', width: 1000, height: 1500, category: 'Pinterest', icon: 'pin' },

  // Universal
  { id: 'square', name: 'Square (Universal)', width: 1080, height: 1080, category: 'Universal', icon: 'square' },
];

export function getCategories() {
  const categories = new Set(platforms.map(p => p.category));
  return Array.from(categories);
}

export function getPlatformsByCategory(category: string) {
  return platforms.filter(p => p.category === category);
}
