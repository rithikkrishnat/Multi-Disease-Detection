const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Configure file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/api/diagnose', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    const imagePath = req.file.path;

    // Run Python script
    const pythonProcess = spawn('python', ['predict.py', imagePath]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        // Delete image after processing to save space
        fs.unlinkSync(imagePath);

        try {
            const results = JSON.parse(dataString);
            res.json(results);
        } catch (e) {
            console.error("Failed to parse Python response:", dataString);
            res.status(500).json({ error: "Analysis failed", details: dataString });
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});