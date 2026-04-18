export const resumeData = {
  name: "Anas Tarek Qumhiyeh",
  headline: "Software Engineer (MLOps & Full-Stack) | Data Pipelines & Infrastructure",
  targetRoles: "1-3 Years Experience level roles in Fintech, or AI Infrastructure.",
  phone: "+60 11-12983-246",
  email: "anasqumhiyeh@gmail.com",
  linkedin: "linkedin.com/in/anasqumhiyeh/",
  github: "github.com/Mizore66",
  education: {
    school: "Monash University",
    location: "Bandar Sunway, Selangor, Malaysia",
    degree: "Bachelor of Engineering (Honours), Specialization in Software Engineering",
    graduation: "May 2026",
    wam: "82.1",
    cgpa: "3.82",
  },
  skills: {
    languages: ["Java", "Python", "C/C++", "JavaScript", "TypeScript", "HTML/CSS", "MATLAB", "Flutter", "C#", "PHP", "Scala"],
    frameworks: ["React", "Node.js", "Flask", "JQuery", "Next.js", "ASP.NET", "Laravel", "NestJS"],
    devTools: ["Git", "GitLab CI/CD", "Postman", "Swagger", "Grafana", "Loki", "Docker", "Kubernetes", "AWS", "ArgoCD"],
    libraries: ["pandas", "NumPy", "Matplotlib", "PyTorch", "TensorFlow", "NLTK", "spaCy", "FastAPI", "Kafka"],
    databases: ["MySQL", "OracleSQL", "MongoDB", "Firebase", "PostgreSQL", "Neo4j"],
  },
  experience: [
    {
      title: "Fullstack AI Engineer",
      type: "Contract",
      period: "Nov 2025 – Feb 2026",
      tech: ["LangGraph", "Neo4j", "FastAPI"],
      bullets: [
        "Built an autonomous GraphRAG agent (Neo4j, LangGraph) for university regulations, adding a self-correcting Text-to-Cypher loop to boost relational-policy retrieval accuracy by 45% vs. vector-only RAG.",
        "Designed hybrid retrieval combining embeddings with multi-hop graph traversals to resolve prerequisites and credit-transfer eligibility across departments.",
        "Distilled frontier-model reasoning into a graph-logic SLM, cutting inference latency by 50% and surfacing policy contradictions for administrators.",
      ],
      impact: "+45% retrieval accuracy",
    },
    {
      title: "Full Stack Engineer",
      type: "Contract Employee",
      company: "Western Digital",
      period: "Feb 2025 – Dec 2025",
      tech: ["Next.js", "PostgreSQL", "ASP.NET", "Docker"],
      bullets: [
        "Designed and developed an interactive dashboard to control and monitor company's lab systems, reducing manual oversight time by 40%.",
        "Implemented secure role-based access control (admin, user, superuser) of different CRUD operations and analytics for over 50 internal users.",
        "Established WebSocket-based real-time communication with the company's DL model, then used the output to heuristically calculate fastest path data in under 100 ms.",
      ],
      impact: "-40% manual oversight",
    },
    {
      title: "Software Engineer Intern",
      company: "Setel",
      period: "Jul 2025 – Dec 2025",
      tech: ["Docker", "Kubernetes", "MERN Stack", "Swagger", "Nest.js"],
      bullets: [
        "Engineered and maintained core backend services for the payment engine, handling the secure authorization and capture of user payment methods.",
        "Authored detailed technical documentation for user payment checkout flows, standardizing processes and reducing onboarding time for new developers by 30%.",
        "Developed and executed a comprehensive suite of unit tests for payment checkout and capture functionalities, achieving 92.5% code coverage and reducing production defects by 40%.",
      ],
      impact: "92.5% code coverage",
    },
    {
      title: "Project Engineer Intern",
      company: "Petronas",
      period: "Nov 2024 – Feb 2025",
      tech: ["MATLAB", "Python", "MathCAD"],
      bullets: [
        "Contributed to the overhaul of back-end code converting from MATLAB to Python, reducing costs by 20% in the department and increasing application efficiency by 30%.",
        "Developed user test case scenarios for the project after certain features were completed and pushed to production.",
        "Communicated with department leadership to recommend bug fixes and ensure good UX.",
      ],
      impact: "-20% department costs",
    },
  ],
  projects: [
    {
      name: "CircuitMindAI",
      subtitle: "GenAI PCB Inspection Platform",
      date: "March 2026",
      tech: ["AWS Bedrock", "Amazon OpenSearch", "Node.js", "WebSockets", "S3", "IAM"],
      bullets: [
        "Orchestrated a multi-modal GenAI pipeline integrating Amazon Nova Pro for vision-based fault detection and Nova Sonic for low-latency bidirectional voice streaming.",
        "Architected a production-grade RAG system with Amazon OpenSearch Serverless vector indices and Bedrock Knowledge Bases for zero-hallucination troubleshooting.",
        "Engineered secure, scalable ML infrastructure using AWS STS/IAM permissioning and OpenSearch Serverless APIs.",
      ],
      impact: "Real-time PCB fault detection",
    },
    {
      name: "Cancer Detection Model",
      subtitle: "SLM Distillation & Fine-Tuning",
      date: "Jul 2025",
      tech: ["PyTorch", "Knowledge Distillation", "QLoRA", "DeepSpeed", "FlashAttention"],
      bullets: [
        "Architected a knowledge distillation pipeline using PyTorch to transfer reasoning from a 70B teacher model to a 3B SLM, achieving 12x increase in inference speed.",
        "Implemented QLoRA for domain-specific fine-tuning on proprietary datasets for high-accuracy classification.",
        "Utilized DeepSpeed and FlashAttention to optimize training, reducing memory footprint by 40%.",
      ],
      impact: "12x inference speedup",
    },
  ],
};

export const systemPrompt = `You are a professional AI recruiter assistant for Anas Tarek Qumhiyeh's portfolio website. Your role is to act as Anas's professional advocate, answering questions from recruiters, hiring managers, and visitors about his background, skills, and experience.

## About Anas
${resumeData.headline}
- Education: ${resumeData.education.degree} at ${resumeData.education.school} (${resumeData.education.graduation}), WAM: ${resumeData.education.wam}, CGPA: ${resumeData.education.cgpa}
- Target Roles: ${resumeData.targetRoles}

## Technical Skills
- Languages: ${resumeData.skills.languages.join(", ")}
- Frameworks: ${resumeData.skills.frameworks.join(", ")}
- Developer Tools: ${resumeData.skills.devTools.join(", ")}
- Libraries: ${resumeData.skills.libraries.join(", ")}
- Databases: ${resumeData.skills.databases.join(", ")}

## Experience
${resumeData.experience.map(exp => `### ${exp.title}${exp.company ? ` at ${exp.company}` : ""} (${exp.period})
Tech: ${exp.tech.join(", ")}
${exp.bullets.map(b => `- ${b}`).join("\n")}`).join("\n\n")}

## Projects
${resumeData.projects.map(proj => `### ${proj.name} — ${proj.subtitle} (${proj.date})
Tech: ${proj.tech.join(", ")}
${proj.bullets.map(b => `- ${b}`).join("\n")}`).join("\n\n")}

## Guidelines
- Be enthusiastic, professional, and concise
- Highlight Anas's strengths relevant to the question
- If asked about something not covered, say you don't have that specific information but redirect to his strengths
- Suggest reaching out to Anas directly for detailed discussions
- Keep responses under 200 words unless asked for detail
- Use technical language appropriate for the audience`;
