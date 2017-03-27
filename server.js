
const Discord = require('discord.js');
const babyparse = require("babyparse");

const fs = require('fs');
const path = require('path');
const request = require('request');
const express = require('express');
const moment = require('moment');
require('moment-precise-range-plugin');

var app = express();
const time = new Date().toString();
app.get('/', function(req,res){
  res.render('index.hbs', {time: time});
});

var port = process.env.PORT || 3000;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.listen(port);

const discordAdmins = ["114877197512081410", "79000698812891136"];
const decaUserString = "<@114877197512081410>";
const startTime = Date.now();
var refreshTime = null;

// Be bold
const b = (s) => "**"+s+"**";

// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();
bot.on('ready', () => {
  console.log('I am ready!');
});

// create an event listener for messages
bot.on('message', message => {
  const lowerMessage = message.content.toLowerCase();
  if (lowerMessage.startsWith('!xcoin')) {
    var name = message.content.split(' ')[1];    
    name = name || message.author.username; 
    const exchangeEntry = lookup(STORE.exchange, name);
    const bazaarEntry = lookup(STORE.bazaar, name);
    if(exchangeEntry){
      const msg = formatMessage(exchangeEntry);    
      message.channel.sendMessage(msg+" [Exchange]");       
    }
    if(bazaarEntry){
      const msg = formatMessage(bazaarEntry);    
      message.channel.sendMessage(msg+" [Bazaar]");
    }
    if(!bazaarEntry && !exchangeEntry){
      message.channel.sendMessage(name+" not found, use your in-game account name.");
    }
  }
  else if(lowerMessage.startsWith("!refresh")){
    if(discordAdmins.includes(message.author.id)){
      message.channel.sendMessage("Absolutely!");
      refreshData();
    }
    else{
      message.channel.sendMessage("Denied access, ask "+decaUserString+" to add you: "+message.author.id);
    }
  }
  else if(lowerMessage.startsWith("!info")){
    var now = Date.now();
    var runtime = moment.preciseDiff(startTime, now);
    var refresh = moment.preciseDiff(refreshTime, now);
    message.channel.sendMessage(b("Uptime: ")+runtime+b("\tRefresh Age: ")+refresh+"\tWritten by "+decaUserString);
  }
});

var STORE = {exchange: [], bazaar:[]};
function refreshData(){
  request("http://docs.google.com/spreadsheets/d/1Yez-OB0OCzORqRuvwbW8Jxjn8TNL4cHkScXY9ZrOTXs/export?format=csv", function(error, response, body){  
    var data = babyparse.parse(body, {header: true, dynamicTyping:true, skipEmptyLines:true});
    STORE.bazaar = data.data;
  });
  
  request("https://docs.google.com/spreadsheets/d/1pkiwX_b5qcD5kgd3StgjapcJaHy0JuMjEzkghZetZbA/export?format=csv", function(error, response, body){  
    var data = babyparse.parse(body, {header: true, dynamicTyping:true, skipEmptyLines:true});
    STORE.exchange = data.data;  
  });
  refreshTime = Date.now();
}
refreshData();


function formatMessage(entry){
  const username =  entry["Username"]
  const month =  entry["Monthly Total"]
  const week =  entry["Weekly Average"]
  return "xCoin for "+b(username)+" : Week Average "+b(week)+", Month Total "+b(month); 
}

function lookup(collection, name){
  var upperName = name.toUpperCase();
  for(var i=0;i<collection.length;i++){
    var entry = collection[i];    
    if(entry.Username.toUpperCase().indexOf(upperName) >= 0){
      return entry;
    }
  }
  return null
}

// log our bot in
bot.login(process.env.BOT_TOKEN);