export const API_URL = "https://script.google.com/macros/s/AKfycbwbF-qVyYIVfvwYKcxPt7GpVRtwORCkkEHEqKswenPQTYPzAoci7RsMpP5N_aGpa40/exec";

const pythonLessons = [
  { title: "What is Python?", answer: "Python is a readable, general-purpose programming language used to automate tasks, build web services, analyze data, and create intelligent applications.", why: "Its clear syntax lets beginners focus on problem solving while its libraries support real work.", how: "You write statements in a .py file, then the Python interpreter reads and executes them in order.", example: "print(\"Hello, learner!\")", practice: "Print your name, city, and one skill you want to learn.", mistakes: ["Mixing indentation styles", "Using a variable before assigning it", "Expecting input() to return a number automatically"], interview: "Why is Python popular for beginners and automation?" },
  { title: "Variables and Data Types", answer: "A variable is a name that refers to a value; a data type describes what that value represents, such as text, a number, or a true/false value.", why: "Names make programs readable and types help you choose suitable operations.", how: "Python infers a value's type when you assign it, so total = 125 creates an integer reference.", example: "name = \"Arun\"\nage = 21\nis_student = True", practice: "Create variables for a product name, price, and whether it is in stock.", mistakes: ["Putting quotes around numbers you intend to calculate", "Using unclear names like x and y for business values"], interview: "What is the difference between a mutable and immutable value?" },
  { title: "Input, Output, and Operators", answer: "Input reads information from a user, output displays a result, and operators combine or compare values.", why: "Together they turn a fixed script into an interactive program.", how: "Read text with input(), convert it when needed, calculate with arithmetic operators, and display with print().", example: "marks = float(input(\"Marks: \"))\nprint(f\"Result: {marks:.1f}\")", practice: "Ask for two numbers and display their sum and average.", mistakes: ["Forgetting numeric conversion", "Using / when a whole-number result is required", "Concatenating text and numbers without formatting"], interview: "What is the difference between == and =?" },
  { title: "Conditional Statements", answer: "Conditional statements choose which code runs based on whether an expression is true or false.", why: "They let programs respond differently to different data, such as pass or fail results.", how: "Python checks an if condition, then tries elif branches and finally uses else when no earlier condition matches.", example: "score = 76\nif score >= 75:\n    print(\"Pass\")\nelse:\n    print(\"Keep practising\")", practice: "Classify a temperature as cold, comfortable, or hot.", mistakes: ["Using = instead of ==", "Incorrect indentation", "Writing conditions in an order that hides a more specific case"], interview: "How would you combine two conditions safely?" },
  { title: "Loops and Repetition", answer: "A loop repeats a block of code; for is useful for each item in a sequence and while repeats while a condition remains true.", why: "Loops remove repetitive code and make collection processing practical.", how: "Choose the sequence or condition, run the body, update progress, and stop when the iteration is complete.", example: "for number in range(1, 4):\n    print(number)", practice: "Print the first ten multiples of a number.", mistakes: ["Creating an infinite while loop", "Using the wrong range endpoint", "Changing a collection unexpectedly while iterating"], interview: "When would you choose for over while?" },
  { title: "Lists, Tuples, Sets, and Dictionaries", answer: "Lists store ordered items, tuples store fixed ordered items, sets store unique items, and dictionaries map keys to values.", why: "Choosing the right structure makes data easier to access and keeps intent clear.", how: "Create a structure, access or update it with its indexing or key rules, then use methods suited to its purpose.", example: "skills = [\"Python\", \"SQL\"]\nprofile = {\"name\": \"Arun\", \"skills\": skills}", practice: "Store five marks, calculate the highest mark, and map each subject to its mark.", mistakes: ["Using a list lookup where a dictionary key is clearer", "Expecting sets to preserve duplicates", "Accessing a missing dictionary key without a fallback"], interview: "Why are tuples useful for fixed records?" },
  { title: "Functions and Scope", answer: "A function is a named, reusable block of code that can receive inputs and return a result.", why: "Functions prevent duplication and make programs easier to test and explain.", how: "Define with def, name parameters, validate or transform inputs, return a value, and call the function where needed.", example: "def percentage(obtained, total):\n    return obtained / total * 100\n\nprint(percentage(42, 50))", practice: "Write a function that returns whether a number is even.", mistakes: ["Printing instead of returning a value", "Relying on hidden global variables", "Using a mutable default argument"], interview: "What is the difference between a parameter and an argument?" },
  { title: "Strings and Formatting", answer: "A string is a sequence of characters, and formatting combines text with values in a readable way.", why: "Most applications collect, clean, display, or search text.", how: "Index or slice a string, use methods such as strip and split, then format output with an f-string.", example: "first_name = \"Arun\"\nprint(f\"Welcome, {first_name}!\")", practice: "Clean a name entered with extra spaces and display it in title case.", mistakes: ["Assuming strings change in place", "Forgetting that indexing starts at zero", "Building long output with fragile + expressions"], interview: "Why are strings immutable in Python?" },
  { title: "Exception and File Handling", answer: "Exception handling responds to runtime problems, while file handling reads and writes information outside the program.", why: "Reliable scripts expect missing files, invalid input, and other ordinary failures.", how: "Use try for risky work, except for known failures, finally for cleanup, and with open() to manage files safely.", example: "try:\n    with open(\"notes.txt\", encoding=\"utf-8\") as file:\n        notes = file.read()\nexcept FileNotFoundError:\n    notes = \"No notes yet\"", practice: "Write a small to-do list to a file and read it back.", mistakes: ["Catching every error with a bare except", "Leaving files open", "Hiding an error without giving the user a next step"], interview: "Why is with open(...) preferred for files?" },
];

