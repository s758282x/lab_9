import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';


const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

prisma.$connect()
    .then(() => {
        console.log('Successfully connected to the database');
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });

// Get all records
app.get('/puppies', async (req, res) => {
    try {
        const puppies = await prisma.puppies.findMany();
        res.json(puppies);
    } catch (err) {
        console.error('Error fetching puppies:', err);
        res.status(500).send(err);
    }
});

// Get a record by ID
app.get('/puppies/:id', async (req, res) => {
    try {
        const puppy = await prisma.puppies.findUnique({
            where: { pet_id: parseInt(req.params.id) },
        });
        if (puppy) {
            res.json(puppy);
        } else {
            res.status(404).send({ message: 'Puppy not found' });
        }
    } catch (err) {
        console.error('Error fetching puppy:', err);
        res.status(500).send(err);
    }
});

// Create a new record
app.post('/puppies', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log the request body for debugging
        const newPuppy = await prisma.puppies.create({
            data: {
                name: req.body.name,
                breed: req.body.breed,
                age_est: parseInt(req.body.age_est), // Ensure age_est is an integer
                current_kennel_number: parseInt(req.body.current_kennel_number) // Ensure current_kennel_number is an integer
            },
        });
        res.json(newPuppy);
    } catch (err) {
        console.error('Error creating puppy:', err);
        res.status(500).send(err);
    }
});

// Update a record by ID
app.put('/puppies/:id', async (req, res) => {
    try {
        const updatedPuppy = await prisma.puppies.update({
            where: { pet_id: parseInt(req.params.id) },
            data: req.body,
        });
        res.json(updatedPuppy);
    } catch (err) {
        console.error('Error updating puppy:', err);
        res.status(500).send(err);
    }
});

// Delete a record by ID
app.delete('/puppies/:id', async (req, res) => {
    try {
        await prisma.puppies.delete({
            where: { pet_id: parseInt(req.params.id) },
        });
        res.json({ message: 'Record deleted' });
    } catch (err) {
        console.error('Error deleting puppy:', err);
        res.status(500).send(err);
    }
});

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});