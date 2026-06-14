"use client";

import { useMemo } from "react";
import { articles, archiveArticles, type Article, type Category } from "@/data/articles";
import { useSubmissions, type Submission } from "@/context/SubmissionsContext";
import { useSiteConfig } from "@/context/SiteConfigContext";

/**
 * Maps SubmitPage category labels → Article Category union values.
 * SubmitPage uses human-friendly labels; Article uses short canonical keys.
 */
const CATEGORY_MAP: Record<string, Exclude<Category, "All">> = {
  "Articles":                          "Articles",
  "Argumentative / Descriptive Essays": "Essays",
  "Blogs":                             "Blogs",
  "Fiction / Short Stories":           "Fiction",
  "Magazine / Features":               "Features",
  "Biographies":                       "Biographies",
  "Reviews":                           "Reviews",
};

function submissionToArticle(sub: Submission): Article {
  const month = new Date(sub.submittedAt).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const excerpt =
    sub.content.length > 200
      ? sub.content.slice(0, 200).trimEnd() + "…"
      : sub.content;

  return {
    id: sub.id,
    title: sub.title,
    author: sub.name,
    grade: sub.grade,
    category: CATEGORY_MAP[sub.category] ?? "Articles",
    excerpt,
    content: sub.content,
    votes: 0,
    month,
    isEditorChoice: false,
  };
}

/**
 * Returns a unified, memoised view of all published content:
 * - `currentIssue`  — static articles + approved submissions (for LiteraryHub)
 * - `allPublished`  — static articles + archive articles + approved submissions (for Archive)
 *
 * Both lists are stable references and only recompute when submissions change.
 */
export function usePublishedArticles() {
  const { submissions } = useSubmissions();
  const { config } = useSiteConfig();
  const removed = new Set(config.removedArticleIds ?? []);

  const approvedFromSubmissions = useMemo(
    () =>
      submissions
        .filter((s) => s.status === "approved")
        .map(submissionToArticle),
    [submissions],
  );

  const currentIssue = useMemo(
    () => [...articles, ...approvedFromSubmissions].filter((a) => !removed.has(a.id)),
    [approvedFromSubmissions, config.removedArticleIds],
  );

  const allPublished = useMemo(
    () => [...articles, ...archiveArticles, ...approvedFromSubmissions].filter((a) => !removed.has(a.id)),
    [approvedFromSubmissions, config.removedArticleIds],
  );

  return { currentIssue, allPublished };
}