const skillSeeds = [
  ["python-fundamentals", "Python Fundamentals", "Build a practical foundation in Python syntax, data, control flow, functions, and problem solving.", "Programming", "Python is a general-purpose language with readable syntax and applications in automation, data, web services, and AI."],
  ["javascript-fundamentals", "JavaScript Fundamentals", "Learn the language of interactive web pages, browser events, functions, arrays, objects, and async work.", "Programming", "JavaScript is a programming language that adds behavior to web pages and also runs on servers and other platforms."],
  ["sql-fundamentals", "SQL Fundamentals", "Learn how to retrieve, filter, join, group, and safely update relational data.", "Data", "SQL is a language for asking questions of and managing data stored in relational databases."],
  ["html-css-fundamentals", "HTML & CSS Fundamentals", "Understand semantic page structure, responsive layout, typography, color, and accessible interfaces.", "Web Development", "HTML describes the meaning and structure of a page, while CSS controls its presentation and layout."],
  ["data-analytics-fundamentals", "Data Analytics Fundamentals", "Turn raw information into useful decisions using cleaning, exploration, visualisation, and communication.", "Data", "Data analytics is the process of examining information to find patterns, answer questions, and support decisions."],
  ["digital-marketing-fundamentals", "Digital Marketing Fundamentals", "Learn how content, search, email, social channels, and measurement work together.", "Digital", "Digital marketing uses online channels and measurable campaigns to reach and help a defined audience."],
  ["artificial-intelligence-fundamentals", "Artificial Intelligence Fundamentals", "Build a clear mental model of AI, data, models, evaluation, limitations, and responsible use.", "AI", "Artificial intelligence describes software systems that perform tasks requiring capabilities such as recognition, prediction, or language generation."],
  ["machine-learning-fundamentals", "Machine Learning Fundamentals", "Understand datasets, features, training, evaluation, overfitting, and common learning approaches.", "AI", "Machine learning is a way to create systems that learn patterns from examples and use them to make predictions or decisions."],
  ["react-fundamentals", "React Fundamentals", "Learn component thinking, props, state, events, effects, and accessible interface composition.", "Web Development", "React is a JavaScript library for composing user interfaces from reusable components."],
  ["business-communication", "Business Communication", "Communicate ideas clearly in emails, meetings, presentations, reports, and workplace conversations.", "Professional", "Business communication is the purposeful exchange of information that helps people understand, decide, and act at work."],
];

const genericModules = {
  "JavaScript Fundamentals": ["Values, variables, and types", "Functions and scope", "Arrays and objects", "DOM and browser events", "Asynchronous JavaScript", "Practical browser project"],
  "SQL Fundamentals": ["Tables and relational thinking", "SELECT and filtering", "Sorting and grouping", "Joins", "Subqueries and aggregates", "Data quality and safe updates"],
  "HTML & CSS Fundamentals": ["Semantic HTML", "Text, links, and media", "CSS selectors and the cascade", "Box model and layout", "Flexbox and Grid", "Responsive accessible page"],
  "Data Analytics Fundamentals": ["Analytics questions", "Data types and quality", "Spreadsheets and tables", "Exploratory analysis", "Charts and storytelling", "Mini insight report"],
  "Digital Marketing Fundamentals": ["Audience and objectives", "Content planning", "Search fundamentals", "Social and email channels", "Campaign measurement", "Practical campaign brief"],
  "Artificial Intelligence Fundamentals": ["AI vocabulary", "Data and model behavior", "Machine learning overview", "Generative AI", "Evaluation and limitations", "Responsible AI practice"],
  "Machine Learning Fundamentals": ["Learning from examples", "Features and labels", "Training and testing", "Regression and classification", "Overfitting and metrics", "Mini prediction workflow"],
  "React Fundamentals": ["Components and JSX", "Props and composition", "State and events", "Lists and forms", "Effects and data", "Accessible mini app"],
  "Business Communication": ["Audience and purpose", "Clear writing", "Email structure", "Meetings and listening", "Presentations", "Workplace practice"],
};

