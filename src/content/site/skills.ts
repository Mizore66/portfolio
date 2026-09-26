import type { SkillGroup } from "./types";

export const SKILLS: readonly SkillGroup[] = [
  { label: "Languages", items: ["Go", "TypeScript", "Python", "JavaScript", "SQL", "PHP", "C#", "HTML/CSS"] },
  { label: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "ShadCN", "jQuery"] },
  { label: "Backend and APIs", items: ["Node.js", "NestJS", "FastAPI", "Laravel", "ASP.NET", "REST APIs", "WebSockets", "WebRTC", "Kafka", "Microservices"] },
  { label: "Data", items: ["PostgreSQL", "Redis", "MySQL", "MongoDB", "Neo4j", "Elasticsearch"] },
  { label: "Cloud and DevOps", items: ["Kubernetes (AWS EKS)", "Docker", "AWS (EC2, EKS)", "Google Cloud (Cloud Run, Cloud Build, Firestore)", "Terraform", "ArgoCD", "GitHub Actions", "GitLab CI/CD", "Grafana", "Loki"] },
  { label: "AI/ML", items: ["LangGraph", "PyTorch", "TensorFlow", "pandas", "NumPy"] },
];
