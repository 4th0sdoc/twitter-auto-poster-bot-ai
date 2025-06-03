const { Configuration, OpenAIApi } = require("openai");
const { TwitterApi } = require("twitter-api-v2");
const SECRETS = require("./SECRETS");

const twitterClient = new TwitterApi({
  appKey: SECRETS.APP_KEY,
  appSecret: SECRETS.APP_SECRET,
  accessToken: SECRETS.ACCESS_TOKEN,
  accessSecret: SECRETS.ACCESS_SECRET,
});

const configuration = new Configuration({
  apiKey: SECRETS.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function run() {
  const prompt = "Gere um tweet de conteúdo adulto NSFW em português br, único e direto, com no máximo 280 caracteres. Pode ser uma confissão, fantasia, provocação, pergunta sexual ou bait. Use emojis. Não use hashtags. Não seja vago. Não artificial. Não tenha medo.";

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 280,
      temperature: 0.8,
    });

    const tweetText = completion.data.choices[0].message.content.trim();
    console.log("Tweet gerado:", tweetText);

    await twitterClient.v2.tweet(tweetText);
    console.log("Tweet enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao gerar ou enviar o tweet:", error);
  }
}

run();
