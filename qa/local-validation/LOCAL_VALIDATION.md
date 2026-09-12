# Mystery Atlas V2 — 로컬 검증 최종 기록

검증일: 2026-09-12. 소스 기준: 사용자가 제공한 MysteryAtlas-V2-Handoff.zip의 검증된 project/. 이번 작업은 GitHub를 선행조건에서 제외하고 로컬 소스 수정·검증으로 진행했다. GitHub Connector/API/웹 UI/원격 Actions 호출은 0회다.

**Product Gate: FAIL — 최종 Android 제품 승인에 필요한 실행·렌더링 증거가 없어 승인 불가.** 이는 GitHub 미반영이나 모든 소스 검사의 실패를 뜻하지 않는다. 가능한 소스·콘텐츠·호스트 검증은 완료했고 아래 범위별 결과를 분리한다.

## 최종 소스 식별

- 원본 Handoff ZIP SHA-256: `c60ceae70c10e358ddc96e9be84c2cb376893e699286fe948caf3dad0d34f3db`.
- 원본 manifest 58개 항목 모두 일치했고 원본 project/ 파일 53개를 보존했다.
- 최종 빌드 입력 manifest SHA-256: `44f0788ce80cc1a16c96d83478fce4e90afcef69736e3b194504a8af16c2ff2e` (33개 app/Gradle 입력 파일; `source-identity.json`). 이 값은 APK 해시나 Git 커밋이 아니다.
- 원격 업로드 전 로컬 기준 커밋은 인계 기록의 `418f05d0b6ae2ecc8415f831ad2b203b0a9aaf06`이다. 이번 수정본은 그 원본과 다른 바이트이며 새 Git 커밋을 만들지 않았다.
- 기존 `.github/workflows/android-build.yml`은 바이트 변경 없이 보존했다. 연동되는 QA 스크립트는 아래 오류를 수정했다.
- 변경 내역: `source-changes.json`, 원본 대비 텍스트 patch: `source-changes.patch`.

## 실행한 검증

| 항목 | 실제 결과와 범위 |
|---|---|
| 기존 호스트 콘텐츠 자동검사 | PASS — 기사 7개, 승인 카테고리 8개, Evidence 18개, 출처 12개, 한·영 필드, 참조/연결, 이미지 provenance, 활성 V1 제거 검사 |
| 계측 로그 파서 회귀검사 | PASS — 16개 실제 호스트 테스트. Android 실행 로그를 가정한 synthetic fixture를 실제 파서에 넣은 검사이며 Android 앱 실행이 아님 |
| 로컬 빌드 입력/SDK 경로 회귀검사 | PASS — 6개 실제 호스트 테스트. .git 없는 ZIP, 소스 변경 감지, 생성물 제외, local.properties/환경변수 경로와 오류 처리 |
| 이미지 디코딩·실제 크기 | PASS — 원본 이미지 5개를 Pillow로 디코딩, 실제 dimensions 일치; 원본 바이트/해시 보존 |
| Bash/Python 문법 | PASS — Bash -n, Python AST. Kotlin/Compose 컴파일과 무관 |
| 로컬 build-local.sh | BLOCKED, 실제 exit 2 — Gradle 8.13과 Android SDK 경로 부재 |
| Android 실행 스크립트 preflight | BLOCKED, 실제 exit 2 — adb/Android 실행환경 부재 |
| compileDebugKotlin / lintDebug / assembleDebug / assembleDebugAndroidTest | NOT RUN — 빌드 preflight 이후 실행할 도구가 없음 |
| GitHub Actions | NOT RUN — 사용자 지시대로 별도 후속 동기화 단계로 분리 |

실행 증거: `host-final.txt`, `host-integrity.json`, `final-checks.json`, `image-decode.json`, `python-syntax.json`, `bash-syntax-final.txt`, `local-build-final.txt`, `android-runtime-preflight.txt`.

## 환경을 실제 확인한 결과

Java 17.0.20 런타임과 jdk.compiler 모듈이 있다. javac 실행 파일은 PATH에 없지만 `java -m jdk.compiler/com.sun.tools.javac.Main -version`은 성공했다. Java compiler 자체가 없다고 판정하지 않았다.

Gradle, sdkmanager, Android SDK android.jar, adb, emulator는 PATH 및 조사한 일반 설치/캐시 경로에서 발견되지 않았다. ANDROID_HOME/ANDROID_SDK_ROOT는 비어 있고 /dev/kvm도 없다. 별도의 Android 실행 도구도 제공되지 않았다. 확인 경로와 명령은 `initial-checks.json`에 있다.

