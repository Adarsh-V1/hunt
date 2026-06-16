from fpdf import FPDF

pdf = FPDF()
pdf.add_page()

pdf.add_font("DejaVu", "", "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf")
pdf.add_font("DejaVu", "B", "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Bold.ttf")
pdf.add_font("DejaVu", "I", "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Oblique.ttf")
pdf.add_font("DejaVu", "BI", "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-BoldOblique.ttf")

pdf.set_font("DejaVu", "B", 22)
pdf.cell(0, 14, "Adarsh Pathania", align="C")
pdf.ln(10)

pdf.set_font("DejaVu", "B", 11)
pdf.cell(0, 6, "Full-Stack Developer  |  Next.js \u2022 Node.js \u2022 TypeScript", align="C")
pdf.ln(8)
pdf.set_font("DejaVu", "", 10)
pdf.cell(0, 5, "Mohali, Punjab, India", align="C")
pdf.ln(5)
pdf.cell(0, 5, "+91 78890 78854  |  adarsh.pathania.04@gmail.com", align="C")
pdf.ln(5)
pdf.cell(0, 5, "GitHub: github.com/Adarsh  |  LinkedIn: linkedIn.com/Adarsh  |  Portfolio: portfolio/Adarsh", align="C")
pdf.ln(10)

pdf.set_font("DejaVu", "B", 14)
pdf.cell(0, 8, "PROFESSIONAL SUMMARY")
pdf.ln(8)
pdf.set_draw_color(0, 0, 0)
pdf.line(pdf.get_x(), pdf.get_y(), 190, pdf.get_y())
pdf.ln(3)

pdf.set_font("DejaVu", "", 10)
summary = (
    "Full-Stack Developer experienced in building scalable web applications using the modern "
    "JavaScript/TypeScript stack with React and Next.js. Skilled in developing modern frontend architectures "
    "and designing robust, type-safe APIs and secure authentication systems. Passionate about writing "
    "clean and maintainable code and building reliable production-ready applications."
)
pdf.multi_cell(0, 5, summary)
pdf.ln(5)

pdf.set_font("DejaVu", "B", 14)
pdf.cell(0, 8, "EXPERIENCE")
pdf.ln(8)
pdf.set_draw_color(0, 0, 0)
pdf.line(pdf.get_x(), pdf.get_y(), 190, pdf.get_y())
pdf.ln(3)

pdf.set_font("DejaVu", "B", 11)
pdf.cell(0, 6, "Paras Technologies \u2013 Mohali, Punjab, India")
pdf.ln(6)
pdf.set_font("DejaVu", "I", 10)
pdf.cell(0, 5, "Software Engineering Intern (React Developer)")
pdf.ln(5)
pdf.set_font("DejaVu", "", 10)
pdf.cell(0, 5, "Jan 2026 \u2013 Present")
pdf.ln(5)

bullets = [
    "Building a production-grade web application using Next.js, React, and TypeScript",
    "Designed type-safe backend APIs with tRPC, improving API reliability and developer productivity",
    "Built scalable backend services using Node.js, Hono.js, Prisma, and MongoDB",
    "Implemented modern frontend architecture with Zustand, TanStack Query, and shadcn/ui",
]
for b in bullets:
    pdf.cell(5)
    pdf.multi_cell(0, 5, f"\u2022 {b}")
    pdf.ln(1)
pdf.ln(3)

pdf.set_font("DejaVu", "B", 14)
pdf.cell(0, 8, "PROJECTS")
pdf.ln(8)
pdf.set_draw_color(0, 0, 0)
pdf.line(pdf.get_x(), pdf.get_y(), 190, pdf.get_y())
pdf.ln(3)

pdf.set_font("DejaVu", "B", 11)
pdf.cell(0, 6, "ViralSight \u2013 Video Virality Analytics & Sharing Platform  |  Live")
pdf.ln(6)
pdf.set_font("DejaVu", "I", 10)
pdf.cell(0, 5, "Jan 2026 \u2013 Ongoing")
pdf.ln(5)
pdf.set_font("DejaVu", "", 10)
proj1 = [
    "Developing a full-stack video analytics platform using Next.js, React, and TypeScript",
    "Implemented 40+ tRPC procedures and 20+ Hono APIs for scalable backend services",
    "Integrated Stripe subscriptions, Cloudinary uploads, and Auth.js authentication",
    "Built responsive dashboard using Tailwind CSS, Zustand, TanStack Query, and shadcn/ui",
]
for b in proj1:
    pdf.cell(5)
    pdf.multi_cell(0, 5, f"\u2022 {b}")
    pdf.ln(1)
