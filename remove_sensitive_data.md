# Git 기록에서 민감한 데이터 제거하기

GitHub에서 API 키와 같은 민감한 정보가 푸시를 차단하고 있어 이 문제를 해결하기 위한 단계입니다.

## 옵션 1: GitHub에서 제공하는 허용 URL 사용하기

푸시 결과에 나타난 URL을 브라우저에서 열어 해당 비밀을 허용하면, GitHub는 해당 API 키를 더 이상 차단하지 않습니다. 그러나 API 키가 이미 노출되었으므로 **API 키를 재생성하는 것이 좋습니다**.

## 옵션 2: Git 기록에서 민감한 데이터 완전히 제거하기

이 방법은 Git 기록에서 민감한 데이터를 완전히 제거하므로 보안 측면에서 더 좋은 방법입니다:

1. 먼저 모든 변경사항이 커밋되었는지 확인합니다:
   ```
   git status
   ```

2. BFG Repo-Cleaner를 사용하여 민감한 정보를 제거합니다:
   - [BFG Repo-Cleaner 다운로드](https://rtyley.github.io/bfg-repo-cleaner/)
   - 다운로드 후 다음 명령어를 실행합니다:
   ```
   java -jar bfg.jar --replace-text sensitive-patterns.txt 리포지토리_경로
   ```

3. 또는 git filter-repo 명령어를 사용할 수도 있습니다:
   ```
   pip install git-filter-repo
   git filter-repo --path .env --invert-paths
   ```

4. 강제로 원격 저장소에 푸시합니다:
   ```
   git push --force
   ```

## 옵션 3: 간단한 해결책 (새 저장소 시작)

가장 간단한 방법은 새 저장소를 만들고 현재 파일을 새 저장소로 푸시하는 것입니다:

1. GitHub에서 새 저장소를 생성합니다.
2. 현재 디렉토리의 .git 폴더를 삭제합니다:
   ```
   rm -rf .git
   ```
3. 새 Git 저장소를 초기화합니다:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   ```
4. 새 원격 저장소를 추가하고 푸시합니다:
   ```
   git remote add origin https://github.com/계정/새_저장소.git
   git push -u origin main
   ```

## 중요 주의사항

- API 키와 같은 민감한 정보가 Git 기록에 커밋된 경우, 해당 키를 재생성하는 것이 가장 안전합니다.
- 앞으로는 항상 `.gitignore`에 `.env` 파일을 포함시켜 민감한 정보가 실수로 커밋되지 않도록 하세요.
- 환경 변수를 사용하거나 안전한 비밀 관리 서비스를 이용하세요.
- 비밀 정보는 코드에 직접 포함시키지 마세요. 