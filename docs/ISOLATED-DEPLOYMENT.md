# X-Hydride Lab — 격리 배포 가이드 (GitHub · Supabase · Vercel)

기존에 만들었던 프로젝트와 절대 겹치지 않게 X-Hydride Lab을 셋업하는 절차. 모든 단계는 **신규 리소스**만 만든다. 기존 레포·프로젝트·DB·도메인·키를 재사용하지 않는다.

---

## 0. 격리 원칙 (반드시 먼저 읽기)

다음을 어기면 기존 프로젝트와 데이터가 섞일 수 있다.

| 원칙 | 의미 |
| --- | --- |
| 모든 리소스는 신규 | GitHub repo / Supabase project / Vercel project는 모두 새로 만든다. 기존 것에 import / fork / link 하지 않는다. |
| 이름은 한 가지로 통일 | 세 곳 모두 `x-hydride-lab`로 통일한다. 다른 prefix 금지 (예: `frontend-x-hydride`). |
| 키는 따로 발급 | xAI / Supabase 키는 X-Hydride 전용으로 새로 발급한다. 다른 프로젝트의 키 재사용 금지. |
| `.env.local`은 절대 커밋 X | 이미 `.gitignore`에 `.env*.local` 등록되어 있다. 확인만 한다. |
| 도메인은 새로 | 기존 도메인의 서브도메인 / 동일 zone을 쓰지 않는다. 일단 Vercel 기본 도메인(`*.vercel.app`)만 쓴다. |

---

## 1. 사전 점검 (5분)

로컬 프로젝트 폴더에서:

```bash
cd ~/Library/Application\ Support/Claude/local-agent-mode-sessions/.../outputs/x-hydride-lab
ls -la .git 2>/dev/null && echo "WARN: .git exists — 이미 어딘가에 연결됐을 수 있음" || echo "OK: 격리됨"
ls -la .env.local 2>/dev/null && echo "WARN: .env.local 있음 — 내용 확인 필요" || echo "OK: 깨끗함"
grep "@supabase\|@vercel/" -r src/ 2>/dev/null && echo "WARN: 외부 import 있음" || echo "OK: 외부 의존 없음"
```

세 줄 모두 `OK`여야 다음으로 진행한다.

---

## 2. GitHub 신규 레포 만들기

### 2-1. GitHub 웹에서 새 레포 생성

1. <https://github.com/new> 열기
2. **Owner**: 기존 프로젝트가 있는 organization은 선택하지 않는다. 본인 개인 계정이 가장 안전.
3. **Repository name**: `x-hydride-lab` (정확히 이 이름)
4. **Description**: `Grok-native AI discovery platform for hydride-based superconductors.`
5. **Public / Private**: 처음에는 **Private** 권장. 공개는 검수 끝난 뒤.
6. 다음 옵션은 모두 **체크하지 않음** — 이미 로컬에 다 있다:
   - Add a README
   - Add .gitignore
   - Choose a license
7. **Create repository** 클릭.
8. 만들어진 레포 URL 복사: `https://github.com/<your-username>/x-hydride-lab.git`

### 2-2. 로컬에서 git 초기화 + 첫 push

```bash
cd ~/Library/Application\ Support/Claude/local-agent-mode-sessions/.../outputs/x-hydride-lab

git init -b main
git add .
git status                      # .env*.local이 staged 안 되어 있는지 확인
git commit -m "Initial commit: X-Hydride Lab MVP"

git remote add origin https://github.com/<your-username>/x-hydride-lab.git
git push -u origin main
```

### 2-3. 검증

- GitHub 레포에 56개 정도의 파일이 보여야 한다.
- `.env.local`은 절대 보이면 안 된다 (보이면 `git rm --cached .env.local` 후 재커밋).
- 파일 트리에 `.env.example`은 있어야 한다 (이건 안전, 키 비어 있음).

---

## 3. Supabase 신규 프로젝트 만들기

> **지금 단계에서는 Supabase 연결이 필수가 아니다.** 데모 모드로 충분히 동작한다. 영속화가 필요할 때만 진행하면 된다. 일단 건너뛰고 4번(Vercel)으로 가도 된다.

### 3-1. 신규 프로젝트 생성

1. <https://supabase.com/dashboard> 로그인.
2. 좌측 상단의 organization 드롭다운에서 **이미 있는 organization을 그대로 두되, 새 프로젝트만 만든다**. 새 organization을 만들 필요는 없지만 기존 프로젝트와 명확히 분리하고 싶으면 신규 organization도 만들 수 있다.
3. **New Project** 클릭.
4. **Project name**: `x-hydride-lab`
5. **Database password**: 강력한 비밀번호 자동생성 후 1Password 등에 저장. 이 비밀번호는 다시 볼 수 없다.
6. **Region**: 본인과 가까운 곳 (Asia Northeast 등).
7. **Pricing plan**: Free 로 시작.
8. **Create new project** 클릭. 프로비저닝 1–2분 대기.

### 3-2. 스키마 적용

