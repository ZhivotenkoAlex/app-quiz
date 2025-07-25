import { createI18n } from 'vue-i18n'

const messages = {
    en: {
        nav: {
            dashboard: 'Dashboard',
            questions: 'Questions',
            rooms: 'Rooms',
            game: 'Game',
            about: 'About',
            logout: 'Logout',
            hello: 'Hello, {name}!'
        },
        auth: {
            login: 'Login',
            register: 'Register',
            email: 'Email',
            password: 'Password',
            name: 'Name',
            loginButton: 'Login',
            registerButton: 'Register',
            noAccount: "Don't have an account?",
            haveAccount: 'Already have an account?',
            loginTitle: 'Welcome Back',
            registerTitle: 'Create Account',
            loginSubtitle: 'Sign in to your account',
            registerSubtitle: 'Join our quiz community'
        },
        dashboard: {
            title: 'Dashboard',
            subtitle: 'Welcome to your quiz dashboard',
            profile: 'My Profile',
            editProfile: 'Edit Profile',
            saveProfile: 'Save Profile',
            cancelEdit: 'Cancel',
            questionsCount: 'Questions Addressed to You',
            name: 'Name',
            email: 'Email',
            questionsCreated: 'Questions Created',
            saving: 'Saving...',
            save: 'Save',
            cancel: 'Cancel',
            userStats: 'User Statistics',
            noStats: 'No statistics available',
            totalQuestions: 'Total Questions'
        },
        questions: {
            title: 'Create Questions',
            subtitle: 'Add questions and assign them to users',
            addQuestions: 'Add Questions',
            question: 'Question',
            addressedTo: 'Addressed to',
            selectUser: 'Select user...',
            enterQuestion: 'Enter question {number}...',
            remove: 'Remove',
            addAnother: 'Add Another Question',
            saveQuestions: 'Save Questions',
            saving: 'Saving...',
            myQuestions: 'My Questions',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            editQuestion: 'Edit Question',
            deleting: 'Deleting...',
            to: 'To',
            createdBy: 'Questions You Created by Addressee',
            noQuestions: 'No questions created yet',
            filterByUser: 'Filter by User',
            allUsers: 'All Users',
            questionsShown: 'questions shown',
            clearFilter: 'Clear',
            inGame: 'Excluded from Game',
            notInGame: 'Included in Game'
        },
        rooms: {
            title: 'Game Rooms',
            subtitle: 'Create or join rooms to play with specific groups',
            createRoom: 'Create Room',
            joinRoom: 'Join Room',
            myRooms: 'My Rooms',
            roomName: 'Room Name',
            roomNamePlaceholder: 'Enter room name...',
            roomPassword: 'Room Password',
            roomPasswordPlaceholder: 'Enter password (min 3 characters)...',
            roomNumber: 'Room Number',
            roomNumberPlaceholder: '123',
            password: 'Password',
            passwordPlaceholder: 'Enter password...',
            creator: 'Creator',
            members: 'Members',
            created: 'Created',
            playGame: 'Play Game',
            leaveRoom: 'Leave Room',
            deleteRoom: 'Delete Room',
            noRooms: 'No rooms found. Create or join a room to get started!'
        },
        game: {
            title: 'Question Game',
            subtitle: 'Answer questions one by one',
            loading: 'Loading questions...',
            noQuestions: 'No Questions Available',
            noQuestionsDesc: 'There are no questions to display in the game.',
            createQuestions: 'Create Questions',
            next: 'Next',
            skip: 'Skip',
            restart: 'Restart',
            completed: 'Game Complete!',
            answeredAll: "You've answered all {count} questions!",
            playAgain: 'Play Again',
            addMore: 'Add More Questions',
            progress: 'Question {current} of {total}',
            finish: 'Finish',
            tryAgain: 'Try Again',
            failedToLoad: 'Failed to load questions',
            selectMode: 'Select Game Mode',
            selectModeDesc: 'Choose how you want to play the game',
            playAll: 'Play All Questions',
            availableRooms: 'Available Rooms',
            noAvailableRooms: 'No rooms available. Create a room first!',
            playingInRoom: 'Playing in Room',
            playingAllQuestions: 'Playing All Questions',
            exitRoom: 'Exit Room',
            backToMenu: 'Back to Menu',
            startGame: 'Start Game',
            joinRoom: 'Join Room',
            createRoom: 'Create Room'
        },
        about: {
            title: 'About Quiz App',
            subtitle: 'Learn how to play and get the most out of your quiz experience',
            whatIsTitle: 'What is Quiz App?',
            whatIsDesc: 'Quiz App is an interactive question and answer game where you can create personalized questions for your friends, family, or colleagues. Build connections through fun and engaging conversations!',
            createQuestionsTitle: 'Create Questions',
            createQuestionsDesc: 'Write custom questions and assign them to specific people',
            assignUsersTitle: 'Assign to Users',
            assignUsersDesc: 'Choose who should answer each question for personalized interaction',
            playGameTitle: 'Play the Game',
            playGameDesc: 'Go through questions one by one in a fun, interactive format',
            howToPlayTitle: 'How to Play',
            step1Title: 'Register & Login',
            step1Desc: 'Create your account and sign in to access all features',
            step2Title: 'Create Questions',
            step2Desc: 'Go to the Questions page and write questions for other users',
            step3Title: 'Start the Game',
            step3Desc: 'Visit the Game page to begin answering questions in random order',
            step4Title: 'Track Progress',
            step4Desc: 'See your progress and view statistics on your dashboard',
            rulesTitle: 'Game Rules',
            rule1: 'You can only see and edit questions that you created',
            rule2: 'Questions are displayed in random order during the game',
            rule3: 'Each user can create questions for any other registered user',
            rule4: 'You can skip questions or restart the game at any time',
            rule5: 'Complete all questions to finish the game and see your results',
            tipsTitle: 'Tips for Better Experience',
            tip1Title: 'Creative Questions',
            tip1Desc: 'Ask interesting, personal, or thought-provoking questions to spark great conversations',
            tip2Title: 'Variety is Key',
            tip2Desc: 'Mix different types of questions - fun, serious, hypothetical, or memory-based',
            tip3Title: 'Engage Others',
            tip3Desc: 'Encourage friends to create questions too for a more interactive experience',
            getStartedTitle: 'Ready to Start?',
            getStartedDesc: 'Begin your quiz journey by creating your first question or exploring your dashboard',
            createFirstQuestion: 'Create Your First Question',
            goToDashboard: 'Go to Dashboard'
        },
        install: {
            title: 'Install Quiz App',
            subtitle: 'Add to your home screen for a better experience',
            install: 'Install',
            later: 'Later'
        },
        common: {
            loading: 'Loading...',
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit'
        },
        messages: {
            success: 'Success!',
            error: 'Error!',
            loginSuccess: 'Login successful!',
            registerSuccess: 'Registration successful!',
            profileUpdated: 'Profile updated successfully!',
            questionsSaved: 'Successfully saved {count} question(s)!',
            questionUpdated: 'Question updated successfully!',
            questionDeleted: 'Question deleted successfully!',
            confirmDelete: 'Are you sure you want to delete this question?',
            fillAllFields: 'Please fill in all fields',
            addValidQuestion: 'Please add at least one valid question with an addressee'
        }
    },
    uk: {
        nav: {
            dashboard: 'Панель',
            questions: 'Питання',
            rooms: 'Кімнати',
            game: 'Гра',
            about: 'Про додаток',
            logout: 'Вийти',
            hello: 'Привіт, {name}!'
        },
        auth: {
            login: 'Увійти',
            register: 'Реєстрація',
            email: 'Електронна пошта',
            password: 'Пароль',
            name: "Ім'я",
            loginButton: 'Увійти',
            registerButton: 'Зареєструватися',
            noAccount: 'Немає акаунту?',
            haveAccount: 'Вже маєте акаунт?',
            loginTitle: 'Ласкаво просимо',
            registerTitle: 'Створити акаунт',
            loginSubtitle: 'Увійдіть до свого акаунту',
            registerSubtitle: 'Приєднуйтесь до нашої спільноти'
        },
        dashboard: {
            title: 'Панель керування',
            subtitle: 'Ласкаво просимо до вашої панелі вікторин',
            profile: 'Мій профіль',
            editProfile: 'Редагувати профіль',
            saveProfile: 'Зберегти профіль',
            cancelEdit: 'Скасувати',
            questionsCount: 'Питання адресовані вам',
            name: "Ім'я",
            email: 'Електронна пошта',
            questionsCreated: 'Створено питань',
            saving: 'Збереження...',
            save: 'Зберегти',
            cancel: 'Скасувати',
            userStats: 'Статистика користувачів',
            noStats: 'Статистика недоступна',
            totalQuestions: 'Всього питань'
        },
        questions: {
            title: 'Створити питання',
            subtitle: 'Додайте питання та призначте їх користувачам',
            addQuestions: 'Додати питання',
            question: 'Питань',
            addressedTo: 'Адресовано',
            selectUser: 'Оберіть користувача...',
            enterQuestion: 'Введіть питання {number}...',
            remove: 'Видалити',
            addAnother: 'Додати ще питання',
            saveQuestions: 'Зберегти питання',
            saving: 'Збереження...',
            myQuestions: 'Мої питання',
            edit: 'Редагувати',
            delete: 'Видалити',
            save: 'Зберегти',
            cancel: 'Скасувати',
            editQuestion: 'Редагувати питання',
            deleting: 'Видалення...',
            to: 'Для',
            createdBy: 'Питання, які ви створили за адресатом',
            noQuestions: 'Питань ще не створено',
            filterByUser: 'Фільтр за користувачем',
            allUsers: 'Всі користувачі',
            questionsShown: 'питань показано',
            clearFilter: 'Очистити',
            inGame: 'Виключити з гри',
            notInGame: 'Включити в гру'
        },
        rooms: {
            title: 'Ігрові кімнати',
            subtitle: 'Створюйте або приєднуйтесь до кімнат для гри з конкретними групами',
            createRoom: 'Створити кімнату',
            joinRoom: "Приєднатися до кімнати",
            myRooms: 'Мої кімнати',
            roomName: 'Назва кімнати',
            roomNamePlaceholder: 'Введіть назву кімнати...',
            roomPassword: 'Пароль кімнати',
            roomPasswordPlaceholder: 'Введіть пароль (мін. 3 символи)...',
            roomNumber: 'Номер кімнати',
            roomNumberPlaceholder: '123',
            password: 'Пароль',
            passwordPlaceholder: 'Введіть пароль...',
            creator: 'Створювач',
            members: 'Учасники',
            created: 'Створено',
            playGame: 'Грати',
            leaveRoom: 'Покинути кімнату',
            deleteRoom: 'Видалити кімнату',
            noRooms: 'Кімнат не знайдено. Створіть або приєднайтесь до кімнати, щоб розпочати!',
            joinRoom: 'Приєднатися до кімнати',
            createRoom: 'Створити кімнату'
        },
        game: {
            title: 'Гра з питаннями',
            subtitle: 'Відповідайте на питання одне за одним',
            loading: 'Завантаження питань...',
            noQuestions: 'Немає доступних питань',
            noQuestionsDesc: 'Немає питань для відображення в грі.',
            createQuestions: 'Створити питання',
            next: 'Далі',
            skip: 'Пропустити',
            restart: 'Почати заново',
            completed: 'Гру завершено!',
            answeredAll: 'Ви відповіли на всі {count} питань!',
            playAgain: 'Грати знову',
            addMore: 'Додати більше питань',
            progress: 'Питання {current} з {total}',
            finish: 'Завершити',
            tryAgain: 'Спробувати знову',
            failedToLoad: 'Не вдалося завантажити питання',
            selectMode: 'Оберіть режим гри',
            selectModeDesc: 'Виберіть, як ви хочете грати',
            playAll: 'Грати всі питання',
            availableRooms: 'Доступні кімнати',
            noAvailableRooms: 'Немає доступних кімнат. Спочатку створіть кімнату!',
            playingInRoom: 'Гра в кімнаті',
            playingAllQuestions: 'Гра з усіма питаннями',
            exitRoom: 'Вийти з кімнати',
            backToMenu: 'Назад до меню',
            startGame: 'Почати гру'
        },
        about: {
            title: 'Про Quiz App',
            subtitle: 'Дізнайтеся, як грати та отримати максимум від вашого досвіду з вікторинами',
            whatIsTitle: 'Що таке Quiz App?',
            whatIsDesc: 'Quiz App - це інтерактивна гра запитань та відповідей, де ви можете створювати персоналізовані питання для друзів, родини або колег. Будуйте зв\'язки через веселі та захоплюючі розмови!',
            createQuestionsTitle: 'Створюйте питання',
            createQuestionsDesc: 'Пишіть власні питання та призначайте їх конкретним людям',
            assignUsersTitle: 'Призначайте користувачам',
            assignUsersDesc: 'Виберіть, хто має відповідати на кожне питання для персоналізованої взаємодії',
            playGameTitle: 'Грайте в гру',
            playGameDesc: 'Проходьте питання одне за одним у веселому, інтерактивному форматі',
            howToPlayTitle: 'Як грати',
            step1Title: 'Реєстрація та вхід',
            step1Desc: 'Створіть свій акаунт та увійдіть, щоб отримати доступ до всіх функцій',
            step2Title: 'Створіть питання',
            step2Desc: 'Перейдіть на сторінку Питання та напишіть питання для інших користувачів',
            step3Title: 'Почніть гру',
            step3Desc: 'Відвідайте сторінку Гра, щоб почати відповідати на питання у випадковому порядку',
            step4Title: 'Відстежуйте прогрес',
            step4Desc: 'Переглядайте свій прогрес та статистику на панелі керування',
            rulesTitle: 'Правила гри',
            rule1: 'Ви можете бачити та редагувати лише питання, які створили самі',
            rule2: 'Питання відображаються у випадковому порядку під час гри',
            rule3: 'Кожен користувач може створювати питання для будь-якого іншого зареєстрованого користувача',
            rule4: 'Ви можете пропускати питання або перезапускати гру в будь-який час',
            rule5: 'Завершіть всі питання, щоб закінчити гру та побачити свої результати',
            tipsTitle: 'Поради для кращого досвіду',
            tip1Title: 'Креативні питання',
            tip1Desc: 'Ставте цікаві, особисті або заставляючі замислитися питання, щоб розпочати чудові розмови',
            tip2Title: 'Різноманітність - це ключ',
            tip2Desc: 'Змішуйте різні типи питань - веселі, серйозні, гіпотетичні або засновані на спогадах',
            tip3Title: 'Залучайте інших',
            tip3Desc: 'Заохочуйте друзів також створювати питання для більш інтерактивного досвіду',
            getStartedTitle: 'Готові почати?',
            getStartedDesc: 'Розпочніть свою подорож з вікторинами, створивши своє перше питання або дослідивши панель керування',
            createFirstQuestion: 'Створити перше питання',
            goToDashboard: 'Перейти до панелі'
        },
        install: {
            title: 'Встановити Quiz App',
            subtitle: 'Додайте на головний екран для кращого досвіду',
            install: 'Встановити',
            later: 'Пізніше'
        },
        common: {
            loading: 'Завантаження...',
            cancel: 'Скасувати',
            save: 'Зберегти',
            delete: 'Видалити',
            edit: 'Редагувати'
        },
        messages: {
            success: 'Успіх!',
            error: 'Помилка!',
            loginSuccess: 'Успішний вхід!',
            registerSuccess: 'Успішна реєстрація!',
            profileUpdated: 'Профіль успішно оновлено!',
            questionsSaved: 'Успішно збережено {count} питань!',
            questionUpdated: 'Питання успішно оновлено!',
            questionDeleted: 'Питання успішно видалено!',
            confirmDelete: 'Ви впевнені, що хочете видалити це питання?',
            fillAllFields: 'Будь ласка, заповніть усі поля',
            addValidQuestion: 'Будь ласка, додайте принаймні одне дійсне питання з адресатом'
        }
    }
}

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('locale') || 'en',
    fallbackLocale: 'en',
    messages
})

export default i18n 