공식 Gradle 바이너리와 Android SDK repository 엔드포인트에 각각 한 번 연결을 확인했으나 둘 다 curl exit 28, `Proxy CONNECT aborted due to timeout`이었다. 이를 서버 장애나 영구 차단이라고 단정하지 않는다. 프록시 우회, 대체 인증, GitHub 경유 다운로드를 시도하지 않았다. 동일한 실패 방식을 세 번째 반복하지 않았다. 로그는 `gradle-official.txt`, `android-sdk-official.txt` 및 `toolchain-download-checks.json`에 보존했다.

## 7개 독립 검토

각 검토는 구현 작성자와 다른 agent가 수행했고 초기 지적→수정→독립 재검토를 기록했다. Functional QA 검토자가 수정한 파서는 별도 Independent Red Team이 다시 실행·검토했다. 각 보고서의 초기 FAIL은 변경 이력이며 최종 판정/대상 해시는 보고서의 최종 항목을 따른다.

| 역할 | 완료한 범위 | 최종 Android 제품에 대한 한계 |
|---|---|---|
| Product | 소스 검토 PASS; 4탭/5개 Home 영역/8카테고리/실제 기사 연결, 확인된 결함 수정 | 발견→독서→저장·재방문 실제 기기 흐름 NOT RUN |
| UX-Design | 소스·기존 이미지 검토 PASS; 지적 UX-01~05 수정 확인 | 실제 7화면, 360dp/큰 글꼴/터치·TalkBack Visual gate BLOCKED |
| Editorial | 기사·기존 이미지·필수 카드 문안 소스 검토 PASS | 최종 Android 화면의 실제 밀도·읽기 흐름 NOT RUN |
| Fact | 검토한 원출처·기사·Evidence·이미지 귀속 범위 PASS; 2건 수정 재확인 | Phaistos 박물관 본문 직접 접근 실패/공식 검색 발췌만 확인. 실제 캡션·배지·출처 링크 렌더링 NOT RUN |
| Engineering | 소스 검토 PASS; 저장 오류/로컬 provenance/SDK 경로 수정, 준비된 회귀검사 검토 | 실제 Kotlin compile/Android lint/build/runtime BLOCKED |
| Functional QA | 가능한 소스·검사 준비 검토 완료, 호스트 테스트 PASS | Android 기능 gate BLOCKED; 실제 계측 결과 없음 |
| Independent Red Team | 소스 재검토 PASS; 파서16개·identity6개 호스트 독립 실행, 확인 결함 재확인 | 최종 Product/Android 배포 승인 불가 |

상세 근거는 `reviews/product.md`, `ux-design.md`, `editorial.md`, `fact.md`, `engineering.md`, `functional-qa.md`, `independent-red-team.md`와 각 역할의 해시/증거 파일에 있다. 호스트 oracle로 확인한 그래프 불변식은 Kotlin 실행 결과로 표시하지 않는다.

## 발견 후 수정한 주요 문제

