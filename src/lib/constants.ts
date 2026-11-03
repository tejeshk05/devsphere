import { CategoryInfo, TimeFilter } from "@/types/github";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "ai",
    label: "AI",
    description: "Artificial Intelligence frameworks, tools & research",
    iconName: "Brain",
    topics: ["artificial-intelligence", "ai", "deep-learning"],
    searchKeywords: ["artificial intelligence", "ai"],
    accentColor: "#10b981", // emerald
  },
  {
    id: "machine-learning",
    label: "Machine Learning",
    description: "Classical & statistical machine learning algorithms and tools",
    iconName: "Cpu",
    topics: ["machine-learning", "scikit-learn", "deep-neural-networks"],
    searchKeywords: ["machine learning", "ml"],
    accentColor: "#06b6d4", // cyan
  },
  {
    id: "generative-ai",
    label: "Generative AI",
    description: "Diffusion models, audio synthesis & creative AI engines",
    iconName: "Sparkles",
    topics: ["generative-ai", "diffusion-models", "text-to-image", "stable-diffusion"],
    searchKeywords: ["generative ai", "diffusion model"],
    accentColor: "#8b5cf6", // violet
  },
  {
    id: "llms",
    label: "LLMs",
    description: "Large Language Models, inference runtimes & fine-tuning",
    iconName: "MessageSquareCode",
    topics: ["llm", "large-language-models", "vllm", "llama", "transformers"],
    searchKeywords: ["llm", "large language model"],
    accentColor: "#ec4899", // pink
  },
  {
    id: "ai-agents",
    label: "AI Agents",
    description: "Autonomous reasoning, multi-agent swarms & tool use",
    iconName: "Bot",
    topics: ["ai-agents", "autonomous-agents", "multi-agent", "agentic-ai", "crewai"],
    searchKeywords: ["ai agent", "autonomous agent"],
    accentColor: "#3b82f6", // blue
  },
  {
    id: "rag",
    label: "RAG",
    description: "Retrieval-Augmented Generation, vector embeddings & knowledge search",
    iconName: "Database",
    topics: ["rag", "retrieval-augmented-generation", "vector-database", "embeddings"],
    searchKeywords: ["retrieval augmented generation", "rag vector"],
    accentColor: "#f59e0b", // amber
  },
  {
    id: "computer-vision",
    label: "Computer Vision",
    description: "Object detection, segmentation, image processing & 3D vision",
    iconName: "Eye",
    topics: ["computer-vision", "object-detection", "yolo", "opencv", "segmentation"],
    searchKeywords: ["computer vision", "opencv"],
    accentColor: "#14b8a6", // teal
  },
  {
    id: "mlops",
    label: "MLOps",
    description: "Model deployment, tracking, monitoring & pipeline orchestration",
    iconName: "Workflow",
    topics: ["mlops", "model-deployment", "feature-store", "model-serving", "ml-pipeline"],
    searchKeywords: ["mlops", "model serving"],
    accentColor: "#f97316", // orange
  },
];

export const TIME_FILTERS: { id: TimeFilter; label: string; period: string; days: number }[] = [
  { id: "daily", label: "Today", period: "Past 24 hours", days: 1 },
  { id: "weekly", label: "This Week", period: "Past 7 days", days: 7 },
  { id: "monthly", label: "This Month", period: "Past 30 days", days: 30 },
];

export const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  Go: "#00ADD8",
  "Jupyter Notebook": "#DA5B0B",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Julia: "#a270ba",
  Mojo: "#ff4b00",
  CUDA: "#3A4E3A",
  Zig: "#ec915c",
};

export const DEFAULT_LANGUAGE_COLOR = "#64748b";

