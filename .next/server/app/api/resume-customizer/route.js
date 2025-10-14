"use strict";(()=>{var e={};e.id=198,e.ids=[198],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},6162:e=>{e.exports=require("worker_threads")},71568:e=>{e.exports=require("zlib")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},91496:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>I,patchFetch:()=>E,requestAsyncStorage:()=>y,routeModule:()=>v,serverHooks:()=>A,staticGenerationAsyncStorage:()=>S});var a={};t.r(a),t.d(a,{POST:()=>h});var n=t(49303),i=t(88716),o=t(60670),s=t(87070),l=t(74351),c=t(92048),d=t.n(c),u=t(55315),p=t.n(u);let m=new l.ZP({apiKey:process.env.ANTHROPIC_API_KEY}),g=()=>{try{let e=p().join(process.cwd(),"data","comprehensive_profile.json");return JSON.parse(d().readFileSync(e,"utf8"))}catch(e){return console.error("Error loading profile data:",e),null}},f=e=>e?`You are an expert resume writer specializing in technology executive resumes. You're customizing a resume for Ravi Poruri based on a specific job description.

RAVI'S COMPLETE BACKGROUND (ALL FACTUAL - NEVER INVENT OR EXAGGERATE):

CURRENT ROLE (2024-Present):
Equiti Ventures - Founder & AI Product Leader
- Leading development of AI-powered mobile applications
- Building next-generation AI security platforms: Scanity.ai, DefScan Pro, Scan2Secure
- Leveraging cutting-edge LLMs, Computer Vision, and Machine Learning technologies
- Creating AI-native applications with advanced ML capabilities

PREVIOUS ROLES:

Cisco Systems - Senior Director, CX Platform Engineering (2020-2024)
- Led global team responsible for Customer Experience Cloud data and analytics solutions
- Grew CX Cloud from MVP to over $500M ARR in 4 years
- Achieved 25% increase in annual services revenue
- Delivered 50% reduction in renewals cycle time for existing customers
- Managed 100+ person organization across Business Architectures, Data Engineering, and Cloud Engineering teams
- Served 4500+ enterprise customers globally
- First to leverage cross-product telemetry streams for feature utilization insights
- Generated predictive models for licensing, security and product updates

Dropbox - Global Head of Data and Business Intelligence (2017-2020)
- Developed enterprise data strategy for cloud storage company with 600M+ users
- Led Dropbox from pre-IPO to successful IPO, collaborating with Finance, Growth, and Business Strategy
- Doubled company revenue from $850M to more than $1.8B through accurate insights and forecasting
- Implemented enterprise analytics capability on AWS and Snowflake
- Led enterprise data integrations across 20+ SAAS technologies
- Built and managed global organization of 35+ FTE across 4 pillars (Big Data Engineering, Data Integrations, Data Governance, Business Analytics)
- Incorporated global data compliance standards (GDPR, CCPA)
- Led 3 of world's largest open source big data platforms
- Speaker at Snowflake Summit 2019 and Tableau Conference 2019

Chegg - Director of Data Engineering, Data Science, and BI (2015-2017)
- Company's first director of data engineering, led development of first comprehensive digital platform
- Achieved revenue increase >40% within 12 months
- Helped company's stock value grow 100% within 12 months
- Built engineering organization to >25 people
- Developed team in India from scratch into center of excellence
- Standardized all data and implemented tools for data quality, discovery, and access
- Introduced real-time search and analytics, eliminating vendor dependence
- Provided company's first comprehensive insights on users
- Served 4M users across 8 product lines

Yahoo - Senior Manager (2011-2015) & Manager of Database Administration (2007-2011)
- Managed delivery of >400 billion events and several hundred petabytes of data
- Generated >$2 billion in annual revenue
- Developed company's first unified internal advertising data mart
- Became finalist for Gartner BI Excellence Award
- Improved audience targeting by 15%
- Built world's largest MS OLAP SSAS Cube (20+ terabyte)
- Led building of entire data infrastructure for Yahoo Search Advertising
- Managed company-wide consolidation of reporting platforms from 13 to 3
- Pioneered adoption of Hadoop, Apache Storm, Apache Spark, Druid, Kafka
- Led infrastructure deployments of thousands of servers
- Managed 10K+ servers, 450+ production clusters
- Multiple U.S. patents awarded for Hadoop integration technologies

EDUCATION:
- MBA (Finance) - Amity University, India
- Bachelor of Computer Applications - Madras University, India (2000)

CERTIFICATIONS & RECOGNITION:
- Oracle Certified Professional
- Teradata Certified Implementation Specialist
- Multiple U.S. Patents in Data Platform Technologies
- Gartner BI Excellence Award Finalist (2015)
- Snowflake Black Diamond Executive Council Member (2019-2020)
- SF State University Big Data Advisory Board Member
- Speaker: Snowflake Summit 2019, Tableau Conference 2019

TECHNICAL EXPERTISE:
AI/ML: Generative AI, LLMs, Computer Vision, Machine Learning, Predictive Analytics
Data Platforms: Big Data, Hadoop, Apache Spark, Apache Storm, Druid, Kafka, Data Engineering, Analytics, Data Governance, ETL/ELT
Cloud: AWS, Snowflake, Azure, Multi-cloud architecture, Cloud-native development
Programming: SQL, Python, Java, Scala, JavaScript, NoSQL databases
Infrastructure: Oracle, MS SQL Server, Teradata, 10GbE networks, enterprise systems

QUANTIFIED ACHIEVEMENTS:
- Total Revenue Impact: $3.2B+ across career
- Team Leadership: 500+ people managed globally
- Platform Scale: 600M+ users served (Dropbox)
- Data Volume: 400B+ events processed daily (Yahoo)
- Infrastructure: 10K+ servers, 450+ clusters managed
- Patents: Multiple U.S. patents in data platform technologies
- Growth: Led companies from pre-IPO to IPO, startup to acquisition

INSTRUCTIONS:
1. Analyze the job description to understand key requirements
2. Customize Ravi's resume to highlight the MOST RELEVANT experience for this specific role
3. Reorder and emphasize achievements that directly align with job requirements
4. Use specific metrics and achievements from his actual experience
5. NEVER invent, exaggerate, or fabricate any information
6. Focus on the most compelling and relevant aspects of his 25+ year journey
7. Ensure the resume demonstrates clear value proposition for the target role

Return ONLY a valid JSON response with this structure:
{
  "summary": "2-3 sentence executive summary tailored to the role",
  "keyAchievements": ["achievement 1", "achievement 2", "achievement 3", "achievement 4"],
  "relevantExperience": [
    "COMPANY - ROLE (DATES)
• Key responsibility/achievement aligned to job
• Another relevant point
• Quantified business impact",
    "Next most relevant role formatted similarly"
  ],
  "technicalSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
  "recommendations": [
    "Strategic tip for positioning Ravi for this role",
    "Interview talking point recommendation",
    "Application strategy advice"
  ]
}`:"Customize a resume for a senior technology leader with 25+ years experience.";async function h(e){try{let{jobDescription:r}=await e.json();if(!r)return s.NextResponse.json({error:"Job description is required"},{status:400});if(!process.env.ANTHROPIC_API_KEY)return s.NextResponse.json({error:"API configuration missing"},{status:500});let t=g(),a=f(t),n=await m.messages.create({model:"claude-3-haiku-20240307",max_tokens:3e3,temperature:.3,system:a,messages:[{role:"user",content:`Please customize Ravi's resume for this job description:

${r}`}]}),i="text"===n.content[0].type?n.content[0].text:"";try{let e=JSON.parse(i);return s.NextResponse.json(e)}catch(e){return console.error("Failed to parse AI response:",i),s.NextResponse.json({summary:"Technology leader with 25+ years driving digital transformations and scaling organizations. Proven track record delivering $3.2B+ revenue impact across Yahoo, Dropbox, Cisco, and current AI ventures. Expert in data platforms, AI/ML, and building world-class engineering teams from startup to IPO.",keyAchievements:["Grew Cisco CX Cloud from MVP to $500M+ ARR in 4 years","Doubled Dropbox revenue from $850M to $1.8B, led pre-IPO to IPO transition","Generated $2B+ annual revenue at Yahoo managing 400B+ events daily","Built and scaled engineering organizations totaling 500+ people globally"],relevantExperience:["EQUITI VENTURES - Founder & AI Product Leader (2024-Present)\n• Leading development of AI-powered applications using cutting-edge LLMs and computer vision\n• Building next-generation AI security platforms (Scanity.ai, DefScan Pro, Scan2Secure)\n• Creating AI-native applications with advanced ML capabilities","CISCO SYSTEMS - Senior Director, CX Platform Engineering (2020-2024)\n• Grew CX Cloud from MVP to $500M+ ARR in 4 years\n• Led global organization of 100+ across data engineering and analytics\n• Achieved 25% increase in annual services revenue and 50% reduction in cycle time","DROPBOX - Global Head of Data & Business Intelligence (2017-2020)\n• Led company from pre-IPO to successful IPO with 600M+ users\n• Doubled revenue from $850M to $1.8B through data-driven insights\n• Built enterprise analytics on AWS and Snowflake with 35+ person global team"],technicalSkills:["Generative AI & LLMs","Big Data & Analytics","AWS & Cloud Platforms","Data Engineering","Python & SQL","Team Leadership"],recommendations:["Emphasize recent AI/ML work at Equiti Ventures to show cutting-edge technical leadership","Highlight specific revenue impact numbers ($3.2B+) to demonstrate business value delivery","Showcase experience scaling teams and platforms across different growth stages"]})}}catch(e){return console.error("Resume customizer error:",e),s.NextResponse.json({error:"Failed to customize resume"},{status:500})}}let v=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/resume-customizer/route",pathname:"/api/resume-customizer",filename:"route",bundlePath:"app/api/resume-customizer/route"},resolvedPagePath:"/Users/raviporuri/raviporuri-website/app/api/resume-customizer/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:y,staticGenerationAsyncStorage:S,serverHooks:A}=v,I="/api/resume-customizer/route";function E(){return(0,o.patchFetch)({serverHooks:A,staticGenerationAsyncStorage:S})}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[276,710],()=>t(91496));module.exports=a})();