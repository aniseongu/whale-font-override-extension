<div align="center">

# Pretendard + D2Coding Font Override

웹페이지의 본문 글꼴은 Pretendard로, 코드 영역은 D2Coding으로 바꿔 주는 브라우저 확장 프로그램

![version](https://img.shields.io/badge/version-1.1.3-1a56b0)
![manifest](https://img.shields.io/badge/Manifest-V3-1a56b0)
![browser](https://img.shields.io/badge/Whale%20%7C%20Chrome-Chromium%20150-555555)

</div>

## 소개

사이트마다 제각각인 글꼴을 하나로 맞추고 싶어서 만든 확장입니다. 일반 글자는 Pretendard, 코드 블록과 편집기는 D2Coding으로 보여 줍니다. 글자 크기, 줄 간격, 자간, 확대 비율, 레이아웃은 건드리지 않고 글꼴 이름만 바꿉니다. 네이버 웨일에서 매일 쓰면서 고쳐 왔습니다.

## 기능

| 구분 | 내용 |
| --- | --- |
| 본문 글꼴 | http, https 페이지의 일반 글자를 Pretendard로 바꿉니다. Pretendard가 없으면 Noto Sans KR, 맑은 고딕 순으로 대신 씁니다. |
| 코드 글꼴 | `pre`, `code`, `kbd` 같은 고정폭 영역과 Monaco, CodeMirror, Ace 편집기를 D2Coding으로 바꿉니다. |
| 아이콘 보호 | Material Icons, Font Awesome 같은 아이콘 글꼴과 SVG, 수식은 그대로 둡니다. 아이콘이 글자로 깨지지 않습니다. |
| Shadow DOM 지원 | 열린 Shadow DOM 안쪽에도 스타일을 넣어, 컴포넌트로 만든 최신 웹앱에서도 글꼴이 바뀝니다. |
| 사이트별 끄기 | 툴바 팝업에서 지금 보고 있는 사이트만 바로 끄고 켭니다. 새로고침하지 않아도 됩니다. |
| 제외 목록 관리 | 옵션 페이지에서 제외할 도메인을 한꺼번에 관리합니다. 도메인을 넣으면 하위 도메인까지 함께 제외됩니다. |
| 강한 적용 | 사용자 스타일시트로도 한 번 더 넣어, 사이트 CSS가 글꼴을 강하게 지정해도 덮어씁니다. 페이지의 CSP 설정에도 막히지 않습니다. |

## 설치 전 준비

글꼴 파일은 확장에 들어 있지 않습니다. 컴퓨터에 먼저 설치해 주세요.

1. [Pretendard](https://github.com/orioncactus/pretendard/releases)를 설치합니다.
2. [D2Coding](https://github.com/naver/d2codingfont/releases)을 설치합니다.
3. 브라우저를 완전히 껐다가 다시 엽니다. 새로 설치한 글꼴은 다시 시작해야 인식됩니다.

## 설치

웹 스토어에는 올리지 않았습니다. 압축 해제한 폴더를 직접 불러와 사용합니다.

```bash
git clone https://github.com/aniseongu/whale-font-override-extension.git
```

또는 이 페이지의 Code 버튼에서 Download ZIP을 눌러 받은 뒤 압축을 풉니다.

1. 웨일은 `whale://extensions`, 크롬은 `chrome://extensions`를 엽니다.
2. 개발자 모드를 켭니다.
3. 압축 해제된 확장 프로그램을 로드를 누르고 `manifest.json`이 있는 폴더를 선택합니다.
4. 아무 웹사이트나 열고 `Ctrl + F5`로 강력 새로고침합니다.

업데이트는 새 파일로 폴더를 덮어쓴 뒤 확장 관리 화면에서 새로고침을 누르면 됩니다. 폴더 위치를 바꾸면 브라우저가 다른 확장으로 인식해 제외 목록이 초기화됩니다.

## 사용법

1. 설치하면 바로 모든 http, https 페이지에 적용됩니다. 따로 켤 필요가 없습니다.
2. 어떤 사이트에서 아이콘이 깨지거나 원래 글꼴을 보고 싶다면, 그 페이지에서 툴바 아이콘을 누르고 이 사이트에서 폰트 적용 끄기를 누릅니다. 다시 켤 때도 같은 버튼을 누릅니다.
3. 여러 사이트를 한꺼번에 관리하려면 팝업의 전체 제외 목록 관리를 누릅니다. 확장 관리 화면의 세부정보에서 확장 프로그램 옵션으로 들어가도 됩니다.
4. 옵션 페이지에서 `notion.so`처럼 도메인을 넣고 추가합니다. 목록에서 지우면 다시 적용됩니다.

## 권한

| 권한 | 쓰는 이유 |
| --- | --- |
| 모든 `http`, `https` 사이트 | 어느 사이트에서든 글꼴을 바꾸려면 모든 페이지에 스타일을 넣어야 합니다. 페이지 내용은 읽거나 보내지 않습니다. |
| `scripting` | 사이트 CSS보다 우선하는 사용자 스타일시트를 탭에 넣고, 제외한 사이트에서는 뺍니다. |
| `tabs` | 지금 탭의 주소를 보고 제외 목록에 있는 사이트인지 판단합니다. |
| `storage` | 제외 도메인 목록을 브라우저 안에 저장합니다. |

외부 서버로 아무것도 보내지 않습니다. 제외 목록은 이 브라우저의 확장 저장소에만 남습니다.

## 기술 스택

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)

- 프레임워크와 빌드 과정 없이 순수 JavaScript, HTML, CSS로 작성했습니다. 받은 폴더를 그대로 불러오면 됩니다.
- Chrome 확장 API: `chrome.scripting`, `chrome.tabs`, `chrome.storage`, `chrome.runtime`
- 콘텐츠 스크립트가 페이지를 그리기 전(`document_start`)에 스타일을 넣고, 서비스 워커가 `insertCSS`의 USER 출처로 한 번 더 넣습니다.
- 선택자는 `:where()`로 감싸 우선순위를 0으로 두고, 글꼴 속성에만 `!important`를 씁니다. 크기나 간격 같은 다른 속성은 사이트 값을 그대로 씁니다.
- 새로 생기는 Shadow DOM은 `MutationObserver`로 찾아 스타일을 넣습니다.

## 폴더 구조

```text
.
├── manifest.json
├── font-override.css   서비스 워커가 넣는 글꼴 규칙
├── content.js          페이지와 열린 Shadow DOM에 글꼴 규칙 주입
├── background.js       사용자 스타일시트 주입과 제외 목록 반영 (서비스 워커)
├── common.js           도메인 정리, 제외 여부 판단, 저장소 함수
├── popup.html          툴바 팝업 (지금 사이트 켜기, 끄기)
├── popup.js
├── options.html        옵션 페이지 (제외 도메인 관리)
└── options.js
```

## 알려진 한계

- `whale://`, `chrome://` 같은 브라우저 내부 페이지와 웹 스토어 페이지는 바꿀 수 없습니다.
- 로고, 이미지, canvas로 그린 글자는 CSS로 바꿀 수 없습니다. Google Docs와 Sheets의 문서 본문이 여기에 해당합니다. 메뉴는 바뀌어도 본문은 그대로입니다.
- 닫힌 Shadow DOM은 확장이 들어갈 수 없어 적용되지 않을 수 있습니다.
- 클래스 이름에 `icon`이나 `token`이 들어간 요소는 아이콘으로 보고 건너뜁니다. 그래서 드물게 일반 글자가 원래 글꼴로 남기도 합니다.
- 웨일에서만 확인했습니다. 크롬 등 다른 Chromium 브라우저에서도 동작할 것으로 보지만 따로 시험하지 않았습니다.

## 변경 기록

| 버전 | 내용 |
| --- | --- |
| 1.1.3 | 팝업과 옵션 페이지 글꼴을 Pretendard로 변경 |
| 1.1.1, 1.1.2 | 글꼴 규칙을 콘텐츠 스크립트 안에 담아 파일을 불러오지 못해 적용이 빠지던 경우를 줄임, 적용 실패 시 콘솔에 원인 기록 |
| 1.1.0 | 사이트별 끄기 팝업, 제외 목록 옵션 페이지, 열린 Shadow DOM 지원 |
| 1.0 | Pretendard, D2Coding 글꼴 적용 |

## 출처와 참고

| 프로젝트 | 만든 사람 | 쓰는 곳 |
| --- | --- | --- |
| [Pretendard](https://github.com/orioncactus/pretendard) | [orioncactus](https://github.com/orioncactus) | 본문 글꼴입니다. SIL Open Font License 1.1로 배포됩니다. |
| [D2Coding](https://github.com/naver/d2codingfont) | [NAVER](https://github.com/naver) | 코드 글꼴입니다. SIL Open Font License 1.1로 배포됩니다. |

두 글꼴 모두 이 저장소에 포함하지 않았습니다. 각 저장소에서 받아 설치해 주세요.

## 문의

버그나 제안은 [Issues](https://github.com/aniseongu/whale-font-override-extension/issues)에 남겨 주세요. 어떤 사이트에서 무엇이 이상했는지 적어 주시면 고치기 쉽습니다.
