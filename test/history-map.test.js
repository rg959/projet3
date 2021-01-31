require('dotenv').config()
const route = require('../src/routes/index');
const request = require("supertest");
const express = require("express");
const { v4: uuidv4 } = require('uuid');
const authRouter = require("./auth-router-test");

require('../src/db/db');

const app = express();

app.use(express.json());
app.use((error, request, response, next) => {
    if (error !== null) {
        return response.json({ successs: false, message: 'Invalid json' });
    }
    return next();
});

app.use(route)
app.use(authRouter)


/** Test unitaire pour HISTORY*/

const uuidUser1 = uuidv4();

const user1 = {
    name: 'Name_' + uuidUser1,
    email: uuidUser1 + "@gmail.com",
    password: "1234567",
    newPassword:"12345678",
    phone:"0123456789"
}

let history1 = {
    departure_location : 'Paris',
    arrival_location : 'Boulogne',
    duration: '23h 30min',
    mode: 'driving'
}

const map = {
    origin: 'Paris', 
    destination: 'Marseille',
     waypoints: ['Lille', 'Turin', 'Genève', 'Zurich'], 
     mode: 'driving'
}

const user1Credentials = {
    email: user1.email,
    password: user1.password,
}

let user1Info = {};

describe('OK - Routes History', () => {
    
    test("OK - Register Account and verify email", async done => {

        /** Register */

        const res = await request(app)
        .post("/api/UBER-EEDSI/account/register")
        .send(user1)
        .set('Accept', 'application/json')
        .expect("Content-Type", /json/)
        .expect(201);
        expect(res.body.success).toBe(true);
        expect(res.body.id).not.toBe(undefined);
        expect(res.body.name).toBe(user1.name);
        expect(res.body.email).not.toBe(undefined);

        /** Verify Email */

        const res1 = await request(app) /** Lance l'email avec le code */
            .post("/api/UBER-EEDSI/account/request-verify-email")
            .send({ email: user1.email })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res1.body.success).toBe(true);

        const res2 = await request(app) /** Récupère le code dans la base de donnée */
            .get("/getVerifiedCode")
            .send({ email: user1.email })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res2.body.success).toBe(true);
        expect(res2.body.code).not.toBe(undefined);
        const code = res2.body.code;

        const res3 = await request(app) /** Vérification de l'email avec le code */
            .post("/api/UBER-EEDSI/account/verify-email")
            .send({ email: user1.email, code: code })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res3.body.success).toBe(true);

        /** Login */

        const res4 = await request(app)
            .post("/api/UBER-EEDSI/account/login")
            .send(user1Credentials)
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res4.body.success).toBe(true);
        expect(res4.body.id).not.toBe(undefined);
        expect(res4.body.name).not.toBe(undefined);
        expect(res4.body.email).not.toBe(undefined);
        expect(res4.body.connexionDate).not.toBe(undefined);
        expect(res4.body.createdAt).not.toBe(undefined);
        expect(res4.body.token).not.toBe(undefined);
        expect(res4.body.refresh_token).not.toBe(undefined);

        user1Info = res4.body;

        done();
    });

    test("OK - Create History", async done => {
        // CREATE //
        const res = await request(app)
            .post("/api/UBER-EEDSI/history/")
            .send({
                departure_location : history1.departure_location,
                arrival_location: history1.arrival_location, 
                duration: history1.duration,
                mode: history1.mode
            })
            .set('Accept', 'application/json')
            .set({ 'Authorization': user1Info.token })
            .expect("Content-Type", /json/)
            .expect(201);
        expect(res.body.success).toBe(true);
        expect(res.body.history).not.toBe(undefined);

        history1 = res.body.history;
        done();
    });
    
    test("OK - Get History", async done => {
        // GET //
        const res2 = await request(app)
            .get("/api/UBER-EEDSI/history/")
            .send({})
            .set({ 'Authorization': user1Info.token })
            .set('Accept','application/json')
            .expect("Content-Type",/json/)
            .expect(200);
        expect(res2.body.success).toBe(true);
        expect(res2.body.histories).not.toBe(undefined);
        done();
    });


    test("OK - Delete History", async done => {
        // DELETE //
        const res1 = await request(app)
            .delete("/api/UBER-EEDSI/history/")
            .send({id : history1._id})
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res1.body.success).toBe(true);
        done();
    });

    test("OK - Create Map", async done => {
        // Création d'une direction
        const res1 = await request(app)
            .post("/api/UBER-EEDSI/map/direction")
            .send(map)
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res1.body.success).toBe(true);
        expect(res1.body.origin).not.toBe(undefined);
        expect(res1.body.destination).not.toBe(undefined);
        expect(res1.body.waypoints).not.toBe(undefined);
        expect(res1.body.duration).not.toBe(undefined);
        done();
    });
});

