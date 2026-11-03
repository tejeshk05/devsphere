export interface AIExplanationResult {
  summary: string;
  architectureHighlights: string[];
  whyTrending: string;
  useCases: string[];
  suggestedPrompts: string[];
  generatedWith: "gemini" | "heuristic-engine" | "custom-llm";
}

export interface ExplainRepoRequest {
  owner: string;
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
}

/**
 * AI Repository Explainer Service Architecture
 * Supports Gemini 2.5 Flash / custom LLM endpoints.
 * Includes smart developer heuristics if GEMINI_API_KEY is not yet provided in .env.local.
 */
export async function explainRepository(
  req: ExplainRepoRequest
): Promise<AIExplanationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      // Direct call to Gemini REST API endpoint
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
                parts: [
                  {
                    text: `You are an elite software architect and open-source evaluator.
Analyze this trending GitHub repository:
- Name: ${req.owner}/${req.name}
- Primary Language: ${req.language || "Unknown"}
- Stars: ${req.stars}
- Topics: ${req.topics.join(", ")}
- Description: ${req.description || "None"}

Return a structured JSON with:
{
  "summary": "Clear, plain-English 2-3 sentence overview of what this does and the core problem it solves.",
  "architectureHighlights": ["2-3 key technical highlights or architectural patterns"],
  "whyTrending": "1-2 sentences on why this is gaining attention in the developer ecosystem right now",
  "useCases": ["3 concrete developer use cases"],
  "suggestedPrompts": ["2 sample queries to ask about this codebase"]
}
Respond strictly with valid JSON.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const candidateText =
          json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText);
          return {
            summary: parsed.summary,
            architectureHighlights: parsed.architectureHighlights || [],
            whyTrending: parsed.whyTrending || "Rapid adoption in modern developer workflows.",
            useCases: parsed.useCases || [],
            suggestedPrompts: parsed.suggestedPrompts || [],
            generatedWith: "gemini",
          };
        }
      }
    } catch (err) {
      console.warn("Gemini generation failed, falling back to heuristic engine:", err);
    }
  }

  // Developer Heuristic Engine (Fallback when no GEMINI_API_KEY is yet configured)
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
      `${req.name} is a high-performance open-source project written in ${req.language || "TypeScript/Python"} for ${domainCategory}.`,
    architectureHighlights: [
      `Engineered in ${req.language || "modern languages"} with modular architecture for easy integration.`,
      `Leverages high-efficiency pipelines optimized for modern compute stacks.`,
      `Active open-source community with ${req.stars.toLocaleString()} stargazers backing development.`,
    ],
    whyTrending: `Gaining high momentum due to active developer adoption in the ${domainCategory} space.`,
    useCases: [
      `Local testing and production deployment for ${domainCategory.toLowerCase()}`,
      `Integration into existing developer CLI and web workflows`,
      `Benchmarking state-of-the-art open-source implementations`,
    ],
    suggestedPrompts: [
      `How do I run ${req.name} locally with Docker or npm/pip?`,
      `What are the security and production deployment considerations for ${req.name}?`,
    ],
    generatedWith: "heuristic-engine",
  };
}

