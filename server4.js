const axios = require('axios');

app.post('/stream-project', async (req, res) => {
  const { projectId, branch } = req.body;

  if (!ACCESS_TOKENS[projectId]) {
    return res.status(400).json({ error: 'Projet non configuré ou clé d’accès manquante.' });
  }

  const token = ACCESS_TOKENS[projectId];
  const gitlabBaseUrl = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}`;

  // Fonction pour récupérer la liste des fichiers et dossiers dans un chemin
  const fetchTree = async (folderPath = '') => {
    const treeUrl = `${gitlabBaseUrl}/repository/tree?path=${encodeURIComponent(folderPath)}&ref=${encodeURIComponent(branch)}`;
    const { data } = await axios.get(treeUrl, {
      headers: { 'PRIVATE-TOKEN': token },
    });
    return data;
  };

  // Fonction pour récupérer le contenu brut d'un fichier
  const fetchFile = async (filePath) => {
    const fileUrl = `${gitlabBaseUrl}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${encodeURIComponent(branch)}`;
    const { data } = await axios.get(fileUrl, {
      headers: { 'PRIVATE-TOKEN': token },
      responseType: 'stream', // Permet de streamer directement le contenu
    });
    return data;
  };

  // Fonction récursive pour parcourir les fichiers et dossiers
  const streamProject = async (folderPath = '') => {
    const tree = await fetchTree(folderPath);

    for (const item of tree) {
      if (item.type === 'tree') {
        // Dossier : envoyer une indication de dossier
        res.write(JSON.stringify({ type: 'folder', path: item.path }) + '\n');
        await streamProject(item.path); // Appel récursif pour parcourir les sous-dossiers
      } else if (item.type === 'blob') {
        // Fichier : récupérer le contenu et streamer
        res.write(JSON.stringify({ type: 'file', path: item.path }) + '\n');

        const fileStream = await fetchFile(item.path);
        fileStream.on('data', (chunk) => {
          res.write(chunk);
        });

        await new Promise((resolve) => fileStream.on('end', resolve));
      }
    }
  };

  try {
    res.setHeader('Content-Type', 'application/json');
    res.write('['); // Commencer le flux JSON
    await streamProject(); // Parcourir et streamer le projet
    res.write(']'); // Terminer le flux JSON
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du streaming du projet.' });
  }
});
