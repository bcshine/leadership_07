// OpenAI API 테스트 엔드포인트
const axios = require('axios');

module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
  
  console.log('API 테스트 요청 수신:', message);

  // API 키 확인
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
    return res.status(500).json({ 
      success: false, 
      error: 'API 키가 설정되지 않았습니다.' 
    });
  }

  try {
    console.log('OpenAI API 테스트 요청 전송 중...');
    
    // 간단한 테스트 메시지 생성
    const systemMessage = {
      role: "system", 
      content: "이것은 API 연결 테스트입니다. 짧게 응답해주세요."
    };
    
    // OpenAI API 호출
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4",
      messages: [
        systemMessage,
        { role: "user", content: message || "API 테스트입니다." }
      ],
      temperature: 0.7,
      max_tokens: 50  // 테스트용 짧은 응답
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('OpenAI API 테스트 응답 수신');
    
    res.status(200).json({
      success: true,
      text: response.data.choices[0].message.content,
      data: response.data
    });
    
  } catch (error) {
    console.error('OpenAI API 테스트 오류:', error.response ? error.response.data : error.message);
    
    // 오류 응답에 상세 정보 추가
    res.status(500).json({
      success: false,
      error: 'OpenAI API 호출 테스트 중 오류가 발생했습니다',
      details: error.response ? error.response.data : error.message
    });
  }
}; 