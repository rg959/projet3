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


/** Test unitaire pour ACCOUNT */

const uuidUser1 = uuidv4();

const user1 = {
    name: 'Name_' + uuidUser1,
    email: uuidUser1 + "@gmail.com",
    password: "1234567",
    newPassword:"12345678",
    phone:"0123456789"
}

const user1Credentials = {
    email: user1.email,
    password: user1.password,
}

let user1Info = {};

describe('OK - Routes Account', () => {
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


    test("OK - Reset Password", async done => {
        /** Reset Password */
        const respassword = await request(app)
            .post("/api/UBER-EEDSI/account/request-reset-password")
            .send({ email: user1.email , type :'email' })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(respassword.body.success).toBe(true);

        const rescode = await request(app)
            .get("/getVerifiedCodeResetPassword")
            .send({ email: user1.email })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(rescode.body.success).toBe(true);
        expect(rescode.body.code).not.toBe(undefined);
        const codepassword = rescode.body.code;

        const res5 = await request(app)
            .post("/api/UBER-EEDSI/account/reset-password")
            .send({email: user1.email, code: codepassword ,password: user1.password})
            .set('Accept','application/json')
            .expect("Content-Type",/json/)
            .expect(200);
        expect(res5.body.success).toBe(true);
    done();
    });

    test("OK - Double Authentification", async done => {
        /** Double Authentification */
        const allow = await request(app)
            .post("/api/UBER-EEDSI/account/double-authentification")
            .send({allow : true})
            .set({ 'Authorization': user1Info.token })
            .set('Accept','application/json')
            .expect("Content-Type",/json/)
            .expect(200);
        expect(allow.body.success).toBe(true);

        const reqDAuth = await request(app)
            .post("/api/UBER-EEDSI/account/request-double-authentification")
            .send({ email: user1.email , password: user1.password })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(reqDAuth.body.success).toBe(true);

        const rescodeDoubleAuth = await request(app)
            .get("/getVerifiedDoubleAuthentification")
            .send({ email: user1.email })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(rescodeDoubleAuth.body.success).toBe(true);
        expect(rescodeDoubleAuth.body.code).not.toBe(undefined);
        const codeDoubleAuth = rescodeDoubleAuth.body.code;

        const res6 = await request(app)
            .post("/api/UBER-EEDSI/account/login")
            .send({email: user1.email , password: user1.password , code : codeDoubleAuth})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res6.body.id).not.toBe(undefined);
        expect(res6.body.name).not.toBe(undefined);
        expect(res6.body.email).not.toBe(undefined);
        expect(res6.body.connexionDate).not.toBe(undefined);
        expect(res6.body.createdAt).not.toBe(undefined);
        expect(res6.body.token).not.toBe(undefined);
        expect(res6.body.refresh_token).not.toBe(undefined);

        user1Info = res6.body;

        const allow2 = await request(app)
            .post("/api/UBER-EEDSI/account/double-authentification")
            .send({allow : false})
            .set({ 'Authorization': user1Info.token })
            .set('Accept','application/json')
            .expect("Content-Type",/json/)
            .expect(200);
        expect(allow2.body.success).toBe(true);

        done();
    });

    test("OK - Refresh Token", async done => {
        /** Refresh token */
        const res10 = await request(app)
            .post("/api/UBER-EEDSI/account/refresh-token")
            .send({id : user1Info.id, refresh_token : user1Info.refresh_token})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
            expect(res10.body.success).toBe(true);
            expect(res10.body.id).not.toBe(undefined);
            expect(res10.body.name).not.toBe(undefined);
            expect(res10.body.email).not.toBe(undefined);
            expect(res10.body.connexionDate).not.toBe(undefined);
            expect(res10.body.createdAt).not.toBe(undefined);
            expect(res10.body.token).not.toBe(undefined);
            expect(res10.body.refresh_token).not.toBe(undefined);
            
            user1Info = res10.body;

        done();
    });

    test("OK - Edit User Profil", async done => {
        /** Edit User Profil */
        const res7 = await request(app)
            .put("/api/UBER-EEDSI/account/")
            .send({ email: user1.email,
                    name: user1.name ,
                    phone: user1.phone, 
                    password: user1.password })
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res7.body.success).toBe(true);
        expect(res7.body.id).not.toBe(undefined);
        expect(res7.body.name).not.toBe(undefined);
        expect(res7.body.email).not.toBe(undefined);
        expect(res7.body.connexionDate).not.toBe(undefined);
        expect(res7.body.createdAt).not.toBe(undefined);
        
        done();
    });

    test("OK - Change password", async done => {
        /** Change Password */
        const res8 = await request(app)
            .post("/api/UBER-EEDSI/account/change-password")
            .send({ email: user1.email, oldPassword: user1.password, newPassword: user1.newPassword })
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res8.body.success).toBe(true);

        done();
    });

    test("OK - Disconnect", async done => {
        /** Disconnect */
        const res11 = await request(app)
            .post("/api/UBER-EEDSI/account/disconnect")
            .set('Accept', 'application/json')
            .set({ 'Authorization': user1Info.token })
            .expect("Content-Type", /json/)
            .expect(200);
            expect(res11.body.success).toBe(true);
            expect(res11.body.message).toBe('Successfully logout');
        done();
    });

    
});

