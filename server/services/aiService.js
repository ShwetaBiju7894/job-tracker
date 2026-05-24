const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const ask = async (prompt) => {
  const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// Cover letter tips
const getCoverLetterTips = async ({ jobDescription, userProfile, company, role }) => {
  const prompt = `
    You are an expert career coach. Based on this job description, give specific cover letter tips.

    Company: ${company}
    Role: ${role}
    Job Description: ${jobDescription}
    User background: ${userProfile}

    Return ONLY a raw JSON object, no markdown, no backticks:
    {"tips":["tip 1","tip 2","tip 3","tip 4","tip 5"],"keywords":["keyword1","keyword2","keyword3"],"opening":"suggested opening sentence"}
  `;

  const text  = await ask(prompt);
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

// Interview prep questions
const getInterviewPrep = async ({ company, role, jobDescription }) => {
  const prompt = `
    You are an expert interview coach. Generate interview prep for this role.

    Company: ${company}
    Role: ${role}
    Job Description: ${jobDescription}

    Return ONLY a raw JSON object, no markdown, no backticks:
    {"technical":["question 1","question 2","question 3"],"behavioral":["question 1","question 2","question 3"],"company":["question 1","question 2"],"tips":"2 sentence advice for this specific role"}
  `;

  const text  = await ask(prompt);
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

module.exports = { getCoverLetterTips, getInterviewPrep };