const { zokou } = require('../bdd/');

async function getFake(jid) {
  return await Data.get(`antifake_${jid}`) || { enabled: false, allow: [], notallow: [] };
}

async function enableAntiFake(jid, value) {
  let data = await getFake(jid);

  if (value === 'on' || value === 'off') {
    data.enabled = value === 'on';
  } else {
    if (!data.allow.includes(value)) {
      data.allow.push(value);
    }
  }

  await Data.set(`antifake_${jid}`, data);
  return data;
}

async function antiList(jid) {
  let data = await getFake(jid);
  return data.allow || [];
}

zokou({
  nomCom: 'antifake', 
  desc: 'Enable or disable the antifake feature in group chats.',
  categorie: 'group',
  reaction: '✅',
  onlyGroup: 'true', // Restricts command to groups only
  fromMe: 'true' // Allows bot to respond to its own messages
}, async (message, args) => {
  let match = args.join(' ');

  if (!match) {
    const fake = await getFake(message.jid);
    const status = fake.enabled ? 'on' : 'off';
    return message.reply(`Antifake is currently *${status}*.`);
  }

  if (match === 'list') {
    const codes = await antiList(message.jid);
    if (!codes.length) return message.reply('No antifake country codes have been added.');
    return message.reply('Allowed country codes:\n```' + codes.map((code, i) => `${i + 1}. ${code}`).join('\n') + '```');
  }

  if (match === 'on' || match === 'off') {
    await enableAntiFake(message.jid, match);
    return message.reply(`Antifake has been *${match === 'on' ? 'enabled' : 'disabled'}*.`);
  }

  const res = await enableAntiFake(message.jid, match);
  return message.reply(
    `Updated Antifake:\nAllowed: *${res.allow.length ? res.allow.join(', ') : 'None'}*`
  );
});
