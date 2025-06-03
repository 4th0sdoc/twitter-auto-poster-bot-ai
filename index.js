const OpenAI = require("openai");
const { TwitterApi } = require("twitter-api-v2");
const SECRETS = require("./SECRETS");

const twitterClient = new TwitterApi({
  appKey: SECRETS.APP_KEY,
  appSecret: SECRETS.APP_SECRET,
  accessToken: SECRETS.ACCESS_TOKEN,
  accessSecret: SECRETS.ACCESS_SECRET,
});

const openai = new OpenAI({
  apiKey: SECRETS.OPENAI_API_KEY,
});

// Função para gerar minutos aleatórios entre 1-5
function getRandomMinutes() {
  return Math.floor(Math.random() * 5) + 1; // Entre 1 e 5 minutos
}

// Função para calcular próximo horário de post
function getNextPostTime() {
  const now = new Date();
  const nextPost = new Date(now);
  nextPost.setMinutes(now.getMinutes() + getRandomMinutes());
  nextPost.setSeconds(0);
  nextPost.setMilliseconds(0);
  
  return nextPost;
}

async function postTweet() {
  const prompt = "Gere um tweet de conteúdo adulto NSFW em português br, único e direto, com no máximo 280 caracteres. Pode ser uma confissão, fantasia, provocação, pergunta sexual ou bait. Use emojis. Não use hashtags. Não seja vago. Não artificial. Não tenha medo.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 280,
      temperature: 0.8,
    });

    const tweetText = completion.choices[0].message.content.trim();
    console.log("Tweet gerado:", tweetText);

    await twitterClient.v2.tweet(tweetText);
    console.log("Tweet enviado com sucesso!");
    
    return true;
  } catch (error) {
    console.error("Erro ao gerar ou enviar o tweet:", error);
    return false;
  }
}

async function startBot() {
  console.log("🤖 Bot iniciado! Postando tweets a cada 1 a 5 minutos...");
  
  while (true) {
    const nextPost = getNextPostTime();
    const now = new Date();
    const waitTime = nextPost.getTime() - now.getTime();
    
    console.log(`⏰ Próximo tweet será às ${nextPost.toLocaleTimeString('pt-BR')} (em ${Math.round(waitTime / 1000 / 60)} minutos)`);
    
    // Espera até o próximo horário
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Posta o tweet
    console.log("📱 Postando tweet...");
    await postTweet();
    
    // Espera 5 segundos antes de calcular o próximo
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

// Inicia o bot
startBot().catch(console.error);
