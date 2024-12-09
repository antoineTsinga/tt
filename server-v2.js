const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const GITLAB_API_URL = 'https://gitlab.com/api/v4';
const ACCESS_TOKENS = {
  'project1': 'YOUR_PROJECT1_ACCESS_TOKEN',
  'project2': 'YOUR_PROJECT2_ACCESS_TOKEN',
  // Ajoutez d'autres projets ici
};
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

// Vérifie si le dossier des téléchargements existe
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR);
}

// Endpoint pour télécharger un projet entier
app.post('/download-project', async (req, res) => {
  const { projectId } = req.body;

  if (!ACCESS_TOKENS[projectId]) {
    return res.status(400).json({ error: 'Projet non configuré ou clé d’accès manquante.' });
  }

  const token = ACCESS_TOKENS[projectId];
  const projectUrl = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/repository/archive.zip`;

  try {
    const response = await axios({
      url: projectUrl,
      method: 'GET',
      responseType: 'stream',
      headers: { 'PRIVATE-TOKEN': token },
    });

    const filePath = path.join(DOWNLOAD_DIR, `${projectId}.zip`);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on('finish', () => res.json({ message: 'Projet téléchargé avec succès.', filePath }));
    writer.on('error', (err) => {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de l’écriture du fichier.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du téléchargement du projet.' });
  }
});

// Endpoint pour récupérer des fichiers spécifiques d’un projet
app.post('/download-files', async (req, res) => {
  const { projectId, filePaths } = req.body;

  if (!ACCESS_TOKENS[projectId]) {
    return res.status(400).json({ error: 'Projet non configuré ou clé d’accès manquante.' });
  }

  const token = ACCESS_TOKENS[projectId];
  const filesDir = path.join(DOWNLOAD_DIR, projectId);

  // Assure que le dossier du projet existe localement
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }

  try {
    const downloadedFiles = [];

    for (const filePath of filePaths) {
      const fileUrl = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(filePath)}/raw?ref=main`;

      const response = await axios({
        url: fileUrl,
        method: 'GET',
        headers: { 'PRIVATE-TOKEN': token },
      });

      const localFilePath = path.join(filesDir, path.basename(filePath));
      fs.writeFileSync(localFilePath, response.data, 'utf8');
      downloadedFiles.push(localFilePath);
    }

    res.json({ message: 'Fichiers téléchargés avec succès.', files: downloadedFiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du téléchargement des fichiers.' });
  }
});

// Lancement du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
