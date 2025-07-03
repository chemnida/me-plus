# 유레카 프론트엔드 비대면 2조

## 미플러스(Me+)
<p>
![image](https://github.com/user-attachments/assets/3e5e6047-ab52-4a93-9da5-46fd24bb3ef3)
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/d6d9815f-e6bf-47d9-9a87-0b938ffa389b" width="49%">
  <img src="https://github.com/user-attachments/assets/4d6c7fe3-ecad-4c40-8393-0b8ba1629eb6" width="49%">
</p>


[🔗팀노션](https://chip-yumberry-7c7.notion.site/02-Me-20294459a69c8052b3f0cf717ac47af0?source=copy_link)
[🎨피그마](https://www.figma.com/design/BYe3HZoyP4ZyrDg27bUOHg/2%EC%A1%B0_%EB%94%94%EC%9E%90%EC%9D%B8?node-id=0-1&t=kj4A9Yv5fHoMdDRJ-1)
[🌐배포사이트](https://me-plus-client.vercel.app/)
[👨‍🏫시연영상](https://youtu.be/04NNuDxZ5X0)

### ✅ 프로젝트 목적

- 즉각적인 요금제 추천 : 사용자의 요금제 탐색 시간 및 이탈률을 줄이고, 직관적인 UI 제공
- 성향 기반 추천 : 간단한 테스트를 통해 사용자의 콘텐츠 이용 성향을 파악
- 맞춤형 혜택안내 : 역질문을 활용해 각 사용자읭 니즈에 맞는 혜택 정보를  제공


### 💡 기획 의도
![image](https://github.com/user-attachments/assets/7b4ec8a6-ad6d-420a-821f-de84351edfcc)

- 복잡하고 다양한 통신사 요금제 중 사용자의 성향과 패턴에 맞는 최적 요금제를 빠르게 추천
- AI 챗봇 기반 UX를 활용해 사용자 친화적인 상담 경험 제공
- 가족 결합, 부가서비스 등의 다양한 조건도 반영하여 실질적인 할인 혜택 안내


## 🏃‍♂️ 주요기능

### 1. 카드 컴포넌트를 통한 요금제 대화 유도
![--ezgif com-video-to-gif-converter (1)](https://github.com/user-attachments/assets/b17a172f-6d0e-4234-b416-767c458b9515)

**목적**: 요금제 정보를 잘 모르는 유저에게 선택형 카드 컴포넌트를 보여줌으로 써 첫 행동의 거부감을 줄이기 위함

**기능**:

![image](https://github.com/user-attachments/assets/03407d78-6df1-46e1-93e3-13313322502d)

- 채팅을 시작하면 사용자에게 라이프스타일 기반 주요 선택지를 카드형식으로 제공한다.
- 사용자가 자신의 상황에 맞는 항목을 빠르게 선택할 수 있도록

### 2. 라이프스타일 기반 요금제 추천
![ezgif com-video-to-gif-converter (2)](https://github.com/user-attachments/assets/4d6c7fe3-ecad-4c40-8393-0b8ba1629eb6)

**목적**: 이용자의 연령, 콘텐츠 사용 습관, 데이터 사용량 등 라이프스타일 기반으로 유플러스 요금제 추천

**기능**:
- 챗봇은 사용자의 라이프 스타일을 기반으로 하여 적합한 요금제를 추천한다. 
- 요금제 추천 기준을 간략하게 설명해주며 요금제 목록을 보여준다.
- 요금제에는 이름, 월정액, 설명, 기본 혜택, 특별 혜택(있는 경우에만) 등의 내용을 포함한다.
- 사용자가 요금제 중 하나를 선택하면 새 탭에서 상세페이지를 보여준다.

### 3. 역질문으로 결합 혜택 가입 유도
![ezgif com-video-to-gif-converter (3)](https://github.com/user-attachments/assets/5e24095d-625b-4468-8efb-e35991dbdacb)

**목적**: 추천 이후 가입전환을 높이기 위해 결합 상품 및 부가 혜택 제안

**기능**:

![image](https://github.com/user-attachments/assets/ba6ecf7e-3800-46f1-896a-4cc44882e8e2)

- 요금제 추천 후 챗봇이 자연스럽게 질문을 던지며 사용자에게서 상세 정보를 이끌어 낸다.
- 사용자의 응답에 따라 추가로 받을 수 있는 결합 할인, 혜택 등이 있을 경우 추천을 유도한다.

### 4. 사용자 입력을 버튼(객관식)으로 함께 제공
![ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/fd280cd2-ac94-41bc-aded-9a0e8a677229)

**목적**: 사용자의 입력 부담을 줄이기

**기능**:
- 최초로 채팅을 시작했을 때 사용자 입력 예시를 그림과 함께 카드 형태로 제공한다.
- 챗봇이 한 질문에 여러 가지로 답변할 수 있을 경우 버튼을 함께 제공한다.
- 예시:
  - “혹시 가족 구성원 중 만 18세 이하의 청소년 자녀가 있으신가요? 있으시다면 추가 결합 혜택도 안내드릴게요!” (예 | 아니요)
  - “즐겨보는 OTT 서비스가 있으신가요?” (넷플릭스 | 티빙 | 왓챠 | 디즈니+)
  - “한달 월 요금은 어느정도 예산을 생각하고 계신가요?” (3-5만원| 5-7만원 | 7-10만원 | 10-15만원 | 예산 무관)

### 5. 맞춤형 요금제 테스트
![--ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/2ffceaa2-375e-4412-bac9-bf182d818870)

**목적**: 어떤 데이터를 원하는 지 모르는 사용자가 요금제를 탐색하는 과정을 거치도록 한다.

**기능**:

![image](https://github.com/user-attachments/assets/ce656805-7da9-45c5-ab52-427d813e8db6)

- 맞춤형 요금제 테스트 질문이 표시되며 질문 아래에 선택지가 주어진다.
- 사용자는 각 질문 당 하나의 답변만 선택할 수 있으며 추후 수정이 가능하도록 한다.
- 사용자가 모든 질문에 답하면 사용자 입력에 따라 하나의 추천 요금제에 결합혜택를 함께 제공한다.
- 요금제에는 이름, 월정액, 설명, 기본 혜택, 특별 혜택(있는 경우에만) 내용이 표시된다.
- 요금제 정보와 함께 요금제 상세페이지로 넘어갈 수 있는 버튼을 제공한다.

### 6. 요금제 비교
|  |  |
|:---:|:---:|
| ![ezgif com-video-to-gif-converter (4)](https://github.com/user-attachments/assets/fa44bfaa-1989-4aba-9198-429d9a98764b) | ![ezgif com-video-to-gif-converter (5)](https://github.com/user-attachments/assets/b40b4d0c-783a-4d71-8578-2aeddded9a18) |

**목적**: 요금제 간의 차이를 시각적으로 파악할 수 있도록 한다.

**기능**:

![image](https://github.com/user-attachments/assets/111a226b-65b6-45fe-963d-5d6068fceeeb)

- 모든 요금제를 확인해볼 수 있으며 그 중 두 요금제를 선택해 비교를 진행한다.
- 두 요금제의 비교 수치에 따라 막대그래프는 유동적으로 나타나며 시각적으로 인지할 수 있도록 한다.
- 요금제 리스트에서는 필터링을 제공하여 사용자의 선택을 돕는다.
- 해당 요금제 하단에 상세 페이지로 연결되는 버튼을 제공한다.

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



**FE 환경변수**
```env
VITE_API_BASE_URL=http://localhost:3001
```

**BE 환경변수**
```env
MONGO_URI={mongoDB 주소}
OPENAI_API_KEY={openAI api key값}
NODE_ENV=development
```

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
