import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable'; // Import formidable
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import { getSession } from 'next-auth/react';
import path from 'path';
import supabase from '../../database/supabaseClient';

export const config = {
    api: {
        bodyParser: false, // Disable Next.js's default body parser
    },
};

// Define the Octokit error type
interface HttpError extends Error {
    status: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const session = await getSession({ req }); // Get the session info
        const form = new IncomingForm(); // Create a new IncomingForm instance
        const allowedUsers = process.env.ALLOWED_GITHUB_USERS?.split(',') || []; // Get allowed users from environment variable

        if (!session || !session.user?.name || !allowedUsers.includes(session.user.name)) {
            return res.status(403).json({
                message: "You are not an authenticated user",
                allowed_users: allowedUsers,
                ssn: session,
                ssn_user: session?.user,
                ssn_user_name: session?.user?.name
            });
        }

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing the files:', err);
                return res.status(500).json({ message: 'Error parsing the files' });
            }

            // Check if files.file is defined and is an array
            if (!files.file || !Array.isArray(files.file)) {
                return res.status(400).json({ message: 'No files uploaded' });
            }

            // Check if fields.folder is defined
            if (!fields.folder) {
                return res.status(400).json({ message: 'No fields detected' });
            }

            const octokit = new Octokit({
                auth: process.env.GITHUB_ACCESS_TOKEN, // Use your personal GitHub access token from .env
            });

            const uploadResults = [];
            const uploadUrls = [];

            // Loop through each file and handle the upload
            for (const file of files.file) {
                const buffer = fs.readFileSync(file.filepath);
                if (!file.originalFilename) return res.status(400).json({ message: 'No filename detected' });

                const filePathBack = path.join(fields.folder[0], fields.folder[1], file.originalFilename);
                const filePath = filePathBack.replace(/\\/g, '/');

                // Check if the file already exists in the repository
                try {
                    await octokit.repos.getContent({
                        owner: 'prince-1908',
                        repo: 'images-test',
                        path: filePath,
                    });

                    // If the response is successful, it means the file already exists
                    uploadResults.push({ filename: file.originalFilename, message: `Image with name ${file.originalFilename} already exists in the repo.` });
                    continue; // Skip to the next file
                } catch (error) {
                    if ((error as HttpError).status === 404) {
                        // The file does not exist, continue to upload
                    } else if (error instanceof Error) {
                        console.error('Error checking file existence:', error.message);
                        return res.status(500).json({ message: 'Error checking file existence' });
                    } else {
                        console.log('Unknown error:', error);
                        return res.status(500).json({ message: 'Unknown error occurred while checking file existence' });
                    }
                }

                // Try to upload the file
                try {
                    await octokit.repos.createOrUpdateFileContents({
                        owner: 'prince-1908',
                        repo: 'images-test',
                        path: filePath,
                        message: 'Upload file',
                        content: buffer.toString('base64'), // Upload the file in base64 format
                    });

                    // Construct Image URL
                    const url = `https://raw.githubusercontent.com/prince-1908/images-test/main/${filePath}`;
                    const imageUrl = url.replaceAll(" ", "%20");

                    // Save image URL to Supabase
                    try {
                        const { error: supabaseError } = await supabase
                            .from('robinos-images')
                            .insert([{ url: imageUrl, filename: file.originalFilename, parent_folder: fields.folder[0], child_folder: fields.folder[1] }]);

                        if (supabaseError) {
                            console.error('Supabase Error:', supabaseError);
                            return res.status(500).json({ message: 'Error saving URL to database', supabaseError });
                        }

                        res.status(200).json({ message: 'File uploaded successfully', imageUrl });
                    } catch (error) {
                        console.error('Error inserting into Supabase:', error);
                        return res.status(500).json({ message: 'Error inserting into Supabase', error });
                    }

                    uploadResults.push({ filename: file.originalFilename, message: 'File uploaded successfully' });
                    uploadUrls.push(imageUrl);
                } catch (error) {
                    if (error instanceof Error) {
                        console.error('Error uploading file:', error);
                        uploadResults.push({ filename: file.originalFilename, message: 'Error uploading file', error: error.message });
                    } else {
                        console.error('Unknown error during upload:', error);
                        uploadResults.push({ filename: file.originalFilename, message: 'Unknown error during upload' });
                    }
                }
            }

            // Send a response with the results of all uploads
            res.status(200).json({ uploads: uploadResults, urls: uploadUrls });
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
