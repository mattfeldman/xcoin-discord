/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// import the discord.js module
const Discord = require('discord.js');
const babyparse = require("babyparse");

const fs = require('fs');
const request = require('request');


// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
bot.on('ready', () => {
  console.log('I am ready!');
});

// create an event listener for messages
bot.on('message', message => {
  // if the message is "ping",
  if (message.content.toUpperCase().startsWith('!XCOIN')) {
    var name = message.content.split(' ')[1];    
    name = name || message.author.username; 
    const entry = lookup(name);
    if(entry){
      message.channel.sendMessage(formatMessage(entry));
    }    
    else{
      message.channel.sendMessage(name+" not found. Please try !xcoin <partial_in_game_name_here>");
    }
  }
});

var STORE = [];
request("http://docs.google.com/spreadsheets/d/1RbgPC1KMmzX6Q-IrZaZQb_sygI_UoWg0xR1YclspKZQ/export?format=csv", function(error, response, body){
  var firstLine = body.indexOf('\n');
  var cleanData = body.substr(firstLine+1);
  var data = babyparse.parse(cleanData, {header: true, dynamicTyping:true, skipEmptyLines:true});  
  STORE = data.data;
});

function formatMessage(entry){
  const b = (s) => "**"+s+"**";
  const username =  entry["Username"]
  const lastRank =  entry["Last Rank"]
  const promotion =  entry["Promotion"]
  const demotion =  entry["Demotion"]
  const weeksPresent =  entry["Weeks Present"]
  const monthlyTotal =  entry["Monthly Total"]
  const weeklyAverage =  entry["Weekly Average"]
  const nonImmuneMonthlyRank =  entry["Non-Immune Monthly Rank"]
  const weeklyBalance =  entry["Weekly Balance"]
  const sales =  entry["Sales"]
  const purchases =  entry["Purchases"]
  const raffleEntries =  entry["Raffle Entries"]
  const goldDonations =  entry["Gold Donations"]
  const itemDonations =  entry["Item Donations"]
  
  return "xCoin for "+b(username)+" : Week "+b(weeklyAverage)+", Month "+b(monthlyTotal);
  
}

function lookup(name){
  var upperName = name.toUpperCase();
  for(var i=0;i<STORE.length;i++){
    var entry = STORE[i];    
    if(entry.Username.toUpperCase().indexOf(upperName) > 0){
      return entry;
    }
  }
  return null
}

// log our bot in
bot.login(process.env.BOT_TOKEN);