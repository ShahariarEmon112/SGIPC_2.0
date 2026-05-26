export type LeaderboardEntry = {
  id: number;
  user_id: number | null;
  name: string;
  batch: string | null;
  cf_handle: string | null;
  rating: number;
  max_rating: number;
  wins: number;
  contests_participated: number;
  year: number;
  profile_photo_url: string | null;
  rank_position: number | null;
  is_published: boolean;
};

export type LeaderboardResponse = {
  year: number;
  years: number[];
  entries: LeaderboardEntry[];
};

export type ResourceCategory =
  | "algorithms"
  | "data_structures"
  | "practice"
  | "tutorial"
  | "course";

export type Resource = {
  id: number;
  title: string;
  description: string | null;
  url: string;
  category: ResourceCategory;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  order_index: number;
  is_published: boolean;
};

export type ResourcesResponse = {
  categories: Record<ResourceCategory, Resource[]>;
  total: number;
};

export type MyBlog = {
  id: number;
  title: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  is_published: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  rejection_reason: string | null;
  created_at: string;
};

export type MyComment = {
  id: number;
  content: string;
  status: string;
  created_at: string;
  blog: { id: number; title: string; slug: string };
};
