// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/arastunm/";
    },
  },{id: "nav-publications",
          title: "Publications",
          description: "publications by categories in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/arastunm/publications/";
          },
        },{id: "nav-projects",
          title: "Projects",
          description: "A growing collection of my projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/arastunm/projects/";
          },
        },{id: "nav-repositories",
          title: "Repositories",
          description: "GitHub repositories of my personal account and me at Ada Lovelace Academy, ICL.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/arastunm/repositories/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "Arastun&#39;s CV",
          section: "Navigation",
          handler: () => {
            window.location.href = "/arastunm/cv/";
          },
        },{id: "projects-project-4",
          title: 'project 4',
          description: "another without an image",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/4_project/";
            },},{id: "projects-deep-impact",
          title: 'Deep Impact',
          description: "The hazard of small asteroids.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/acds_1/";
            },},{id: "projects-storm-prediction",
          title: 'Storm Prediction',
          description: "Predicting the unpredictable.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/acds_2/";
            },},{id: "projects-palusznium-rush",
          title: 'Palusznium Rush',
          description: "Optimal mineral recovery using a Genetic Algorithm approach.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/acds_3/";
            },},{id: "projects-genetic-programming-for-parkinson-39-s-diagnosis",
          title: 'Genetic Programming for Parkinson&amp;#39;s Diagnosis',
          description: "BSc final project on exploring the capabilities Geometric Semantic Genetic Programming.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/bsc_final_project/";
            },},{id: "projects-conversational-energy-agents",
          title: 'Conversational Energy Agents',
          description: "MSc thesis on autonomous LLM agents with Microsoft Azure AI Agent Services.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/msc_thesis/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%61%72%61%73%74%75%6E.%6D%61%6D%6D%61%64%6C%69%32%34@%69%6D%70%65%72%69%61%6C.%61%63.%75%6B", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/esemsc-am4224", "_blank");
        },
      },{
        id: 'social-leetcode',
        title: 'LeetCode',
        section: 'Socials',
        handler: () => {
          window.open("https://leetcode.com/u/arastun/", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/arastun-mammadli-068ab0228", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
