import { apiGet } from "./api";
import { getToken } from "./auth";

export async function getProjects() {
  return apiGet("/projects");
}

export async function getProjectDetails(projectId: number) {
  return apiGet(`/projects/${projectId}`);
}

export async function getProjectMilestones(projectId: number) {
  return apiGet(`/projects/${projectId}/milestones`);
}

export async function getProjectTransparency(projectId: number) {
  return apiGet(`/projects/${projectId}/transparency`);
}
