const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
        const userCollection = db.collection('user');
        const applicationsCollection = db.collection('applications');
        const plansCollection = db.collection('plans');

        // user APIs
        app.get('/api/users', async (req, res) => {
            const cursor = userCollection.find().skip(10);
            const result = await cursor.toArray();
            res.send(result);
        });

        // job related APIs
        app.post('/api/jobs', async (req, res) => {
            const jobData = req.body;

            const newJob = {
                ...jobData,
                createdAt: new Date()
            }

            const jobResult = await jobCollection.insertOne(newJob);
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

        app.get('/api/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await jobCollection.findOne(query);
            res.send(result);
        });

        // company related APIs
        app.get('/api/companies', async (req, res) => {
            const cursor = companyCollection.find().skip(8);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/api/companies', async (req, res) => {
            const company = req.body;

            const newCompany = {
                ...company,
                createdAt: new Date()
            }

            const result = await companyCollection.insertOne(newCompany);
            res.send(result);
        });

        app.get('/api/my/companies', async (req, res) => {
            const query = {};

            if (req.query.recruiterId) {
                query.recruiterId = req.query.recruiterId;
            }

            const result = await companyCollection.findOne(query);
            console.log('my companies', result);

            if (!result) {
                return res.status(404).json({ error: "No company found for this recruiter ID" });
            }

            res.json(result);
        });

        // application related APIs

        app.post('/api/applications', async (req, res) => {
            const application = req.body;
            const newApplication = {
                ...application,
                createdAt: new Date()
            }
            const result = await applicationsCollection.insertOne(newApplication);
            res.send(result);
        });

        app.get('/api/applications', async (req, res) => {
            try {
                const query = {};

                // Check for applicantId (passed by getApplicationByApplicant)
                if (req.query.applicantId) {
                    query.applicantId = req.query.applicantId;
                }

                if (req.query.jobId) {
                    query.jobId = req.query.jobId;
                }

                const cursor = applicationsCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);

            }
             catch (error) {
                res.status(500).send({ message: "Error fetching applications", error });
            }
        });

        // plans related APIs

        app.get('/api/plans', async (req, res) => {
            const query = {};

            if (req.query.plan_id) {
                query.planId = req.query.plan_id;
            }

            try {
                const plan = await plansCollection.findOne(query);
                if (!plan) {
                    return res.status(404).send({ message: "Plan not found" });
                }
                res.send(plan);
            } catch (error) {
                res.status(500).send({ message: "Server error", error });
            }
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