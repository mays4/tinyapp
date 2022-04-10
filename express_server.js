const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const {generateRandomString,getUserByEmail,authenticateUser,urlsForUser} = require("./helper");
const uuid = require('uuid');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieSession({
  name : 'session',
  keys: ["key1" ,"key2"],
})
);
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10),
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password:  bcrypt.hashSync("dishwasher-funk",10),
  }
};


app.get('/',(req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  if (!user) {
    res.redirect("/login");
  } else{
    res.redirect('/urls');
  }
 
});

app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  const urls = urlsForUser(userID,urlDatabase);
  const templateVars = {urls,user};
  if (!user) {
    res.status(400).send("you must <a href='/login'>login </a> or <a href='/register'>register </a>");
  } else {
    res.render("urls_index", templateVars);
  }
});
app.post("/urls", (req, res) => {
  console.log("users",users);
  const longURL = req.body.longURL;
  const userID = req.session.userID;
  const user = users[userID];
  const shortURL = generateRandomString();
  if (user) {
    urlDatabase[shortURL] = {longURL ,userID,};
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).send('you must login first');
  }
});
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  if (!user) {
    res.redirect("/login");

  }else{
  const templateVars = {user};
  res.render("urls_new",templateVars);
  }

 
});
app.get("/urls/:shortURL", (req, res) => {
  //find out which userID the shortURL belong to
  // compare userID to the cookiesID
  //display the page if it's match
  //if not give an error message 400 no permission
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const user = users[userID];
  const urls = urlsForUser(userID,urlDatabase);
  if (!urlDatabase[shortURL]) {
    return res.status(400).send("you don't have the authoriztion to this view or update this URl");
  } else if (!userID || !urls[shortURL]) {
    res.status(400).send("you don't have the authorization to this URL");
    
  } else {
    const templateVars = { shortURL, urls,user};
    res.render("urls_show", templateVars);

  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    if (!longURL) {
      res.status(400);
    } else {
      res.redirect(longURL);
     
    }
    res.status(400).send("not the correct url");
  }
  
});
//update
app.post("/urls/:shortURL",(req,res) =>{
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const user = users[userID];
  const url = urlsForUser(userID,urlDatabase);
  if (Object.keys(url).includes(req.params.shortURL)) {
  
    urlDatabase[shortURL].longURL = req.body.updateURL;
    res.redirect("/urls");
  } else {

    res.status(400).send("you are not have the authorization ");
  }

 
});
//delete
app.post("/urls/:shortURL/delete",(req,res) =>{
  const userID = req.session.userID;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  const urls = urlsForUser(userID,urlDatabase);
  if (Object.keys(urls).includes(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("what");
  }
});
//register
app.get('/register', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  if (user) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user };
  res.render('register', templateVars);
});
app.post('/register', (req, res) => {
  const userFound = getUserByEmail(req.body.email, users);
  if (!userFound) {
    const userID = generateRandomString();
    users[userID] = {
      userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.userID = userID;
    res.redirect('/urls');
    return;
  }
  res.status(400).send("email already exist");
});
//login
app.get("/login",(req,res) =>{
  const userID = req.session.userID;
  const user = users[userID];
  if (user) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user};
  res.render('login', templateVars);

});
app.post("/login",(req,res)=> {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email,users);
  const result = authenticateUser(users,email, password);
  if (result.error) {
    return res.status(result.status).send(result.error);
  }
  req.session.userID = result.userID;
  res.redirect('/urls');
  
});
//logout
app.post("/logout",(req,res)=> {
  res.clearCookie("session");
  res.clearCookie('session.sig');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});



