// AI-Driven Professional Dashboard
class AIDashboard {
    constructor() {
        this.apiBase = '/.netlify/functions';
        this.currentUser = null;
        this.linkedinToken = localStorage.getItem('linkedin_token');
        this.init();
    }

    async init() {
        this.createDashboardStructure();
        this.bindEvents();
        await this.loadInitialData();
    }

    createDashboardStructure() {
        const dashboardHTML = `
            <div id="aiDashboard" class="ai-dashboard hidden">
                <!-- Navigation -->
                <nav class="dashboard-nav">
                    <div class="nav-brand">
                        <h2>🤖 AI Career Assistant</h2>
                    </div>
                    <div class="nav-tabs">
                        <button class="nav-tab active" data-section="overview">Overview</button>
                        <button class="nav-tab" data-section="content-gen">Content Gen</button>
                        <button class="nav-tab" data-section="career-viz">Career Journey</button>
                        <button class="nav-tab" data-section="skills-test">Skills Test</button>
                        <button class="nav-tab" data-section="analytics">Analytics</button>
                        <button class="nav-tab" data-section="networking">Networking</button>
                    </div>
                    <button class="close-dashboard">✕</button>
                </nav>

                <!-- Dashboard Content -->
                <div class="dashboard-content">
                    <!-- Overview Section -->
                    <section id="overview-section" class="dashboard-section active">
                        <div class="overview-grid">
                            <div class="overview-card">
                                <h3>🎯 Career Insights</h3>
                                <div id="career-summary"></div>
                                <button onclick="aiDashboard.generateCareerAnalysis()">Generate Analysis</button>
                            </div>
                            <div class="overview-card">
                                <h3>📊 Profile Analytics</h3>
                                <canvas id="profileChart" width="300" height="150"></canvas>
                            </div>
                            <div class="overview-card">
                                <h3>🔗 LinkedIn Integration</h3>
                                <div id="linkedin-status"></div>
                                <button onclick="aiDashboard.connectLinkedIn()">Connect LinkedIn</button>
                            </div>
                            <div class="overview-card">
                                <h3>📝 Recent Content</h3>
                                <div id="recent-content"></div>
                            </div>
                        </div>
                    </section>

                    <!-- Content Generation Section -->
                    <section id="content-gen-section" class="dashboard-section">
                        <div class="content-gen-container">
                            <div class="gen-controls">
                                <select id="content-type">
                                    <option value="blog-post">Blog Post</option>
                                    <option value="case-study">Case Study</option>
                                    <option value="personalized-landing">Landing Page</option>
                                    <option value="resume-template">Resume Template</option>
                                    <option value="networking-pitch">Networking Pitch</option>
                                </select>

                                <div id="dynamic-params"></div>

                                <button id="generate-content" onclick="aiDashboard.generateContent()">
                                    🚀 Generate with AI
                                </button>
                            </div>

                            <div class="content-preview">
                                <div class="preview-header">
                                    <h3>Generated Content</h3>
                                    <div class="preview-actions">
                                        <button onclick="aiDashboard.copyContent()">📋 Copy</button>
                                        <button onclick="aiDashboard.downloadContent()">💾 Download</button>
                                        <button onclick="aiDashboard.shareContent()">🔗 Share</button>
                                    </div>
                                </div>
                                <div id="content-output" class="content-output"></div>
                            </div>
                        </div>
                    </section>

                    <!-- Career Journey Visualizer -->
                    <section id="career-viz-section" class="dashboard-section">
                        <div class="career-viz-container">
                            <div class="viz-controls">
                                <h3>🛤️ Career Journey Visualizer</h3>
                                <div class="control-group">
                                    <label>Focus Area:</label>
                                    <select id="career-focus">
                                        <option value="timeline">Timeline View</option>
                                        <option value="skills-evolution">Skills Evolution</option>
                                        <option value="impact-metrics">Impact Metrics</option>
                                        <option value="network-growth">Network Growth</option>
                                    </select>
                                </div>
                                <button onclick="aiDashboard.generateCareerViz()">Generate Visualization</button>
                            </div>

                            <div class="career-timeline" id="career-timeline">
                                <!-- Dynamic timeline content -->
                            </div>

                            <div class="career-insights" id="career-insights">
                                <!-- AI-generated insights -->
                            </div>
                        </div>
                    </section>

                    <!-- Skills Assessment Section -->
                    <section id="skills-test-section" class="dashboard-section">
                        <div class="skills-test-container">
                            <div class="test-setup">
                                <h3>🧠 AI Skills Assessment</h3>
                                <div class="setup-controls">
                                    <div class="control-group">
                                        <label>Skill Category:</label>
                                        <select id="skill-category">
                                            <option value="ai_ml">AI/ML & Data Science</option>
                                            <option value="cloud_platforms">Cloud Platforms</option>
                                            <option value="programming_languages">Programming Languages</option>
                                            <option value="data_technologies">Data Technologies</option>
                                            <option value="leadership">Leadership & Management</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label>Difficulty Level:</label>
                                        <select id="skill-level">
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label>Number of Questions:</label>
                                        <select id="question-count">
                                            <option value="5">5 Questions</option>
                                            <option value="10">10 Questions</option>
                                            <option value="15">15 Questions</option>
                                        </select>
                                    </div>
                                </div>
                                <button onclick="aiDashboard.startSkillsTest()">Start Assessment</button>
                            </div>

                            <div id="skills-quiz" class="skills-quiz hidden">
                                <!-- Dynamic quiz content -->
                            </div>

                            <div id="quiz-results" class="quiz-results hidden">
                                <!-- Results and recommendations -->
                            </div>
                        </div>
                    </section>

                    <!-- Analytics Dashboard -->
                    <section id="analytics-section" class="dashboard-section">
                        <div class="analytics-container">
                            <h3>📈 Predictive Analytics</h3>

                            <div class="analytics-grid">
                                <div class="analytics-card">
                                    <h4>Career Trajectory</h4>
                                    <canvas id="trajectoryChart" width="400" height="200"></canvas>
                                    <div class="chart-insights" id="trajectory-insights"></div>
                                </div>

                                <div class="analytics-card">
                                    <h4>Skill Gap Analysis</h4>
                                    <div id="skill-gaps"></div>
                                </div>

                                <div class="analytics-card">
                                    <h4>Market Trends</h4>
                                    <canvas id="trendsChart" width="400" height="200"></canvas>
                                </div>

                                <div class="analytics-card">
                                    <h4>Salary Predictions</h4>
                                    <div id="salary-predictions"></div>
                                </div>
                            </div>

                            <div class="prediction-controls">
                                <h4>🔮 Generate Predictions</h4>
                                <div class="prediction-form">
                                    <input type="text" id="current-role" placeholder="Current Role">
                                    <input type="number" id="years-exp" placeholder="Years Experience">
                                    <input type="text" id="target-goals" placeholder="Career Goals (comma separated)">
                                    <button onclick="aiDashboard.generatePredictions()">Predict Future</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Networking Section -->
                    <section id="networking-section" class="dashboard-section">
                        <div class="networking-container">
                            <h3>🤝 AI-Powered Networking</h3>

                            <div class="networking-grid">
                                <div class="networking-card">
                                    <h4>Smart Connections</h4>
                                    <div id="connection-suggestions"></div>
                                    <button onclick="aiDashboard.findConnections()">Find Matches</button>
                                </div>

                                <div class="networking-card">
                                    <h4>Pitch Generator</h4>
                                    <div class="pitch-form">
                                        <input type="text" id="target-person" placeholder="Target Person/Role">
                                        <select id="networking-context">
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="conference">Conference</option>
                                            <option value="email">Email</option>
                                            <option value="twitter">Twitter</option>
                                        </select>
                                        <textarea id="networking-goal" placeholder="Your goal for this connection"></textarea>
                                        <button onclick="aiDashboard.generatePitch()">Generate Pitch</button>
                                    </div>
                                    <div id="generated-pitch"></div>
                                </div>

                                <div class="networking-card">
                                    <h4>Follow-up Automation</h4>
                                    <div id="followup-suggestions"></div>
                                </div>
                            </div>

                            <div class="network-analysis">
                                <h4>Network Analysis</h4>
                                <canvas id="networkChart" width="500" height="300"></canvas>
                                <div id="network-insights"></div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
        this.loadStyles();
    }

    loadStyles() {
        const styles = `
            <style>
                .ai-dashboard {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #f5f7fa;
                    z-index: 10000;
                    overflow-y: auto;
                }

                .ai-dashboard.hidden {
                    display: none;
                }

                .dashboard-nav {
                    background: white;
                    padding: 1rem 2rem;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .nav-brand h2 {
                    margin: 0;
                    color: #667eea;
                    font-size: 1.5rem;
                }

                .nav-tabs {
                    display: flex;
                    gap: 1rem;
                }

                .nav-tab {
                    padding: 0.5rem 1rem;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    border-radius: 20px;
                    transition: all 0.3s;
                }

                .nav-tab.active, .nav-tab:hover {
                    background: #667eea;
                    color: white;
                }

                .close-dashboard {
                    background: #ff4757;
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.2rem;
                }

                .dashboard-content {
                    padding: 2rem;
                }

                .dashboard-section {
                    display: none;
                }

                .dashboard-section.active {
                    display: block;
                }

                .overview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .overview-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 15px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                }

                .overview-card h3 {
                    color: #667eea;
                    margin-bottom: 1rem;
                    font-size: 1.2rem;
                }

                .content-gen-container {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 2rem;
                    height: 70vh;
                }

                .gen-controls {
                    background: white;
                    padding: 2rem;
                    border-radius: 15px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                }

                .content-preview {
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                }

                .preview-header {
                    padding: 1rem 2rem;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .preview-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .content-output {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                    font-family: 'Monaco', 'Menlo', monospace;
                    line-height: 1.6;
                    background: #f8f9fa;
                    margin: 1rem;
                    border-radius: 10px;
                }

                .career-viz-container {
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    padding: 2rem;
                }

                .viz-controls {
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #eee;
                }

                .control-group {
                    margin-bottom: 1rem;
                }

                .control-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #333;
                }

                .control-group select,
                .control-group input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                }

