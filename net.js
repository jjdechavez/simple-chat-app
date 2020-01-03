const net = require('net');

const clients = [];

net.createServer(socket => {
  socket.setEncoding('utf-8');
  console.log('i got a new client', socket);

  clients.push(socket);

  socket.on('readable', () => {
    const chunk = socket.read();
    if (chunk === null) return;

    // socket.write(chunk)
    console.log(chunk);
    clients.forEach((sender) => {
      sender.write(chunk);
    });
  });

  socket.on('end', () => {
    console.log('Disconnected');
    const index = clients.indexOf(socket);
    clients.splice(index);
  });

}).listen(4000, () => console.log('Net running on port 4000'));