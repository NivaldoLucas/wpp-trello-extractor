const TrelloPowerUp = window.TrelloPowerUp;

window.TrelloPowerUp.initialize({
  'card-buttons': function (t, options) {
    return [{
      icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
      text: 'Obter número do grupo',
      callback: getGroupNumber
    }];
  }
});

function getGroupNumber(t) {
  return t.card('id', 'name')
    .then(async () => {
      const groupLink = prompt("Cole o link do grupo do WhatsApp:");
      const instance = await t.get('board', 'shared', 'zapi_instance');
      const token = await t.get('board', 'shared', 'zapi_token');
      const clientToken = await t.get('board', 'shared', 'client_token');

      if (!groupLink || !instance || !token || !clientToken) {
        alert("Faltam dados: instância, token da URL, token do cliente ou link do grupo.");
        return;
      }

      const encodedLink = encodeURIComponent(groupLink);
      const url = `https://api.z-api.io/instances/${instance}/token/${token}/group-metadata/${encodedLink}`;

      try {
        const res = await fetch(url, {
          headers: {
            'Client-Token': clientToken
          }
        });
        const data = await res.json();

        if (data?.desc?.participants) {
          const firstNumber = data.desc.participants[0]?.id?.split('@')[0];
          if (firstNumber) {
            await t.set('card', 'shared', { whatsapp_number: firstNumber });
            alert(`Número extraído: ${firstNumber}`);
          } else {
            alert("Participante não encontrado.");
          }
        } else {
          alert("Dados inválidos ou grupo não encontrado.");
        }
      } catch (e) {
        console.error(e);
        alert("Erro ao conectar com o Z-API.");
      }
    });
}

