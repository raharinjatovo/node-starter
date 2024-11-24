const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const userRouter = require('./routers/user/user.routers')

const app = express();
const upload = multer({ dest: 'public/uploads/' });

// Set EJS as the templating engine
// use public folder 
// ok 
// me

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/users', userRouter)
// ok
// Create a route to upload and resize the image
app.post('/upload', upload.single('image'), async (req, res) => {
    const sizes = [320, 640, 800, 1024]; // Define sizes for responsive images
    const imagePromises = sizes.map(size => {
        // Generate JPEG/PNG
        const outputPath = `public/uploads/resized-${size}px-${req.file.originalname}`;
        const webpPath = `public/uploads/resized-${size}px-${path.parse(req.file.originalname).name}.webp`;

        return Promise.all([
            sharp(req.file.path)
                .resize(size)
                .toFile(outputPath),
            sharp(req.file.path)
                .resize(size)
                .toFormat('webp')
                .toFile(webpPath)
        ]);
    });

    try {
        await Promise.all(imagePromises);
        const imageUrls = sizes.map(size => `uploads/resized-${size}px-${req.file.originalname}`);
        const webpUrls = sizes.map(size => `uploads/resized-${size}px-${path.parse(req.file.originalname).name}.webp`);
        
        // Construct the srcset string for both formats
        const srcset = sizes.map((size, index) => {
            return `${webpUrls[index]} ${size}w`;
        }).join(', ');

        res.render('index', { srcset, originalImage: req.file.originalname });
    } catch (error) {
        res.status(500).send('Error processing image');
    }
});

app.get('/get', async (req, res) => {
    const sizes = [320, 640, 800, 1024]; // Define sizes for responsive images
    

    try {
     
        const imageUrls = sizes.map(size => `public/uploads/resized-${size}px-1200-L-les-infos-du-jour-carboni-va-dbarquer-l-om-des-recrues-rennes-et-nantes-l-agent-d-osimhen-s-agace.webp`);
        
        // Construct the srcset string
        const srcset = sizes.map((size, index) => {
            return `${imageUrls[index]} ${size}w`;
        }).join(', ');

        res.render('index', { srcset, originalImage: "1200-L-les-infos-du-jour-carboni-va-dbarquer-l-om-des-recrues-rennes-et-nantes-l-agent-d-osimhen-s-agace.webp"});
    } catch (error) {
        res.status(500).send('Error processing image');
    }
})

// Serve the uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Render the upload form
app.get('/', (req, res) => {
    res.render('form');
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
