import { createI18n } from 'vue-i18n'

const messages = {
    en: {
        nav: {
            dashboard: 'Dashboard',
            questions: 'Questions',
            game: 'Game',
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
            cancel: 'Cancel'
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
            noQuestions: 'No questions created yet'
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
            failedToLoad: 'Failed to load questions'
        },
        install: {
            title: 'Install Quiz App',
            subtitle: 'Add to your home screen for a better experience',
            install: 'Install',
            later: 'Later'
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
            game: 'Гра',
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
            cancel: 'Скасувати'
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
            noQuestions: 'Питань ще не створено'
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
            failedToLoad: 'Не вдалося завантажити питання'
        },
        install: {
            title: 'Встановити Quiz App',
            subtitle: 'Додайте на головний екран для кращого досвіду',
            install: 'Встановити',
            later: 'Пізніше'
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