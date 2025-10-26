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
  },{id: "nav-projects",
          title: "Projects",
          description: "A collection of research (academic reports), work, and personal projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/arastunm/projects/";
          },
        },{id: "nav-blogs",
          title: "Blogs",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/arastunm/blog/";
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
        },{id: "post-natural-policy-gradient-methods",
      
        title: "Natural Policy Gradient Methods",
      
      description: "General overview of TRPO and PPO",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/arastunm/blog/2025/npg_methods/";
        
      },
    },{id: "post-deep-q-learning",
      
        title: "Deep Q-Learning",
      
      description: "Double Q-Learning and Deep Q-Networks",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/arastunm/blog/2025/ddqn/";
        
      },
    },{id: "post-transformer-architecture",
      
        title: "Transformer Architecture",
      
      description: "Original design, BERT, GPT-1",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/arastunm/blog/2025/transformers/";
        
      },
    },{id: "post-deep-learning",
      
        title: "Deep Learning",
      
      description: "Key concepts, FFNs, Sequence Models",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/arastunm/blog/2025/dl_core/";
        
      },
    },{id: "post-vanilla-policy-gradient-methods",
      
        title: "Vanilla Policy Gradient Methods",
      
      description: "Theoretical foundations and REINFORCE",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/arastunm/blog/2025/vpg_methods/";
        
      },
    },{id: "post-llm-fine-tuning-taxonomy",
      
        title: "LLM Fine-Tuning Taxonomy",
      
      description: "Supervised fine-tuning, reinforcement learning",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/arastunm/blog/2025/llm_training_taxonomy/";
        
      },
    },{id: "post-reinforcement-learning",
      
        title: "Reinforcement Learning",
      
      description: "Model-based and Model-free learning (Direct, TD, Q-Learning)",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/arastunm/blog/2025/rl_core/";
        
      },
    },{id: "post-adversarial-search-algorithms",
      
        title: "Adversarial Search Algorithms",
      
      description: "Minimax, Expectimax, Monte Carlo Tree Search",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/arastunm/blog/2025/asa/";
        
      },
    },{id: "post-markov-decision-processes",
      
        title: "Markov Decision Processes",
      
      description: "A general overview on Markov Decision Processes (MDP)",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/arastunm/blog/2025/mdp/";
        
      },
    },{id: "post-a-post-with-pseudo-code",
      
        title: "a post with pseudo code",
      
      description: "this is what included pseudo code could look like",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/arastunm/blog/2024/pseudocode/";
        
      },
    },{id: "projects-project-4",
          title: 'project 4',
          description: "another without an image",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/4_project/";
            },},{id: "projects-deep-impact",
          title: 'Deep Impact',
          description: "Numerical airburst solver and an airblast hazard mapper.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/acds_1/";
            },},{id: "projects-storm-prediction",
          title: 'Storm Prediction',
          description: "Real-time lightning storm predictions with deep learning.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/acds_2/";
            },},{id: "projects-palusznium-rush",
          title: 'Palusznium Rush',
          description: "Optimal mineral recovery using a genetic algorithm approach.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/acds_3/";
            },},{id: "projects-genetic-programming",
          title: 'Genetic Programming',
          description: "BSc final project on exploring the capabilities Geometric Semantic Genetic Programming.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/bsc_final_project/";
            },},{id: "projects-cloth-simulator",
          title: 'Cloth Simulator',
          description: "C++ SFML based simple 2D cloth simulator.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/cloth_sim/";
            },},{id: "projects-firework-simulator",
          title: 'Firework Simulator',
          description: "C++ based basic graphic firework simulator.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/firework-sim/";
            },},{id: "projects-multi-agent-orchestration",
          title: 'Multi-Agent Orchestration',
          description: "MSc research project on LLM Multi-Agent Systems (MAS) using Microsoft Azure AI Agent Services.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/msc_project/";
            },},{id: "projects-pathfinder",
          title: 'Pathfinder',
          description: "C++ based 2D pathfinder simulator.",
          section: "Projects",handler: () => {
              window.location.href = "/arastunm/projects/pathfinder/";
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
