
import fs from 'fs'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { askAi } from '../services/openRouter.services.js';


export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Resume Required' });
        }

        
        const filepath = req.file.path;
        //-----------------convert the filepath data to binary format-----------------

        const fileBuffer = await fs.promises.readFile(filepath)
        const uint8Array = await Uint8Array(fileBuffer)

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
            const pageText = content.items.map(item.map(item => item.str).join(' '));
            resumeText += pageText + '\n';
            //-----------------how this above line works -----------------
        }

        resumeText = resumeText.replace(/\s+/g, ' ').trim()


        const messages = [
            {
                role: 'system',
                content: `
                Extract structured data from resume
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