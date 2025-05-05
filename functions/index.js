/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

// Google Gemini API 키
const GEMINI_API_KEY = "AIzaSyALAtfDLhrBb6SPpDwZoTtO2wUHi4vvgcA";

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Ping 함수 - 상태 확인용
exports.ping = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    response.status(200).json({ 
      success: true, 
      message: 'Firebase function is running correctly!' 
    });
  });
});

// Gemini API 호출 함수
exports.callGeminiApi = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        return response.status(405).json({
          success: false,
          error: 'Method Not Allowed'
        });
      }

      const { message } = request.body;
      
      if (!message) {
        return response.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      console.log('Calling Gemini API with message:', message);

      // v1beta에서 v1으로 API 경로 변경
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
      
      // 요청 페이로드 준비
      const payload = {
        contents: [{
          role: "user",
          parts: [{
            text: `당신은 리더십 전문가입니다. 다음 질문에 대해 한국어로 상세하고 실용적인 조언을 제공해주세요. 조직 관리, 팀 리더십, 직원 관계에 도움이 되는 구체적이고 단계적인 조언을 제공하세요.
                    
질문: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40
        }
      };

      // API 호출
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('API Error details:', errorText);
        throw new Error(`API 호출 실패: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      const data = await apiResponse.json();
      
      // 응답 텍스트 추출 - 최신 응답 형식에 맞게 수정
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        const responseText = data.candidates[0].content.parts[0].text;
        return response.status(200).json({ success: true, text: responseText });
      } else {
        console.error('Response format unexpected:', JSON.stringify(data));
        throw new Error('API 응답에서 텍스트를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return response.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });
});
