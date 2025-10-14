"use strict";(()=>{var e={};e.id=757,e.ids=[757],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},6162:e=>{e.exports=require("worker_threads")},71568:e=>{e.exports=require("zlib")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},37538:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>R,patchFetch:()=>A,requestAsyncStorage:()=>x,routeModule:()=>f,serverHooks:()=>S,staticGenerationAsyncStorage:()=>y});var o={};t.r(o),t.d(o,{POST:()=>v});var i=t(49303),a=t(88716),n=t(60670),s=t(87070),c=t(74351),l=t(92048),p=t.n(l),u=t(55315),m=t.n(u);let d=new c.ZP({apiKey:process.env.ANTHROPIC_API_KEY}),h=()=>{try{let e=m().join(process.cwd(),"data","comprehensive_profile.json");return JSON.parse(p().readFileSync(e,"utf8"))}catch(e){return console.error("Error loading profile data:",e),null}},g=e=>e?`You are an AI job matching expert analyzing opportunities for Ravi Poruri, a technology leader with 25+ years of experience.

RAVI'S COMPLETE PROFILE:

CURRENT ROLE (2024-Present):
- Founder & AI Product Leader at Equiti Ventures
- Building AI-powered applications (Scanity.ai, DefScan Pro, Scan2Secure)
- Focus on LLMs, Computer Vision, AI-native security platforms

CAREER PROGRESSION:
1. Cisco Systems - Senior Director, CX Platform Engineering (2020-2024)
   - Grew CX Cloud from MVP to $500M+ ARR in 4 years
   - Led 100+ person global organization
   - 25% increase in annual services revenue
   - 50% reduction in renewals cycle time

2. Dropbox - Global Head of Data & BI (2017-2020)
   - Led company from pre-IPO to IPO
   - Doubled revenue from $850M to $1.8B
   - 600M+ users platform
   - Global team of 35+ across 4 pillars
   - Enterprise analytics on AWS and Snowflake

3. Chegg - Director of Data Engineering (2015-2017)
   - First director of data engineering
   - 40% revenue increase in 12 months
   - 100% stock value growth in 12 months
   - Built team to 25+ people

4. Yahoo - Senior Manager, Data Platforms (2007-2015)
   - 400+ billion events, hundreds of petabytes
   - $2+ billion annual revenue
   - 10K+ servers, 450+ production clusters
   - Multiple U.S. patents

CORE STRENGTHS:
- AI/ML: Generative AI, LLMs, Computer Vision, Predictive Analytics (Expert level)
- Data Platforms: Big Data, Data Engineering, Analytics, Governance (Expert level)
- Cloud: AWS, Snowflake, Azure, Multi-cloud architecture (Expert level)
- Leadership: Team building, Strategy, P&L management, IPO experience (Expert level)
- Technical: SQL, Python, Java, Scala, JavaScript (Advanced level)

KEY ACHIEVEMENTS:
- Total Revenue Impact: $3.2B+ across career
- Team Leadership: 500+ people managed
- Platform Scale: 600M+ users served
- Multiple U.S. patents in data platforms

EDUCATION:
- MBA (Finance) - Amity University
- Bachelor of Computer Applications - Madras University

ANALYZE THE JOB DESCRIPTION AND PROVIDE:

1. **Match Score** (0-100%): Based on role requirements vs Ravi's background
2. **Match Reasons** (3-5 bullet points): Specific ways Ravi's experience aligns
3. **Skills to Highlight** (2-4 items): Areas where Ravi should emphasize relevant experience
4. **Recommendations** (3-4 strategic tips): How to position for this role
5. **Position Details**: Extract company, role, level, location, salary if mentioned

SCORING CRITERIA:
- 90-100%: Perfect alignment with experience and achievements
- 80-89%: Strong match with minor gaps
- 70-79%: Good fit requiring some positioning
- 60-69%: Moderate fit with experience translation needed
- 50-59%: Possible fit but significant gaps
- Below 50%: Poor fit

Return ONLY a valid JSON response with this exact structure:
{
  "matchScore": number,
  "matchReasons": ["reason1", "reason2", "reason3"],
  "missingSkills": ["skill1", "skill2"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "company": "Company Name",
  "position": "Job Title",
  "roleLevel": "C-Level/VP/Director/Senior/etc",
  "location": "Location",
  "salaryRange": "Salary range if mentioned or 'Not specified'"
}`:"Analyze this job description for a senior technology leader with 25+ years experience.";async function v(e){try{let{jobDescription:r}=await e.json();if(!r)return s.NextResponse.json({error:"Job description is required"},{status:400});if(!process.env.ANTHROPIC_API_KEY)return s.NextResponse.json({error:"API configuration missing"},{status:500});let t=h(),o=g(t),i=await d.messages.create({model:"claude-3-haiku-20240307",max_tokens:2e3,temperature:.3,system:o,messages:[{role:"user",content:`Please analyze this job description:

${r}`}]}),a="text"===i.content[0].type?i.content[0].text:"";try{let e=JSON.parse(a);return s.NextResponse.json(e)}catch(e){return console.error("Failed to parse AI response:",a),s.NextResponse.json({matchScore:75,matchReasons:["25+ years of technology leadership experience","$3.2B+ revenue impact across multiple companies","Proven track record scaling teams and platforms","Recent AI/ML expertise with current ventures"],missingSkills:["Review specific technology requirements in job description","Align current AI projects with role expectations"],recommendations:["Emphasize revenue impact and scaling achievements","Highlight recent AI/ML work at Equiti Ventures","Showcase team building and transformation experience"],company:"Company Name (extracted from job description)",position:"Technology Leadership Role",roleLevel:"Executive/Senior Leadership",location:"Location TBD",salaryRange:"Not specified"})}}catch(e){return console.error("Job matcher error:",e),s.NextResponse.json({error:"Failed to analyze job description"},{status:500})}}let f=new i.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/job-matcher/route",pathname:"/api/job-matcher",filename:"route",bundlePath:"app/api/job-matcher/route"},resolvedPagePath:"/Users/raviporuri/raviporuri-website/app/api/job-matcher/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:x,staticGenerationAsyncStorage:y,serverHooks:S}=f,R="/api/job-matcher/route";function A(){return(0,n.patchFetch)({serverHooks:S,staticGenerationAsyncStorage:y})}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[276,710],()=>t(37538));module.exports=o})();