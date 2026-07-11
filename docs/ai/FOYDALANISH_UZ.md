# Codex workflow’dan foydalanish (o‘zbekcha qo‘llanma)

Bu fayl siz uchun qisqa boshqaruv qo‘llanmasi. Agentlar ishlaydigan asosiy texnik hujjatlar inglizcha yozilgan — bu kod, termin va acceptance criteria talqinini aniqroq saqlaydi.

## Tavsiya etilgan usul

Loyihani 10 ta ketma-ket bosqichda bajaring:

1. Next.js foundation va umumiy UI primitive’lar.
2. API, Zod, domain model va barcha hisoblash formulalari.
3. App shell, responsive navigation, tema va tarjima.
4. Users sahifasi.
5. Products sahifasi.
6. Orders sahifasi.
7. Dashboard.
8. Analytics.
9. Settings va error/resilience holatlari.
10. To‘liq QA, README va release audit.

Bosqichlar parallel kodlanmaydi. Aks holda bir chat umumiy komponent yoki formulani o‘zgartirib, ikkinchi chatning ishini buzishi mumkin. Review chat parallel bo‘lishi mumkin, lekin u read-only bo‘lishi shart.

## Har yangi chatda nima qilish kerak

1. `STATUS.md`ni oching va `NEXT` turgan bosqichni ko‘ring.
2. `05_CODEX_PROMPTS.md`dan avval **Controller prompt**, keyin aynan shu phase promptini yangi chatga yuboring.
3. Agent phase’ni tugatgach, uning javobini `STATUS.md` bilan solishtiring.
4. Barcha check’lar o‘tgan bo‘lsa keyingi phase’ga o‘ting.
5. Check yiqilgan yoki review P0/P1 muammo topgan bo‘lsa **Repair prompt**ni ishlating; keyingi phase’ga o‘tmang.

Agent har phase oxirida quyidagilarni `STATUS.md`ga yozishi shart:

- aynan nima qilindi;
- qaysi muhim fayllar o‘zgardi;
- qaysi command va browser tekshiruvlari PASS/FAIL bo‘ldi;
- qolgan muammo yoki risk;
- keyingi aniq phase/prompt.

Shu mexanizm sabab yangi chat eski chatning kontekstini taxmin qilmaydi — repo ichidagi live statusni o‘qib davom etadi.

## Bitta chatda hammasini qilish varianti

Agar bitta Codex chat yetarlicha uzoq ishlay olsa, `05_CODEX_PROMPTS.md`dagi **Single-session orchestrator prompt**ni yuboring. U Phase 1dan Phase 10gacha o‘zi yuradi, lekin har phase quality gate’ini baribir alohida yopadi. Bir bosqich yiqilsa, keyingisiga sakramaydi.

Mening tavsiyam: maksimal sifat uchun phase’larni alohida chatlarda bajaring va muhim phase’lardan keyin **Reviewer-only prompt** bilan mustaqil tekshiruv qiling. Ayniqsa Phase 2, 4, 7, 8 va 10dan keyin review foydali.

## Siz boshqaruvchi bo‘lsangiz, nimani tekshirasiz

- Agent faqat o‘z phase’i doirasida ishladimi?
- `STATUS.md` haqiqiy diff va command natijasiga mosmi?
- “Build ishladi” degan gap aniq command natijasi bilan isbotlanganmi?
- UI o‘zgargan bo‘lsa 360/768/1440 viewport va light/dark real browserda ko‘rilganmi?
- Formula, route, state management yoki dependency o‘zgargan bo‘lsa `DECISIONS.md`ga ADR yozilganmi?
- P0/P1 muammo qolmaganmi?

## Eng muhim fayllar

- Boshlash: `docs/ai/STATUS.md`
- Prompt tanlash: `docs/ai/05_CODEX_PROMPTS.md`
- Phase scope: `docs/ai/04_EXECUTION_PLAN.md`
- Product talablari: `docs/ai/01_PRODUCT_SPEC.md`
- Formula/arxitektura: `docs/ai/02_TECHNICAL_SPEC.md`
- Final tekshiruv: `docs/ai/06_QA_CHECKLIST.md`

## Birinchi qadam

Hozirgi status bo‘yicha navbatdagi ish — **Phase 1: Bootstrap and foundations**. Yangi chatga Controller prompt va Phase 1 promptni yuborish kifoya.