const quickAnswers = {
  "Python Fundamentals": [
    ["What is Python?", "Python is a readable general-purpose language used for automation, data, web services, and AI."],
    ["Is Python suitable for beginners?", "Yes. Its syntax is compact and readable, so beginners can practise useful programs early."],
    ["What is a Python list?", "A list is an ordered, changeable collection that can hold multiple values."],
    ["What is a Python function?", "A function is a reusable block of code that can accept inputs and return a result."],
    ["How can I practise Python?", "Start with small input-output problems, then build a calculator, quiz, or to-do list and explain your choices."],
    ["How does certification work?", "Study a skill, register, complete the 30-question assessment, and qualify with at least 75 percent."],
  ],
};

export const skills = skillSeeds.map(([slug, name, description, category, definition]) => ({
  slug, name, description, category, definition,
  level: "Beginner",
  duration: name === "Python Fundamentals" ? "8-10 hours" : "4-6 hours",
  lessons: name === "Python Fundamentals" ? pythonLessons : (genericModules[name] || []).map(title => ({
    title,
    answer: `${title} is a practical part of ${name}. This lesson introduces the idea, shows where it appears in real work, and gives you a small task to practise it.`,
    why: `Understanding ${title.toLowerCase()} helps you make clearer decisions when building or communicating with ${name.toLowerCase()}.`,
    how: "Begin with the basic vocabulary, follow a small example, change one part, and check the result. Then explain the result in your own words.",
    example: `Use a small ${name.toLowerCase()} example and write down what each step changes.`,
    practice: `Create a short practice task related to ${title.toLowerCase()} and record what you learned.`,
    mistakes: ["Skipping the underlying definition", "Copying an example without changing it", "Not checking the result with a small test"],
    interview: `Where would you use ${title.toLowerCase()} in a real project?`,
  })),
  modules: name === "Python Fundamentals" ? ["Python basics", "Control flow", "Collections", "Functions", "Strings", "Reliable programs", "Practical Python"] : genericModules[name] || ["Core concepts", "Guided practice", "Practical application"],
  quickAnswers: quickAnswers[name] || [[`What is ${name}?`, definition], [`Who is ${name} for?`, `This beginner course is for learners who want a practical introduction to ${name.toLowerCase()} without assuming prior expertise.`], [`How do I practise ${name}?`, "Work through one concept at a time, complete the practice task, and build a small project that solves a real problem."], ["How does certification work?", "Learn the material, register, complete the assessment, and qualify with at least 75 percent."]],
  faqs: [
    [`What is ${name}?`, definition],
    [`Who should learn ${name}?`, `It is designed for students, freshers, job seekers, and professionals who want a structured beginner path in ${name.toLowerCase()}.`],
    ["Is the learning content free?", "Yes. The learning page and practice guidance are available without a course fee."],
    ["Do I need prior experience?", "No prior experience is required for this beginner-level pathway. Curiosity and regular practice are enough to begin."],
    ["What does the assessment cover?", "The assessment covers the concepts and practical vocabulary introduced in this learning path."],
    ["What is the passing score?", "The current passing score is 75 percent, with 30 questions and a 30-minute time limit."],
    ["Is browser-based proctoring perfectly accurate?", "No. Browser signals can be imperfect, so the assessment explains what is monitored and gives warnings before disqualification."],
  ],
}));

export function getSkill(slug) {
  return skills.find(skill => skill.slug === slug);
}

export const certificationSteps = [
  ["01", "Choose a skill", "Pick the learning path that matches your goal."],
  ["02", "Learn and practise", "Use the lessons, examples, and practice tasks."],
  ["03", "Register", "Submit your details and consent before the assessment."],
  ["04", "Take the assessment", "Answer 30 questions in 30 minutes."],
  ["05", "Qualify", "A score of 75 percent or higher is required."],
  ["06", "Receive your certificate", "A qualifying result can trigger certificate generation by the backend."],
];
