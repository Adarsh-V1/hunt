import outreachMarkdown from "../../outreach_contacts.md?raw";

export const STATUSES = [
  "Pending",
  "Replied",
  "Declined",
  "Interview",
  "Sent",
  "Follow Up",
  "Not Applied",
];

const OUTREACH_SENT_DATE = "2026-05-12";

const sourceCompanies = [
  { companyName: "Sookshum Labs", location: "Mohali", roleTarget: "React/Next frontend" },
  { companyName: "BIG HAPPY", location: "Mohali/Chandigarh", roleTarget: "Frontend React" },
  { companyName: "Infosys", location: "Mohali/Chandigarh", roleTarget: "React/Angular frontend" },
  { companyName: "Delta4 Infotech", location: "Chandigarh", roleTarget: "Frontend React fresher" },
  { companyName: "SoftRadix Technologies Pvt. Ltd.", location: "Mohali/SAS Nagar", roleTarget: "React developer" },
  { companyName: "Ditstek Innovations Pvt. Ltd.", location: "Mohali/SAS Nagar", roleTarget: "React developer" },
  { companyName: "SEO Quartz", location: "Mohali", roleTarget: "Full-stack / React intern" },
  { companyName: "Matrix Marketers", location: "Mohali", roleTarget: "Next.js/React frontend" },
  { companyName: "Suffescom Solutions / Suffes Com", location: "Mohali", roleTarget: "React/Next.js developer" },
  { companyName: "Omninos Solutions", location: "Mohali", roleTarget: "Next.js frontend" },
  { companyName: "Inimist Technologies", location: "Mohali", roleTarget: "React intern / MERN intern" },
  { companyName: "RW Infotech Pvt Ltd", location: "Mohali", roleTarget: "Front-end intern" },
  { companyName: "Brackets Code", location: "Mohali", roleTarget: "ReactJS developer" },
  { companyName: "Webframez Pvt Ltd", location: "Mohali", roleTarget: "React.js fresher" },
  { companyName: "Sumfactor Software Pvt Ltd", location: "Chandigarh", roleTarget: "Front-end Web Developer" },
  { companyName: "Webtunix AI LLP", location: "Mohali", roleTarget: "ReactJS developer" },
  { companyName: "NextPage IT Solutions", location: "Mohali", roleTarget: "React / Front-end developer" },
  { companyName: "High Mountains", location: "Mohali", roleTarget: "Frontend / React" },
  { companyName: "Ghrix Technologies", location: "Mohali", roleTarget: "React developer" },
  { companyName: "KeyMouse IT Services", location: "Mohali", roleTarget: "React developer" },
  { companyName: "Sunfocus Solutions Pvt Ltd", location: "Mohali", roleTarget: "Node/React full-stack" },
  { companyName: "Ariel Software Solutions Pvt Ltd", location: "Mohali", roleTarget: "Frontend developer" },
  { companyName: "Unify Group", location: "Mohali", roleTarget: "React/Next web" },
  { companyName: "Cepoch", location: "Mohali", roleTarget: "ReactJS developer" },
  { companyName: "LBM Solutions", location: "Mohali", roleTarget: "Next.js/React web" },
  { companyName: "Webtech IT Solutions", location: "Mohali", roleTarget: "Next.js/React web" },
  { companyName: "tecHindustan", location: "Mohali", roleTarget: "Frontend developer" },
  { companyName: "SourceMash", location: "Mohali", roleTarget: "Next.js/React web" },
  { companyName: "Prologic Technologies", location: "Mohali", roleTarget: "React developer" },
  { companyName: "Vibe Internet Solutions Pvt Ltd", location: "Mohali", roleTarget: "React developer" },
  { companyName: "ChicMic Studios", location: "Mohali", roleTarget: "React developer" },
  { companyName: "Helios Tech Labs", location: "Mohali/Chandigarh", roleTarget: "UI + backend fresher" },
  { companyName: "VproTech Digital", location: "Mohali", roleTarget: "Full-stack web fresher" },
  { companyName: "BEXO.AI", location: "Mohali", roleTarget: "React intern / frontend" },
  { companyName: "Paradigm Drift Solutions LLP", location: "Mohali", roleTarget: "Frontend/React intern" },
  { companyName: "Mind Roots Pvt Ltd", location: "Chandigarh", roleTarget: "React / web app developer" },
  { companyName: "DELIVERABLE SERVICES", location: "Mohali", roleTarget: "Web app developer" },
  { companyName: "Acoustte Digital Services", location: "Mohali", roleTarget: "Next.js/web frontend" },
  { companyName: "CodeXorr Solutions", location: "Mohali", roleTarget: "Next.js/web frontend" },
  { companyName: "LDT Technology", location: "Chandigarh/Mohali", roleTarget: "ReactJS developer" },
  { companyName: "WorksDelight Inc.", location: "Chandigarh/Mohali", roleTarget: "React.js developer" },
  { companyName: "LuminoGuru", location: "Chandigarh/Mohali", roleTarget: "React/frontend developer" },
  { companyName: "WritingMinds Technologies LLP", location: "Mohali", roleTarget: "React/Frontend" },
  { companyName: "Dikonia", location: "Chandigarh", roleTarget: "Frontend/Web app developer" },
  { companyName: "ThinkNEXT Technologies / ThinkNEXT Training", location: "Mohali", roleTarget: "React fresher / trainee-friendly" },
  { companyName: "Seasia Infotech", location: "Mohali", roleTarget: "Web/full-stack developer" },
  { companyName: "NetSmartz", location: "Chandigarh/Mohali", roleTarget: "Frontend/full-stack" },
  { companyName: "Quark Software", location: "Mohali", roleTarget: "Frontend/product developer" },
  { companyName: "IDS Infotech", location: "Mohali", roleTarget: "Web/software developer" },
  { companyName: "Code Brew Labs", location: "Chandigarh/Mohali", roleTarget: "React/React Native/full-stack" },
  { companyName: "FIS Global", location: "Mohali/Chandigarh", roleTarget: "Frontend/software engineer" },
  { companyName: "ToXSL Technologies", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "jiWeb Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Walkwel Technology", location: "Mohali", roleTarget: "React/Next.js full-stack" },
  { companyName: "Capanicus", location: "Mohali", roleTarget: "React/healthtech/web" },
  { companyName: "WHMCS Global Services", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Trigma", location: "Mohali", roleTarget: "React/web/full-stack" },
  { companyName: "Indi IT Solutions", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "QServices INC", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "VTNetzwelt", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "Amap Infotech", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Debut Infotech", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "Esferasoft Solutions", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Softuvo Solutions", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Destm Technologies", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "FATbit Technologies", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "Qualhon Informatics", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Zapbuild", location: "Mohali", roleTarget: "React/web/full-stack" },
  { companyName: "Rudra Innovative Software", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "Devout Tech Consultants", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Zealsoft Systems", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Coditi Labs", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Techbit Solution", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Orion eSolutions", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "Netqom Software", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "TechMarcos", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Digital4design", location: "Mohali", roleTarget: "Frontend web developer" },
  { companyName: "UcodeSoft", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "TeqTop", location: "Mohali", roleTarget: "Frontend/web developer" },
  { companyName: "RV Technologies", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Spine Software Systems", location: "Mohali", roleTarget: "Web/software developer" },
  { companyName: "Cybrain", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Endurance Softwares", location: "Mohali", roleTarget: "Frontend/web developer" },
  { companyName: "Webtrack Technologies", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Cropsly", location: "Mohali", roleTarget: "Web app developer" },
  { companyName: "APPWRK IT Solutions", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Henceforth Solutions", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "Your Team in India", location: "Mohali", roleTarget: "React/full-stack developer" },
  { companyName: "Appsimity", location: "Mohali", roleTarget: "Web/app developer" },
  { companyName: "Clerisy Solutions", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Foldcode", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Talentelgia Technologies", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "BCoder Castle", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Code Garage", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Smarter.Codes", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Relinns Technologies", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Anviam Solutions", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Zoptal Solutions", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "IT Infonity", location: "Mohali", roleTarget: "Web developer" },
  { companyName: "TechBuilder", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Duple IT Solutions", location: "Mohali", roleTarget: "Frontend/web developer" },
  { companyName: "Nestormind", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Stellen Infotech", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "iApp Technologies", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "SoftProdigy", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "75WAY Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Webner", location: "Mohali", roleTarget: "React/web/full-stack" },
  { companyName: "Innovative Code Labs", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "RichestSoft", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "DigiMantra Labs", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "Nascenture", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Blocvibe Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Vineforce IT", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "GOTESO", location: "Mohali", roleTarget: "React/web/app developer" },
  { companyName: "Daksha Design", location: "Mohali", roleTarget: "Frontend/web developer" },
  { companyName: "Dipole Tech Innovations", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Master Software Solutions", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "WebGuruz Technologies", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "TheCode Wire Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Ios And Web Technologies", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Smart Applo", location: "Mohali", roleTarget: "Frontend/web developer" },
  { companyName: "Netpyx", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Kinix Digital", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Signity Software Solutions", location: "Mohali/Chandigarh", roleTarget: "React/full-stack developer" },
  { companyName: "Illuminz", location: "Chandigarh", roleTarget: "React/frontend developer" },
  { companyName: "Jaseir Technologies", location: "Chandigarh/Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "MY VIRTUAL PARTNER", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Webethics", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Sensation Software Solutions", location: "Mohali", roleTarget: "Frontend/web developer" },
  { companyName: "Claxa Marketing", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Brilliants Web", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Codesolvix", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "WebAstral InfoSystems", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Virtual Oplossing", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Touchwood Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Web Utopian Technologies", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Cloud Web Solutions", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Codetribe Solutions", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Codebee Lab", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Skynox Tech", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Megamind Creations", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Backspacce Technologies", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Truelysis", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "JSRRB Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Vibrantick Infotech Solutions", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Spineor Webservices", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "INTELLIZAP Consulting", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Winux Software Solutions", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Canvas Craft Media", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "LP Infotech", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Secure Web Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "DataTroops LLP", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Pixoatic Solutions", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "SquardTech", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Ultivic Private Limited", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "BitPixel Coders", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "IndiWork", location: "Mohali/Chandigarh", roleTarget: "Web/frontend developer" },
  { companyName: "Supreme Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Bezzie Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "billionX", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Shine Dezign Infonet", location: "Mohali", roleTarget: "Frontend/web developer" },
  { companyName: "RND Experts", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Ditinus Technology", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Crown Hill IT Solutions", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Shivah Web Tech", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Entiersoft", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Groot Software Solutions", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Scientia Infotech", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Business Box", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Weblance Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Emperic Innovations", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "CodeWebster", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Pixelperinches Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "The Brihaspati Infotech", location: "Mohali", roleTarget: "Frontend/full-stack developer" },
  { companyName: "Techies Infotech", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Vibhuti Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Twins Technolabs", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "EME Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Invito Software Solutions", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Ameotech Informatics", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Realmonkey", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "RHOMBUS Infotech", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Binary Data", location: "Mohali", roleTarget: "Web/software developer" },
  { companyName: "Harmony Data Integration Technologies", location: "Mohali", roleTarget: "Software/web developer" },
  { companyName: "32 Bit Solutions", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "CS Soft Solutions India", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Mountcode Technology", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "IWEBCODE", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "BootesNull", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Geek Informatic & Technologies", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Webmonde Softtech Solutions", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Fortec Web Solutions", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "API Dots", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Studio45Creations", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Media Foster", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Spire IT Services", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Bharat Logic", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "Softwiz Infotech", location: "Mohali", roleTarget: "Web/frontend developer" },
  { companyName: "BharatLogic Advisory Services", location: "Mohali", roleTarget: "Web/software developer" },
  { companyName: "Volvsoft India", location: "Mohali", roleTarget: "React/web developer" },
  { companyName: "Lytegen", location: "Mohali / Chandigarh", roleTarget: "Full Stack Developer - React + Node.js / MERN" },
  { companyName: "The Future University", location: "Chandigarh / Mohali", roleTarget: "Full Stack Software Developer" },
  { companyName: "FINVASIA", location: "Mohali", roleTarget: "Backend / Full-stack / Node.js" },
  { companyName: "Betasoft Solutions Pvt. Ltd.", location: "Mohali", roleTarget: "Node.js Developer / MERN" },
  { companyName: "RGB Web Tech", location: "Chandigarh", roleTarget: "Node.js / Backend / Full-stack Developer" },
  { companyName: "MSE Technology", location: "Chandigarh", roleTarget: "Backend Node.js / Full-stack" },
  { companyName: "Aqlix IT Solutions", location: "Mani Majra / Chandigarh", roleTarget: "Full Stack Developer" },
  { companyName: "Accelleron", location: "Mohali", roleTarget: "Software Engineer - React / Full-stack" },
  { companyName: "Grazitti Interactive", location: "Panchkula / Tricity", roleTarget: "MERN / Full-stack + AI" },
  { companyName: "VQCodes Software Solutions LLP", location: "Mohali Phase 8B", roleTarget: "MERN Stack Developer" },
  { companyName: "Apptunix", location: "Mohali", roleTarget: "Node.js / Full-stack Developer" },
  { companyName: "BizTecno", location: "Chandigarh", roleTarget: "Node.js Developer" },
  { companyName: "Designing Solutions", location: "Mohali", roleTarget: "Backend Node.js + Python" },
  { companyName: "BIZBOOKS Solutions Pvt. Ltd.", location: "Mohali", roleTarget: "Full Stack Developer" },
  { companyName: "Skysun", location: "Mohali", roleTarget: "Full Stack MERN Developer" },
  { companyName: "KOMPTE Sportech Pvt. Ltd.", location: "Chandigarh", roleTarget: "Full Stack Software Developer Intern" },
  { companyName: "Imark InfoTech", location: "Chandigarh", roleTarget: "Full Stack Developer" },
  { companyName: "Anayat Global Works Pvt. Ltd.", location: "Mohali", roleTarget: "React / Full-stack Developer" },
  { companyName: "Appslin Private Limited", location: "Mohali", roleTarget: "React Developer / Frontend" },
  { companyName: "Peakvisory Private Limited", location: "Mohali", roleTarget: "Frontend / React Developer" },
  { companyName: "Emboss Digital", location: "Mohali", roleTarget: "Frontend / React Developer" },
  { companyName: "Essence Innovation", location: "Mohali", roleTarget: "Full Stack Engineer" },
  { companyName: "CipherStudio", location: "Chandigarh", roleTarget: "Full Stack Developer" },
  { companyName: "Premium Transfers", location: "Mani Majra / Chandigarh", roleTarget: "Full Stack Developer" },
  { companyName: "Bebo Technologies", location: "Chandigarh", roleTarget: "Software Engineer / Web Developer" },
  { companyName: "Almuqeet Systems", location: "Mohali", roleTarget: "MERN Developer" },
  { companyName: "Ficode India", location: "Mohali", roleTarget: "Full-stack / Software Engineer" },
  { companyName: "CatalystOne Solutions", location: "Mohali", roleTarget: "Software Engineer" },
  { companyName: "Maropost", location: "Chandigarh / Remote India", roleTarget: "Full-stack / React / SaaS roles" },
  { companyName: "Weekday AI", location: "Chandigarh", roleTarget: "Backend / Full-stack Developer" },
  { companyName: "Antier Solutions", location: "Chandigarh / Mohali", roleTarget: "Blockchain + Full-stack / Node.js" },
  { companyName: "Edifecs", location: "Mohali / Chandigarh", roleTarget: "Software Engineer / Frontend / Full-stack" },
  { companyName: "RoundGlass", location: "Mohali", roleTarget: "Product Engineer / Web Developer" },
  { companyName: "JungleWorks", location: "Chandigarh", roleTarget: "Full-stack / SaaS Product Developer" },
  { companyName: "Click Labs", location: "Chandigarh", roleTarget: "React / Node / Product Engineer" },
  { companyName: "GrayCell Technologies", location: "Chandigarh", roleTarget: "React / Web Developer" },
  { companyName: "Net Solutions", location: "Chandigarh", roleTarget: "Frontend / Full-stack Developer" },
  { companyName: "SmartData Enterprises", location: "Mohali / Chandigarh", roleTarget: "MERN / Full-stack Developer" },
  { companyName: "Drish Infotech", location: "Chandigarh", roleTarget: "Software Developer / Web Developer" },
  { companyName: "Basware", location: "Chandigarh", roleTarget: "Software Engineer / Frontend" },
  { companyName: "Zscaler", location: "Chandigarh / Remote India", roleTarget: "Frontend / Software Engineer" },
  { companyName: "Oceaneering", location: "Chandigarh", roleTarget: "Software Engineer / Web Apps" },
  { companyName: "EXO Edge", location: "Mohali", roleTarget: "Software Engineer / Web Developer" },
  { companyName: "KPMG India", location: "Chandigarh", roleTarget: "Government Tech / Analyst Developer" },
  { companyName: "Xornor Technologies", location: "Chandigarh / Mohali", roleTarget: "React + Node.js Developer" },
  { companyName: "Sea Technologies", location: "Mohali / Chandigarh", roleTarget: "React / Node.js / Full-stack" },
  { companyName: "Beyond Root Technology Services", location: "Chandigarh", roleTarget: "React / Next.js / Node.js" },
  { companyName: "Skytz Software Labs", location: "Chandigarh", roleTarget: "React.js / Node.js Full-stack" },
  { companyName: "Altiora Infotech", location: "Chandigarh / Mohali", roleTarget: "Blockchain / Full-stack Developer" },
  { companyName: "TAC Security", location: "Chandigarh", roleTarget: "Software Engineer / Security Tech" },
  { companyName: "BuzzClan", location: "Mohali", roleTarget: "Software Engineer / Data + Web" },
  { companyName: "Adviserz", location: "Chandigarh", roleTarget: "Full-stack / Startup Tech Role" },
  { companyName: "Uplers", location: "Remote / Chandigarh-friendly", roleTarget: "React / Full-stack Developer" },
  { companyName: "Rudra IT Networks", location: "Mohali", roleTarget: "Web Developer / Full-stack" },
  { companyName: "Euclidee Software Solutions", location: "Mohali", roleTarget: "React / Angular / Full-stack" },
  { companyName: "Veritos Infosolutions Pvt. Ltd.", location: "Mohali", roleTarget: "Full Stack Web Developer" },
  { companyName: "KIT", location: "Mohali", roleTarget: "Full Stack Engineer" },
  { companyName: "SuccessVisa", location: "Chandigarh", roleTarget: "Full Stack Developer" },
  { companyName: "VitalTech Solutions", location: "Chandigarh", roleTarget: "Software Developer" },
];

const companyAliases = {
  "suffescom solutions suffes com": ["Suffescom Solutions"],
  "thinknext technologies thinknext training": ["ThinkNEXT Technologies"],
  "quark software": ["Quark Software / QuarkCity"],
  "bebo technologies": ["bebo Technologies"],
  kit: ["KIT / KIT Labs"],
};

const normalizeCompanyName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\bpvt\.?\b/g, "private")
    .replace(/\bltd\.?\b/g, "limited")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const cleanMarkdown = (value) =>
  String(value || "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();

const extractEmails = (value) => {
  const matches = cleanMarkdown(value).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  return [...new Set(matches || [])];
};

const extractUrls = (value) => {
  const matches = cleanMarkdown(value).match(/https?:\/\/[^\s)]+/gi);
  return [...new Set(matches || [])].map((url) => url.replace(/[.,]+$/, ""));
};

const splitMarkdownRow = (line) =>
  line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

const mergeMeta = (current, incoming) => {
  if (!current) return incoming;

  const currentSent = current.rawStatus === "sent";
  const incomingSent = incoming.rawStatus === "sent";
  const emails = [...new Set([...current.emails, ...incoming.emails])];
  const urls = [...new Set([...current.urls, ...incoming.urls])];
  const notes = [...new Set([current.notes, incoming.notes].filter(Boolean))].join(" ");

  return {
    ...current,
    ...incoming,
    rawStatus: currentSent || incomingSent ? "sent" : incoming.rawStatus || current.rawStatus,
    emails,
    urls,
    notes,
  };
};

const parseOutreachMarkdown = (markdown) => {
  const map = new Map();

  markdown.split("\n").forEach((line) => {
    if (!line.startsWith("| ") || line.includes("| --- |")) return;

    const [company, role, contacts, status, notes] = splitMarkdownRow(line);
    if (!company || company === "Company") return;

    const urls = extractUrls(notes);
    const meta = {
      companyName: cleanMarkdown(company),
      roleTarget: cleanMarkdown(role),
      emails: extractEmails(contacts),
      rawStatus: cleanMarkdown(status).toLowerCase(),
      urls,
      website: urls.find((url) => !url.includes("linkedin.com")) || "",
      linkedin: urls.find((url) => url.includes("linkedin.com")) || "",
      notes: cleanMarkdown(notes),
    };

    const key = normalizeCompanyName(company);
    map.set(key, mergeMeta(map.get(key), meta));
  });

  return map;
};

const outreachByCompany = parseOutreachMarkdown(outreachMarkdown);

const getOutreachMeta = (companyName) => {
  const key = normalizeCompanyName(companyName);
  const direct = outreachByCompany.get(key);
  if (direct) return direct;

  const aliases = companyAliases[key] || [];
  for (const alias of aliases) {
    const match = outreachByCompany.get(normalizeCompanyName(alias));
    if (match) return match;
  }

  return null;
};

const buildBasicInfo = (company) =>
  `Target role: ${company.roleTarget}. Preferred location: ${company.location}.`;

export const companies = sourceCompanies.map((company, index) => {
  const meta = getOutreachMeta(company.companyName);
  const isSent = meta?.rawStatus === "sent";

  return {
    id: index + 1,
    companyNumber: index + 1,
    companyName: company.companyName,
    roleTarget: company.roleTarget,
    location: company.location,
    companySize: "Unknown",
    website: meta?.website || "",
    linkedin: meta?.linkedin || "",
    basicInfo: buildBasicInfo(company),
    appliedDate: isSent ? OUTREACH_SENT_DATE : "",
    status: isSent ? "Sent" : "Pending",
    emails: meta?.emails || [],
    responses: [],
    notes: meta?.notes || "",
  };
});

export const originalCompanies = companies;
