const axios = require('axios');

exports.handler = async () => {
  try {
    const token = process.env.INSTAGRAM_TOKEN;
    const response = await axios.get(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink&access_token=${token}&limit=12`
    );
    return { statusCode: 200, body: JSON.stringify(response.data.data) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};