describe('KO - Routes History', () => {

    test("KO - Create History missing data", async done => {
        const res = await request(app)
            .post("/api/UBER-EEDSI/history/")
            .send({
                arrival_location: history1.arrival_location, 
                mode : history1.mode,
                duration: history1.duration,
            })
            .set('Accept', 'application/json')
            .set({ 'Authorization': user1Info.token })
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).not.toBe(undefined);
        done();
    });
    
    test("KO - Create History no token", async done => {
        const res = await request(app)
            .post("/api/UBER-EEDSI/history/")
            .send({
                departure_location : history1.departure_location,
                arrival_location: history1.arrival_location, 
                map : history1.map
            })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Not authorized to access this resource");
        done();
    });

    test("KO - Get History no token", async done => {
        const res = await request(app)
            .get("/api/UBER-EEDSI/history/")
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Not authorized to access this resource");
        done();
    });

    test("KO - Delete History missing id", async done => {
        const res = await request(app)
            .delete("/api/UBER-EEDSI/history/")
            .send({})
            .set('Accept', 'application/json')
            .set({ 'Authorization': user1Info.token })
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("History ID is missing");
        done();
    });

    test("KO - Delete History no token", async done => {
        const res = await request(app)
            .delete("/api/UBER-EEDSI/history/")
            .send({id: history1._id})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Not authorized to access this resource");
        done();
    });

    test("KO - Create Map", async done => {
        // Création d'une direction
        const res1 = await request(app)
            .post("/api/UBER-EEDSI/map/direction")
            .send({})
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res1.body.success).toBe(false);
        expect(res1.body.message).toBe('Invalid body');
        done();
    });

    test("KO - Create Map", async done => {
        // Création d'une direction
        map.mode = 'xxxxxxx'
        const res1 = await request(app)
            .post("/api/UBER-EEDSI/map/direction")
            .send(map)
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res1.body.success).toBe(false);
        expect(res1.body.message).toBe('Invalid travel mode');
        done();
    });
});

describe('OK - Delete account after test', () => {

    test("OK - Delete Account", async done => {
        /** Login for Delete*/
        const res4 = await request(app)
            .post("/api/UBER-EEDSI/account/login")
            .send({email: user1.email, password : user1.password})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res4.body.success).toBe(true);
        expect(res4.body.id).not.toBe(undefined);
        expect(res4.body.name).not.toBe(undefined);
        expect(res4.body.email).not.toBe(undefined);
        expect(res4.body.connexionDate).not.toBe(undefined);
        expect(res4.body.createdAt).not.toBe(undefined);
        expect(res4.body.token).not.toBe(undefined);
        expect(res4.body.refresh_token).not.toBe(undefined);
        user1Info = res4.body;

        /** Delete Account*/
        const res13 = await request(app)
        .delete("/api/UBER-EEDSI/account/")
        .send({id : user1Info.id, email: user1.email, password : user1.password})
        .set({ 'Authorization': res4.body.token })
        .set('Accept', 'application/json')
        .expect("Content-Type", /json/)
        .expect(200);
        expect(res13.body.success).toBe(true);
        expect(res13.body.message).toBe('Successfully deleted');
        done();
    });
});
