// dotenv 라이브러리를 불러와 환경 변수 로드
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 환경 변수 확인 API 엔드포인트
app.get('/check-env', (req, res) => {
  // 민감한 정보는 공개하지 않고 존재 여부만 확인
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  // 환경 변수 목록 (민감한 정보 제외)
  const safeEnvVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    // 필요한 다른 환경 변수들 추가
  };
  
  res.json({
    success: true,
    hasApiKey,
    nodeEnv: process.env.NODE_ENV || 'development',
    envVars: safeEnvVars
  });
});

// OpenAI API 테스트 엔드포인트
app.post('/test-openai', async (req, res) => {
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
    
    res.json({
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
});

// 서버 상태 확인 API 엔드포인트
app.get('/server-status', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API 엔드포인트: 챗봇 메시지 처리
app.post('/chat', async (req, res) => {
  console.log('server.js의 /chat 엔드포인트 호출됨');
  console.log('요청 헤더:', req.headers);
  console.log('요청 본문:', req.body);
  
  const { message } = req.body;
  
  if (!message) {
    console.error('메시지 누락됨');
    return res.status(400).json({ 
      success: false, 
      error: '요청에 메시지가 없습니다',
      details: { receivedBody: req.body }
    });
  }
  
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
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 300
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
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
      details: error.response ? error.response.data : { message: error.message }
    });
  }
});

// 홈페이지 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API 테스트 페이지 라우트
app.get('/api-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-test.html'));
});

// 새로운 간단한 API 테스트 페이지 라우트
app.get('/api-test-simple', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-test-simple.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다`);
  console.log(`웹 브라우저에서 http://localhost:${port} 로 접속하세요`);
  console.log(`API 테스트: http://localhost:${port}/api-test`);
  console.log(`간단한 API 테스트: http://localhost:${port}/api-test-simple`);
}); 