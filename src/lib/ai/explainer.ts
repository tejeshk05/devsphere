export interface AIExplanationResult {
  summary: string;
  architectureHighlights: string[];
  whyTrending: string;
  useCases: string[];
  learningRecommendations: string[];
  suggestedPrompts: string[];
  generatedWith: "gemini" | "heuristic-engine";
}

export interface ExplainRepoRequest {
  owner: string;
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  readme?: string | null;
}

/**
 * AI Repository Explainer Service Architecture
 * Connects directly to Google Gemini 2.5 Flash using server-side GEMINI_API_KEY.
 * Safely ingests repository README content and metadata with token budgeting.
 */
export async function explainRepository(
  req: ExplainRepoRequest
): Promise<AIExplanationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      // Safe truncation of README to prevent prompt overflow (~3,500 chars)
      const truncatedReadme = req.readme
        ? req.readme.slice(0, 3500).replace(/<!--[\s\S]*?-->/g, "").trim()
        : "No README documentation provided.";

      const promptText = `You are a Principal Software Architect and Open-Source Code Auditor.
Analyze the following GitHub repository using its metadata and README excerpt:

REPOSITORY METADATA:
- Name: ${req.owner}/${req.name}
- Primary Language: ${req.language || "Polyglot"}
- Stargazers: ${req.stars.toLocaleString()}
- Topics: ${req.topics.join(", ") || "None specified"}
- Short Description: ${req.description || "None"}

README.md EXCERPT:
"""
${truncatedReadme}
"""

Evaluate the engineering architecture and return a strict JSON response matching this schema:
{
  "summary": "Clear, plain-English 2-3 sentence overview explaining what this codebase does and its core innovation.",
  "architectureHighlights": [
    "3-4 key technical highlights, architectural patterns, or engineering decisions evidenced by the README"
  ],
  "whyTrending": "1-2 sentences explaining why developers and companies are adopting this project right now.",
  "useCases": [
    "3 concrete real-world developer or enterprise production use cases"
  ],
  "learningRecommendations": [
    "2 actionable recommendations for where a developer should start exploring in this codebase"
  ],
  "suggestedPrompts": [
    "2 insightful questions to ask about this repository"
  ]
}
Respond strictly with valid JSON. No markdown backticks, no conversational preamble.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.25,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText);
          return {
            summary: parsed.summary,
            architectureHighlights: parsed.architectureHighlights || [],
            whyTrending:
              parsed.whyTrending || "Rapid momentum in modern developer workflows.",
            useCases: parsed.useCases || [],
            learningRecommendations:
              parsed.learningRecommendations || [
                `Clone the repository and review the primary entry point files in ${req.language || "the root"}.`,
                `Inspect configuration and example test suites to understand input/output flows.`,
              ],
            suggestedPrompts: parsed.suggestedPrompts || [],
            generatedWith: "gemini",
          };
        }
      } else {
        console.warn(
          `Gemini API returned status ${response.status}. Falling back to heuristic engine.`
        );
      }
    } catch (err) {
      console.warn("Gemini generation failed, using heuristic engine:", err);
    }
  }

  // Developer Heuristic Engine (Fallback when no GEMINI_API_KEY is configured)
  const isAgent = req.topics.some((t) => t.includes("agent") || t.includes("swarm"));
  const isLLM = req.topics.some((t) => t.includes("llm") || t.includes("model"));
  const isVision = req.topics.some((t) => t.includes("vision") || t.includes("yolo"));
  const isRAG = req.topics.some((t) => t.includes("rag") || t.includes("vector"));

  let domainCategory = "AI & Open Source Engineering";
  if (isAgent) domainCategory = "Autonomous Agentic Systems";
  else if (isLLM) domainCategory = "Large Language Model Tooling";
  else if (isVision) domainCategory = "Computer Vision & Visual Intelligence";
  else if (isRAG) domainCategory = "Retrieval-Augmented Generation (RAG)";

  return {
    summary:
      req.description ||
      `${req.name} is an active open-source codebase engineered in ${req.language || "TypeScript/Python"} for ${domainCategory}.`,
    architectureHighlights: [
      `Engineered in ${req.language || "modern languages"} with modular component design for rapid integration.`,
      `Leverages high-throughput compute pipelines optimized for ${domainCategory.toLowerCase()}.`,
      `Community-driven ecosystem backed by ${req.stars.toLocaleString()} stargazers.`,
      req.readme
        ? `Contains active documentation and configuration specifications in README.md.`
        : `Lightweight repository specification with standard package architecture.`,
    ],
    whyTrending: `Gaining strong velocity due to developer adoption in the ${domainCategory} vertical.`,
    useCases: [
      `Local testing and production deployment for ${domainCategory.toLowerCase()}`,
      `Integration into existing developer CLI and automation workflows`,
      `Benchmarking state-of-the-art open-source implementations`,
    ],
    learningRecommendations: [
      `Inspect the core package configuration and entrypoint file to review exported APIs.`,
      `Review community pull requests and issues to follow active feature velocity.`,
    ],
    suggestedPrompts: [
      `How do I run ${req.name} locally with Docker or package manager?`,
      `What are the production security considerations for ${req.name}?`,
    ],
    generatedWith: "heuristic-engine",
  };
}
