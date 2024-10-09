import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable'; // Import formidable
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import { getSession } from 'next-auth/react';
import path from 'path';

export const config = {
    api: {
        bodyParser: false, // Disable Next.js's default body parser
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const session = await getSession({ req }); // Get the session info
        const form = new IncomingForm(); // Create a new IncomingForm instance
        const allowedUsers = process.env.ALLOWED_GITHUB_USERS?.split(',') || []; // Get allowed users from environment variable

        if (!session || !session.user?.name || !allowedUsers.includes(session.user.name)) {
            alert("You are not an authenticated user.");
            const error = new Error("You are not an authenticated user");
            return res.status(403).json({message: error});
        }

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing the files:', err);
                return res.status(500).json({ message: 'Error parsing the files' });
            }

            // Check if files.file is defined
            if (!files.file || !Array.isArray(files.file)) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Check if fields.folder is defined
            if (!fields.folder) {
                return res.status(400).json({ message: 'No fields detected' });
            }

            const file = files.file[0];
            const buffer = fs.readFileSync(file.filepath);
            
            // const filePath = `uploads/${file.originalFilename}`
            if(!file.originalFilename) return res.status(400).json({ message: 'No filename detected' })

            const filePathBack = path.join(fields.folder[0], fields.folder[1], file.originalFilename);
            const filePath = filePathBack.replace(/\\/g, '/');

            const octokit = new Octokit({
                auth: process.env.GITHUB_ACCESS_TOKEN, // Use your personal GitHub access token from .env
            });

            // Check if the file already exists in the repository
            try {
                const response = await octokit.repos.getContent({
                    owner: 'prince-1908',
                    repo: 'images-test',
                    path: filePath,
                });

                console.log(response);
                if (response.status === 200) {
                    // If the response is successful, it means the file already exists
                    return res.status(409).json({ message: `Image with name ${file.originalFilename} already exists in the repo.` });
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.log('Error checking file existence:', error.message);
                } else {
                    console.log('Unknown error:', error);
                }
            }

            try {
                const response = await octokit.repos.createOrUpdateFileContents({
                    owner: 'prince-1908',
                    repo: 'images-test',
                    path: filePath,
                    message: 'Upload file',
                    content: buffer.toString('base64'), // Upload the file in base64 format
                });

                res.status(200).json(response.data);
            } catch (error) {
                console.error('Error uploading file:', error);
                res.status(500).json({ message: 'Error uploading file', error: error });
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
