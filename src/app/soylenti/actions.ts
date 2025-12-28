"use server";

import { supabase } from "@/lib/supabase";

interface Rumor {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
  aiProbability?: number | null;
  aiAnalysis?: string | null;
}

interface PaginatedResult {
  rumors: Rumor[];
  hasMore: boolean;
}

export async function fetchMoreRumors(
  cursor: string,
  limit: number = 50,
): Promise<PaginatedResult> {
  const { data, error } = await supabase
    .from("betis_news")
    .select("*")
    .eq("is_duplicate", false)
    .lt("pub_date", cursor)
    .order("pub_date", { ascending: false })
    .limit(limit + 1);

  if (error) {
    console.error("Error fetching more rumors:", error);
    throw error;
  }

  const hasMore = (data?.length || 0) > limit;
  const items = hasMore ? data?.slice(0, limit) : data;

  return {
    rumors:
      items?.map((rumor) => ({
        title: rumor.title,
        link: rumor.link,
        pubDate: rumor.pub_date,
        source: rumor.source,
        description: rumor.description,
        aiProbability: rumor.ai_probability,
        aiAnalysis: rumor.ai_analysis,
      })) || [],
    hasMore,
  };
}