pdf.ln(3)

pdf.set_font("DejaVu", "B", 11)
pdf.cell(0, 6, "ConvoLink \u2013 Real-Time Chat & Video Calling platform with AI Insights  |  Live")
pdf.ln(6)
pdf.set_font("DejaVu", "I", 10)
pdf.cell(0, 5, "Jan 2026 \u2013 March 2026")
pdf.ln(5)
pdf.set_font("DejaVu", "", 10)
proj2 = [
    "Built a real-time team chat platform using Next.js, TypeScript, and Convex with multi-room chat",
    "Implemented presence, typing indicators, unread tracking, and file sharing",
    "Integrated WebRTC-based video calling with LiveKit, including screen sharing and call controls",
    'Developed an AI-powered \u201cWhile You Were Away\u201d message summary using the OpenAI API',
]
for b in proj2:
    pdf.cell(5)
    pdf.multi_cell(0, 5, f"\u2022 {b}")
    pdf.ln(1)
pdf.ln(5)

pdf.set_font("DejaVu", "B", 14)
pdf.cell(0, 8, "SKILLS")
pdf.ln(8)
pdf.set_draw_color(0, 0, 0)
pdf.line(pdf.get_x(), pdf.get_y(), 190, pdf.get_y())
pdf.ln(3)

pdf.set_font("DejaVu", "B", 10)
pdf.cell(0, 5, "Technical Skills:")
pdf.ln(5)
pdf.set_font("DejaVu", "", 10)
tech_skills = [
    "Languages: JavaScript (ES6+) and TypeScript",
    "Frontend: React.js, Next.js, TanStack Query, Zustand, Tailwind CSS, shadcn/ui",
    "Backend: Node.js, Hono.js, tRPC, NextAuth.js, Better Auth",
    "Databases & ORM: PostgreSQL, MongoDB, Prisma, Drizzle, Mongoose",
    "Tools & Platforms: Git, GitHub, Postman, Vercel, GitHub Copilot, Cursor, Convex",
]
for s in tech_skills:
    pdf.cell(5)
    pdf.cell(0, 5, f"\u2022 {s}")
    pdf.ln(5)
pdf.ln(2)

pdf.set_font("DejaVu", "B", 10)
pdf.cell(0, 5, "Soft Skills:")
pdf.ln(5)
pdf.set_font("DejaVu", "", 10)
soft_skills = [
    "Technical Ownership, Collaborative Development, Analytical Thinking, Continuous Learning",
]
for s in soft_skills:
    pdf.cell(5)
    pdf.cell(0, 5, f"\u2022 {s}")
    pdf.ln(5)
pdf.ln(5)

pdf.set_font("DejaVu", "B", 14)
pdf.cell(0, 8, "EDUCATION")
pdf.ln(8)
pdf.set_draw_color(0, 0, 0)
pdf.line(pdf.get_x(), pdf.get_y(), 190, pdf.get_y())
pdf.ln(3)

pdf.set_font("DejaVu", "B", 11)
pdf.cell(0, 6, "Sri Sai College of Engineering & Technology, Punjab, India")
pdf.ln(6)
pdf.set_font("DejaVu", "", 10)
pdf.cell(0, 5, "2022 \u2013 2026")
pdf.ln(5)
pdf.set_font("DejaVu", "I", 10)
pdf.cell(0, 5, 'Bachelor of Technology (B.Tech) in Computer Science & AI/ML (in collaboration with IBM)')
pdf.ln(7)
pdf.set_font("DejaVu", "", 10)
edu_bullets = [
    "Relevant Coursework: Data Structures, Algorithms, Database Management Systems, Web Technologies, Artificial Intelligence & Machine Learning",
    "Industrial Training: Web Development \u2013 Interns Hala (hands-on projects using MERN stack (React, Node.js, and MongoDB)",
]
for b in edu_bullets:
    pdf.cell(5)
    pdf.multi_cell(0, 5, f"\u2022 {b}")
    pdf.ln(1)

pdf.output("/home/gehrman/door/hunt/src/resume/Adarsh_Pathania_resume.pdf")
print("Resume PDF generated successfully")
