import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { visionEmbeddingGenerator, cosineSimilarity } from './model.js';
import mockData from './mockData.json' assert { type: 'json' };

const app = express();
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: './',
  filename: (req, file, cb) => {
    cb(null, `tmp_${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

const datasetImages = [
    './dataset/sample_dataset_face.jpg',
    
];  // Replace with your image paths

let datasetEmbeddings = null;
async function preloadEmbeddings() {
  datasetEmbeddings = await Promise.all(
    datasetImages.map(async (imgPath) => ({
      imgPath,
      embedding: await visionEmbeddingGenerator(imgPath)
    }))
  );
}
preloadEmbeddings();

// POST /similarity-image
app.post('/similarity-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  try {
    const queryEmbedding = await visionEmbeddingGenerator(req.file.path);
    
    const results = datasetEmbeddings.map(entry => ({
      image: entry.imgPath,
      score: cosineSimilarity(queryEmbedding, entry.embedding)
    }));

    results.sort((a, b) => b.score - a.score);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({ matches: results.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(3000, () => console.log('Server running on port 3000'));