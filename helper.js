
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const generateRandomString = function() {
  let rand  = (Math.random() + 1).toString(36).substring(2,8);
  return rand;
};

const getUserByEmail = function(email,users) {

  for (const value in users) {
    if (users[value].email === email) {
      return value;
    }
  }

};

const authenticateUser = function(users,email, password) {
  const userID = getUserByEmail(email,users);
  if (!userID) {
    return  {status: 403,user:null , error :"error login in invalid credentials"};
  } else  if (userID && bcrypt.compareSync(password,users[userID].password)) {
    return {userID};
   
  } else {
    return {status: 403, user:null, error :"error login in invalid credentials"};
  }

};


const  urlsForUser = (id,db) => {
  const result = {};
  const keys = Object.keys(db);
  for (const key  of keys) {
    const url = db[key];
    if (url.userID === id) {
      result[key] = url;
    }
  
  }
  return result;
};

module.exports = {generateRandomString,getUserByEmail,authenticateUser,urlsForUser};