describe('KO - Routes Account', () => {
    /** Register */
    test("KO - Register", async done => {
        const res10 = await request(app)
            .post("/api/UBER-EEDSI/account/register")
            .send({})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res10.body.success).toBe(false);
        expect(res10.body.message).not.toBe(undefined);
        done();
    });

     /** Verify Email */
    test("KO - Verify Email", async done => {
        const res11 = await request(app)
            .post("/api/UBER-EEDSI/account/request-verify-email")
            .send({})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res11.body.success).toBe(false);
        expect(res11.body.message).toBe('Invalid body');

        const res13 = await request(app) 
            .post("/api/UBER-EEDSI/account/verify-email")
            .send({ email: user1.email})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res13.body.success).toBe(false);
        expect(res13.body.message).toBe('Invalid body');

        const res14 = await request(app) 
            .post("/api/UBER-EEDSI/account/verify-email")
            .send({ code: '111111' })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res14.body.success).toBe(false);
        expect(res14.body.message).toBe('Invalid body');

    done();
    });

    /** Login */
    test("KO - Login", async done => {
        const res1 = await request(app)
            .post("/api/UBER-EEDSI/account/login")
            .send({})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);  
        expect(res1.body.success).toBe(false);
        expect(res1.body.message).toBe('Missing email');

        const res2 = await request(app)
            .post("/api/UBER-EEDSI/account/login")
            .send({email: user1.email})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res2.body.success).toBe(false);
        expect(res2.body.message).toBe('Missing password');

        const res3 = await request(app)
            .post("/api/UBER-EEDSI/account/login")
            .send({password: user1.password})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res3.body.success).toBe(false);
        expect(res3.body.message).toBe('Missing email');
        done();
    });

     /** Reset Password */
    test("KO - Reset Password", async done => {
        const res4 = await request(app)
            .post("/api/UBER-EEDSI/account/request-reset-password")
            .send({email: user1.email})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res4.body.success).toBe(false);
        expect(res4.body.message).toBe('Invalid body');
        
        const res5 = await request(app)
            .post("/api/UBER-EEDSI/account/request-reset-password")
            .send({type :'email'})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res5.body.success).toBe(false);
        expect(res5.body.message).toBe('Invalid body');

        const res6 = await request(app)
            .post("/api/UBER-EEDSI/account/request-reset-password")
            .send({})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res6.body.success).toBe(false);
        expect(res6.body.message).toBe('Invalid body');
        done();
    });

    /** Double Authentification */
    test("KO - Double Authentification", async done => {
        const res16 = await request(app)
            .post("/api/UBER-EEDSI/account/request-double-authentification")
            .send({ email: user1.email})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res16.body.success).toBe(false);
        expect(res16.body.message).toBe('Missing password');

        const res17 = await request(app)
            .post("/api/UBER-EEDSI/account/request-double-authentification")
            .send({ password: user1.password})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res17.body.success).toBe(false);
        expect(res17.body.message).toBe('Missing email');

        const res18 = await request(app)
            .post("/api/UBER-EEDSI/account/request-double-authentification")
            .send({})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res18.body.success).toBe(false);
        expect(res18.body.message).toBe('Missing email');
        
        done();
    });

    /** Refresh Token */
    test("KO - Refresh Token", async done => {
        const res19 = await request(app)
            .post("/api/UBER-EEDSI/account/refresh-token")
            .send({})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res19.body.success).toBe(false);
        expect(res19.body.message).toBe('Invalid body');
        
        const res21 = await request(app)
            .post("/api/UBER-EEDSI/account/refresh-token")
            .send({id : user1Info.id})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res21.body.success).toBe(false);
        expect(res21.body.message).toBe('Invalid body');


        const res22 = await request(app)
            .post("/api/UBER-EEDSI/account/refresh-token")
            .send({refresh_token : user1Info.refresh_token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res22.body.success).toBe(false);
        expect(res22.body.message).toBe('Invalid body');

        const res23 = await request(app)
            .post("/api/UBER-EEDSI/account/refresh-token")
            .send({id : 'qdqdqdqzdqzdqzdqzdqz', refresh_token : user1Info.refresh_token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res23.body.success).toBe(false);
        expect(res23.body.message).not.toBe(undefined);
        
        done();
    });
   /** Edit User Profil */
    test("KO - Edit User Profil", async done => {
        /** Login for Delete*/
        const res4 = await request(app)
            .post("/api/UBER-EEDSI/account/login")
            .send({email: user1.email, password : user1.newPassword})
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
        
        const res21 = await request(app)
            .put("/api/UBER-EEDSI/account/")
            .send({ name: user1.name , phone: user1.phone})
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res21.body.success).toBe(false);
        expect(res21.body.message).toBe('Password missing');

        const res22 = await request(app)
            .put("/api/UBER-EEDSI/account/")
            .send({ email: user1.email,phone: user1.phone, password: user1.password })
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res22.body.success).toBe(false);
        expect(res22.body.message).not.toBe('Invalid body');

        const res23 = await request(app)
            .put("/api/UBER-EEDSI/account/")
            .send({ email: user1.email,name: user1.name ,password: user1.password })
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res23.body.success).toBe(false);
        expect(res23.body.message).not.toBe('Invalid body');
   

        const res24 = await request(app)
                .put("/api/UBER-EEDSI/account/")
                .send({ email: user1.email,name: user1.name ,phone: user1.phone })
                .set({ 'Authorization': user1Info.token })
                .set('Accept', 'application/json')
                .expect("Content-Type", /json/)
                .expect(400);
            expect(res24.body.success).toBe(false);
            expect(res24.body.message).toBe('Password missing');
            done();
    });
    
    test("KO - Change password", async done => {
        /** Change Password */
        const res25 = await request(app)
            .post("/api/UBER-EEDSI/account/change-password")
            .send({email: user1.email, newPassword: user1.newPassword })
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res25.body.success).toBe(false);
        expect(res25.body.message).toBe('One field is missing');

        const res26 = await request(app)
            .post("/api/UBER-EEDSI/account/change-password")
            .send({email: user1.email, newPassword: user1.newPassword })
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res26.body.success).toBe(false);
        expect(res26.body.message).toBe('One field is missing');

        const res27 = await request(app)
            .post("/api/UBER-EEDSI/account/change-password")
            .send({oldPassword: 'vzervgzerg'})
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res27.body.success).toBe(false);
        expect(res27.body.message).not.toBe('Old password is wrong');

        const res28 = await request(app)
            .post("/api/UBER-EEDSI/account/change-password")
            .send({})
            .set({ 'Authorization': user1Info.token })
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res28.body.success).toBe(false);
        expect(res28.body.message).toBe('One field is missing');
        done();
        
    });

    test("KO - Delete Account", async done => {
        /** Login for Delete*/
        const res30 = await request(app)
            .post("/api/UBER-EEDSI/account/login")
            .send({email: user1.email})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res30.body.success).toBe(false);


        const res33 = await request(app)
            .post("/api/UBER-EEDSI/account/login")
            .send({password : user1.newPassword})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res33.body.success).toBe(false);

        /** Delete Account*/
        const res31 = await request(app)
            .delete("/api/UBER-EEDSI/account/")
            .send({email: user1.email})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(401);
        expect(res31.body.success).toBe(false);
        expect(res31.body.message).toBe('Not authorized to access this resource');

        const res32 = await request(app)
            .delete("/api/UBER-EEDSI/account/")
            .send({password : user1.newPassword})
            .set('Accept', 'application/json')
            .expect("Content-Type", /json/)
            .expect(401);
        expect(res32.body.success).toBe(false);
        expect(res32.body.message).toBe('Not authorized to access this resource');

        done();
    });
});

describe('OK - Delete account after test', () => {

    test("OK - Delete Account", async done => {
        /** Login for Delete*/
        const res4 = await request(app)
            .post("/api/UBER-EEDSI/account/login")
            .send({email: user1.email, password : user1.newPassword})
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
        .send({id : user1Info.id, email: user1.email, password : user1.newPassword})
        .set({ 'Authorization': res4.body.token })
        .set('Accept', 'application/json')
        .expect("Content-Type", /json/)
        .expect(200);
        expect(res13.body.success).toBe(true);
        expect(res13.body.message).toBe('Successfully deleted');
        done();
    });
});

