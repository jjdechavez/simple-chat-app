const net = require('net');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

let clients = [];
let historyMsgArr = [];
const file = 'history-chat.txt';

const server = net.createServer(socket => {
  socket.setEncoding('utf-8');
  
  // IP Client
  const { wlp3s0 } = os.networkInterfaces();
  const newWlp3s0 = wlp3s0.slice(0, 2);

  let ipv4 = newWlp3s0.filter(wl => net.isIP(wl.address) === 4);
  let ipv6 = newWlp3s0.filter(wl => net.isIP(wl.address) === 6);
  
  // let newClient = {
  //   id: clients.length + 1,
  //   address: [{ipv4}, {ipv6}],
  //   socket
  // }
  // clients.push(newClient);
  clients.push(socket);
  
  // Get IP address from ipv4
  let getIP = ipv4.map(ip => ip.address);
  let ipToString = getIP.toString().split('.').join('');
  let crypt = crypto.randomBytes(5).toString('hex');

  let newIP = ipToString.concat(crypt).substr(5);
  
  // Default event is connection (If someone connect on server, the "connection" event trigger)
  console.log(`New client got connected IP Address - ${newIP}`);
  
  // readable event from Streams
  socket.on('readable', () => {
    const chunk = socket.read();
    if (chunk === null) return;
    
    let msg = `${newIP}: ${chunk}`;
    historyMsgArr.push(msg);
    
    clients.filter((sender, index) => {
      const clientIndex = clients.indexOf(socket);
      if (index !== clientIndex) {
        return sender.write(msg);
      }
    });
  });
  
  socket.on('end', () => {
    console.log(`client ${newIP} disconnected`);
    const clientIndex = clients.indexOf(socket);
    clients.splice(clientIndex);

    if (clients.length <= 0) {
      let historyMesages = historyMsgArr.map(his => his);

      const newDate = new Date();
      const dateData = `${newDate.toLocaleString(0, {dateStyle: 'medium'})} ${newDate.toLocaleString(0, {timeStyle: 'medium'})}`;

      let templateHistoryMessage = `
${'-'.repeat(dateData.length)}
${dateData} 
${'-'.repeat(dateData.length)}

${historyMesages.join('')}
`;
      // if messages empty dont save it
      if (historyMesages.length > 0) {
        fs.appendFile(file, templateHistoryMessage, (err) => {
          if (err) {
            console.log('Message was failed to save!');
            throw err;
          } else {
            console.log('Message history was succesfully saved!');
            historyMesages = [];
            historyMsgArr = [];
          }
        });
      } else {
        console.log('No messages found!');
      }
    }
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));