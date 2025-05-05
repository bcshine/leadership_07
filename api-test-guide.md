# API 테스트 페이지 사용법

이 가이드는 API 테스트 페이지를 사용하여 Vercel 배포와 로컬 환경에서 OpenAI API 연결 문제를 진단하는 방법을 설명합니다.

## 1. 환경 설정하기

### 로컬에서 환경 변수 설정

1. 프로젝트 루트 디렉토리에 `.env` 파일을 만들고 다음 내용을 추가합니다:
   ```
   # OpenAI API 키 (필수)
   OPENAI_API_KEY=your_actual_openai_api_key_here
   
   # 서버 환경 설정
   NODE_ENV=development
   
   # 서버 포트 설정
   PORT=3000
   ```

2. `your_actual_openai_api_key_here` 부분을 실제 OpenAI API 키로 바꿔주세요.

## 2. 서버 실행하기

1. 프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다:
   ```bash
   npm install       # 필요한 패키지 설치 (처음 한 번만)
   npm run dev       # 개발 모드로 서버 실행
   ```

2. 서버가 성공적으로 시작되면 다음과 같은 메시지가 표시됩니다:
   ```
   서버가 포트 3000에서 실행 중입니다
   웹 브라우저에서 http://localhost:3000 로 접속하세요
   API 테스트: http://localhost:3000/api-test
   ```

## 3. API 테스트 페이지 사용하기

1. 웹 브라우저에서 http://localhost:3000/api-test 로 접속합니다.

2. API 테스트 페이지에서 다음 테스트를 실행할 수 있습니다:
   - **환경 변수 확인**: OpenAI API 키가 설정되어 있는지 확인합니다.
   - **OpenAI API 연결 테스트**: API 키를 사용하여 OpenAI API에 실제로 연결할 수 있는지 테스트합니다.
   - **서버 상태 확인**: 서버가 정상적으로 실행 중인지 확인합니다.

3. 각 테스트 버튼을 클릭하고 결과를 확인합니다.

## 4. 문제 해결

### API 키 오류

"API 키가 설정되지 않았습니다" 오류가 발생하는 경우:

1. `.env` 파일이 올바른 위치(프로젝트 루트 디렉토리)에 있는지 확인합니다.
2. `.env` 파일에 `OPENAI_API_KEY=your_api_key_here` 형식으로 API 키가 올바르게 작성되어 있는지 확인합니다.
3. 서버를 재시작하여 환경 변수가 다시 로드되도록 합니다.

### Vercel 배포 오류

Vercel 배포에서 API 키 오류가 발생하는 경우:

1. Vercel 대시보드에서 프로젝트의 환경 변수 설정으로 이동합니다.
2. `OPENAI_API_KEY` 환경 변수가 올바르게 설정되어 있는지 확인합니다.
3. 변경 후에는 프로젝트를 재배포해야 합니다.

자세한 Vercel 환경 변수 설정 방법은 `vercel-setup-guide.md` 파일을 참조하세요. 