# 유레카 프론트엔드 비대면 2조

## 미플러스(Me+)

![image](https://github.com/user-attachments/assets/d6d9815f-e6bf-47d9-9a87-0b938ffa389b)

[🔗팀노션](https://chip-yumberry-7c7.notion.site/02-Me-20294459a69c8052b3f0cf717ac47af0?source=copy_link)
[🎨피그마](https://www.figma.com/design/BYe3HZoyP4ZyrDg27bUOHg/2%EC%A1%B0_%EB%94%94%EC%9E%90%EC%9D%B8?node-id=0-1&t=kj4A9Yv5fHoMdDRJ-1)
[🌐배포사이트]()
[👨‍🏫발표자료]()

### ✅ 프로젝트 목적

- 사용자 요금제 탐색 시간 단축으로 이탈률 감소
- 개인 맞춤형 요금제 제공으로 사용자 경험(UX) 개선
- 결합 혜택 추천으로 타 알뜰폰과 차별화된 경쟁력 확보

### 💡 기획 의도

- 복잡하고 다양한 통신사 요금제 중 사용자의 성향과 패턴에 맞는 최적 요금제를 빠르게 추천
- AI 챗봇 기반 UX를 활용해 사용자 친화적인 상담 경험 제공
- 가족 결합, 부가서비스 등의 다양한 조건도 반영하여 실질적인 할인 혜택 안내

## 🏃‍♂️ 주요기능

### 1. 채팅 시작 가이드

**목적**: 요금제 정보 숙련도에 따라 사용자 분기  
**기능**:

- “가족이랑 함께 가입해요”, “영상을 많이 봐요” 등 버튼으로 사용 성향 유도
- 요금제에 대한 이해가 부족한 경우, 성향 테스트 시작

### 2. 라이프스타일 기반 요금제 추천

**목적**: 개인 데이터/콘텐츠 사용 습관 등을 기반으로 요금제 3가지 추천  
**기능**:

- 요금제 이름, 가격, 설명, 기본/특별 혜택 제공
- 추천 사유 설명 포함
- 상세페이지 링크 제공

### 3. 역질문으로 결합 혜택 제안

**목적**: 가입 전환율 증대  
**기능**:

- 챗봇이 사용자에게 가족결합, 인터넷 사용 여부 등 자연스러운 질문
- 결합 시 받을 수 있는 할인 안내

### 4. 사용자 입력 보조 버튼 제공

**목적**: 챗봇 입력 부담 완화  
**기능**:

- 버튼 선택으로 간편하게 질문 응답 가능
- 예시:
  - “15GB 이상이면서 핫스팟이 되는 요금제 추천해줘”
  - “넷플릭스 구독제가 포함된 요금제 추천해줘”
  - “가족과 함께 결합 시 할인되는 요금제를 가장 저렴한 순서로 추천해줘”

### 5. 성향 테스트

**목적**: 비전문 사용자도 요금제 탐색 가능하도록 유도  
 **기능**:

- 하루 일과 기준 5개 질문에 객관식 응답
- 응답 결과 기반 요금제 추천
- 결과 해석과 함께 상세페이지 연결

# 🗂️ 디렉토리 구조

```
me-plus/
├── client/ # 프론트엔드 React 애플리케이션
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── hooks/
│ │ ├── pages/
│ │ ├── styles/
│ │ ├── utils/
│ │ ├── App.tsx # 루트 컴포넌트
│ │ └── main.tsx # 진입점
│ ├── package.json
│ └── tsconfig.json
│
├── server/ # 백엔드 Node.js 애플리케이션
│ ├── config/ # 설정 파일
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── utils/
│ ├── app.js # Express 앱 설정
│ └── package.json
│
├── shared/ # 프론트엔드와 백엔드가 공유하는 코드
│ ├── constants/ # 공통 상수
│ └── utils/ # 공통 유틸리티
│
├── .gitignore
├── package.json
└── README.md
```

# 🔰 실행 방법

```bash
# 1. pnpm 설치 (npm 사용자는 먼저 pnpm을 설치해야 합니다)
npm install -g pnpm

# 2. 의존성 설치 (루트 디렉토리에서 실행)
pnpm install

# 3. 빌드 (서버, 클라이언트 등 모든 패키지 빌드)
pnpm build

# 4. 개발 서버 실행 (서버와 클라이언트가 동시에 실행됨)
pnpm dev
```

> 💡 해당 프로젝트는 모노레포 구조로 되어 있으며, pnpm 워크스페이스를 사용해 서버와 클라이언트를 함께 관리합니다.
> pnpm dev 실행 시 서버와 클라이언트가 동시에 구동됩니다.

## 📚 Tech Stack

### 💻 FE Development

[![My Skills](https://skillicons.dev/icons?i=ts,html,css,react,tailwind,vite)](https://skillicons.dev)

### 💻 BE Development

[![My Skills](https://skillicons.dev/icons?i=nodejs,express,mongodb&theme=dark)](https://skillicons.dev)

### ⌛ Developed Period

#### 2025.6.09 ~ 2025.6.27 (18 days)

# 👩‍💻 팀원

<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/yeji424"><img src="https://avatars.githubusercontent.com/u/196058650?v=4" width="120px;" alt=""/><br /><b>김예지</b></a><br /><p>👑팀장</p></td>
      <td align="center"><a href="https://github.com/yyeonkim"><img src="https://avatars.githubusercontent.com/u/70844774?v=4" width="120px;" alt=""/><br /><b>김용연</b></a><br /><p>개발</p></td>
      <td align="center"><a href="https://github.com/hyonun321"><img src="https://avatars.githubusercontent.com/u/119800605?v=4" width="120px;" alt=""/><br /><b>김현훈</b></a><br /><p>개발</p></td>
      <td align="center"><a href="https://github.com/leeemingyu"><img src="https://avatars.githubusercontent.com/u/101480155?v=4" width="120px;" alt=""/><br /><b>이민규</b></a><br /><p>개발</p></td>
      <td align="center"><a href="https://github.com/chemnida"><img src="https://avatars.githubusercontent.com/u/196130116?v=4" width="120px;" alt=""/><br /><b>이채민</b></a><br /><p>개발</p></td>
    </tr>
  </tbody>
</table>

# 🎯 커밋 컨벤션

- `Feat`: Add a new feature
- `Fix`: Bug fix
- `Docs`: Documentation updates
- `Style`: Code formatting, missing semicolons, cases where no code change is involved
- `Refactor`: Code refactoring
- `Test`: Test code, adding refactoring tests
- `Build`: Build task updates, package manager updates
