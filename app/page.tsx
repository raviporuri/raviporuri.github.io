import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Dynamic imports for heavy components
const AIResumeGenerator = dynamic(
  () => import('@/components/ai/ai-resume-generator').then(mod => ({ default: mod.AIResumeGenerator })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

const JobMatchingEngine = dynamic(
  () => import('@/components/ai/job-matching-engine').then(mod => ({ default: mod.JobMatchingEngine })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

const CareerAnalytics = dynamic(
  () => import('@/components/ai/career-analytics').then(mod => ({ default: mod.CareerAnalytics })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export default function HomePage() {
  return (
    <main className="relative">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Ravi Poruri
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 mb-8">
            AI Entrepreneur & Technology Leader
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            25+ year technology executive, AI entrepreneur, and founder of Equiti Ventures.
            Expert in scaling data platforms, leading global teams, and building AI-powered applications.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#resume-generator" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              AI Resume Generator
            </a>
            <a href="#job-matching" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              Job Matching
            </a>
          </div>
        </div>
      </div>

      {/* AI Tools - Lazy Loaded */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <Suspense fallback={<LoadingSpinner />}>
          <section id="resume-generator" className="scroll-mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🤖 AI Resume Generator
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Generate professional, ATS-optimized resumes tailored to any job or industry.
                Choose from 50+ templates with country-specific formatting.
              </p>
            </div>
            <AIResumeGenerator />
          </section>
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <section id="job-matching" className="scroll-mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎯 Intelligent Job Matching
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Find perfect job matches using AI analysis. Get personalized resume
                tailoring and application strategies for each opportunity.
              </p>
            </div>
            <JobMatchingEngine />
          </section>
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <section id="career-analytics" className="scroll-mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                📊 Career Analytics & Predictions
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Get AI-powered insights into your career trajectory, salary predictions,
                and skill development recommendations based on market data.
              </p>
            </div>
            <CareerAnalytics />
          </section>
        </Suspense>
      </div>

      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Ravi Poruri",
            "jobTitle": "AI Entrepreneur & Technology Leader",
            "description": "25+ year technology executive, AI entrepreneur, and founder of Equiti Ventures. Expert in scaling data platforms, leading global teams, and building AI-powered applications.",
            "url": "https://raviporuri.com",
            "image": "https://raviporuri.com/profile-image.jpg",
            "email": "raviporuri@gmail.com",
            "alumniOf": [
              {
                "@type": "CollegeOrUniversity",
                "name": "Amity University"
              },
              {
                "@type": "CollegeOrUniversity",
                "name": "Madras University"
              }
            ],
            "worksFor": {
              "@type": "Organization",
              "name": "Equiti Ventures",
              "description": "AI-powered mobile applications and platforms"
            },
            "hasOccupation": {
              "@type": "Occupation",
              "name": "Technology Leader",
              "description": "AI entrepreneur and technology executive with expertise in data platforms, team leadership, and product development",
              "skills": [
                "Artificial Intelligence",
                "Machine Learning",
                "Data Platforms",
                "Team Leadership",
                "Product Management",
                "Enterprise Architecture",
                "Digital Transformation"
              ]
            },
            "award": [
              "Gartner BI Excellence Award Finalist",
              "Multiple U.S. Patents in AI and Data Technologies",
              "Snowflake Black Diamond Executive Council Member"
            ],
            "knowsAbout": [
              "Artificial Intelligence",
              "Machine Learning",
              "Data Science",
              "Cloud Computing",
              "Enterprise Software",
              "Team Leadership",
              "Product Management",
              "Digital Transformation",
              "Startup Founding",
              "Technology Strategy"
            ],
            "sameAs": [
              "https://linkedin.com/in/raviporuri",
              "https://github.com/raviporuri",
              "https://twitter.com/raviporuri"
            ]
          })
        }}
      />
    </main>
  )
}