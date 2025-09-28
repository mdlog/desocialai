import { PostCard } from "./post-card";
import type { PostWithAuthor } from "@shared/schema";

interface LazyPostCardProps {
  post: PostWithAuthor;
}

export function LazyPostCard({ post }: LazyPostCardProps) {
  return <PostCard post={post} />;
}

export default LazyPostCard;