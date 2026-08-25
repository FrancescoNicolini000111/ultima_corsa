// imports
import express from "express";
import morgan from "morgan";
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import cors from "cors";
import { getTrainMap, getLeaderboard, getGameResult, getUserByEmail, updateHighestScore } from "./dao.js";
import { getRandomPair } from "./utilities.js";
import crypto from 'crypto';
import 'dotenv/config';

// init express
const app = express();
const port = 3001;

// middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({
  origin: 'http://localhost:5173', // La porta su cui gira il tuo React
  credentials: true,               // Permette il passaggio dei cookie di sessione
}
))


// session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


//function to verify user's password

const verifyPassword = (password, user) => {
  const salt = user.salt;
  const stored = user.hashedPassword;

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
      if (err) return reject(err);
      if (!crypto.timingSafeEqual(Buffer.from(stored, 'hex'), hashedPassword))
        resolve(false);
      else resolve(true);
    });
  });
};



passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, cb) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) return cb(null, false);

    const ok = await verifyPassword(password, user);
    if (!ok) return cb(null, false);

    return cb(null, {
      ...user,
      hashedPassword: undefined,
      salt: undefined
    });
  } catch (err) {
    return cb(err);
  }
}));


passport.serializeUser((user, cb) => {
  cb(null, {
    userID: user.userID,
    username: user.username,
    email: user.email,
    pointsMax: user.pointsMax
  });
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// Authentication middleware to protect routes
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Unauthenticated" });
};


/* ROUTES */

// LOGIN 
app.post("/api/sessions", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    req.login(user, (loginErr) => {
      if (loginErr) return res.status(500).end();
      return res.status(201).json(user);
    });
  })(req, res, next);
});


// GET SESSIONE
app.get("/api/sessions/current", ensureAuthenticated, (req, res) => {
  try {
    return res.json(req.user);
  }
  catch {
    res.status(500).end()
  }
})

// LOGOUT
app.delete("/api/sessions/current", ensureAuthenticated, (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(sessionErr => sessionErr ? next(sessionErr) : res.status(204).end());
  });
});

// GET TRAIN MAP
app.get("/api/trainmap", ensureAuthenticated, async (req, res) => {
  try {
    const trainmap = await getTrainMap();
    return res.json(trainmap)

  }
  catch {
    res.status(500).end();
  }
})

// GET LEADERBOARD
app.get("/api/leaderboard", ensureAuthenticated, async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    return res.json(leaderboard)
  }
  catch {
    res.status(500).end()
  }
})

// START GAME
app.post("/api/games/start", ensureAuthenticated, async (req, res) => {
  try {
    const randomStations = await getRandomPair();
    req.session.currentGame = {
      startStationName: randomStations.startStationName,
      arriveStationName: randomStations.arriveStationName,
      startTime: Date.now()
    }; // salvo in sessione per evitare cheat
    return res.status(201).json(randomStations);
  }
  catch {
    res.status(500).end()
  }
})

// END GAME 
app.post("/api/games/result", ensureAuthenticated, async (req, res) => {
  try {

    if (!req.session.currentGame) {
      return res.status(409).json({ error: "Nessuna partita attiva trovata in sessione." });
    }

    const elapsed = Date.now() - req.session.currentGame.startTime
    if (elapsed > 90500) {
      delete req.session.currentGame;
      return res.status(200).json({ isValid: false, finalPoints: 0, eventsFound: [] });
    }

    const startStation = req.session.currentGame.startStationName
    const arriveStation = req.session.currentGame.arriveStationName
    const userTrip = req.body
    if (!Array.isArray(userTrip)) {
      return res.status(422).json({ error: "Dati del viaggio mancanti o malformati." });
    }
    if(userTrip.length === 0){
      return res.status(200).json({ isValid: false, finalPoints: 0, eventsFound: [] })
    }


    const routes = await getTrainMap();

    const result = await getGameResult(userTrip, startStation, arriveStation, routes)

    if (result.isValid) {
      const finalPoints = result.finalPoints
      const userHighScore = req.user.pointsMax
      if (finalPoints > userHighScore) {
        await updateHighestScore(req.user.userID, finalPoints)
        req.user.pointsMax = finalPoints;
        req.session.passport.user.pointsMax = finalPoints;
      }
    }

    delete req.session.currentGame

    return res.status(200).json(result);
  }
  catch {
    res.status(500).end()
  }
})

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});