1. 프로젝트 사이드바 → **SQL Editor** → **New query**.
2. 로컬 파일 `supabase/schema.sql` 내용을 통째로 붙여넣기.
3. **Run** 클릭. 4개 테이블 (`candidates`, `reports`, `simulation_files`, `audit_logs`) + 인덱스가 만들어진다.
4. **Table Editor** 에서 4개 테이블이 모두 보이는지 확인.

### 3-3. 키 가져오기

1. 사이드바 → **Project Settings** → **API**.
2. 다음 세 값을 안전한 곳에 복사한다:
   - **Project URL**: `https://<random>.supabase.co` → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `eyJhbGc...` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: `eyJhbGc...` → `SUPABASE_SERVICE_ROLE_KEY` (절대 클라이언트에 노출 X)
3. 이 셋은 4단계 Vercel env vars에 입력한다.

### 3-4. RLS (지금은 비활성)

X-Hydride MVP는 인증을 사용하지 않으므로 Row Level Security는 비활성으로 시작한다 (`schema.sql`에 주석 처리된 `alter table ... enable row level security` 라인을 그대로 두면 됨).

인증을 추가할 때 RLS를 켜면서 정책을 작성한다.

### 3-5. 격리 확인

- Supabase 대시보드 좌상단 프로젝트 선택자에서 `x-hydride-lab`이 신규로 보여야 한다.
- 기존 프로젝트의 테이블에는 손대지 않는다.
- 한 organization 안에 여러 프로젝트가 있어도 DB는 완전히 분리되어 있다 (Postgres 인스턴스가 다름).

---

## 4. Vercel 신규 프로젝트 만들기

### 4-1. import 경로 (가장 중요)

1. <https://vercel.com/new> 열기.
2. **Import Git Repository** 섹션에서 방금 만든 `x-hydride-lab` 레포를 찾아 **Import** 클릭.
3. 만약 GitHub 권한이 없다고 나오면 **Adjust GitHub App permissions** → 새 레포만 선택해서 추가. 기존 레포 권한은 건드리지 않는다.
4. **Configure Project** 화면:
   - **Project Name**: `x-hydride-lab` (자동 채워짐)
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: 그대로 (`./`)
   - **Build Command**: 기본값 (`next build`) 그대로
   - **Output Directory**: 기본값 그대로
5. **Environment Variables** 섹션을 펼치고 아래 표를 그대로 입력 (지금 시점에 가지고 있는 값만):

| Name | Value | Environments |
| --- | --- | --- |
| `XAI_API_KEY` | xAI 콘솔에서 발급한 신규 키 | Production / Preview / Development |
| `XAI_MODEL` | `grok-4.3` | Production / Preview / Development |
| `XAI_BASE_URL` | `https://api.x.ai/v1` | Production / Preview / Development |
| `NEXT_PUBLIC_SUPABASE_URL` | (Supabase에서 복사) | Production / Preview / Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Supabase에서 복사) | Production / Preview / Development |
| `SUPABASE_SERVICE_ROLE_KEY` | (Supabase에서 복사) | **Production / Preview only** (Development 체크 해제) |
| `AUDIT_HASH_SALT` | 임의의 문자열 (예: `xh-prod-2026`) | Production / Preview / Development |

> **`SUPABASE_SERVICE_ROLE_KEY`는 Development 환경에 절대 넣지 않는다.** 로컬 개발은 anon key 만으로 충분하다. service role 키는 RLS를 우회할 수 있어서 사고 위험이 크다.

6. **Deploy** 클릭. 첫 빌드 2–4분.

### 4-2. 첫 배포 확인

1. 빌드 로그가 초록색 ✓ 로 끝나는지 확인.
2. **Visit** 버튼 클릭 → `https://x-hydride-lab.vercel.app` (또는 `x-hydride-lab-<hash>.vercel.app`) 열림.
3. 랜딩 페이지가 새 디자인으로 보이는지 확인.
4. `/overview` `/candidates` `/x-score` `/simulation` `/reports` `/audit` `/settings` 차례로 클릭해서 5xx 안 나는지 확인.

### 4-3. 격리 확인

- Vercel 대시보드 좌상단 팀 선택자가 본인 개인 팀 또는 새 팀이어야 한다 (기존 프로젝트가 있는 팀 안에 두어도 무방, 단 같은 이름 충돌 주의).
- **Project → Settings → Domains** 에는 `x-hydride-lab*.vercel.app` 만 있어야 한다. 기존 도메인 추가 금지.
- **Project → Settings → Environment Variables** 에 표 안의 값만 보여야 한다. 다른 키 (예: `STRIPE_*`, `OPENAI_*`) 가 자동 상속됐다면 다른 프로젝트 설정과 섞인 것 — 즉시 삭제.

---

## 5. 로컬에서 동일 환경 재현

로컬 개발에서 prod와 같은 동작을 보고 싶을 때만:

```bash
cp .env.example .env.local
```

`.env.local`을 열어 다음을 채운다:

```env
XAI_API_KEY=         # Vercel과 별개의 키 권장
XAI_MODEL=grok-4.3
XAI_BASE_URL=https://api.x.ai/v1

NEXT_PUBLIC_SUPABASE_URL=https://<random>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
# SUPABASE_SERVICE_ROLE_KEY 는 로컬에는 넣지 않는다.

AUDIT_HASH_SALT=xh-local-2026
```