                .career-timeline {
                    min-height: 400px;
                    position: relative;
                    margin: 2rem 0;
                }

                .timeline-item {
                    position: relative;
                    padding-left: 3rem;
                    margin-bottom: 2rem;
                }

                .timeline-item::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #667eea;
                }

                .timeline-item::after {
                    content: '';
                    position: absolute;
                    left: 9px;
                    top: 20px;
                    width: 2px;
                    height: calc(100% + 1rem);
                    background: #e0e0e0;
                }

                .skills-test-container {
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    padding: 2rem;
                }

                .test-setup {
                    margin-bottom: 2rem;
                }

                .setup-controls {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin: 1rem 0;
                }

                .skills-quiz {
                    margin: 2rem 0;
                }

                .quiz-question {
                    background: #f8f9fa;
                    padding: 2rem;
                    border-radius: 10px;
                    margin-bottom: 2rem;
                }

                .quiz-options {
                    list-style: none;
                    padding: 0;
                }

                .quiz-options li {
                    padding: 0.75rem;
                    margin: 0.5rem 0;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.3s;
                }

                .quiz-options li:hover {
                    border-color: #667eea;
                }

                .quiz-options li.selected {
                    background: #667eea;
                    color: white;
                }

                .analytics-container {
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    padding: 2rem;
                }

                .analytics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 2rem;
                    margin: 2rem 0;
                }

                .analytics-card {
                    background: #f8f9fa;
                    padding: 1.5rem;
                    border-radius: 10px;
                    border-left: 4px solid #667eea;
                }

                .networking-container {
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    padding: 2rem;
                }

                .networking-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin: 2rem 0;
                }

                .networking-card {
                    background: #f8f9fa;
                    padding: 1.5rem;
                    border-radius: 10px;
                }

                .pitch-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .pitch-form textarea {
                    min-height: 80px;
                    resize: vertical;
                }

                #generated-pitch {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                }

                button {
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: transform 0.3s, box-shadow 0.3s;
                }

                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                }

                .loading {
                    text-align: center;
                    padding: 2rem;
                    color: #667eea;
                }

                .loading::after {
                    content: '...';
                    animation: loading-dots 1.5s infinite;
                }

                @keyframes loading-dots {
                    0%, 20% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }

                @media (max-width: 768px) {
                    .dashboard-nav {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .nav-tabs {
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .content-gen-container {
                        grid-template-columns: 1fr;
                        height: auto;
                    }

                    .overview-grid,
                    .analytics-grid,
                    .networking-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Close dashboard
        document.querySelector('.close-dashboard').addEventListener('click', () => {
            this.closeDashboard();
        });

        // Content type change
        document.getElementById('content-type').addEventListener('change', (e) => {
            this.updateDynamicParams(e.target.value);
        });
    }

    switchSection(sectionName) {
        // Update nav
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.dashboard-section').forEach(section => section.classList.remove('active'));
        document.getElementById(`${sectionName}-section`).classList.add('active');
    }

    updateDynamicParams(contentType) {
        const paramsContainer = document.getElementById('dynamic-params');
        let paramsHTML = '';

        switch (contentType) {
            case 'blog-post':
                paramsHTML = `
                    <div class="control-group">
                        <label>Topic:</label>
                        <input type="text" id="blog-topic" placeholder="e.g., AI in Enterprise Architecture">
                    </div>
                    <div class="control-group">
                        <label>Target Audience:</label>
                        <select id="blog-audience">
                            <option value="technical-leaders">Technical Leaders</option>
                            <option value="data-engineers">Data Engineers</option>
                            <option value="executives">Executives</option>
                            <option value="developers">Developers</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Length:</label>
                        <select id="blog-length">
                            <option value="800">800 words</option>
                            <option value="1200">1,200 words</option>
                            <option value="2000">2,000 words</option>
                        </select>
                    </div>
                `;
                break;
            case 'case-study':
                paramsHTML = `
                    <div class="control-group">
                        <label>Company:</label>
                        <select id="case-company">
                            <option value="cisco">Cisco</option>
                            <option value="dropbox">Dropbox</option>
                            <option value="yahoo">Yahoo</option>
                            <option value="chegg">Chegg</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Focus Area:</label>
                        <select id="case-focus">
                            <option value="digital-transformation">Digital Transformation</option>
                            <option value="data-platform">Data Platform</option>
                            <option value="team-leadership">Team Leadership</option>
                            <option value="revenue-growth">Revenue Growth</option>
                        </select>
                    </div>
                `;
                break;
            case 'personalized-landing':
                paramsHTML = `
                    <div class="control-group">
                        <label>Visitor Industry:</label>
                        <input type="text" id="visitor-industry" placeholder="e.g., FinTech">
                    </div>
                    <div class="control-group">
                        <label>Visitor Role:</label>
                        <input type="text" id="visitor-role" placeholder="e.g., CTO">
                    </div>
                    <div class="control-group">
                        <label>Company Size:</label>
                        <select id="company-size">
                            <option value="startup">Startup (1-50)</option>
                            <option value="midsize">Mid-size (51-500)</option>
                            <option value="enterprise">Enterprise (500+)</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Key Challenges:</label>
                        <textarea id="visitor-challenges" placeholder="Enter key challenges (one per line)"></textarea>
                    </div>
                `;
                break;
            case 'resume-template':
                paramsHTML = `
                    <div class="control-group">
                        <label>Target Role:</label>
                        <input type="text" id="target-role" placeholder="e.g., Senior Data Engineer">
                    </div>
                    <div class="control-group">
                        <label>Industry:</label>
                        <select id="target-industry">
                            <option value="technology">Technology</option>
                            <option value="finance">Finance</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="retail">Retail</option>
                            <option value="consulting">Consulting</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Experience Level:</label>
                        <select id="experience-level">
                            <option value="junior">Junior (0-3 years)</option>
                            <option value="mid">Mid-level (3-7 years)</option>
                            <option value="senior">Senior (7-12 years)</option>
                            <option value="executive">Executive (12+ years)</option>
                        </select>
                    </div>
                `;
                break;
            case 'networking-pitch':
                paramsHTML = `
                    <div class="control-group">
                        <label>Target Person:</label>
                        <input type="text" id="pitch-target" placeholder="e.g., Sarah Johnson, VP Engineering at Meta">
                    </div>
                    <div class="control-group">
                        <label>Platform:</label>
                        <select id="pitch-platform">
                            <option value="linkedin">LinkedIn</option>
                            <option value="email">Email</option>
                            <option value="twitter">Twitter</option>
                            <option value="conference">Conference</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Context:</label>
                        <input type="text" id="pitch-context" placeholder="e.g., Mutual connection, same conference">
                    </div>
                    <div class="control-group">
                        <label>Goal:</label>
                        <textarea id="pitch-goal" placeholder="What do you want to achieve?"></textarea>
                    </div>
                `;
                break;
        }

        paramsContainer.innerHTML = paramsHTML;
    }

    async loadInitialData() {
        // Load LinkedIn status
        this.updateLinkedInStatus();

        // Load recent content
        await this.loadRecentContent();

        // Generate profile chart
        this.generateProfileChart();

        // Initialize default params
        this.updateDynamicParams('blog-post');
    }

    updateLinkedInStatus() {
        const statusDiv = document.getElementById('linkedin-status');
        if (this.linkedinToken) {
            statusDiv.innerHTML = `
                <div class="status-connected">
                    <span style="color: green;">✓ Connected</span>
                    <button onclick="aiDashboard.syncLinkedInData()" style="margin-left: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;">
                        🔄 Sync Data
                    </button>
                </div>
            `;
        } else {
            statusDiv.innerHTML = `
                <div class="status-disconnected">
                    <span style="color: #888;">⚪ Not Connected</span>
                    <p style="font-size: 0.9rem; margin: 0.5rem 0; color: #666;">
                        Connect LinkedIn to enhance AI recommendations
                    </p>
                </div>
            `;
        }
    }

    async generateContent() {
        const contentType = document.getElementById('content-type').value;
        const outputDiv = document.getElementById('content-output');

        // Show loading
        outputDiv.innerHTML = '<div class="loading">Generating AI content</div>';

        try {
            const params = this.collectContentParams(contentType);

            const response = await fetch(`${this.apiBase}/ai-content-generator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: contentType, params })
            });

            const data = await response.json();

            if (response.ok) {
                this.displayGeneratedContent(data.content);
                this.saveToRecentContent(contentType, data.content);
            } else {
                throw new Error(data.error || 'Content generation failed');
            }
        } catch (error) {
            outputDiv.innerHTML = `
                <div style="color: #ff4757; padding: 1rem;">
                    <strong>Error:</strong> ${error.message}
                    <br><br>
                    <em>This is a demo. In production, ensure your OpenAI API key is configured.</em>
                </div>
            `;
        }
    }

    collectContentParams(contentType) {
        const params = {};

        switch (contentType) {
            case 'blog-post':
                params.topic = document.getElementById('blog-topic')?.value || 'AI in Technology';
                params.audience = document.getElementById('blog-audience')?.value || 'technical-leaders';
                params.length = document.getElementById('blog-length')?.value || '1200';
                break;
            case 'case-study':
                params.company = document.getElementById('case-company')?.value || 'cisco';
                params.focus = document.getElementById('case-focus')?.value || 'digital-transformation';
                break;
            case 'personalized-landing':
                params.industry = document.getElementById('visitor-industry')?.value || 'Technology';
                params.role = document.getElementById('visitor-role')?.value || 'CTO';
                params.company_size = document.getElementById('company-size')?.value || 'enterprise';
                const challenges = document.getElementById('visitor-challenges')?.value || '';
                params.challenges = challenges.split('\n').filter(c => c.trim());
                break;
            case 'resume-template':
                params.target_role = document.getElementById('target-role')?.value || 'Senior Engineer';
                params.industry = document.getElementById('target-industry')?.value || 'technology';
                params.experience_level = document.getElementById('experience-level')?.value || 'senior';
                break;
            case 'networking-pitch':
                params.target_person = document.getElementById('pitch-target')?.value || 'Industry Professional';
                params.platform = document.getElementById('pitch-platform')?.value || 'linkedin';
                params.context = document.getElementById('pitch-context')?.value || 'Professional networking';
                params.goal = document.getElementById('pitch-goal')?.value || 'Career discussion';
                break;
        }

        return params;
    }

    displayGeneratedContent(content) {
        const outputDiv = document.getElementById('content-output');

        // Convert markdown-style content to HTML
        const formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        outputDiv.innerHTML = `<p>${formattedContent}</p>`;
    }

    async generateCareerViz() {
        const focus = document.getElementById('career-focus').value;
        const timeline = document.getElementById('career-timeline');

        timeline.innerHTML = '<div class="loading">Generating career visualization</div>';

        // Simulate API call - in production, this would call your AI service
        setTimeout(() => {
            switch (focus) {
                case 'timeline':
                    this.renderCareerTimeline();
                    break;
                case 'skills-evolution':
                    this.renderSkillsEvolution();
                    break;
                case 'impact-metrics':
                    this.renderImpactMetrics();
                    break;
                case 'network-growth':
                    this.renderNetworkGrowth();
                    break;
            }

            this.generateCareerInsights();
        }, 2000);
    }

    renderCareerTimeline() {
        const timeline = document.getElementById('career-timeline');

        const experienceData = [
            { company: 'Equiti Ventures', role: 'Founder & AI Product Leader', period: '2024 - Present', impact: 'Building AI-powered applications' },
            { company: 'Cisco Systems', role: 'Senior Director', period: '2020 - 2024', impact: 'Grew CX Cloud to $500M+ ARR' },
            { company: 'Dropbox', role: 'Global Head of Data & BI', period: '2017 - 2020', impact: 'Led IPO data strategy' },
            { company: 'Chegg', role: 'Director of Data Engineering', period: '2015 - 2017', impact: '40% revenue increase' },
            { company: 'Yahoo', role: 'Senior Manager', period: '2007 - 2015', impact: 'Built platforms for 600M+ users' }
        ];

        timeline.innerHTML = experienceData.map((exp, index) => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <h4>${exp.company}</h4>
                    <h5>${exp.role}</h5>
                    <span class="timeline-period">${exp.period}</span>
                    <p>${exp.impact}</p>
                </div>
            </div>
        `).join('');
    }

    renderSkillsEvolution() {
        const timeline = document.getElementById('career-timeline');

        timeline.innerHTML = `
            <div class="skills-evolution">
                <canvas id="skillsChart" width="800" height="400"></canvas>
            </div>
        `;

        // Render skills evolution chart
        this.drawSkillsChart();
    }

    async startSkillsTest() {
        const category = document.getElementById('skill-category').value;
        const level = document.getElementById('skill-level').value;
        const count = document.getElementById('question-count').value;

        const quizContainer = document.getElementById('skills-quiz');
        quizContainer.classList.remove('hidden');

        // Hide setup
        document.querySelector('.test-setup').style.display = 'none';

        quizContainer.innerHTML = '<div class="loading">Generating personalized assessment</div>';

        try {
            const response = await fetch(`${this.apiBase}/ai-content-generator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'skills-assessment',
                    params: { category, level, question_count: parseInt(count) }
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.renderSkillsQuiz(data.content);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            quizContainer.innerHTML = `
                <div style="color: #ff4757; text-align: center; padding: 2rem;">
                    <strong>Assessment temporarily unavailable</strong><br>
                    <em>Demo mode: AI-generated assessments would appear here</em>
                </div>
            `;
        }
    }

    async generatePredictions() {
        const currentRole = document.getElementById('current-role').value;
        const yearsExp = document.getElementById('years-exp').value;
        const goals = document.getElementById('target-goals').value.split(',').map(g => g.trim());

        // Show loading for all prediction sections
        document.getElementById('trajectory-insights').innerHTML = 'Analyzing career patterns...';
        document.getElementById('skill-gaps').innerHTML = 'Identifying skill requirements...';
        document.getElementById('salary-predictions').innerHTML = 'Calculating market projections...';

        try {
            const response = await fetch(`${this.apiBase}/ai-content-generator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'career-prediction',
                    params: { current_role: currentRole, years_experience: yearsExp, skills: [], goals }
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.displayPredictions(data.content);
                this.updateAnalyticsCharts();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            document.getElementById('trajectory-insights').innerHTML = `
                <div style="color: #ff4757;">
                    <strong>Prediction Error:</strong> ${error.message}<br>
                    <em>Demo: Would show AI-powered career predictions</em>
                </div>
            `;
        }
    }

    async connectLinkedIn() {
        // In production, this would initiate OAuth flow
        const clientId = 'your-linkedin-client-id';
        const redirectUri = encodeURIComponent(window.location.origin + '/linkedin-callback');
        const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social');

        const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

        // For demo purposes, simulate connection
        alert('LinkedIn integration would redirect to OAuth. For demo: simulating connection...');

        // Simulate successful connection
        setTimeout(() => {
            localStorage.setItem('linkedin_token', 'demo_token_' + Date.now());
            this.linkedinToken = localStorage.getItem('linkedin_token');
            this.updateLinkedInStatus();

            // Trigger data sync
            this.syncLinkedInData();
        }, 1000);
    }

    async syncLinkedInData() {
        if (!this.linkedinToken) return;

        const statusDiv = document.getElementById('linkedin-status');
        statusDiv.innerHTML = '<div class="loading">Syncing LinkedIn data</div>';

        try {
            // In production, make actual LinkedIn API calls
            const response = await fetch(`${this.apiBase}/linkedin-integration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get-profile',
                    params: { accessToken: this.linkedinToken }
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update UI with LinkedIn data
                this.updateLinkedInStatus();
                this.integrateLinkedInData(data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            statusDiv.innerHTML = `
                <div style="color: #ff4757;">
                    Sync failed: ${error.message}<br>
                    <em>Demo: Would sync real LinkedIn data in production</em>
                </div>
                <button onclick="aiDashboard.updateLinkedInStatus()" style="margin-top: 1rem;">
                    Reset Status
                </button>
            `;
        }
    }

    // Additional utility methods
    async loadRecentContent() {
        const recentDiv = document.getElementById('recent-content');
        const recent = JSON.parse(localStorage.getItem('recent_ai_content') || '[]');

        if (recent.length === 0) {
            recentDiv.innerHTML = '<p style="color: #888;">No recent content. Generate some AI content to see it here!</p>';
            return;
        }

        recentDiv.innerHTML = recent.slice(0, 3).map(item => `
            <div style="margin-bottom: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                <strong>${item.type}</strong>
                <div style="font-size: 0.9rem; color: #666;">${new Date(item.timestamp).toLocaleDateString()}</div>
                <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                    ${item.preview}...
                </div>
            </div>
        `).join('');
    }

    saveToRecentContent(type, content) {
        const recent = JSON.parse(localStorage.getItem('recent_ai_content') || '[]');
        const preview = content.substring(0, 100).replace(/<[^>]*>/g, '');

        recent.unshift({
            type: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            content,
            preview,
            timestamp: new Date().toISOString()
        });

        // Keep only last 10 items
        recent.splice(10);

        localStorage.setItem('recent_ai_content', JSON.stringify(recent));
        this.loadRecentContent();
    }

    generateProfileChart() {
        const canvas = document.getElementById('profileChart');
        const ctx = canvas.getContext('2d');

        // Simple profile metrics chart
        const data = [
            { label: 'Experience', value: 95 },
            { label: 'Leadership', value: 90 },
            { label: 'AI/ML', value: 85 },
            { label: 'Platform Scale', value: 98 }
        ];

        const barHeight = 20;
        const barSpacing = 10;
        const maxWidth = canvas.width - 100;

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';

        data.forEach((item, index) => {
            const y = index * (barHeight + barSpacing) + 20;
            const barWidth = (item.value / 100) * maxWidth;

            // Draw label
            ctx.fillText(item.label, 5, y + 15);

            // Draw bar background
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(80, y, maxWidth, barHeight);

            // Draw bar
            ctx.fillStyle = '#667eea';
            ctx.fillRect(80, y, barWidth, barHeight);

            // Draw value
            ctx.fillStyle = '#333';
            ctx.fillText(`${item.value}%`, barWidth + 90, y + 15);
        });
    }

    closeDashboard() {
        document.getElementById('aiDashboard').classList.add('hidden');
    }

    openDashboard() {
        document.getElementById('aiDashboard').classList.remove('hidden');
    }

    // Copy, download, share functions
    copyContent() {
        const content = document.getElementById('content-output').textContent;
        navigator.clipboard.writeText(content).then(() => {
            alert('Content copied to clipboard!');
        });
    }

    downloadContent() {
        const content = document.getElementById('content-output').textContent;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-generated-content.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    shareContent() {
        const content = document.getElementById('content-output').textContent;
        if (navigator.share) {
            navigator.share({
                title: 'AI Generated Content',
                text: content
            });
        } else {
            // Fallback to copying URL or content
            this.copyContent();
        }
    }
}

// Initialize when DOM is loaded
let aiDashboard;
document.addEventListener('DOMContentLoaded', () => {
    aiDashboard = new AIDashboard();

    // Add dashboard trigger button to main page
    const dashboardBtn = document.createElement('button');
    dashboardBtn.innerHTML = '🤖 AI Dashboard';
    dashboardBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-size: 1rem;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    `;

    dashboardBtn.addEventListener('click', () => {
        aiDashboard.openDashboard();
    });

    document.body.appendChild(dashboardBtn);
});