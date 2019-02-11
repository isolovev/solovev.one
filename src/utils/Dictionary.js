const _dictionary = {
  ru: {
    headings: {
      about: "Обо мне",
      projects: "Мои работы",
    },

    linkOnProject: "Ссылка на проект",
    goToHome: "Вернуться на главную страницу",

    siteTitle: "Иван Соловьев – Frontend разработчик",
    info: {
      main: "Привет, я – Ваня",
      specialty: "Frontend разработчик",
    },

    pageError: "Нет такой страницы",
    loading: "Загрузка...",
  },
};

export const Dictionary = (() => {
  const lang = "ru";

  return _dictionary[lang];
})();