```bash
npm install
npm run dev
```

`http://localhost:3000` 에서 동작 확인.

---

## 6. 격리 최종 체크리스트

배포 직후 5분간 다음을 모두 확인한다.

| 체크 | 통과 기준 |
| --- | --- |
| GitHub | <https://github.com/<you>/x-hydride-lab> 만 신규로 존재. 기존 레포 commit history에 X-Hydride 관련 커밋 없음. |
| Supabase | `x-hydride-lab` 프로젝트의 Table Editor에 4개 테이블만 존재. 기존 프로젝트의 테이블에 새 row 0개. |
| Vercel | `x-hydride-lab` 프로젝트만 새 deployment를 생성. 기존 프로젝트의 deployment 횟수 변동 없음. |
| 도메인 | `x-hydride-lab.vercel.app` 만 사용. 기존 커스텀 도메인에 X-Hydride 라우팅 없음. |
| Env vars | Vercel · Supabase · 로컬 모두 신규 키만 사용. 기존 프로젝트의 키와 동일한 값 0건. |
| 비용 | Free tier에서 시작. 결제 카드는 X-Hydride 전용으로 분리하거나, 최소한 Free 한도 내 사용. |

---

## 7. 만약 무언가 섞였을 때 (롤백)

| 상황 | 조치 |
| --- | --- |
| GitHub에 `.env.local`이 push 됐다 | (1) `git rm --cached .env.local` (2) 새 commit + push (3) **노출된 키는 즉시 폐기 / 재발급** (xAI 콘솔, Supabase API). 단순 git history rewrite는 키 폐기를 대체하지 못한다. |
| 다른 Vercel 프로젝트의 env vars가 자동 상속됐다 | Vercel project Settings → Environment Variables → 불필요한 키 삭제 → **redeploy**. |
| 다른 Supabase 프로젝트에 X-Hydride 테이블이 만들어졌다 | 그 프로젝트의 SQL Editor에서 `drop table candidates, reports, simulation_files, audit_logs cascade;` (단, 같은 이름의 다른 데이터가 있는지 먼저 확인). 그 후 신규 `x-hydride-lab` 프로젝트에 다시 적용. |
| 기존 GitHub repo에 X-Hydride 커밋이 들어갔다 | `git revert <commit-hash>` 후 push. 또는 force push 하지 말고 새 브랜치를 만들어 거기서만 진행. |

---

## 8. 다음 단계 (배포 이후)

1. Supabase 인증 도입 → RLS 활성화 → 정책 작성.
2. 커스텀 도메인 (예: `lab.x-hydride.org`) → Vercel Domains 에 추가 → DNS 설정.
3. 모니터링: Vercel Analytics + Supabase Logs.
4. CI: GitHub Actions로 `npm run type-check` 자동 실행.
5. 온체인 anchoring (audit chain_status `off-chain` → `pending` → `anchored`) 구현.

---

## 9. 자주 묻는 질문

**Q. 기존 organization에 `x-hydride-lab`을 만들면 안 되나?**
A. 만들어도 된다. 다만 동일 이름의 프로젝트가 있다면 충돌하므로 사전에 확인. 격리는 *프로젝트 단위*에서 보장된다 (Vercel·Supabase 모두 프로젝트마다 DB·env·도메인이 분리됨).

**Q. xAI 키를 기존에 만든 게 있다. 그걸 재사용해도 되나?**
A. 가능은 하지만 권장하지 않는다. 사용량·청구·rate limit이 섞여 디버깅이 어려워진다. xAI 콘솔에서 X-Hydride 전용 키를 새로 발급해라.

**Q. 처음부터 Supabase까지 다 켜야 하나?**
A. 아니다. **데모 모드로 시작 → Vercel 배포 → 정상 동작 확인 → 그 후 Supabase 연결**이 안전한 순서다. 데모 모드는 키 0개로 동작한다.

**Q. Vercel의 Preview deployment가 production DB에 쓰면 위험한데?**
A. 그래서 표에서 `SUPABASE_SERVICE_ROLE_KEY`는 Preview에도 넣었다. **Preview용 별도 Supabase 프로젝트 (예: `x-hydride-lab-staging`)** 를 만들어 Preview env vars만 거기로 가리키게 하면 더 안전하다. 시간이 되면 분리.

**Q. 로컬과 prod의 candidates 데이터가 다르다.**
A. 정상이다. 데모 모드는 로컬 storage에만 저장된다. Supabase가 연결되면 그제서야 모든 환경이 같은 DB를 본다 (Preview는 별도 DB로 분리하면 더 깨끗).

---

## 10. 한 줄 요약

> 모든 리소스를 **신규**로 만들고, 이름을 **`x-hydride-lab`** 로 통일하고, 키를 **별도 발급** 한다. 데모 모드 → Vercel → Supabase 순으로 점진 연결. 기존 프로젝트의 GitHub repo / Supabase project / Vercel project / 키 / 도메인은 절대 건드리지 않는다.
