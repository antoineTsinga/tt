app.get('/stream-project', async (req, res) => {
  const projectId = req.query?.projectId;

  res.setHeader('Content-Type', 'octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="instanciation.zip"`)

  const archive = archiver('zip', {zlib: {level:9}});
  archive.pipe(res);

  const  branch = 'digital-core-01';
  if (!ACCESS_TOKENS[projectId]) {
    return res.status(400).json({ error: 'Projet non configuré ou clé d’accès manquante.' });
  }

  const token = ACCESS_TOKENS[projectId];
  const gitlabBaseUrl = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}`;

  // Fonction pour récupérer la liste des fichiers et dossiers dans un chemin
  const fetchTree = async (folderPath = '') => {
    const treeUrl = `${gitlabBaseUrl}/repository/tree?path=${encodeURIComponent(folderPath)}&ref=${encodeURIComponent(branch)}`;
    const response = await axios.get(treeUrl, {
      headers: { 'PRIVATE-TOKEN': token },
      httpsAgent
    });
    writeFile('jsonf.json', response)
    return response.data;
  };

  // Fonction pour récupérer le contenu brut d'un fichier
  const fetchFile = async (filePath) => {
    const fileUrl = `${gitlabBaseUrl}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${encodeURIComponent(branch)}`;
    const {data} = await axios.get(fileUrl, {
      headers: { 'PRIVATE-TOKEN': token },
      responseType: 'stream',
      httpsAgent
    });
    
    return data;
  };

  // Fonction récursive pour parcourir les fichiers et dossiers
  const streamProject = async (folderPath = '020-specification/') => {
    const tree = await fetchTree(folderPath);
    for (const item of tree) {
      if(item.type === "blob"){
        const data = await fetchFile(item.path)
        console.log(item.path)
        archive.append(data, {name:item.name,path:item.path})
      }else if(item.type === "tree"){
        await streamProject(item.path);
      }
    }

    archive.finalize();

  };

  try {

    await streamProject(); // Parcourir et streamer le projet

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du streaming du projet.' });
  }
});



/*
ArchiverError: queue closed
    at Archiver.append (C:\Users\FT999711\Documents\COFFY\Projets\coffy-back\node_modules\archiver\lib\core.js:560:24)
    at streamProject (C:\Users\FT999711\Documents\COFFY\Projets\coffy-back\server.js:249:17)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async streamProject (C:\Users\FT999711\Documents\COFFY\Projets\coffy-back\server.js:251:9)
    at async C:\Users\FT999711\Documents\COFFY\Projets\coffy-back\server.js:261:5 {
  code: 'QUEUECLOSED',
  data: undefined
}
C:\Users\FT999711\Documents\COFFY\Projets\coffy-back\node_modules\content-type\index.js:126
    throw new TypeError('invalid media type')
          ^

TypeError: invalid media type
    at Object.parse (C:\Users\FT999711\Documents\COFFY\Projets\coffy-back\node_modules\content-type\index.js:126:11)
    at setCharset (C:\Users\FT999711\Documents\COFFY\Projets\coffy-back\node_modules\express\lib\utils.js:252:28)
    at ServerResponse.send (C:\Users\FT999711\Documents\COFFY\Projets\coffy-back\node_modules\express\lib\response.js:174:32)
    at ServerResponse.json (C:\Users\FT999711\Documents\COFFY\Projets\coffy-back\node_modules\express\lib\response.js:278:15)
    at C:\Users\FT999711\Documents\COFFY\Projets\coffy-back\server.js:265:21
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)

Node.js v20.15.1
*/ 
