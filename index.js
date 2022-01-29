import express, { json } from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from "mongodb";
import dotenv from 'dotenv';
import joi from 'joi'
import dayjs from 'dayjs'
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

const server = express();
server.use(json());
server.use(cors());

const participantsSchema = joi.object({
  name: joi.string().required()
});


server.get('/participants', async (req, res) => {

    try {

        await mongoClient.connect()
        const dbBatePapo = mongoClient.db("batePapoUol");
        const participantsCollection = dbBatePapo.collection('participants');

        const participantsOn = await participantsCollection.find().toArray()
        
        res.send(participantsOn)
    } catch {
        res.sendStatus(500)
    }
    mongoClient.close()
});

server.post('/participants', async (req, res) => {
    const validation = participantsSchema.validate(req.body)

    if(validation.error){
      const error = validation.error.details.map(detail => detail.message)
      
      res.status(422).send(error)
      return;
    }

    try {
        await mongoClient.connect()
        const dbBatePapo = mongoClient.db("batePapoUol");
        const participantsCollection = dbBatePapo.collection("participants")
        const messagesCollection = dbBatePapo.collection("messages")
    
        const participantsOn = await participantsCollection.find({}).toArray()
        let participantsList = participantsOn.map(e => e.name)
        const newParticipant = req.body

        if(participantsList.includes(newParticipant.name)){
            res.status(409).send('Name unavailable.')
            return;
        }
    
          await participantsCollection.insertOne({newParticipant, lastStatus: Date.now()});
    
          let newStatusMsg = {
            from: newParticipant.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs(Date.now()).format('HH:mm:ss')
          }
          await messagesCollection.insertOne(newStatusMsg)
    
          res.sendStatus(201)
    
      } catch {
        res.sendStatus(500)
      }
    
      mongoClient.close()
    
    });

server.listen(5000, () => {
    console.log('Running app in http://localhost:5000')
});  