const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.port;
const uri = process.env.MONGODB_URI;

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const db = client.db('hireloop');
        const jobCollection = db.collection('jobs');
        const companyCollection = db.collection('companies');

        app.post('/api/jobs', async (req, res) => {
            const jobData = req.body;
            const jobResult = await jobCollection.insertOne(jobData);
            res.send(jobResult);
        });

        app.get('/api/jobs', async (req, res) => {
            const query = {};

            if (req.query.companyId) {
                query.companyId = req.query.companyId;
            }

            if (req.query.status) {
                query.status = req.query.status;
            }

            const cursor = jobCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // company related APIs

        app.post('/api/companies', async (req, res) => {
            const company = req.body;
            const result = await companyCollection.insertOne(company);
            res.send(result);
        });

        app.get('/api/my/companies', async (req, res) => {
            const query = {};

            if (req.query.recruiterId) {
                query.recruiterId = req.query.recruiterId;
            }

            const result = await companyCollection.findOne(query);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});