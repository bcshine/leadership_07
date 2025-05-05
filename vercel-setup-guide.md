# Vercel 환경 변수 설정 가이드

이 가이드는 Vercel에서 프로젝트를 배포할 때 환경 변수를 올바르게 설정하는 방법을 안내합니다.

## 환경 변수 문제 해결

로컬에서는 작동하지만 Vercel 배포에서 API 키를 찾을 수 없는 경우 다음 단계를 확인하세요.

### 1. Vercel 프로젝트 설정에서 환경 변수 확인

1. [Vercel 대시보드](https://vercel.com/)에 로그인합니다.
2. 해당 프로젝트를 선택합니다.
3. `Settings` 탭을 클릭합니다.
4. 왼쪽 메뉴에서 `Environment Variables`를 선택합니다.
5. `OPENAI_API_KEY`가 올바르게 설정되어 있는지 확인합니다.

### 2. 환경 변수 추가 또는 수정

1. Vercel 대시보드에서 프로젝트의 환경 변수 설정으로 이동합니다.
2. `Add New` 버튼을 클릭합니다.
3. 다음과 같이 입력합니다:
   - `NAME`: `OPENAI_API_KEY`
   - `VALUE`: 실제 OpenAI API 키 값
4. 환경(`Environment`) 선택:
   - Production, Preview, Development 중 필요한 환경을 선택합니다.
   - 모든 환경에서 사용하려면 전부 선택합니다.
5. `Save` 버튼을 클릭합니다.

### 3. 재배포

환경 변수를 추가하거나 변경한 후 프로젝트를 재배포해야 합니다:

1. `Deployments` 탭으로 이동합니다.
2. 최근 배포를 선택하고 `Redeploy` 버튼을 클릭합니다.
3. 또는 새로운 커밋을 GitHub 저장소에 푸시하여 자동 배포를 트리거할 수 있습니다.

### 4. 로컬에서 테스트

로컬에서는 `.env` 파일을 사용하여 환경 변수를 설정합니다:

1. 프로젝트 루트 디렉토리에 `.env` 파일을 생성합니다.
2. `env-example.txt`의 내용을 복사하여 `.env` 파일에 붙여넣습니다.
3. `your_openai_api_key_here` 부분을 실제 OpenAI API 키로 바꿉니다.
4. 서버를 다시 시작합니다.

## 문제 진단을 위한 API 테스트 페이지 사용

이 프로젝트에는 API 연결 문제를 진단하기 위한 테스트 페이지가 포함되어 있습니다:

1. 웹 브라우저에서 `/api-test` 경로로 접속합니다.
   - 로컬: `http://localhost:3000/api-test`
   - Vercel: `https://your-project-url.vercel.app/api-test`
2. 각 테스트 버튼을 클릭하여 환경 변수, OpenAI API 연결, 서버 상태를 확인합니다.
3. 오류가 발생하면 표시된 오류 메시지를 확인하여 문제를 진단합니다.

## 추가 참고 사항

- Vercel은 환경 변수를 자동으로 서버리스 함수에 주입합니다.
- 환경 변수는 민감한 정보입니다. API 키를 GitHub에 커밋하지 마세요.
- 오류가 계속되면 Vercel의 [Function Logs](https://vercel.com/docs/concepts/observability/function-logs)를 확인하여 자세한 오류 정보를 볼 수 있습니다. 