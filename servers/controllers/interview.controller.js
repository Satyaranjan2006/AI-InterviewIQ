
import fs from 'fs'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { askAi } from '../services/openRouter.services.js';
import User from '../models/user.model.js';
import Interview from '../models/interview.model.js';
//import { json } from 'stream/consumers';


export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Resume Required' });
        }


        const filepath = req.file.path;
        //-----------------convert the filepath data to binary format-----------------

        const fileBuffer = await fs.promises.readFile(filepath)
        const uint8Array = await new Uint8Array(fileBuffer)

        //-----------------getting the pdf -----------------
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = '';
        //-----------------Extract text from all pages -----------------
        //-----------------from where numPages comes-----------------

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            //-----------------Extract text from each pages -----------------
            const content = await page.getTextContent();

            //-----------------from where items come-----------------
            /* 
            IF ANY ERROR WILL OCCUR THEN IT WILL BE PASTE INPLACE OF FOLLOWING LINE
            const pageText = content.items
             .map(item => item.str)
              .join(' ');
            */
            const pageText = content.items
                .map(item => item.str)
                .join(' ');
            // const pageText = content.items.map(item.map(item => item.str).join(' '));
            resumeText += pageText + '\n';
            //-----------------how this above line works -----------------
        }

        resumeText = resumeText.replace(/\s+/g, ' ').trim()


        const messages = [
            {
                role: 'system',
                content: `
                Extract structured data from resume
                Do not use markdown
                Do not use  code fences.
                Do not add explation beforeor after the JSON
                Return strictly JSON:
                {
                "role":"string",
                "experience":"string",
                "projects":["project1","project2"],
                "skills":["skill1","skill2"]
                }
                `

            }, {
                role: "user",
                content: resumeText
            }
        ];

        const aiResponse = await askAi(messages)

        // if the mark down json comes then it will remove markdown.
        const cleanResponse = aiResponse
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        //----------------- convert it to JSON-----------------
        const parsed = JSON.parse(aiResponse);
        //----------------- what is the function of unlinkSync() here-----------------
        fs.unlinkSync(filepath)
        //----------------- finally who will provide this data -----------------
        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        })

    } catch (error) {
        console.log(error);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
            message: error.message
        })

    }
}

export const generateQuestion = async (req, res) => {
    try {

        //the rest data expects role experience comes from ?
        const { role, experience, mode, resumeText, projects, skills } = req.body

        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if (!role || !experience || !mode) {
            return res.status(400).json(
                {
                    message: 'Role,Experience,Mode are required .'
                }
            )
        }
        //  the reason of user need here ?
        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        if (user.credits < 50) {
            return res.status(400).json({
                message: 'Not enough credits.Minimum  50 required .'
            })
        }

        const projectText = Array.isArray(projects) && projects.length ? projects.join(',') : 'None'

        const skillsText = Array.isArray(skills) && skills.length ? skills.join(',') : 'None';

        const safeResume = resumeText?.trim() || 'None'


        //generating prompt

        const userPrompt = `
    Role:${role},
    Experience:${experience},
    InterviewMode:${mode},
    Projects:${projectText},
    Skills:${skillsText},
    Resume:${safeResume}
    `;

        if (!userPrompt.trim()) {
            return res.status(400).json({
                message: 'Prompt content is empty'
            })
        }

        //QUESTION PROMPT 



        const messages = [

            {
                role: "system",
                content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate's role, experience,interviewMode, projects, skills, and resume details.
`
            }
            ,
            {
                role: "user",
                content: userPrompt
            }
        ];

        const aiResponse = await askAi(messages)


        //if the response is empty
        if (!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({
                message: 'AI returned empty  Message'
            })
        }

        const questionsArray = aiResponse
            .split('\n')
            .map(q => q.trim())
            .filter(q => q.length > 0)
            .slice(0, 5);


        if (questionsArray.length == 0) {
            return res.status(500).json({
                message: 'AI failed to generate questions.'
            })
        }

        //after getting the questionArray we will decrease the user credits

        user.credits -= 50;
        await user.save()


        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionsArray.map((q, index) => ({
                question: q,
                difficulty: ['easy', 'easy', 'medium', 'medium', 'hard'][index],
                timeLimit: [60, 50, 90, 90, 120][index]
            }))
        })

        res.json({
            interviewId: interview._id,
            creditsLeft: user.credits,
            userName: user.name,
            questions: interview.questions
        })



    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }


}


export const submitAnswer = async (req, res) => {
    try {

    } catch (error) {

    }
}