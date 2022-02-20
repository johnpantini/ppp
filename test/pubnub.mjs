import PubNub from '../salt/states/ppp/lib/vendor/pubnub.min.js';

const pubnub = new PubNub({
  subscribeKey: Buffer.from(
    'c3ViLWMtYTMzYzEwMTYtODhkMy0xMWVjLWEwNGUtODIyZGZkNzk2ZWI0',
    'base64'
  ).toString(),
  uuid: 'ddfa7c32-6914-4e25-a58d-c44ce27018d3'
});

pubnub.addListener({
  message: function (messageEvent) {
    console.log(messageEvent.message);
  }
});

pubnub.subscribe({
  channels: ['ppp']
});
