// API 엔드포인트: 챗봇 메시지 처리
const axios = require('axios');

module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 처리
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  
  console.log('클라이언트로부터 메시지 수신:', message);

  // API 키 확인
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
    return res.status(500).json({ 
      success: false, 
      error: 'API 키가 설정되지 않았습니다.' 
    });
  }

  try {
    console.log('OpenAI API로 요청 전송 중...');
    
    // 리더십 전문가 컨텍스트 추가
    const systemMessage = {
      role: "system", 
      content: "당신은 리더십 전문가입니다. 리더십과 조직 관리, 직원 관계에 대한 실용적이고 구체적인 조언을 한국어로 제공해주세요."
    };
    
    // OpenAI API 호출
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4",
      messages: [
        systemMessage,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('OpenAI API로부터 응답 수신');
    
    // 클라이언트에 응답 전송
    res.status(200).json({
      success: true,
      text: response.data.choices[0].message.content,
      data: response.data
    });
    
  } catch (error) {
    console.error('OpenAI API 오류:', error.response ? error.response.data : error.message);
    
    res.status(500).json({
      success: false,
      error: 'OpenAI API 호출 중 오류가 발생했습니다',
      details: error.response ? error.response.data : error.message
    });
  }
}; 