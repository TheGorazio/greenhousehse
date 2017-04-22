const express = require('express'); 
const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(8181, () => console.log(`Listening on ${ 8080 }`));
const io = require('socket.io')(server);
const redis = require('redis');
const redisClient = redis.createClient(6379, 'iotRedis.redis.cache.windows.net'); 
const password = 'i5hFZUx3D6GTMtA/UcI+P3HFf4O63I/HYbEEa/p/aJU=';
const channels = [
    'devices/lora/807B85902000017A/opt3001/luminocity',
    'devices/lora/807B85902000017A/bme280/humidity',
    'devices/lora/807B85902000017A/bme280/temperature',
    'devices/lora/807B85902000017A/bme280/pressure',
    'devices/lora/807B85902000017A/adc2',
    'devices/lora/807B85902000017A/adc3'
];
let values = {
    humidity: 0,
    pressure: 0,
    luminocity: 0,
    temperature: 0,
    adc2: 0,
    adc3: 0
};

redisClient.auth(password, (err) => { 
    if (err) throw err; 
});

redisClient.on('connect', () => {
    channels.forEach((channel) => redisClient.subscribe(channel));
    io.on('connection', (socket) => {
        console.log('new connection -', socket.id);
        socket.emit('initial data', values);

        redisClient.on('message', (channel, msg) => {
            console.log(msg);
            values[channel.split('/')[4] || channel.split('/')[3]] = msg;
            socket.emit('data', values);
        });
        
        socket.on('disconnect', () => {
            console.log(socket.id, '- disconnected');
        });
    });
});