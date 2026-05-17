export type Language = 'uk' | 'ru' | 'en';

export type TranslationKey = keyof typeof translations.uk;

export const translations = {
  uk: {
    // ── Navigation ──────────────────────────────────────────────────────────
    'nav.home': 'Головна',
    'nav.about': 'Про мене',
    'nav.services': 'Послуги',
    'nav.blog': 'Блог',
    'nav.tools': 'Інструменти',
    'nav.contacts': 'Контакти',

    // ── Header ───────────────────────────────────────────────────────────────
    'header.logo.name': 'Ellen Soul',
    'header.logo.subtitle': 'таро · психологія',
    'header.cta': 'Записатись',

    // ── Home — Hero ──────────────────────────────────────────────────────────
    'home.hero.tags': 'ТАРО · ПСИХОЛОГІЯ · ВІДНОСИНИ',
    'home.hero.title': 'Коли слова не допомагають — карти розкажуть правду',
    'home.hero.subtitle':
      'Індивідуальні консультації з таро та психологічна підтримка для тих, хто шукає ясність і напрямок',
    'home.hero.cta.primary': 'Записатись на консультацію',
    'home.hero.cta.secondary': 'Дізнатись більше',

    // ── Home — Services section ──────────────────────────────────────────────
    'home.services.section': 'ПОСЛУГИ',
    'home.services.title': 'Як я можу допомогти',
    'home.services.subtitle':
      'Кожна консультація — це унікальний простір для вашого зростання та розуміння',
    'home.services.tarot.title': 'Таро-консультація',
    'home.services.tarot.desc':
      'Глибинний аналіз вашої ситуації через символіку карт. Відповіді на хвилюючі питання щодо стосунків, кар\'єри, особистого розвитку.',
    'home.services.psychology.title': 'Психологічна підтримка',
    'home.services.psychology.desc':
      'Робота з внутрішніми блоками, страхами та переконаннями. Інтеграція таро з психологічними техніками для глибшого розуміння себе.',
    'home.services.couples.title': 'Консультації для пар',
    'home.services.couples.desc':
      'Дослідження динаміки стосунків, покращення комунікації та розуміння потреб одне одного через призму карт.',
    'home.services.link': 'Всі послуги',

    // ── Home — About section ─────────────────────────────────────────────────
    'home.about.section': 'ПРО МЕНЕ',
    'home.about.title': 'Ellen Soul',
    'home.about.p1':
      'Я практикуючий таролог та психолог з більш ніж 8 роками досвіду. Мій підхід поєднує глибоке знання символіки таро з сучасними психологічними методами.',
    'home.about.p2':
      'Моя місія — допомогти вам знайти ясність у складних ситуаціях, розкрити власні ресурси та рухатись вперед з впевненістю.',
    'home.about.stat1.value': '500+',
    'home.about.stat1.label': 'консультацій',
    'home.about.stat2.value': '8+',
    'home.about.stat2.label': 'років досвіду',
    'home.about.stat3.value': '98%',
    'home.about.stat3.label': 'задоволених клієнтів',
    'home.about.link': 'Читати більше',

    // ── Home — Testimonials ──────────────────────────────────────────────────
    'home.testimonials.section': 'ВІДГУКИ',
    'home.testimonials.title': 'Що кажуть клієнти',

    // ── Home — FAQ ───────────────────────────────────────────────────────────
    'home.faq.section': 'FAQ',
    'home.faq.title': 'Питання та відповіді',
    'home.faq.q1': 'Як проходить консультація?',
    'home.faq.a1':
      'Консультація проходить онлайн через Zoom або Telegram. Тривалість — 60-90 хвилин. Ви можете задати будь-яке питання, яке вас хвилює.',
    'home.faq.q2': 'Чи потрібно вірити в таро?',
    'home.faq.a2':
      'Ні. Таро — це інструмент для рефлексії та дослідження свого внутрішнього світу. Скептицизм цілком нормальний.',
    'home.faq.q3': 'Скільки коштує консультація?',
    'home.faq.a3':
      'Вартість залежить від формату. Детальний прайс-лист можна знайти на сторінці послуг.',
    'home.faq.q4': 'Як записатись?',
    'home.faq.a4':
      'Напишіть мені в Telegram або заповніть форму на сторінці контактів. Я відповім протягом 24 годин.',

    // ── Home — CTA banner ────────────────────────────────────────────────────
    'home.cta.title': 'Готові знайти відповіді?',
    'home.cta.subtitle':
      'Запишіться на консультацію сьогодні та зробіть перший крок до ясності',
    'home.cta.button': 'Записатись зараз',

    // ── Services page ────────────────────────────────────────────────────────
    'services.hero.section': 'ПОСЛУГИ',
    'services.hero.title': 'Мої послуги',
    'services.hero.subtitle':
      'Індивідуальний підхід до кожного клієнта. Конфіденційність та повага гарантовані.',

    'services.tarot.title': 'Таро-консультація',
    'services.tarot.duration': '60–90 хвилин',
    'services.tarot.desc':
      'Глибинний розклад на актуальну ситуацію з детальним розбором кожної карти. Підходить для питань про стосунки, кар\'єру, фінанси та особистий розвиток.',
    'services.tarot.feature1': 'Аналіз поточної ситуації',
    'services.tarot.feature2': 'Можливі сценарії розвитку подій',
    'services.tarot.feature3': 'Практичні рекомендації',
    'services.tarot.feature4': 'Запис консультації',

    'services.psychology.title': 'Психологічна консультація',
    'services.psychology.duration': '60 хвилин',
    'services.psychology.desc':
      'Робота з психологічними запитами: тривога, самооцінка, стосунки, вигорання. Інтегративний підхід із використанням різних терапевтичних методів.',
    'services.psychology.feature1': 'Безпечний простір для вираження',
    'services.psychology.feature2': 'Робота з переконаннями',
    'services.psychology.feature3': 'Практичні техніки самодопомоги',
    'services.psychology.feature4': 'Підтримка між сесіями',

    'services.couples.title': 'Консультація для пар',
    'services.couples.duration': '90 хвилин',
    'services.couples.desc':
      'Дослідження динаміки ваших стосунків, пошук спільної мови та розуміння. Таро як дзеркало для пари.',
    'services.couples.feature1': 'Аналіз сумісності',
    'services.couples.feature2': 'Покращення комунікації',
    'services.couples.feature3': 'Вирішення конфліктів',
    'services.couples.feature4': 'Вектор розвитку стосунків',

    'services.monthly.title': 'Місячний супровід',
    'services.monthly.duration': '4 сесії на місяць',
    'services.monthly.desc':
      'Регулярна підтримка та відстеження вашого прогресу. Ідеально для тих, хто хоче стабільних змін та постійної підтримки.',
    'services.monthly.feature1': '4 сесії на місяць',
    'services.monthly.feature2': 'Щотижневі таро-картки',
    'services.monthly.feature3': 'Необмежена підтримка в чаті',
    'services.monthly.feature4': 'Персональний план розвитку',

    'services.cta.title': 'Не знаєте, що обрати?',
    'services.cta.subtitle':
      'Напишіть мені — разом ми знайдемо найкращий формат саме для вас',
    'services.cta.button': 'Написати мені',
    'services.book': 'Записатись',
    'services.popular': 'Популярне',

    // ── About page ───────────────────────────────────────────────────────────
    'about.hero.section': 'ПРО МЕНЕ',
    'about.hero.title': 'Ellen Soul',
    'about.hero.subtitle': 'Таролог · Психолог · Провідник',

    'about.story.section': 'МОЯ ІСТОРІЯ',
    'about.story.title': 'Шлях до себе',
    'about.story.p1':
      'Моя подорож у світ таро та психології розпочалась понад 8 років тому, коли я сама шукала відповіді на складні питання свого життя. Карти стали для мене не інструментом ворожби, а дзеркалом душі.',
    'about.story.p2':
      'Я отримала психологічну освіту та пройшла кілька сертифікованих курсів з таро, юнгіанської психології та символічної терапії. Сьогодні я допомагаю іншим знаходити ясність та рухатись вперед.',
    'about.story.p3':
      'Кожна консультація для мене — це священний простір довіри, де ви можете бути собою без осуду та страху. Я вірю, що у кожної людини є всі відповіді всередині — іноді просто потрібна допомога, щоб їх почути.',

    'about.values.section': 'МОЇ ЦІННОСТІ',
    'about.values.title': 'Що для мене важливо',
    'about.values.v1.title': 'Конфіденційність',
    'about.values.v1.desc': 'Все, що ви розповідаєте на сесії, залишається між нами. Завжди.',
    'about.values.v2.title': 'Чесність',
    'about.values.v2.desc': 'Я говорю правду, навіть коли вона незручна. М\'яко, але відкрито.',
    'about.values.v3.title': 'Безосудність',
    'about.values.v3.desc': 'Немає "правильних" або "неправильних" ситуацій. Є тільки ваш шлях.',
    'about.values.v4.title': 'Розвиток',
    'about.values.v4.desc': 'Я постійно навчаюсь і розвиваюсь, щоб давати вам найкраще.',

    'about.education.section': 'ОСВІТА',
    'about.education.title': 'Навчання та сертифікати',
    'about.education.e1.title': 'Психологічний факультет',
    'about.education.e1.place': 'Національний університет',
    'about.education.e1.year': '2014–2018',
    'about.education.e2.title': 'Сертифікований таролог',
    'about.education.e2.place': 'Міжнародна школа таро',
    'about.education.e2.year': '2016',
    'about.education.e3.title': 'Юнгіанська психологія',
    'about.education.e3.place': 'Онлайн-курс, Швейцарія',
    'about.education.e3.year': '2019',
    'about.education.e4.title': 'Символічна терапія',
    'about.education.e4.place': 'Інститут символічного мислення',
    'about.education.e4.year': '2021',

    'about.cta.title': 'Готові познайомитись?',
    'about.cta.subtitle': 'Запишіться на першу консультацію та відчуйте різницю',
    'about.cta.button': 'Записатись',

    // ── Blog page ────────────────────────────────────────────────────────────
    'blog.hero.section': 'БЛОГ',
    'blog.hero.title': 'Статті та роздуми',
    'blog.hero.subtitle':
      'Думки про таро, психологію, стосунки та шлях до себе',
    'blog.categories.all': 'Всі',
    'blog.categories.tarot': 'Таро',
    'blog.categories.psychology': 'Психологія',
    'blog.categories.relationships': 'Стосунки',
    'blog.categories.practice': 'Практика',
    'blog.read_more': 'Читати далі',
    'blog.min_read': 'хв читання',
    'blog.search.placeholder': 'Пошук статей...',
    'blog.no_results': 'Статей не знайдено',
    'blog.load_more': 'Завантажити ще',

    // ── Tools page ───────────────────────────────────────────────────────────
    'tools.hero.section': 'ІНСТРУМЕНТИ',
    'tools.hero.title': 'Безкоштовні інструменти',
    'tools.hero.subtitle':
      'Практичні ресурси для вашого самопізнання та розвитку',
    'tools.card_of_day.title': 'Карта дня',
    'tools.card_of_day.desc': 'Отримайте послання від карти на сьогодні',
    'tools.card_of_day.button': 'Витягнути карту',
    'tools.spread.title': 'Розклад на тиждень',
    'tools.spread.desc': 'Три карти, що відображають вашу тиждень',
    'tools.spread.button': 'Зробити розклад',
    'tools.journal.title': 'Щоденник таро',
    'tools.journal.desc': 'Ведіть записи ваших розкладів та інсайтів',
    'tools.journal.button': 'Відкрити щоденник',
    'tools.affirmations.title': 'Афірмації дня',
    'tools.affirmations.desc': 'Щоденні аффірмації на основі вашої карти',
    'tools.affirmations.button': 'Отримати афірмацію',
    'tools.coming_soon': 'Скоро',

    // ── Contacts page ────────────────────────────────────────────────────────
    'contacts.hero.section': 'КОНТАКТИ',
    'contacts.hero.title': 'Зв\'яжіться зі мною',
    'contacts.hero.subtitle': 'Я відповідаю протягом 24 годин',
    'contacts.form.name': 'Ваше ім\'я',
    'contacts.form.email': 'Email',
    'contacts.form.message': 'Ваше повідомлення',
    'contacts.form.submit': 'Надіслати',
    'contacts.form.name.placeholder': 'Як до вас звертатись?',
    'contacts.form.email.placeholder': 'your@email.com',
    'contacts.form.message.placeholder': 'Розкажіть про ваш запит...',
    'contacts.form.success': 'Дякую! Я напишу вам найближчим часом.',
    'contacts.form.error': 'Помилка відправки. Спробуйте ще раз.',
    'contacts.telegram': 'Telegram',
    'contacts.instagram': 'Instagram',
    'contacts.email': 'Email',
    'contacts.working_hours': 'Години роботи',
    'contacts.working_hours.value': 'Пн–Пт: 10:00–20:00',

    // ── Footer ───────────────────────────────────────────────────────────────
    'footer.tagline': 'Таро · Психологія · Відносини',
    'footer.nav.title': 'Навігація',
    'footer.services.title': 'Послуги',
    'footer.services.tarot': 'Таро-консультація',
    'footer.services.psychology': 'Психологія',
    'footer.services.couples': 'Для пар',
    'footer.social.title': 'Соціальні мережі',
    'footer.copyright': '© 2025 Ellen Soul. Всі права захищені.',
    'footer.privacy': 'Політика конфіденційності',
  },

  ru: {
    // ── Navigation ──────────────────────────────────────────────────────────
    'nav.home': 'Главная',
    'nav.about': 'Обо мне',
    'nav.services': 'Услуги',
    'nav.blog': 'Блог',
    'nav.tools': 'Инструменты',
    'nav.contacts': 'Контакты',

    // ── Header ───────────────────────────────────────────────────────────────
    'header.logo.name': 'Ellen Soul',
    'header.logo.subtitle': 'таро · психология',
    'header.cta': 'Записаться',

    // ── Home — Hero ──────────────────────────────────────────────────────────
    'home.hero.tags': 'ТАРО · ПСИХОЛОГИЯ · ОТНОШЕНИЯ',
    'home.hero.title': 'Когда слова не помогают — карты расскажут правду',
    'home.hero.subtitle':
      'Индивидуальные консультации по таро и психологическая поддержка для тех, кто ищет ясность и направление',
    'home.hero.cta.primary': 'Записаться на консультацию',
    'home.hero.cta.secondary': 'Узнать больше',

    // ── Home — Services section ──────────────────────────────────────────────
    'home.services.section': 'УСЛУГИ',
    'home.services.title': 'Как я могу помочь',
    'home.services.subtitle':
      'Каждая консультация — это уникальное пространство для вашего роста и понимания',
    'home.services.tarot.title': 'Консультация по таро',
    'home.services.tarot.desc':
      'Глубинный анализ вашей ситуации через символику карт. Ответы на волнующие вопросы об отношениях, карьере, личном развитии.',
    'home.services.psychology.title': 'Психологическая поддержка',
    'home.services.psychology.desc':
      'Работа с внутренними блоками, страхами и убеждениями. Интеграция таро с психологическими техниками для более глубокого понимания себя.',
    'home.services.couples.title': 'Консультации для пар',
    'home.services.couples.desc':
      'Исследование динамики отношений, улучшение коммуникации и понимание потребностей друг друга через призму карт.',
    'home.services.link': 'Все услуги',

    // ── Home — About section ─────────────────────────────────────────────────
    'home.about.section': 'ОБО МНЕ',
    'home.about.title': 'Ellen Soul',
    'home.about.p1':
      'Я практикующий таролог и психолог с более чем 8-летним опытом. Мой подход сочетает глубокое знание символики таро с современными психологическими методами.',
    'home.about.p2':
      'Моя миссия — помочь вам найти ясность в сложных ситуациях, раскрыть собственные ресурсы и двигаться вперёд с уверенностью.',
    'home.about.stat1.value': '500+',
    'home.about.stat1.label': 'консультаций',
    'home.about.stat2.value': '8+',
    'home.about.stat2.label': 'лет опыта',
    'home.about.stat3.value': '98%',
    'home.about.stat3.label': 'довольных клиентов',
    'home.about.link': 'Читать далее',

    // ── Home — Testimonials ──────────────────────────────────────────────────
    'home.testimonials.section': 'ОТЗЫВЫ',
    'home.testimonials.title': 'Что говорят клиенты',

    // ── Home — FAQ ───────────────────────────────────────────────────────────
    'home.faq.section': 'FAQ',
    'home.faq.title': 'Вопросы и ответы',
    'home.faq.q1': 'Как проходит консультация?',
    'home.faq.a1':
      'Консультация проходит онлайн через Zoom или Telegram. Продолжительность — 60–90 минут. Вы можете задать любой вопрос, который вас волнует.',
    'home.faq.q2': 'Нужно ли верить в таро?',
    'home.faq.a2':
      'Нет. Таро — это инструмент для рефлексии и исследования своего внутреннего мира. Скептицизм вполне нормален.',
    'home.faq.q3': 'Сколько стоит консультация?',
    'home.faq.a3':
      'Стоимость зависит от формата. Подробный прайс-лист можно найти на странице услуг.',
    'home.faq.q4': 'Как записаться?',
    'home.faq.a4':
      'Напишите мне в Telegram или заполните форму на странице контактов. Я отвечу в течение 24 часов.',

    // ── Home — CTA banner ────────────────────────────────────────────────────
    'home.cta.title': 'Готовы найти ответы?',
    'home.cta.subtitle':
      'Запишитесь на консультацию сегодня и сделайте первый шаг к ясности',
    'home.cta.button': 'Записаться сейчас',

    // ── Services page ────────────────────────────────────────────────────────
    'services.hero.section': 'УСЛУГИ',
    'services.hero.title': 'Мои услуги',
    'services.hero.subtitle':
      'Индивидуальный подход к каждому клиенту. Конфиденциальность и уважение гарантированы.',

    'services.tarot.title': 'Консультация по таро',
    'services.tarot.duration': '60–90 минут',
    'services.tarot.desc':
      'Глубинный расклад на актуальную ситуацию с детальным разбором каждой карты. Подходит для вопросов об отношениях, карьере, финансах и личном развитии.',
    'services.tarot.feature1': 'Анализ текущей ситуации',
    'services.tarot.feature2': 'Возможные сценарии развития событий',
    'services.tarot.feature3': 'Практические рекомендации',
    'services.tarot.feature4': 'Запись консультации',

    'services.psychology.title': 'Психологическая консультация',
    'services.psychology.duration': '60 минут',
    'services.psychology.desc':
      'Работа с психологическими запросами: тревога, самооценка, отношения, выгорание. Интегративный подход с использованием различных терапевтических методов.',
    'services.psychology.feature1': 'Безопасное пространство для выражения',
    'services.psychology.feature2': 'Работа с убеждениями',
    'services.psychology.feature3': 'Практические техники самопомощи',
    'services.psychology.feature4': 'Поддержка между сессиями',

    'services.couples.title': 'Консультация для пар',
    'services.couples.duration': '90 минут',
    'services.couples.desc':
      'Исследование динамики ваших отношений, поиск общего языка и понимания. Таро как зеркало для пары.',
    'services.couples.feature1': 'Анализ совместимости',
    'services.couples.feature2': 'Улучшение коммуникации',
    'services.couples.feature3': 'Разрешение конфликтов',
    'services.couples.feature4': 'Вектор развития отношений',

    'services.monthly.title': 'Ежемесячное сопровождение',
    'services.monthly.duration': '4 сессии в месяц',
    'services.monthly.desc':
      'Регулярная поддержка и отслеживание вашего прогресса. Идеально для тех, кто хочет стабильных изменений и постоянной поддержки.',
    'services.monthly.feature1': '4 сессии в месяц',
    'services.monthly.feature2': 'Еженедельные карты таро',
    'services.monthly.feature3': 'Неограниченная поддержка в чате',
    'services.monthly.feature4': 'Персональный план развития',

    'services.cta.title': 'Не знаете, что выбрать?',
    'services.cta.subtitle':
      'Напишите мне — вместе мы найдём лучший формат именно для вас',
    'services.cta.button': 'Написать мне',
    'services.book': 'Записаться',
    'services.popular': 'Популярное',

    // ── About page ───────────────────────────────────────────────────────────
    'about.hero.section': 'ОБО МНЕ',
    'about.hero.title': 'Ellen Soul',
    'about.hero.subtitle': 'Таролог · Психолог · Проводник',

    'about.story.section': 'МОЯ ИСТОРИЯ',
    'about.story.title': 'Путь к себе',
    'about.story.p1':
      'Мой путь в мир таро и психологии начался более 8 лет назад, когда я сама искала ответы на сложные вопросы своей жизни. Карты стали для меня не инструментом гадания, а зеркалом души.',
    'about.story.p2':
      'Я получила психологическое образование и прошла несколько сертифицированных курсов по таро, юнгианской психологии и символической терапии. Сегодня я помогаю другим находить ясность и двигаться вперёд.',
    'about.story.p3':
      'Каждая консультация для меня — это священное пространство доверия, где вы можете быть собой без осуждения и страха. Я верю, что у каждого человека есть все ответы внутри — иногда просто нужна помощь, чтобы их услышать.',

    'about.values.section': 'МОИ ЦЕННОСТИ',
    'about.values.title': 'Что для меня важно',
    'about.values.v1.title': 'Конфиденциальность',
    'about.values.v1.desc': 'Всё, что вы рассказываете на сессии, остаётся между нами. Всегда.',
    'about.values.v2.title': 'Честность',
    'about.values.v2.desc': 'Я говорю правду, даже когда она неудобна. Мягко, но открыто.',
    'about.values.v3.title': 'Безоценочность',
    'about.values.v3.desc': 'Нет "правильных" или "неправильных" ситуаций. Есть только ваш путь.',
    'about.values.v4.title': 'Развитие',
    'about.values.v4.desc': 'Я постоянно учусь и развиваюсь, чтобы давать вам лучшее.',

    'about.education.section': 'ОБРАЗОВАНИЕ',
    'about.education.title': 'Обучение и сертификаты',
    'about.education.e1.title': 'Психологический факультет',
    'about.education.e1.place': 'Национальный университет',
    'about.education.e1.year': '2014–2018',
    'about.education.e2.title': 'Сертифицированный таролог',
    'about.education.e2.place': 'Международная школа таро',
    'about.education.e2.year': '2016',
    'about.education.e3.title': 'Юнгианская психология',
    'about.education.e3.place': 'Онлайн-курс, Швейцария',
    'about.education.e3.year': '2019',
    'about.education.e4.title': 'Символическая терапия',
    'about.education.e4.place': 'Институт символического мышления',
    'about.education.e4.year': '2021',

    'about.cta.title': 'Готовы познакомиться?',
    'about.cta.subtitle': 'Запишитесь на первую консультацию и почувствуйте разницу',
    'about.cta.button': 'Записаться',

    // ── Blog page ────────────────────────────────────────────────────────────
    'blog.hero.section': 'БЛОГ',
    'blog.hero.title': 'Статьи и размышления',
    'blog.hero.subtitle':
      'Мысли о таро, психологии, отношениях и пути к себе',
    'blog.categories.all': 'Все',
    'blog.categories.tarot': 'Таро',
    'blog.categories.psychology': 'Психология',
    'blog.categories.relationships': 'Отношения',
    'blog.categories.practice': 'Практика',
    'blog.read_more': 'Читать далее',
    'blog.min_read': 'мин чтения',
    'blog.search.placeholder': 'Поиск статей...',
    'blog.no_results': 'Статьи не найдены',
    'blog.load_more': 'Загрузить ещё',

    // ── Tools page ───────────────────────────────────────────────────────────
    'tools.hero.section': 'ИНСТРУМЕНТЫ',
    'tools.hero.title': 'Бесплатные инструменты',
    'tools.hero.subtitle':
      'Практические ресурсы для вашего самопознания и развития',
    'tools.card_of_day.title': 'Карта дня',
    'tools.card_of_day.desc': 'Получите послание от карты на сегодня',
    'tools.card_of_day.button': 'Вытянуть карту',
    'tools.spread.title': 'Расклад на неделю',
    'tools.spread.desc': 'Три карты, отражающие вашу неделю',
    'tools.spread.button': 'Сделать расклад',
    'tools.journal.title': 'Дневник таро',
    'tools.journal.desc': 'Ведите записи ваших раскладов и инсайтов',
    'tools.journal.button': 'Открыть дневник',
    'tools.affirmations.title': 'Аффирмации дня',
    'tools.affirmations.desc': 'Ежедневные аффирмации на основе вашей карты',
    'tools.affirmations.button': 'Получить аффирмацию',
    'tools.coming_soon': 'Скоро',

    // ── Contacts page ────────────────────────────────────────────────────────
    'contacts.hero.section': 'КОНТАКТЫ',
    'contacts.hero.title': 'Свяжитесь со мной',
    'contacts.hero.subtitle': 'Я отвечаю в течение 24 часов',
    'contacts.form.name': 'Ваше имя',
    'contacts.form.email': 'Email',
    'contacts.form.message': 'Ваше сообщение',
    'contacts.form.submit': 'Отправить',
    'contacts.form.name.placeholder': 'Как к вам обращаться?',
    'contacts.form.email.placeholder': 'your@email.com',
    'contacts.form.message.placeholder': 'Расскажите о вашем запросе...',
    'contacts.form.success': 'Спасибо! Я напишу вам в ближайшее время.',
    'contacts.form.error': 'Ошибка отправки. Попробуйте ещё раз.',
    'contacts.telegram': 'Telegram',
    'contacts.instagram': 'Instagram',
    'contacts.email': 'Email',
    'contacts.working_hours': 'Часы работы',
    'contacts.working_hours.value': 'Пн–Пт: 10:00–20:00',

    // ── Footer ───────────────────────────────────────────────────────────────
    'footer.tagline': 'Таро · Психология · Отношения',
    'footer.nav.title': 'Навигация',
    'footer.services.title': 'Услуги',
    'footer.services.tarot': 'Консультация по таро',
    'footer.services.psychology': 'Психология',
    'footer.services.couples': 'Для пар',
    'footer.social.title': 'Социальные сети',
    'footer.copyright': '© 2025 Ellen Soul. Все права защищены.',
    'footer.privacy': 'Политика конфиденциальности',
  },

  en: {
    // ── Navigation ──────────────────────────────────────────────────────────
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.blog': 'Blog',
    'nav.tools': 'Tools',
    'nav.contacts': 'Contacts',

    // ── Header ───────────────────────────────────────────────────────────────
    'header.logo.name': 'Ellen Soul',
    'header.logo.subtitle': 'tarot · psychology',
    'header.cta': 'Book a session',

    // ── Home — Hero ──────────────────────────────────────────────────────────
    'home.hero.tags': 'TAROT · PSYCHOLOGY · RELATIONSHIPS',
    'home.hero.title': 'When words fail — the cards will tell the truth',
    'home.hero.subtitle':
      'Individual tarot consultations and psychological support for those seeking clarity and direction',
    'home.hero.cta.primary': 'Book a consultation',
    'home.hero.cta.secondary': 'Learn more',

    'home.services.section': 'SERVICES',
    'home.services.title': 'How I can help',
    'home.services.subtitle':
      'Every consultation is a unique space for your growth and understanding',
    'home.services.tarot.title': 'Tarot consultation',
    'home.services.tarot.desc':
      'In-depth analysis of your situation through card symbolism. Answers to pressing questions about relationships, career, and personal growth.',
    'home.services.psychology.title': 'Psychological support',
    'home.services.psychology.desc':
      'Working with inner blocks, fears and beliefs. Integrating tarot with psychological techniques for deeper self-understanding.',
    'home.services.couples.title': 'Couples consultations',
    'home.services.couples.desc':
      'Exploring relationship dynamics, improving communication and understanding each other\'s needs through the lens of the cards.',
    'home.services.link': 'All services',

    'home.about.section': 'ABOUT ME',
    'home.about.title': 'Ellen Soul',
    'home.about.p1':
      'I am a practising tarot reader and psychologist with over 8 years of experience. My approach combines deep knowledge of tarot symbolism with modern psychological methods.',
    'home.about.p2':
      'My mission is to help you find clarity in complex situations, unlock your own resources and move forward with confidence.',
    'home.about.stat1.value': '500+',
    'home.about.stat1.label': 'consultations',
    'home.about.stat2.value': '8+',
    'home.about.stat2.label': 'years of experience',
    'home.about.stat3.value': '98%',
    'home.about.stat3.label': 'satisfied clients',
    'home.about.link': 'Read more',

    'home.testimonials.section': 'TESTIMONIALS',
    'home.testimonials.title': 'What clients say',

    'home.faq.section': 'FAQ',
    'home.faq.title': 'Questions & Answers',
    'home.faq.q1': 'How does a consultation work?',
    'home.faq.a1':
      'Consultations are held online via Zoom or Telegram. Duration: 60–90 minutes. You can ask any question that concerns you.',
    'home.faq.q2': 'Do I need to believe in tarot?',
    'home.faq.a2':
      'No. Tarot is a tool for reflection and exploring your inner world. Scepticism is perfectly normal.',
    'home.faq.q3': 'How much does a consultation cost?',
    'home.faq.a3':
      'The price depends on the format. A detailed price list can be found on the services page.',
    'home.faq.q4': 'How do I book?',
    'home.faq.a4':
      'Write to me on Telegram or fill in the form on the contacts page. I will reply within 24 hours.',

    'home.cta.title': 'Ready to find answers?',
    'home.cta.subtitle':
      'Book a consultation today and take the first step towards clarity',
    'home.cta.button': 'Book now',

    'services.hero.section': 'SERVICES',
    'services.hero.title': 'My services',
    'services.hero.subtitle':
      'Individual approach to every client. Confidentiality and respect guaranteed.',
    'services.tarot.title': 'Tarot consultation',
    'services.tarot.duration': '60–90 minutes',
    'services.tarot.desc':
      'An in-depth reading of your current situation with a detailed breakdown of each card. Suitable for questions about relationships, career, finances and personal growth.',
    'services.tarot.feature1': 'Analysis of the current situation',
    'services.tarot.feature2': 'Possible scenarios',
    'services.tarot.feature3': 'Practical recommendations',
    'services.tarot.feature4': 'Session recording',
    'services.psychology.title': 'Psychological consultation',
    'services.psychology.duration': '60 minutes',
    'services.psychology.desc':
      'Working with psychological requests: anxiety, self-esteem, relationships, burnout. Integrative approach using various therapeutic methods.',
    'services.psychology.feature1': 'Safe space for expression',
    'services.psychology.feature2': 'Working with beliefs',
    'services.psychology.feature3': 'Practical self-help techniques',
    'services.psychology.feature4': 'Support between sessions',
    'services.couples.title': 'Couples consultation',
    'services.couples.duration': '90 minutes',
    'services.couples.desc':
      'Exploring the dynamics of your relationship, finding common ground and understanding. Tarot as a mirror for the couple.',
    'services.couples.feature1': 'Compatibility analysis',
    'services.couples.feature2': 'Improving communication',
    'services.couples.feature3': 'Conflict resolution',
    'services.couples.feature4': 'Relationship development vector',
    'services.monthly.title': 'Monthly support',
    'services.monthly.duration': '4 sessions per month',
    'services.monthly.desc':
      'Regular support and progress tracking. Ideal for those who want lasting change and ongoing support.',
    'services.monthly.feature1': '4 sessions per month',
    'services.monthly.feature2': 'Weekly tarot cards',
    'services.monthly.feature3': 'Unlimited chat support',
    'services.monthly.feature4': 'Personal development plan',
    'services.cta.title': 'Not sure which to choose?',
    'services.cta.subtitle':
      'Write to me — together we will find the best format just for you',
    'services.cta.button': 'Write to me',
    'services.book': 'Book',
    'services.popular': 'Popular',

    'about.hero.section': 'ABOUT ME',
    'about.hero.title': 'Ellen Soul',
    'about.hero.subtitle': 'Tarot Reader · Psychologist · Guide',
    'about.story.section': 'MY STORY',
    'about.story.title': 'Path to self',
    'about.story.p1':
      'My journey into the world of tarot and psychology began over 8 years ago, when I myself was searching for answers to complex questions in my life. The cards became for me not a divination tool, but a mirror of the soul.',
    'about.story.p2':
      'I received a psychology degree and completed several certified courses in tarot, Jungian psychology and symbolic therapy. Today I help others find clarity and move forward.',
    'about.story.p3':
      'Every consultation is for me a sacred space of trust, where you can be yourself without judgement or fear. I believe every person has all the answers within — sometimes you just need help to hear them.',
    'about.values.section': 'MY VALUES',
    'about.values.title': 'What matters to me',
    'about.values.v1.title': 'Confidentiality',
    'about.values.v1.desc': 'Everything you share in a session stays between us. Always.',
    'about.values.v2.title': 'Honesty',
    'about.values.v2.desc': 'I tell the truth, even when it is uncomfortable. Gently, but openly.',
    'about.values.v3.title': 'Non-judgement',
    'about.values.v3.desc': 'There are no "right" or "wrong" situations. There is only your path.',
    'about.values.v4.title': 'Growth',
    'about.values.v4.desc': 'I constantly learn and develop to give you my best.',
    'about.education.section': 'EDUCATION',
    'about.education.title': 'Training & Certificates',
    'about.education.e1.title': 'Faculty of Psychology',
    'about.education.e1.place': 'National University',
    'about.education.e1.year': '2014–2018',
    'about.education.e2.title': 'Certified Tarot Reader',
    'about.education.e2.place': 'International Tarot School',
    'about.education.e2.year': '2016',
    'about.education.e3.title': 'Jungian Psychology',
    'about.education.e3.place': 'Online course, Switzerland',
    'about.education.e3.year': '2019',
    'about.education.e4.title': 'Symbolic Therapy',
    'about.education.e4.place': 'Institute of Symbolic Thinking',
    'about.education.e4.year': '2021',
    'about.cta.title': 'Ready to meet?',
    'about.cta.subtitle': 'Book your first consultation and feel the difference',
    'about.cta.button': 'Book now',

    'blog.hero.section': 'BLOG',
    'blog.hero.title': 'Articles & Reflections',
    'blog.hero.subtitle': 'Thoughts on tarot, psychology, relationships and the path to self',
    'blog.categories.all': 'All',
    'blog.categories.tarot': 'Tarot',
    'blog.categories.psychology': 'Psychology',
    'blog.categories.relationships': 'Relationships',
    'blog.categories.practice': 'Practice',
    'blog.read_more': 'Read more',
    'blog.min_read': 'min read',
    'blog.search.placeholder': 'Search articles...',
    'blog.no_results': 'No articles found',
    'blog.load_more': 'Load more',

    'tools.hero.section': 'TOOLS',
    'tools.hero.title': 'Free tools',
    'tools.hero.subtitle': 'Practical resources for your self-discovery and growth',
    'tools.card_of_day.title': 'Card of the day',
    'tools.card_of_day.desc': 'Receive today\'s message from the cards',
    'tools.card_of_day.button': 'Draw a card',
    'tools.spread.title': 'Weekly spread',
    'tools.spread.desc': 'Three cards reflecting your week',
    'tools.spread.button': 'Do a spread',
    'tools.journal.title': 'Tarot journal',
    'tools.journal.desc': 'Keep records of your spreads and insights',
    'tools.journal.button': 'Open journal',
    'tools.affirmations.title': 'Daily affirmations',
    'tools.affirmations.desc': 'Daily affirmations based on your card',
    'tools.affirmations.button': 'Get affirmation',
    'tools.coming_soon': 'Coming soon',

    'contacts.hero.section': 'CONTACTS',
    'contacts.hero.title': 'Get in touch',
    'contacts.hero.subtitle': 'I respond within 24 hours',
    'contacts.form.name': 'Your name',
    'contacts.form.email': 'Email',
    'contacts.form.message': 'Your message',
    'contacts.form.submit': 'Send',
    'contacts.form.name.placeholder': 'What should I call you?',
    'contacts.form.email.placeholder': 'your@email.com',
    'contacts.form.message.placeholder': 'Tell me about your request...',
    'contacts.form.success': 'Thank you! I will write to you shortly.',
    'contacts.form.error': 'Sending error. Please try again.',
    'contacts.telegram': 'Telegram',
    'contacts.instagram': 'Instagram',
    'contacts.email': 'Email',
    'contacts.working_hours': 'Working hours',
    'contacts.working_hours.value': 'Mon–Fri: 10:00–20:00',

    'footer.tagline': 'Tarot · Psychology · Relationships',
    'footer.nav.title': 'Navigation',
    'footer.services.title': 'Services',
    'footer.services.tarot': 'Tarot consultation',
    'footer.services.psychology': 'Psychology',
    'footer.services.couples': 'For couples',
    'footer.social.title': 'Social media',
    'footer.copyright': '© 2025 Ellen Soul. All rights reserved.',
    'footer.privacy': 'Privacy policy',
  },
} as const;

export function getTranslation(lang: Language, key: string): string {
  const dict = translations[lang] as Record<string, string>;
  if (dict[key] !== undefined) return dict[key];
  // fallback chain: ru → uk
  const fallback = translations['ru'] as Record<string, string>;
  if (fallback[key] !== undefined) return fallback[key];
  return key;
}
