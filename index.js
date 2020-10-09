'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "ws://chat-bot-95178.firebaseio.com/"
});
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Hello!. This is Yo. The ordering assistant. How can i help you?.`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
  }

  function addorder(agent){
    const pizzatype = agent.parameters.type;
    const pizzaspec = agent.parameters.pizza;
    const pizzasize = agent.parameters.size;
    const pizzacrust = agent.parameters.crust;
    const pizzatopping = agent.parameters.topping;
    const pizzacount = agent.parameters.count;
    const customername = agent.parameters.name;
    const customerphone = agent.parameters.phone;
    const customeraddress = agent.parameters.address;
    const customermode = agent.parameters.mode;
    
    return admin.database().ref('data').set({
      pizzatype: pizzatype,
      pizzaspec: pizzaspec,
      pizzasize: pizzasize,
      pizzacrust: pizzacrust,
      pizzatopping: pizzatopping,
      pizzacount: pizzacount,
      customername: customername,
      customerphone: customerphone,
      customeraddress: customeraddress,
      customermode: customermode,
      orderstatus : 'ordered',
      ordertotal : '0'
    });
  }
  
  function trackorder(agent){
    return admin.database().ref('data').once('value').then((snapshot) =>{
      var value = snapshot.child('orderstatus').val();
      var name = snapshot.child('customername').val();
      var cost = snapshot.child('ordertotal').val();
      
      agent.add(name + ' Your order is. ' + value + ' and will cost you Rs. ' + cost + '. have a nice day!.');
    });
  }
  
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Welcome', welcome);
  intentMap.set('addorder', addorder);
  intentMap.set('track-order', trackorder);
  agent.handleRequest(intentMap);
});
