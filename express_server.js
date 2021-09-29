const express = require("express");
const cookieParser = require('cookie-parser');
//const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
//const bodyParser = require("body-parser");
//app.use(bodyParser .urlencoded({ extended: true }));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
//app.use(cookieSession);
// console.log("se",cookieSession);
// app.use(express.json());
//app.use(bodyParser.json());
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"] ,urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new",templateVars);
  
});

app.get("/urls/:shortURL", (req, res) => {
  
  console.log("/url being hit");
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL,username: req.cookies["username"]/* What goes here? */ };
  res.render("urls_show", templateVars);
  
});

app.post("/urls", (req, res) => {
  //const templateVars = { username: req.cookies["username"]};
  
  const longURL = req.body.longURL;
  console.log(`${req.body.longURL}`);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  //console.log(urlDatabase[shortURL]);
  res.redirect(`/urls/${shortURL}`);
  
});
app.get("/u/:shortURL", (req, res) => {
  //const templateVars = { username: req.cookies["username"]};
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  
});

//update
app.post("/urls/:shortURL",(req,res) =>{
  //const templateVars = { username: req.cookies["username"]};
  
  const shortURL = req.params.shortURL;
  //console.log(shortURL);
  const updateURL = req.body.updateURL;
  //console.log("g",updateURL);
  
  urlDatabase[shortURL] = updateURL;
  //console.log("l",urlDatabase[shortURL]);
  
  res.redirect("/urls");
  
});


app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
//delete
app.post("/urls/:shortURL/delete",(req,res) =>{
  //const templateVars = { username: req.cookies["username"]};
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//login
app.post("/login",(req,res)=>{
  //const templateVars = { username: req.cookies["username"]};
  const username = req.body.username;
  res.cookie("username",username);
  console.log("n",username)
  res.redirect("/urls");
  
});
//logout

app.post("/logout",(req,res)=> {
  console.log("e",req.cookies["username"]);
  //const templateVars = { username: req.cookies["username"]};
  //req.cookies["username"] = null;

  
  
  res.clearCookie("username");
  
  res.redirect("/urls");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let rand  = (Math.random() + 1).toString(36).substring(2,8);
  return rand;

}