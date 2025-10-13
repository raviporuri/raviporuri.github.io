'use client'

export function CareerAnalytics() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Career Analytics & Predictions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Salary Predictions</h3>
          <p className="text-gray-600 mb-4">Get AI-powered salary insights based on your experience, skills, and market data.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Analyze Salary
          </button>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Skills Analysis</h3>
          <p className="text-gray-600 mb-4">Discover which skills are in demand and plan your professional development.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
            Analyze Skills
          </button>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Career Growth</h3>
          <p className="text-gray-600 mb-4">Get personalized recommendations for your next career move.</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
            Plan Growth
          </button>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Market Trends</h3>
          <p className="text-gray-600 mb-4">Stay ahead with insights into industry trends and opportunities.</p>
          <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors">
            View Trends
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>* Analytics powered by real market data and machine learning algorithms</p>
      </div>
    </div>
  )
}