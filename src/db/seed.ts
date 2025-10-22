import { db } from "./drizzle";
import { jobs } from "./schema/job-schema";

const seedUserId = "seed-user-id";

// --- Sample jobs data ---
const jobData = [
    {
        userId: seedUserId,
        title: "Frontend Developer (React / Next.js)",
        company: "TechNova Labs",
        location: "Bangalore, India",
        type: "full-time",
        mode: "hybrid",
        description:
            "TechNova Labs is seeking a passionate Frontend Developer experienced with React and Next.js to build modern, responsive web applications.",
        responsibilities: [
            "Develop and maintain scalable frontend features using React and Next.js",
            "Collaborate with backend and design teams to ensure smooth integrations",
            "Optimize applications for maximum speed and responsiveness",
            "Participate in code reviews and contribute to improving best practices",
        ],
        requirements: [
            "Bachelor’s degree in Computer Science or related field",
            "2+ years of experience with React.js or Next.js",
            "Strong understanding of REST APIs and state management libraries like Redux or Zustand",
            "Proficient with Git and modern frontend build tools",
        ],
        skills: ["React", "Next.js", "TypeScript", "TailwindCSS", "REST APIs"],
        minSalary: 60000,
        maxSalary: 90000,
        salaryCurrency: "USD",
        experienceLevel: "mid",
        industry: "Software Development",
        postedAt: new Date("2025-10-20"),
        deadline: new Date("2025-11-10"),
        isActive: true,
        source: "internal",
        url: "https://jobs.technova.dev/frontend-developer",
        keywords: ["frontend", "nextjs", "react", "web development", "ui/ux"],
    },
    {
        userId: seedUserId,
        title: "Data Scientist (NLP & LLMs)",
        company: "AIverse Inc.",
        location: "Remote",
        type: "contract",
        mode: "remote",
        description:
            "AIverse is looking for an experienced Data Scientist specializing in NLP and LLMs to design and deploy AI-driven insights for enterprise clients.",
        responsibilities: [
            "Develop NLP models for text classification, sentiment analysis, and summarization",
            "Experiment with fine-tuning LLMs using datasets from multiple domains",
            "Collaborate with ML engineers to deploy models into production",
            "Communicate insights through data visualization and dashboards",
        ],
        requirements: [
            "3+ years of experience in data science or ML roles",
            "Strong Python skills with TensorFlow, PyTorch, or Hugging Face",
            "Experience with transformer models and embeddings",
            "Familiarity with MLOps and API deployment",
        ],
        skills: ["Python", "TensorFlow", "PyTorch", "NLP", "Transformers", "LLMs"],
        minSalary: 90000,
        maxSalary: 120000,
        salaryCurrency: "USD",
        experienceLevel: "senior",
        industry: "Artificial Intelligence",
        postedAt: new Date("2025-10-18"),
        deadline: new Date("2025-11-15"),
        isActive: true,
        source: "LinkedIn",
        url: "https://careers.aiverse.ai/data-scientist-nlp",
        keywords: ["nlp", "machine learning", "ai", "llm", "data science"],
    },
    {
        userId: seedUserId,
        title: "Backend Engineer (Node.js / PostgreSQL)",
        company: "Flowstack Technologies",
        location: "Mumbai, India",
        type: "full-time",
        mode: "on-site",
        description:
            "Flowstack Technologies is hiring a Backend Engineer to design scalable APIs and manage data flow for enterprise-grade applications.",
        responsibilities: [
            "Design RESTful APIs and database schemas using PostgreSQL",
            "Implement business logic using Node.js and TypeScript",
            "Integrate authentication, caching, and background job systems",
            "Ensure code quality through testing and continuous integration",
        ],
        requirements: [
            "Bachelor’s degree in Computer Science or equivalent experience",
            "2–4 years of backend development experience",
            "Experience with Node.js, Express, and PostgreSQL",
            "Knowledge of Docker and cloud deployment (AWS, Vercel, etc.)",
        ],
        skills: ["Node.js", "Express", "PostgreSQL", "TypeScript", "Docker"],
        minSalary: 70000,
        maxSalary: 100000,
        salaryCurrency: "USD",
        experienceLevel: "mid",
        industry: "Software Engineering",
        postedAt: new Date("2025-10-22"),
        deadline: new Date("2025-11-05"),
        isActive: true,
        source: "internal",
        url: "https://jobs.flowstack.io/backend-engineer",
        keywords: ["backend", "nodejs", "postgresql", "api", "typescript"],
    },
    {
        userId: seedUserId,
        title: "Product Designer (UI/UX)",
        company: "InVisionary Studio",
        location: "Pune, India",
        type: "full-time",
        mode: "hybrid",
        description:
            "InVisionary Studio is seeking a creative Product Designer to craft intuitive and visually appealing user experiences for web and mobile platforms.",
        responsibilities: [
            "Collaborate with product managers and engineers to define and implement innovative solutions for product direction and visuals",
            "Create wireframes, storyboards, user flows, process flows, and site maps to communicate interaction and design ideas",
            "Conduct user research and evaluate user feedback to refine the design experience",
            "Establish and promote design guidelines, best practices, and standards",
        ],
        requirements: [
            "Bachelor’s degree in Design, HCI, or equivalent practical experience",
            "2+ years of experience in UI/UX design or product design",
            "Proficiency in Figma, Adobe XD, or similar tools",
            "Strong understanding of responsive and accessible design principles",
        ],
        skills: ["UI Design", "UX Research", "Figma", "Prototyping", "User Testing"],
        minSalary: 55000,
        maxSalary: 85000,
        salaryCurrency: "USD",
        experienceLevel: "mid",
        industry: "Design & Product",
        postedAt: new Date("2025-10-21"),
        deadline: new Date("2025-11-15"),
        isActive: true,
        source: "internal",
        url: "https://jobs.invisionarystudio.com/product-designer",
        keywords: ["uiux", "product design", "figma", "user experience", "design system"],
    },
    {
        userId: seedUserId,
        title: "DevOps Engineer (AWS / CI-CD)",
        company: "CloudBridge Solutions",
        location: "Gurgaon, India",
        type: "full-time",
        mode: "remote",
        description:
            "CloudBridge Solutions is hiring a DevOps Engineer to build scalable infrastructure and maintain continuous deployment pipelines for our growing SaaS platform.",
        responsibilities: [
            "Design and manage CI/CD pipelines using GitHub Actions and AWS services",
            "Automate infrastructure provisioning using Terraform and CloudFormation",
            "Monitor system performance, security, and scalability",
            "Collaborate with engineering teams to ensure reliable deployments and uptime",
        ],
        requirements: [
            "3+ years of experience in DevOps or infrastructure engineering",
            "Proficiency with AWS (EC2, Lambda, ECS, CloudWatch, etc.)",
            "Experience with Docker, Kubernetes, and CI/CD tools",
            "Strong scripting skills in Bash or Python",
        ],
        skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Python"],
        minSalary: 100000,
        maxSalary: 130000,
        salaryCurrency: "USD",
        experienceLevel: "senior",
        industry: "Cloud & Infrastructure",
        postedAt: new Date("2025-10-19"),
        deadline: new Date("2025-11-20"),
        isActive: true,
        source: "LinkedIn",
        url: "https://careers.cloudbridge.io/devops-engineer",
        keywords: ["aws", "devops", "ci/cd", "infrastructure", "kubernetes"],
    },
] as (typeof jobs.$inferInsert)[];

async function seed() {
    console.log("🌱 Seeding database...");

    // Seed jobs
    for (const job of jobData) {
        await db.insert(jobs).values(job);
        console.log(`✅ Inserted: ${job.title}`);
    }

    console.log("🎉 Seeding complete!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
