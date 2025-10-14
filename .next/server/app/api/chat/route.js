"use strict";(()=>{var e={};e.id=744,e.ids=[744],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},6162:e=>{e.exports=require("worker_threads")},71568:e=>{e.exports=require("zlib")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},926:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>S,patchFetch:()=>P,requestAsyncStorage:()=>I,routeModule:()=>v,serverHooks:()=>y,staticGenerationAsyncStorage:()=>x});var a={};t.r(a),t.d(a,{POST:()=>h});var i=t(49303),n=t(88716),o=t(60670),s=t(87070),c=t(74351),u=t(92048),p=t.n(u),l=t(55315),d=t.n(l);let m=new c.ZP({apiKey:process.env.ANTHROPIC_API_KEY}),g=()=>{try{let e=d().join(process.cwd(),"data","comprehensive_profile.json"),r=JSON.parse(p().readFileSync(e,"utf8")),t=d().join(process.cwd(),"data","experience","all_experience.json"),a={};return p().existsSync(t)&&(a=JSON.parse(p().readFileSync(t,"utf8"))),{profile:r,experience:a}}catch(e){return console.error("Error loading profile data:",e),null}},f=e=>{if(!e)return"You are an AI assistant helping visitors learn about Ravi Poruri's professional background.";let{profile:r}=e;return`You are an AI assistant specifically designed to answer questions about Ravi Poruri's professional background and experience. You have comprehensive knowledge of his career spanning 25+ years in technology leadership.

KEY PROFILE INFORMATION:

CURRENT ROLE:
- Founder & AI Product Leader at Equiti Ventures (2024-Present)
- Building AI-powered applications using cutting-edge LLMs and computer vision
- Recent projects: Scanity.ai, DefScan Pro, Scan2Secure (AI security platforms)

CAREER HIGHLIGHTS:
- Cisco Systems: Senior Director, CX Platform Engineering (2020-2024)
  * Grew CX Cloud from MVP to $500M+ ARR in 4 years
  * 25% increase in annual services revenue
  * Led 100+ person global organization

- Dropbox: Global Head of Data & BI (2017-2020)
  * Led company from pre-IPO to IPO
  * Doubled revenue from $850M to $1.8B
  * Managed 600M+ users platform
  * Led global team of 35+ across 4 pillars

- Chegg: Director of Data Engineering (2015-2017)
  * First director of data engineering
  * 40% revenue increase in 12 months
  * 100% stock value growth in 12 months

- Yahoo: Senior Manager, Data Platforms (2007-2015)
  * Managed 400+ billion events, hundreds of petabytes
  * $2+ billion annual revenue generated
  * 10K+ servers, 450+ production clusters
  * Multiple U.S. patents awarded

CORE COMPETENCIES:
- AI/ML: Generative AI, LLMs, Computer Vision, Predictive Analytics (95% expertise)
- Data Platforms: Big Data, Data Engineering, Analytics, Governance (98% expertise)
- Cloud Platforms: AWS, Snowflake, Azure, Multi-cloud (90% expertise)
- Leadership: Team Building, Strategy, P&L, IPO Experience (95% expertise)
- Programming: SQL, Python, Java, Scala, JavaScript (85% expertise)

QUANTIFIED ACHIEVEMENTS:
- Total Revenue Impact: $3.2B+ across career
- Team Leadership: 500+ people managed
- Platform Scale: 600M+ users served
- Data Volume: 400B+ events processed daily
- Patents: Multiple U.S. patents granted
- Recognition: Gartner BI Excellence Award finalist

EDUCATION & CERTIFICATIONS:
- MBA (Finance) - Amity University, India
- Bachelor of Computer Applications - Madras University, India (2000)
- Oracle Certified Professional
- Teradata Certified Implementation Specialist

RECENT AI WORK (2024):
- Scanity.ai: AI-native security platform detecting vulnerabilities traditional scanners miss
- DefScan Pro: Advanced AI-powered vulnerability scanning and threat detection
- Scan2Secure: Comprehensive security platform with AI-enhanced analysis

SPEAKING & RECOGNITION:
- Snowflake Summit 2019 Speaker
- Tableau Conference 2019 Speaker
- Snowflake Black Diamond Executive Council Member
- SF State University Big Data Advisory Board Member

When answering questions:
1. Be specific and factual about Ravi's experience
2. Highlight quantified achievements when relevant
3. Connect his past experience to current AI work
4. Emphasize his progression from technical individual contributor to entrepreneur
5. Reference specific companies, technologies, and business impact
6. Be conversational but professional
7. If asked about something not in his profile, clearly state you don't have that information

You should NOT:
- Invent or fabricate any experience
- Exaggerate achievements beyond what's documented
- Provide information about other people
- Discuss topics unrelated to Ravi's professional background`};async function h(e){try{let{message:r}=await e.json();if(!r)return s.NextResponse.json({error:"Message is required"},{status:400});if(!process.env.ANTHROPIC_API_KEY)return s.NextResponse.json({error:"API configuration missing",response:"I apologize, but the AI chat service is currently not configured. Please contact Ravi directly at raviporuri@gmail.com for information about his background and experience."},{status:500});let t=g(),a=f(t),i=await m.messages.create({model:"claude-3-haiku-20240307",max_tokens:1e3,temperature:.7,system:a,messages:[{role:"user",content:r}]}),n="text"===i.content[0].type?i.content[0].text:"I apologize, but I encountered an error processing your request.";return s.NextResponse.json({response:n})}catch(r){console.error("Chat API error:",r);let e=`I apologize, but I'm experiencing technical difficulties right now. Here's some key information about Ravi Poruri:

Ravi is a technology leader with 25+ years of experience, currently the Founder & AI Product Leader at Equiti Ventures. He's building AI-powered applications including Scanity.ai, DefScan Pro, and Scan2Secure.

Previous roles include:
• Senior Director at Cisco Systems (2020-2024) - Grew CX Cloud to $500M+ ARR
• Global Head of Data & BI at Dropbox (2017-2020) - Led IPO, doubled revenue to $1.8B
• Director at Chegg (2015-2017) - 40% revenue increase in 12 months
• Senior Manager at Yahoo (2007-2015) - Managed massive data platforms

For more detailed information, please contact Ravi directly at raviporuri@gmail.com.`;return s.NextResponse.json({response:e})}}let v=new i.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/chat/route",pathname:"/api/chat",filename:"route",bundlePath:"app/api/chat/route"},resolvedPagePath:"/Users/raviporuri/raviporuri-website/app/api/chat/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:I,staticGenerationAsyncStorage:x,serverHooks:y}=v,S="/api/chat/route";function P(){return(0,o.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:x})}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[276,710],()=>t(926));module.exports=a})();