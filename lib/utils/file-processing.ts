import mammoth from 'mammoth'
import pdf from 'pdf-parse'

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const fileType = file.type.toLowerCase()

  try {
    if (fileType.includes('pdf')) {
      return await extractTextFromPDF(buffer)
    } else if (fileType.includes('wordprocessingml') || fileType.includes('msword')) {
      return await extractTextFromWord(buffer)
    } else if (fileType.includes('text/plain')) {
      return await extractTextFromTxt(buffer)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }
  } catch (error) {
    console.error('Error extracting text from file:', error)
    throw new Error(`Failed to extract text from ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    // For server-side PDF parsing, we'll use a lightweight approach
    // In a full implementation, you'd use pdf-parse or similar
    const uint8Array = new Uint8Array(buffer)

    // Simple PDF text extraction (basic implementation)
    // In production, use a proper PDF parsing library
    const decoder = new TextDecoder()
    const text = decoder.decode(uint8Array)

    // Extract text between stream objects (very basic)
    const textMatches = text.match(/BT[\s\S]*?ET/g) || []
    const extractedText = textMatches
      .map(match => {
        // Extract text within parentheses or brackets
        const textParts = match.match(/\(([^)]*)\)/g) || []
        return textParts.map(part => part.replace(/[()]/g, '')).join(' ')
      })
      .join('\n')
      .replace(/\s+/g, ' ')
      .trim()

    if (extractedText.length < 50) {
      // Fallback: try to extract any readable text
      const fallbackText = text
        .replace(/[^\x20-\x7E\n]/g, ' ') // Keep only printable ASCII
        .replace(/\s+/g, ' ')
        .split(' ')
        .filter(word => word.length > 1 && /^[a-zA-Z]/.test(word))
        .join(' ')
        .substring(0, 2000)

      return fallbackText.length > extractedText.length ? fallbackText : extractedText
    }

    return extractedText
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF file')
  }
}

async function extractTextFromWord(buffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })

    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in Word document')
    }

    // Clean up the extracted text
    const cleanText = result.value
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim()

    return cleanText
  } catch (error) {
    console.error('Word extraction error:', error)
    throw new Error('Failed to extract text from Word document')
  }
}

async function extractTextFromTxt(buffer: ArrayBuffer): Promise<string> {
  try {
    const decoder = new TextDecoder('utf-8')
    const text = decoder.decode(buffer)

    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in file')
    }

    // Clean up the text
    const cleanText = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return cleanText
  } catch (error) {
    console.error('Text extraction error:', error)
    throw new Error('Failed to extract text from text file')
  }
}

export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]

  return allowedTypes.includes(file.type.toLowerCase())
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

export async function processResumeFile(file: File): Promise<{
  text: string
  metadata: {
    name: string
    size: number
    type: string
    lastModified: Date
  }
}> {
  // Validate file
  if (!validateFileType(file)) {
    throw new Error(`Unsupported file type: ${file.type}. Supported types: PDF, DOC, DOCX, TXT`)
  }

  if (!validateFileSize(file)) {
    throw new Error(`File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
  }

  // Extract text
  const text = await extractTextFromFile(file)

  if (text.length < 100) {
    throw new Error('Extracted text is too short. Please ensure the file contains readable content.')
  }

  return {
    text,
    metadata: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    }
  }
}

// Resume content analysis utilities
export function extractContactInfo(text: string) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const phoneRegex = /(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/g

  return {
    emails: text.match(emailRegex) || [],
    phones: text.match(phoneRegex) || [],
    linkedin: text.match(linkedinRegex) || []
  }
}

export function extractSkills(text: string): string[] {
  // Common technical and professional skills
  const skillKeywords = [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin',
    'php', 'ruby', 'scala', 'r', 'matlab', 'sql', 'html', 'css',

    // Frameworks & Libraries
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'hibernate',
    'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',

    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra', 'elasticsearch', 'oracle',

    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'terraform', 'ansible',

    // Leadership & Business
    'leadership', 'management', 'strategy', 'analytics', 'communication', 'teamwork',
    'project management', 'agile', 'scrum', 'product management', 'business development',

    // Data & AI
    'machine learning', 'artificial intelligence', 'data science', 'big data', 'analytics',
    'deep learning', 'nlp', 'computer vision', 'data visualization', 'statistics'
  ]

  const textLower = text.toLowerCase()
  const foundSkills = skillKeywords.filter(skill =>
    textLower.includes(skill.toLowerCase())
  )

  // Remove duplicates and sort
  return [...new Set(foundSkills)].sort()
}

export function extractExperience(text: string) {
  // Extract years of experience patterns
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
    /(\d+)\+?\s*years?\s*in/gi,
    /over\s*(\d+)\s*years?/gi,
    /more than\s*(\d+)\s*years?/gi
  ]

  const matches = []
  for (const pattern of experiencePatterns) {
    const found = [...text.matchAll(pattern)]
    matches.push(...found)
  }

  if (matches.length > 0) {
    const years = matches.map(match => parseInt(match[1])).filter(year => !isNaN(year))
    return Math.max(...years)
  }

  return null
}

export function summarizeResumeContent(text: string) {
  const words = text.split(/\s+/).length
  const contactInfo = extractContactInfo(text)
  const skills = extractSkills(text)
  const experience = extractExperience(text)

  return {
    wordCount: words,
    hasContactInfo: {
      email: contactInfo.emails.length > 0,
      phone: contactInfo.phones.length > 0,
      linkedin: contactInfo.linkedin.length > 0
    },
    skillsFound: skills.length,
    topSkills: skills.slice(0, 10),
    estimatedExperience: experience,
    textPreview: text.substring(0, 200) + (text.length > 200 ? '...' : '')
  }
}