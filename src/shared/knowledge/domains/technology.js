// Technology Domain Knowledge
// Tools, frameworks, languages, and technical concepts

window.Gracula = window.Gracula || {};
window.Gracula.Knowledge = window.Gracula.Knowledge || {};
window.Gracula.Knowledge.Domains = window.Gracula.Knowledge.Domains || {};

window.Gracula.Knowledge.Domains.Technology = {
  // Development Tools
  tools: {
    'local': {
      name: 'Local by Flywheel',
      category: 'WordPress Development',
      description: 'Local WordPress development environment',
      relatedTerms: ['wordpress', 'site', 'localhost', 'flywheel']
    },
    'vscode': {
      name: 'Visual Studio Code',
      category: 'Code Editor',
      description: 'Popular code editor by Microsoft',
      relatedTerms: ['vs code', 'editor', 'ide', 'coding']
    },
    'git': {
      name: 'Git',
      category: 'Version Control',
      description: 'Version control system',
      relatedTerms: ['github', 'gitlab', 'commit', 'push', 'pull', 'branch']
    },
    'docker': {
      name: 'Docker',
      category: 'Containerization',
      description: 'Container platform',
      relatedTerms: ['container', 'image', 'dockerfile']
    },
    'npm': {
      name: 'NPM',
      category: 'Package Manager',
      description: 'Node package manager',
      relatedTerms: ['node', 'package', 'install', 'yarn', 'pnpm']
    },
    'composer': {
      name: 'Composer',
      category: 'Package Manager',
      description: 'PHP dependency manager',
      relatedTerms: ['php', 'package', 'dependency']
    }
  },

  // Cloud & Hosting
  hosting: {
    'xcloud': {
      name: 'xCloud',
      category: 'Cloud Hosting',
      description: 'Cloud hosting service',
      relatedTerms: ['hosting', 'cloud', 'server', 'deploy']
    },
    'aws': {
      name: 'Amazon Web Services',
      category: 'Cloud Platform',
      description: 'Cloud computing platform',
      relatedTerms: ['ec2', 's3', 'lambda', 'cloud']
    },
    'vercel': {
      name: 'Vercel',
      category: 'Deployment Platform',
      description: 'Frontend deployment platform',
      relatedTerms: ['deploy', 'nextjs', 'hosting']
    },
    'netlify': {
      name: 'Netlify',
      category: 'Deployment Platform',
      description: 'Web hosting and automation',
      relatedTerms: ['deploy', 'hosting', 'jamstack']
    }
  },

  // Programming Languages
  languages: {
    'javascript': {
      name: 'JavaScript',
      category: 'Programming Language',
      description: 'Web programming language',
      relatedTerms: ['js', 'node', 'react', 'vue', 'angular', 'typescript']
    },
    'python': {
      name: 'Python',
      category: 'Programming Language',
      description: 'General-purpose programming language',
      relatedTerms: ['django', 'flask', 'pandas', 'numpy']
    },
    'php': {
      name: 'PHP',
      category: 'Programming Language',
      description: 'Server-side scripting language',
      relatedTerms: ['laravel', 'wordpress', 'symfony', 'composer']
    },
    'java': {
      name: 'Java',
      category: 'Programming Language',
      description: 'Object-oriented programming language',
      relatedTerms: ['spring', 'maven', 'gradle', 'jvm']
    }
  },

  // Frameworks & Libraries
  frameworks: {
    'react': {
      name: 'React',
      category: 'JavaScript Framework',
      description: 'UI library by Facebook',
      relatedTerms: ['jsx', 'component', 'hooks', 'nextjs']
    },
    'nextjs': {
      name: 'Next.js',
      category: 'React Framework',
      description: 'React framework for production',
      relatedTerms: ['react', 'ssr', 'vercel']
    },
    'laravel': {
      name: 'Laravel',
      category: 'PHP Framework',
      description: 'PHP web framework',
      relatedTerms: ['php', 'eloquent', 'artisan', 'blade']
    },
    'wordpress': {
      name: 'WordPress',
      category: 'CMS',
      description: 'Content management system',
      relatedTerms: ['php', 'theme', 'plugin', 'local', 'woocommerce']
    }
  },

  // Development Activities
  activities: {
    'setup': ['install', 'configure', 'setup', 'initialize', 'create'],
    'coding': ['code', 'develop', 'build', 'write', 'implement'],
    'debugging': ['debug', 'fix', 'error', 'bug', 'issue', 'problem'],
    'deployment': ['deploy', 'publish', 'release', 'launch', 'push'],
    'testing': ['test', 'testing', 'qa', 'unit test', 'integration'],
    'learning': ['learn', 'tutorial', 'course', 'study', 'practice']
  },

  // Technical Terms
  terms: {
    'api': 'Application Programming Interface',
    'database': 'Data storage system',
    'frontend': 'Client-side development',
    'backend': 'Server-side development',
    'fullstack': 'Both frontend and backend',
    'devops': 'Development and operations',
    'ci/cd': 'Continuous Integration/Deployment',
    'localhost': 'Local development server',
    'repository': 'Code storage location',
    'branch': 'Code version branch',
    'commit': 'Save code changes',
    'merge': 'Combine code branches',
    'pull request': 'Code review request',
    'issue': 'Bug or feature request',
    'dependency': 'Required package/library',
    'package': 'Code library/module',
    'extension': 'Browser or editor add-on',
    'plugin': 'Software add-on',
    'theme': 'Visual design template',
    'migration': 'Database schema change',
    'seed': 'Database initial data',
    'cache': 'Temporary data storage',
    'cdn': 'Content Delivery Network',
    'ssl': 'Secure connection certificate',
    'domain': 'Website address',
    'subdomain': 'Secondary domain',
    'dns': 'Domain Name System',
    'server': 'Computer hosting services',
    'client': 'User-facing application',
    'endpoint': 'API access point',
    'route': 'URL path handler',
    'middleware': 'Request processing layer',
    'authentication': 'User identity verification',
    'authorization': 'User permission check',
    'token': 'Authentication credential',
    'session': 'User state storage',
    'cookie': 'Browser data storage',
    'cors': 'Cross-Origin Resource Sharing',
    'rest': 'RESTful API architecture',
    'graphql': 'Query language for APIs',
    'websocket': 'Real-time communication',
    'ajax': 'Asynchronous web requests',
    'json': 'Data format',
    'xml': 'Markup language',
    'html': 'Web page structure',
    'css': 'Web page styling',
    'responsive': 'Mobile-friendly design',
    'mobile-first': 'Mobile-priority design',
    'seo': 'Search Engine Optimization',
    'performance': 'Speed and efficiency',
    'optimization': 'Improvement process',
    'refactoring': 'Code restructuring',
    'scalability': 'Growth capability',
    'security': 'Protection measures',
    'encryption': 'Data protection',
    'hashing': 'One-way encryption',
    'validation': 'Data verification',
    'sanitization': 'Data cleaning',
    'injection': 'Security vulnerability',
    'xss': 'Cross-Site Scripting attack',
    'csrf': 'Cross-Site Request Forgery'
  }
};