1. 목록형 카드에 누락된 기존 hook·사건 상태를 표시했다. 좁은 실제 카드 폭/큰 글꼴에서 세로 배치, Hero/저장 헤더 줄바꿈, 14sp 보조 글씨, 저장 아이콘 채움 상태를 보완했다.
2. Rabbit Hole 재방문 시 앞선 경로를 잘라 실제 연결 관계를 유지하도록 수정했다. 방문 표시, 경로 내 이전 기사 이동, 해당 갈래 소진 안내와 Explore 복귀를 추가했다.
3. 검색을 정확 제목/별칭→부분 제목/별칭→headline→metadata 우선순위와 고정 tie-break로 정렬했다. NFKC/대소문자/문장부호 정규화를 적용했다.
4. 본문 끝 표식을 도달하거나 지난 위치에서 멈추면 읽음으로 저장하고 저장/최근 목록에 읽는 중·읽음을 표시했다. 로딩 중 빈 목록이 기존 읽기 위치를 덮어쓰지 않도록 관찰 시작을 늦췄다.
5. DataStore 읽기 실패를 빈 정상 상태로 가장하던 흐름을 제거했다. 마지막 정상 값을 유지하고 별도 오류/Retry로 재구독한다. 오래된 기사 로딩 작업 취소와 이미지 실패의 명시적 상태를 보완했다.
6. Rohonc/Phaistos에 공유된 분위기 이미지가 해당 유물의 모습이 아님을 카드·Hero·본문·Rabbit의 설명과 대체텍스트로 표시했다. 이미지 5개를 재생성하지 않았다.
7. Mary Celeste 영문 `An intact vessel`을 근거에 맞게 `A vessel still afloat`로 한 곳 수정했다. 다른 기사 6개와 카탈로그·이미지 provenance 원본 바이트는 유지했다. 기존 V1 권리 문서에 보존 기록 표기를 추가하고 V1 기기 체크리스트를 archive로 보존하면서 V2 기준을 작성했다.
8. 로그 파서가 미완료·중복 테스트를 PASS로 처리한 3개 반례를 수정하고 16개 회귀검사를 실행했다.
9. `.git` 없는 ZIP에서도 빌드 소스 identity를 기록하도록 수정했다. SDK는 환경변수 또는 local.properties에서 같은 방식으로 찾는다. APK가 없는 이번 세션에 APK provenance를 만들어 성공으로 위장하지 않았다.
10. Android QA는 실제 에뮬레이터만 허용하고, 이전 캡처를 별도 보존해 새 실행의 PNG 검사에 섞이지 않게 했다. 설치 전 sourceIdentity와 app/test APK 해시를 확인하며 설치/초기화 전 실패에는 런타임 캡처를 만들지 않는다.
11. 원래 계측 테스트를 유지하면서 Rabbit 깊이, 읽음·읽기 위치의 프로세스 간 복원, 검색 순위, 이미지 실패에 대한 준비된 회귀검사를 추가했다. 이 Kotlin 테스트들은 이번 환경에서 실행하지 못했다.

## 실제 Android 7화면

| 화면 | 실제 Android PNG |
|---|---|
| Home | 미확보 |
| Explore | 미확보 |
| Article | 미확보 |
| Evidence | 미확보 |
| Rabbit Hole | 미확보 |
| Search | 미확보 |
| Save | 미확보 |

reference/VisualReferences/의 3장은 APPROVED VISUAL DIRECTION 원본으로만 보존한다. 실제 Android 실행 화면으로 재분류하지 않는다. APK/PNG를 대체하는 웹 목업은 만들지 않았다.

## 남은 문제와 재개 위치

- 최종 소스의 실제 Kotlin/Compose compile, Android lint, assembleDebug 및 instrumentation APK 빌드가 아직 필요하다. 정적 판독으로 컴파일 호환성을 보장하지 않는다.
- 최종 app/test APK의 서명/바이트/hash를 기록하고 그 동일 APK들을 설치해야 한다. 7화면 및 narrow/font130/font200 화면, 기능·프로세스 복원 검사를 실제 실행해야 한다.
- 출처 외부 열기, DataStore 읽기/쓰기 오류 주입과 Retry, 개별 기사 오류/오프라인, 미완독 상태가 읽음으로 잘못 표시되지 않는지 검사, Rabbit 소진/이전 경로 버튼, 다양한 KO/entity 검색과 복원, TalkBack/IME/터치의 실제 검증이 남는다. 상세한 테스트 공백은 Functional QA 보고서에 있다.
- Phaistos 공식 박물관 전체 본문을 직접 읽지 못한 범위를 후속 사실 검증에서 보완해야 한다.
- Android 준비 환경이 제공되면 현 최종 소스에서 build-local.sh를 실행한 후, 준비된 app/test APK와 provenance를 qa-input에 두고 disposable emulator에서 android-run-qa.sh를 실행한다. 후속 실행자가 수행할 작업이며 사용자에게 명령/수작업을 요청한 것이 아니다.
- 실제 결과에 FAIL이 있으면 기존 코드만 수정→빌드→동일 APK 실행·캡처→독립 재판정한다.
- GitHub 동기화는 최종 산출물이 만들어진 뒤 별도 작업이다. 기존 repository/pipeline을 유지하며 현 세션에서는 접근하지 않는다.

## APK 전달 상태

- APK 생성: 없음.
- APK 파일명: 없음.
- APK 크기: 없음.
- APK SHA-256: 없음.
- Android 휴대폰 APK 다운로드 위치: 없음.
- 제공 파일은 최종 로컬 수정 소스·검증 증거 ZIP이며 설치 파일이 아니다.
