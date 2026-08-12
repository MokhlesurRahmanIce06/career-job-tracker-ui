import {
    getAccessToken
} from "../auth/githubAuth";
import type {
    JobApplication
} from "../types/job";

const OWNER = "MokhlesurRahmanIce06";
const REPOSITORY = "career-job-tracker-data";
const BRANCH = "main";

const API_BASE = "https://api.github.com";

function getHeaders(): HeadersInit {
    const token = getAccessToken();

    if (!token) {
        throw new Error("GitHub authentication token is missing.");
    }

    return {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
    };
}

export interface GitHubUser {
    login: string;
    id: number;
    name: string | null;
    avatar_url: string;
}

export async function testGitHubConnection(): Promise<GitHubUser> {
    const response = await fetch(`${API_BASE}/user`, {
        method: "GET",
        headers: getHeaders(),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`GitHub authentication failed: ${response.status} ${text}`);
    }

    return response.json();
}

/* =========================
   GitHub Repository Files
   ========================= */

export interface GitHubFile {
    name: string;
    path: string;
    sha: string;
    type: "file" | "dir";
    download_url?: string | null;
    content?: string;
    encoding?: string;
}

/* =========================
   Get Single File
   ========================= */

export async function getRepositoryFile(path: string): Promise<GitHubFile | null> {
    const response = await fetch(
        `${API_BASE}/repos/${OWNER}/${REPOSITORY}/contents/${path}?ref=${BRANCH}`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`GitHub file read failed: ${response.status} ${text}`);
    }

    return response.json();
}

/* =========================
   List Repository Folder
   ========================= */

export async function listRepositoryFolder(path: string): Promise<GitHubFile[]> {
    const response = await fetch(
        `${API_BASE}/repos/${OWNER}/${REPOSITORY}/contents/${path}?ref=${BRANCH}`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`GitHub folder read failed: ${response.status} ${text}`);
    }

    const result = await response.json();

    if (!Array.isArray(result)) {
        throw new Error(`GitHub path is not a directory: ${path}`);
    }

    return result;
}

/* =========================
   Job Files
   ========================= */

export async function listJobFiles(): Promise<GitHubFile[]> {
    const files = await listRepositoryFolder("jobs");
    return files.filter((file) => file.type === "file" && file.name.toLowerCase().endsWith(".json"));
}

/* =========================
   Read JSON
   ========================= */

export async function readJsonFile<T>(path: string): Promise<{
    data: T;
    sha: string;
}> {
    const file = await getRepositoryFile(path);

    if (!file) {
        throw new Error(`File not found: ${path}`);
    }

    if (!file.content) {
        throw new Error(`File content is empty: ${path}`);
    }

    const decoded = decodeBase64(file.content);

    return {
        data: JSON.parse(decoded) as T,
        sha: file.sha,
    };
}

/* =========================
   Read All Jobs
   ========================= */

export async function readAllJobs<T>(): Promise<T[]> {
    const files = await listJobFiles();
    const jobs: T[] = [];

    for (const file of files) {
        try {
            const result = await readJsonFile<T>(file.path);
            jobs.push(result.data);
        } catch (error) {
            console.error(`Failed to read ${file.path}`, error);
        }
    }

    return jobs;
}

/* =========================
   🆕 GET NEXT JOB ID (Auto Increment)
   🔥 এই ফাংশনটি নতুন যোগ করা হলো
   ========================= */

export async function getNextJobId(): Promise<string> {
    try {
        const jobs = await readAllJobs<JobApplication>();

        if (!jobs || jobs.length === 0) {
            return "JOB-00001";
        }

        const numbers = jobs
            .map((job) => {
                const match = job.id?.match(/(\d+)$/);
                return match ? Number(match[1]) : 0;
            })
            .filter((num) => num > 0);

        const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
        return `JOB-${String(maxNumber + 1).padStart(5, "0")}`;
    } catch (error) {
        console.error("Failed to get next job ID, using fallback:", error);
        // Fallback: try to generate from timestamp
        const timestamp = Date.now().toString().slice(-5);
        return `JOB-${timestamp.padStart(5, "0")}`;
    }
}

/* =========================
   Base64 Encode
   ========================= */

function encodeBase64(value: string): string {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}

/* =========================
   Create / Update File
   ========================= */

export async function createRepositoryFile<T>(
    path: string,
    data: T,
    commitMessage: string
): Promise<void> {
    const existingFile = await getRepositoryFile(path);

    if (existingFile) {
        throw new Error(`File already exists: ${path}`);
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const encodedContent = encodeBase64(jsonContent);

    const response = await fetch(
        `${API_BASE}/repos/${OWNER}/${REPOSITORY}/contents/${path}`,
        {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
                message: commitMessage,
                content: encodedContent,
                branch: BRANCH,
            }),
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`GitHub file creation failed: ${response.status} ${text}`);
    }
}

/* =========================
   Base64 Decode
   ========================= */

function decodeBase64(value: string): string {
    const binary = atob(value.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

/* =========================
   Update Job
   ========================= */

export async function updateJob(job: JobApplication): Promise<void> {
    const token = getAccessToken();

    if (!token) {
        throw new Error("GitHub access token not found. Please login again.");
    }

    const owner = "MokhlesurRahmanIce06";
    const repo = "career-job-tracker-data";
    const path = `jobs/${job.id}.json`;

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    /*
     * First get the existing file.
     * GitHub requires the current SHA when updating a file.
     */
    const existingResponse = await fetch(apiUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    if (!existingResponse.ok) {
        const errorText = await existingResponse.text();
        throw new Error(`Failed to read existing GitHub file: ${existingResponse.status} ${errorText}`);
    }

    const existingFile = await existingResponse.json();

    /*
     * Convert JSON object to UTF-8 Base64.
     */
    const jsonContent = JSON.stringify(job, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(jsonContent)));

    /*
     * Update the existing GitHub file.
     */
    const updateResponse = await fetch(apiUrl, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
            message: `Update job ${job.id}`,
            content: base64Content,
            sha: existingFile.sha,
        }),
    });

    if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update GitHub job: ${updateResponse.status} ${errorText}`);
    }
}