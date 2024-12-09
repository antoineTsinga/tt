const fs = require('fs');
const path = require('path');
const axios = require('axios');
const archiver = require('archiver');

app.post('/download-files', async (req, res) => {
  const { projectId, branch, items } = req.body;

  if (!ACCESS_TOKENS[projectId]) {
    return res.status(400).json({ error: 'Projet non configuré ou clé d’accès manquante.' });
  }

  const token = ACCESS_TOKENS[projectId];
  const gitlabBaseUrl = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}`;

  try {
    // Configurer la réponse HTTP pour un fichier ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectId}-${branch}-files.zip"`);

    // Créer un archiveur ZIP
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const item of items) {
      const isFolder = item.endsWith('/'); // Exemple : "path/to/folder/"

      if (isFolder) {
        // Récupérer les fichiers dans le dossier
        const folderPath = item.slice(0, -1); // Retirer le dernier "/"
        const folderUrl = `${gitlabBaseUrl}/repository/tree?path=${encodeURIComponent(folderPath)}&ref=${encodeURIComponent(branch)}`;

        const { data: folderContents } = await axios.get(folderUrl, {
          headers: { 'PRIVATE-TOKEN': token },
        });

        for (const file of folderContents) {
          if (file.type === 'blob') {
            // Ajouter chaque fichier du dossier
            const fileUrl = `${gitlabBaseUrl}/repository/files/${encodeURIComponent(file.path)}/raw?ref=${encodeURIComponent(branch)}`;
            const response = await axios.get(fileUrl, {
              responseType: 'stream',
              headers: { 'PRIVATE-TOKEN': token },
            });

            archive.append(response.data, { name: file.path });
          }
        }
      } else {
        // Ajouter un fichier unique
        const fileUrl = `${gitlabBaseUrl}/repository/files/${encodeURIComponent(item)}/raw?ref=${encodeURIComponent(branch)}`;
        const response = await axios.get(fileUrl, {
          responseType: 'stream',
          headers: { 'PRIVATE-TOKEN': token },
        });

        archive.append(response.data, { name: item });
      }
    }

    // Finaliser l'archive ZIP
    archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du téléchargement des fichiers.' });
  }
});
