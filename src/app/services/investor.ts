import { apiGet, apiPost } from "./api";
import { getToken } from "./auth";

export async function investInProject(project_id: number, amount: number) {
  const token = getToken();
  return apiPost("/investor/invest", { project_id, amount }, token);
}

export async function getPortfolio() {
  const token = getToken();
  return apiGet("/investor/portfolio", token);
}

export async function getInvestorTransactions() {
  const token = getToken();
  return apiGet("/investor/transactions", token);
}

export function getCertificateDownloadUrl(projectId: number) {
  const token = getToken();
  // Download using browser window.open
  return `http://localhost:5000/api/investor/certificate/${projectId}`;
}
