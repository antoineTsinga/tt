# tt

´´´ js

const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    const response = await fetch(projectUrl, {
      headers: { 'PRIVATE-TOKEN': token },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erreur lors du téléchargement du projet.' });
    }

    const filePath = path.join(DOWNLOAD_DIR, `${projectId}.zip`);
    const fileStream = fs.createWriteStream(filePath);

    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });

    res.json({ message: 'Projet téléchargé avec succès.', filePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne lors du téléchargement du projet.' });
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
      const response = await fetch(fileUrl, {
        headers: { 'PRIVATE-TOKEN': token },
      });

      if (!response.ok) {
        console.warn(`Erreur lors du téléchargement du fichier : ${filePath}`);
        continue;
      }

      const fileContent = await response.text();
      const localFilePath = path.join(filesDir, path.basename(filePath));
      fs.writeFileSync(localFilePath, fileContent, 'utf8');
      downloadedFiles.push(localFilePath);
    }

    res.json({ message: 'Fichiers téléchargés avec succès.', files: downloadedFiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne lors du téléchargement des fichiers.' });
  }
});

// Lancement du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
´´´
