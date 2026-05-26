export type SiteSettings = Record<string, string>;

export type Event = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string | null;
  image_url: string | null;
  is_published: boolean;
};

export type Contest = {
  id: number;
  title: string;
  description: string;
  contest_date: string;
  platform: string | null;
  registration_link: string | null;
  image_url: string | null;
  is_published: boolean;
};

export type ContestsResponse = {
  upcoming: Contest[];
  past: Contest[];
};

export type Achievement = {
  id: number;
  title: string;
  description: string | null;
  contest_name: string;
  position: string;
  year: number;
  image_url: string | null;
  members: string[];
};

export type GalleryItem = {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  contest_name: string | null;
  year: number | null;
};

export type Author = {
  id: number;
  name: string;
  profile_photo_url: string | null;
};

export type Blog = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author: Author;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

export type BlogPage = {
  current_page: number;
  data: Blog[];
  last_page: number;
  per_page: number;
  total: number;
};

export type BlogComment = {
  id: number;
  content: string;
  user: Author;
  created_at: string;
};

export type BlogDetail = {
  blog: Blog & { comments: BlogComment[] };
  liked_by_me: boolean;
};
