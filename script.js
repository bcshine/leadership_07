// Vercel API 설정
// 상대 경로를 사용하도록 변경
// const VERCEL_API_URL = "http://localhost:3000"; // 더 이상 사용하지 않음
const VERCEL_API_KEY = "YOUR_VERCEL_API_KEY";
const GEMINI_API_KEY = "AIzaSyALAtfDLhrBb6SPpDwZoTtO2wUHi4vvgcA";

// Vercel 환경 감지 및 API 경로 설정
function isVercelProduction() {
    // Vercel 프로덕션 환경에서는 hostname에 vercel.app이 포함됨
    return window.location.hostname.includes('vercel.app');
}

// API 경로를 가져오는 함수
function getApiPath(endpoint) {
    // Vercel 프로덕션 환경에서는 /api 접두사를 추가
    const isVercel = isVercelProduction();
    return isVercel ? `/api${endpoint}` : endpoint;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded, initializing scripts...');
    
    // 요소 참조
    const elements = {
        chatbotBtn: document.getElementById('chatbot-btn'),
        floatingChatBtn: document.querySelector('.floating-chat-btn'),
        chatbotContainer: document.getElementById('chatbot-container'),
        closeChatBtn: document.getElementById('close-chat-btn'),
        userInput: document.getElementById('user-input'),
        sendBtn: document.getElementById('send-btn'),
        chatMessages: document.querySelector('.chat-messages'),
        showConcernsBtn: document.getElementById('show-concerns-btn'),
        menuToggle: document.querySelector('.menu-toggle'),
        navMenu: document.querySelector('.nav-menu')
    };
    
    // UI 이벤트 초기화
    initUIEvents();
    
    // 챗봇 초기화
    initChatbot();
    
    // 페이지 효과 초기화
    initPageEffects();
    
    // 리더십 테스트 초기화
    initLeadershipTest();
    
    // 직원 스타일 초기화
    initEmployeeStyles();
    
    // UI 이벤트 초기화 함수
    function initUIEvents() {
        // 모바일 메뉴 토글
        if (elements.menuToggle && elements.navMenu) {
            elements.menuToggle.addEventListener('click', function() {
                elements.navMenu.classList.toggle('active');
            });
            
            // 네비게이션 메뉴 항목 클릭 시 모바일 메뉴 닫기
            const navLinks = document.querySelectorAll('.nav-menu a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 992) {
                        elements.navMenu.classList.remove('active');
                    }
                });
            });
        }
        
        // 스크롤 이벤트 - 네비게이션 메뉴 활성화
        window.addEventListener('scroll', function() {
            const sections = document.querySelectorAll('.section');
            const navItems = document.querySelectorAll('.nav-menu a');
            
            let currentSection = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 200) {
                    currentSection = section.getAttribute('id');
                }
            });
            
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href').substring(1) === currentSection) {
                    item.classList.add('active');
                }
            });
        });
    }
    
    // 페이지 효과 초기화
    function initPageEffects() {
        // 페이드인 애니메이션
        const fadeElements = document.querySelectorAll('.fade-in');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });
        
        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // 챗봇 초기화 함수
    function initChatbot() {
        console.log('Initializing chatbot components...');
        
        if (elements.chatbotBtn) {
            elements.chatbotBtn.addEventListener('click', openChatbot);
        }
        
        if (elements.floatingChatBtn) {
            elements.floatingChatBtn.addEventListener('click', openChatbot);
        }
        
        if (elements.closeChatBtn) {
            elements.closeChatBtn.addEventListener('click', closeChatbot);
        }
        
        if (elements.sendBtn) {
            elements.sendBtn.addEventListener('click', sendMessage);
        }
        
        if (elements.userInput) {
            elements.userInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                    e.preventDefault();
                }
            });
        }
        
        if (elements.showConcernsBtn) {
            elements.showConcernsBtn.addEventListener('click', showConcernSelector);
        }
        
        // 리더십 고민 버튼 초기화
        initConcernButtons();
    }
    
    // 챗봇 열기
    function openChatbot() {
        console.log('Opening chatbot');
        if (!elements.chatbotContainer) return;
        
        elements.chatbotContainer.classList.add('visible');
        
        // 챗봇이 열린 후 버튼 초기화 재실행
        setTimeout(() => {
            initConcernButtons();
            
            // 포커스 설정
            if (elements.userInput) {
                elements.userInput.focus();
            }
        }, 300);
    }
    
    // 챗봇 닫기
    function closeChatbot() {
        if (!elements.chatbotContainer) return;
        elements.chatbotContainer.classList.remove('visible');
    }
    
    // 메시지 전송 함수
    function sendMessage() {
        const message = elements.userInput.value.trim();
        if (message === '') return;
        
        // 사용자 메시지 추가
        addMessage(message, 'user');
        elements.userInput.value = '';
        
        // 로딩 메시지 표시
        const loadingMsg = addMessage('응답을 생성 중입니다...', 'bot');
        
        // Vercel 서버로 사용자 입력 전송
        sendToVercelServer(message)
            .then(response => {
                // 서버로부터 받은 응답 표시
                loadingMsg.textContent = response;
                
                setTimeout(() => {
                    addMessage("더 구체적인 도움이 필요하시면 아래 \"다른 고민 보기\" 버튼을 눌러 주요 고민 사항을 선택해주세요.", 'bot');
                }, 1000);
            })
            .catch(error => {
                console.error('응답 처리 오류:', error);
                loadingMsg.textContent = '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
                
                setTimeout(() => {
                    addMessage("더 구체적인 도움이 필요하시면 아래 \"다른 고민 보기\" 버튼을 눌러 주요 고민 사항을 선택해주세요.", 'bot');
                }, 1000);
            });
    }
    
    // Vercel 서버에 메시지 전송 함수
    async function sendToVercelServer(message) {
        console.log('서버로 메시지 전송:', message);
        
        try {
            // 현재 웹사이트 도메인 기반으로 API URL 설정
            // 이렇게 하면 어떤 환경(로컬호스트, Vercel 등)에서도 현재 도메인을 기준으로 요청이 전송됨
            const baseUrl = window.location.origin;
            const chatEndpoint = getApiPath('/chat'); // API 경로 설정
            const apiUrl = `${baseUrl}${chatEndpoint}`;
            
            console.log('API 요청 URL:', apiUrl);
            
            // 페이로드 준비 - 서버에서 필요로 하는 형식으로 구성
            const payload = {
                message: message // 서버는 이 메시지를 받아 OpenAI에 전달합니다
            };
            
            // 서버 API 호출
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`API 호출 실패: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.text) {
                console.log('OpenAI로부터 응답 수신:', data.text.substring(0, 50) + '...');
                return data.text;
            } else {
                console.error('서버 응답 형식 오류:', data);
                throw new Error('API 응답에서 텍스트를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('서버 API 호출 오류:', error);
            return fallbackToLocalResponse(message);
        }
    }
    
    // 메시지 추가 함수
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        elements.chatMessages.appendChild(messageDiv);
        
        // 스크롤 아래로
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        
        return messageDiv;
    }
    
    // 키워드 기반 응답 로직
    const botResponses = {
        '팀원 갈등': '팀원 간 갈등이 있을 때는 각자의 입장을 공감하고 중립적인 자세로 대화를 촉진하세요. 공통된 목표를 상기시키는 것도 효과적입니다.\n\n갈등 해결을 위한 단계별 접근법:\n1. 양측의 입장을 개별적으로 듣고 이해합니다.\n2. 감정이 가라앉을 시간을 준 후 중립적인 장소에서 대화 자리를 마련합니다.\n3. 대화 규칙을 명확히 합니다(상대방 말 끊지 않기, 인신공격 금지 등).\n4. 문제에 집중하고 사람에 집중하지 않도록 안내합니다.\n5. 서로의 공통 목표와 팀 전체의 목표를 상기시켜 협력의 중요성을 강조합니다.\n6. 구체적인 해결책과 후속 조치를 합의하고 문서화합니다.',
        
        '업무 과부하': '업무 과부하 상황에서는 우선순위를 명확히 하고, 불필요한 업무는 과감히 줄이세요. 팀원들에게 권한을 위임하는 것도 중요합니다.\n\n효과적인 업무 과부하 관리 방법:\n1. 아이젠하워 매트릭스(중요도와 긴급성)를 활용해 모든 업무를 분류하세요.\n2. "중요하고 긴급한" 일에 집중하고, "중요하지 않고 긴급하지 않은" 일은 과감히 제거하세요.\n3. 위임 가능한 업무를 파악하고 적합한 팀원에게 권한과 함께 위임하세요.\n4. 정기적인 업무 검토를 통해 불필요한 회의나 보고 과정을 줄이세요.\n5. "아니오"라고 말하는 연습을 하세요. 핵심 업무에 집중하기 위해 모든 요청을 수락할 필요는 없습니다.\n6. 업무 시간을 블록 단위로 관리하고, 집중 작업 시간과 의사소통 시간을 구분하세요.',
        
        '동기부여': '직원들의 동기부여를 위해서는 내적 동기와 외적 동기를 모두 고려해야 합니다.\n\n효과적인 동기부여 전략:\n1. 직원의 개인적 목표와 조직의 목표를 연결시켜 의미 있는 일을 하고 있다는 느낌을 주세요.\n2. 자율성을 부여하세요. 목표는 제시하되, 방법은 직원이 스스로 선택할 수 있게 하세요.\n3. 성장 기회를 제공하세요. 새로운 기술을 배우고 역량을 개발할 수 있는 기회는 강력한 동기 부여 요소입니다.\n4. 정기적으로 구체적인 피드백을 제공하세요. 잘한 일에 대해 즉각적으로 인정하고, 개선이 필요한 부분은 건설적으로 조언하세요.\n5. 공정한 보상 시스템을 구축하세요. 성과에 따른 인센티브는 중요하지만, 기본적으로 공정하게 대우받고 있다는 느낌이 더 중요합니다.\n6. 팀의 성과와 개인의 기여를 연결시켜 인식할 수 있게 해주세요.',
        
        '피드백': '효과적인 피드백은 구체적이고, 적시에 이루어지며, 행동에 초점을 맞춰야 합니다.\n\n효과적인 피드백 제공 방법:\n1. SBI 모델을 활용하세요: 상황(Situation) - 행동(Behavior) - 영향(Impact)의 순서로 구성합니다.\n2. 칭찬은 공개적으로, 비판은 개인적으로 하는 것이 좋습니다.\n3. 비판적 피드백 전에 자기 평가 기회를 제공하세요. "이 프로젝트에서 어떤 부분이 잘 진행되었고, 어떤 부분을 개선하고 싶나요?"\n4. 구체적인 행동에 초점을 맞추고 성격이나 특성에 대한 언급은 피하세요.\n5. 개선을 위한 구체적인 제안이나 지원 방안을 함께 제시하세요.\n6. 피드백 후에는 후속 조치와 지원을 제공하고, 개선 상황을 모니터링하세요.\n7. 정기적인 피드백 세션을 마련하여 피드백이 일상적인 과정으로 자리잡게 하세요.',
        
        '의사결정': '효과적인 의사결정을 위해서는 다양한 관점을 고려하고, 데이터에 기반한 접근이 필요합니다.\n\n의사결정 개선 방법:\n1. 의사결정의 목적과 성공 기준을 명확히 설정하세요.\n2. 가능한 많은 정보와 데이터를 수집하되, 분석 마비에 빠지지 않도록 주의하세요.\n3. 다양한 대안을 생각해보고, 각 대안의 장단점을 비교 분석하세요.\n4. 중요한 결정일수록 다양한 관점을 청취하되, 최종 결정의 책임은 리더가 져야 합니다.\n5. 결정 후에는 팀에게 명확히 커뮤니케이션하고, 필요시 추가 설명을 제공하세요.\n6. 결정 사항을 실행한 후 결과를 추적하고 필요시 조정하세요.\n7. 과거 의사결정을 분석하여 교훈을 도출하고 의사결정 프로세스를 지속적으로 개선하세요.',
        
        '위임': '효과적인 업무 위임은 팀원의 성장과 리더의 업무 효율성을 모두 높이는 핵심 기술입니다.\n\n성공적인 위임을 위한 팁:\n1. 위임할 업무와 유지할 업무를 구분하세요. 전략적 의사결정, 고위험 업무, 기밀 사항 등은 직접 처리하는 것이 좋습니다.\n2. 적합한 사람에게 업무를 위임하세요. 팀원의 스킬, 경험, 성장 가능성, 업무량 등을 고려하세요.\n3. 결과물에 대한 기대치와 마감일을 명확하게 전달하세요.\n4. 권한도 함께 위임하세요. 업무 수행에 필요한 결정권과 자원에 대한 접근 권한을 제공하세요.\n5. 위임 후 적절한 수준의 점검과 지원을 제공하되, 마이크로매니징은 피하세요.\n6. 업무 완료 후 피드백과 인정을 제공하고, 위임 과정에서 배운 점을 기록하세요.\n7. 위임은 단순히 업무 이전이 아닌 코칭과 개발의 기회로 생각하세요.',
        
        '리더십 스타일': '상황과 팀원에 따라 다양한 리더십 스타일을 유연하게 적용하는 것이 효과적입니다.\n\n주요 리더십 스타일과 적용 상황:\n1. 지시적 리더십: 위기 상황이나 초보자 팀원 지도 시 명확한 방향과 구체적 지침이 필요할 때 적합합니다.\n2. 코칭형 리더십: 직원의 역량 개발과 성장이 필요할 때, 질문과 가이드를 통해 스스로 해결책을 찾도록 돕습니다.\n3. 민주적 리더십: 팀의 의견과 아이디어가 중요한 의사결정이나 변화 관리 시 적합합니다.\n4. 관계 중심 리더십: 팀 결속력 강화와 긍정적 팀 문화 구축이 필요할 때 효과적입니다.\n5. 성과 중심 리더십: 명확한 목표와 책임을 설정하고, 성과에 따른 인정과 보상을 제공합니다.\n6. 상황적 리더십: 팀원의 역량과 상황에 따라 지시, 코칭, 지원, 위임 등의 스타일을 유연하게 전환합니다.\n\n자신의 기본 리더십 스타일을 파악하고, 다양한 스타일을 상황에 맞게 활용하는 능력을 개발하세요.',
        
        '팀 구축': '효과적인 팀 구축은 리더십의 핵심 과제입니다.\n\n강력한 팀 구축을 위한 전략:\n1. 명확한 목표와 비전을 공유하세요. 팀의 방향성이 모두에게 이해되고 받아들여져야 합니다.\n2. 역할과 책임을 명확히 정의하세요. 모든 팀원이 자신의 역할과 기여를 이해해야 합니다.\n3. 다양한 관점과 스킬 세트를 갖춘 팀을 구성하세요. 다양성은 창의적 문제 해결의 원천입니다.\n4. 심리적 안정감을 조성하세요. 모든 의견이 환영받고 실수가 학습의 기회로 여겨지는 환경을 만드세요.\n5. 효과적인 의사소통 채널과 프로세스를 구축하세요. 투명한 정보 공유가 중요합니다.\n6. 정기적인 팀 활동과 성공 축하를 통해 팀 결속력을 강화하세요.\n7. 갈등을 건설적으로 관리하세요. 건강한 토론은 장려하되, 파괴적 갈등은 조기에 해결하세요.\n8. 지속적인 피드백과 개선의 문화를 조성하세요. 팀의 작업 방식을 정기적으로 검토하고 개선하세요.',
        
        '변화 관리': '조직 변화를 효과적으로 이끌기 위해서는 체계적인 접근과 강한 커뮤니케이션이 필요합니다.\n\n변화 관리를 위한 핵심 단계:\n1. 변화의 필요성을 명확히 설명하세요. 왜 변화가 필요한지, 어떤 문제를 해결하고자 하는지 공유하세요.\n2. 변화 후의 비전을 구체적으로 제시하세요. 변화가 가져올 긍정적 영향을 설명하세요.\n3. 변화에 영향을 받는 모든 이해관계자를 파악하고, 그들의 우려사항을 미리 예측하세요.\n4. 강력한 변화 추진 팀을 구성하고, 초기 성공 사례를 만들어내세요.\n5. 지속적이고 투명한 커뮤니케이션을 유지하세요. 동일한 메시지를 다양한 채널을 통해 반복적으로 전달하세요.\n6. 단기적 성과를 창출하고 이를 가시화하세요. 작은 성공이 모멘텀을 유지합니다.\n7. 변화에 기여한 사람들을 인정하고 보상하세요.\n8. 변화가 조직 문화에 완전히 통합될 때까지 지속적으로 강화하세요.\n9. 저항은 자연스러운 것으로 받아들이고, 공감과 이해를 바탕으로 대응하세요.',
        
        '시간 관리': '리더의 시간 관리는 개인 생산성과 팀 효율성에 직접적인 영향을 미칩니다.\n\n리더를 위한 시간 관리 전략:\n1. 중요한 일과 긴급한 일을 구분하세요. 긴급하지 않지만 중요한 일(전략 수립, 관계 구축, 자기 개발 등)에 충분한 시간을 투자하세요.\n2. 주간 및 일일 계획을 수립하고, 가장 중요한 3-5개 업무에 집중하세요.\n3. 에너지 수준에 맞춰 업무를 배치하세요. 집중력이 높은 시간대에 창의적이고 복잡한 업무를 처리하세요.\n4. 시간 블록킹을 활용하세요. 방해 없이 집중할 수 있는 시간대를 미리 확보하세요.\n5. 회의는 목적과 안건이 명확할 때만 진행하고, 시간 제한을 엄격히 지키세요.\n6. 위임할 수 있는 업무는 적극적으로 위임하세요.\n7. 이메일과 메시지 확인 시간을 정해두고, 끊임없는 알림에 반응하지 마세요.\n8. \"노\"라고 말하는 법을 배우세요. 모든 요청을 수용할 수는 없습니다.\n9. 정기적으로 시간 사용을 분석하고, 개선점을 찾으세요.',
        
        '말대꾸': '직원이 말대꾸할 때는 침착함을 유지하고 상황을 건설적으로 다루는 것이 중요합니다.\n\n효과적인 대처 방법:\n\n1. 감정적으로 반응하지 말고 침착하게 대응하세요. 깊게 호흡하고 감정을 가라앉힌 후 대화하세요.\n\n2. 공개적인 장소보다는 개인적인 공간에서 대화하여 직원의 자존심을 지켜주세요.\n\n3. 적극적으로 경청하고, 직원의 관점을 이해하려고 노력하세요. "왜 그렇게 생각하는지 더 설명해줄 수 있나요?"\n\n4. 문제 행동과 그 영향을 구체적으로 설명하세요. "회의 중 이런 방식으로 말하면 다른 팀원들의 의견 개진이 어려워집니다."\n\n5. 명확한 기대치와 경계를 설정하세요. "의견 차이는 환영하지만, 상호 존중하는 방식으로 표현해야 합니다."\n\n6. 건설적인 피드백을 제공하고 대안적 의사소통 방법을 제안하세요.\n\n7. 반복되는 문제일 경우, 공식적인 경고와 개선 계획을 수립하고 진행 상황을 모니터링하세요.',
        
        '반항': '직원이 말대꾸할 때는 침착함을 유지하고 상황을 건설적으로 다루는 것이 중요합니다.\n\n효과적인 대처 방법:\n\n1. 감정적으로 반응하지 말고 침착하게 대응하세요. 깊게 호흡하고 감정을 가라앉힌 후 대화하세요.\n\n2. 공개적인 장소보다는 개인적인 공간에서 대화하여 직원의 자존심을 지켜주세요.\n\n3. 적극적으로 경청하고, 직원의 관점을 이해하려고 노력하세요. "왜 그렇게 생각하는지 더 설명해줄 수 있나요?"\n\n4. 문제 행동과 그 영향을 구체적으로 설명하세요. "회의 중 이런 방식으로 말하면 다른 팀원들의 의견 개진이 어려워집니다."\n\n5. 명확한 기대치와 경계를 설정하세요. "의견 차이는 환영하지만, 상호 존중하는 방식으로 표현해야 합니다."\n\n6. 건설적인 피드백을 제공하고 대안적 의사소통 방법을 제안하세요.\n\n7. 반복되는 문제일 경우, 공식적인 경고와 개선 계획을 수립하고 진행 상황을 모니터링하세요.'
    };

    // 로컬 응답으로 대체하는 함수
    function fallbackToLocalResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // 키워드 검색 함수
        function containsAny(text, keywords) {
            return keywords.some(keyword => text.includes(keyword));
        }
        
        // 키워드 기반 응답 매칭
        if (containsAny(lowerMessage, ['말대꾸', '반항', '존중', '무시'])) {
            return botResponses['말대꾸'];
        }
        
        if (containsAny(lowerMessage, ['갈등', '다툼', '싸움', '불화', '의견 충돌', '대립'])) {
            return botResponses['팀원 갈등'];
        }
        
        if (containsAny(lowerMessage, ['과부하', '일이 많', '업무 부담', '과로', '스트레스'])) {
            return botResponses['업무 과부하'];
        }
        
        if (containsAny(lowerMessage, ['동기', '의욕', '열정', '무기력', '태도', '성과', '노력'])) {
            return botResponses['동기부여'];
        }
        
        if (containsAny(lowerMessage, ['피드백', '평가', '면담', '코칭', '조언', '개선', '성장'])) {
            return botResponses['피드백'];
        }
        
        if (containsAny(lowerMessage, ['의사결정', '결정', '판단', '선택', '문제 해결'])) {
            return botResponses['의사결정'];
        }
        
        if (containsAny(lowerMessage, ['위임', '권한', '맡기', '책임', '업무 분담'])) {
            return botResponses['위임'];
        }
        
        if (containsAny(lowerMessage, ['리더십 스타일', '리더 유형', '어떤 리더', '리더십 방식'])) {
            return botResponses['리더십 스타일'];
        }
        
        if (containsAny(lowerMessage, ['팀 구축', '팀 빌딩', '팀워크', '협력', '화합', '조직 문화'])) {
            return botResponses['팀 구축'];
        }
        
        if (containsAny(lowerMessage, ['변화 관리', '혁신', '개혁', '변화', '저항', '적응'])) {
            return botResponses['변화 관리'];
        }
        
        if (containsAny(lowerMessage, ['시간 관리', '우선순위', '효율', '생산성', '일정'])) {
            return botResponses['시간 관리'];
        }
        
        // 추가 주제에 대한 응답
        if (containsAny(lowerMessage, ['채용', '인재', '뽑', '면접', '인재 채용'])) {
            return "성공적인 인재 채용과 유지를 위한 조언:\n\n1. 명확한 직무 기술서를 작성하세요. 기술적 요구사항뿐 아니라 회사 문화와의 적합성도 고려해야 합니다.\n\n2. 구조화된 면접 프로세스를 설계하세요. 모든 지원자에게 동일한 질문을 하고, 답변을 일관된 기준으로 평가합니다.\n\n3. 기술적 역량뿐 아니라 문제 해결 능력, 학습 태도, 팀 협업 능력 등 소프트 스킬도 평가하세요.";
        }
        
        if (containsAny(lowerMessage, ['원격', '재택', '하이브리드', '원격 근무'])) {
            return "효과적인 원격/하이브리드 팀 관리 방법:\n\n1. 명확한 커뮤니케이션 채널과 프로토콜을 수립하세요. 어떤 도구를 사용할지, 얼마나 자주 소통할지, 어떤 정보를 어디에 공유할지 등의 기준을 명확히 합니다.\n\n2. 결과 중심의 업무 관리를 도입하세요. 출근 시간이나 업무 과정보다 달성한 목표와 결과물에 집중합니다.";
        }
        
        if (containsAny(lowerMessage, ['세대', '밀레니얼', 'MZ', '젊은 직원'])) {
            return "다양한 세대 간 효과적인 리더십 발휘 방법:\n\n1. 각 세대의 특성과 가치관을 이해하고 존중하세요. 모든 세대는 서로 다른 배경과 경험을 가지고 있습니다.\n\n2. 의사소통 방식을 유연하게 조정하세요. 기성세대는 대면 소통이나 이메일을, MZ세대는 메신저나 협업 도구를 선호할 수 있습니다.";
        }
        
        // 일반 응답 - 여전히 매칭이 안 됐을 때
        return "리더십에 관한 질문을 해주시면 도움을 드릴 수 있습니다. 예를 들어 '직원 동기부여 방법', '팀원 갈등 해결', '효과적인 피드백' 등에 대해 질문해주세요.\n\n리더십에 관한 일반적인 조언을 드리자면:\n\n1. 효과적인 리더십의 핵심은 명확한 방향 제시와 일관된 커뮤니케이션입니다.\n\n2. 팀원들의 강점을 파악하고 이를 활용할 수 있는 업무 배치가 중요합니다.";
    }
    
    // 리더십 고민 데이터
    const leadershipConcerns = {
        "1": {
            "title": "직원이 알아서 움직이지 않아요",
            "sympathy": "많은 사장님들이 '지시를 해야만 움직이는 직원'에 대해 고민하십니다.",
            "advice": "직원의 자율성을 키우려면 처음에는 명확한 업무 프로세스를 문서화하고, 점차 결정 권한을 부여하며 성장 기회를 제공하는 게 중요합니다.",
            "options": [
                { "text": "어떻게 업무 프로세스를 문서화할 수 있을까요?", "value": "process_docs" },
                { "text": "자발성이 부족한 직원을 어떻게 동기부여할 수 있나요?", "value": "motivation" }
            ]
        },
        "2": {
            "title": "직원이 솔직하게 말하지 않고 눈치만 봐요",
            "sympathy": "솔직한 의견을 말하지 않고 눈치만 보는 문화는 많은 기업에서 발생하는 고민이에요.",
            "advice": "심리적 안정감을 만드는 것이 중요합니다. 의견을 말해도 불이익이 없고 오히려 인정받는 환경을 조성하고, 사장님이 먼저 솔직함과 취약점을 보여주세요.",
            "options": [
                { "text": "정기적인 1:1 면담을 어떻게 진행하면 좋을까요?", "value": "one_on_one" },
                { "text": "직원들이 더 솔직해질 수 있는 회의 방법이 있을까요?", "value": "honest_meetings" }
            ]
        },
        "3": {
            "title": "나를 상사로 존중하지 않는 것 같아요",
            "sympathy": "리더로서 존중받지 못한다고 느낄 때 정말 답답하고 어렵죠.",
            "advice": "존중은 지위가 아닌 행동에서 나옵니다. 전문성을 키우고, 약속을 지키며, 일관된 원칙을 보여주세요. 그리고 직원들에게 먼저 진심 어린 존중을 보여주는 것이 중요합니다.",
            "options": [
                { "text": "권위를 세우면서도 친근함을 유지하는 방법이 있을까요?", "value": "authority_balance" },
                { "text": "특정 직원이 반항적일 때 어떻게 대처해야 할까요?", "value": "rebellious_employee" }
            ]
        },
        "4": {
            "title": "직원 관리에 너무 많은 에너지를 씁니다",
            "sympathy": "사장님께서 직원 관리에 많은 에너지를 쏟고 계시는군요. 정말 힘드시겠습니다.",
            "advice": "관리 시스템을 구축하고 권한 위임을 통해 에너지 소모를 줄일 수 있습니다. 모든 것을 직접 관리하기보다 핵심 지표 중심으로 관리하고, 팀장급 인재를 발굴하여 중간 관리를 맡기세요.",
            "options": [
                { "text": "효과적인 권한 위임 방법을 알려주세요", "value": "delegation" },
                { "text": "직원 관리를 시스템화하는 방법이 궁금합니다", "value": "management_system" }
            ]
        },
        "5": {
            "title": "좋은 직원을 뽑고 유지하는 게 힘들어요",
            "sympathy": "좋은 인재 채용과 유지는 많은 사업주들의 가장 큰 고민 중 하나입니다.",
            "advice": "채용 시 스킬보다 태도와 가치관 일치를 우선시하고, 직원이 성장할 수 있는 환경과 공정한 보상 체계를 갖추는 것이 중요합니다. 또한 명확한 기대치와 피드백 제공이 필수적입니다.",
            "options": [
                { "text": "효과적인 채용 면접 방법이 궁금합니다", "value": "interview_tips" },
                { "text": "우수 직원을 유지하는 방법을 더 알고 싶어요", "value": "retention" }
            ]
        },
        "6": {
            "title": "중요한 일을 맡기기가 불안해요",
            "sympathy": "중요한 업무를 위임하는 것이 불안한 마음, 충분히 이해됩니다.",
            "advice": "단계별로 책임을 맡기고, 명확한 체크포인트를 만드세요. 처음에는 작은 권한부터 시작해 점차 확대하고, 실패해도 배움의 기회로 삼는 문화를 만드는 것이 중요합니다.",
            "options": [
                { "text": "권한 위임의 단계적 접근법을 더 알려주세요", "value": "delegation_steps" },
                { "text": "중요 업무의 리스크 관리 방법이 궁금합니다", "value": "risk_management" }
            ]
        },
        "7": {
            "title": "직원들끼리 갈등이 생기면 해결이 어렵습니다",
            "sympathy": "팀 내 갈등은 매우 에너지 소모적이고 해결하기 어려운 문제죠.",
            "advice": "조기에 개입하되, 당사자들이 스스로 해결책을 찾도록 유도하세요. 각자의 입장을 충분히 듣고, 공통 목표를 상기시키며, 갈등 해결의 명확한 프로세스를 만드는 것이 중요합니다.",
            "options": [
                { "text": "갈등 중재 대화를 어떻게 이끌어야 할까요?", "value": "conflict_mediation" },
                { "text": "반복되는 갈등을 예방하는 방법이 있을까요?", "value": "conflict_prevention" }
            ]
        },
        "8": {
            "title": "가끔 '내 리더십이 맞는 건가' 회의감이 듭니다",
            "sympathy": "리더십에 대한 회의감은 좋은 리더일수록 더 자주 경험하는 자연스러운 감정입니다.",
            "advice": "자신의 리더십 스타일을 이해하고, 강점에 집중하면서 약점은 보완하세요. 정기적으로 피드백을 수집하고, 멘토나 동료 사업주와의 대화를 통해 고립감을 줄이는 것이 도움됩니다.",
            "options": [
                { "text": "나에게 맞는 리더십 스타일을 찾고 싶어요", "value": "leadership_style" },
                { "text": "리더십 자신감을 키우는 방법이 궁금합니다", "value": "leadership_confidence" }
            ]
        }
    };
    
    // 전역 범위에서 접근 가능하도록 설정
    window.leadershipConcerns = leadershipConcerns;
    
    // 고민 버튼 초기화
    function initConcernButtons() {
        const concernButtons = document.querySelectorAll('.concern-btn');
        concernButtons.forEach(button => {
            button.removeEventListener('click', concernButtonClickHandler);
            button.addEventListener('click', concernButtonClickHandler);
        });
    }
    
    // 고민 버튼 클릭 핸들러
    function concernButtonClickHandler() {
        const concernId = this.getAttribute('data-concern');
        handleConcernSelection(concernId);
    }
    
    // 고민 선택 처리
    function handleConcernSelection(concernId) {
        const concern = leadershipConcerns[concernId];
        if (!concern) return;
        
        // 사용자 선택 메시지 추가
        addMessage(concern.title, 'user');
        
        // 봇 응답 메시지 추가
        setTimeout(() => {
            addMessage(concern.sympathy, 'bot');
            
            setTimeout(() => {
                addMessage(concern.advice, 'bot');
                
                // 추가 옵션 버튼 표시
                if (concern.options && concern.options.length > 0) {
                    setTimeout(() => {
                        addOptionButtons(concern.options);
                    }, 500);
                }
            }, 1000);
        }, 500);
    }
    
    // 옵션 버튼 추가
    function addOptionButtons(options) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'message bot';
        
        const question = document.createElement('p');
        question.textContent = '더 구체적인 방법을 알고 싶으신가요?';
        optionsDiv.appendChild(question);
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'chat-options';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'chat-option-btn';
            button.textContent = option.text;
            button.setAttribute('data-value', option.value);
            
            button.onclick = function() {
                handleOptionSelection(option.value, option.text);
            };
            
            buttonsDiv.appendChild(button);
        });
        
        // "아니요" 옵션 추가
        const noButton = document.createElement('button');
        noButton.className = 'chat-option-btn';
        noButton.textContent = '아니요, 충분합니다';
        
        noButton.onclick = function() {
            addMessage('아니요, 충분합니다', 'user');
            setTimeout(() => {
                addMessage("네, 다른 고민이 있으시면 언제든 \"다른 고민 보기\" 버튼을 눌러주세요!", 'bot');
            }, 500);
        };
        
        buttonsDiv.appendChild(noButton);
        optionsDiv.appendChild(buttonsDiv);
        elements.chatMessages.appendChild(optionsDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
    
    // 옵션 선택 처리
    function handleOptionSelection(optionValue, optionText) {
        // 사용자 선택 메시지 추가
        addMessage(optionText, 'user');
        
        // 로딩 메시지 표시
        const loadingMessage = addMessage('답변을 생성하고 있습니다...', 'bot');
        
        // 서버로 사용자 선택 전송 (상대 경로 사용)
        sendToVercelServer(optionText)
            .then(response => {
                loadingMessage.textContent = response;
                
                setTimeout(() => {
                    addMessage("더 궁금하신 점이 있으면 언제든지 질문해주세요.", 'bot');
                }, 1000);
            })
            .catch(error => {
                console.error('API 응답 처리 오류:', error);
                loadingMessage.textContent = '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
                
                setTimeout(() => {
                    addMessage("더 궁금하신 점이 있으면 언제든지 질문해주세요.", 'bot');
                }, 1000);
            });
    }
    
    // 고민 선택기 보여주기
    function showConcernSelector() {
        // 이미 있는 고민 선택기를 제거
        const existingSelectors = document.querySelectorAll('.message.bot.concern-selector');
        existingSelectors.forEach(selector => {
            if (selector.parentNode) {
                selector.parentNode.removeChild(selector);
            }
        });
        
        // 동적으로 버튼 HTML 생성
        let buttonsHtml = '';
        for (const id in leadershipConcerns) {
            buttonsHtml += `<button class="concern-btn" data-concern="${id}">${leadershipConcerns[id].title}</button>`;
        }
        
        const selectorHtml = `
            <div class="message bot concern-selector">
                <p>직원과 관련해 가장 공감되는 고민을 골라주세요.</p>
                <div class="concern-buttons">
                    ${buttonsHtml}
                </div>
            </div>
        `;
        
        // 새로운 고민 선택기 추가
        elements.chatMessages.insertAdjacentHTML('beforeend', selectorHtml);
        
        // 스크롤 아래로
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        
        // 이벤트 리스너 추가
        initConcernButtons();
    }
    
    // 리더십 테스트 초기화
    function initLeadershipTest() {
        const leadershipTestBtn = document.getElementById('leadership-test-btn');
        const leadershipTest = document.getElementById('leadership-test');
        const leadershipResult = document.getElementById('leadership-result');
        
        // 리더십 테스트 문항
        const questions = [
            {
                question: "1. 팀원이 실수를 했을 때 나는 가장 먼저 이렇게 반응한다.",
                options: [
                    "\"괜찮아, 다시 할 수 있어.\"",
                    "\"어디서 문제가 생겼는지 세밀히 분석한다.\"",
                    "\"실수를 성장 기회로 삼게 격려한다.\"",
                    "\"다음부터 이런 실수가 없게 명확한 지침을 준다.\""
                ]
            },
            {
                question: "2. 프로젝트를 시작할 때 나는 가장 중요하게 여기는 것은?",
                options: [
                    "팀원 각자의 상황과 마음을 살핀다.",
                    "완성도 높은 결과물을 계획한다.",
                    "팀원 개개인의 성장을 염두에 둔다.",
                    "목표 달성을 위한 명확한 역할과 일정을 설정한다."
                ]
            },
            {
                question: "3. 내가 주로 팀과 소통하는 방식은?",
                options: [
                    "따뜻하고 편안한 분위기에서 이야기를 이끌어낸다.",
                    "문제나 오류를 정확히 짚어내어 피드백한다.",
                    "질문과 대화를 통해 스스로 답을 찾게 유도한다.",
                    "필요한 정보와 지시를 명확히 전달한다."
                ]
            },
            {
                question: "4. 위기 상황에서 나는?",
                options: [
                    "팀원을 먼저 안심시키고 감정을 수습한다.",
                    "문제의 근본 원인을 찾아내고 수정하려 한다.",
                    "상황을 학습 기회로 삼아 함께 성장 방향을 모색한다.",
                    "신속하게 판단하고 지시를 내려 상황을 통제한다."
                ]
            },
            {
                question: "5. 팀원의 발전에 대해 나는 주로 어떻게 접근하는가?",
                options: [
                    "정서적 지지와 응원을 보내준다.",
                    "부족한 기술이나 전문성을 보완하게 돕는다.",
                    "스스로 목표를 설정하고 달성할 수 있도록 돕는다.",
                    "필요한 역량을 빠르게 습득하게끔 요구하고 관리한다."
                ]
            },
            {
                question: "6. 프로젝트가 잘 진행되지 않을 때 나는?",
                options: [
                    "팀원들의 스트레스와 감정을 먼저 살핀다.",
                    "과정을 다시 점검하고 품질을 높일 방법을 찾는다.",
                    "팀원들이 스스로 문제를 인식하고 해결책을 찾게 돕는다.",
                    "책임자를 지정하고 구체적 조치를 지시한다."
                ]
            },
            {
                question: "7. 내가 팀에 바라는 모습은?",
                options: [
                    "서로를 믿고 응원하는 따뜻한 팀",
                    "완성도 높은 결과를 만들어내는 전문 팀",
                    "스스로 성장하며 자율적으로 움직이는 팀",
                    "목표에 집중해 빠르고 정확하게 움직이는 팀"
                ]
            },
            {
                question: "8. 성공적인 리더십이란 무엇이라 생각하는가?",
                options: [
                    "사람을 존중하고 돌보는 것",
                    "뛰어난 결과를 만드는 것",
                    "사람을 성장시키고 변화시키는 것",
                    "목표를 달성하고 성과를 내는 것"
                ]
            }
        ];
        
        let currentQuestion = 0;
        let answers = [];
        
        // 리더십 테스트 시작
        if (leadershipTestBtn) {
            leadershipTestBtn.addEventListener('click', function() {
                leadershipTest.classList.remove('hidden');
                leadershipTestBtn.classList.add('hidden');
                showQuestion(currentQuestion);
            });
        }
        
        // 문항 표시 함수
        function showQuestion(index) {
            leadershipTest.innerHTML = '';
            
            if (index >= questions.length) {
                // 테스트 완료 - 결과 계산
                calculateResult();
                leadershipTest.classList.add('hidden');
                leadershipResult.classList.remove('hidden');
                
                // 결과 표시 후 페이드인 애니메이션 다시 적용
                setTimeout(() => {
                    const resultElements = document.querySelectorAll('#leadership-result .fade-in');
                    resultElements.forEach(element => {
                        element.classList.add('appear');
                    });
                }, 100);
                
                return;
            }
            
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            
            const questionText = document.createElement('p');
            questionText.textContent = questions[index].question;
            questionDiv.appendChild(questionText);
            
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';
            
            questions[index].options.forEach((option, optionIndex) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.textContent = option;
                optionDiv.dataset.value = optionIndex;
                
                optionDiv.addEventListener('click', function() {
                    document.querySelectorAll('.option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    // 다음 버튼 활성화
                    document.querySelector('.next-btn').disabled = false;
                });
                
                optionsDiv.appendChild(optionDiv);
            });
            
            questionDiv.appendChild(optionsDiv);
            leadershipTest.appendChild(questionDiv);
            
            // 컨트롤 버튼
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'test-controls';
            
            if (index > 0) {
                const prevBtn = document.createElement('button');
                prevBtn.textContent = '이전';
                prevBtn.className = 'btn prev-btn';
                prevBtn.addEventListener('click', function() {
                    currentQuestion--;
                    showQuestion(currentQuestion);
                });
                controlsDiv.appendChild(prevBtn);
            }
            
            const nextBtn = document.createElement('button');
            nextBtn.textContent = index === questions.length - 1 ? '결과 보기' : '다음';
            nextBtn.className = 'btn next-btn';
            nextBtn.disabled = true; // 선택하기 전에는 비활성화
            
            nextBtn.addEventListener('click', function() {
                const selectedOption = document.querySelector('.option.selected');
                if (selectedOption) {
                    answers[index] = parseInt(selectedOption.dataset.value);
                    currentQuestion++;
                    showQuestion(currentQuestion);
                }
            });
            
            controlsDiv.appendChild(nextBtn);
            leadershipTest.appendChild(controlsDiv);
        }
        
        // 리더십 결과 계산 함수
        function calculateResult() {
            let scores = [0, 0, 0, 0]; // 엄마형, 장인형, 코치형, 지휘관형 점수
            
            answers.forEach(answer => {
                scores[answer]++;
            });
            
            // 가장 높은 점수를 가진 유형 찾기
            let maxScore = Math.max(...scores);
            let mainType = scores.indexOf(maxScore);
            
            // 두 번째로 높은 점수를 가진 유형 찾기
            let tempScores = [...scores];
            tempScores[mainType] = -1;
            let secondMaxScore = Math.max(...tempScores);
            let secondaryType = tempScores.indexOf(secondMaxScore);
            
            // 타입 이름
            const typeNames = ['엄마형', '장인형', '코치형', '지휘관형'];
            
            // 리더십 유형 상세 정보
            const typeDescriptions = [
                {
                    title: "엄마형 리더십",
                    description: `엄마형 리더는 조직의 따뜻한 보호자입니다. 팀원의 감정과 필요를 민감하게 인식하고, 서로 돕는 가족과 같은 환경을 조성합니다.`,
                    strengths: "• 뛰어난 공감 능력으로 팀원 신뢰 구축\n• 포용적이고 심리적으로 안전한 환경 조성",
                    weaknesses: "• 어려운 결정이나 책임 추궁을 피하는 경향\n• 너무 관대한 태도로 기준이 약화될 수 있음"
                },
                {
                    title: "장인형 리더십",
                    description: `장인형 리더는 전문성과 완벽주의를 추구하는 정밀함의 대가입니다. 이들은 철저한 분석, 세부 사항에 대한 꼼꼼한 주의력, 그리고 품질에 대한 높은 기준을 가지고 있습니다.`,
                    strengths: "• 철저한 분석과 데이터 기반 의사결정\n• 높은 품질 기준과 일관된 결과물 도출",
                    weaknesses: "• 지나친 완벽주의로 의사결정 지연\n• 세부사항에 집중하여 큰 그림을 놓칠 수 있음"
                },
                {
                    title: "코치형 리더십",
                    description: `코치형 리더는 팀원의 성장과 잠재력 개발에 초점을 맞추는 영감을 주는 멘토입니다. 이들은 개개인의 강점을 파악하고 발전시키며, 자율성과 주인의식 부여를 통한 내적 동기를 유발합니다.`,
                    strengths: "• 팀원의 잠재력과 강점 발견 및 개발 능력\n• 자율성과 주인의식 부여를 통한 내적 동기 유발",
                    weaknesses: "• 모든 상황에 코칭 접근법이 적합하지 않을 수 있음\n• 단기적 성과가 필요한 상황에서 시간 소요"
                },
                {
                    title: "지휘관형 리더십",
                    description: `지휘관형 리더는 목표 달성과 결과 지향적인 접근으로 조직을 이끄는 결단력 있는 지휘자입니다. 이들은 명확한 방향과 기대치를 설정하고, 효율적인 실행을 통해 신속하게 성과를 창출합니다.`,
                    strengths: "• 명확한 목표 설정과 결과 지향적 실행력\n• 빠른 판단력과 위기 대응 능력",
                    weaknesses: "• 지나친 통제로 팀원의 창의성과 자율성 제한\n• 인간적 측면보다 성과에 집중하여 관계 소홀"
                }
            ];
            
            // 결과 표시 로직
            document.querySelectorAll('.type').forEach((type, index) => {
                // 모든 유형 기본 스타일 초기화
                type.style.borderColor = '#ddd';
                type.style.borderWidth = '1px';
                type.style.transform = 'none';
                type.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                type.innerHTML = ''; // 내용 초기화
                
                // 모든 유형에 상세 정보 추가
                const typeInfo = typeDescriptions[index];
                
                // 유형별 순서와 스타일 결정
                let orderLabel = '';
                let className = '';
                
                if (index === mainType) {
                    orderLabel = '<span class="type-label" style="background-color: #2180de; box-shadow: 0 2px 6px rgba(33, 128, 222, 0.25);">주 유형</span>';
                    className = 'main-type-card';
                    type.style.borderColor = '#2180de';
                    type.style.borderWidth = '3px';
                    type.style.transform = 'scale(1.05)';
                    type.style.boxShadow = '0 5px 15px rgba(33, 128, 222, 0.2)';
                } else if (index === secondaryType) {
                    orderLabel = '<span class="type-label">보조 유형</span>';
                    className = 'secondary-type-card';
                    type.style.borderColor = '#2ecc71';
                    type.style.borderWidth = '2px';
                    type.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.15)';
                }
                
                // 상세 내용 구성
                type.innerHTML = `
                    <h3>${typeInfo.title} <span>${['🤗', '🔍', '🏆', '🎯'][index]}</span> ${orderLabel}</h3>
                    <div class="type-description ${className}">
                        <p>${typeInfo.description}</p>
                        <div class="type-points">
                            <div class="strengths">
                                <h4>강점</h4>
                                <pre>${typeInfo.strengths}</pre>
                            </div>
                            <div class="weaknesses">
                                <h4>개발 영역</h4>
                                <pre>${typeInfo.weaknesses}</pre>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // 결과 메시지 추가
            const resultIntro = document.createElement('div');
            resultIntro.className = 'result-intro';
            resultIntro.innerHTML = `
                <p>당신의 리더십 유형 분석 결과</p>
                <p><span class="result-type-label main-type" style="background-color: #2180de; box-shadow: 0 3px 8px rgba(33, 128, 222, 0.3);">주 유형</span> <strong>${typeNames[mainType]}</strong> 리더십</p>
                <p><span class="result-type-label secondary-type">보조 유형</span> <strong>${typeNames[secondaryType]}</strong> 리더십</p>
            `;
            
            leadershipResult.insertBefore(resultIntro, document.querySelector('.leadership-types'));
        }
    }
    
    // 직원 스타일 초기화
    function initEmployeeStyles() {
        const employeeStyleBtn = document.getElementById('employee-style-btn');
        const employeeStyles = document.getElementById('employee-styles');
        
        if (employeeStyleBtn && employeeStyles) {
            employeeStyleBtn.addEventListener('click', function() {
                employeeStyles.classList.toggle('hidden');
                
                // 표시될 때 애니메이션 적용
                if (!employeeStyles.classList.contains('hidden')) {
                    setTimeout(() => {
                        const styleElements = document.querySelectorAll('#employee-styles .fade-in');
                        
                        // 순차적 애니메이션 적용 (100ms 간격)
                        styleElements.forEach((element, index) => {
                            setTimeout(() => {
                                element.classList.add('appear');
                            }, 100 * index);
                        });
                    }, 100);
                    
                    this.textContent = '직원 스타일 닫기';
                } else {
                    // 카드 숨기기 전에 모든 카드의 애니메이션 클래스 제거
                    const styleElements = document.querySelectorAll('#employee-styles .fade-in');
                    styleElements.forEach(element => {
                        element.classList.remove('appear');
                    });
                    
                    this.textContent = '직원 스타일 알아보기';
                }
                
                // 모든 "자세히 보기" 버튼에 이벤트 리스너 추가
                const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
                viewDetailsBtns.forEach(btn => {
                    btn.removeEventListener('click', showDetails);
                    btn.addEventListener('click', showDetails);
                });
                
                // 모든 "접기" 버튼에 이벤트 리스너 추가
                const closeDetailsBtns = document.querySelectorAll('.close-details-btn');
                closeDetailsBtns.forEach(btn => {
                    btn.removeEventListener('click', hideDetails);
                    btn.addEventListener('click', hideDetails);
                });
            });
        }
        
        // 상세정보 표시 함수
        function showDetails() {
            const card = this.closest('.employee-style-card');
            const styleType = card.getAttribute('data-style');
            window.location.href = `employee-styles/${styleType}.html`;
        }
        
        // 상세정보 숨기기 함수
        function hideDetails() {
            const detailedInfo = this.closest('.detailed-info');
            detailedInfo.classList.add('hidden');
        }
    }
});