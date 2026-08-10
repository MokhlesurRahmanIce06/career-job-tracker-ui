const GITHUB_API = "https://api.github.com";

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  content?: string;
  encoding?: string;
}

async function githubRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2026-03-10",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `GitHub API ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

export async function getAuthenticatedUser(
  token: string
) {
  return githubRequest<{
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  }>("/user", token);
}

export async function getRepositoryFile(
  owner: string,
  repo: string,
  path: string,
  token: string
) {
  return githubRequest<GitHubFile>(
    `/repos/${owner}/${repo}/contents/${path}`,
    token
  );
}