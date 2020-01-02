const net = require('net');
const os = require('os');

let clients = [];

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

  // Default event is connection (If someone connect on server, the "connection" event trigger)
  console.log(`New client got connected IP Address - ${getIP}`);
  
  // readable event from Streams
  socket.on('readable', () => {
    const chunk = socket.read();
    if (chunk === null) return;

    let msg = `${getIP}: ${chunk}`;
    
    clients.filter((sender, index) => {
      const clientIndex = clients.indexOf(socket);
      if (index !== clientIndex) {
        return sender.write(msg);
      }
    });
  });

  socket.on('end', () => console.log(`client ${getIP} disconnected`));
});


server.listen(5000, () => console.log('Server running on port 5000'));