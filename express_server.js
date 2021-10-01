const express = require("express");
const cookieParser = require('cookie-parser');
const uuid = require('uuid');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('public'));
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
const generateRandomString = function() {
  let rand  = (Math.random() + 1).toString(36).substring(2,8);
  return rand;
};
const findUser = function(email,users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};
const createUser = function(email,password,users) {
  const userId = uuid.v4().substring(0,8);
  console.log("use",userId);
  users[userId] = {id:userId,email,password,};
  console.log("user",users[userId]);
  return userId;
};
const authenticate = function(email, password, users) {
  const userFound = findUser(email, users);
  if (userFound && userFound.password === password) {
    return userFound;
  }
  return false;
};

//register
app.get('/register', (req, res) => {
  const templateVars = { user: null };
  res.render('register', templateVars);
});
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = findUser(email, users);
  if (userFound) {
    res.status(403).send('Sorry  user already exists!');
    return;
  }
  const userId = createUser(email,password,users);
  res.cookie('user_id', userId);
  console.log('req.body:',req.body);
  res.redirect('/urls');
});
//login
app.get("/login",(req,res) =>{
  const templateVars = { user: null };
  res.render('login', templateVars);
});
app.post("/login",(req,res)=> {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticate(email, password, users);
  if (user) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
    return;
  }
  res.status(403).send('Wrong!');
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const templateVars = {user: loggedInUser,urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const templateVars = {user: loggedInUser};
  res.render("urls_new",templateVars);

});
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: shortURL, longURL: longURL,user: loggedInUser };
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  console.log(`${req.body.longURL}`);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
//update
app.post("/urls/:shortURL",(req,res) =>{
  const shortURL = req.params.shortURL;
  const updateURL = req.body.updateURL;
  urlDatabase[shortURL] = updateURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
//delete
app.post("/urls/:shortURL/delete",(req,res) =>{
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
//logout
app.post("/logout",(req,res)=> {
  //console.log("e",req.cookies["username"]);
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);
});

