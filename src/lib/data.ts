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
      name: "Veridian",
      slug: "veridian",
      subtitle: "Agentic MLOps Tradeoff Engine",
      date: "Apr 2026",
      tech: ["GitLab Duo", "GCP Vertex AI", "BigQuery", "Python", "MCP", "Terraform"],
      bullets: [
        "Architected a multi-agent orchestration pipeline using GitLab Duo and Model Context Protocol (MCP) to autonomously intercept and optimize infrastructure-as-code in real-time.",
        "Engineered a secure MCP server on Cloud Run that queries GCP Vertex AI to dynamically profile ML models, recommending quantized, low-carbon hardware equivalents.",
        "Implemented an immutable ESG ledger using GCP BigQuery to track carbon savings and compute tradeoffs for enterprise ML deployments.",
        "Achieved a 99.9% uptime for the deployment infrastructure, cutting cloud-associated emissions by an additional 15% through preemptive resource scheduling.",
      ],
      impact: "Zero-touch ML remediation",
      github: "https://github.com/Mizore66",
      description: "Veridian is a multi-agent MLOps tradeoff engine that autonomously intercepts Terraform and Kubernetes infrastructure-as-code changes, analyzes them for sustainability and cost efficiency, and recommends optimized alternatives — all without human intervention.",
    },
    {
      name: "CircuitMindAI",
      slug: "circuitmindai",
      subtitle: "GenAI PCB Inspection Platform",
      date: "Mar 2026",
      tech: ["AWS Bedrock", "Amazon OSS", "Next.js", "Express", "GitHub Actions"],
      bullets: [
        "Orchestrated a multi-modal GenAI pipeline integrating Amazon Nova Pro for vision-based fault detection and Nova Sonic for low-latency bidirectional voice streaming.",
        "Architected a decoupled full-stack application using Next.js and Express.js for a high-performance REST API with real-time AI-driven PCB troubleshooting.",
        "Engineered an automated CI/CD pipeline using GitHub Actions to build and push Docker containers to Amazon ECR and update ECS Fargate services.",
        "Integrated edge-computing models to provide offline caching, enabling uninterrupted inspection and analysis even during partial network outages.",
      ],
      impact: "Real-time PCB fault detection",
      github: "https://github.com/Mizore66",
      description: "CircuitMindAI is a GenAI-powered PCB inspection platform that uses Amazon Nova Pro for vision-based fault detection and Nova Sonic for real-time voice-guided troubleshooting, all deployed on AWS with a fully automated CI/CD pipeline.",
    },
    {
      name: "MirrorFi",
      slug: "mirrorfi",
      subtitle: "Solana Vault Strategy Platform",
      date: "May 2025",
      tech: ["Next.js", "ShadCN", "MongoDB", "Solana", "Node.js"],
      bullets: [
        "Grand Prize Winner at Solana Megahack 2025 — DeFi web app enabling users to visually design, share, and execute multi-protocol Solana yield strategies in one click.",
        "Developed the page and no-code interface for designing investment strategies across Drift, Jupiter, and Meteora protocols.",
        "Developed the MongoDB schema to store user-made strategies, enabling sharing and copying across the platform.",
        "Pioneered an auto-rebalancing feature that dynamically adjusts liquidity pool exposure based on real-time APY fluctuations to maximize user yield.",
      ],
      impact: "Grand Prize Winner",
      github: "https://github.com/Mizore66",
      description: "MirrorFi is a Grand Prize-winning DeFi web application from Solana Megahack 2025 that lets users visually design, share, and execute multi-protocol yield strategies on Solana through an intuitive no-code interface.",
    },
    {
      name: "Multi-Agent GraphRAG",
      slug: "multi-agent-graphrag",
      subtitle: "Hybrid Knowledge Retrieval System",
      date: "Oct 2025",
      tech: ["LangGraph", "Neo4j", "Knowledge Graphs", "Vector DB", "RAG"],
      bullets: [
        "Developed a multi-agent orchestration framework using LangGraph to unify structured (Neo4j) and unstructured (Vector DB) data, improving retrieval accuracy by 35%.",
        "Constructed specialized reasoning agents capable of autonomous Cypher query generation and tool-calling, grounding LLM responses in factual enterprise data.",
        "Optimized the RAG pipeline by implementing a Global-to-Local retrieval strategy for synthesizing insights across massive document sets.",
        "Designed a self-correcting fallback mechanism that reroutes ambiguous queries through a broader semantic search layer, minimizing hallucination artifacts to near-zero.",
      ],
      impact: "+35% retrieval accuracy",
      github: "https://github.com/Mizore66",
      description: "A multi-agent orchestration framework that combines Neo4j Knowledge Graphs with Vector Databases using LangGraph, enabling intelligent hybrid retrieval that grounds LLM responses in factual enterprise data.",
    },
    {
      name: "Financial Risk Predictor",
      slug: "financial-risk-predictor",
      subtitle: "ML Risk Assessment System",
      date: "Jul 2025",
      tech: ["TensorFlow", "XGBoost", "LightGBM", "BentoML", "SHAP"],
      bullets: [
        "Engineered a high-performance financial risk prediction system using LightGBM/XGBoost, achieving 0.87 AUC-ROC (15% improvement over baseline).",
        "Utilized SHAP values to interpret model decisions and identify key risk drivers, enhancing stakeholder trust and model transparency.",
        "Packaged and deployed the model to BentoCloud using BentoML, creating a scalable REST API and optimizing inference latency by 30%.",
        "Orchestrated a continuous-learning data pipeline to retrain models daily on streaming market signals from KafKa, ensuring proactive risk adaptation.",
      ],
      impact: "0.87 AUC-ROC score",
      github: "https://github.com/Mizore66",
      description: "A high-performance financial risk prediction system using ensemble methods (LightGBM/XGBoost) with SHAP-based interpretability, deployed as a scalable REST API via BentoML.",
    },
    {
      name: "Distributed Lead Scorer",
      slug: "distributed-lead-scorer",
      subtitle: "Large-Scale Data Mining Pipeline",
      date: "May 2025",
      tech: ["PySpark", "PyTorch DDP", "Deep Interest Network", "Distributed Computing"],
      bullets: [
        "Engineered a distributed data mining pipeline using PySpark to process and feature-engineer 100M+ daily user interaction events, reducing data latency from hours to minutes.",
        "Developed and deployed a parallelized Deep Interest Network (DIN) using PyTorch DDP across a multi-GPU cluster for real-time conversion prediction.",
        "Built an automated model evaluation framework for continuous performance monitoring.",
        "Implemented a robust fault-tolerance strategy using checkpointing, ensuring zero data loss during multi-hour distributed training runs.",
      ],
      impact: "100M+ events/day processed",
      github: "https://github.com/Mizore66",
      description: "A distributed data mining pipeline using PySpark and PyTorch DDP that processes 100M+ daily user interaction events and predicts conversion probability in real-time using a Deep Interest Network.",
    },
    {
      name: "SLM Distillation Engine",
      slug: "slm-distillation-engine",
      subtitle: "Knowledge Distillation & Fine-Tuning",
      date: "Jul 2025",
      tech: ["PyTorch", "QLoRA", "DeepSpeed", "FlashAttention"],
      bullets: [
        "Architected a knowledge distillation pipeline to transfer reasoning from a 70B teacher model to a 3B SLM, achieving 12x increase in inference speed.",
        "Implemented QLoRA for domain-specific fine-tuning on proprietary datasets for high-accuracy classification.",
        "Utilized DeepSpeed and FlashAttention to optimize training, reducing memory footprint by 40%.",
        "Designed a custom reward-modeling metric aligning the distilled outputs precisely with internal business rules, achieving a 98% pass rate on edge-cases.",
      ],
      impact: "12x inference speedup",
      github: "https://github.com/Mizore66",
      description: "A knowledge distillation pipeline that transfers reasoning capabilities from a 70B parameter teacher model to a compact 3B SLM using QLoRA, DeepSpeed, and FlashAttention for efficient domain-specific fine-tuning.",
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
