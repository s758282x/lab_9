import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;
const prisma = new PrismaClient();
const slackOAuthToken = process.env.SLACK_OAUTH_TOKEN;
const slackChannelId = process.env.SLACK_CHANNEL_ID;

app.use(cors());
app.use(express.json());

prisma.$connect()
    .then(() => {
        console.log('Successfully connected to the database');
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });

const sendSlackMessage = async (message) => {
    try {
        const response = await axios.post('https://slack.com/api/chat.postMessage', {
            channel: slackChannelId,
            text: message
        }, {
            headers: {
                'Authorization': `Bearer ${slackOAuthToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.data.ok) {
            throw new Error(`Slack API error: ${response.data.error}`);
        }

        console.log('Message sent to Slack:', message);
    } catch (err) {
        console.error('Error sending message to Slack:', err);
    }
};

const getPuppyInfo = (data) => {
    return {
        name: data.name || 'N/A',
        breed: data.breed || 'N/A',
        age: data.age_est !== undefined && data.age_est !== null ? data.age_est : 'N/A',
        kennel_number: data.current_kennel_number !== undefined && data.current_kennel_number !== null ? data.current_kennel_number : 'N/A'
    };
};

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
                age_est: req.body.age_est !== undefined && req.body.age_est !== null ? parseInt(req.body.age_est) : null, // Ensure age_est is an integer
                current_kennel_number: req.body.current_kennel_number !== undefined && req.body.current_kennel_number !== null ? parseInt(req.body.current_kennel_number) : null // Ensure current_kennel_number is an integer
            },
        });
        res.json(newPuppy);

        const puppyInfo = getPuppyInfo(newPuppy);

        // await sendSlackMessage(JSON.stringify({ 
        //     message: 'New puppy added', 
        //     details: puppyInfo 
        // }));
        await sendSlackMessage(`New puppy added:\nName: ${puppyInfo.name}\nBreed: ${puppyInfo.breed}\nAge: ${puppyInfo.age}\nKennel Number: ${puppyInfo.kennel_number}`);
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

        const puppyInfo = getPuppyInfo(updatedPuppy);

        // await sendSlackMessage(JSON.stringify({ 
        //     message: 'Puppy information updated', 
        //     details: puppyInfo 
        // }));
        await sendSlackMessage(`Puppy information updated:\nName: ${puppyInfo.name}\nBreed: ${puppyInfo.breed}\nAge: ${puppyInfo.age}\nKennel Number: ${puppyInfo.kennel_number}`);
    } catch (err) {
        console.error('Error updating puppy:', err);
        res.status(500).send(err);
    }
});

// Delete a record by ID
app.delete('/puppies/:id', async (req, res) => {
    try {
        const puppy = await prisma.puppies.findUnique({
            where: { pet_id: parseInt(req.params.id) },
        });

        if (!puppy) {
            return res.status(404).send({ message: 'Puppy not found' });
        }

        await prisma.puppies.delete({
            where: { pet_id: parseInt(req.params.id) },
        });

        const puppyInfo = getPuppyInfo(puppy);

        res.json({ message: 'Record deleted' });
        // await sendSlackMessage(JSON.stringify({ 
        //     message: 'Puppy deleted', 
        //     details: puppyInfo 
        // }));
        await sendSlackMessage(`Puppy deleted:\nName: ${puppyInfo.name}\nBreed: ${puppyInfo.breed}\nAge: ${puppyInfo.age}\nKennel Number: ${puppyInfo.kennel_number}`);
    } catch (err) {
        console.error('Error deleting puppy:', err);
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});