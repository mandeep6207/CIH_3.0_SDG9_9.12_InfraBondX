import { getToken } from "./auth";

export async function downloadCertificate(projectId: number) {
  const token = getToken();

  const res = await fetch(
    `http://localhost:5000/api/investor/certificate/${projectId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `InfraBondX_Certificate_${projectId}.pdf`;
  a.click();

  window.URL.revokeObjectURL(url);
}
